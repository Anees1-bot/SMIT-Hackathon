const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const AuthRouter = require('./Routes/AuthRouter');
const ProductRouter = require('./Routes/ProductRouter');
const PostRouter = require('./Routes/PostRouter');
const CommentRouter = require('./Routes/CommentRouter');
const connectDB = require('./Models/db');

require('dotenv').config();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use(bodyParser.json());

// CORS configuration - allow frontend connections
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
        // In production, you can restrict this to your frontend domain(s)
        const allowedOrigins = process.env.ALLOWED_ORIGINS 
            ? process.env.ALLOWED_ORIGINS.split(',')
            : ['*']; // Allow all origins if not specified
        
        if (allowedOrigins.includes('*') || !origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow cookies/credentials if needed
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Middleware to ensure database connection before handling requests
const ensureDBConnection = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: 'Database connection failed', 
      success: false 
    });
  }
};

// Apply DB connection middleware to routes that need database access
app.use('/auth', ensureDBConnection, AuthRouter);
app.use('/products', ProductRouter); // Products doesn't need DB
app.use('/posts', ensureDBConnection, PostRouter);
app.use('/comments', ensureDBConnection, CommentRouter);

// Export the app for Vercel serverless functions
module.exports = app;

// For local development, still allow listening
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    // Ensure DB connection before starting server
    connectDB()
        .then(() => {
            app.listen(PORT, () => {
                console.log(`Server is running on port ${PORT}`);
            });
        })
        .catch((err) => {
            console.error('Failed to connect to database:', err);
            process.exit(1);
        });
} 