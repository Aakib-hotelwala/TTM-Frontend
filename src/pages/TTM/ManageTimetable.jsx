import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableSortLabel,
  TableRow,
  Button,
  Box,
  Typography,
  Paper,
  IconButton,
  CircularProgress,
  TextField,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import Autocomplete from "@mui/material/Autocomplete";
import AddTimetableModal from "./AddTimetableModel";
import UpdateTimetableModal from "./UpdateTimetableModel";
import DeleteTimetableModal from "./DeleteTimetableModel";
import { AuthContext } from "../../context/AuthContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const API_BASE_URL = "https://localhost:7073/api";

const ManageTimetable = () => {
  const { auth } = useContext(AuthContext);
  const [filteredData, setFilteredData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [refresh, setRefresh] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [timetableToDelete, setTimetableToDelete] = useState(null);
  const [timetables, setTimetables] = useState([]);

  // Fetch timetable data
  const fetchTimetable = async () => {
    if (!auth?.userId) {
      console.error("User ID not found in auth context");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/Timetable/getTimetable`,
        {
          params: { userId: auth.userId },
        }
      );

      setTimetables(response.data);
      console.log("Fetched timetable:", response.data); // ✅ Logs the user's timetable
    } catch (error) {
      console.error("Error fetching timetable data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [refresh]);

  // Handle filtering
  useEffect(() => {
    let filtered = timetables;

    if (selectedClass) {
      filtered = filtered.filter(
        (item) =>
          item.academicClassName?.toLowerCase() === selectedClass.toLowerCase()
      );
    }
    if (selectedTeacher) {
      filtered = filtered.filter(
        (item) =>
          item.staffName?.toLowerCase() === selectedTeacher.toLowerCase()
      );
    }
    if (selectedLocation) {
      filtered = filtered.filter(
        (item) =>
          item.locationName?.toLowerCase() === selectedLocation.toLowerCase()
      );
    }

    setFilteredData(filtered);
  }, [selectedClass, selectedTeacher, selectedLocation, timetables]);

  // Autocomplete options
  const classOptions = [
    ...new Set(
      timetables.map((item) => item.academicClassName).filter(Boolean)
    ),
  ];
  const teacherOptions = [
    ...new Set(timetables.map((item) => item.staffName).filter(Boolean)),
  ];
  const locationOptions = [
    ...new Set(timetables.map((item) => item.locationName).filter(Boolean)),
  ];

  useEffect(() => {
    setFilteredData(timetables); // Initialize filteredData with all timetables
  }, [timetables]);

  // Sorting logic
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedData = [...filteredData].sort((a, b) => {
      const aValue = a[key] || "";
      const bValue = b[key] || "";
      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredData(sortedData);
  };

  const columns = [
    { label: "Academic Year", key: "academicYearCode" },
    { label: "Faculty", key: "facultyName" },
    { label: "Department", key: "departmentName" },
    { label: "Program", key: "programName" },
    { label: "Class", key: "academicClassName" },
    { label: "Division", key: "divisionName" },
    { label: "Batch", key: "batchName" },
    { label: "Subject", key: "subjectName" },
    { label: "Day", key: "dayName" },
    { label: "Time Slot", key: "timeslot" },
    { label: "Teacher", key: "staffName" },
    { label: "Location", key: "locationName" },
  ];

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map((item, index) => ({
        "Sr. No": index + 1,
        "Academic Year": item.academicYearCode || "N/A",
        Faculty: item.facultyName || "N/A",
        Department: item.departmentName || "N/A",
        Program: item.programName || "N/A",
        Class: item.academicClassName || "N/A",
        Division: item.divisionName || "N/A",
        Batch: item.batchName || "N/A",
        Subject: item.subjectName || "N/A",
        Day: item.dayName || "N/A",
        "Time Slot": item.timeslot || "N/A",
        Teacher: item.staffName || "N/A",
        Location: item.locationName || "N/A",
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Timetable");

    // Generate Excel file and trigger download
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(data, "Timetable.xlsx");
  };

  return (
    <div>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={1}
        p={1}
      >
        <Typography variant="h5" fontWeight="bold">
          Manage Timetable
        </Typography>
        <Button
          variant="contained"
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
          onClick={() => {
            setSelectedTimetable(null);
            setOpenModal(true);
          }}
        >
          Add Timetable
        </Button>
      </Box>

      <Box
        display="flex"
        gap={2}
        mb={2}
        alignItems="center"
        justifyContent="space-between"
      >
        {/* Search Filters */}
        <Box display="flex" gap={2} mb={2} alignItems="center">
          <Button
            variant="contained"
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
            onClick={() => {
              setSelectedClass(null);
              setSelectedTeacher(null);
              setSelectedLocation(null);
            }}
          >
            Clear Filters
          </Button>
          {[
            {
              label: "Search Class",
              value: selectedClass,
              setter: setSelectedClass,
              options: classOptions,
            },
            {
              label: "Search Teacher",
              value: selectedTeacher,
              setter: setSelectedTeacher,
              options: teacherOptions,
            },
            {
              label: "Search Location",
              value: selectedLocation,
              setter: setSelectedLocation,
              options: locationOptions,
            },
          ].map(({ label, value, setter, options }) => (
            <Autocomplete
              key={label}
              options={options}
              value={value}
              onChange={(event, newValue) => setter(newValue)}
              renderInput={(params) => (
                <TextField {...params} label={label} variant="outlined" />
              )}
              sx={{ width: 250 }}
            />
          ))}
        </Box>

        <Button
          variant="contained"
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
          onClick={downloadExcel}
        >
          Download Entries
        </Button>
      </Box>

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="400px"
        >
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Sr. No</TableCell>
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    <TableSortLabel
                      active={sortConfig.key === col.key}
                      direction={
                        sortConfig.key === col.key
                          ? sortConfig.direction
                          : "asc"
                      }
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell>Edit</TableCell>
                <TableCell>Delete</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((item, index) => (
                <TableRow key={item.timetableId}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.academicYearCode || "N/A"}</TableCell>
                  <TableCell>{item.facultyName || "N/A"}</TableCell>
                  <TableCell>{item.departmentName || "N/A"}</TableCell>
                  <TableCell>{item.programName || "N/A"}</TableCell>
                  <TableCell>{item.academicClassName || "N/A"}</TableCell>
                  <TableCell>{item.divisionName || "N/A"}</TableCell>
                  <TableCell>{item.batchName || "N/A"}</TableCell>
                  <TableCell>{item.subjectName || "N/A"}</TableCell>
                  <TableCell>{item.dayName || "N/A"}</TableCell>
                  <TableCell>{item.timeslot || "N/A"}</TableCell>
                  <TableCell>{item.staffName || "N/A"}</TableCell>
                  <TableCell>{item.locationName || "N/A"}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => {
                        setSelectedTimetable(item); // Pass the full item (timetable) data
                        setOpenModal(true);
                      }}
                    >
                      <Edit />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="error"
                      onClick={() => {
                        setTimetableToDelete(item.timetableId);
                        setOpenDeleteModal(true);
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modals */}
      <AddTimetableModal
        open={openModal && !selectedTimetable}
        onClose={() => setOpenModal(false)}
        onSubmit={() => setRefresh((prev) => !prev)}
      />

      {selectedTimetable && (
        <UpdateTimetableModal
          open={openModal}
          onClose={() => {
            setOpenModal(false);
            setSelectedTimetable(null); // Reset after closing
          }}
          onSubmit={() => setRefresh((prev) => !prev)}
          timetableId={selectedTimetable.timetableId} // Pass the timetableId
          initialData={selectedTimetable} // Pass the full timetable data
          onUpdateSuccess={() => setRefresh((prev) => !prev)}
        />
      )}

      <DeleteTimetableModal
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        timetableId={timetableToDelete}
        onDeleteSuccess={() => setRefresh((prev) => !prev)}
      />
    </div>
  );
};

export default ManageTimetable;
