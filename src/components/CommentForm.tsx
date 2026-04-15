import { useState, FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

interface Props {
  taskId: string;
}

function CommentForm({ taskId }: Props) {
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post(`/tasks/${taskId}/comments`, { text: text.trim() });
      await queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      setText('');
    } catch {
      setError('Failed to post comment. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a comment…"
        required
      />
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={text.trim() === '' || loading}>
        {loading ? 'Posting…' : 'Post Comment'}
      </button>
    </form>
  );
}

export default CommentForm;
