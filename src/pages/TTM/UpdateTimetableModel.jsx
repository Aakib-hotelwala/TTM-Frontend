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

const UpdateTimetableModal = ({ open, onClose, initialData }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        timetableId: initialData._id || "",
        academicYearId: initialData.AcademicYearId?._id || null,
        facultyId1: initialData.FacultyId?._id || null,
        departmentId1: initialData.DeptId?._id || null,
        programId: initialData.ProgramId?._id || null,
        academicClassId: initialData.ClassId?._id || null,
        divisionId: initialData.DivId?._id || null,
        subjectId: initialData.SubjectId?._id || null,
        batchId: initialData.BatchId?._id || null,
        dayId: initialData.DayId?._id || null,
        timeSlotId: initialData.TimeSlotId?._id || null,
        staffId: initialData.StaffId?._id || null, // ✅ Ensure staffId is set
        locationId: initialData.LocationId?._id || null,
        facultyId2: null,
        departmentId2: null,
      });

      if (initialData.StaffId?._id) {
        fetchFacultyAndDepartment(initialData.StaffId._id);
      }
    }
  }, [initialData]);

  const fetchFacultyAndDepartment = async (staffId) => {
    try {
      console.log("Fetching staff details for StaffId:", staffId);
      const response = await axios.get(
        `${API_BASE_URL}/staffDetails/${staffId}`
      );

      if (!response.data || !response.data.UserId) {
        console.error("❌ No UserId found in staff details.");
        return;
      }

      const user = response.data.UserId; // Get the user object
      console.log("✅ Extracted UserId:", user._id);

      const userResponse = await axios.get(`${API_BASE_URL}/user/${user._id}`);
      console.log("User Details Response:", userResponse.data);

      if (!userResponse.data.FacultyId || !userResponse.data.DeptId) {
        console.error("❌ Faculty or Department not found.");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        facultyId2: userResponse.data.FacultyId._id,
        departmentId2: userResponse.data.DeptId._id,
        staffId: staffId, // ✅ Ensure staffId is updated
        fullName: userResponse.data.FullName, // ✅ Store FullName
      }));

      console.log("✅ Faculty:", userResponse.data.FacultyId.FacultyName);
      console.log("✅ Department:", userResponse.data.DeptId.DepartmentName);
      console.log("✅ Full Name:", userResponse.data.FullName);
    } catch (error) {
      console.error("❌ Error fetching staff details:", error);
    }
  };

  useEffect(() => {
    if (formData.facultyId2) {
      console.log("Fetching departments2 for facultyId2:", formData.facultyId2);
    }
  }, [formData.facultyId2]);

  useEffect(() => {
    if (initialData?.StaffId?._id) {
      console.log(
        "Fetching faculty and department for StaffId:",
        initialData.StaffId._id
      );
      fetchFacultyAndDepartment(initialData.StaffId._id);
    }
  }, [initialData]);

  useEffect(() => {
    if (formData.departmentId2) {
      console.log("Fetching staff for departmentId2:", formData.departmentId2);
    }
  }, [formData.departmentId2]);

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

  const handleChange = (key, value) => {
    setFormData((prev) => {
      const newFormData = { ...prev, [key]: value };

      // Clear child fields when a parent field changes
      if (key === "facultyId1") {
        newFormData.academicYearId = null;
        newFormData.departmentId1 = null;
        newFormData.programId = null;
        newFormData.academicClassId = null;
        newFormData.divisionId = null;
        newFormData.batchId = null;
        newFormData.subjectId = null;
        newFormData.timeSlotId = null;
        newFormData.locationId = null;
      } else if (key === "departmentId1") {
        newFormData.programId = null;
        newFormData.academicClassId = null;
        newFormData.divisionId = null;
        newFormData.batchId = null;
        newFormData.subjectId = null;
        newFormData.timeSlotId = null;
        newFormData.locationId = null;
      } else if (key === "programId") {
        newFormData.academicClassId = null;
        newFormData.divisionId = null;
        newFormData.batchId = null;
        newFormData.subjectId = null;
        newFormData.timeSlotId = null;
      } else if (key === "academicClassId") {
        newFormData.divisionId = null;
        newFormData.subjectId = null;
        newFormData.batchId = null;
      } else if (key === "divisionId") {
        newFormData.batchId = null;
      } else if (key === "facultyId2") {
        newFormData.departmentId2 = null;
        newFormData.staffId = null;
      } else if (key === "departmentId2") {
        newFormData.staffId = null;
      }

      return newFormData;
    });
  };

  const handleCancel = () => {
    setFormData({});
    onClose();
  };

  const handleUpdate = async () => {
    if (
      !formData.subjectId ||
      !formData.staffId ||
      !formData.locationId ||
      !formData.timeSlotId ||
      !formData.batchId ||
      !formData.divisionId ||
      !formData.programId ||
      !formData.departmentId1 ||
      !formData.facultyId1 ||
      !formData.academicYearId ||
      !formData.dayId ||
      !formData.academicClassId ||
      !formData.departmentId2 ||
      !formData.facultyId2
    ) {
      toast.error("Please fill in all the required fields.");
      return;
    }

    const timetableData = {
      SubjectId: formData.subjectId,
      StaffId: formData.staffId,
      LocationId: formData.locationId,
      TimeSlotId: formData.timeSlotId,
      BatchId: formData.batchId,
      DivId: formData.divisionId,
      ProgramId: formData.programId,
      DeptId: formData.departmentId1,
      FacultyId: formData.facultyId1,
      AcademicYearId: formData.academicYearId,
      DayId: formData.dayId,
      ClassId: formData.academicClassId,
      ActiveStatus: true,
      Deleted: false,
    };

    try {
      await axios.put(
        `${API_BASE_URL}/timetable/${formData.timetableId}`,
        timetableData
      );
      toast.success("Timetable updated successfully!");

      if (typeof onSubmit === "function") {
        onSubmit(); // ✅ Call the function only if it exists
      }

      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating timetable.");
    }
  };

  useEffect(() => {
    console.log("staffMembers:", staffMembers);
    console.log("Selected staffId:", formData.staffId);
    console.log(
      "Matching Staff:",
      staffMembers.find((staff) => staff._id === formData.staffId)
    );
  }, [staffMembers, formData.staffId]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{ "& .MuiDialog-paper": { width: "80%", maxWidth: "900px" } }}
    >
      <DialogTitle>Update Timetable</DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* First Column */}
          <Grid item xs={12} md={6}>
            {/* Faculty Dropdown */}
            <Box marginY={2}>
              <Autocomplete
                value={
                  faculties1?.find((f) => f._id === formData.facultyId1) || null
                }
                onChange={(e, newValue) =>
                  handleChange("facultyId1", newValue ? newValue._id : null)
                }
                options={faculties2 || []} // ✅ Ensure options is always an array
                getOptionLabel={(option) => option?.FacultyName || ""}
                renderInput={(params) => (
                  <TextField {...params} label="Select Faculty" />
                )}
              />
            </Box>

            {/* Department Dropdown */}
            <Box marginY={2}>
              <Autocomplete
                value={
                  departments1?.find((d) => d._id === formData.departmentId1) ||
                  null
                }
                onChange={(e, newValue) =>
                  handleChange("departmentId1", newValue ? newValue._id : null)
                }
                options={Array.isArray(departments1) ? departments1 : []} // ✅ Ensure it's always an array
                getOptionLabel={(option) => option?.DepartmentName ?? ""} // ✅ Handle undefined option safely
                renderInput={(params) => (
                  <TextField {...params} label="Select Department" />
                )}
                disabled={!formData.facultyId1} // ✅ Ensure it's disabled when no faculty is selected
              />
            </Box>

            {/* Academic Year Dropdown */}
            <Box marginY={2}>
              <Autocomplete
                value={
                  academicYears?.find(
                    (a) => a._id === formData.academicYearId
                  ) || null
                }
                onChange={(e, newValue) =>
                  handleChange("academicYearId", newValue ? newValue._id : null)
                }
                options={academicYears || []} // ✅ Ensure options is always an array
                getOptionLabel={(option) => option?.AcademicYearCode || ""}
                renderInput={(params) => (
                  <TextField {...params} label="Select AcademicYear" />
                )}
                disabled={!formData.facultyId1}
              />
            </Box>

            {/* Program Dropdown */}
            <Box marginY={2}>
              <Autocomplete
                value={
                  programs?.find((p) => p._id === formData.programId) || null
                }
                onChange={(e, newValue) =>
                  handleChange("programId", newValue ? newValue._id : null)
                }
                options={programs || []} // ✅ Ensure options is always an array
                getOptionLabel={(option) => option?.ProgramName || ""}
                renderInput={(params) => (
                  <TextField {...params} label="Select Program" />
                )}
                disabled={!formData.departmentId1}
              />
            </Box>

            {/* Class Dropdown */}
            <Box marginY={2}>
              <Autocomplete
                value={
                  Array.isArray(classes) &&
                  classes?.find((c) => c._id === formData.academicClassId)
                    ? classes.find((c) => c._id === formData.academicClassId)
                    : null
                }
                onChange={(e, newValue) =>
                  handleChange(
                    "academicClassId",
                    newValue ? newValue._id : null
                  )
                }
                options={Array.isArray(classes) ? classes : []} // Safely pass an empty array if classes is not an array
                getOptionLabel={(option) => option?.ClassName || ""}
                renderInput={(params) => (
                  <TextField {...params} label="Select Class" />
                )}
                disabled={!formData.programId}
              />
            </Box>

            {/* Division Dropdown */}
            <Box marginY={2}>
              <Autocomplete
                value={
                  Array.isArray(divisions) &&
                  divisions?.find((d) => d._id === formData.divisionId)
                    ? divisions.find((d) => d._id === formData.divisionId)
                    : null
                }
                onChange={(e, newValue) =>
                  handleChange("divisionId", newValue ? newValue._id : null)
                }
                options={Array.isArray(divisions) ? divisions : []} // Safely pass an empty array if divisions is not an array
                getOptionLabel={(option) => option?.DivisionName || ""}
                renderInput={(params) => (
                  <TextField {...params} label="Select Division" />
                )}
                disabled={!formData.academicClassId}
              />
            </Box>

            {/* Subject Dropdown */}
            <Box marginY={2}>
              <Autocomplete
                value={
                  Array.isArray(subjects) &&
                  subjects?.find((s) => s._id === formData.subjectId)
                    ? subjects.find((s) => s._id === formData.subjectId)
                    : null
                }
                onChange={(e, newValue) =>
                  handleChange("subjectId", newValue ? newValue._id : null)
                }
                options={Array.isArray(subjects) ? subjects : []} // Safely pass an empty array if subjects is not an array
                getOptionLabel={(option) => option?.SubjectName || ""}
                renderInput={(params) => (
                  <TextField {...params} label="Select Subject" />
                )}
                disabled={!formData.academicClassId}
              />
            </Box>

            {/* Batch Dropdown */}
            <Box marginY={2}>
              <Autocomplete
                value={
                  Array.isArray(batches) &&
                  batches?.find((b) => b._id === formData.batchId)
                    ? batches.find((b) => b._id === formData.batchId)
                    : null
                }
                onChange={(e, newValue) =>
                  handleChange("batchId", newValue ? newValue._id : null)
                }
                options={Array.isArray(batches) ? batches : []} // Safely pass an empty array if batches is not an array
                getOptionLabel={(option) => option?.BatchName || ""}
                renderInput={(params) => (
                  <TextField {...params} label="Select Batch" />
                )}
                disabled={!formData.divisionId}
              />
            </Box>

            {/* Day Dropdown */}
            <Box marginY={2}>
              <Autocomplete
                value={days?.find((d) => d._id === formData.dayId) || null} // Find the selected day using the _id
                onChange={(e, newValue) => {
                  handleChange("dayId", newValue ? newValue._id : null); // Update formData with the selected day _id
                }}
                options={days || []} // Ensure days is always an array
                getOptionLabel={(option) => option?.DayName || ""} // Safely access DayName
                renderInput={(params) => (
                  <TextField {...params} label="Select Day" />
                )}
              />
            </Box>

            {/* TimeSlot Dropdown */}
            <Box marginY={2}>
              <Autocomplete
                value={
                  timeSlots?.length > 0
                    ? timeSlots.find((t) => t._id === formData.timeSlotId) ||
                      null
                    : null
                }
                onChange={(e, newValue) =>
                  handleChange("timeSlotId", newValue ? newValue._id : null)
                }
                options={timeSlots}
                getOptionLabel={(option) => option?.SlotName || ""} // Correct property used for label
                renderInput={(params) => (
                  <TextField {...params} label="Select TimeSlot" />
                )}
                disabled={!formData.programId}
              />
            </Box>

            {/* Location Dropdown */}
            <Box marginY={2}>
              <Autocomplete
                value={
                  locations?.length > 0
                    ? locations.find((l) => l._id === formData.locationId) ||
                      null
                    : null
                }
                onChange={(e, newValue) =>
                  handleChange("locationId", newValue ? newValue._id : null)
                }
                options={locations}
                getOptionLabel={(option) => option?.LocationName || ""} // Correct property used for label
                renderInput={(params) => (
                  <TextField {...params} label="Select Location" />
                )}
                disabled={!formData.departmentId1}
              />
            </Box>
          </Grid>

          {/* Second Column - Selectable Faculty and Department */}
          <Grid item xs={12} md={6}>
            <Box marginY={2}>
              <Autocomplete
                value={
                  faculties2?.find((f) => f._id === formData.facultyId2) || null
                }
                onChange={(e, newValue) =>
                  handleChange("facultyId2", newValue ? newValue._id : null)
                }
                options={faculties2 || []}
                getOptionLabel={(option) => option?.FacultyName || ""}
                renderInput={(params) => (
                  <TextField {...params} label="Select Faculty" />
                )}
              />
            </Box>

            {/* Department Dropdown */}
            <Box marginY={2}>
              <Autocomplete
                value={
                  departments2?.find((d) => d._id === formData.departmentId2) ||
                  null
                }
                onChange={(e, newValue) =>
                  handleChange("departmentId2", newValue ? newValue._id : null)
                }
                options={departments2 || []}
                getOptionLabel={(option) => option?.DepartmentName || ""}
                renderInput={(params) => (
                  <TextField {...params} label="Select Department" />
                )}
                disabled={!formData.facultyId2}
              />
            </Box>

            {/* Teacher Dropdown */}
            <Box marginY={2}>
              <Autocomplete
                options={staffMembers}
                getOptionLabel={(option) => option.UserId?.FullName || ""} // ✅ Display FullName
                value={
                  staffMembers.find(
                    (staff) => staff._id === formData.staffId
                  ) || null
                } // ✅ Pre-select staff
                onChange={(event, newValue) => {
                  if (newValue) {
                    handleChange("staffId", newValue._id);
                    handleChange("fullName", newValue.UserId?.FullName || ""); // ✅ Store FullName
                  }
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Select Teacher" />
                )}
                disabled={!formData.departmentId2}
              />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button
          onClick={handleUpdate}
          variant="contained"
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
        >
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateTimetableModal;
