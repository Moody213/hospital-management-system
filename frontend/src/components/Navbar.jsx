import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_BY_ROLE = {
  Admin: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/doctors', label: 'Doctors' },
    { to: '/patients', label: 'Patients' },
    { to: '/appointments', label: 'Appointments' },
    { to: '/medical-records', label: 'Medical Records' },
  ],
  Doctor: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/doctors', label: 'Doctors' },
    { to: '/appointments', label: 'Appointments' },
    { to: '/medical-records', label: 'Medical Records' },
  ],
  Patient: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/doctors', label: 'Doctors' },
    { to: '/appointments', label: 'Appointments' },
    { to: '/medical-records', label: 'Medical Records' },
  ],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = NAV_BY_ROLE[user?.role] || NAV_BY_ROLE.Admin;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">🏥</span>
        <span className="brand-name">Hospital MS</span>
      </div>
      <div className="navbar-links">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="navbar-user">
        {user && (
          <>
            <span className="user-info">
              <span className="user-email">{user.email}</span>
              <span className="user-role badge">{user.role}</span>
            </span>
            <button onClick={handleLogout} className="btn btn-outline-sm">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
