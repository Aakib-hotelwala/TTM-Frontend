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
import { Delete as DeleteIcon } from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";

const RoleManagement = () => {
  const { auth } = useContext(AuthContext);
  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState({ roleName: "" });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Axios configuration with authorization header
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${auth?.token}`,
    },
  };

  // Fetch roles on component mount
  useEffect(() => {
    fetchRoles();
  }, [auth?.token]); // Re-fetch when token changes

  const fetchRoles = async () => {
    try {
      const response = await axios.get(
        "https://localhost:7073/api/Admin/roles",
        axiosConfig
      );
      setRoles(response.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
      if (error.response?.status === 401) {
        toast.error("Unauthorized access. Please login again.");
      } else {
        toast.error("Failed to fetch roles");
      }
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post(
        "https://localhost:7073/api/Admin/role",
        newRole,
        axiosConfig
      );
      toast.success("Role created successfully");
      setNewRole({ roleName: "" });
      fetchRoles(); // Refresh the roles list
    } catch (error) {
      console.error("Error creating role:", error);
      if (error.response?.status === 401) {
        toast.error("Unauthorized access. Please login again.");
      } else {
        toast.error(error.response?.data?.message || "Failed to create role");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (role) => {
    setSelectedRole(role);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRole) return;

    setIsLoading(true);
    try {
      await axios.delete(
        `https://localhost:7073/api/Admin/role/${selectedRole.roleId}`,
        axiosConfig
      );
      toast.success("Role deleted successfully");
      fetchRoles(); // Refresh the roles list
    } catch (error) {
      console.error("Error deleting role:", error);
      if (error.response?.status === 401) {
        toast.error("Unauthorized access. Please login again.");
      } else {
        toast.error(error.response?.data?.message || "Failed to delete role");
      }
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
      setSelectedRole(null);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Role Management
      </Typography>

      {/* Create Role Form */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Create New Role
        </Typography>
        <form onSubmit={handleCreateRole}>
          <TextField
            fullWidth
            label="Role Name"
            variant="outlined"
            value={newRole.roleName}
            onChange={(e) => setNewRole({ ...newRole, roleName: e.target.value })}
            required
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Role"}
          </Button>
        </form>
      </Paper>

      {/* Roles Table */}
      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Role ID</TableCell>
                <TableCell>Role Name</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.roleId}>
                  <TableCell>{role.roleId}</TableCell>
                  <TableCell>{role.roleName}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteClick(role)}
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
          Are you sure you want to delete the role "{selectedRole?.roleName}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RoleManagement;
