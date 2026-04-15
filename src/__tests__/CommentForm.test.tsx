import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import CommentForm from '../components/CommentForm';

vi.mock('../lib/axios', () => ({
  default: {
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

import api from '../lib/axios';
const mockPost = api.post as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CommentForm', () => {
  it('submit button is disabled when textarea is empty', () => {
    renderWithProviders(<CommentForm taskId="task-1" />);

    expect(
      screen.getByRole('button', { name: /post comment/i })
    ).toBeDisabled();
  });

  it('submit button is enabled when textarea has text', () => {
    renderWithProviders(<CommentForm taskId="task-1" />);

    fireEvent.change(screen.getByPlaceholderText(/add a comment/i), {
      target: { value: 'Great work!' },
    });

    expect(
      screen.getByRole('button', { name: /post comment/i })
    ).toBeEnabled();
  });

  it('calls POST /tasks/:id/comments with text on submit', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'comment-1' } });

    renderWithProviders(<CommentForm taskId="task-1" />);

    fireEvent.change(screen.getByPlaceholderText(/add a comment/i), {
      target: { value: 'Great work!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /post comment/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/tasks/task-1/comments', {
        text: 'Great work!',
      });
    });
  });

  it('clears textarea after successful submission', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'comment-1' } });

    renderWithProviders(<CommentForm taskId="task-1" />);

    const textarea = screen.getByPlaceholderText(/add a comment/i);
    fireEvent.change(textarea, { target: { value: 'Great work!' } });
    fireEvent.click(screen.getByRole('button', { name: /post comment/i }));

    await waitFor(() => {
      expect(textarea).toHaveValue('');
    });
  });
});
