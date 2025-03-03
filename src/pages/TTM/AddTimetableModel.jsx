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
  Checkbox,
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
  const [persistFields, setPersistFields] = useState({});
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

        // Clear non-persistent fields after submit
        setFormData((prev) => {
          const updatedData = {};
          Object.keys(prev).forEach((key) => {
            updatedData[key] = persistFields[key] ? prev[key] : "";
          });
          return updatedData;
        });

        localStorage.setItem("formData", JSON.stringify(formData)); // Update local storage

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
    setFormData((prev) => {
      const updatedData = {};
      Object.keys(prev).forEach((key) => {
        updatedData[key] = persistFields[key] ? prev[key] : ""; // Retain value if checked
      });
      return updatedData;
    });
    localStorage.setItem("formData", JSON.stringify(formData)); // Persist changes
    onClose();
  };

  // Load persisted data (formData and persistFields) from localStorage on component mount
  useEffect(() => {
    const savedFormData = JSON.parse(localStorage.getItem("formData")) || {};
    const savedPersistFields =
      JSON.parse(localStorage.getItem("persistFields")) || {};

    setFormData(savedFormData);
    setPersistFields(savedPersistFields);
  }, []);

  // Save formData to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("formData", JSON.stringify(formData));
  }, [formData]);

  // Save persistFields to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("persistFields", JSON.stringify(persistFields));
  }, [persistFields]);

  const handleCheckboxChange = (key) => {
    setPersistFields((prev) => {
      const isChecked = !prev[key]; // Toggle checkbox state
      let updatedData = { ...formData };

      // Clear dependent fields when parent checkbox is unchecked
      const clearFields = {
        facultyId1: [
          "academicYearId",
          "departmentId1",
          "programId",
          "academicClassId",
          "divisionId",
          "subjectId",
          "batchId",
          "timeSlotId",
          "locationId",
        ],
        departmentId1: [
          "programId",
          "academicClassId",
          "divisionId",
          "subjectId",
          "batchId",
          "timeSlotId",
          "locationId",
        ],
        programId: [
          "academicClassId",
          "divisionId",
          "subjectId",
          "batchId",
          "timeSlotId",
        ],
        academicClassId: ["divisionId", "subjectId", "batchId"],
        divisionId: ["batchId"],
        facultyId2: ["departmentId2", "staffId"],
        departmentId2: ["staffId"],
      };

      if (!isChecked && clearFields[key]) {
        clearFields[key].forEach((field) => {
          updatedData[field] = null; // Clear dependent fields
        });
      }

      setFormData(updatedData); // Update form data

      return {
        ...prev,
        [key]: isChecked,
        ...(clearFields[key]?.reduce((acc, field) => {
          acc[field] = isChecked ? prev[field] : false; // Uncheck dependent checkboxes
          return acc;
        }, {}) || {}),
      };
    });
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
            <Box display="flex" alignItems="center" marginY={2} width="100%">
              <Checkbox
                checked={persistFields["facultyId1"] || false}
                onChange={() => handleCheckboxChange("facultyId1")}
              />
              <Box flexGrow={1} marginRight={1}>
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
                  options={faculties1 || []}
                  getOptionLabel={(option) => option?.facultyName || ""}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Faculty" fullWidth />
                  )}
                />
              </Box>
            </Box>

            {/* Department Dropdown */}
            <Box display="flex" alignItems="center" marginY={2} width="100%">
              <Checkbox
                checked={persistFields["departmentId1"] || false}
                onChange={() => handleCheckboxChange("departmentId1")}
                disabled={!persistFields["facultyId1"]} // Disable if parent unchecked
              />
              <Box flexGrow={1} marginRight={1}>
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
                  options={departments1 || []}
                  getOptionLabel={(option) => option?.departmentName || ""}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Department"
                      fullWidth
                    />
                  )}
                  disabled={!formData.facultyId1}
                />
              </Box>
            </Box>

            {/* Academic Year Dropdown */}
            <Box display="flex" alignItems="center" marginY={2} width="100%">
              <Checkbox
                checked={persistFields["academicYearId"] || false}
                onChange={() => handleCheckboxChange("academicYearId")}
                disabled={!persistFields["facultyId1"]}
              />
              <Box flexGrow={1} marginRight={1}>
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
                  options={academicYears || []}
                  getOptionLabel={(option) => option?.academicYearCode || ""}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Academic Year"
                      fullWidth
                    />
                  )}
                  disabled={!formData.facultyId1}
                />
              </Box>
            </Box>

            {/* Program Dropdown */}
            <Box display="flex" alignItems="center" marginY={2} width="100%">
              <Checkbox
                checked={persistFields["programId"] || false}
                onChange={() => handleCheckboxChange("programId")}
                disabled={!persistFields["departmentId1"]}
              />
              <Box flexGrow={1} marginRight={1}>
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
                  options={programs || []}
                  getOptionLabel={(option) => option?.programName || ""}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Program" fullWidth />
                  )}
                  disabled={!formData.departmentId1} // ✅ Disable if no department is selected
                />
              </Box>
            </Box>

            {/* Class Dropdown */}
            <Box display="flex" alignItems="center" marginY={2} width="100%">
              <Checkbox
                checked={persistFields["academicClassId"] || false}
                onChange={() => handleCheckboxChange("academicClassId")}
                disabled={!persistFields["programId"]}
              />
              <Box flexGrow={1} marginRight={1}>
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
                  options={Array.isArray(classes) ? classes : []}
                  getOptionLabel={(option) => option?.academicClassName ?? ""}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Class" fullWidth />
                  )}
                  disabled={!formData.programId} // ✅ Disable if no program is selected
                />
              </Box>
            </Box>

            {/* Division Dropdown */}
            <Box display="flex" alignItems="center" marginY={2} width="100%">
              <Checkbox
                checked={persistFields["divisionId"] || false}
                onChange={() => handleCheckboxChange("divisionId")}
                disabled={!persistFields["academicClassId"]}
              />
              <Box flexGrow={1} marginRight={1}>
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
                  options={Array.isArray(divisions) ? divisions : []}
                  getOptionLabel={(option) => option?.divisionName ?? ""}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Division" fullWidth />
                  )}
                  disabled={!formData.academicClassId} // ✅ Disable if no class is selected
                />
              </Box>
            </Box>

            {/* Subject Dropdown */}
            <Box display="flex" alignItems="center" marginY={2} width="100%">
              <Checkbox
                checked={persistFields["subjectId"] || false}
                onChange={() => handleCheckboxChange("subjectId")}
                disabled={!persistFields["academicClassId"]}
              />
              <Box flexGrow={1} marginRight={1}>
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
                  options={Array.isArray(subjects) ? subjects : []}
                  getOptionLabel={(option) => option?.subjectName ?? ""}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Subject" fullWidth />
                  )}
                  disabled={!formData.academicClassId} // ✅ Disable if no class is selected
                />
              </Box>
            </Box>

            {/* Batch Dropdown (Conditional) */}
            {isBatchEnabled && (
              <Box display="flex" alignItems="center" marginY={2} width="100%">
                <Checkbox
                  checked={persistFields["batchId"] || false}
                  onChange={() => handleCheckboxChange("batchId")}
                  disabled={!persistFields["divisionId"]}
                />
                <Box flexGrow={1} marginRight={1}>
                  <Autocomplete
                    value={
                      batches?.find((b) => b.batchId === formData.batchId) ||
                      null
                    }
                    onChange={(e, newValue) =>
                      handleChange(
                        "batchId",
                        newValue ? newValue.batchId : null
                      )
                    }
                    options={Array.isArray(batches) ? batches : []}
                    getOptionLabel={(option) => option?.batchName ?? ""}
                    renderInput={(params) => (
                      <TextField {...params} label="Select Batch" fullWidth />
                    )}
                  />
                </Box>
              </Box>
            )}

            {/* Day Dropdown */}
            <Box display="flex" alignItems="center" marginY={2} width="100%">
              <Checkbox
                checked={persistFields["dayId"] || false}
                onChange={() => handleCheckboxChange("dayId")}
              />
              <Box flexGrow={1} marginRight={1}>
                <Autocomplete
                  value={days?.find((d) => d.dayId === formData.dayId) || null}
                  onChange={(e, newValue) =>
                    handleChange("dayId", newValue ? newValue.dayId : null)
                  }
                  options={Array.isArray(days) ? days : []}
                  getOptionLabel={(option) => option?.dayName || ""}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Day" fullWidth />
                  )}
                />
              </Box>
            </Box>

            {/* TimeSlot Dropdown */}
            <Box display="flex" alignItems="center" marginY={2} width="100%">
              <Checkbox
                checked={persistFields["timeSlotId"] || false}
                onChange={() => handleCheckboxChange("timeSlotId")}
                disabled={!persistFields["programId"]}
              />
              <Box flexGrow={1} marginRight={1}>
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
                  options={Array.isArray(timeSlots) ? timeSlots : []}
                  getOptionLabel={(option) =>
                    option
                      ? `${option.timeslot}: ${option.fromTime}-${option.toTime}`
                      : ""
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Select TimeSlot" fullWidth />
                  )}
                  disabled={!formData.programId} // Disable if no program is selected
                />
              </Box>
            </Box>

            {/* Location Dropdown */}
            <Box display="flex" alignItems="center" marginY={2} width="100%">
              <Checkbox
                checked={persistFields["locationId"] || false}
                onChange={() => handleCheckboxChange("locationId")}
                disabled={!persistFields["timeSlotId"]}
              />
              <Box flexGrow={1} marginRight={1}>
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
                  options={Array.isArray(locations) ? locations : []}
                  getOptionLabel={(option) => option?.locationName ?? ""}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Location" fullWidth />
                  )}
                  disabled={!formData.departmentId1} // Disable if no department is selected
                />
              </Box>
            </Box>
          </Grid>

          {/* Second Column - Selectable Faculty and Department */}
          <Grid item xs={12} md={6}>
            {/* Faculty Dropdown */}
            <Box display="flex" alignItems="center" marginY={2} width="100%">
              <Checkbox
                checked={persistFields["facultyId2"] || false}
                onChange={() => handleCheckboxChange("facultyId2")}
              />
              <Box flexGrow={1} marginRight={1}>
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
                  options={faculties2 || []}
                  getOptionLabel={(option) => option?.facultyName || ""}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Faculty" fullWidth />
                  )}
                />
              </Box>
            </Box>

            {/* Department Dropdown */}
            <Box display="flex" alignItems="center" marginY={2} width="100%">
              <Checkbox
                checked={persistFields["departmentId2"] || false}
                onChange={() => handleCheckboxChange("departmentId2")}
                disabled={!persistFields["facultyId2"]}
              />
              <Box flexGrow={1} marginRight={1}>
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
                  options={Array.isArray(departments2) ? departments2 : []}
                  getOptionLabel={(option) => option?.departmentName ?? ""}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Department"
                      fullWidth
                    />
                  )}
                  disabled={!formData.facultyId2} // ✅ Disable if no faculty is selected
                />
              </Box>
            </Box>

            {/* Teacher Dropdown */}
            <Box display="flex" alignItems="center" marginY={2} width="100%">
              <Checkbox
                checked={persistFields["staffId"] || false}
                onChange={() => handleCheckboxChange("staffId")}
                disabled={!persistFields["departmentId2"]}
              />
              <Box flexGrow={1} marginRight={1}>
                <Autocomplete
                  value={
                    staffMembers?.find((s) => s.staffId === formData.staffId) ||
                    null
                  }
                  onChange={(e, newValue) =>
                    handleChange("staffId", newValue ? newValue.staffId : null)
                  }
                  options={Array.isArray(staffMembers) ? staffMembers : []}
                  getOptionLabel={(option) => option?.fullName ?? ""}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Teacher" fullWidth />
                  )}
                  disabled={!formData.departmentId2} // ✅ Disable if no faculty is selected
                />
              </Box>
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
