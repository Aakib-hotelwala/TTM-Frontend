import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/components/Login";
import AdminHomepage from "./pages/Admin/AdminHomepage";
import TeacherHomepage from "./pages/Teacher/TeacherHomepage";
import StudentHomepage from "./pages/Student/StudentHomepage";
import DeanHomepage from "./pages/Dean/DeanHomepage";
import HodHomepage from "./pages/HOD/HodHomepage";
import TtmHomepage from "./pages/TTM/TtmHomepage";
import ProtectedRoute from "./pages/components/ProtectedRoute"; // Ensure proper implementation
import CreateTimetableEntry from "./pages/TTM/CreateTimetableEntry";
import UserManagement from "./pages/Admin/UserManagement";
import RoleManagement from "./pages/Admin/RoleManagement";
import StaffManagement from "./pages/Admin/StaffManagement";
import StudentManagement from "./pages/Admin/StudentManagement";
import RoleAllocation from "./pages/Admin/RoleAllocation";
import ViewTimetableDean from "./pages/Dean/ViewTimetable";
import ViewTimetableHOD from "./pages/HOD/ViewTimetable";
import ViewTeacherDetailsHOD from "./pages/HOD/ViewTeacherDetails";
import ViewLocationDetailsHOD from "./pages/HOD/ViewLocationDetails";
import ManageTimetable from "./pages/TTM/ManageTimetable";
import AssignSubjectTeacher from "./pages/TTM/AssignSubjectTeacher";
import ViewTeacherDetailsTTM from "./pages/TTM/ViewTeacherDetails";
import ViewLocationDetailsTTM from "./pages/TTM/ViewLocationDetails";
import TeacherTimetable from "./pages/Teacher/TeacherTimetable";
import ViewTimetableTeacher from "./pages/Teacher/ViewTimetableTeacher";
import StudentTimetable from "./pages/Student/StudentTimetable";

const App = () => {
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
          </Route>
        </Route>

        {/* Other role-based protected routes */}
        <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
          <Route path="/teacher-homepage/" element={<TeacherHomepage />}>
            <Route path="my-timetable" element={<TeacherTimetable />} />
            <Route path="view-timetable" element={<ViewTimetableTeacher />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          <Route path="/student-homepage/" element={<StudentHomepage />}>
            <Route path="my-timetable" element={<StudentTimetable />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["dean"]} />}>
          <Route path="/dean-homepage/" element={<DeanHomepage />}>
            <Route path="view-timetable" element={<ViewTimetableDean />} />
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
          </Route>
        </Route>

        {/* Protected Routes for Timetable Manager */}
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
          </Route>
        </Route>

        {/* Catch-All Route to Redirect to Login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
