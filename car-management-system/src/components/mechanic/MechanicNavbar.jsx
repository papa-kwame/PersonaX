import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function MechanicNavbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark  px-4">
      <Link className="navbar-brand" to="/">MyFleet</Link>
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span className="navbar-toggler-icon"></span>
      </button>


    </nav>
  );
}
