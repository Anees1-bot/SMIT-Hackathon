# Frontend Integration Guide

This guide will help you connect your frontend application to the Vercel-deployed backend.

## Backend URL

After deploying to Vercel, your backend will be available at:
```
https://your-project-name.vercel.app
```

Replace `your-project-name` with your actual Vercel project name.

## Environment Variables for Frontend

Create a `.env` file (or `.env.local` for Next.js) in your frontend project:

```env
# For production (Vercel backend)
VITE_API_URL=https://your-project-name.vercel.app
# or for React apps:
REACT_APP_API_URL=https://your-project-name.vercel.app
# or for Next.js:
NEXT_PUBLIC_API_URL=https://your-project-name.vercel.app

# For local development
# VITE_API_URL=http://localhost:3000
```

## Frontend Configuration Examples

### React / Vite

```javascript
// config/api.js or utils/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default API_URL;
```

```javascript
// Example API call
import API_URL from './config/api';

// Login example
const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store JWT token
    localStorage.setItem('token', data.jwtToken);
  }
  
  return data;
};

// Authenticated request example
const getPosts = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/posts`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`, // or just `token` (both formats supported)
      'Content-Type': 'application/json',
    },
  });
  
  return await response.json();
};
```

### Next.js

```javascript
// lib/api.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default API_URL;
```

```javascript
// Example API route or component
import API_URL from '@/lib/api';

export async function loginUser(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  return await response.json();
}
```

### Vanilla JavaScript / HTML

```javascript
// config.js
const API_URL = 'https://your-project-name.vercel.app';

// Example fetch
async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.jwtToken);
  }
  return data;
}
```

## API Endpoints Reference

### Authentication

#### Sign Up
```javascript
POST /auth/signup
Body: { name: string, email: string, password: string }
Response: { message: string, success: boolean }
```

#### Login
```javascript
POST /auth/login
Body: { email: string, password: string }
Response: { 
  message: string, 
  success: boolean, 
  jwtToken: string, 
  email: string, 
  name: string 
}
```

### Posts

#### Get All Posts
```javascript
GET /posts
Headers: { Authorization: 'Bearer <token>' } // Optional for public posts
Response: Post[]
```

#### Get Single Post
```javascript
GET /posts/:id
Response: Post
```

#### Create Post (Auth Required)
```javascript
POST /posts
Headers: { Authorization: 'Bearer <token>' }
Body: { title: string, content: string, tags?: string[] }
Response: Post
```

#### Update Post (Auth Required, Owner Only)
```javascript
PUT /posts/:id
Headers: { Authorization: 'Bearer <token>' }
Body: { title?: string, content?: string, tags?: string[] }
Response: Post
```

#### Delete Post (Auth Required, Owner Only)
```javascript
DELETE /posts/:id
Headers: { Authorization: 'Bearer <token>' }
Response: { success: boolean }
```

#### Vote on Post (Auth Required)
```javascript
POST /posts/:id/vote
Headers: { Authorization: 'Bearer <token>' }
Body: { type: 'upvote' | 'downvote' }
Response: { success: boolean, votes: number, id: string }
```

### Comments

#### Get Comments for Post
```javascript
GET /comments/:postId
Response: Comment[]
```

#### Create Comment (Auth Required)
```javascript
POST /comments/:postId
Headers: { Authorization: 'Bearer <token>' }
Body: { content: string }
Response: Comment
```

#### Vote on Comment (Auth Required)
```javascript
POST /comments/:id/vote
Headers: { Authorization: 'Bearer <token>' }
Body: { type: 'upvote' | 'downvote' }
Response: { success: boolean, votes: number, id: string }
```

#### Delete Comment (Auth Required, Owner Only)
```javascript
DELETE /comments/:id
Headers: { Authorization: 'Bearer <token>' }
Response: { success: boolean }
```

### Products

#### Get Products (Auth Required)
```javascript
GET /products
Headers: { Authorization: 'Bearer <token>' }
Response: Product[]
```

## Authentication Flow

1. **User Registration/Login**: Call `/auth/signup` or `/auth/login`
2. **Store Token**: Save the `jwtToken` from the response (localStorage, sessionStorage, or state)
3. **Include Token**: Add the token to all authenticated requests in the `Authorization` header
4. **Token Format**: Use either `Bearer <token>` or just `<token>` (both are supported)

## Error Handling

The API returns standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `403` - Forbidden (unauthorized, invalid token)
- `404` - Not Found
- `409` - Conflict (e.g., user already exists)
- `500` - Internal Server Error

Example error response:
```json
{
  "message": "Error message",
  "success": false,
  "error": "Detailed error message"
}
```

## CORS Configuration

The backend is configured to accept requests from any origin by default. For production, you can restrict this by setting the `ALLOWED_ORIGINS` environment variable in Vercel:

```
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com
```

## Common Issues and Solutions

### 1. CORS Errors
- **Issue**: Browser blocks requests due to CORS policy
- **Solution**: The backend already has CORS enabled. If you still see errors, check that your frontend URL is in `ALLOWED_ORIGINS` (or leave it as `*` for development)

### 2. 403 Unauthorized Errors
- **Issue**: Token is missing or invalid
- **Solution**: 
  - Ensure you're including the `Authorization` header
  - Check that the token hasn't expired (tokens expire after 24 hours)
  - Verify the token format: `Bearer <token>` or just `<token>`

### 3. Network Errors
- **Issue**: Cannot connect to backend
- **Solution**:
  - Verify the backend URL is correct
  - Check that the backend is deployed and running on Vercel
  - Ensure environment variables are set correctly

### 4. 500 Internal Server Error
- **Issue**: Server-side error
- **Solution**:
  - Check Vercel logs for detailed error messages
  - Verify `MONGO_URI` and `JWT_SECRET` are set in Vercel environment variables
  - Ensure MongoDB connection is working

## Testing the Connection

You can test if your backend is working by visiting:
```
https://your-project-name.vercel.app/
```

You should see: `Hello World!`

## Example Complete Integration

```javascript
// api.js - Complete API service example
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

class ApiService {
  constructor() {
    this.baseURL = API_URL;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth methods
  async signup(name, email, password) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.success && data.jwtToken) {
      localStorage.setItem('token', data.jwtToken);
    }
    
    return data;
  }

  // Post methods
  async getPosts() {
    return this.request('/posts');
  }

  async getPost(id) {
    return this.request(`/posts/${id}`);
  }

  async createPost(title, content, tags = []) {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify({ title, content, tags }),
    });
  }

  // Comment methods
  async getComments(postId) {
    return this.request(`/comments/${postId}`);
  }

  async createComment(postId, content) {
    return this.request(`/comments/${postId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }
}

export default new ApiService();
```

## Next Steps

1. Deploy your backend to Vercel
2. Get your Vercel backend URL
3. Set the API URL in your frontend environment variables
4. Update your frontend API calls to use the new URL
5. Test all endpoints to ensure everything works

Your backend is now ready to be connected to your frontend! 🚀

