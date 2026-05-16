import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from './components/AuthGuard';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import TaskListPage from './pages/TaskListPage';
import CreateTaskPage from './pages/CreateTaskPage';
import TaskDetailPage from './pages/TaskDetailPage';

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full flex flex-col">
      <Navbar />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <AuthGuard>
              <ProtectedLayout>
                <TaskListPage />
              </ProtectedLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/tasks/new"
          element={
            <AuthGuard>
              <ProtectedLayout>
                <CreateTaskPage />
              </ProtectedLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/tasks/:id"
          element={
            <AuthGuard>
              <ProtectedLayout>
                <TaskDetailPage />
              </ProtectedLayout>
            </AuthGuard>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
