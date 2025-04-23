import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [contentToReview, setContentToReview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newUser, setNewUser] = useState({ email: '', role: 'student' });
  const [announcement, setAnnouncement] = useState('');

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        // Users
        const userRes = await axios.get('http://localhost:5000/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(userRes.data);

        // Courses
        const courseRes = await axios.get('http://localhost:5000/api/courses', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(courseRes.data);

        // Analytics (mocked)
        const analyticsRes = await axios.get('http://localhost:5000/api/analytics/system', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnalytics(analyticsRes.data);

        // Content to review (mocked)
        setContentToReview([
          { id: 1, type: 'video', course: 'AI Basics', status: 'Pending' },
        ]);
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err.response?.data || err.message);
        setError('Failed to load data.');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Add user
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/users',
        newUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers([...users, res.data]);
      setNewUser({ email: '', role: 'student' });
      setError('');
    } catch (err) {
      setError(err.response?.data.message || 'Failed to add user.');
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((u) => u._id !== userId));
      setError('');
    } catch (err) {
      setError(err.response?.data.message || 'Failed to delete user.');
    }
  };

  // Approve content
  const handleApproveContent = async (contentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/content/review`,
        { contentId, status: 'Approved' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setContentToReview(contentToReview.filter((c) => c.id !== contentId));
      setError('');
    } catch (err) {
      setError(err.response?.data.message || 'Failed to approve content.');
    }
  };

  // Send announcement
  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/announcements',
        { message: announcement, scope: 'system' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnnouncement('');
      setError('');
    } catch (err) {
      setError(err.response?.data.message || 'Failed to send announcement.');
    }
  };

  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
          <button
            onClick={logout}
            className="rounded-md bg-primary py-2 px-4 text-white hover:bg-blue-700"
          >
            Logout
          </button>
        </div>
        <p className="text-gray-600 mb-6">Welcome, {user.email}</p>
        {error && (
          <p className="mb-4 rounded bg-red-100 p-2 text-red-600">{error}</p>
        )}
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Overview */}
            <div className="bg-white p-6 rounded-lg shadow-md col-span-3">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">System Overview</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-gray-600">Users: {analytics.userCount || 0}</p>
                  <p className="text-gray-600">Courses: {courses.length}</p>
                </div>
                <div>
                  <h3 className="text-md font-semibold">Engagement</h3>
                  <p className="text-sm text-gray-500">
                    Active Users: {analytics.activeUsers || 0}
                  </p>
                </div>
                <div>
                  <h3 className="text-md font-semibold">Content Review</h3>
                  <p className="text-sm text-gray-500">
                    Pending: {contentToReview.length}
                  </p>
                </div>
              </div>
            </div>

            {/* User Management */}
            <div className="bg-white p-6 rounded-lg shadow-md col-span-2">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">User Management</h2>
              <form onSubmit={handleAddUser} className="mb-4 flex gap-4">
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="User Email"
                  className="flex-1 rounded-md border border-gray-300 p-2 focus:border-primary focus:outline-none"
                  required
                />
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="rounded-md border border-gray-300 p-2 focus:border-primary focus:outline-none"
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  type="submit"
                  className="rounded-md bg-primary py-2 px-4 text-white hover:bg-blue-700"
                >
                  Add User
                </button>
              </form>
              {users.map((u) => (
                <div key={u._id} className="mb-2 flex justify-between">
                  <div>
                    <p className="text-gray-600">{u.email}</p>
                    <p className="text-sm text-gray-500">Role: {u.role}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteUser(u._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            {/* Content Management */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Content Review</h2>
              {contentToReview.map((c) => (
                <div key={c.id} className="mb-2 flex justify-between">
                  <div>
                    <p className="text-gray-600">{c.type} in {c.course}</p>
                    <p className="text-sm text-gray-500">Status: {c.status}</p>
                  </div>
                  <button
                    onClick={() => handleApproveContent(c.id)}
                    className="text-primary hover:text-blue-700"
                  >
                    Approve
                  </button>
                </div>
              ))}
            </div>

            {/* Communication */}
            <div className="bg-white p-6 rounded-lg shadow-md col-span-2">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">System Announcements</h2>
              <form onSubmit={handleSendAnnouncement} className="flex gap-4">
                <input
                  type="text"
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  placeholder="System-wide announcement"
                  className="flex-1 rounded-md border border-gray-300 p-2 focus:border-primary focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className="rounded-md bg-primary py-2 px-4 text-white hover:bg-blue-700"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;