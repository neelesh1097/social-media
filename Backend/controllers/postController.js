import fs from 'fs'
import ImageKit from '../configs/imageKit.js'
import Post from '../modals/Post.js'
import User from '../modals/User.js'

// Add a new post
export const addPost = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { content, post_type } = req.body;
    const images = req.files && req.files.images ? req.files.images : [];

    const image_urls = [];
    if (images.length) {
      await Promise.all(images.map(async (img) => {
        const buffer = fs.readFileSync(img.path);
        const response = await ImageKit.upload({ file: buffer, fileName: img.originalname, folder: 'posts' });
        const url = ImageKit.url({ path: response.filePath, transformation: [{ quality: 'auto' }, { format: 'webp' }, { width: '1280' }] });
        image_urls.push(url);
      }))
    }

    const post = await Post.create({ user: userId, content, image_urls, post_type });
    return res.json({ success: true, message: 'post created successfully', post });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
  }
}

// Get feed posts (own + connections + following)
export const getFeedPosts = async (req, res) => {
  try {
    // Development bypass: if client sets x-dev-bypass, return recent posts without requiring auth
    if (req.headers['x-dev-bypass']) {
      const posts = await Post.find().populate('user').sort({ createdAt: -1 }).limit(50)
      return res.json({ success: true, posts })
    }

    const { userId } = (req.auth && req.auth()) || { userId: req.authUserId }
    const user = await User.findById(userId);
    if (!user) return res.json({ success: false, message: 'user not found' });

    const userIds = [userId, ...(user.connections || []), ...(user.following || [])];
    const posts = await Post.find({ user: { $in: userIds } }).populate('user').sort({ createdAt: -1 });
    return res.json({ success: true, posts });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
  }
}

// Like / unlike post
export const likePost = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { postId } = req.body;
    if (!postId) return res.json({ success: false, message: 'postId required' });

    const post = await Post.findById(postId);
    if (!post) return res.json({ success: false, message: 'post not found' });

    if (post.likes && post.likes.includes(userId)) {
      post.likes = post.likes.filter(u => u !== userId);
      await post.save();
      return res.json({ success: true, message: 'post unliked' });
    } else {
      post.likes = post.likes || [];
      post.likes.push(userId);
      await post.save();
      return res.json({ success: true, message: 'post liked' });
    }
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
  }
}
