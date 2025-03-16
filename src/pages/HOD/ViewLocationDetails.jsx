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

const ViewLocationDetailsHOD = () => {
  const { auth } = useContext(AuthContext);
  const [locationData, setLocationData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({
    key: "locationName",
    direction: "asc",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Filters
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  useEffect(() => {
    const fetchLocationDetails = async () => {
      try {
        const response = await axios.get(
          "https://localhost:7073/api/Location/location_details",
          {
            headers: {
              Authorization: `Bearer ${auth?.token}`,
            },
          }
        );
        setLocationData(response.data);
      } catch (error) {
        console.error("Error fetching location details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationDetails();
  }, [auth]);

  // Options for filters
  const locationOptions = [
    ...new Set(locationData.map((loc) => loc.locationName)),
  ];
  const facultyOptions = [
    ...new Set(locationData.map((loc) => loc.facultyName)),
  ];
  const departmentOptions = [
    ...new Set(locationData.map((loc) => loc.departmentName)),
  ];
  const buildingOptions = [
    ...new Set(locationData.map((loc) => loc.buildingName)),
  ];

  // Filter logic
  useEffect(() => {
    let filtered = locationData;

    if (selectedLocation) {
      filtered = filtered.filter(
        (loc) => loc.locationName === selectedLocation
      );
    }
    if (selectedFaculty) {
      filtered = filtered.filter((loc) => loc.facultyName === selectedFaculty);
    }
    if (selectedDepartment) {
      filtered = filtered.filter(
        (loc) => loc.departmentName === selectedDepartment
      );
    }
    if (selectedBuilding) {
      filtered = filtered.filter(
        (loc) => loc.buildingName === selectedBuilding
      );
    }

    setFilteredData(filtered);
    setPage(0); // Reset pagination on filter change
  }, [
    selectedLocation,
    selectedFaculty,
    selectedDepartment,
    selectedBuilding,
    locationData,
  ]);

  const handleSort = (key) => {
    const isAsc = sortConfig.key === key && sortConfig.direction === "asc";
    setSortConfig({ key, direction: isAsc ? "desc" : "asc" });

    const sortedData = [...locationData].sort((a, b) => {
      if (a[key] < b[key]) return isAsc ? -1 : 1;
      if (a[key] > b[key]) return isAsc ? 1 : -1;
      return 0;
    });

    setLocationData(sortedData);
  };

  const handleChangePage = (_, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const clearFilters = () => {
    setSelectedLocation(null);
    setSelectedFaculty(null);
    setSelectedDepartment(null);
    setSelectedBuilding(null);
  };

  const columns = [
    { key: "locationCode", label: "Location Code" },
    { key: "locationName", label: "Location" },
    { key: "buildingName", label: "Building" },
    { key: "floorNo", label: "Floor No" },
    { key: "description", label: "Description" },
    { key: "capacity", label: "Capacity" },
    { key: "facultyName", label: "Faculty" },
    { key: "departmentName", label: "Department" },
  ];

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map((loc, index) => ({
        "Sr. No": index + 1,
        "Location Code": loc.locationCode,
        Location: loc.locationName,
        Building: loc.buildingName,
        "Floor No": loc.floorNo,
        Description: loc.description,
        Capacity: loc.capacity,
        Faculty: loc.facultyName,
        Department: loc.departmentName,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Location Details");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(data, "Location_Details.xlsx");
  };

  return (
    <div>
      <Typography variant="h5" fontWeight="bold" mb={1}>
        Location Details
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
              label: "Select Location",
              value: selectedLocation,
              setter: setSelectedLocation,
              options: locationOptions,
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
              label: "Select Building",
              value: selectedBuilding,
              setter: setSelectedBuilding,
              options: buildingOptions,
            },
          ].map(({ label, value, setter, options }) => (
            <Autocomplete
              key={label}
              options={options}
              value={value}
              onChange={(_, newValue) => setter(newValue)}
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
          <Table>
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
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((loc, index) => (
                  <TableRow key={loc.locationId}>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    {columns.map((col) => (
                      <TableCell key={col.key}>
                        {loc[col.key] || "N/A"}
                      </TableCell>
                    ))}
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

export default ViewLocationDetailsHOD;
