import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary btn-lg">Go Home</Link>
    </div>
  );
}
