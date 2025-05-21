import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="container text-center mt-5">
      <h1 className="text-danger">403 - Unauthorized</h1>
      <p>You don't have permission to access this page.</p>
      <Link to="/dashboard" className="btn btn-primary">
        Go to Dashboard
      </Link>
    </div>
  );
}