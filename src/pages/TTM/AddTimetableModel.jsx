import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
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
const useFetchData = (endpoint, dependencies = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!endpoint) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/${endpoint}`);
      const extractedData = response.data?.data || response.data;
      setData(extractedData);
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      setData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, refetch: fetchData }; // Add a refetch method
};

const AddTimetableModal = ({ open, onClose, onSubmit, initialData }) => {
  const { auth } = useContext(AuthContext); // Get facultyId and departmentId from auth context
  const [persistFields, setPersistFields] = useState({});
  const [availableLocations, setAvailableLocations] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  // Fetch all faculties
  const { data: allFaculties, loading: facultiesLoading } =
    useFetchData("Academic/Faculties");

  // Get the user's faculty
  const faculties1 = allFaculties?.filter(
    (faculty) => faculty.facultyId === auth?.facultyId
  );

  // Fetch departments by the user's facultyId
  const { data: departments1, loading: departmentsLoading } = useFetchData(
    auth?.facultyId ? `Academic/departments?facultyId=${auth.facultyId}` : null,
    [auth?.facultyId]
  );

  // Get the user's department from the filtered departments
  const userDepartment = departments1?.find(
    (department) => department.departmentId === auth?.departmentId
  );

  // State to manage form data, initialized with existing data or defaults
  const [formData, setFormData] = useState({
    academicYearId: initialData?.academicYearId || null,
    facultyId1: faculties1?.[0]?.facultyId || null, // Prefill with user's faculty
    departmentId1: userDepartment?.departmentId || null, // Prefill with user's department
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

  // Just for Checking Purpose: Effect to update form data when faculty or department changes
  useEffect(() => {
    setFormData((prev) => {
      const newFacultyId = faculties1?.[0]?.facultyId || null;
      const newDepartmentId = userDepartment?.departmentId || null;

      // Only update if values are different
      if (
        prev.facultyId1 !== newFacultyId ||
        prev.departmentId1 !== newDepartmentId
      ) {
        return {
          ...prev,
          facultyId1: newFacultyId,
          departmentId1: newDepartmentId,
        };
      }
      return prev; // no change, so don't trigger re-render
    });
  }, [faculties1, userDepartment]);

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

  // Fetch all time slots based on selected program
  const { data: allTimeSlots, loading: loadingTimeSlots } = useFetchData(
    formData.programId
      ? `Timetable/timeslots?programId=${formData.programId}`
      : null,
    [formData.programId]
  );

  const {
    data: timetableData,
    loading: loadingTimetable,
    refetch: refetchTimetable,
  } = useFetchData(
    auth.userId ? `Timetable/getTimetable?userId=${auth.userId}` : null,
    [auth.userId]
  );

  useEffect(() => {
    console.log("All Time Slots:", allTimeSlots);
    console.log("Timetable Data:", timetableData);

    if (!Array.isArray(allTimeSlots) || allTimeSlots.length === 0) {
      setAvailableTimeSlots([]);
      return;
    }

    if (!Array.isArray(timetableData)) {
      console.error("Invalid timetable data:", timetableData);
      setAvailableTimeSlots([]);
      return;
    }

    // Ensure required fields are selected
    if (!formData.dayId || (!formData.divisionId && !formData.batchId)) {
      setAvailableTimeSlots(allTimeSlots); // Show all slots if required fields are missing
      return;
    }

    // Determine whether to filter by batch or division
    const isPractical = selectedSubject?.subjectTypeName === "Practical";

    // Get occupied time slots based on batch for practicals or division for others
    const occupiedTimeSlotIds = timetableData
      .filter((entry) => {
        if (isPractical) {
          return (
            entry.batchId === formData.batchId && entry.dayId === formData.dayId
          );
        } else {
          return (
            entry.divisionId === formData.divisionId &&
            entry.dayId === formData.dayId
          );
        }
      })
      .map((entry) => entry.timeSlotId);

    console.log(
      isPractical
        ? "Occupied Time Slot IDs for Batch & Day:"
        : "Occupied Time Slot IDs for Division & Day:",
      occupiedTimeSlotIds
    );

    // Filter available time slots
    const nonConflictingTimeSlots = allTimeSlots.filter(
      (timeSlot) => !occupiedTimeSlotIds.includes(timeSlot.timeSlotId)
    );

    console.log("Filtered Available Time Slots:", nonConflictingTimeSlots);

    setAvailableTimeSlots(nonConflictingTimeSlots);
  }, [
    allTimeSlots,
    timetableData,
    formData.divisionId,
    formData.dayId,
    formData.batchId,
    selectedSubject,
  ]);

  useEffect(() => {
    const fetchAvailableLocations = async () => {
      if (formData.departmentId1) {
        try {
          // Fetch locations based on selected department
          const { data: locations } = await axios.get(
            `${API_BASE_URL}/Location/locations?departmentId=${formData.departmentId1}`
          );

          if (formData.dayId && formData.timeSlotId) {
            // Check conflicts for each location
            const conflictPromises = locations.map((location) =>
              axios.post(`${API_BASE_URL}/Timetable/check-location`, {
                dayId: formData.dayId,
                timeSlotId: formData.timeSlotId,
                locationId: location.locationId,
              })
            );

            const conflictResults = await Promise.all(conflictPromises);

            // Filter out only locations with conflict === true
            const availableLocations = locations.filter(
              (location, index) => !conflictResults[index].data.conflict
            );

            setAvailableLocations(availableLocations);
          } else {
            setAvailableLocations(locations); // Show all if day/timeslot not selected
          }
        } catch (error) {
          console.error("Error fetching available locations:", error);
          setAvailableLocations([]);
        }
      } else {
        setAvailableLocations([]); // Clear if no department selected
      }
    };

    fetchAvailableLocations();
  }, [formData.departmentId1, formData.dayId, formData.timeSlotId]);

  // Faculties-2:- Fetch faculties
  const { data: faculties2 } = useFetchData("Academic/Faculties");

  // Departments-2 Fetch departments based on selected faculty
  const { data: departments2 } = useFetchData(
    formData.facultyId2
      ? `Academic/departments?facultyId=${formData.facultyId2}`
      : null,
    [formData.facultyId2]
  );

  // Fetch teachers based on selected department and filter conflicts
  useEffect(() => {
    const fetchAvailableTeachers = async () => {
      if (!formData.departmentId2) {
        setAvailableTeachers([]);
        return;
      }

      try {
        // Fetch teachers based on department
        const { data: staffMembers } = await axios.get(
          `${API_BASE_URL}/Staff/teachers?departmentId=${formData.departmentId2}`
        );

        if (formData.dayId && formData.timeSlotId) {
          // Check each teacher for conflicts
          const conflictPromises = staffMembers.map((teacher) =>
            axios.post(`${API_BASE_URL}/Timetable/check-staff`, {
              dayId: formData.dayId,
              timeSlotId: formData.timeSlotId,
              staffId: teacher.staffId,
            })
          );

          const conflictResults = await Promise.all(conflictPromises);

          // Filter out teachers with conflicts
          const availableTeachers = staffMembers.filter(
            (_, index) => !conflictResults[index]?.data?.conflict
          );

          setAvailableTeachers(availableTeachers);
        } else {
          setAvailableTeachers(staffMembers); // Show all teachers if no day/timeslot selected
        }
      } catch (error) {
        console.error("Error fetching available teachers:", error);
      }
    };

    fetchAvailableTeachers();
  }, [formData.departmentId2, formData.dayId, formData.timeSlotId]);

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
      // // Conflict checks
      // const [divisionConflict, staffConflict, locationConflict] =
      //   await Promise.all([
      //     axios.post(`${API_BASE_URL}/Timetable/check-timeslot`, {
      //       divisionId: formData.divisionId,
      //       dayId: formData.dayId,
      //       timeSlotId: formData.timeSlotId,
      //       ...(isPractical && { batchId: formData.batchId }),
      //     }),
      //     axios.post(`${API_BASE_URL}/Timetable/check-staff`, {
      //       staffId: formData.staffId,
      //       dayId: formData.dayId,
      //       timeSlotId: formData.timeSlotId,
      //     }),
      //     axios.post(`${API_BASE_URL}/Timetable/check-location`, {
      //       locationId: formData.locationId,
      //       dayId: formData.dayId,
      //       timeSlotId: formData.timeSlotId,
      //     }),
      //   ]);

      // if (divisionConflict.data?.conflict) {
      //   toast.error("Division or batch conflict detected!");
      // }

      // if (staffConflict.data?.conflict) {
      //   toast.error(
      //     "Teacher conflict detected! This Teacher is already scheduled."
      //   );
      // }

      // if (locationConflict.data?.conflict) {
      //   toast.error(
      //     "Location conflict detected! This Location is already occupied."
      //   );
      // }

      // // Stop if any conflict is detected
      // if (
      //   divisionConflict.data?.conflict ||
      //   staffConflict.data?.conflict ||
      //   locationConflict.data?.conflict
      // ) {
      //   return;
      // }

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
            updatedData[key] = persistFields[key] ? prev[key] : ""; // Clear non-persistent fields
          });

          // Ensure timeSlotId is explicitly cleared
          setPersistFields((prev) => ({
            ...prev,
            divisionId: false,
            batchId: false,
            timeSlotId: false,
            staffId: false,
            locationId: false,
          }));

          // Clear their values from form data
          setFormData((prev) => ({
            ...prev,
            divisionId: "",
            batchId: "",
            timeSlotId: "",
            staffId: "",
            locationId: "",
          }));

          updatedData["divisionId"] = "";
          updatedData["batchId"] = "";
          updatedData["timeSlotId"] = "";
          updatedData["locationId"] = "";
          updatedData["staffId"] = "";

          return updatedData;
        });
        refetchTimetable();

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

  const handleChange = async (key, value) => {
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
          timeSlotId: null,
          batchId: null,
        };
      } else if (key === "batchId") {
        updatedData = {
          ...updatedData,
          timeSlotId: null,
        };
      } else if (key === "timeSlotId") {
        updatedData = {
          ...updatedData,
          locationId: null,
          staffId: null,
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
      <DialogTitle>{"Add Timetable"}</DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* First Column */}
          <Grid item xs={12} md={6}>
            {/* Faculty Dropdown (pre-selected and disabled) */}
            <Box display="flex" alignItems="center" marginY={2} width="100%">
              <Box flexGrow={1} marginRight={1}>
                <Autocomplete
                  value={faculties1?.[0] || null} // pre-select user's faculty
                  options={faculties1 || []}
                  getOptionLabel={(option) => option?.facultyName || ""}
                  renderInput={(params) => (
                    <TextField {...params} label="Faculty" fullWidth disabled />
                  )}
                  disabled // keep dropdown disabled
                />
              </Box>
            </Box>

            {/* Department Dropdown (pre-selected and disabled) */}
            <Box display="flex" alignItems="center" marginY={2} width="100%">
              <Box flexGrow={1} marginRight={1}>
                <Autocomplete
                  value={userDepartment || null} // pre-select user's department
                  options={departments1 || []}
                  getOptionLabel={(option) => option?.departmentName || ""}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Department"
                      fullWidth
                      disabled
                    />
                  )}
                  disabled // keep dropdown disabled
                />
              </Box>
            </Box>

            {/* Academic Year Dropdown */}
            <Box display="flex" alignItems="center" marginY={2} width="100%">
              <Checkbox
                checked={!!persistFields["academicYearId"] || false}
                onChange={() => handleCheckboxChange("academicYearId")}
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
                checked={!!persistFields["programId"] || false}
                onChange={() => handleCheckboxChange("programId")}
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
                checked={!!persistFields["academicClassId"] || false}
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
                checked={!!persistFields["divisionId"] || false}
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
                checked={!!persistFields["subjectId"] || false}
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
                  checked={!!persistFields["batchId"] || false}
                  onChange={() => handleCheckboxChange("batchId")}
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
          </Grid>

          {/* Second Column - Selectable Faculty and Department */}
          <Grid item xs={12} md={6}>
            {/* Day Dropdown */}
            <Box display="flex" alignItems="center" marginY={2} width="100%">
              <Checkbox
                checked={!!persistFields["dayId"] || false}
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
                checked={!!persistFields["timeSlotId"]}
                onChange={() => handleCheckboxChange("timeSlotId")}
                disabled={!persistFields["programId"]}
              />
              <Box flexGrow={1} marginRight={1}>
                <Autocomplete
                  value={
                    availableTimeSlots?.find(
                      (slot) => slot.timeSlotId === formData.timeSlotId
                    ) || null
                  }
                  onChange={(e, newValue) =>
                    handleChange(
                      "timeSlotId",
                      newValue ? newValue.timeSlotId : null
                    )
                  }
                  options={
                    Array.isArray(availableTimeSlots) ? availableTimeSlots : []
                  }
                  getOptionLabel={(option) =>
                    option?.timeslot
                      ? `${option.timeslot}: ${option.fromTime}-${option.toTime}`
                      : ""
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Select TimeSlot" fullWidth />
                  )}
                  disabled={
                    !formData.programId ||
                    (formData.subjectType === "practical" &&
                      !formData.batchId) ||
                    (formData.subjectType !== "practical" &&
                      !formData.divisionId)
                  }
                />
              </Box>
            </Box>

            {/* Location Dropdown */}
            <Box display="flex" alignItems="center" marginY={2} width="100%">
              <Checkbox
                checked={!!persistFields["locationId"] || false}
                onChange={() => handleCheckboxChange("locationId")}
              />
              <Box flexGrow={1} marginRight={1}>
                <Autocomplete
                  value={
                    availableLocations.find(
                      (l) => l.locationId === formData.locationId
                    ) || null
                  }
                  onChange={(e, newValue) =>
                    handleChange(
                      "locationId",
                      newValue ? newValue.locationId : null
                    )
                  }
                  options={availableLocations}
                  getOptionLabel={(option) => option?.locationName ?? ""}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Location" fullWidth />
                  )}
                  disabled={!formData.departmentId1 && !formData.timeSlotId}
                />
              </Box>
            </Box>

            <Box
              border={1}
              borderColor="grey.400"
              borderRadius={2}
              padding={2}
              marginY={2}
            >
              {/* Faculty Dropdown */}
              <Box display="flex" alignItems="center" marginY={2} width="100%">
                <Checkbox
                  checked={!!persistFields["facultyId2"] || false}
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
                  checked={!!persistFields["departmentId2"] || false}
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
                  checked={!!persistFields["staffId"]}
                  onChange={() => handleCheckboxChange("staffId")}
                  disabled={!persistFields["departmentId2"]}
                />
                <Box flexGrow={1} marginRight={1}>
                  <Autocomplete
                    value={
                      availableTeachers?.find(
                        (teacher) => teacher.staffId === formData.staffId
                      ) || null
                    }
                    onChange={(e, newValue) =>
                      handleChange(
                        "staffId",
                        newValue ? newValue.staffId : null
                      )
                    }
                    options={availableTeachers || []}
                    getOptionLabel={(option) => option?.fullName ?? ""}
                    renderInput={(params) => (
                      <TextField {...params} label="Select Teacher" fullWidth />
                    )}
                    disabled={!formData.departmentId2 && !formData.timeSlotId}
                  />
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <p className="text-md text-blue-500 mb-5">
        ✅ Fields with checked checkboxes will keep their selected values when
        you submit or cancel. Unchecked fields will be cleared.
      </p>
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
