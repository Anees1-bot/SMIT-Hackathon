# Vercel Deployment Guide

This backend is configured for deployment on Vercel.

## Required Environment Variables

Make sure to set the following environment variables in your Vercel project settings:

1. **MONGO_URI** - Your MongoDB connection string
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/database-name`
   - Or: `mongodb://localhost:27017/database-name` (for local development)

2. **JWT_SECRET** - Secret key for JWT token signing
   - Use a strong, random string in production
   - Example: Generate using `openssl rand -base64 32`

3. **ALLOWED_ORIGINS** (Optional) - Comma-separated list of allowed frontend origins
   - Example: `https://your-frontend.vercel.app,https://www.your-frontend.com`
   - If not set, all origins are allowed (useful for development)
   - For production, it's recommended to restrict to your frontend domain(s)

4. **PORT** (Optional) - Server port (defaults to 3000)
   - Not required for Vercel deployment, but useful for local development

## Setting Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - **MONGO_URI**: Your MongoDB connection string
   - **JWT_SECRET**: Your JWT secret key
   - **ALLOWED_ORIGINS** (Optional): Your frontend domain(s) for CORS
4. Make sure to set them for **Production**, **Preview**, and **Development** environments as needed

## Deployment Steps

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   For production deployment:
   ```bash
   vercel --prod
   ```

4. **Or connect your GitHub repository**:
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Vercel will automatically detect the configuration and deploy

## Local Development

To run locally:

```bash
npm install
npm start
```

Or with nodemon for auto-reload:

```bash
npm run dev
```

Make sure to create a `.env` file in the root directory with:

```
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret-key
PORT=3000
```

## API Endpoints

- `GET /` - Health check
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `GET /products` - Get products (requires authentication)
- `GET /posts` - Get all posts
- `POST /posts` - Create a post (requires authentication)
- `GET /posts/:id` - Get a single post
- `PUT /posts/:id` - Update a post (requires authentication, owner only)
- `DELETE /posts/:id` - Delete a post (requires authentication, owner only)
- `POST /posts/:id/vote` - Vote on a post (requires authentication)
- `GET /comments/:postId` - Get comments for a post
- `POST /comments/:postId` - Create a comment (requires authentication)
- `POST /comments/:id/vote` - Vote on a comment (requires authentication)
- `DELETE /comments/:id` - Delete a comment (requires authentication, owner only)

## Notes

- The database connection is optimized for serverless environments with connection caching
- CORS is configured to allow frontend connections. Set `ALLOWED_ORIGINS` to restrict in production
- The app automatically exports for Vercel serverless functions while maintaining local development support
- See `FRONTEND_INTEGRATION.md` for detailed instructions on connecting your frontend

## Frontend Integration

After deployment, your backend will be available at:
```
https://your-project-name.vercel.app
```

See `FRONTEND_INTEGRATION.md` for complete frontend integration instructions, including:
- Environment variable setup
- API endpoint examples
- Authentication flow
- Error handling
- Complete code examples

