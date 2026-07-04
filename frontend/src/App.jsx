import { BrowserRouter } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppSelector } from './app/hooks';
import AppRoutes from './routes/AppRoutes';
import { ToastProvider } from './components/common/Toast';

export default function App() {
  const { mode } = useAppSelector(s => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [mode]);

  return (
    <BrowserRouter>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </BrowserRouter>
  );
}
