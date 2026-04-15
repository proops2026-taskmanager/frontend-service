import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import AuthGuard from '../components/AuthGuard';

beforeEach(() => {
  localStorage.clear();
});

describe('AuthGuard', () => {
  it('renders children when auth_token is present in localStorage', () => {
    localStorage.setItem('auth_token', 'fake.jwt.token');

    renderWithProviders(
      <AuthGuard>
        <div>Protected content</div>
      </AuthGuard>
    );

    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('does not render children and redirects to /login when no auth_token', () => {
    renderWithProviders(
      <AuthGuard>
        <div>Protected content</div>
      </AuthGuard>,
      { initialEntries: ['/tasks'] }
    );

    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });
});
