import express from 'express';
import { sendConnectionRequest, getUserConnections } from '../controllers/connectionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/send', protect, sendConnectionRequest);
router.get('/list', protect, getUserConnections);

export default router;
