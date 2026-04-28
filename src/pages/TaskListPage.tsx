import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { getCurrentUser, clearAuth } from '../lib/auth';
import { Task, TaskStatus } from '../types/task';
import TaskCard from '../components/TaskCard';
import TaskFilterBar from '../components/TaskFilterBar';

interface Filters {
  status: TaskStatus | '';
  assignee_id: string;
}

async function fetchTasks(filters: Filters): Promise<Task[]> {
  const params: Record<string, string> = {};
  if (filters.status) params.status = filters.status;
  if (filters.assignee_id) params.assignee_id = filters.assignee_id;

  const res = await api.get<{ tasks: Task[]; total: number }>('/tasks', { params });
  return res.data.tasks ?? [];
}

function TaskListPage() {
  const currentUser = getCurrentUser();
  const [filters, setFilters] = useState<Filters>({ status: '', assignee_id: '' });

  const { data: tasks, isLoading, isError } = useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => fetchTasks(filters),
  });

  const handleLogout = () => {
    clearAuth();
    window.location.href = '/login';
  };

  return (
    <div>
      <header>
        <h1>Task Manager</h1>
        <p>Manage your team tasks efficiently</p>
      </header>
      <nav>
        <Link to="/" className="active">Tasks</Link>
        <Link to="/tasks/new">New Task</Link>
        <button onClick={handleLogout} style={{ marginLeft: 'auto', background: 'transparent', color: '#6366f1', border: '1px solid #6366f1' }}>
          Sign Out
        </button>
      </nav>
      <main>
        {currentUser?.role === 'lead' && (
          <div className="user-info">
            <div className="avatar">{(currentUser.full_name || currentUser.email || '?').charAt(0).toUpperCase()}</div>
            <div className="name">
              {currentUser.full_name || currentUser.email} ({currentUser.role})
            </div>
          </div>
        )}

        <div className="task-list-header">
          <h2>All Tasks</h2>
          <div className="actions">
            <Link to="/tasks/new" className="button">+ New Task</Link>
          </div>
        </div>

        <TaskFilterBar filters={filters} onChange={setFilters} />

        {isLoading && <p className="loading">Loading tasks...</p>}

        {isError && <p role="alert">Failed to load tasks. Please try again.</p>}

        {!isLoading && !isError && tasks?.length === 0 && (
          <div className="empty-state">
            <h3>No tasks yet</h3>
            <p>Create your first task to get started.</p>
            <Link to="/tasks/new" className="button">Create Task</Link>
          </div>
        )}

        {tasks && tasks.length > 0 && (
          <div className="task-list">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default TaskListPage;
