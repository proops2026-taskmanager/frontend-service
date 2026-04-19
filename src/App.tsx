import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from './components/AuthGuard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TaskListPage from './pages/TaskListPage';
import CreateTaskPage from './pages/CreateTaskPage';
import TaskDetailPage from './pages/TaskDetailPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes — AuthGuard redirects to /login if no token */}
        <Route
          path="/"
          element={
            <AuthGuard>
              <TaskListPage />
            </AuthGuard>
          }
        />
        <Route
          path="/tasks/new"
          element={
            <AuthGuard>
              <CreateTaskPage />
            </AuthGuard>
          }
        />
        <Route
          path="/tasks/:id"
          element={
            <AuthGuard>
              <TaskDetailPage />
            </AuthGuard>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
