import mongoose from 'mongoose'

let isConnected = false

const connectDB = async () => {
    if (isConnected || mongoose.connection.readyState >= 1) {
        return
    }

    try {
        const uri = process.env.MONGODB_URI
        if (!uri) {
            console.error('MongoDB connection error: MONGODB_URI environment variable is not defined.')
            return
        }

        mongoose.connection.on('connected', () => {
            console.log('Database connected successfully')
        })

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err.message)
        })

        const conn = await mongoose.connect(uri, {
            dbName: 'Nexa'
        })
        isConnected = !!conn.connections[0].readyState
        console.log('Ready to use Nexa database')
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error.message)
    }
}

export default connectDB