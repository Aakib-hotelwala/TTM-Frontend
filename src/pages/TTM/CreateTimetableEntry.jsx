import React, { useState, useEffect } from "react";
import axios from "axios";

const CreateTimetableEntry = () => {
  const [formData, setFormData] = useState({
    academicYear: "",
    facultyId: "",
    deptId: "",
    programId: "",
    classId: "",
    divId: "",
    subjectId: "",
    batchId: "",
    dayId: "",
    timeSlotId: "",
    staffId: "",
    locationId: "",
  });

  const [academicYears, setAcademicYears] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [staff, setStaff] = useState([]);
  const [locations, setLocations] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [days, setDays] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [academicYearsRes, facultiesRes, daysRes, timeSlotsRes] =
          await Promise.all([
            axios.get("/api/academicYears"),
            axios.get("/api/faculties"),
            axios.get("/api/timetable/days"),
            axios.get("/api/timetable/timeSlots"),
          ]);
        setAcademicYears(academicYearsRes.data);
        setFaculties(facultiesRes.data);
        setDays(daysRes.data);
        setTimeSlots(timeSlotsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.facultyId) {
      axios
        .get(`/api/timetable/departments/${formData.facultyId}`)
        .then((res) => setDepartments(res.data));
      axios
        .get(`/api/timetable/locations/${formData.facultyId}`)
        .then((res) => setLocations(res.data));
    } else {
      setDepartments([]);
      setLocations([]);
    }
  }, [formData.facultyId]);

  useEffect(() => {
    if (formData.deptId) {
      axios
        .get(`/api/timetable/programs/${formData.deptId}`)
        .then((res) => setPrograms(res.data));
      axios
        .get(`/api/timetable/teachers/${formData.deptId}`)
        .then((res) => setStaff(res.data));
    } else {
      setPrograms([]);
      setStaff([]);
    }
  }, [formData.deptId]);

  useEffect(() => {
    if (formData.programId) {
      axios
        .get(`/api/timetable/classes/${formData.programId}`)
        .then((res) => setClasses(res.data));
    } else {
      setClasses([]);
    }
  }, [formData.programId]);

  useEffect(() => {
    if (formData.classId) {
      axios
        .get(`/api/timetable/divisions/${formData.classId}`)
        .then((res) => setDivisions(res.data));
      axios
        .get(`/api/timetable/batches/${formData.classId}`)
        .then((res) => setBatches(res.data));
      axios
        .get(`/api/timetable/subjects/${formData.classId}`)
        .then((res) => setSubjects(res.data));
    } else {
      setDivisions([]);
      setBatches([]);
      setSubjects([]);
    }
  }, [formData.classId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Reset dependent fields when a higher-level selection changes
    if (name === "facultyId") {
      setFormData({
        ...formData,
        facultyId: value,
        deptId: "",
        programId: "",
        classId: "",
        divId: "",
        subjectId: "",
        batchId: "",
        staffId: "",
        locationId: "",
      });
    } else if (name === "deptId") {
      setFormData({
        ...formData,
        deptId: value,
        programId: "",
        classId: "",
        divId: "",
        subjectId: "",
        batchId: "",
        staffId: "",
      });
    } else if (name === "programId") {
      setFormData({
        ...formData,
        programId: value,
        classId: "",
        divId: "",
        subjectId: "",
        batchId: "",
      });
    } else if (name === "classId") {
      setFormData({
        ...formData,
        classId: value,
        divId: "",
        subjectId: "",
        batchId: "",
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/timetable", formData);
      alert("Timetable entry created successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to create timetable entry");
    }
  };

  return (
    <div className="w-full h-full p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Create Timetable Entry</h2>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
      >
        {[
          {
            label: "Academic Year",
            name: "academicYear",
            options: academicYears,
          },
          { label: "Faculty", name: "facultyId", options: faculties },
          { label: "Department", name: "deptId", options: departments },
          { label: "Program", name: "programId", options: programs },
          { label: "Class", name: "classId", options: classes },
          { label: "Division", name: "divId", options: divisions },
          { label: "Subject", name: "subjectId", options: subjects },
          { label: "Batch", name: "batchId", options: batches },
          { label: "Day", name: "dayId", options: days },
          { label: "Time Slot", name: "timeSlotId", options: timeSlots },
          { label: "Teacher", name: "staffId", options: staff },
          { label: "Location", name: "locationId", options: locations },
        ].map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
            </label>
            <select
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Select {field.label}</option>
              {(Array.isArray(field.options) ? field.options : []).map(
                (option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                )
              )}
            </select>
          </div>
        ))}
        <div className="sm:col-span-2 md:col-span-3 flex justify-center items-center w-full">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTimetableEntry;
