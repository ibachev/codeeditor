import React, { useState } from "react";
import axiosInstance from "../../services/axiosInstance";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Auth.css";
import LoadingWithMessage from "../Session/Loader";

const Register: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
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

  const handleRegister = async () => {
    if (!validateFields()) return;

    setLoading(true);

    try {
      await axiosInstance.post("/auth/register", {
        username,
        password,
      });

      setError("");
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Registration failed. Please try again.";

      toast.error(errorMessage, {
        position: "bottom-right",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleRegister();
    }
  };

  if (loading) return <LoadingWithMessage />;

  return (
    <div className="auth-container">
      <ToastContainer />
      <h2>Register</h2>
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
      <button onClick={handleRegister} className="auth-button">
        Register
      </button>
      {error && <p className="auth-error">{error}</p>}
      {success && <p className="auth-success">{success}</p>}
      <p>
        Already have an account?
        <Link to="/login" className="auth-link">
          Login here
        </Link>
      </p>
    </div>
  );
};

export default Register;
