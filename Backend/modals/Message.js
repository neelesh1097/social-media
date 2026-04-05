import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  from: { type: String, required: true, ref: 'User' },
  to: { type: String, required: true, ref: 'User' },
  content: { type: String, default: '' },
  attachments: { type: Array, default: [] },
  seen: { type: Boolean, default: false },
}, { timestamps: true, minimize: false })

const Message = mongoose.model('Message', messageSchema)

export default Message
