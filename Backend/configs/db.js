import mongoose from 'mongoose'

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', ()=> console.log('Databse connected'))
        await mongoose.connect(`${process.env.MONGODB_URL}/social-media`)
    } catch (error) {
        console.log(error.message)
    }
}

export default connectDB