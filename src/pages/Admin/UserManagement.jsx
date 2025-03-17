import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";

const UserManagement = () => {
  const { auth } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ fullName: "", email: "", password: "", phoneNumber: "", departmentId: "", facultyId: "" });
  const [updatedUser, setUpdatedUser] = useState({ fullName: "", email: "", phoneNumber: "", departmentId: "", facultyId: "" });
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

  // Axios configuration with authorization header
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${auth?.token}`,
    },
  };

  // Email validation function
  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, [auth?.token]); // Re-fetch when token changes

  const fetchUsers = async () => {
    try {
      const response = await axios.get("https://localhost:7073/api/Admin/users", axiosConfig);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const trimmedEmail = newUser.email.trim(); // Trim whitespace

    if (!isValidEmail(trimmedEmail)) {
      toast.error("Invalid email format.");
      setIsLoading(false);
      return;
    }

    // Check for empty fields
    if (!newUser.fullName || !newUser.password || !newUser.phoneNumber) {
      toast.error("All fields are required.");
      setIsLoading(false);
      return;
    }

    // Update the newUser object with the trimmed email
    const userToCreate = { ...newUser, email: trimmedEmail };

    console.log("User to create:", userToCreate); // Log the user object

    try {
      await axios.post("https://localhost:7073/api/Admin/user", userToCreate, axiosConfig);
      toast.success("User created successfully");
      setNewUser({ fullName: "", email: "", password: "", phoneNumber: "", departmentId: "", facultyId: "" });
      fetchUsers(); // Refresh the users list
    } catch (error) {
      console.error("Error creating user:", error.response);
      toast.error(error.response?.data?.error || "Failed to create user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      await axios.delete(`https://localhost:7073/api/Admin/user/${selectedUser.userId}`, axiosConfig);
      toast.success("User deleted successfully");
      fetchUsers(); // Refresh the users list
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.error || "Failed to delete user");
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleUpdateClick = (user) => {
    setSelectedUser(user);
    setUpdatedUser({ fullName: user.fullName, email: user.email, phoneNumber: user.phoneNumber, departmentId: user.departmentId, facultyId: user.facultyId });
    setUpdateDialogOpen(true);
  };

  const handleUpdateConfirm = async () => {
    if (!selectedUser) return;

    // New validation checks
    const trimmedEmail = updatedUser.email.trim(); // Trim whitespace
    if (!isValidEmail(trimmedEmail)) {
        toast.error("Invalid email format.");
        return;
    }

    // Check for empty fields
    if (!updatedUser.fullName || !updatedUser.phoneNumber) {
        toast.error("All fields are required.");
        return;
    }

    // setIsLoading(true);
    try {
        // Update the updatedUser object with the trimmed email
        const userToUpdate = { ...updatedUser, email: trimmedEmail };
        await axios.put(`https://localhost:7073/api/Admin/user/${selectedUser.userId}`, userToUpdate, axiosConfig);
        toast.success("User updated successfully");
        fetchUsers(); // Refresh the users list
    } catch (error) {
        console.error("Error updating user:", error);
        console.error("Full error details:", error.response);
        toast.error(error.response?.data?.error || "Failed to update user");
    } finally {
        setIsLoading(false);
        setUpdateDialogOpen(false);
        setSelectedUser(null);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        User Management
      </Typography>

      {/* Create User Form */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Create New User
        </Typography>
        <form onSubmit={handleCreateUser}>
          <TextField
            fullWidth
            label="Full Name"
            variant="outlined"
            value={newUser.fullName}
            onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Phone Number"
            variant="outlined"
            value={newUser.phoneNumber}
            onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Department ID"
            variant="outlined"
            value={newUser.departmentId}
            onChange={(e) => setNewUser({ ...newUser, departmentId: e.target.value })}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Faculty ID"
            variant="outlined"
            value={newUser.facultyId}
            onChange={(e) => setNewUser({ ...newUser, facultyId: e.target.value })}
            required
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create User"}
          </Button>
        </form>
      </Paper>

      {/* Users Table */}
      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User ID</TableCell>
                <TableCell>Full Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.userId}>
                  <TableCell>{user.userId}</TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => handleUpdateClick(user)}
                      disabled={isLoading}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteClick(user)}
                      disabled={isLoading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the user "{selectedUser?.fullName}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update User Dialog */}
      <Dialog open={updateDialogOpen} onClose={() => setUpdateDialogOpen(false)}>
        <DialogTitle>Update User</DialogTitle>
        <DialogContent>
          <form onSubmit={handleUpdateConfirm}>
            <TextField
              fullWidth
              label="Full Name"
              variant="outlined"
              value={updatedUser.fullName}
              onChange={(e) => setUpdatedUser({ ...updatedUser, fullName: e.target.value })}
              required
              onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              value={updatedUser.email}
              onChange={(e) => setUpdatedUser({ ...updatedUser, email: e.target.value })}
              required
              onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Phone Number"
              variant="outlined"
              value={updatedUser.phoneNumber}
              onChange={(e) => setUpdatedUser({ ...updatedUser, phoneNumber: e.target.value })}
              required
              onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Department ID"
              variant="outlined"
              value={updatedUser.departmentId}
              onChange={(e) => setUpdatedUser({ ...updatedUser, departmentId: e.target.value })}
              required
              onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Faculty ID"
              variant="outlined"
              value={updatedUser.facultyId}
              onChange={(e) => setUpdatedUser({ ...updatedUser, facultyId: e.target.value })}
              required
              onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update User"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default UserManagement;
