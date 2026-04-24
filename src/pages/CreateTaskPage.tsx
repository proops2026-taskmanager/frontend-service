import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

async function fetchUsers(): Promise<User[]> {
  const res = await api.get<{ users: User[] }>('/users');
  return res.data.users;
}

function CreateTaskPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = title.trim() !== '' && assigneeId.trim() !== '';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/tasks', {
        title: title.trim(),
        description: description.trim() || undefined,
        assignee_id: assigneeId.trim(),
      });

      // Invalidate task list cache so TaskListPage re-fetches on redirect
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      navigate('/');
    } catch {
      setError('Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <header>
        <h1>Task Manager</h1>
        <p>Create a new task</p>
      </header>
      <nav>
        <Link to="/">Tasks</Link>
        <Link to="/tasks/new" className="active">New Task</Link>
      </nav>
      <main>
        <form onSubmit={handleSubmit}>
          <h3>New Task Details</h3>
          <div>
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              required
            />
          </div>

          <div>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task..."
              rows={4}
            />
          </div>

          <div>
            <label htmlFor="assignee_id">Assignee *</label>
            {usersLoading ? (
              <span className="loading">Loading users...</span>
            ) : (
              <select
                id="assignee_id"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                required
              >
                <option value="">Select a user</option>
                {users?.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name} ({user.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          {error && <p role="alert">{error}</p>}

          <button type="submit" disabled={!isValid || loading || usersLoading}>
            {loading ? 'Creating…' : 'Create Task'}
          </button>
        </form>
      </main>
    </div>
  );
}

export default CreateTaskPage;
