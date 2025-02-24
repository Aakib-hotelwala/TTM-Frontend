import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
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

const API_BASE_URL = "https://localhost:7073/api";

const ManageTimetable = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [timetableToDelete, setTimetableToDelete] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [timetables, setTimetables] = useState([]);
  const [faculties, setFaculties] = useState([]);

  // Fetch timetable data
  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/Timetable/getTimetable?userId=1`
      );
      setTimetables(response.data);
      console.log(timetables);
    } catch (error) {
      console.error("Error fetching timetable data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch faculty data
  const fetchFaculties = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Academic/Faculties`);
      setFaculties(response.data);
    } catch (error) {
      console.error("Error fetching faculty data:", error);
    }
  };

  // Fetch faculty data
  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Academic/Faculties`);
      setFaculties(response.data);
    } catch (error) {
      console.error("Error fetching faculty data:", error);
    }
  };

  // Fetch both data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchTimetable(), fetchFaculties()]);
      setLoading(false);
    };

    fetchData();
  }, []);

  // Get FacultyName by facultyId
  const getFacultyName = (facultyId) => {
    const faculty = faculties.find((f) => f.facultyId === facultyId);
    return faculty ? faculty.facultyName : "N/A";
  };

  const refreshTimetable = () => {
    setRefreshKey((prevKey) => prevKey + 1); // Change state to trigger re-fetch
  };

  useEffect(() => {
    fetchTimetable();
  }, [refresh]);

  // Fetch a specific timetable entry by ID
  const fetchTimetableById = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/timetable/${id}`);
      setSelectedTimetable(response.data);
      setOpenModal(true);
    } catch (error) {
      console.error("Error fetching timetable entry:", error);
    }
  };

  // Handle filtering
  useEffect(() => {
    let filtered = data;
    if (selectedDay) {
      filtered = filtered.filter((item) => item.DayId?.DayName === selectedDay);
    }
    if (selectedTeacher) {
      filtered = filtered.filter(
        (item) => item.StaffId?.UserId?.FullName === selectedTeacher
      );
    }
    if (selectedLocation) {
      filtered = filtered.filter(
        (item) => item.LocationId?.LocationName === selectedLocation
      );
    }
    setFilteredData(filtered);
  }, [selectedDay, selectedTeacher, selectedLocation, data]);

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

      {/* Search Filters */}
      <Box display="flex" gap={2} mb={2}>
        <Autocomplete
          options={[
            ...new Set(data.map((item) => item.DayId?.DayName).filter(Boolean)),
          ]}
          value={selectedDay}
          onChange={(event, value) => setSelectedDay(value)}
          renderInput={(params) => (
            <TextField {...params} label="Search Day" variant="outlined" />
          )}
          sx={{ width: 250 }}
        />
        <Autocomplete
          options={[
            ...new Set(
              data.map((item) => item.StaffId?.UserId?.FullName).filter(Boolean)
            ),
          ]}
          value={selectedTeacher}
          onChange={(event, value) => setSelectedTeacher(value)}
          renderInput={(params) => (
            <TextField {...params} label="Search Teacher" variant="outlined" />
          )}
          sx={{ width: 250 }}
        />
        <Autocomplete
          options={[
            ...new Set(
              data.map((item) => item.LocationId?.LocationName).filter(Boolean)
            ),
          ]}
          value={selectedLocation}
          onChange={(event, value) => setSelectedLocation(value)}
          renderInput={(params) => (
            <TextField {...params} label="Search Location" variant="outlined" />
          )}
          sx={{ width: 250 }}
        />
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
                {[
                  "Sr. No",
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
                  "Edit",
                  "Delete",
                ].map((col) => (
                  <TableCell key={col} sx={{ padding: "8px 12px" }}>
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((item, index) => (
                <TableRow key={item._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    {item.AcademicYearId?.AcademicYearCode ||
                      "No Academic Year"}
                  </TableCell>
                  <TableCell>{getFacultyName(item.facultyId)}</TableCell>
                  <TableCell>
                    {item.DeptId?.DepartmentName || "No Department"}
                  </TableCell>
                  <TableCell>
                    {item.ProgramId?.ProgramName || "No Program"}
                  </TableCell>
                  <TableCell>{item.ClassId?.ClassName || "No Class"}</TableCell>
                  <TableCell>
                    {item.DivId?.DivisionName || "No Division"}
                  </TableCell>
                  <TableCell>
                    {item.SubjectId?.SubjectName || "No Subject"}
                  </TableCell>
                  <TableCell>{item.BatchId?.BatchName || "No Batch"}</TableCell>
                  <TableCell>{item.DayId?.DayName || "No Day"}</TableCell>
                  <TableCell>
                    {item.TimeSlotId?.SlotName || "No Slot"}
                  </TableCell>
                  <TableCell>
                    {item.StaffId?.Designation && item.StaffId?.UserId?.FullName
                      ? `${item.StaffId.Designation} ${item.StaffId.UserId.FullName}`
                      : "No Staff Info"}
                  </TableCell>
                  <TableCell>
                    {item.LocationId?.LocationName || "No Location"}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => fetchTimetableById(item._id)}
                      color="primary"
                    >
                      <Edit />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="error"
                      onClick={() => {
                        setTimetableToDelete(item._id);
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

      {selectedTimetable ? (
        <UpdateTimetableModal
          open={openModal}
          onClose={() => {
            setOpenModal(false);
            setSelectedTimetable(null); // Reset selection after closing
            setRefresh((prev) => !prev); // ✅ Ensures re-render
          }}
          onSubmit={() => setRefresh((prev) => !prev)} // ✅ Ensures re-render
          initialData={selectedTimetable} // Pass selected timetable entry
        />
      ) : (
        <AddTimetableModal
          open={openModal}
          onClose={() => {
            setOpenModal(false);
            setRefresh((prev) => !prev); // ✅ Ensures re-render
          }}
          onSubmit={refreshTimetable} // ✅ Ensures refresh after adding
        />
      )}

      <DeleteTimetableModal
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        timetableId={timetableToDelete}
        onDeleteSuccess={() => setRefresh((prev) => !prev)} // Refresh data on delete
      />
    </div>
  );
};

export default ManageTimetable;
