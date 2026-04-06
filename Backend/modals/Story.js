import mongoose from 'mongoose'

const storySchema = new mongoose.Schema({
  user: { type: String, ref: 'User', required: true },
  content: { type: String, default: '' },
  media_url: { type: String, default: '' },
  media_type: { type: String, enum: ['image', 'video', 'text'], default: 'text' }
}, { timestamps: true, minimize: false })

const Story = mongoose.model('Story', storySchema)
export default Story
