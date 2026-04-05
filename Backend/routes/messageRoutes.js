import express from 'express';
import { serverSideEventController, sendMessage, markMessagesAsSeen, getUserRecentMessages, getConversation } from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../configs/multer.js';

const router = express.Router();

router.get('/sse', protect, serverSideEventController);
router.post('/send', protect, upload.array('attachments'), sendMessage);
router.post('/mark-seen', protect, markMessagesAsSeen);
router.get('/recent', protect, getUserRecentMessages);
router.get('/conversation/:id', protect, getConversation);

export default router;
