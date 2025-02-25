import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Autocomplete,
  Grid,
} from "@mui/material";
import toast from "react-hot-toast";

const API_BASE_URL = "https://localhost:7073/api";

// Define cache outside to persist across renders
const cache = {};

const useFetchData = (endpoint, dependencies = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!endpoint) return;

    if (cache[endpoint]) {
      setData(cache[endpoint]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/${endpoint}`);
        const extractedData = response.data?.data || response.data;
        cache[endpoint] = extractedData;
        setData(extractedData);
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        setData([]);
      }
      setLoading(false);
    };

    fetchData();
  }, dependencies);

  return { data, loading };
};

const AddTimetableModal = ({ open, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    academicYearId: initialData?.academicYearId || null,
    facultyId1: initialData?.facultyId1 || null,
    departmentId1: initialData?.departmentId1 || null,
    facultyId2: initialData?.facultyId2 || null,
    departmentId2: initialData?.departmentId2 || null,
    programId: initialData?.programId || null,
    academicClassId: initialData?.academicClassId || null,
    divisionId: initialData?.divisionId || null,
    subjectId: initialData?.subjectId || null,
    batchId: initialData?.batchId || null,
    dayId: initialData?.dayId || null,
    timeSlotId: initialData?.timeSlotId || null,
    staffId: initialData?.staffId || null,
    locationId: initialData?.locationId || null,
  });

  // Faculties-1:- Fetch faculties
  const { data: faculties1 } = useFetchData("Academic/Faculties");

  // Departments-1 Fetch departments based on selected faculty
  const { data: departments1 } = useFetchData(
    formData.facultyId1
      ? `Academic/departments?facultyId=${formData.facultyId1}`
      : null,
    [formData.facultyId1]
  );

  // Fetch academicYear based on selected faculty
  const { data: academicYears } = useFetchData(
    formData.facultyId1
      ? `Academic/current_academic_year?facultyId=${formData.facultyId1}`
      : null,
    [formData.facultyId1]
  );

  // Fetch programs based on selected department
  const { data: programs } = useFetchData(
    formData.departmentId1
      ? `Academic/programs?departmentId=${formData.departmentId1}`
      : null,
    [formData.departmentId1]
  );

  // Fetch Classes based on selected program
  const { data: classes } = useFetchData(
    formData.programId
      ? `Academic/classes?programId=${formData.programId}`
      : null,
    [formData.programId]
  );

  // Fetch division based on selected academicClass
  const { data: divisions } = useFetchData(
    formData.academicClassId
      ? `Division/divisions?academicClassId=${formData.academicClassId}`
      : null,
    [formData.academicClassId]
  );

  // Fetch subjects based on selected academicClass
  const { data: subjects } = useFetchData(
    formData.academicClassId
      ? `Academic/subjects?academicClassId=${formData.academicClassId}`
      : null,
    [formData.academicClassId] // ✅ Correct dependency
  );

  // Fetch batches based on selected division
  const { data: batches } = useFetchData(
    formData.divisionId
      ? `Division/batches?divisionId=${formData.divisionId}`
      : null,
    [formData.divisionId] // ✅ Correct dependency
  );

  // Find selected subject
  const selectedSubject = subjects?.find(
    (s) => s.subjectId === formData.subjectId
  );

  // Check if batch should be enabled (only if subjectTypeName is "Practical")
  const isBatchEnabled = selectedSubject?.subjectTypeName === "Practical";

  // Fetch Days
  const { data: days } = useFetchData("Timetable/days");

  // Fetch Classes based on selected program
  const { data: timeSlots } = useFetchData(
    formData.programId
      ? `Timetable/timeslots?programId=${formData.programId}`
      : null,
    [formData.programId]
  );

  // Fetch locations based on selected department
  const { data: locations } = useFetchData(
    formData.departmentId1
      ? `Location/locations?departmentId=${formData.departmentId1}`
      : null,
    [formData.departmentId1]
  );

  // Faculties-2:- Fetch faculties
  const { data: faculties2 } = useFetchData("Academic/Faculties");

  // Departments-2 Fetch departments based on selected faculty
  const { data: departments2 } = useFetchData(
    formData.facultyId2
      ? `Academic/departments?facultyId=${formData.facultyId2}`
      : null,
    [formData.facultyId2]
  );

  // Fetch Teachers based on selected Department
  const { data: staffMembers } = useFetchData(
    formData.departmentId2
      ? `Staff/teachers?departmentId=${formData.departmentId2}`
      : null,
    [formData.departmentId2]
  );

  const handleSubmit = async () => {
    const isPractical = selectedSubject?.subjectTypeName === "Practical";

    if (
      !formData.subjectId ||
      !formData.staffId ||
      !formData.locationId ||
      !formData.timeSlotId ||
      (!formData.batchId && isPractical) ||
      !formData.divisionId ||
      !formData.programId ||
      !formData.departmentId1 ||
      !formData.facultyId1 ||
      !formData.academicYearId ||
      !formData.dayId ||
      !formData.academicClassId
    ) {
      toast.error("Please fill in all the required fields.");
      return;
    }

    const timetableData = {
      academicYearId: formData.academicYearId,
      facultyId: formData.facultyId1,
      departmentId: formData.departmentId1,
      programId: formData.programId,
      academicClassId: formData.academicClassId,
      divisionId: formData.divisionId,
      subjectId: formData.subjectId,
      batchId: isPractical ? formData.batchId : null,
      dayId: formData.dayId,
      timeSlotId: formData.timeSlotId,
      staffId: formData.staffId,
      locationId: formData.locationId,
    };

    try {
      // Conflict checks
      const [divisionConflict, staffConflict, locationConflict] =
        await Promise.all([
          axios.post(`${API_BASE_URL}/Timetable/check-timeslot`, {
            divisionId: formData.divisionId,
            dayId: formData.dayId,
            timeSlotId: formData.timeSlotId,
            ...(isPractical && { batchId: formData.batchId }),
          }),
          axios.post(`${API_BASE_URL}/Timetable/check-staff`, {
            staffId: formData.staffId,
            dayId: formData.dayId,
            timeSlotId: formData.timeSlotId,
          }),
          axios.post(`${API_BASE_URL}/Timetable/check-location`, {
            locationId: formData.locationId,
            dayId: formData.dayId,
            timeSlotId: formData.timeSlotId,
          }),
        ]);

      if (divisionConflict.data?.conflict) {
        toast.error("Division or batch conflict detected!");
      }

      if (staffConflict.data?.conflict) {
        toast.error(
          "Staff conflict detected! This staff member is already scheduled."
        );
      }

      if (locationConflict.data?.conflict) {
        toast.error(
          "Location conflict detected! This room is already occupied."
        );
      }

      // Stop if any conflict is detected
      if (
        divisionConflict.data?.conflict ||
        staffConflict.data?.conflict ||
        locationConflict.data?.conflict
      ) {
        return;
      }

      // Insert timetable if no conflicts
      const response = await axios.post(
        `${API_BASE_URL}/Timetable/insert`,
        timetableData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        toast.success("Timetable created successfully!");
        onSubmit(response.data);
        onClose();
      }
    } catch (error) {
      console.error("Error during API request:", error);

      if (error.response) {
        toast.error(
          error.response.data?.message || "Failed to create timetable."
        );
      } else if (error.request) {
        toast.error("No response from server.");
      } else {
        toast.error("Unexpected error occurred.");
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      facultyId1: "",
      departmentId1: "",
      academicYearId: "",
      programId: "",
      academicClassId: "",
      divisionId: "",
      subjectId: "",
      batchId: "",
      dayId: "",
      timeSlotId: "",
      locationId: "",
      staffId: "",
      facultyId2: "",
      departmentId2: "",
    });

    onClose(); // Close the dialog
  };

  const handleChange = (key, value) => {
    setFormData((prev) => {
      let updatedData = { ...prev, [key]: value };

      if (key === "facultyId1") {
        updatedData = {
          ...updatedData,
          academicYearId: null,
          departmentId1: null,
          programId: null,
          academicClassId: null,
          divisionId: null,
          subjectId: null,
          batchId: null,
          timeSlotId: null,
          locationId: null,
        };
      } else if (key === "departmentId1") {
        updatedData = {
          ...updatedData,
          programId: null,
          academicClassId: null,
          divisionId: null,
          subjectId: null,
          batchId: null,
          timeSlotId: null,
          locationId: null,
        };
      } else if (key === "programId") {
        updatedData = {
          ...updatedData,
          academicClassId: null,
          divisionId: null,
          subjectId: null,
          batchId: null,
          timeSlotId: null,
        };
      } else if (key === "academicClassId") {
        updatedData = {
          ...updatedData,
          divisionId: null,
          subjectId: null,
          batchId: null,
        };
      } else if (key === "divisionId") {
        updatedData = {
          ...updatedData,
          batchId: null,
        };
      } else if (key === "facultyId2") {
        updatedData = {
          ...updatedData,
          departmentId2: null,
          staffId: null,
        };
      } else if (key === "departmentId2") {
        updatedData = {
          ...updatedData,
          staffId: null,
        };
      }

      return updatedData;
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{ "& .MuiDialog-paper": { width: "80%", maxWidth: "900px" } }}
    >
      <DialogTitle>
        {initialData ? "Edit Timetable" : "Add Timetable"}
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* First Column */}
          <Grid item xs={12} md={6}>
            {/* Faculty Dropdown */}
            <Box marginY={2}>
              <Autocomplete
                value={
                  faculties1?.find(
                    (f) => f.facultyId === formData.facultyId1
                  ) || null
                }
                onChange={(e, newValue) =>
                  handleChange(
                    "facultyId1",
                    newValue ? newValue.facultyId : null
                  )
                }
                options={faculties1 || []} // ✅ Use faculties1 instead of faculties2
                getOptionLabel={(option) => option?.facultyName || ""} // ✅ Use correct property names
                renderInput={(params) => (
                  <TextField {...params} label="Select Faculty" />
                )}
              />
            </Box>

            {/* Department Dropdown */}
            <Box marginY={2}>
              <Autocomplete
                value={
                  departments1?.find(
                    (d) => d.departmentId === formData.departmentId1
                  ) || null
                }
                onChange={(e, newValue) =>
                  handleChange(
                    "departmentId1",
                    newValue ? newValue.departmentId : null
                  )
                }
                options={Array.isArray(departments1) ? departments1 : []} // ✅ Ensure it's always an array
                getOptionLabel={(option) => option?.departmentName ?? ""} // ✅ Use correct property names
                renderInput={(params) => (
                  <TextField {...params} label="Select Department" />
                )}
                disabled={!formData.facultyId1} // ✅ Disable if no faculty is selected
              />
            </Box>

            {/* Academic Year Dropdown */}
            <Box marginY={2}>
              <Autocomplete
                value={
                  academicYears?.find(
                    (a) => a.academicYearId === formData.academicYearId
                  ) || null
                }
                onChange={(e, newValue) =>
                  handleChange(
                    "academicYearId",
                    newValue ? newValue.academicYearId : null
                  )
                }
                options={Array.isArray(academicYears) ? academicYears : []} // ✅ Ensure it's always an array
                getOptionLabel={(option) => option?.academicYearCode ?? ""} // ✅ Use correct property names
                renderInput={(params) => (
                  <TextField {...params} label="Select Academic Year" />
                )}
                disabled={!formData.facultyId1} // ✅ Disable if no faculty is selected
              />
            </Box>

            {/* Program Dropdown */}
            <Box marginY={2}>
              <Autocomplete
                value={
                  programs?.find((p) => p.programId === formData.programId) ||
                  null
                }
                onChange={(e, newValue) =>
                  handleChange(
                    "programId",
                    newValue ? newValue.programId : null
                  )
                }
                options={Array.isArray(programs) ? programs : []} // ✅ Ensure it's always an array
                getOptionLabel={(option) => option?.programName ?? ""} // ✅ Use correct property names
                renderInput={(params) => (
                  <TextField {...params} label="Select Program" />
                )}
                disabled={!formData.departmentId1} // ✅ Disable if no department is selected
              />
            </Box>

            {/* Class Dropdown */}
            <Box marginY={2}>
              <Autocomplete
                value={
                  classes?.find(
                    (c) => c.academicClassId === formData.academicClassId
                  ) || null
                }
                onChange={(e, newValue) =>
                  handleChange(
                    "academicClassId",
                    newValue ? newValue.academicClassId : null
                  )
                }
                options={Array.isArray(classes) ? classes : []} // ✅ Ensure it's always an array
                getOptionLabel={(option) => option?.academicClassName ?? ""} // ✅ Use correct property names
                renderInput={(params) => (
                  <TextField {...params} label="Select Class" />
                )}
                disabled={!formData.programId} // ✅ Disable if no program is selected
              />
            </Box>

            {/* Division Dropdown */}
            <Box marginY={2}>
              <Autocomplete
                value={
                  divisions?.find(
                    (d) => d.divisionId === formData.divisionId
                  ) || null
                }
                onChange={(e, newValue) =>
                  handleChange(
                    "divisionId",
                    newValue ? newValue.divisionId : null
                  )
                }
                options={Array.isArray(divisions) ? divisions : []} // ✅ Ensure it's always an array
                getOptionLabel={(option) => option?.divisionName ?? ""} // ✅ Use correct property names
                renderInput={(params) => (
                  <TextField {...params} label="Select Division" />
                )}
                disabled={!formData.academicClassId} // ✅ Disable if no class is selected
              />
            </Box>

            {/* Subject Dropdown */}
            <Box marginY={2}>
              <Autocomplete
                value={
                  subjects?.find((s) => s.subjectId === formData.subjectId) ||
                  null
                }
                onChange={(e, newValue) =>
                  handleChange(
                    "subjectId",
                    newValue ? newValue.subjectId : null
                  )
                }
                options={Array.isArray(subjects) ? subjects : []} // ✅ Ensure it's always an array
                getOptionLabel={(option) => option?.subjectName ?? ""} // ✅ Use correct property names
                renderInput={(params) => (
                  <TextField {...params} label="Select Subject" />
                )}
                disabled={!formData.academicClassId} // ✅ Disable if no class is selected
              />
            </Box>

            {/* Batch Dropdown */}
            {/* Show Batch Dropdown only if subjectTypeName is "Practical" */}
            {isBatchEnabled && (
              <Box marginY={2}>
                <Autocomplete
                  value={
                    batches?.find((b) => b.batchId === formData.batchId) || null
                  }
                  onChange={(e, newValue) =>
                    handleChange("batchId", newValue ? newValue.batchId : null)
                  }
                  options={Array.isArray(batches) ? batches : []} // ✅ Ensure it's always an array
                  getOptionLabel={(option) => option?.batchName ?? ""} // ✅ Use correct property names
                  renderInput={(params) => (
                    <TextField {...params} label="Select Batch" />
                  )}
                />
              </Box>
            )}

            {/* Day Dropdown */}
            <Box marginY={2}>
              <Autocomplete
                value={days?.find((d) => d.dayId === formData.dayId) || null}
                onChange={(e, newValue) =>
                  handleChange("dayId", newValue ? newValue.dayId : null)
                }
                options={days || []} //
                getOptionLabel={(option) => option?.dayName || ""} // ✅ Use correct property names
                renderInput={(params) => (
                  <TextField {...params} label="Select Day" />
                )}
              />
            </Box>

            {/* TimeSlot Dropdown */}
            <Box marginY={2}>
              <Autocomplete
                value={
                  timeSlots?.find(
                    (t) => t.timeSlotId === formData.timeSlotId
                  ) || null
                }
                onChange={(e, newValue) =>
                  handleChange(
                    "timeSlotId",
                    newValue ? newValue.timeSlotId : null
                  )
                }
                options={Array.isArray(timeSlots) ? timeSlots : []} // Ensure it's always an array
                getOptionLabel={(option) =>
                  option
                    ? `${option.timeslot}:- ${option.fromTime}-${option.toTime}`
                    : ""
                } // Properly format the label
                renderInput={(params) => (
                  <TextField {...params} label="Select TimeSlot" />
                )}
                disabled={!formData.programId} // Disable if no program is selected
              />
            </Box>

            {/* Location Dropdown */}
            <Box marginY={2}>
              <Autocomplete
                value={
                  locations?.find(
                    (l) => l.locationId === formData.locationId
                  ) || null
                }
                onChange={(e, newValue) =>
                  handleChange(
                    "locationId",
                    newValue ? newValue.locationId : null
                  )
                }
                options={Array.isArray(locations) ? locations : []} // Ensure it's always an array
                getOptionLabel={(option) => option?.locationName ?? ""} // ✅ Use correct property names
                renderInput={(params) => (
                  <TextField {...params} label="Select Location" />
                )}
                disabled={!formData.departmentId1} // Disable if no department is selected
              />
            </Box>
          </Grid>

          {/* Second Column - Selectable Faculty and Department */}
          <Grid item xs={12} md={6}>
            {/* Faculty Dropdown */}
            <Box marginY={2}>
              <Autocomplete
                value={
                  faculties2?.find(
                    (f) => f.facultyId === formData.facultyId2
                  ) || null
                }
                onChange={(e, newValue) =>
                  handleChange(
                    "facultyId2",
                    newValue ? newValue.facultyId : null
                  )
                }
                options={faculties2 || []} // ✅ Use faculties2 instead of faculties1
                getOptionLabel={(option) => option?.facultyName || ""} // ✅ Use correct property names
                renderInput={(params) => (
                  <TextField {...params} label="Select Faculty" />
                )}
              />
            </Box>

            {/* Department Dropdown */}
            <Box marginY={2}>
              <Autocomplete
                value={
                  departments2?.find(
                    (d) => d.departmentId === formData.departmentId2
                  ) || null
                }
                onChange={(e, newValue) =>
                  handleChange(
                    "departmentId2",
                    newValue ? newValue.departmentId : null
                  )
                }
                options={Array.isArray(departments2) ? departments2 : []} // ✅ Ensure it's always an array
                getOptionLabel={(option) => option?.departmentName ?? ""} // ✅ Use correct property names
                renderInput={(params) => (
                  <TextField {...params} label="Select Department" />
                )}
                disabled={!formData.facultyId2} // ✅ Disable if no faculty is selected
              />
            </Box>

            {/* Teacher Dropdown */}
            <Box marginY={2}>
              <Autocomplete
                value={
                  staffMembers?.find((s) => s.staffId === formData.staffId) ||
                  null
                }
                onChange={(e, newValue) =>
                  handleChange("staffId", newValue ? newValue.staffId : null)
                }
                options={Array.isArray(staffMembers) ? staffMembers : []} // ✅ Ensure it's always an array
                getOptionLabel={(option) => option?.fullName ?? ""} // ✅ Use correct property names
                renderInput={(params) => (
                  <TextField {...params} label="Select Teacher" />
                )}
                disabled={!formData.departmentId2} // ✅ Disable if no faculty is selected
              />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTimetableModal;
