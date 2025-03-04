// TimetableComponent.jsx

import React from "react";
import {
  Container,
  Typography,
  Autocomplete,
  TextField,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";

const Timetable = ({
  title = "Timetable",
  programs = [],
  days = [],
  timeSlots = [],
  filteredTimetable = [],
  selectedProgram,
  selectedClass,
  selectedLocation,
  selectedTeacher,
  handleProgramChange,
  handleFilterChange,
  uniqueValues,
}) => {
  return (
    <Container>
      <Typography variant="h4" fontWeight="bold">
        {title}
      </Typography>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <Autocomplete
          sx={{ width: 550 }}
          options={programs}
          getOptionLabel={(option) => option.programName || ""}
          value={selectedProgram}
          onChange={(e, newValue) => handleProgramChange(newValue)}
          renderInput={(params) => (
            <TextField {...params} label="Select Program" fullWidth />
          )}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "20px",
        }}
      >
        <Autocomplete
          sx={{ width: "30%" }}
          options={uniqueValues("academicClassName")}
          getOptionLabel={(option) => option || ""}
          value={selectedClass}
          onChange={(e, newValue) => handleFilterChange("class", newValue)}
          renderInput={(params) => (
            <TextField {...params} label="Select Class" fullWidth />
          )}
          disabled={!selectedProgram}
        />

        <Autocomplete
          sx={{ width: "30%" }}
          options={uniqueValues("locationName")}
          getOptionLabel={(option) => option || ""}
          value={selectedLocation}
          onChange={(e, newValue) => handleFilterChange("location", newValue)}
          renderInput={(params) => (
            <TextField {...params} label="Select Location" fullWidth />
          )}
          disabled={!selectedProgram}
        />

        <Autocomplete
          sx={{ width: "30%" }}
          options={uniqueValues("staffName")}
          getOptionLabel={(option) => option || ""}
          value={selectedTeacher}
          onChange={(e, newValue) => handleFilterChange("teacher", newValue)}
          renderInput={(params) => (
            <TextField {...params} label="Select Teacher" fullWidth />
          )}
          disabled={!selectedProgram}
        />
      </div>

      {(selectedClass || selectedLocation || selectedTeacher) &&
        filteredTimetable.length > 0 && (
          <TableContainer component={Paper} style={{ marginTop: "30px" }}>
            <Table
              size="small"
              style={{
                tableLayout: "fixed",
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell
                    style={{
                      textAlign: "center",
                      fontWeight: "bold",
                      width: "150px",
                      height: "50px",
                      border: "1px solid #ccc",
                    }}
                  >
                    Time
                  </TableCell>
                  {days.map((day) => (
                    <TableCell
                      key={day.dayId}
                      style={{
                        textAlign: "center",
                        fontWeight: "bold",
                        width: "150px",
                        height: "50px",
                        border: "1px solid #ccc",
                      }}
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
                      style={{
                        textAlign: "center",
                        fontWeight: "bold",
                        width: "150px",
                        height: "50px",
                        border: "1px solid #ccc",
                      }}
                    >
                      {slot.fromTime} - {slot.toTime}
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
                          style={{
                            textAlign: "center",
                            width: "150px",
                            height: "50px",
                            border: "1px solid #ccc",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                          }}
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
    </Container>
  );
};

export default Timetable;
