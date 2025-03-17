import { useState, useEffect, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
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
  ManageTimetable,
  AssignSubjectTeacher,
  ViewTeacherDetailsTTM,
  ViewLocationDetailsTTM,
  ViewTimetableTTM,
} from "./pages/TTM";
import {
  TeacherHomepage,
  TeacherTimetable,
  ViewTimetableTeacher,
} from "./pages/Teacher";
import { StudentHomepage, StudentTimetable } from "./pages/Student";

const App = () => {
  const { auth } = useContext(AuthContext);
  const [defaultRoute, setDefaultRoute] = useState("");

  // Role-based default routes mapping
  const roleDefaultRoutes = {
    Admin: "/admin-homepage/role-management",
    Teacher: "/teacher-homepage/my-timetable",
    Student: "/student-homepage/my-timetable",
    Dean: "/dean-homepage/view-timetable",
    HOD: "/hod-homepage/view-timetable",
    TTM: "/ttm-homepage/timetable-management",
  };

  useEffect(() => {
    // Get the first available role to set as default route
    if (auth?.roleNames?.length > 0) {
      const defaultRole = auth.roleNames[0]; // Prioritize the first role
      setDefaultRoute(roleDefaultRoutes[defaultRole] || "/login");
    } else {
      setDefaultRoute("/login");
    }
  }, [auth]);

  return (
    <Router>
      <Routes>
        {/* Redirect "/" to login or role-based default route */}
        <Route path="/" element={<Navigate to={defaultRoute} replace />} />
        <Route path="/login" element={<Login />} />

        {/* Role-based Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
          <Route path="/admin-homepage" element={<AdminHomepage />}>
            <Route path="role-management" element={<RoleManagement />} />
            <Route path="user-management" element={<UserManagement />} />
            <Route path="staff-management" element={<StaffManagement />} />
            <Route path="student-management" element={<StudentManagement />} />
            <Route path="role-allocation" element={<RoleAllocation />} />
            <Route path="" element={<Navigate to="role-management" />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["Teacher"]} />}>
          <Route path="/teacher-homepage" element={<TeacherHomepage />}>
            <Route path="my-timetable" element={<TeacherTimetable />} />
            <Route path="view-timetable" element={<ViewTimetableTeacher />} />
            <Route path="" element={<Navigate to="my-timetable" />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["Student"]} />}>
          <Route path="/student-homepage" element={<StudentHomepage />}>
            <Route path="my-timetable" element={<StudentTimetable />} />
            <Route path="" element={<Navigate to="my-timetable" />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["Dean"]} />}>
          <Route path="/dean-homepage" element={<DeanHomepage />}>
            <Route path="view-timetable" element={<ViewTimetableDean />} />
            <Route path="" element={<Navigate to="view-timetable" />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["HOD"]} />}>
          <Route path="/hod-homepage" element={<HodHomepage />}>
            <Route path="view-timetable" element={<ViewTimetableHOD />} />
            <Route
              path="view-teacher-details"
              element={<ViewTeacherDetailsHOD />}
            />
            <Route
              path="view-location-details"
              element={<ViewLocationDetailsHOD />}
            />
            <Route path="" element={<Navigate to="view-timetable" />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["TTM"]} />}>
          <Route path="/ttm-homepage" element={<TtmHomepage />}>
            <Route path="view-timetable" element={<ViewTimetableTTM />} />
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
            <Route path="" element={<Navigate to="timetable-management" />} />
          </Route>
        </Route>

        {/* Catch-All Route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
