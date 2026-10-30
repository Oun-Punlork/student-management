import { Route, Routes } from "react-router-dom";
import Register from './page/Register.jsx';
import Login from './page/Login.jsx';
import ForgotPassword from './page/ForgotPassword.jsx';
import VerifyEmail from './page/VerifyEmail.jsx';
import Student from './page/admin-acess/Student.jsx';
import Dashboard from './page/admin-acess/Dashboard.jsx';
import DashboardLayout from './layout/DashboardLayout.jsx';
import UserDashboardLayout from './layout/UserDashboardLayout.jsx';
import Attendance from "./page/admin-acess/Attendance.jsx";
import Subject from "./page/admin-acess/Subject.jsx";
import Results from "./page/admin-acess/Results.jsx";
import WeeklyAttendance from "./page/admin-acess/WeeklyAttendance.jsx";
import Users from "./page/admin-acess/Users.jsx";
import Profile from "./page/admin-acess/Profile.jsx";
import Information from "./page/admin-acess/Information.jsx";
import { StudentProvider } from "./context/StudentContext.jsx";
import UserDashboard from "./page/student-acess/userdashboard.jsx";
import UserProfile from "./page/student-acess/userprofile.jsx";
import UserInformation from "./page/student-acess/userinfomation.jsx";
import UserAttendance from "./page/student-acess/userattendance.jsx";


function App() {
  return (
    <StudentProvider>
      <Routes>
        {/* Public Routes (No Sidebar) */}
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register" element={<Register />} />
       

        {/* Protected Routes (With Sidebar) */}
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/student" element={<Student />} />
          <Route path="/subject" element={<Subject />} />
          <Route path="/results" element={<Results />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/attendance/weekly" element={<WeeklyAttendance />} />
          <Route path="/users" element={<Users />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/information" element={<Information />} />
        </Route>

        {/* Student Dashboard Route (With Sidebar) */}
        <Route element={<UserDashboardLayout />}>
          <Route path="/userdashboard" element={<UserDashboard />} />
          <Route path="/userprofile" element={<UserProfile />} />
          <Route path="/userinformation" element={<UserInformation />} />
          <Route path="/userattendance" element={<UserAttendance />} />
         
        </Route>
      </Routes>
    </StudentProvider>
  );
}
export default App;
