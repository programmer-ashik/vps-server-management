import { useAppSelector } from '../app/hooks';
import { Navigate, Outlet } from 'react-router-dom';

export default function PrivateRoute() {
  const { token } = useAppSelector((s) => s.auth);
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

