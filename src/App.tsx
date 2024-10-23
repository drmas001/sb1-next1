import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/Login';
import MainDashboard from './components/MainDashboard';
import AdminDashboard from './components/AdminDashboard';
import NewPatientAdmission from './components/NewPatientAdmission';
import PatientDischarge from './components/PatientDischarge';
import PatientDetails from './components/PatientDetails';
import DailyReportManagement from './components/DailyReportManagement';
import SpecialtiesManagement from './components/SpecialtiesManagement';
import Sidebar from './components/Sidebar';
import BottomNavigation from './components/BottomNavigation';
import About from './components/About';
import WelcomePage from './components/WelcomePage';
import ReportGenerationPage from './components/ReportGenerationPage';
import EmployeeCreationPage from './components/EmployeeCreationPage';
import ClinicAppointmentBooking from './components/ClinicAppointmentBooking';

interface User {
  id: string;
  employeeCode: string;
  isAdmin: boolean;
  name: string;
}

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const location = useLocation();

  const isWelcomePage = location.pathname === '/';
  const isLoginPage = location.pathname === '/login';
  const isAboutPage = location.pathname === '/about';

  const showNavigation = user && !isWelcomePage && !isLoginPage && !isAboutPage;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <ToastContainer />
      {showNavigation && (
        <>
          <Sidebar 
            isExpanded={isSidebarExpanded} 
            setIsExpanded={setIsSidebarExpanded} 
          />
          <BottomNavigation />
        </>
      )}
      <div className={`flex-1 transition-all duration-300 ${
        showNavigation ? 'lg:ml-16 pb-16 lg:pb-0' : ''
      } ${showNavigation && isSidebarExpanded ? 'lg:ml-64' : ''}`}>
        <div className="p-4 lg:p-8">
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route
              path="/dashboard"
              element={
                user ? (
                  user.isAdmin ? (
                    <AdminDashboard user={user} />
                  ) : (
                    <MainDashboard user={user} />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route path="/new-admission" element={user ? <NewPatientAdmission /> : <Navigate to="/login" replace />} />
            <Route path="/discharge" element={user ? <PatientDischarge /> : <Navigate to="/login" replace />} />
            <Route path="/patient/:mrn" element={user ? <PatientDetails /> : <Navigate to="/login" replace />} />
            <Route path="/daily-report" element={user ? <DailyReportManagement /> : <Navigate to="/login" replace />} />
            <Route path="/specialties" element={user ? <SpecialtiesManagement /> : <Navigate to="/login" replace />} />
            <Route path="/about" element={<About />} />
            <Route
              path="/admin/report"
              element={
                user && user.isAdmin ? (
                  <ReportGenerationPage user={user} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/admin/create-employee"
              element={
                user && user.isAdmin ? (
                  <EmployeeCreationPage user={user} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/book-appointment"
              element={user ? <ClinicAppointmentBooking /> : <Navigate to="/login" replace />}
            />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;