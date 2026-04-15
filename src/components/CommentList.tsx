import { Comment } from '../types/task';

interface Props {
  comments: Comment[];
}

function CommentList({ comments }: Props) {
  if (comments.length === 0) {
    return <p>No comments yet.</p>;
  }

  return (
    <ul>
      {comments.map((c) => (
        <li key={c.id}>
          <p>{c.text}</p>
          <small>
            {c.author_id} · {new Date(c.created_at).toLocaleString()}
          </small>
        </li>
      ))}
    </ul>
  );
}

export default CommentList;
