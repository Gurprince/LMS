import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { format, addDays } from 'date-fns';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { FaBook, FaUsers, FaTasks, FaChartLine, FaPlus, FaFilter, FaCalendar, FaList } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [content, setContent] = useState([]);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('month');
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', type: 'assignment', date: '', courseId: '' });
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newCourse, setNewCourse] = useState({ title: '', description: '' });
  const [newAssignment, setNewAssignment] = useState({ title: '', courseId: '', dueDate: '' });
  const [newContent, setNewContent] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Handle anchor navigation
  useEffect(() => {
    const handleAnchorClick = (e) => {
      const href = e.target.getAttribute('href');
      if (href?.startsWith('#')) {
        e.preventDefault();
        const sectionId = href.slice(1);
        const section = document.getElementById(sectionId);
        if (section) {
          const navbarHeight = getComputedStyle(document.documentElement)
            .getPropertyValue('--navbar-height')
            .trim();
          const offset = parseFloat(navbarHeight) || 64;
          const sectionTop = section.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: sectionTop, behavior: 'smooth' });
        }
        setSidebarOpen(false);
      }
    };

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', handleAnchorClick);
    });

    return () => {
      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.removeEventListener('click', handleAnchorClick);
      });
    };
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        // Courses
        const courseRes = await axios.get('http://localhost:5000/api/courses', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const facultyCourses = courseRes.data.filter(
          (course) => course.facultyId._id === user._id
        );
        setCourses(facultyCourses);

        // Students
        let studentCount = 0;
        try {
          const analyticsRes = await axios.get('http://localhost:5000/api/analytics/students', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAnalytics(analyticsRes.data);
          studentCount = analyticsRes.data.length;
        } catch (err) {
          console.warn('Analytics endpoint error:', err.response?.status);
          setAnalytics([]);
        }
        setStudents({ length: studentCount });

        // Assignments
        const assignRes = await axios.get('http://localhost:5000/api/assignments', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const tasks = assignRes.data.filter(
          (a) => a.submissions?.some((s) => !s.grade) && facultyCourses.some((c) => c._id === a.courseId._id)
        );
        setPendingTasks(tasks);
        setAssignments(assignRes.data);

        // Content
        let contentData = [];
        try {
          const contentRes = await axios.get('http://localhost:5000/api/content', {
            headers: { Authorization: `Bearer ${token}` },
          });
          contentData = contentRes.data;
        } catch (err) {
          console.warn('Content endpoint error:', err.response?.status, err.response?.data);
          if (err.response?.status === 404) {
            setError('Content endpoint not found. Please check backend configuration.');
          }
          contentData = [];
        }
        setContent(contentData);

        // Events
        const assignmentEvents = assignRes.data
          .filter((a) => facultyCourses.some((c) => c._id === a.courseId._id))
          .map((a) => ({
            id: a._id,
            title: a.title,
            type: 'assignment',
            date: new Date(a.dueDate),
            courseId: a.courseId._id,
            courseTitle: facultyCourses.find((c) => c._id === a.courseId._id)?.title,
          }));
        const contentEvents = contentData
          .filter((c) => facultyCourses.some((fc) => fc._id === c.courseId))
          .map((c) => ({
            id: c._id,
            title: `Content: ${c.name}`,
            type: 'content',
            date: new Date(c.uploadDate),
            courseId: c.courseId,
            courseTitle: facultyCourses.find((fc) => fc._id === c.courseId)?.title,
          }));
        const mockLectures = [
          {
            id: 'mock1',
            title: 'AI Lecture',
            type: 'lecture',
            date: new Date(2025, 3, 19, 10, 0),
            courseId: facultyCourses[0]?._id,
            courseTitle: facultyCourses[0]?.title,
            recurrence: 'weekly',
          },
        ];
        const notificationEvents = [
          {
            id: 'ann1',
            title: 'Admin: Midterm Schedule Released',
            type: 'alert',
            date: new Date(2025, 3, 17),
          },
        ];
        const allEvents = [...assignmentEvents, ...contentEvents, ...mockLectures, ...notificationEvents];
        setEvents(allEvents);

        // Notifications
        const smartNotifications = allEvents
          .filter((e) => e.date > new Date() && e.date < addDays(new Date(), 7))
          .map((e) => ({
            id: `notif-${e.id}`,
            message: `Reminder: ${e.title} on ${format(e.date, 'MMM d, HH:mm')}`,
            time: addDays(e.date, -1),
            eventId: e.id,
          }));
        setNotifications([
          ...smartNotifications,
          { id: 'sub1', message: 'New submission for AI Quiz', time: new Date() },
        ]);

        // AI-suggested reminders
        const aiReminders = assignmentEvents
          .filter((e) => e.date > new Date())
          .map((e) => ({
            id: `ai-${e.id}`,
            title: `Prep for ${e.title}`,
            type: 'assignment',
            date: addDays(e.date, -2),
            courseId: e.courseId,
            courseTitle: e.courseTitle,
            aiSuggested: true,
          }));
        setEvents((prev) => [...prev, ...aiReminders]);

        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err.response?.data || err.message);
        setError('Failed to load data. Please try again.');
        setLoading(false);
      }
    };
    fetchData();
  }, [user._id]);

  // Create course
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/courses',
        newCourse,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCourses([...courses, res.data]);
      setNewCourse({ title: '', description: '' });
      setError('');
    } catch (err) {
      setError(err.response?.data.message || 'Failed to create course.');
    }
  };

  // Create assignment
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/assignments',
        newAssignment,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAssignments([...assignments, res.data]);
      setEvents([
        ...events,
        {
          id: res.data._id,
          title: res.data.title,
          type: 'assignment',
          date: new Date(res.data.dueDate),
          courseId: res.data.courseId._id,
          courseTitle: courses.find((c) => c._id === res.data.courseId._id)?.title,
        },
      ]);
      setNewAssignment({ title: '', courseId: '', dueDate: '' });
      setError('');
    } catch (err) {
      setError(err.response?.data.message || 'Failed to create assignment.');
    }
  };

  // Auto-grade assignment
  const handleAutoGrade = async (assignmentId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `http://localhost:5000/api/assignments/${assignmentId}/grade`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAssignments(
        assignments.map((a) =>
          a._id === assignmentId ? { ...a, submissions: res.data.submissions } : a
        )
      );
      setError('');
    } catch (err) {
      setError(err.response?.data.message || 'Failed to auto-grade.');
    }
  };

  // Upload content
  const handleUploadContent = async (e) => {
    e.preventDefault();
    if (!newContent) return;
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', newContent);
      formData.append('courseId', courses[0]?._id || '');
      const res = await axios.post(
        'http://localhost:5000/api/content/upload',
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
      setContent([...content, res.data]);
      setEvents([
        ...events,
        {
          id: res.data._id,
          title: `Content: ${res.data.name}`,
          type: 'content',
          date: new Date(res.data.uploadDate),
          courseId: res.data.courseId,
          courseTitle: courses.find((c) => c._id === res.data.courseId)?.title,
        },
      ]);
      setNewContent(null);
      setError('');
    } catch (err) {
      setError(err.response?.data.message || 'Failed to upload content.');
    }
  };

  // Create custom event
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    const newEventData = {
      id: `custom-${Date.now()}`,
      title: newEvent.title,
      type: newEvent.type,
      date: new Date(newEvent.date),
      courseId: newEvent.courseId || null,
      courseTitle: courses.find((c) => c._id === newEvent.courseId)?.title || null,
    };
    setEvents([...events, newEventData]);
    setNotifications([
      ...notifications,
      {
        id: `notif-${newEventData.id}`,
        message: `Reminder: ${newEventData.title} on ${format(newEventData.date, 'MMM d, HH:mm')}`,
        time: addDays(newEventData.date, -1),
        eventId: newEventData.id,
      },
    ]);
    setNewEvent({ title: '', type: 'assignment', date: '', courseId: '' });
  };

  // Reschedule event
  const handleRescheduleEvent = (eventId, newDate) => {
    setEvents(
      events.map((e) =>
        e.id === eventId ? { ...e, date: new Date(newDate) } : e
      )
    );
    setNotifications(
      notifications.map((n) =>
        n.eventId === eventId
          ? {
              ...n,
              message: `Reminder: ${events.find((e) => e.id === eventId).title} on ${format(
                new Date(newDate),
                'MMM d, HH:mm'
              )}`,
              time: addDays(new Date(newDate), -1),
            }
          : n
      )
    );
    setShowModal(false);
  };

  // Mark event as important
  const handleMarkImportant = (eventId) => {
    setEvents(
      events.map((e) =>
        e.id === eventId ? { ...e, important: !e.important } : e
      )
    );
  };

  // Calendar tile class and content
  const tileClassName = ({ date }) => {
    const hasEvent = events.some((e) => e.date.toDateString() === date.toDateString());
    return hasEvent ? 'event-date' : '';
  };

  const tileContent = ({ date }) => {
    const dateEvents = events.filter(
      (e) => e.date.toDateString() === date.toDateString() && (filterType === 'all' || e.type === filterType)
    );
    if (dateEvents.length === 0) return null;
    return (
      <div className="flex flex-col items-center space-y-1">
        {dateEvents.slice(0, 2).map((event, idx) => (
          <span
            key={`${event.id}-${idx}`}
            className={`text-xs font-medium ${
              event.type === 'assignment'
                ? 'text-green-600'
                : event.type === 'lecture'
                ? 'text-blue-600'
                : event.type === 'content'
                ? 'text-yellow-600'
                : 'text-red-600'
            }`}
            data-tooltip-id="calendar-tooltip"
            data-tooltip-content={event.title}
            onClick={() => {
              setSelectedEvent(event);
              setShowModal(true);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setSelectedEvent(event) && setShowModal(true)}
          >
            {event.type === 'assignment' && '🟢'}
            {event.type === 'lecture' && '🔵'}
            {event.type === 'content' && '🟡'}
            {event.type === 'alert' && '🔴'}
          </span>
        ))}
        {dateEvents.length > 2 && (
          <span className="text-xs text-gray-500">+{dateEvents.length - 2}</span>
        )}
      </div>
    );
  };

  // Chart data
  const chartData = {
    labels: analytics.map((a) => a.studentEmail),
    datasets: [
      {
        label: 'Progress (%)',
        data: analytics.map((a) => a.progress),
        backgroundColor: '#2563EB',
      },
    ],
  };

  // AI summaries
  const engagementTrend = analytics.length > 0
    ? `Engagement: ${Math.round(analytics.reduce((sum, a) => sum + a.progress, 0) / analytics.length)}% average this week`
    : 'No engagement data available';
  const recentSubmissions = notifications.filter((n) => n.message.includes('submission')).slice(0, 3);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-lg text-gray-600">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex">
        <Sidebar role="faculty" isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 sidebar-offset">
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 rounded-lg bg-red-100 p-4 text-red-600 font-medium"
            >
              {error}
            </motion.p>
          )}
          <div className="space-y-8">
            {/* Overview */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              id="overview"
              className="bg-white p-6 rounded-2xl shadow-md"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Overview</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-r from-blue-600 to-blue-400 text-white p-4 rounded-xl flex items-center gap-4 shadow-md"
                >
                  <FaBook className="text-3xl" />
                  <div>
                    <p className="text-2xl font-semibold">{courses.length}</p>
                    <p className="text-sm">Active Courses</p>
                  </div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-r from-yellow-600 to-yellow-400 text-white p-4 rounded-xl flex items-center gap-4 shadow-md"
                >
                  <FaUsers className="text-3xl" />
                  <div>
                    <p className="text-2xl font-semibold">{students.length}</p>
                    <p className="text-sm">Students Enrolled</p>
                  </div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-r from-gray-600 to-gray-400 text-white p-4 rounded-xl flex items-center gap-4 shadow-md"
                >
                  <FaTasks className="text-3xl" />
                  <div>
                    <p className="text-2xl font-semibold">{pendingTasks.length}</p>
                    <p className="text-sm">Pending Tasks</p>
                  </div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-r from-blue-200 to-blue-100 text-blue-800 p-4 rounded-xl flex items-center gap-4 shadow-md"
                >
                  <FaChartLine className="text-3xl" />
                  <div>
                    <p className="text-sm font-medium">{engagementTrend}</p>
                    <p className="text-xs">Engagement Trend</p>
                  </div>
                </motion.div>
              </div>
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white p-6 rounded-xl shadow-md"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Submissions</h3>
                  {recentSubmissions.length > 0 ? (
                    <ul className="space-y-3">
                      {recentSubmissions.map((sub) => (
                        <li key={sub.id} className="text-sm text-gray-600 flex items-center gap-2">
                          <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
                          {sub.message} - {format(sub.time, 'MMM d, HH:mm')}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600 text-sm">No recent submissions.</p>
                  )}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white p-6 rounded-xl shadow-md"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Deadlines</h3>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCalendarView('month')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm ${
                          calendarView === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
                        } hover:bg-blue-700 hover:text-white transition-colors`}
                        aria-label="Switch to month view"
                      >
                        <FaCalendar className="text-lg" /> Month
                      </button>
                      <button
                        onClick={() => setCalendarView('week')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm ${
                          calendarView === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
                        } hover:bg-blue-700 hover:text-white transition-colors`}
                        aria-label="Switch to week view"
                      >
                        <FaList className="text-lg" /> Week
                      </button>
                    </div>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-500"
                      aria-label="Filter events by type"
                    >
                      <option value="all">All Events</option>
                      <option value="assignment">Assignments</option>
                      <option value="lecture">Lectures</option>
                      <option value="content">Content Releases</option>
                      <option value="alert">Alerts</option>
                    </select>
                  </div>
                  <form onSubmit={handleCreateEvent} className="mb-6 flex flex-col sm:flex-row gap-4 max-w-[800px]">
                    <input
                      type="text"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      placeholder="Event Title"
                      className="rounded-lg border border-gray-300 p-3 text-sm flex-1 focus:ring-2 focus:ring-blue-500"
                      required
                      aria-label="Event title"
                    />
                    <select
                      value={newEvent.type}
                      onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                      className="rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-blue-500"
                      aria-label="Event type"
                    >
                      <option value="assignment">Assignment</option>
                      <option value="lecture">Lecture</option>
                      <option value="content">Content</option>
                      <option value="alert">Alert</option>
                    </select>
                    <input
                      type="datetime-local"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-blue-500"
                      required
                      aria-label="Event date and time"
                    />
                    <select
                      value={newEvent.courseId}
                      onChange={(e) => setNewEvent({ ...newEvent, courseId: e.target.value })}
                      className="rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-blue-500"
                      aria-label="Associated course"
                    >
                      <option value="">No Course</option>
                      {courses.map((c) => (
                        <option key={c._id} value={c._id}>{c.title}</option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="rounded-lg bg-blue-600 py-3 px-4 text-white hover:bg-blue-700 flex items-center gap-2 text-sm"
                      aria-label="Add new event"
                    >
                      <FaPlus /> Add
                    </button>
                  </form>
                  <Calendar
                    onChange={setCalendarDate}
                    value={calendarDate}
                    view={calendarView}
                    tileClassName={tileClassName}
                    tileContent={tileContent}
                    className="custom-calendar"
                    aria-label="Faculty event calendar"
                  />
                  <ReactTooltip id="calendar-tooltip" place="top" className="custom-tooltip" />
                </motion.div>
              </div>
            </motion.section>

            {/* Modal */}
            <AnimatePresence>
              {showModal && selectedEvent && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="event-modal-title"
                >
                  <motion.div
                    initial={{ scale: 0.8, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.8, y: 20 }}
                    className="bg-white p-6 rounded-2xl max-w-md w-full shadow-lg"
                  >
                    <h3 id="event-modal-title" className="text-xl font-semibold text-gray-900 mb-4">
                      {selectedEvent.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Type:</strong>{' '}
                      <span
                        className={`font-medium ${
                          selectedEvent.type === 'assignment'
                            ? 'text-green-600'
                            : selectedEvent.type === 'lecture'
                            ? 'text-blue-600'
                            : selectedEvent.type === 'content'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1)}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Date:</strong> {format(selectedEvent.date, 'MMM d, yyyy, HH:mm')}
                    </p>
                    {selectedEvent.courseId && (
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Course:</strong>{' '}
                        <a
                          href={`/courses/${selectedEvent.courseId}`}
                          className="text-blue-600 hover:underline"
                        >
                          {selectedEvent.courseTitle}
                        </a>
                      </p>
                    )}
                    {selectedEvent.aiSuggested && (
                      <p className="text-sm text-gray-500 italic mb-2">AI-Suggested Reminder</p>
                    )}
                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                      <input
                        type="datetime-local"
                        defaultValue={format(selectedEvent.date, "yyyy-MM-dd'T'HH:mm")}
                        onChange={(e) => handleRescheduleEvent(selectedEvent.id, e.target.value)}
                        className="rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-500"
                        aria-label="Reschedule event"
                      />
                      <button
                        onClick={() => handleMarkImportant(selectedEvent.id)}
                        className={`rounded-lg py-2 px-4 text-sm ${
                          selectedEvent.important
                            ? 'bg-yellow-500 text-white'
                            : 'bg-gray-200 text-gray-800'
                        } hover:bg-yellow-600 transition-colors`}
                        aria-label={selectedEvent.important ? 'Unmark as important' : 'Mark as important'}
                      >
                        {selectedEvent.important ? 'Unmark' : 'Mark Important'}
                      </button>
                      <button
                        onClick={() => setShowModal(false)}
                        className="rounded-lg bg-red-600 py-2 px-4 text-white hover:bg-red-700 text-sm"
                        aria-label="Close modal"
                      >
                        Close
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Courses */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              id="courses"
              className="bg-white p-6 rounded-2xl shadow-md"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Course Management</h2>
              <form onSubmit={handleCreateCourse} className="mb-6 flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  placeholder="Course Title"
                  className="flex-1 rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500"
                  required
                  aria-label="Course title"
                />
                <input
                  type="text"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  placeholder="Course Description"
                  className="flex-1 rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500"
                  aria-label="Course description"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 py-3 px-6 text-white hover:bg-blue-700"
                  aria-label="Add course"
                >
                  Add Course
                </button>
              </form>
              <div className="space-y-4">
                {courses.map((course) => (
                  <div key={course._id} className="border-b py-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-blue-600">{course.title}</h3>
                        <p className="text-sm text-gray-600">{course.description}</p>
                      </div>
                      <button
                        onClick={() =>
                          axios
                            .delete(`http://localhost:5000/api/courses/${course._id}`, {
                              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                            })
                            .then(() => setCourses(courses.filter((c) => c._id !== course._id)))
                        }
                        className="text-red-600 hover:text-red-800 text-sm"
                        aria-label={`Delete course ${course.title}`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Assignments */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              id="assignments"
              className="bg-white p-6 rounded-2xl shadow-md"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Assignment Management</h2>
              <form onSubmit={handleCreateAssignment} className="mb-6 flex flex-col sm:flex-row gap-4">
                <select
                  value={newAssignment.courseId}
                  onChange={(e) => setNewAssignment({ ...newAssignment, courseId: e.target.value })}
                  className="rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500"
                  required
                  aria-label="Select course for assignment"
                >
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  placeholder="Assignment Title"
                  className="flex-1 rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500"
                  required
                  aria-label="Assignment title"
                />
                <input
                  type="datetime-local"
                  value={newAssignment.dueDate}
                  onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                  className="rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500"
                  required
                  aria-label="Assignment due date"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 py-3 px-6 text-white hover:bg-blue-700"
                  aria-label="Add assignment"
                >
                  Add
                </button>
              </form>
              <div className="space-y-4">
                {assignments.map((a) => (
                  <div key={a._id} className="flex justify-between items-center py-2">
                    <div>
                      <p className="text-gray-700 font-medium">{a.title}</p>
                      <p className="text-sm text-gray-500">
                        Due: {format(new Date(a.dueDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAutoGrade(a._id)}
                        className="text-yellow-600 hover:text-yellow-700 text-sm"
                        aria-label={`Auto-grade assignment ${a.title}`}
                      >
                        Auto-Grade
                      </button>
                      <button
                        onClick={() => {
                          axios
                            .delete(`http://localhost:5000/api/assignments/${a._id}`, {
                              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                            })
                            .then(() => setAssignments(assignments.filter((x) => x._id !== a._id)));
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                        aria-label={`Delete assignment ${a.title}`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Content Upload */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              id="content"
              className="bg-white p-6 rounded-2xl shadow-md"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Content Upload</h2>
              <form onSubmit={handleUploadContent} className="mb-6 flex flex-col sm:flex-row gap-4">
                <input
                  type="file"
                  onChange={(e) => setNewContent(e.target.files[0])}
                  accept=".pdf,.mp4,.pptx"
                  className="flex-1 text-sm text-gray-600"
                  required
                  aria-label="Upload content file"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 py-3 px-6 text-white hover:bg-blue-700"
                  aria-label="Upload content"
                >
                  Upload
                </button>
              </form>
              <div className="space-y-2">
                {content.length > 0 ? (
                  content.map((c) => (
                    <p key={c._id} className="text-gray-600 text-sm">{c.name} ({c.type})</p>
                  ))
                ) : (
                  <p className="text-gray-600 text-sm">No content available.</p>
                )}
              </div>
            </motion.section>

            {/* Analytics */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              id="analytics"
              className="bg-white p-6 rounded-2xl shadow-md"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Student Insights</h2>
              {analytics.length > 0 ? (
                <>
                  <div className="mb-6">
                    <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                  </div>
                  <div className="space-y-4">
                    {analytics.map((a) => (
                      <div key={a.studentId}>
                        <p className="text-gray-700 font-medium">{a.studentEmail}: {a.progress}%</p>
                        <p className="text-sm text-gray-500">Feedback: {a.feedback}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-gray-600 text-sm">No analytics available.</p>
              )}
            </motion.section>

            {/* Notifications */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              id="notifications"
              className="bg-white p-6 rounded-2xl shadow-md"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Notifications</h2>
              <div className="space-y-2">
                {notifications.map((n) => (
                  <p key={n.id} className="text-sm text-gray-600">
                    {n.message} - {format(n.time, 'MMM d, HH:mm')}
                  </p>
                ))}
              </div>
            </motion.section>

            {/* Settings */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              id="settings"
              className="bg-white p-6 rounded-2xl shadow-md"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Settings</h2>
              <button
                onClick={() => alert('Profile update coming soon!')}
                className="rounded-lg bg-blue-600 py-3 px-6 text-white hover:bg-blue-700"
                aria-label="Update profile"
              >
                Update Profile
              </button>
            </motion.section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FacultyDashboard;