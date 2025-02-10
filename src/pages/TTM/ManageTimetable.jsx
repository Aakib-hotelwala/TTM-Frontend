import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Autocomplete,
  Paper,
} from "@mui/material";
import toast from "react-hot-toast";

const API_BASE_URL = "https://localhost:7073/api/Timetable";

const AddTimetableModal = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    academicYearId: null,
    facultyId: null,
    departmentId: null,
    programId: null,
    academicClassId: null,
    divisionId: null,
    subjectId: null,
    batchId: null,
    dayId: null,
    timeSlotId: null,
    staffId: null,
    locationId: null,
  });

  const academicYears = ["2025", "2026", "2027"];
  const faculties = ["Technologies", "Science", "Arts", "Commerce"];
  const departments = ["CS", "Math", "Physics"];
  const programs = ["MCA", "BE", "BSc"];
  const Class = ["FS-MCA-1", "SS-MCA-2", "FS-BE-1"];
  const divisions = ["Div 1", "Div 2", "Div 3"];
  const subjects = ["JAVA", "Python", "C++"];
  const batches = ["Batch-A", "Batch-B"];
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const timeSlots = [
    "11:00-12:00",
    "12:00-01:00",
    "01:00-02:00",
    "02:30-03:30",
    "03:30-04:30",
    "04:30-05:30",
  ];
  const staffMembers = ["ABC Sir", "XYZ ma'am"];
  const locations = ["Modern lab", "MCA-1", "MCA-2"];

  const handleChange = (field, newValue) => {
    setFormData((prev) => ({ ...prev, [field]: newValue }));
  };

  const handleSubmit = async () => {
    // Check if any field is missing
    const missingFields = Object.keys(formData).filter((key) => !formData[key]);

    if (missingFields.length > 0) {
      toast.error("Please fill all fields.");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/insert`, formData);
      toast.success("Timetable entry added successfully!");
      onSubmit(response.data);
      onClose();
      setFormData({
        academicYearId: null,
        facultyId: null,
        departmentId: null,
        programId: null,
        academicClassId: null,
        divisionId: null,
        subjectId: null,
        batchId: null,
        dayId: null,
        timeSlotId: null,
        staffId: null,
        locationId: null,
      });
    } catch (error) {
      toast.error("Error inserting timetable entry");
      console.error("Error inserting timetable entry:", error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{ "& .MuiDialog-paper": { width: "80%", maxWidth: "600px" } }}
    >
      <DialogTitle>Add Timetable</DialogTitle>
      <DialogContent>
        {[
          {
            label: "Academic Year",
            field: "academicYearId",
            options: academicYears,
          },
          { label: "Faculty", field: "facultyId", options: faculties },
          { label: "Department", field: "departmentId", options: departments },
          { label: "Program", field: "programId", options: programs },
          { label: "Class", field: "academicClassId", options: Class },
          { label: "Division", field: "divisionId", options: divisions },
          { label: "Subject", field: "subjectId", options: subjects },
          { label: "Batch", field: "batchId", options: batches },
          { label: "Day", field: "dayId", options: days },
          { label: "Time Slot", field: "timeSlotId", options: timeSlots },
          { label: "Staff", field: "staffId", options: staffMembers },
          { label: "Location", field: "locationId", options: locations },
        ].map(({ label, field, options }) => (
          <Box key={field} marginY={2}>
            <Autocomplete
              value={formData[field]}
              onChange={(e, newValue) => handleChange(field, newValue)}
              options={options}
              renderInput={(params) => <TextField {...params} label={label} />}
            />
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ManageTimetable = () => {
  const [data, setData] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/getAll`);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching timetable data:", error);
      }
    };
    fetchTimetable();
  }, []);

  const handleAddTimetable = (newTimetable) => {
    setData((prevData) => [...prevData, newTimetable]);
  };

  return (
    <div>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        marginBottom={2}
      >
        <Typography variant="h4" fontWeight="bold">
          Manage Timetable
        </Typography>
        <Button
          variant="contained"
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
          onClick={() => setOpenModal(true)}
        >
          Add Timetable
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {[
                "Academic Year",
                "Faculty",
                "Department",
                "Program",
                "Class",
                "Division",
                "Subject",
                "Batch",
                "Day",
                "Time Slot",
                "Staff",
                "Location",
              ].map((col) => (
                <TableCell key={col}>{col}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                {Object.keys(item).map((key) => (
                  <TableCell key={key}>{item[key]}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <AddTimetableModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleAddTimetable}
      />
    </div>
  );
};

export default ManageTimetable;
