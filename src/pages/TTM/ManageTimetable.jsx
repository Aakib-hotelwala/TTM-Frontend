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

  // Fetch timetable data
  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/Timetable/getTimetable?userId=1`
      );
      setTimetables(response.data);
      console.log("Fetched data:", response.data); // ✅ Logs the correct data
    } catch (error) {
      console.error("Error fetching timetable data:", error);
    } finally {
      setLoading(false);
    }
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
        {[
          {
            label: "Search Class",
            value: selectedDay,
            setter: setSelectedDay,
            options: [
              ...new Set(
                data.map((item) => item.DayId?.DayName).filter(Boolean)
              ),
            ],
          },
          {
            label: "Search Teacher",
            value: selectedTeacher,
            setter: setSelectedTeacher,
            options: [
              ...new Set(data.map((item) => item.FullName).filter(Boolean)),
            ],
          },
          {
            label: "Search Location",
            value: selectedLocation,
            setter: setSelectedLocation,
            options: [
              ...new Set(data.map((item) => item.LocationName).filter(Boolean)),
            ],
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
              {timetables.map((item, index) => (
                <TableRow key={item.timetableId}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.academicYearCode || "N/A"}</TableCell>
                  <TableCell>{item.facultyName || "N/A"}</TableCell>
                  <TableCell>{item.departmentName || "N/A"}</TableCell>
                  <TableCell>{item.programName || "N/A"}</TableCell>
                  <TableCell>{item.academicClassName || "N/A"}</TableCell>
                  <TableCell>{item.divisionName || "N/A"}</TableCell>
                  <TableCell>{item.subjectName || "N/A"}</TableCell>
                  <TableCell>{item.batchName || "N/A"}</TableCell>
                  <TableCell>{item.dayName || "N/A"}</TableCell>
                  <TableCell>{item.timeslot || "N/A"}</TableCell>
                  <TableCell>{item.staffName || "N/A"}</TableCell>
                  <TableCell>{item.locationName || "N/A"}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => fetchTimetableById(item.timetableId)}
                      color="primary"
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
            setSelectedTimetable(null);
            setRefresh((prev) => !prev);
          }}
          onSubmit={() => setRefresh((prev) => !prev)}
          initialData={selectedTimetable}
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
