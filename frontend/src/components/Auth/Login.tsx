import React, { useState } from "react";
import axiosInstance from "../../services/axiosInstance";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Auth.css";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  const validateFields = () => {
    let isValid = true;
    setUsernameError("");
    setPasswordError("");

    if (!username) {
      setUsernameError("Username is required!");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required!");
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateFields()) return;

    try {
      const response = await axiosInstance.post("/auth/login", {
        username,
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("username", username);
      navigate("/dashboard");
    } catch (err) {
      toast.error("Login failed. Please check your credentials.", {
        position: "bottom-right",
      });
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="auth-container">
      <ToastContainer />
      <h2>Login</h2>
      <div className="input-group">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className={`auth-input ${usernameError ? "input-error" : ""}`}
          onKeyPress={handleKeyPress}
        />
        {usernameError && (
          <p className="input-error-message">{usernameError}</p>
        )}
      </div>
      <div className="input-group">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className={`auth-input ${passwordError ? "input-error" : ""}`}
          onKeyPress={handleKeyPress}
        />
        {passwordError && (
          <p className="input-error-message">{passwordError}</p>
        )}
      </div>
      <button onClick={handleLogin} className="auth-button">
        Login
      </button>
      <p>
        Don’t have an account?{" "}
        <Link to="/register" className="auth-link">
          Register here
        </Link>
      </p>
    </div>
  );
};

export default Login;
