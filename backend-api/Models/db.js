const mongoose = require('mongoose');

const mongo_url = process.env.MONGO_URI;

if (!mongo_url) {
    console.error('MONGO_URI environment variable is not set');
    throw new Error('MONGO_URI environment variable is required');
}

// Cache the connection to reuse in serverless environments
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(mongo_url, opts).then((mongoose) => {
            console.log('Connected to MongoDB');
            return mongoose;
        }).catch((err) => {
            console.error('Error connecting to MongoDB', err);
            cached.promise = null;
            throw err;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

// Connect immediately
connectDB().catch(err => console.error('MongoDB connection error:', err));

module.exports = connectDB;