import React, { useState, useEffect } from "react";
import axios from "axios";
import Timetable from "../components/Timetable";

const ViewTimetableTTM = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [days, setDays] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
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
    } else {
      // Clear filters when no program is selected
      setSelectedClass(null);
      setSelectedLocation(null);
      setSelectedTeacher(null);
      setTimetable([]);
      setDays([]);
      setTimeSlots([]);
    }
  }, [selectedProgram]);

  const fetchPrograms = async () => {
    try {
      const response = await axios.get(
        "https://localhost:7073/api/Academic/programs?departmentId=1"
      );
      setPrograms(response.data);
    } catch (error) {
      console.error("Error fetching programs:", error);
    }
  };

  const fetchTimetable = async (programId) => {
    try {
      const response = await axios.get(
        `https://localhost:7073/api/Timetable/getTimetable?userId=1&programId=${programId}`
      );
      setTimetable(response.data);
    } catch (error) {
      console.error("Error fetching timetable:", error);
    }
  };

  const fetchDays = async () => {
    try {
      const response = await axios.get(
        "https://localhost:7073/api/Timetable/days"
      );
      setDays(response.data);
    } catch (error) {
      console.error("Error fetching days:", error);
    }
  };

  const fetchTimeSlots = async (programId) => {
    try {
      const response = await axios.get(
        `https://localhost:7073/api/Timetable/timeslots?programId=${programId}`
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
      case "class":
        setSelectedClass(newValue);
        setSelectedLocation(null);
        setSelectedTeacher(null);
        break;
      case "location":
        setSelectedLocation(newValue);
        setSelectedClass(null);
        setSelectedTeacher(null);
        break;
      case "teacher":
        setSelectedTeacher(newValue);
        setSelectedClass(null);
        setSelectedLocation(null);
        break;
      default:
        break;
    }
  };

  const filteredTimetable = timetable.filter((entry) => {
    if (selectedClass) return entry.academicClassName === selectedClass;
    if (selectedLocation) return entry.locationName === selectedLocation;
    if (selectedTeacher) return entry.staffName === selectedTeacher;
    return true;
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
      selectedLocation={selectedLocation}
      selectedTeacher={selectedTeacher}
      handleFilterChange={handleFilterChange}
    />
  );
};

export default ViewTimetableTTM;
