import React, { useContext, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  TableSortLabel,
  TablePagination,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ViewTeacherDetailsHOD = () => {
  const { auth } = useContext(AuthContext);
  const [filteredData, setFilteredData] = useState([]);
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({
    key: "fullName",
    direction: "asc",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  useEffect(() => {
    const fetchStaffDetails = async () => {
      try {
        const response = await axios.get(
          "https://localhost:7073/api/Academic/staff_details",
          {
            headers: {
              Authorization: `Bearer ${auth?.token}`,
            },
          }
        );
        setStaffData(response.data);
      } catch (error) {
        console.error("Error fetching staff details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffDetails();
  }, [auth]);

  const teacherOptions = [...new Set(staffData.map((staff) => staff.fullName))];
  const facultyOptions = [
    ...new Set(staffData.map((staff) => staff.facultyName)),
  ];
  const departmentOptions = [
    ...new Set(staffData.map((staff) => staff.departmentName)),
  ];
  const subjectOptions = [
    ...new Set(
      staffData.flatMap((staff) =>
        staff.subjects ? staff.subjects.split(",").map((s) => s.trim()) : []
      )
    ),
  ];

  // Filter logic
  useEffect(() => {
    let filtered = staffData;

    if (selectedTeacher) {
      filtered = filtered.filter((staff) => staff.fullName === selectedTeacher);
    }
    if (selectedFaculty) {
      filtered = filtered.filter(
        (staff) => staff.facultyName === selectedFaculty
      );
    }
    if (selectedDepartment) {
      filtered = filtered.filter(
        (staff) => staff.departmentName === selectedDepartment
      );
    }
    if (selectedSubject) {
      filtered = filtered.filter((staff) =>
        staff.subjects
          ?.split(",")
          .map((s) => s.trim())
          .includes(selectedSubject)
      );
    }

    setFilteredData(filtered);
    setPage(0); // Reset pagination on filter change
  }, [
    selectedTeacher,
    selectedFaculty,
    selectedDepartment,
    selectedSubject,
    staffData,
  ]);

  const handleSort = (key) => {
    const isAsc = sortConfig.key === key && sortConfig.direction === "asc";
    setSortConfig({ key, direction: isAsc ? "desc" : "asc" });

    const sortedData = [...staffData].sort((a, b) => {
      if (a[key] < b[key]) return isAsc ? -1 : 1;
      if (a[key] > b[key]) return isAsc ? 1 : -1;
      return 0;
    });

    setStaffData(sortedData);
  };

  const handleChangePage = (_, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const clearFilters = () => {
    setSelectedTeacher(null);
    setSelectedDepartment(null);
    setSelectedFaculty(null);
    setSelectedSubject(null);
  };

  const columns = [
    { key: "fullName", label: "Full Name" },
    { key: "designation", label: "Designation" },
    { key: "qualification", label: "Qualification" },
    { key: "phoneNumber", label: "Phone No." },
    { key: "email", label: "Email" },
    { key: "facultyName", label: "Faculty" },
    { key: "departmentName", label: "Department" },
    { key: "subjects", label: "Subjects" },
  ];

  // Remove duplicate subjects
  const getUniqueSubjects = (subjects) => {
    if (!subjects) return "N/A";
    const subjectList = subjects.split(",").map((s) => s.trim());
    const uniqueSubjects = [...new Set(subjectList)];
    return uniqueSubjects.join(", ");
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map((staff, index) => ({
        "Sr. No": index + 1,
        "Full Name": staff.fullName || "N/A",
        Designation: staff.designation || "N/A",
        Qualification: staff.qualification || "N/A",
        "Phone No.": staff.phoneNumber || "N/A",
        Email: staff.email || "N/A",
        Faculty: staff.facultyName || "N/A",
        Department: staff.departmentName || "N/A",
        Subjects: getUniqueSubjects(staff.subjects),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Staff Details");

    // Generate and trigger download
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(data, "Staff_Details.xlsx");
  };

  return (
    <div>
      <Typography variant="h5" fontWeight="bold" mb={1}>
        Staff Details
      </Typography>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box display="flex" gap={2} alignItems="center">
          <Button
            variant="contained"
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
          {[
            {
              label: "Select Teacher",
              value: selectedTeacher,
              setter: setSelectedTeacher,
              options: teacherOptions,
            },
            {
              label: "Select Faculty",
              value: selectedFaculty,
              setter: setSelectedFaculty,
              options: facultyOptions,
            },
            {
              label: "Select Department",
              value: selectedDepartment,
              setter: setSelectedDepartment,
              options: departmentOptions,
            },
            {
              label: "Select Subject",
              value: selectedSubject,
              setter: setSelectedSubject,
              options: subjectOptions,
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
          Download
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
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell align="center">Sr. No</TableCell>
                {columns.map((col) => (
                  <TableCell key={col.key} align="center">
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
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((staff, index) => (
                  <TableRow key={staff.staffId}>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{staff.fullName || "N/A"}</TableCell>
                    <TableCell>{staff.designation || "N/A"}</TableCell>
                    <TableCell>{staff.qualification || "N/A"}</TableCell>
                    <TableCell>{staff.phoneNumber || "N/A"}</TableCell>
                    <TableCell>{staff.email || "N/A"}</TableCell>
                    <TableCell>{staff.facultyName || "N/A"}</TableCell>
                    <TableCell>{staff.departmentName || "N/A"}</TableCell>
                    <TableCell>{getUniqueSubjects(staff.subjects)}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredData.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </TableContainer>
      )}
    </div>
  );
};

export default ViewTeacherDetailsHOD;
