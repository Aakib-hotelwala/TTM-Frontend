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
  Grid,
} from "@mui/material";
import toast from "react-hot-toast";

const API_BASE_URL = "https://localhost:7073/api";

const AddTimetableModal = ({ open, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    academicYearId: initialData?.academicYearId || null,
    facultyId: "Faculty of Technology", // Static Faculty
    departmentId: "CSE", // Static Department
    programId: initialData?.programId || null,
    academicClassId: initialData?.academicClassId || null,
    divisionId: initialData?.divisionId || null,
    subjectId: initialData?.subjectId || null,
    batchId: initialData?.batchId || null,
    dayId: initialData?.dayId || null,
    timeSlotId: initialData?.timeSlotId || null,
    staffId: initialData?.staffId || null,
    locationId: initialData?.locationId || null,
  });

  const [academicYears, setAcademicYears] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [batches, setBatches] = useState([]);
  const [days, setDays] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [locations, setLocations] = useState([]);

  const [facultyId, setFacultyId] = useState("Faculty of Technology"); // State for Faculty dropdown in second grid
  const [departmentId, setDepartmentId] = useState("CSE"); // State for Department dropdown in second grid

  // Fetch Divisions based on selected ClassId
  useEffect(() => {
    if (formData.facultyId) {
      axios
        .get(
          `${API_BASE_URL}/Academic/academicYears?facultyId=${formData.facultyId}`
        )
        .then((res) => setClasses(res.data))
        .catch((err) => console.error("Error fetching AcademicYear:", err));
    } else {
      setAcademicYears([]);
    }
  }, [formData.facultyId]);

  // Fetch Programs Based on DepartmentId
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/Academic/programs?departmentId=1`)
      .then((res) => setPrograms(res.data))
      .catch((err) => console.error("Error fetching programs:", err));
  }, []);

  // Fetch Classes based on selected ProgramId
  useEffect(() => {
    if (formData.programId) {
      axios
        .get(`${API_BASE_URL}/Academic/classes?programId=${formData.programId}`)
        .then((res) => setClasses(res.data))
        .catch((err) => console.error("Error fetching classes:", err));
    } else {
      setClasses([]);
    }
  }, [formData.programId]);

  // Fetch Divisions based on selected ClassId
  useEffect(() => {
    if (formData.academicClassId) {
      axios
        .get(
          `${API_BASE_URL}/Division/divisions?academicClassId=${formData.programId}`
        )
        .then((res) => setClasses(res.data))
        .catch((err) => console.error("Error fetching Divisions:", err));
    } else {
      setDivisions([]);
    }
  }, [formData.academicClassId]);

  // Fetch Subjects based on selected ProgramId
  useEffect(() => {
    if (formData.programId) {
      axios
        .get(
          `${API_BASE_URL}/Academic/subjects?programId=${formData.programId}`
        )
        .then((res) => setClasses(res.data))
        .catch((err) => console.error("Error fetching Subjects:", err));
    } else {
      setSubjects([]);
    }
  }, [formData.programId]);

  // Fetch Batches based on selected DivisionId
  useEffect(() => {
    if (formData.divisionId) {
      axios
        .get(
          `${API_BASE_URL}/Division/batches?divisionId=${formData.programId}`
        )
        .then((res) => setClasses(res.data))
        .catch((err) => console.error("Error fetching Batches:", err));
    } else {
      setBatches([]);
    }
  }, [formData.divisionId]);

  // Fetch Days based on selected ProgramId
  useEffect(() => {
    if (formData.programId) {
      axios
        .get(`${API_BASE_URL}/Timetable/days?programId=${formData.programId}`)
        .then((res) => setClasses(res.data))
        .catch((err) => console.error("Error fetching Days:", err));
    } else {
      setDays([]);
    }
  }, [formData.programId]);

  // Fetch TimeSlot based on selected ProgramId
  useEffect(() => {
    if (formData.programId) {
      axios
        .get(
          `${API_BASE_URL}/Timetable/timeslots?programId=${formData.programId}`
        )
        .then((res) => setClasses(res.data))
        .catch((err) => console.error("Error fetching Timeslots:", err));
    } else {
      setTimeSlots([]);
    }
  }, [formData.programId]);

  // Fetch Locations based on selected departmentId
  useEffect(() => {
    if (formData.departmentId) {
      axios
        .get(
          `${API_BASE_URL}/Location/locations?departmentId=${formData.programId}`
        )
        .then((res) => setClasses(res.data))
        .catch((err) => console.error("Error fetching Locations:", err));
    } else {
      setLocations([]);
    }
  }, [formData.departmentId]);

  // Fetch Departments based on selected FacultyId
  useEffect(() => {
    if (formData.facultyId) {
      axios
        .get(
          `${API_BASE_URL}/Academic/Departments?facultyId=${formData.programId}`
        )
        .then((res) => setClasses(res.data))
        .catch((err) => console.error("Error fetching Departments:", err));
    } else {
      setDepartmentId([]);
    }
  }, [formData.departmentId]);

  // Fetch Teachers based on selected departmentId
  useEffect(() => {
    if (formData.departmentId) {
      axios
        .get(
          `${API_BASE_URL}/Staff/teachers?departmentId=${formData.programId}`
        )
        .then((res) => setClasses(res.data))
        .catch((err) => console.error("Error fetching Staff:", err));
    } else {
      setStaffMembers([]);
    }
  }, [formData.departmentId]);

  const handleChange = (field, newValue) => {
    setFormData((prev) => ({ ...prev, [field]: newValue }));
  };

  const handleFacultyChange = (newValue) => {
    setFacultyId(newValue); // Update state for facultyId in second grid
  };

  const handleDepartmentChange = (newValue) => {
    setDepartmentId(newValue); // Update state for departmentId in second grid
  };

  const handleSubmit = async () => {
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
        facultyId: "Faculty of Technology",
        departmentId: "CSE",
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
      sx={{ "& .MuiDialog-paper": { width: "80%", maxWidth: "900px" } }}
    >
      <DialogTitle>
        {initialData ? "Edit Timetable" : "Add Timetable"}
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* First Column */}
          <Grid item xs={12} md={6}>
            <Box marginY={2}>
              <TextField
                label="Faculty"
                value={formData.facultyId}
                disabled
                fullWidth
              />
            </Box>
            <Box marginY={2}>
              <TextField
                label="Department"
                value={formData.departmentId}
                disabled
                fullWidth
              />
            </Box>

            {/* AcademicYear Dropdown */}
            <Box marginY={2}>
              <Autocomplete
                value={
                  academicYears.find(
                    (a) => a.academicYearId === formData.academicYearId
                  ) || null
                }
                onChange={(e, newValue) =>
                  handleChange(
                    "academicYearId",
                    newValue ? newValue.academicYearId : null
                  )
                }
                options={academicYears}
                getOptionLabel={(option) => option.academicYearName}
                renderInput={(params) => (
                  <TextField {...params} label="Select AcademicYear" />
                )}
              />
            </Box>

            {/* Program Dropdown */}
            <Box marginY={2}>
              <Autocomplete
                value={
                  programs.find((p) => p.programId === formData.programId) ||
                  null
                }
                onChange={(e, newValue) =>
                  handleChange(
                    "programId",
                    newValue ? newValue.programId : null
                  )
                }
                options={programs}
                getOptionLabel={(option) => option.programName}
                renderInput={(params) => (
                  <TextField {...params} label="Select Program" />
                )}
              />
            </Box>

            {/* Class Dropdown */}
            <Box marginY={2}>
              <Autocomplete
                value={
                  classes.find((c) => c.classId === formData.academicClassId) ||
                  null
                }
                onChange={(e, newValue) =>
                  handleChange(
                    "academicClassId",
                    newValue ? newValue.classId : null
                  )
                }
                options={classes}
                getOptionLabel={(option) => option.className}
                renderInput={(params) => (
                  <TextField {...params} label="Select Class" />
                )}
                disabled={!formData.programId}
              />
            </Box>

            {/* Division Dropdown */}
            <Box marginY={2}>
              <Autocomplete
                value={
                  divisions.find((d) => d.divisionId === formData.divisionId) ||
                  null
                }
                onChange={(e, newValue) =>
                  handleChange(
                    "divisionId",
                    newValue ? newValue.divisionId : null
                  )
                }
                options={divisions}
                getOptionLabel={(option) => option.divisionName}
                renderInput={(params) => (
                  <TextField {...params} label="Select Division" />
                )}
                disabled={!formData.classId}
              />
            </Box>

            {/* Subject Dropdown */}
            <Box marginY={2}>
              <Autocomplete
                value={
                  subjects.find((s) => s.subjectId === formData.subjectId) ||
                  null
                }
                onChange={(e, newValue) =>
                  handleChange(
                    "subjectId",
                    newValue ? newValue.subjectId : null
                  )
                }
                options={subjects}
                getOptionLabel={(option) => option.subjectName}
                renderInput={(params) => (
                  <TextField {...params} label="Select Subject" />
                )}
                disabled={!formData.programId}
              />
            </Box>

            {/* Batch Dropdown */}
            <Box marginY={2}>
              <Autocomplete
                value={
                  batches.find((b) => b.batchId === formData.batchId) || null
                }
                onChange={(e, newValue) =>
                  handleChange("batchId", newValue ? newValue.batchId : null)
                }
                options={batches}
                getOptionLabel={(option) => option.batchName}
                renderInput={(params) => (
                  <TextField {...params} label="Select Batch" />
                )}
                disabled={!formData.divisionId}
              />
            </Box>

            {/* Day Dropdown */}
            <Box marginY={2}>
              <Autocomplete
                value={days.find((d) => d.dayId === formData.dayId) || null}
                onChange={(e, newValue) =>
                  handleChange("dayId", newValue ? newValue.dayId : null)
                }
                options={days}
                getOptionLabel={(option) => option.dayName}
                renderInput={(params) => (
                  <TextField {...params} label="Select Day" />
                )}
                disabled={!formData.programId}
              />
            </Box>

            {/* TimeSlot Dropdown */}
            <Box marginY={2}>
              <Autocomplete
                value={
                  timeSlots.find((t) => t.timeSlotId === formData.timeSlotId) ||
                  null
                }
                onChange={(e, newValue) =>
                  handleChange(
                    "timeSlotId",
                    newValue ? newValue.timeSlotId : null
                  )
                }
                options={timeSlots}
                getOptionLabel={(option) => option.timeSlotName}
                renderInput={(params) => (
                  <TextField {...params} label="Select Timeslot" />
                )}
                disabled={!formData.programId}
              />
            </Box>

            {/* Location Dropdown */}
            <Box marginY={2}>
              <Autocomplete
                value={
                  locations.find((l) => l.locationId === formData.locationId) ||
                  null
                }
                onChange={(e, newValue) =>
                  handleChange(
                    "locationId",
                    newValue ? newValue.locationId : null
                  )
                }
                options={locations}
                getOptionLabel={(option) => option.LocationName}
                renderInput={(params) => (
                  <TextField {...params} label="Select Location" />
                )}
                disabled={!formData.departmentId}
              />
            </Box>
          </Grid>

          {/* Second Column - Selectable Faculty and Department */}
          <Grid item xs={12} md={6}>
            <Box marginY={2}>
              <Autocomplete
                value={facultyId} // Use the separate faculty state
                onChange={(e, newValue) => handleFacultyChange(newValue)}
                options={["Faculty of Technology", "Faculty of Science"]}
                renderInput={(params) => (
                  <TextField {...params} label="Select Faculty" />
                )}
              />
            </Box>
            <Box marginY={2}>
              <Autocomplete
                value={departmentId} // Use the separate department state
                onChange={(e, newValue) => handleDepartmentChange(newValue)}
                options={["CSE", "IT", "ECE"]}
                renderInput={(params) => (
                  <TextField {...params} label="Select Department" />
                )}
              />
            </Box>

            {/* Teacher Dropdown */}
            <Box marginY={2}>
              <Autocomplete
                value={
                  staffMembers.find((s) => s.staffId === formData.staffId) ||
                  null
                }
                onChange={(e, newValue) =>
                  handleChange("staffId", newValue ? newValue.staffId : null)
                }
                options={staffMembers}
                getOptionLabel={(option) => option.staffName}
                renderInput={(params) => (
                  <TextField {...params} label="Select Teacher" />
                )}
                disabled={!formData.departmentId}
              />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
        >
          {initialData ? "Update" : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ManageTimetable = () => {
  const [data, setData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedTimetable, setSelectedTimetable] = useState(null);

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

  const handleEditTimetable = (item) => {
    setSelectedTimetable(item);
    setOpenModal(true);
  };

  const handleDeleteTimetable = (id) => {
    setData((prevData) => prevData.filter((item) => item.id !== id));
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
                "Teacher",
                "Location",
                "Actions",
              ].map((col) => (
                <TableCell key={col}>{col}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                {Object.keys(item).map(
                  (key) =>
                    key !== "id" && <TableCell key={key}>{item[key]}</TableCell>
                )}
                <TableCell>
                  <Button
                    onClick={() => handleEditTimetable(item)}
                    variant="contained"
                    color="primary"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteTimetable(item.id)}
                    variant="contained"
                    color="secondary"
                    style={{ marginLeft: 8 }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <AddTimetableModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleAddTimetable}
        initialData={selectedTimetable}
      />
    </div>
  );
};

export default ManageTimetable;
