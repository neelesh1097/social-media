import connectDB from '../configs/db.js'
import User from '../modals/User.js'
import Post from '../modals/Post.js'
import Story from '../modals/Story.js'

const run = async () => {
  await connectDB()
  try {
    console.log('Seeding demo data...')
    // Create demo users
    const usernames = ['demo_user', 'alice', 'bob', 'charlie']
    const users = []
    for (const username of usernames) {
      let user = await User.findOne({ username })
      if (!user) {
        const newId = Date.now().toString() + Math.random()
        user = await User.create({
          _id: newId,
          email: `${username}+${newId}@example.com`,
          full_name: username.charAt(0).toUpperCase() + username.slice(1),
          username,
          profile_picture: '',
          bio: `I'm ${username}`
        })
        console.log('Created user:', username)
      } else {
        console.log('User exists:', username)
      }
      users.push(user)
    }

    // Create demo posts
    const postContents = [
      'Just launched my new project! 🚀',
      'Working on something exciting today',
      'Beautiful sunset this evening',
      'Code reviews are done, feeling productive',
      'Coffee and coding, best combo ☕',
      'New feature just shipped!',
      'What\'s everyone working on?'
    ]
    for (let i = 0; i < postContents.length; i++) {
      const existing = await Post.findOne({ content: postContents[i] })
      if (!existing) {
        await Post.create({
          user: users[i % users.length]._id,
          content: postContents[i],
          image_urls: [],
          post_type: 'text'
        })
        console.log('Created post:', postContents[i])
      }
    }

    // Create demo stories
    const storyContents = [
      'Good morning! ☀️',
      'Working from the beach 🏖️',
      'Lunch time! 🍕'
    ]
    for (let i = 0; i < storyContents.length; i++) {
      const existing = await Story.findOne({ content: storyContents[i] })
      if (!existing) {
        await Story.create({
          user: users[i % users.length]._id,
          content: storyContents[i],
          media_url: '',
          media_type: 'text'
        })
        console.log('Created story:', storyContents[i])
      }
    }

    console.log('✓ Seed complete')
    process.exit(0)
  } catch (e) {
    console.error('Seed error:', e)
    process.exit(1)
  }
}

run()

