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
  Grid,
} from "@mui/material";
import toast from "react-hot-toast";

const API_BASE_URL = "https://localhost:7073/api";

const useFetchData = (endpoint, dependencies = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!endpoint) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/${endpoint}`);
      setData(response.data?.data || response.data);
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      setData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, refetch: fetchData };
};

const UpdateTimetableModal = ({
  open,
  onClose,
  onUpdateSuccess,
  timetableId,
}) => {
  const [formData, setFormData] = useState({});
  const { auth } = useContext(AuthContext); // Get facultyId and departmentId from auth context
  const [availableLocations, setAvailableLocations] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  // Fetch timetable by ID
  useEffect(() => {
    if (!timetableId) return;

    const fetchTimetableById = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/Timetable/getTimetableById?timetableId=${timetableId}`
        );
        const timetableData = response.data;
        setFormData({
          timetableId: timetableData.timetableId || "",
          academicYearId: timetableData.academicYearId || null,
          facultyId1: timetableData.facultyId || null,
          departmentId1: timetableData.departmentId || null,
          facultyId2: timetableData.staffFacultyId || null,
          departmentId2: timetableData.staffDepartmentId || null,
          programId: timetableData.programId || null,
          academicClassId: timetableData.academicClassId || null,
          divisionId: timetableData.divisionId || null,
          subjectId: timetableData.subjectId || null,
          batchId: timetableData.batchId || null,
          dayId: timetableData.dayId || null,
          timeSlotId: timetableData.timeSlotId || null,
          staffId: timetableData.staffId || null,
          locationId: timetableData.locationId || null,
        });
      } catch (error) {
        console.error("Error fetching timetable:", error);
        toast.error("Failed to fetch timetable details.");
      }
    };

    fetchTimetableById();
  }, [timetableId]);

  // Fetch all faculties
  const { data: allFaculties, loading: facultiesLoading } =
    useFetchData("Academic/Faculties");

  // Filter user's faculty
  const faculties1 = allFaculties?.filter(
    (faculty) => faculty.facultyId === auth?.facultyId
  );

  // Fetch departments based on the user's facultyId
  const { data: departments1, loading: departmentsLoading } = useFetchData(
    formData.facultyId1
      ? `Academic/departments?facultyId=${formData.facultyId1}`
      : null,
    [formData.facultyId1]
  );

  // Find user's department
  const userDepartment = departments1?.find(
    (department) => department.departmentId === auth?.departmentId
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

    if (!formData.dayId || (!formData.divisionId && !formData.batchId)) {
      setAvailableTimeSlots(allTimeSlots);
      return;
    }

    const isPractical = selectedSubject?.subjectTypeName === "Practical";

    // Identify currently selected time slot's timetable entry
    const currentEntry = timetableData.find(
      (entry) =>
        entry.dayId === formData.dayId &&
        (isPractical
          ? entry.batchId === formData.batchId
          : entry.divisionId === formData.divisionId) &&
        entry.timeSlotId === formData.timeSlotId
    );

    // Get occupied time slots, excluding the current entry's time slot for updates
    const occupiedTimeSlotIds = timetableData
      .filter((entry) => {
        const matchesDay = entry.dayId === formData.dayId;
        const matchesBatchOrDivision = isPractical
          ? entry.batchId === formData.batchId
          : entry.divisionId === formData.divisionId;

        // Exclude current entry if updating an existing record
        const isCurrentEntry =
          currentEntry && entry.timeSlotId === currentEntry.timeSlotId;

        return matchesDay && matchesBatchOrDivision && !isCurrentEntry;
      })
      .map((entry) => entry.timeSlotId);

    console.log(
      isPractical
        ? "Occupied Time Slot IDs for Batch & Day:"
        : "Occupied Time Slot IDs for Division & Day:",
      occupiedTimeSlotIds
    );

    // Filter time slots: exclude occupied ones (except for the pre-selected one)
    const nonConflictingTimeSlots = allTimeSlots.filter((timeSlot) => {
      const isOccupied = occupiedTimeSlotIds.includes(timeSlot.timeSlotId);
      const isPreSelected = timeSlot.timeSlotId === formData.timeSlotId;
      return !isOccupied || isPreSelected;
    });

    console.log(
      "Filtered Available Time Slots (with pre-selection):",
      nonConflictingTimeSlots
    );

    setAvailableTimeSlots(nonConflictingTimeSlots);
  }, [
    allTimeSlots,
    timetableData,
    formData.divisionId,
    formData.dayId,
    formData.batchId,
    formData.timeSlotId,
    selectedSubject,
  ]);

  // Fetch locations based on selected department
  useEffect(() => {
    const fetchAvailableLocations = async () => {
      if (!formData.departmentId1) {
        setAvailableLocations([]);
        return;
      }

      try {
        // Fetch locations for selected department
        const { data: locations } = await axios.get(
          `${API_BASE_URL}/Location/locations?departmentId=${formData.departmentId1}`
        );

        let availableLocations = locations;

        if (formData.dayId && formData.timeSlotId) {
          // Get occupied locations for selected day and time slot
          const occupiedLocationIds = timetableData
            .filter(
              (entry) =>
                entry.dayId === formData.dayId &&
                entry.timeSlotId === formData.timeSlotId &&
                entry.locationId !== formData.locationId // Exclude currently selected location
            )
            .map((entry) => entry.locationId);

          console.log("Occupied Location IDs:", occupiedLocationIds);

          // Filter out occupied locations, keeping pre-selected one
          availableLocations = locations.filter((location) => {
            const isOccupied = occupiedLocationIds.includes(
              location.locationId
            );
            const isPreSelected = location.locationId === formData.locationId;
            return !isOccupied || isPreSelected;
          });
        }

        console.log("Filtered Available Locations:", availableLocations);
        setAvailableLocations(availableLocations);
      } catch (error) {
        console.error("Error fetching available locations:", error);
        setAvailableLocations([]);
      }
    };

    fetchAvailableLocations();
  }, [
    formData.departmentId1,
    formData.dayId,
    formData.timeSlotId,
    formData.locationId,
    timetableData, // Ensure updates reflect timetable changes
  ]);

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
        // Fetch teachers based on selected department
        const { data: staffMembers } = await axios.get(
          `${API_BASE_URL}/Staff/teachers?departmentId=${formData.departmentId2}`
        );

        let availableTeachers = staffMembers;

        if (formData.dayId && formData.timeSlotId) {
          // Get occupied teacher IDs for selected day and time slot
          const occupiedTeacherIds = timetableData
            .filter(
              (entry) =>
                entry.dayId === formData.dayId &&
                entry.timeSlotId === formData.timeSlotId &&
                entry.staffId !== formData.staffId // Exclude pre-selected teacher
            )
            .map((entry) => entry.staffId);

          console.log("Occupied Teacher IDs:", occupiedTeacherIds);

          // Filter out occupied teachers, keeping pre-selected one
          availableTeachers = staffMembers.filter((teacher) => {
            const isOccupied = occupiedTeacherIds.includes(teacher.staffId);
            const isPreSelected = teacher.staffId === formData.staffId;
            return !isOccupied || isPreSelected;
          });
        }

        console.log("Filtered Available Teachers:", availableTeachers);
        setAvailableTeachers(availableTeachers);
      } catch (error) {
        console.error("Error fetching available teachers:", error);
        setAvailableTeachers([]);
      }
    };

    fetchAvailableTeachers();
  }, [
    formData.departmentId2,
    formData.dayId,
    formData.timeSlotId,
    formData.staffId,
    timetableData, // Ensure updates reflect timetable changes
  ]);

  const handleChange = async (key, value) => {
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
        newFormData.timeSlotId = null;
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
    const isPractical = selectedSubject?.subjectTypeName === "Practical";

    if (
      !formData.timetableId ||
      !formData.academicYearId ||
      !formData.facultyId1 ||
      !formData.departmentId1 ||
      !formData.programId ||
      !formData.academicClassId ||
      !formData.divisionId ||
      !formData.subjectId ||
      (isPractical && !formData.batchId) ||
      !formData.dayId ||
      !formData.timeSlotId ||
      !formData.staffId ||
      !formData.locationId
    ) {
      toast.error("Please fill in all the required fields.");
      return;
    }

    const timetableData = {
      timetableId: formData.timetableId,
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
      // Proceed with the update if no conflicts
      await axios.put(`${API_BASE_URL}/Timetable/update`, timetableData);
      toast.success("Timetable updated successfully!");
      onUpdateSuccess?.();
      refetchTimetable();
      onClose();
    } catch (error) {
      console.error("Update error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Error updating timetable.");
    }
  };

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
          </Grid>

          {/* Second Column - Selectable Faculty and Department */}
          <Grid item xs={12} md={6}>
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
                  availableTimeSlots?.length
                    ? availableTimeSlots.find(
                        (slot) => slot.timeSlotId === formData?.timeSlotId
                      ) || null
                    : null
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
                  !formData?.programId ||
                  (formData?.subjectType === "practical" &&
                    !formData?.batchId) ||
                  (formData?.subjectType !== "practical" &&
                    !formData.divisionId)
                }
              />
            </Box>

            {/* Location Dropdown */}
            <Box marginY={2}>
              <Autocomplete
                value={
                  availableLocations?.find(
                    (location) => location.locationId === formData?.locationId
                  ) || null
                }
                onChange={(e, newValue) =>
                  handleChange(
                    "locationId",
                    newValue ? newValue.locationId : null
                  )
                }
                options={availableLocations || []}
                getOptionLabel={(option) => option?.locationName ?? ""}
                renderInput={(params) => (
                  <TextField {...params} label="Select Location" fullWidth />
                )}
                disabled={!formData?.departmentId1 && !formData?.timeSlotId}
              />
            </Box>

            <Box
              border={1}
              borderColor="grey.400"
              borderRadius={2}
              padding={2}
              marginY={2}
            >
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
                    availableTeachers?.find(
                      (teacher) => teacher.staffId === formData?.staffId
                    ) || null
                  }
                  onChange={(e, newValue) =>
                    handleChange("staffId", newValue ? newValue.staffId : null)
                  }
                  options={availableTeachers || []}
                  getOptionLabel={(option) => option?.fullName ?? ""}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Teacher" fullWidth />
                  )}
                  disabled={!formData?.departmentId2 && !formData?.timeSlotId}
                />
              </Box>
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
