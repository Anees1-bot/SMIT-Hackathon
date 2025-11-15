import { Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Signup from './pages/Auth/Signup';
import Profile from './pages/Profile';
import Login from './pages/Auth/Login';
import CreatePost from './pages/CreatePost';
import Leaderboard from './pages/Leaderboard';
import PostDetails from './pages/PostDetails';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <div>
      <Navbar />
    
       
     <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-post" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
        <Route path="/createpost" element={<Navigate to="/create-post" replace />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/posts/:id" element={<PostDetails />} />

     </Routes>
      
    </div>
  );
}

export default App;
