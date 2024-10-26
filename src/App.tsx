// App.tsx 
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CarbonCompass from './components/CarbonCalculator';
import Leaderboard from './components/Leaderboard';
import Insights from './components/Insights';
import PrivateRoute from './components/PrivateRoute';
import Signup from './components/Signup';
import CarbonForm from './components/carbonform'; // Ensure correct casing
import Sidebar from './components/siderbar'; // Ensure correct casing
import GoalTracker from './components/goaltracker'; // Ensure correct casing
// import UserSubmissions from './components/UserSubmissions'; // Uncomment if needed

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <AuthProvider>
        <div className="flex min-h-screen bg-gradient-to-br from-green-400 to-blue-500">
          <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
          <div className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-16'}`}>
            <Routes>
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/carboncompass"
                element={
                  <PrivateRoute>
                    <CarbonCompass />
                  </PrivateRoute>
                }
              />
              <Route
                path="/carbonform"
                element={
                  <PrivateRoute>
                    <CarbonForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/goaltracker"
                element={
                  <PrivateRoute>
                    <GoalTracker />
                  </PrivateRoute>
                }
              />
              <Route
                path="/leaderboard"
                element={
                  <PrivateRoute>
                    <Leaderboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/insights"
                element={
                  <PrivateRoute>
                    <Insights />
                  </PrivateRoute>
                }
              />
              {/* Uncomment if needed */}
              {/* <Route
                path="/user-submissions"
                element={
                  <PrivateRoute>
                    <UserSubmissions />
                  </PrivateRoute>
                }
              /> */}
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
