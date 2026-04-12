import express from 'express';
import { sendConnectionRequest, getUserConnections, acceptConnectionRequest } from '../controllers/connectionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/send', protect, sendConnectionRequest);
router.post('/accept', protect, acceptConnectionRequest);
router.get('/list', protect, getUserConnections);

export default router;
