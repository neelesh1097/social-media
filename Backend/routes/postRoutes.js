import express from 'express'
import { addPost, getFeedPosts, likePost } from '../controllers/postController.js'
import { protect } from '../middleware/auth.js'
import { upload } from '../configs/multer.js'

const router = express.Router();

router.post('/add', upload.array('images', 4), protect, addPost);
router.get('/feed', protect, getFeedPosts);
router.post('/like', protect, likePost);

export default router;
