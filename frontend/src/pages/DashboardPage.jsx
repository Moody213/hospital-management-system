import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllDoctors } from '../api/doctors';
import { getAllPatients } from '../api/patients';
import { getAllAppointments, getDoctorAppointments, getPatientAppointments } from '../api/appointments';

export default function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role;
  const entityId = user?.entityId;
  const [stats, setStats] = useState({ doctors: 0, patients: 0, appointments: 0 });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (role === 'Admin') {
          const [doctorsRes, patientsRes, apptRes] = await Promise.allSettled([
            getAllDoctors(),
            getAllPatients(),
            getAllAppointments(),
          ]);
          const doctors = doctorsRes.status === 'fulfilled' ? doctorsRes.value.data : [];
          const patients = patientsRes.status === 'fulfilled' ? patientsRes.value.data : [];
          const appointments = apptRes.status === 'fulfilled' ? apptRes.value.data : [];
          setStats({
            doctors: doctors.length,
            patients: patients.length,
            appointments: appointments.length,
          });
          if (Array.isArray(appointments)) setRecentAppointments(appointments.slice(0, 5));
        } else if (role === 'Doctor' && entityId) {
          const [docRes, apptRes] = await Promise.allSettled([
            getAllDoctors(),
            getDoctorAppointments(entityId),
          ]);
          const appointments = apptRes.status === 'fulfilled' ? apptRes.value.data : [];
          setStats({ doctors: docRes.status === 'fulfilled' ? docRes.value.data.length : 0, appointments: appointments.length });
          setRecentAppointments(appointments.slice(0, 5));
        } else if (role === 'Patient' && entityId) {
          const apptRes = await getPatientAppointments(entityId).catch(() => ({ data: [] }));
          const appointments = apptRes.data || [];
          setStats({ appointments: appointments.length });
          setRecentAppointments(appointments.slice(0, 5));
        }
      } catch {
        setError('Failed to load some dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [role, entityId]);

  const allStatCards = [
    { label: 'Total Doctors', value: stats.doctors, icon: '👨‍⚕️', to: '/doctors', color: 'blue', roles: ['Admin', 'Doctor'] },
    { label: 'Total Patients', value: stats.patients, icon: '🧑‍🦽', to: '/patients', color: 'green', roles: ['Admin'] },
    { label: 'Appointments', value: stats.appointments, icon: '📅', to: '/appointments', color: 'orange', roles: ['Admin', 'Doctor', 'Patient'] },
  ];
  const statCards = allStatCards.filter(c => c.roles.includes(role));

  const allQuickLinks = [
    { label: 'Doctors', icon: '👨‍⚕️', to: '/doctors', desc: 'Manage doctor records & profiles', roles: ['Admin', 'Doctor', 'Patient'] },
    { label: 'Patients', icon: '🧑‍🦽', to: '/patients', desc: 'View and manage patient data', roles: ['Admin', 'Doctor'] },
    { label: 'Appointments', icon: '📅', to: '/appointments', desc: 'Schedule and track appointments', roles: ['Admin', 'Doctor', 'Patient'] },
    { label: 'Medical Records', icon: '📋', to: '/medical-records', desc: 'Access patient medical history', roles: ['Admin', 'Doctor', 'Patient'] },
  ];
  const quickLinks = allQuickLinks.filter(l => l.roles.includes(role));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="text-muted">
            Welcome back, <strong>{user?.email}</strong>
            <span className="badge ml-2">{user?.role}</span>
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading dashboard...</div>
      ) : (
        <>
          <div className="stats-grid">
            {statCards.map((card) => (
              <Link key={card.label} to={card.to} className={`stat-card stat-card--${card.color}`}>
                <div className="stat-icon">{card.icon}</div>
                <div className="stat-info">
                  <span className="stat-value">{card.value}</span>
                  <span className="stat-label">{card.label}</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="dashboard-grid">
            <div className="card">
              <div className="card-header">
                <h2>Quick Navigation</h2>
              </div>
              <div className="quick-links">
                {quickLinks.map((link) => (
                  <Link key={link.label} to={link.to} className="quick-link">
                    <span className="quick-link-icon">{link.icon}</span>
                    <div>
                      <div className="quick-link-label">{link.label}</div>
                      <div className="quick-link-desc">{link.desc}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2>Recent Appointments</h2>
                <Link to="/appointments" className="btn btn-sm btn-outline">View All</Link>
              </div>
              {recentAppointments.length === 0 ? (
                <p className="text-muted text-center py-4">No appointments found.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Doctor</th>
                        <th>Patient</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentAppointments.map((appt) => (
                        <tr key={appt.appointmentId}>
                          <td>#{appt.appointmentId}</td>
                          <td>Dr. #{appt.doctorId}</td>
                          <td>Patient #{appt.patientId}</td>
                          <td>{new Date(appt.appointmentDate).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge badge--${appt.status?.toLowerCase()}`}>
                              {appt.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
