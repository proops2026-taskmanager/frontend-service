import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';

interface RegisterResponse {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

function RegisterPage() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'member' | 'lead'>('member');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = 
    email.trim() !== '' && 
    password.length >= 8 && 
    fullName.trim() !== '';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post<RegisterResponse>('/users', {
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        role,
      });
      
      // Registration successful - redirect to login
      navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
    } catch (err: unknown) {
      const status = (err as { response?: { status: number } }).response?.status;
      const data = (err as { response?: { data?: { error?: string } } }).response?.data;
      
      if (status === 409) {
        setError('Email already in use.');
      } else if (status === 400) {
        setError(data?.error || 'Invalid input. Please check your details.');
      } else if (status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email *</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password * (min 8 characters)</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>

        <div>
          <label htmlFor="full_name">Full Name *</label>
          <input
            id="full_name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="role">Role</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as 'member' | 'lead')}
          >
            <option value="member">Member</option>
            <option value="lead">Lead</option>
          </select>
        </div>

        {error && <p role="alert">{error}</p>}

        <button type="submit" disabled={!isValid || loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      
      <p>
        Already have an account? <a href="/login">Sign in</a>
      </p>
    </div>
  );
}

export default RegisterPage;