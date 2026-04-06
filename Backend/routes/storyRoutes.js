import express from 'express'
import { addStory, getStories, deleteStory } from '../controllers/storyController.js'
import { protect } from '../middleware/auth.js'
import { upload } from '../configs/multer.js'

const router = express.Router();

router.post('/add', upload.array('media', 1), protect, addStory);
router.get('/list', protect, getStories);
router.post('/delete', protect, deleteStory);

export default router;
