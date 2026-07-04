import { useAppSelector } from '../app/hooks';
import { Navigate, Outlet } from 'react-router-dom';

export default function PublicRoute() {
  const { token } = useAppSelector((s) => s.auth);
  return token ? <Navigate to="/" replace /> : <Outlet />;
}

