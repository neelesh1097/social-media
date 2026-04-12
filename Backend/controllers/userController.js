import ImageKit from "../configs/imageKit.js"
import User from "../modals/User.js"
import fs from 'fs'
import Post from '../modals/Post.js'

// Get user data using userid

export const getUserData  = async (req , res) => {
    try{
     const {userId} = req.auth()
     const user = await User.findById(userId)
     if(!user){
          return res.json({success: false, message:"user not found"})
     }
      res.json({success:true ,user})
    } catch (error) {
        console.log(error);
          res.json({success: false, message:error.message})
    }
}

// Update the user data

export const updateUserData  = async (req , res) => {
    try{
     const {userId} = req.auth()
     let {username,bio,location,full_name} = req.body;

     const tempUser = await User.findById(userId)

     !username && (username = tempUser.username)

     if(tempUser.username  !== username){
        const user = await User.findOne({username})
        if(user){
            // we will not change the username if already taken
            username = tempUser.username
        }
     }
      const updatedData ={
        username,
        bio,
        location,
        full_name,
      }

    const profile = req.files && req.files.profile && req.files.profile[0]
    const cover = req.files && req.files.cover && req.files.cover[0]

      if(profile){
        const buffer = fs.readFileSync(profile.path)
        const response = await ImageKit.upload({
            file: buffer,
        fileName: profile.originalname,
        })

        const url = ImageKit.url({
            path:response.filePath,
            transformation: [
                {quality: 'auto'},
                {format: 'webp'},
                {width: '512'}
            ]
        })
        updatedData.profile_picture = url
      }

            if(cover){
                const buffer = fs.readFileSync(cover.path)
                const response = await ImageKit.upload({
                        file: buffer,
                        fileName: cover.originalname,
                })

        const url = ImageKit.url({
            path:response.filePath,
            transformation: [
                {quality: 'auto'},
                {format: 'webp'},
                {width: '1280'}
            ]
        })
        updatedData.cover_photo = url
      }
        const user = await User.findByIdAndUpdate(userId , updatedData ,{new :true})
                res.json({success: true ,user})

    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

// Find Users using username ,email, location ,name

export const discoverUser  = async (req , res) => {
    try{
     const {userId} = req.auth()
     const {input} = req.body;

     const allUsers = await User.find({
        $or: [
            { username: new RegExp(input, 'i') },
            { email: new RegExp(input, 'i') },
            { full_name: new RegExp(input, 'i') },
            { location: new RegExp(input, 'i') },
        ]
     })

    const filteredUsers = allUsers.filter(u => u._id !== userId);

    res.json({success:true , users: filteredUsers})

    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

//follow user

export const followUser  = async (req , res) => {
    try{
     const {userId} = req.auth()
     const {id} = req.body;

     const user = await User.findById(userId)

      if(user.following.includes(id)){
          return res.json({success:false ,message:'you are already following this user'})
     }

     user.following.push(id);
     await user.save()

    const toUser = await User.findById(id)
    toUser.followers.push(userId)
    await toUser.save()

    res.json({success : true, message: 'Now you are following this user'})

    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}


//Unfollow User

export const unfollowUser  = async (req , res) => {
    try{
     const {userId} = req.auth()
     const {id} = req.body;

     const user = await User.findById(userId)

    user.following = user.following.filter(u => u !== id);
     await user.save()
    const toUser = await User.findById(id)
    toUser.followers = toUser.followers.filter(u => u !== userId)
    await toUser.save()

    res.json({success : true, message: 'you are no longer following this user'})

    } catch (error) {
        console.log(error);
        res.json({success: false, message:error.message})
    }
}

// Get another user's profile and their posts
export const getUserProfiles = async (req, res) => {
    try {
        const { profileId } = req.body;
        if (!profileId) return res.json({ success: false, message: 'profileId required' });

        const profile = await User.findById(profileId).select('-__v -createdAt -updatedAt');
        if (!profile) return res.json({ success: false, message: 'profile not found' });

        const posts = await Post.find({ user: profileId }).populate('user').sort({ createdAt: -1 });

        return res.json({ success: true, profile, posts });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    }
}