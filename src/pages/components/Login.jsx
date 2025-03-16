import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";
import universityLogo from "../../assets/Image.png";
import { ClipLoader } from "react-spinners";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  // Define role priority order
  const rolePriority = ["TTM", "Admin", "Dean", "HOD", "Teacher", "Student"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        "https://localhost:7073/api/Auth/login",
        credentials,
        { headers: { "Content-Type": "application/json" } }
      );

      const {
        token,
        userId,
        fullName,
        facultyId,
        departmentId,
        roleIds,
        roleNames,
      } = response.data;

      // Find the highest-priority role the user has
      const prioritizedRole = rolePriority.find((role) =>
        roleNames.includes(role)
      );

      if (!prioritizedRole) {
        toast.error("Invalid Credentials");
        setIsLoading(false);
        return;
      }

      // Save user data to AuthContext
      login({
        token,
        userId,
        fullName,
        facultyId,
        departmentId,
        roleIds,
        role: prioritizedRole,
        roleNames,
      });

      toast.success("Login successful!");

      // Reset form fields
      setCredentials({ email: "", password: "" });

      // Redirect to role-based homepage
      navigate(`/${prioritizedRole.toLowerCase()}-homepage`, { replace: true });
    } catch (error) {
      console.error("Login error:", error);

      if (error.response) {
        const { status, data } = error.response;
        if (status >= 400 && status < 500) {
          toast.error("Invalid Credentials. Please try again.");
        } else if (status === 500) {
          toast.error("Server error. Please try again later.");
        } else {
          toast.error(data.message || "An unexpected error occurred.");
        }
      } else if (error.request) {
        toast.error(
          "No response from server. Please check your network connection."
        );
      } else {
        toast.error("An error occurred while processing your request.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 bg-opacity-80">
      <div className="bg-white/5 backdrop-blur-2xl shadow-xl rounded-xl p-8 w-full max-w-md border border-white/10">
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
            disabled={isLoading}
          >
            {isLoading ? <ClipLoader color="#ffffff" size={30} /> : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
