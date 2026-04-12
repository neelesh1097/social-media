import express from 'express';
import { discoverUser, followUser, getUserData, unfollowUser, updateUserData, getUserProfiles } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../configs/multer.js';

const userRouter = express.Router();


userRouter.get('/data', protect , getUserData)
userRouter.post('/update',upload.fields([{name:'profile' , maxCount: 1}, {name:'cover' ,maxCount:1}]), protect , updateUserData)
userRouter.post('/discover',protect ,discoverUser)
userRouter.post('/follow',protect ,followUser)
userRouter.post('/unfollow',protect ,unfollowUser)
userRouter.post('/profiles', protect, getUserProfiles)

export default userRouter