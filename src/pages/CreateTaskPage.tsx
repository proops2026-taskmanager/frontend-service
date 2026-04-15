import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

function CreateTaskPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
      <h1>New Task</h1>
      <form onSubmit={handleSubmit}>
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
          />
        </div>

        <div>
          <label htmlFor="assignee_id">Assignee ID *</label>
          <input
            id="assignee_id"
            type="text"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            required
          />
        </div>

        {error && <p role="alert">{error}</p>}

        <button type="submit" disabled={!isValid || loading}>
          {loading ? 'Creating…' : 'Create Task'}
        </button>
      </form>
    </div>
  );
}

export default CreateTaskPage;
