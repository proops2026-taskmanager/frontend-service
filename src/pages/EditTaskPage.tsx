import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { TaskDetail, TaskPriority } from '../types/task';
import { useUsers } from '../lib/useUsers';

async function fetchTask(id: string): Promise<TaskDetail> {
  const res = await api.get<TaskDetail>(`/tasks/${id}`);
  return res.data;
}

function EditTaskPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: task, isLoading: taskLoading } = useQuery({
    queryKey: ['task', id],
    queryFn: () => fetchTask(id!),
    enabled: !!id,
  });

  const { data: users = [], isLoading: usersLoading } = useUsers();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      setAssigneeId(task.assignee_id);
      setPriority(task.priority);
      setDueDate(task.due_date ? task.due_date.slice(0, 10) : '');
    }
  }, [task]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await api.patch(`/tasks/${id}`, {
        title: title.trim(),
        description: description.trim() || null,
        assignee_id: assigneeId,
        priority,
        due_date: dueDate || null,
      });
      await queryClient.invalidateQueries({ queryKey: ['task', id] });
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      navigate(`/tasks/${id}`);
    } catch {
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (taskLoading || usersLoading) return <div className="loading">Loading...</div>;
  if (!task) return <p role="alert">Task not found. <Link to="/">Back to list</Link></p>;

  return (
    <div>
      <header>
        <h1>Task Manager</h1>
        <p>Edit task</p>
      </header>
      <nav>
        <Link to="/">Tasks</Link>
        <Link to={`/tasks/${id}`}>Back to Task</Link>
      </nav>
      <main>
        <form onSubmit={handleSubmit}>
          <h3>Edit Task</h3>

          <div>
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div>
            <label htmlFor="assignee_id">Assignee *</label>
            <select
              id="assignee_id"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              required
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          <div>
            <label htmlFor="due_date">Due Date</label>
            <input
              id="due_date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {error && <p role="alert">{error}</p>}

          <button type="submit" disabled={!title.trim() || !assigneeId || saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </main>
    </div>
  );
}

export default EditTaskPage;
