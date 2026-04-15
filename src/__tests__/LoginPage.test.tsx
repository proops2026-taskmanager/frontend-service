import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import LoginPage from '../pages/LoginPage';

// Mock the axios instance
vi.mock('../lib/axios', () => ({
  default: {
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

// Mock useNavigate so we can assert redirects without a real router history
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

import api from '../lib/axios';
const mockPost = api.post as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe('LoginPage', () => {
  it('renders email input, password input, and submit button', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('submits POST /auth/login with email and password', async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        token: 'fake.jwt.token',
        user: { id: 'uuid-1', email: 'alice@example.com', role: 'member' },
      },
    });

    renderWithProviders(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/auth/login', {
        email: 'alice@example.com',
        password: 'password123',
      });
    });
  });

  it('shows inline error message on 401', async () => {
    mockPost.mockRejectedValueOnce({ response: { status: 401 } });

    renderWithProviders(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        /invalid email or password/i
      );
    });
  });
});
