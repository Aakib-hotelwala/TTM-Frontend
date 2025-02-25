import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Autocomplete,
  TextField,
  Button,
} from "@mui/material";

const TimetableComponent = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [days, setDays] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    if (selectedProgram) {
      fetchDays();
      fetchTimeSlots(selectedProgram.programId);
      fetchTimetable(selectedProgram.programId);
    }
  }, [selectedProgram]);

  const fetchPrograms = async () => {
    try {
      const response = await axios.get(
        "https://localhost:7073/api/Academic/programs?departmentId=1"
      );
      setPrograms(response.data);
    } catch (error) {
      console.error("Error fetching programs:", error);
    }
  };

  const fetchTimetable = async (programId) => {
    try {
      const response = await axios.get(
        `https://localhost:7073/api/Timetable/getTimetable?userId=1&programId=${programId}`
      );
      setTimetable(response.data);
    } catch (error) {
      console.error("Error fetching timetable:", error);
    }
  };

  const fetchDays = async () => {
    try {
      const response = await axios.get(
        "https://localhost:7073/api/Timetable/days"
      );
      setDays(response.data);
    } catch (error) {
      console.error("Error fetching days:", error);
    }
  };

  const fetchTimeSlots = async (programId) => {
    try {
      const response = await axios.get(
        `https://localhost:7073/api/Timetable/timeslots?programId=${programId}`
      );
      setTimeSlots(response.data);
    } catch (error) {
      console.error("Error fetching time slots:", error);
    }
  };

  const clearFilters = () => {
    setSelectedClass(null);
    setSelectedLocation(null);
    setSelectedTeacher(null);
  };

  const uniqueValues = (key) => [
    ...new Set(timetable.map((entry) => entry[key])),
  ];

  const handleFilterChange = (filterType, newValue) => {
    switch (filterType) {
      case "class":
        setSelectedClass(newValue);
        setSelectedLocation(null);
        setSelectedTeacher(null);
        break;
      case "location":
        setSelectedLocation(newValue);
        setSelectedClass(null);
        setSelectedTeacher(null);
        break;
      case "teacher":
        setSelectedTeacher(newValue);
        setSelectedClass(null);
        setSelectedLocation(null);
        break;
      default:
        break;
    }
  };

  const filteredTimetable = timetable.filter((entry) => {
    if (selectedClass) return entry.academicClassName === selectedClass;
    if (selectedLocation) return entry.locationName === selectedLocation;
    if (selectedTeacher) return entry.staffName === selectedTeacher;
    return true; // Show all if nothing is selected
  });

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Timetable
      </Typography>

      <Autocomplete
        options={programs}
        getOptionLabel={(option) => option.programName || ""}
        value={selectedProgram}
        onChange={(e, newValue) => setSelectedProgram(newValue)}
        renderInput={(params) => (
          <TextField {...params} label="Select Program" />
        )}
        fullWidth
      />

      {selectedProgram && (
        <>
          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <Autocomplete
              options={uniqueValues("academicClassName")}
              getOptionLabel={(option) => option || ""}
              value={selectedClass}
              onChange={(e, newValue) => handleFilterChange("class", newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Select Class" />
              )}
              fullWidth
            />

            <Autocomplete
              options={uniqueValues("locationName")}
              getOptionLabel={(option) => option || ""}
              value={selectedLocation}
              onChange={(e, newValue) =>
                handleFilterChange("location", newValue)
              }
              renderInput={(params) => (
                <TextField {...params} label="Select Location" />
              )}
              fullWidth
            />

            <Autocomplete
              options={uniqueValues("staffName")}
              getOptionLabel={(option) => option || ""}
              value={selectedTeacher}
              onChange={(e, newValue) =>
                handleFilterChange("teacher", newValue)
              }
              renderInput={(params) => (
                <TextField {...params} label="Select Staff" />
              )}
              fullWidth
            />

            <Button variant="contained" color="primary" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>

          {filteredTimetable.length > 0 && (
            <TableContainer component={Paper} style={{ marginTop: "30px" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell
                      style={{ textAlign: "center", fontWeight: "bold" }}
                    >
                      Time
                    </TableCell>
                    {days.map((day) => (
                      <TableCell
                        key={day.dayId}
                        style={{ textAlign: "center", fontWeight: "bold" }}
                      >
                        {day.dayName}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {timeSlots.map((slot) => (
                    <TableRow key={slot.timeSlotId}>
                      <TableCell
                        style={{ textAlign: "center", fontWeight: "bold" }}
                      >
                        {slot.timeslot}
                      </TableCell>
                      {days.map((day) => {
                        const entry = filteredTimetable.find(
                          (t) =>
                            t.dayId === day.dayId &&
                            t.timeSlotId === slot.timeSlotId
                        );
                        return (
                          <TableCell
                            key={day.dayId}
                            style={{ textAlign: "center" }}
                          >
                            {entry ? (
                              <>
                                <div>{entry.subjectName}</div>
                                <div>{entry.staffName}</div>
                                <div>{entry.locationName}</div>
                              </>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
    </Container>
  );
};

const ViewTimetableTTM = () => {
  return <TimetableComponent />;
};

export default ViewTimetableTTM;
