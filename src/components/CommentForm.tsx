import { useState, FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react';
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a comment…"
        required
        rows={2}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none transition"
      />
      {error && (
        <p role="alert" className="text-red-500 text-xs">{error}</p>
      )}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={text.trim() === '' || loading}
          className="flex items-center gap-1.5 bg-[#0079BF] hover:bg-[#026AA7] disabled:opacity-50 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
          {loading ? 'Posting…' : 'Post'}
        </button>
      </div>
    </form>
  );
}

export default CommentForm;
