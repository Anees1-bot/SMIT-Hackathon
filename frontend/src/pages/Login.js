import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login as apiLogin } from "../utils/api";
function Login() {
  const [loginInfo, setLoginInfo] = useState({
    
    email: "",
    password: ""
  });
   const navigate = useNavigate();
   const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginInfo({ ...loginInfo, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginInfo.email || !loginInfo.password) {
      return handleError("All fields are required");
    }
    try {
      const result = await apiLogin(loginInfo);
      const { success, message, jwtToken, name } = result;
      if (success) {
        handleSuccess(message);
        try { login(jwtToken, name); } catch (_) {}
         setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        const details = result?.error?.details?.[0]?.message || result?.message || "Login failed";
        handleError(details);
      }
      console.log(result);
    } catch (error) {
      handleError(error.message || error);
    }
  };

  return (
    <div className="container">
      <h1>Login</h1>
      <form className="form" onSubmit={handleLogin}>
        

        <label htmlFor="email">Email</label>
        <input
          onChange={handleChange}
          type="email"
          placeholder="Enter Email"
          name="email"
          value={loginInfo.email}
        />

        <label htmlFor="password">Password</label>
        <input
          onChange={handleChange}
          type="password"
          placeholder="Enter Password"
          name="password"
          value={loginInfo.password}
        />

        <button className="login-btn" type="submit">
          Login
        </button>
        <span>
          Don't have an account?
          <Link to="/signup">Signup</Link>
        </span>
      </form>
      <ToastContainer />
    </div>
  );
}

export default Login;
