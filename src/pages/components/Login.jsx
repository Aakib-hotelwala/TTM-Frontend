import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";
import universityLogo from "../../assets/Image.png";
import { ClipLoader } from "react-spinners"; // Import the spinner component

const Login = () => {
  const { login, user } = useContext(AuthContext); // Make sure the user context is available
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  // If the user is already logged in, redirect them to the homepage
  useEffect(() => {
    if (user) {
      navigate(`/${user.role}-homepage`, { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Set loading state to true

    try {
      // Simulate the API login request
      const response = await axios.post(
        "https://reqres.in/api/login",
        credentials,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const token = response.data.token;
      const role = "ttm";
      const id = 1;

      toast.success("Login successful!");

      login(token, role, id);

      // Reset credentials after successful login
      setCredentials({ email: "", password: "" });

      // Redirect based on the role
      switch (role) {
        case "student":
          navigate(`/student-homepage/`, { replace: true });
          break;
        case "teacher":
          navigate(`/teacher-homepage/`, { replace: true });
          break;
        case "admin":
          navigate(`/admin-homepage/`, { replace: true });
          break;
        case "dean":
          navigate(`/dean-homepage/`, { replace: true });
          break;
        case "hod":
          navigate(`/hod-homepage/`, { replace: true });
          break;
        case "ttm":
          navigate(`/ttm-homepage/`, { replace: true });
          break;
        default:
          navigate("/login");
          break;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false); // Set loading state to false after API call
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 bg-opacity-80">
      <div className="bg-white/5 backdrop-blur-2xl shadow-xl rounded-xl p-8 w-full max-w-md border border-white/10">
        {/* University Logo */}
        <div className="flex justify-center mb-6">
          <img
            src={universityLogo}
            alt="University Logo"
            className="w-30 h-30 object-contain filter invert"
          />
        </div>

        <h2 className="text-3xl font-bold text-center mb-6 text-white">
          Login
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg font-semibold text-white mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={credentials.email}
              onChange={(e) =>
                setCredentials({ ...credentials, email: e.target.value })
              }
              required
              className="w-full p-3 border border-white/30 rounded-lg bg-transparent text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-lg font-semibold text-white mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              required
              className="w-full p-3 border border-white/20 rounded-lg bg-transparent text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg cursor-pointer transition duration-300 flex items-center justify-center"
            disabled={isLoading} // Disable the button while loading
          >
            {isLoading ? (
              <ClipLoader color="#ffffff" size={30} /> // Show spinner
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
