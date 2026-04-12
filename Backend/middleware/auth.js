import User from '../modals/User.js'

export const protect = async (req, res, next) => {
    try {
        // allow dev bypass to skip auth entirely when testing
        if (req.headers['x-dev-bypass']) {
            // Set default dev user so POST operations can get a userId
            let devUserId = null
            const devUsername = req.headers['x-dev-username'] || 'demo_user'
            try {
                let user = await User.findOne({ username: devUsername })
                if (!user) {
                    user = await User.create({
                        _id: 'dev-' + Date.now(),
                        email: `${devUsername}@dev.local`,
                        full_name: devUsername.charAt(0).toUpperCase() + devUsername.slice(1),
                        username: devUsername,
                        profile_picture: '',
                        bio: `Dev user: ${devUsername}`
                    })
                }
                devUserId = user._id.toString()
            } catch (e) {
                console.error('Failed to create/fetch dev user:', e)
            }
            req.authUserId = devUserId
            req.auth = () => ({ userId: devUserId })
            return next()
        }

        // Clerk's middleware provides req.auth(). If not available (dev), allow a dev header.
        let userId
        try {
            const authObj = req.auth ? req.auth() : null
            userId = authObj && authObj.userId
        } catch (e) {
            userId = null
        }

        // Dev bypass: allow X-Dev-User (id) or X-Dev-Username (lookup) headers regardless of NODE_ENV
        if (!userId) {
            if (req.headers['x-dev-user']) {
                userId = req.headers['x-dev-user']
            } else if (req.headers['x-dev-username']) {
                try {
                    const u = await User.findOne({ username: req.headers['x-dev-username'] })
                    if (u) userId = u._id
                } catch (e) { /* ignore */ }
            }
        }

        if (!userId) {
            return res.status(401).json({ success: false, message: 'not authenticated' })
        }
        // attach resolved userId for handlers
        req.authUserId = userId
        // If Clerk's req.auth is not available, provide a compatibility shim
        if (!req.auth) req.auth = () => ({ userId })
        next()
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}