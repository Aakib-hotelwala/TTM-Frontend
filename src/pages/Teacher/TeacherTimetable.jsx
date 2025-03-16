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
import axios from "axios";

const TeacherTimetable = () => {
  const tableRef = useRef(null);
  const [facultyName, setFacultyName] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [days, setDays] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const { auth } = useContext(AuthContext);

<<<<<<< HEAD
=======
  // Fetch Programs on render
>>>>>>> f3720a8eda760786f9c548f3433fe02afdb4c15a
  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleProgramChange = (newValue) => {
    setSelectedProgram(newValue);
  };

  useEffect(() => {
    if (selectedProgram) {
      fetchDays();
      fetchTimeSlots(selectedProgram.programId);
      fetchTimetable(selectedProgram.programId);
    } else {
      setTimetable([]);
      setDays([]);
      setTimeSlots([]);
    }
  }, [selectedProgram]);

  const fetchPrograms = async () => {
    try {
      const response = await axios.get(
        `https://localhost:7073/api/Academic/programs?departmentId=${auth.departmentId}`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );
      setPrograms(response.data);
    } catch (error) {
      console.error("Error fetching programs:", error);
    }
  };

  const fetchTimetable = async (programId) => {
    try {
      const response = await axios.get(
        `https://localhost:7073/api/Timetable/getTimetable?userId=${auth.userId}&programId=${programId}`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      // Filter timetable entries where auth.fullName matches timetable.staffName
      const filteredData = response.data.filter(
        (entry) => entry.staffName === auth.fullName
      );

      setTimetable(filteredData);
    } catch (error) {
      console.error("Error fetching timetable:", error);
    }
  };

  const fetchDays = async () => {
    try {
      const response = await axios.get(
        "https://localhost:7073/api/Timetable/days",
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );
      console.log(response.data);
      setDays(response.data);
    } catch (error) {
      console.error("Error fetching days:", error);
    }
  };

  const fetchTimeSlots = async (programId) => {
    try {
      const response = await axios.get(
        `https://localhost:7073/api/Timetable/timeslots?programId=${programId}`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );
      setTimeSlots(response.data);
    } catch (error) {
      console.error("Error fetching time slots:", error);
    }
  };

  const uniqueValues = (key) => [
    ...new Set(timetable.map((entry) => entry[key])),
  ];

  useEffect(() => {
    const fetchTimetableDetails = async () => {
      try {
        const response = await axios.get(
          "https://localhost:7073/api/Timetable/getTimetable",
          {
            params: { userId: auth?.userId }, // Sending userId as a query parameter
            headers: {
              Authorization: `Bearer ${auth?.token}`,
            },
          }
        );

        const timetableData = response.data;

        if (timetableData?.length > 0) {
          const { facultyName, departmentName } = timetableData[0];

          setFacultyName(facultyName);
          setDepartmentName(departmentName);
        }
      } catch (error) {
        console.error(
          "Error fetching timetable data:",
          error.response?.data || error.message
        );
      }
    };

    if (auth?.userId && auth?.token) {
      fetchTimetableDetails();
    }
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
          { label: "Teacher", value: auth?.fullName },
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
        pdf.save(`Timetable.pdf`);
      };
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" fontWeight="bold">
        Timetable
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

      <div ref={tableRef}>
        {selectedProgram && (
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
                        const entries = timetable.filter(
                          (t) =>
                            t.dayId === day.dayId &&
                            t.timeSlotId === slot.timeSlotId
                        );

                        const renderContent = () => {
                          if (entries.length === 0) return "-";

                          return entries.map((entry, index) => (
                            <div key={index}>
                              {" "}
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

export default TeacherTimetable;
