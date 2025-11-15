import API_URL from '../config/api';

const getAuthHeader = () => {
  try {
    const token = localStorage.getItem('jwtToken') || localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch (_) {
    return {};
  }
};

const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();
  if (!response.ok) {
    const message = isJson && payload && (payload.error || payload.message) ? (payload.error || payload.message) : response.statusText;
    throw new Error(message);
  }
  return payload;
};

// Authentication API
export const signup = async ({ name, email, password }) => {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return handleResponse(res);
};

export const login = async ({ email, password }) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse(res);
  if (data && data.jwtToken) {
    try { 
      localStorage.setItem('jwtToken', data.jwtToken);
      localStorage.setItem('token', data.jwtToken);
      if (data.name) {
        localStorage.setItem('loggedInUser', data.name);
      }
    } catch (_) {}
  }
  return data;
};

export const logout = () => {
  try { 
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
  } catch (_) {}
};

// Posts API
export const getPosts = async () => {
  const res = await fetch(`${API_URL}/posts`);
  return handleResponse(res);
};

export const getPostById = async (postId) => {
  const res = await fetch(`${API_URL}/posts/${postId}`);
  return handleResponse(res);
};

export const createPost = async ({ title, content, tags }) => {
  const res = await fetch(`${API_URL}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ title, content, tags }),
  });
  return handleResponse(res);
};

export const updatePost = async (postId, { title, content, tags }) => {
  const res = await fetch(`${API_URL}/posts/${postId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ title, content, tags }),
  });
  return handleResponse(res);
};

export const deletePost = async (postId) => {
  const res = await fetch(`${API_URL}/posts/${postId}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() },
  });
  return handleResponse(res);
};

export const votePost = async (postId, type) => {
  const res = await fetch(`${API_URL}/posts/${postId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ type }),
  });
  return handleResponse(res);
};

// Comments API
export const getComments = async (postId) => {
  const res = await fetch(`${API_URL}/comments/${postId}`);
  return handleResponse(res);
};

export const createComment = async (postId, content) => {
  const res = await fetch(`${API_URL}/comments/${postId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ content }),
  });
  return handleResponse(res);
};

export const voteComment = async (commentId, type) => {
  const res = await fetch(`${API_URL}/comments/${commentId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ type }),
  });
  return handleResponse(res);
};

export const deleteComment = async (commentId) => {
  const res = await fetch(`${API_URL}/comments/${commentId}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() },
  });
  return handleResponse(res);
};

export const api = {
  // Auth methods
  signup,
  login,
  logout,
  // Post methods
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  votePost,
  // Comment methods
  getComments,
  createComment,
  voteComment,
  deleteComment,
};

export default api;