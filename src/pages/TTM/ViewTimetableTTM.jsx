import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Timetable from "../components/Timetable";
import { AuthContext } from "../../context/AuthContext";

const ViewTimetableTTM = () => {
  const { auth } = useContext(AuthContext);
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [classes, setClasses] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [days, setDays] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    if (selectedProgram) {
      fetchDays();
      fetchTimeSlots(selectedProgram.programId);
      fetchTimetable(selectedProgram.programId);
      fetchClasses(selectedProgram.programId);
    } else {
      // Clear filters when no program is selected
      setSelectedClass(null);
      setSelectedDivision(null);
      setSelectedLocation(null);
      setSelectedTeacher(null);
      setTimetable([]);
      setDays([]);
      setTimeSlots([]);
    }
  }, [selectedProgram]);

  useEffect(() => {
    if (!selectedClass) {
      setSelectedDivision(null);
    }
  }, [selectedClass]);

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

  const fetchClasses = async (programId) => {
    try {
      const response = await axios.get(
        `https://localhost:7073/api/Academic/classes?programId=${programId}`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );
      setClasses(response.data);
    } catch (error) {
      console.error("Error fetching Classes:", error);
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
      setTimetable(response.data);
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

  const handleFilterChange = (filterType, newValue) => {
    switch (filterType) {
      case "division":
        setSelectedDivision(newValue);
        break;
      case "location":
        setSelectedLocation(newValue);
        setSelectedClass(null); // Clear class & division
        setSelectedDivision(null);
        setSelectedTeacher(null);
        break;
      case "teacher":
        setSelectedTeacher(newValue);
        setSelectedClass(null); // Clear class & division
        setSelectedDivision(null);
        setSelectedLocation(null);
        break;
      default:
        break;
    }
  };

  const handleClassChange = (newValue) => {
    setSelectedClass(newValue);
    setSelectedDivision(null); // Ensure division resets when class changes
    setSelectedLocation(null);
    setSelectedTeacher(null);
  };

  const filteredTimetable = timetable.filter((entry) => {
    // Class + Division filter (show only when both are selected)
    if (selectedClass && selectedDivision) {
      return (
        entry.academicClassName === selectedClass &&
        entry.divisionName === selectedDivision
      );
    }

    // Teacher timetable (clears other filters)
    if (selectedTeacher) {
      return entry.staffName === selectedTeacher;
    }

    // Location timetable (clears other filters)
    if (selectedLocation) {
      return entry.locationName === selectedLocation;
    }

    // Default: show nothing until a valid combination is selected
    return false;
  });

  return (
    <Timetable
      programs={programs}
      days={days}
      timeSlots={timeSlots}
      filteredTimetable={filteredTimetable}
      uniqueValues={uniqueValues}
      selectedProgram={selectedProgram}
      handleProgramChange={setSelectedProgram}
      selectedClass={selectedClass}
      selectedDivision={selectedDivision}
      selectedLocation={selectedLocation}
      selectedTeacher={selectedTeacher}
      handleFilterChange={handleFilterChange}
      handleClassChange={handleClassChange}
    />
  );
};

export default ViewTimetableTTM;
