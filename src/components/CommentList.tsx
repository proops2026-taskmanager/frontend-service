import { Comment } from '../types/task';

const AVATAR_COLORS = ['bg-purple-500', 'bg-blue-500', 'bg-teal-500', 'bg-orange-500', 'bg-pink-500'];

function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(authorId: string): string {
  const name = authorId.includes('@') ? authorId.split('@')[0] : authorId;
  const parts = name.split(/[._-]/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

interface Props {
  comments: Comment[];
}

function CommentList({ comments }: Props) {
  if (comments.length === 0) {
    return <p className="text-gray-400 text-sm italic">No comments yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {comments.map((c) => (
        <li key={c.id} className="flex gap-3">
          <div
            className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold mt-0.5 ${getAvatarColor(c.author_id)}`}
            title={c.author_id}
          >
            {getInitials(c.author_id)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-sm font-semibold text-gray-700 truncate">{c.author_id}</span>
              <span className="text-xs text-gray-400 flex-shrink-0">
                {new Date(c.created_at).toLocaleString('en-US', {
                  month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                })}
              </span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{c.text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default CommentList;
