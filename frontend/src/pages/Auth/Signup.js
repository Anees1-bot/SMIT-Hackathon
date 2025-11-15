import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../../utils/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { signup, login as apiLogin } from "../../utils/api";
function Signup() {
  const [signupInfo, setSignupInfo] = useState({
    name: "",
    email: "",
    password: ""
  });
   const navigate = useNavigate();
   const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignupInfo({ ...signupInfo, [name]: value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!signupInfo.name || !signupInfo.email || !signupInfo.password) {
      return handleError("All fields are required");
    }
    try {
      const result = await signup(signupInfo);
      const { success, message } = result;
      if (success) {
        handleSuccess(message);
        // Auto-login immediately after signup by calling login endpoint
        try {
          const loginResult = await apiLogin({ email: signupInfo.email, password: signupInfo.password });
          if (loginResult?.jwtToken) {
            try { login(loginResult.jwtToken, loginResult.name); } catch (_) {}
            navigate("/");
            return;
          }
        } catch (_) {}
        navigate("/login");
      } else {
        const details = result?.error?.details?.[0]?.message || result?.message || "Signup failed";
        handleError(details);
      }
      console.log(result);
    } catch (error) {
      handleError(error.message || error);
    }
  };

  return (
    <div className="container">
      <h1>Signup</h1>
      <form className="form" onSubmit={handleSignup}>
        <label htmlFor="name">Name</label>
        <input
          onChange={handleChange}
          type="text"
          autoFocus
          placeholder="Enter Name"
          name="name"
          value={signupInfo.name}
        />

        <label htmlFor="email">Email</label>
        <input
          onChange={handleChange}
          type="email"
          placeholder="Enter Email"
          name="email"
          value={signupInfo.email}
        />

        <label htmlFor="password">Password</label>
        <input
          onChange={handleChange}
          type="password"
          placeholder="Enter Password"
          name="password"
          value={signupInfo.password}
        />

        <button className="signup-btn" type="submit">
          Signup
        </button>
        <span>
          Already have an account?
          <Link to="/login">Login</Link>
        </span>
      </form>
      <ToastContainer />
    </div>
  );
}

export default Signup;