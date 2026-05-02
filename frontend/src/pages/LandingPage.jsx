import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function LandingPage() {
  const { user } = useAuth();

  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="landing">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-header-inner">
          <div className="landing-logo">
            <span className="landing-logo-icon">🏥</span>
            <span className="landing-logo-text">Hospital<strong>MS</strong></span>
          </div>
          <nav className="landing-nav">
            <Link to="/login" className="landing-nav-link">Sign In</Link>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <div className="landing-hero-content">
            <span className="landing-badge">Trusted by Healthcare Professionals</span>
            <h1 className="landing-title">
              Modern Hospital<br />
              <span className="landing-title-accent">Management System</span>
            </h1>
            <p className="landing-subtitle">
              Streamline patient care, doctor scheduling, and medical records all in one
              secure, easy-to-use platform built for modern healthcare facilities.
            </p>
            <div className="landing-cta-group">
              <Link to="/register" className="btn-landing-primary">Get Started Free</Link>
              <Link to="/login" className="btn-landing-secondary">Sign In</Link>
            </div>
          </div>
          <div className="landing-hero-visual">
            <div className="landing-stats-card">
              <div className="landing-stat">
                <span className="landing-stat-value">500+</span>
                <span className="landing-stat-label">Patients Managed</span>
              </div>
              <div className="landing-stat-divider" />
              <div className="landing-stat">
                <span className="landing-stat-value">120+</span>
                <span className="landing-stat-label">Doctors Registered</span>
              </div>
              <div className="landing-stat-divider" />
              <div className="landing-stat">
                <span className="landing-stat-value">98%</span>
                <span className="landing-stat-label">Uptime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features">
        <div className="landing-section-inner">
          <h2 className="landing-section-title">Everything you need to manage your hospital</h2>
          <p className="landing-section-sub">Role-based access for Admins, Doctors, and Patients</p>
          <div className="landing-features-grid">
            {FEATURES.map((f) => (
              <div className="landing-feature-card" key={f.title}>
                <span className="landing-feature-icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="landing-roles">
        <div className="landing-section-inner">
          <h2 className="landing-section-title">Built for every role</h2>
          <div className="landing-roles-grid">
            {ROLES.map((r) => (
              <div className="landing-role-card" key={r.role}>
                <span className="landing-role-icon">{r.icon}</span>
                <h3>{r.role}</h3>
                <ul>
                  {r.perks.map((p) => (
                    <li key={p}><span className="check">✓</span>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <div className="landing-section-inner landing-cta-inner">
          <h2>Ready to get started?</h2>
          <p>Join healthcare professionals already using Hospital MS.</p>
          <div className="landing-cta-group">
            <Link to="/register" className="btn-landing-primary">Create an Account</Link>
            <Link to="/login" className="btn-landing-outline">Sign In</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <span>© {new Date().getFullYear()} HospitalMS. All rights reserved.</span>
      </footer>
    </div>
  );
}

const FEATURES = [
  {
    icon: '👨‍⚕️',
    title: 'Doctor Management',
    desc: 'Manage doctor profiles, specializations, and scheduling with full CRUD access.',
  },
  {
    icon: '🧑‍🤝‍🧑',
    title: 'Patient Records',
    desc: 'Maintain comprehensive patient profiles, insurance data, and medical history.',
  },
  {
    icon: '📅',
    title: 'Appointment Scheduling',
    desc: 'Book, track, and manage appointments with real-time status updates.',
  },
  {
    icon: '📋',
    title: 'Medical Records',
    desc: 'Securely store diagnoses, prescriptions, and lab results per patient.',
  },
  {
    icon: '🔐',
    title: 'Role-Based Access',
    desc: 'Granular permissions so each role sees and does exactly what they need.',
  },
  {
    icon: '📊',
    title: 'Dashboard Insights',
    desc: 'At-a-glance stats and quick links tailored to your role.',
  },
];

const ROLES = [
  {
    icon: '🛡️',
    role: 'Admin',
    perks: [
      'Full system access',
      'Manage all doctors & patients',
      'View all appointments',
      'Complete medical records CRUD',
    ],
  },
  {
    icon: '👨‍⚕️',
    role: 'Doctor',
    perks: [
      'View & edit own profile',
      'View assigned appointments',
      'Update appointment status',
      'Manage patient medical records',
    ],
  },
  {
    icon: '🧑‍🤝‍🧑',
    role: 'Patient',
    perks: [
      'View own profile',
      'Schedule appointments',
      'View appointment history',
      'Access own medical records',
    ],
  },
];
