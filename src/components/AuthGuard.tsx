import { Navigate } from 'react-router-dom';
import { getToken } from '../lib/auth';

interface Props {
  children: React.ReactNode;
}

function AuthGuard({ children }: Props) {
  if (!getToken()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default AuthGuard;
