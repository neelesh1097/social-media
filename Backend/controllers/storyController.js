import fs from 'fs'
import ImageKit from '../configs/imageKit.js'
import Story from '../modals/Story.js'
import User from '../modals/User.js'
import { inngest } from '../inngest/index.js'

// Create a new story
export const addStory = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { content } = req.body;
    const file = req.files && req.files.media && req.files.media[0];

    let media_url = '';
    let media_type = 'text';

    if (file) {
      const buffer = fs.readFileSync(file.path);
      const response = await ImageKit.upload({ file: buffer, fileName: file.originalname, folder: 'stories' });
      media_url = ImageKit.url({ path: response.filePath, transformation: [{ quality: 'auto' }, { format: 'webp' }, { width: '1280' }] });
      if (file.mimetype && file.mimetype.startsWith('image')) media_type = 'image';
      else media_type = 'video';
    }

    const story = await Story.create({ user: userId, content, media_url, media_type });

    // emit Inngest event so background can schedule deletion
    try { await inngest.send({ name: 'story.created', data: { storyId: story._id, userId } }); } catch (e) { console.error('inngest send failed', e); }

    return res.json({ success: true, message: 'story created', story });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
  }
}

// Get stories for user + connections + following
export const getStories = async (req, res) => {
  try {
    // Development bypass: if client sets x-dev-bypass, return recent stories without requiring auth
    if (req.headers['x-dev-bypass']) {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const stories = await Story.find({ createdAt: { $gte: since } }).populate('user').sort({ createdAt: -1 }).limit(50)
      return res.json({ success: true, stories })
    }

    const { userId } = (req.auth && req.auth()) || { userId: req.authUserId }
    const user = await User.findById(userId);
    if (!user) return res.json({ success: false, message: 'user not found' });

    const ids = [userId, ...(user.connections || []), ...(user.following || [])];
    // only recent stories (24h)
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const stories = await Story.find({ user: { $in: ids }, createdAt: { $gte: since } }).populate('user').sort({ createdAt: -1 });
    return res.json({ success: true, stories });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
  }
}

// Delete a story (owner only)
export const deleteStory = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { storyId } = req.body;
    if (!storyId) return res.json({ success: false, message: 'storyId required' });

    const story = await Story.findById(storyId);
    if (!story) return res.json({ success: false, message: 'story not found' });
    if (story.user !== userId) return res.json({ success: false, message: 'unauthorized' });

    await Story.findByIdAndDelete(storyId);
    return res.json({ success: true, message: 'story deleted' });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
  }
}
