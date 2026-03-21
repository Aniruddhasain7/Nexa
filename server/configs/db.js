import mongoose from 'mongoose'

const connectDB=async () =>{
    try {
        mongoose.connection.on('connected', () => {
            console.log('Database connected successfully')
        })
        
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err.message)
            throw err
        })
        
        await mongoose.connect(`${process.env.MONGODB_URI}/Nexa`)
        console.log('Ready to use Nexa database')
        return true
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error.message)
        throw error
    }
}

export default connectDB