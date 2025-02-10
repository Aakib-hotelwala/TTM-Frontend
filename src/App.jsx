import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Login, ProtectedRoute } from "./pages";
import {
  AdminHomepage,
  RoleManagement,
  UserManagement,
  StaffManagement,
  StudentManagement,
  RoleAllocation,
} from "./pages/Admin";
import { DeanHomepage, ViewTimetableDean } from "./pages/Dean";
import {
  HodHomepage,
  ViewTimetableHOD,
  ViewTeacherDetailsHOD,
  ViewLocationDetailsHOD,
} from "./pages/HOD";
import {
  TtmHomepage,
  CreateTimetableEntry,
  ManageTimetable,
  AssignSubjectTeacher,
  ViewTeacherDetailsTTM,
  ViewLocationDetailsTTM,
} from "./pages/TTM";
import {
  TeacherHomepage,
  TeacherTimetable,
  ViewTimetableTeacher,
} from "./pages/Teacher";
import { StudentHomepage, StudentTimetable } from "./pages/Student";

const App = () => {
  const [defaultRoute, setDefaultRoute] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role === "admin") {
      setDefaultRoute("/admin-homepage/role-management");
    } else if (role === "teacher") {
      setDefaultRoute("/teacher-homepage/my-timetable");
    } else if (role === "student") {
      setDefaultRoute("/student-homepage/my-timetable");
    } else if (role === "dean") {
      setDefaultRoute("/dean-homepage/view-timetable");
    } else if (role === "hod") {
      setDefaultRoute("/hod-homepage/view-timetable");
    } else if (role === "ttm") {
      setDefaultRoute("/ttm-homepage/timetable-management");
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Redirect "/" to Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Role-based Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin-homepage/" element={<AdminHomepage />}>
            <Route path="role-management" element={<RoleManagement />} />
            <Route path="user-management" element={<UserManagement />} />
            <Route path="staff-management" element={<StaffManagement />} />
            <Route path="student-management" element={<StudentManagement />} />
            <Route path="role-allocation" element={<RoleAllocation />} />
            {/* Default route (First link) */}
            <Route path="" element={<Navigate to="role-management" />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
          <Route path="/teacher-homepage/" element={<TeacherHomepage />}>
            <Route path="my-timetable" element={<TeacherTimetable />} />
            <Route path="view-timetable" element={<ViewTimetableTeacher />} />
            {/* Default route (First link) */}
            <Route path="" element={<Navigate to="my-timetable" />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          <Route path="/student-homepage/" element={<StudentHomepage />}>
            <Route path="my-timetable" element={<StudentTimetable />} />
            {/* Default route (First link) */}
            <Route path="" element={<Navigate to="my-timetable" />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["dean"]} />}>
          <Route path="/dean-homepage/" element={<DeanHomepage />}>
            <Route path="view-timetable" element={<ViewTimetableDean />} />
            {/* Default route (First link) */}
            <Route path="" element={<Navigate to="view-timetable" />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["hod"]} />}>
          <Route path="/hod-homepage/" element={<HodHomepage />}>
            <Route path="view-timetable" element={<ViewTimetableHOD />} />
            <Route
              path="view-teacher-details"
              element={<ViewTeacherDetailsHOD />}
            />
            <Route
              path="view-location-details"
              element={<ViewLocationDetailsHOD />}
            />
            {/* Default route (First link) */}
            <Route path="" element={<Navigate to="view-timetable" />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["ttm"]} />}>
          <Route path="/ttm-homepage/" element={<TtmHomepage />}>
            <Route
              path="create-timetable-entry"
              element={<CreateTimetableEntry />}
            />
            <Route path="timetable-management" element={<ManageTimetable />} />
            <Route
              path="assign-subject-teacher"
              element={<AssignSubjectTeacher />}
            />
            <Route
              path="view-teacher-details"
              element={<ViewTeacherDetailsTTM />}
            />
            <Route
              path="view-location-details"
              element={<ViewLocationDetailsTTM />}
            />
            {/* Default route (First link) */}
            <Route path="" element={<Navigate to="timetable-management" />} />
          </Route>
        </Route>

        {/* Catch-All Route to Redirect to Login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
