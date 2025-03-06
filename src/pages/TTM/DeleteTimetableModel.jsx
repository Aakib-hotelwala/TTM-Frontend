import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-hot-toast";

const API_BASE_URL = "https://localhost:7073/api";

const DeleteTimetableModal = ({
  open,
  onClose,
  timetableId,
  onDeleteSuccess,
}) => {
  const handleDelete = async () => {
    if (!timetableId) {
      toast.error("Invalid timetable ID.");
      return;
    }

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/Timetable/delete/${timetableId}`
      );
      if (response.status === 200 || response.status === 204) {
        toast.success("Timetable deleted successfully!");
        onDeleteSuccess?.(); // Only call if the function exists
        onClose();
      } else {
        throw new Error("Unexpected response from server.");
      }
    } catch (error) {
      console.error("Error deleting timetable:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to delete timetable. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete Timetable Entry</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete this timetable entry?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteTimetableModal;
