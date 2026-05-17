import express from 'express';
import { getPublishedImages, getUser, loginUser, registerUser, googleAuth } from '../controllers/userController.js';
import { protect } from '../middlewares/auth.js';

const userRouter=express.Router();
userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/google', googleAuth)
userRouter.post('/data',protect, getUser)
userRouter.post('/published-images',getPublishedImages)

export default userRouter;