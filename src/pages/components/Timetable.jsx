import React, { useState, useEffect, useContext, useRef } from "react";
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
  Button,
} from "@mui/material";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { AuthContext } from "../../context/AuthContext";
import universityLogo from "../../assets/Image.png";

const Timetable = ({
  title = "Timetable",
  programs = [],
  departments = [],
  days = [],
  timeSlots = [],
  filteredTimetable = [],
  selectedProgram,
  selectedClass,
  selectedDivision,
  selectedLocation,
  selectedTeacher,
  selectedDepartment,
  role,
  handleDepartmentChange,
  handleProgramChange,
  handleClassChange,
  handleFilterChange,
  uniqueValues,
}) => {
  const tableRef = useRef(null);
  const [facultyName, setFacultyName] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const { auth } = useContext(AuthContext);

  // useEffect(() => {
  //   const fetchFacultiesAndDepartments = async () => {
  //     try {
  //       const facultyResponse = await fetch(
  //         "https://localhost:7073/api/Academic/Faculties",
  //         {
  //           headers: {
  //             Authorization: `Bearer ${auth?.token}`,
  //           },
  //         }
  //       );
  //       const facultyData = await facultyResponse.json();

  //       // Use a sample facultyId (adjust as needed or pull from user input)
  //       const facultyId =
  //         facultyData.length > 0 ? facultyData[0].facultyId : null;

  //       const faculty = facultyData.find(
  //         (faculty) => faculty.facultyId === facultyId
  //       );

  //       if (facultyId) {
  //         const departmentResponse = await fetch(
  //           `https://localhost:7073/api/Academic/departments?facultyId=${facultyId}`,
  //           {
  //             headers: {
  //               Authorization: `Bearer ${auth?.token}`,
  //             },
  //           }
  //         );
  //         const departmentData = await departmentResponse.json();

  //         const departmentId =
  //           departmentData.length > 0 ? departmentData[0].departmentId : null;
  //         const department = departmentData.find(
  //           (dept) => dept.departmentId === departmentId
  //         );

  //         setFacultyName(faculty ? faculty.facultyName : "Unknown Faculty");
  //         setDepartmentName(
  //           department ? department.departmentName : "Unknown Department"
  //         );
  //       }
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     }
  //   };

  //   fetchFacultiesAndDepartments();
  // }, []);

  useEffect(() => {
    const fetchTimetableDetails = async () => {
      try {
        // Fetch timetable details
        const timetableResponse = await fetch(
          `https://localhost:7073/api/Timetable/getTimetable?userId=${auth?.userId}`,
          {
            headers: {
              Authorization: `Bearer ${auth?.token}`,
            },
          }
        );

        if (!timetableResponse.ok) {
          throw new Error("Failed to fetch timetable data");
        }

        const timetableData = await timetableResponse.json();

        if (timetableData && timetableData.length > 0) {
          const { facultyName, departmentName } = timetableData[0];

          setFacultyName(facultyName || "Unknown Faculty");
          setDepartmentName(departmentName || "Unknown Department");
        }
      } catch (error) {
        console.error("Error fetching timetable data:", error);
      }
    };

    fetchTimetableDetails();
  }, [auth?.userId, auth?.token]);

  const downloadPDF = async () => {
    try {
      const pdf = new jsPDF("p", "mm", "a4");

      // University Logo
      const logo = new Image();
      logo.src = universityLogo;

      logo.onload = async () => {
        // Add logo
        pdf.addImage(logo, "PNG", 90, 10, 30, 30);

        // Horizontal line under the title
        pdf.setDrawColor(0);
        pdf.setLineWidth(0.7);
        pdf.line(10, 45, 200, 45);

        // Faculty, Department, and Program info
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "normal");

        const info = [
          { label: "Faculty", value: facultyName },
          { label: "Department", value: departmentName },
          { label: "Program", value: selectedProgram?.programName },
          { label: "Division", value: selectedDivision },
          { label: "Teacher", value: selectedTeacher },
          { label: "Location", value: selectedLocation },
        ].filter((item) => item.value && item.value !== "N/A"); // Remove "N/A" fields

        let startY = 50;

        pdf.setFontSize(10); // Smaller text size

        info.forEach((item, index) => {
          pdf.setFont("helvetica", "bold");
          pdf.text(`${item.label}:`, 15, startY + index * 8);
          pdf.setFont("helvetica", "normal");
          pdf.text(item.value, 45, startY + index * 8);
        });

        // Timetable title
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("Timetable", 105, startY + info.length * 8 + 10, {
          align: "center",
        });

        // Capture timetable image
        const canvas = await html2canvas(tableRef.current, {
          backgroundColor: null,
          scale: 2,
          removeContainer: true,
        });

        const imgData = canvas.toDataURL("image/png");

        const imgWidth = 180;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(
          imgData,
          "PNG",
          15,
          startY + info.length * 8 + 15,
          imgWidth,
          imgHeight
        );

        // Footer
        const footerY = startY + info.length * 8 + 20 + imgHeight;
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        const indianDate = new Date().toLocaleDateString("en-IN");

        pdf.text(`Date: ${indianDate}`, 180, footerY + 10, { align: "right" });

        // Save PDF
        pdf.save(`${title.replace(/\s+/g, "_")}.pdf`);
      };
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" fontWeight="bold">
        {title}
      </Typography>

      {role?.toLowerCase() === "dean" && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          <Autocomplete
            sx={{ width: 550 }}
            options={departments}
            getOptionLabel={(option) => option.departmentName || ""}
            value={selectedDepartment}
            onChange={(e, newValue) => handleDepartmentChange(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Select Department" fullWidth />
            )}
          />
        </div>
      )}

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
          disabled={!selectedDepartment && role?.toLowerCase() === "dean"}
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

      <div ref={tableRef}>
        {(selectedClass || selectedLocation || selectedTeacher) &&
          filteredTimetable.length > 0 && (
            <>
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
                          const entries = filteredTimetable.filter(
                            (t) =>
                              t.dayId === day.dayId &&
                              t.timeSlotId === slot.timeSlotId
                          );

                          const renderContent = () => {
                            if (entries.length === 0) return "-";

                            return entries.map((entry, index) => (
                              <div key={index}>
                                {selectedDivision && (
                                  <>
                                    {entry.subjectName && (
                                      <Typography
                                        variant="body2"
                                        style={{ color: "#4caf50" }}
                                      >
                                        {entry.subjectName}
                                      </Typography>
                                    )}
                                    {entry.staffName && (
                                      <Typography
                                        variant="body2"
                                        style={{ color: "#ff0000" }}
                                      >
                                        {entry.staffName}
                                      </Typography>
                                    )}
                                    {entry.batchName && (
                                      <Typography
                                        variant="body2"
                                        style={{ color: "#cc0066" }}
                                      >
                                        {entry.batchName}
                                      </Typography>
                                    )}
                                  </>
                                )}
                                {selectedLocation && (
                                  <>
                                    {entry.subjectName && (
                                      <Typography
                                        variant="body2"
                                        style={{ color: "#4caf50" }}
                                      >
                                        {entry.subjectName}
                                      </Typography>
                                    )}
                                    {entry.academicClassName && (
                                      <Typography
                                        variant="body2"
                                        style={{ color: "#2196f3" }}
                                      >
                                        {entry.academicClassName}
                                      </Typography>
                                    )}
                                    {entry.divisionName && (
                                      <Typography
                                        variant="body2"
                                        style={{ color: "#3f51b5" }}
                                      >
                                        {`Division-${entry.divisionName}`}
                                      </Typography>
                                    )}
                                    {entry.batchName && (
                                      <Typography
                                        variant="body2"
                                        style={{ color: "#cc0066" }}
                                      >
                                        {entry.batchName}
                                      </Typography>
                                    )}
                                    {entry.staffName && (
                                      <Typography
                                        variant="body2"
                                        style={{ color: "#ff0000" }}
                                      >
                                        {entry.staffName}
                                      </Typography>
                                    )}
                                  </>
                                )}
                                {selectedTeacher && (
                                  <>
                                    {entry.subjectName && (
                                      <Typography
                                        variant="body2"
                                        style={{ color: "#4caf50" }}
                                      >
                                        {entry.subjectName}
                                      </Typography>
                                    )}
                                    {entry.academicClassName && (
                                      <Typography
                                        variant="body2"
                                        style={{ color: "#2196f3" }}
                                      >
                                        {entry.academicClassName}
                                      </Typography>
                                    )}
                                    {entry.divisionName && (
                                      <Typography
                                        variant="body2"
                                        style={{ color: "#3f51b5" }}
                                      >
                                        {`Division-${entry.divisionName}`}
                                      </Typography>
                                    )}
                                    {entry.batchName && (
                                      <Typography
                                        variant="body2"
                                        style={{ color: "#cc0066" }}
                                      >
                                        {entry.batchName}
                                      </Typography>
                                    )}
                                    {entry.locationName && (
                                      <Typography
                                        variant="body2"
                                        style={{ color: "#ff9800" }}
                                      >
                                        {entry.locationName}
                                      </Typography>
                                    )}
                                  </>
                                )}
                                {selectedDivision && entry.locationName && (
                                  <Typography
                                    variant="body2"
                                    style={{ color: "#ff9800" }}
                                  >
                                    {entry.locationName}
                                  </Typography>
                                )}

                                {index < entries.length - 1 && (
                                  <hr style={{ margin: "2px 0" }} />
                                )}
                              </div>
                            ));
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

              {/* Color legend */}
              <div
                style={{
                  marginTop: "20px",
                  padding: "10px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="body1"
                  style={{
                    backgroundColor: "#4caf50",
                    color: "white",
                    padding: "5px 10px",
                  }}
                >
                  SUBJECT
                </Typography>
                <Typography
                  variant="body1"
                  style={{
                    backgroundColor: "#2196f3",
                    color: "white",
                    padding: "5px 10px",
                  }}
                >
                  CLASS
                </Typography>
                <Typography
                  variant="body1"
                  style={{
                    backgroundColor: "#3f51b5",
                    color: "white",
                    padding: "5px 10px",
                  }}
                >
                  DIVISION
                </Typography>
                <Typography
                  variant="body1"
                  style={{
                    backgroundColor: "#cc0066",
                    color: "white",
                    padding: "5px 10px",
                  }}
                >
                  BATCH
                </Typography>
                <Typography
                  variant="body1"
                  style={{
                    backgroundColor: "#ff9800",
                    color: "white",
                    padding: "5px 10px",
                  }}
                >
                  LOCATION
                </Typography>
                <Typography
                  variant="body1"
                  style={{
                    backgroundColor: "#ff0000",
                    color: "white",
                    padding: "5px 10px",
                  }}
                >
                  TEACHER
                </Typography>
              </div>
            </>
          )}
      </div>
      <Button
        variant="contained"
        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
        onClick={downloadPDF}
        style={{
          display: "block", // ensures it takes up the full width of its container
          margin: "20px auto", // centers horizontally and adds vertical margins
        }}
      >
        Download Timetable
      </Button>
    </Container>
  );
};

export default Timetable;
