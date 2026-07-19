import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Home       from './pages/Home';
import Login    from './pages/auth/Login';
import Register from './pages/auth/Register';

// ── Admin Pages ─────────────────────────────────────────
import AdminDashboard   from './pages/admin/Dashboard';
import AdminTeachers    from './pages/admin/Teachers';
import AdminCreateTeacher from './pages/admin/CreateTeacher';
import AdminStudents    from './pages/admin/Students';
import AdminQuizzes     from './pages/admin/Quizzes';
import AdminResults     from './pages/admin/Results';
import AdminLogs        from './pages/admin/Logs';

// ── Teacher Pages ───────────────────────────────────────
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherQuizzes   from './pages/teacher/Quizzes';
import TeacherCreateQuiz from './pages/teacher/CreateQuiz';
import TeacherQuestions from './pages/teacher/Questions';
import TeacherResults   from './pages/teacher/Results';
import TeacherAttempts  from './pages/teacher/Attempts';

// ── Student Pages ───────────────────────────────────────
import StudentDashboard  from './pages/student/Dashboard';
import StudentQuizzes    from './pages/student/Quizzes';
import StudentTakeQuiz   from './pages/student/TakeQuiz';
import StudentResults    from './pages/student/Results';
import StudentPerformance from './pages/student/Performance';
import StudentLeaderboard from './pages/student/Leaderboard';

// ── Shared Pages ─────────────────────────────────────────
import Profile from './pages/Profile';

// ─────────────────────────────────────────────────────────

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>

          {/* Public routes */}
          <Route path="/"              element={<Home />} />

          {/* Public routes */}
          <Route path="/auth/login"    element={<Login />} />
          <Route path="/auth/register" element={<Register />} />

          {/* All protected routes share the sidebar Layout */}
          <Route element={<Layout />}>

            {/* ── Admin Routes ── */}
            <Route path="/admin/dashboard"      element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/teachers"        element={<ProtectedRoute allowedRoles={['Admin']}><AdminTeachers /></ProtectedRoute>} />
            <Route path="/admin/teachers/create" element={<ProtectedRoute allowedRoles={['Admin']}><AdminCreateTeacher /></ProtectedRoute>} />
            <Route path="/admin/students"        element={<ProtectedRoute allowedRoles={['Admin']}><AdminStudents /></ProtectedRoute>} />
            <Route path="/admin/quizzes"         element={<ProtectedRoute allowedRoles={['Admin']}><AdminQuizzes /></ProtectedRoute>} />
            <Route path="/admin/results"         element={<ProtectedRoute allowedRoles={['Admin']}><AdminResults /></ProtectedRoute>} />
            <Route path="/admin/logs"            element={<ProtectedRoute allowedRoles={['Admin']}><AdminLogs /></ProtectedRoute>} />
            <Route path="/admin/profile"         element={<ProtectedRoute allowedRoles={['Admin']}><Profile /></ProtectedRoute>} />

            {/* ── Teacher Routes ── */}
            <Route path="/teacher/dashboard"              element={<ProtectedRoute allowedRoles={['Teacher']}><TeacherDashboard /></ProtectedRoute>} />
            <Route path="/teacher/quizzes"                element={<ProtectedRoute allowedRoles={['Teacher']}><TeacherQuizzes /></ProtectedRoute>} />
            <Route path="/teacher/quizzes/create"         element={<ProtectedRoute allowedRoles={['Teacher']}><TeacherCreateQuiz /></ProtectedRoute>} />
            <Route path="/teacher/quizzes/:id/questions"  element={<ProtectedRoute allowedRoles={['Teacher']}><TeacherQuestions /></ProtectedRoute>} />
            <Route path="/teacher/results"                element={<ProtectedRoute allowedRoles={['Teacher']}><TeacherResults /></ProtectedRoute>} />
            <Route path="/teacher/attempts"               element={<ProtectedRoute allowedRoles={['Teacher']}><TeacherAttempts /></ProtectedRoute>} />
            <Route path="/teacher/profile"                element={<ProtectedRoute allowedRoles={['Teacher']}><Profile /></ProtectedRoute>} />

            {/* ── Student Routes ── */}
            <Route path="/student/dashboard"          element={<ProtectedRoute allowedRoles={['Student']}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/quizzes"            element={<ProtectedRoute allowedRoles={['Student']}><StudentQuizzes /></ProtectedRoute>} />
            <Route path="/student/quizzes/:id/take"   element={<ProtectedRoute allowedRoles={['Student']}><StudentTakeQuiz /></ProtectedRoute>} />
            <Route path="/student/results"            element={<ProtectedRoute allowedRoles={['Student']}><StudentResults /></ProtectedRoute>} />
            <Route path="/student/performance"        element={<ProtectedRoute allowedRoles={['Student']}><StudentPerformance /></ProtectedRoute>} />
            <Route path="/student/leaderboard"        element={<ProtectedRoute allowedRoles={['Student']}><StudentLeaderboard /></ProtectedRoute>} />
            <Route path="/student/profile"            element={<ProtectedRoute allowedRoles={['Student']}><Profile /></ProtectedRoute>} />

          </Route>

          {/* 404 catch-all */}
          <Route path="*" element={
            <div className="text-center mt-5">
              <h1 className="display-1 text-muted">404</h1>
              <h4>Page Not Found</h4>
              <a href="/auth/login" className="btn btn-primary mt-3">Go to Login</a>
            </div>
          } />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
