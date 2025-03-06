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
  selectedDivision,
  selectedLocation,
  selectedTeacher,
  handleProgramChange,
  handleClassChange,
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
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        {/* Class and Division in one column */}
        <div style={{ display: "flex", flexDirection: "column", width: "30%" }}>
          <Autocomplete
            options={uniqueValues("academicClassName")}
            getOptionLabel={(option) => option || ""}
            value={selectedClass}
            onChange={(e, newValue) => handleClassChange(newValue)}
            isOptionEqualToValue={(option, value) => option === value}
            renderInput={(params) => (
              <TextField {...params} label="Select Class" fullWidth />
            )}
            disabled={!selectedProgram}
            sx={{ marginBottom: "10px" }}
          />
          <Autocomplete
            options={uniqueValues("divisionName")}
            getOptionLabel={(option) => option || ""}
            value={selectedDivision}
            onChange={(e, newValue) => handleFilterChange("division", newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Select Division" fullWidth />
            )}
            disabled={!selectedClass}
          />
        </div>

        {/* Location */}
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

        {/* Teacher */}
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
                width: "100%",
                tableLayout: "fixed",
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
                        height: "60px",
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

                      const renderContent = () => {
                        if (!entry) return "-";

                        return (
                          <>
                            {selectedDivision && (
                              <>
                                {entry.subjectName && (
                                  <Typography variant="body2" color="primary">
                                    {entry.subjectName}
                                  </Typography>
                                )}
                                {entry.staffName && (
                                  <Typography variant="body2" color="error">
                                    {entry.staffName}
                                  </Typography>
                                )}
                              </>
                            )}
                            {selectedLocation && (
                              <>
                                {entry.subjectName && (
                                  <Typography variant="body2" color="error">
                                    {entry.subjectName}
                                  </Typography>
                                )}
                                {entry.academicClassName && (
                                  <Typography variant="body2" color="secondary">
                                    {entry.academicClassName}
                                  </Typography>
                                )}
                                {entry.divisionName && (
                                  <Typography variant="body2" color="primary">
                                    {`Division-${entry.divisionName}`}
                                  </Typography>
                                )}
                                {entry.staffName && (
                                  <Typography variant="body2" color="error">
                                    {entry.staffName}
                                  </Typography>
                                )}
                              </>
                            )}
                            {selectedTeacher && (
                              <>
                                {entry.subjectName && (
                                  <Typography variant="body2" color="error">
                                    {entry.subjectName}
                                  </Typography>
                                )}
                                {entry.academicClassName && (
                                  <Typography variant="body2" color="secondary">
                                    {entry.academicClassName}
                                  </Typography>
                                )}
                                {entry.divisionName && (
                                  <Typography variant="body2" color="primary">
                                    {`Division-${entry.divisionName}`}
                                  </Typography>
                                )}
                                {entry.locationName && (
                                  <Typography variant="body2" color="error">
                                    {entry.locationName}
                                  </Typography>
                                )}
                              </>
                            )}
                            {selectedDivision && entry.locationName && (
                              <Typography variant="body2" color="secondary">
                                {entry.locationName}
                              </Typography>
                            )}
                          </>
                        );
                      };

                      return (
                        <TableCell
                          key={day.dayId}
                          style={{
                            textAlign: "center",
                            width: "150px",
                            height: "60px",
                            border: "1px solid #ccc",
                            wordWrap: "break-word",
                            whiteSpace: "pre-line",
                            padding: "8px",
                          }}
                        >
                          {renderContent()}
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
