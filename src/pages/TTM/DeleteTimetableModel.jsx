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
    try {
      await axios.delete(`${API_BASE_URL}/timetable/${timetableId}`);
      toast.success("Timetable deleted successfully!");
      onDeleteSuccess(); // Refresh data after deletion
      onClose();
    } catch (error) {
      console.error("Error deleting timetable:", error);
      toast.error("Failed to delete timetable. Please try again.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete this timetable entry?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleDelete} variant="contained" color="error">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteTimetableModal;
