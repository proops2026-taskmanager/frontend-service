import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { getCurrentUser } from '../lib/auth';
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

  const res = await api.get<Task[]>('/tasks', { params });
  return res.data;
}

function TaskListPage() {
  const currentUser = getCurrentUser();
  const [filters, setFilters] = useState<Filters>({ status: '', assignee_id: '' });

  const { data: tasks, isLoading, isError } = useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => fetchTasks(filters),
  });

  return (
    <div>
      <div>
        <h1>Tasks</h1>
        <Link to="/tasks/new">+ New Task</Link>
      </div>

      {currentUser?.role === 'lead' && (
        <p>Viewing all tasks (lead)</p>
      )}

      <TaskFilterBar filters={filters} onChange={setFilters} />

      {isLoading && <p>Loading…</p>}

      {isError && <p>Failed to load tasks. Please try again.</p>}

      {!isLoading && !isError && tasks?.length === 0 && (
        <p>No tasks yet.</p>
      )}

      {tasks && tasks.length > 0 && (
        <div>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}

export default TaskListPage;
