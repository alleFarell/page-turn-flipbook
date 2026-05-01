import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Viewer } from './pages/Viewer';
import { Embed } from './pages/Embed';
import { NotFound } from './pages/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';

const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/auth', element: <Auth /> },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  { path: '/viewer/:id', element: <Viewer /> },
  { path: '/embed/:id', element: <Embed /> },
  { path: '*', element: <NotFound /> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
