import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [learningPath, setLearningPath] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [forumPost, setForumPost] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [chatQuery, setChatQuery] = useState('');
  const [chatResponse, setChatResponse] = useState('');

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        // Courses
        const courseRes = await axios.get('http://localhost:5000/api/courses', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(courseRes.data);

        // Assignments
        const assignRes = await axios.get('http://localhost:5000/api/assignments', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAssignments(assignRes.data);

        // Announcements
        const announceRes = await axios.get('http://localhost:5000/api/announcements', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnnouncements(announceRes.data);

        // Learning Path (mocked)
        setLearningPath([
          { id: 1, task: 'Complete Module 1 of AI Basics', priority: 'High' },
          { id: 2, task: 'Review quiz feedback', priority: 'Medium' },
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

  // Submit assignment
  const handleSubmitAssignment = async (assignmentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/assignments/${assignmentId}/submit`,
        { content: 'Student submission' }, // Placeholder
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Assignment submitted!');
    } catch (err) {
      setError(err.response?.data.message || 'Failed to submit assignment.');
    }
  };

  // Post to forum
  const handlePostForum = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/courses/${courseId}/forum`,
        { message: forumPost },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setForumPost('');
      alert('Posted to forum!');
    } catch (err) {
      setError(err.response?.data.message || 'Failed to post to forum.');
    }
  };

  // AI Q&A
  const handleChatQuery = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/ai/query',
        { query: chatQuery },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChatResponse(res.data.answer);
      setChatQuery('');
    } catch (err) {
      setChatResponse('Sorry, I couldn’t process that. Try again!');
    }
  };

  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Student Dashboard</h1>
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
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Overview</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-gray-600">Enrolled Courses: {courses.length}</p>
                  <p className="text-gray-600">Assignments Due: {assignments.length}</p>
                </div>
                <div>
                  <h3 className="text-md font-semibold">Announcements</h3>
                  {announcements.slice(0, 2).map((a) => (
                    <p key={a._id} className="text-sm text-gray-500">
                      {a.message} - {format(new Date(a.createdAt), 'MMM d, HH:mm')}
                    </p>
                  ))}
                </div>
                <div>
                  <h3 className="text-md font-semibold">Next Steps</h3>
                  {learningPath.map((task) => (
                    <p key={task.id} className="text-sm text-gray-500">
                      {task.task} ({task.priority})
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Courses */}
            <div className="bg-white p-6 rounded-lg shadow-md col-span-2">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Courses</h2>
              {courses.map((course) => (
                <div key={course._id} className="mb-4 border-b pb-4">
                  <h3 className="text-lg font-semibold text-primary">{course.title}</h3>
                  <p className="text-gray-600">{course.description}</p>
                  {(course.modules || []).map((m) => (
                    <p key={m._id} className="text-sm text-gray-500 ml-4">
                      - {m.title} ({m.progress || 0}% complete)
                    </p>
                  ))}
                  <div className="mt-2">
                    <h4 className="text-md font-semibold text-gray-700">Assignments</h4>
                    {assignments
                      .filter((a) => a.courseId._id === course._id)
                      .map((a) => (
                        <div key={a._id} className="flex justify-between mt-2">
                          <div>
                            <p className="text-gray-600">{a.title}</p>
                            <p className="text-sm text-gray-500">
                              Due: {format(new Date(a.dueDate), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <button
                            onClick={() => handleSubmitAssignment(a._id)}
                            className="rounded-md bg-primary py-1 px-3 text-white hover:bg-blue-700"
                          >
                            Submit
                          </button>
                        </div>
                      ))}
                  </div>
                  <div className="mt-2">
                    <h4 className="text-md font-semibold text-gray-700">Forum</h4>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handlePostForum(course._id);
                      }}
                      className="flex gap-4"
                    >
                      <input
                        type="text"
                        value={forumPost}
                        onChange={(e) => setForumPost(e.target.value)}
                        placeholder="Post to forum..."
                        className="flex-1 rounded-md border border-gray-300 p-2 focus:border-primary focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="rounded-md bg-primary py-2 px-4 text-white hover:bg-blue-700"
                      >
                        Post
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Q&A */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">AI Q&A Assistant</h2>
              <button
                onClick={() => setShowChat(!showChat)}
                className="mb-4 text-secondary hover:text-yellow-700"
              >
                {showChat ? 'Hide Chat' : 'Show Chat'}
              </button>
              {showChat && (
                <div>
                  <form onSubmit={handleChatQuery} className="flex gap-4">
                    <input
                      type="text"
                      value={chatQuery}
                      onChange={(e) => setChatQuery(e.target.value)}
                      placeholder="Ask about course material..."
                      className="flex-1 rounded-md border border-gray-300 p-2 focus:border-primary focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="rounded-md bg-primary py-2 px-4 text-white hover:bg-blue-700"
                    >
                      Ask
                    </button>
                  </form>
                  {chatResponse && (
                    <p className="mt-4 text-gray-600">{chatResponse}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;