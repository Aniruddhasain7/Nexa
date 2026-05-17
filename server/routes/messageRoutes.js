import express from 'express'
import { protect } from '../middlewares/auth.js'
import { imageMessageController, textMessageController, uploadMediaController } from '../controllers/messageController.js'
import upload from '../middlewares/upload.js'

const messageRouter = express.Router()

messageRouter.post('/text', protect, textMessageController)
messageRouter.post('/image', protect, imageMessageController)
messageRouter.post('/upload-media', protect, upload.single('file'), uploadMediaController)

export default messageRouter