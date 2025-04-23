import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useParams, Link } from 'react-router-dom';
import AssignmentSubmission from './AssignmentSubmission';

const CourseDetail = () => {
  const { user } = useAuth();
  const { courseId } = useParams();
  const [newAssignment, setNewAssignment] = useState({ title: '', dueDate: '', isQuiz: false });
  const [aiQuizLoading, setAiQuizLoading] = useState(false);

  // Dummy data
  const course = {
    id: courseId,
    title: 'Introduction to AI',
    description: 'Learn the fundamentals of artificial intelligence and machine learning.',
    faculty: 'Dr. Smith',
  };

  const assignments = [
    { id: 1, title: 'AI Basics Quiz', dueDate: '2025-05-01', submitted: false, type: 'quiz' },
    { id: 2, title: 'ML Project', dueDate: '2025-06-01', submitted: true, type: 'project' },
  ];

  const handleAddAssignment = (e) => {
    e.preventDefault();
    // Placeholder for API call
    console.log('New assignment:', newAssignment);
    setNewAssignment({ title: '', dueDate: '', isQuiz: false });
  };

  const handleGenerateQuiz = () => {
    setAiQuizLoading(true);
    // Simulate AI quiz generation
    setTimeout(() => {
      setNewAssignment({
        title: 'AI-Generated Quiz: Machine Learning Basics',
        dueDate: '',
        isQuiz: true,
      });
      setAiQuizLoading(false);
    }, 2000);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
        <p className="mt-2 text-gray-600">{course.description}</p>
        <p className="mt-2 text-gray-600">Faculty: {course.faculty}</p>
      </div>
      {user.role === 'faculty' && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Assignment</h2>
          <form onSubmit={handleAddAssignment} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Assignment Title
              </label>
              <input
                type="text"
                id="title"
                value={newAssignment.title}
                onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200"
                placeholder="Enter assignment title"
                required
                aria-label="Assignment title"
              />
            </div>
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                value={newAssignment.dueDate}
                onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200"
                required
                aria-label="Due date"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isQuiz"
                checked={newAssignment.isQuiz}
                onChange={(e) => setNewAssignment({ ...newAssignment, isQuiz: e.target.checked })}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                aria-label="Mark as quiz"
              />
              <label htmlFor="isQuiz" className="ml-2 text-sm font-medium text-gray-700">
                Mark as Quiz
              </label>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleGenerateQuiz}
                disabled={aiQuizLoading}
                className="bg-purple-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-purple-700 transition duration-200 disabled:bg-purple-400 disabled:cursor-not-allowed"
              >
                {aiQuizLoading ? 'Generating...' : 'Generate AI Quiz'}
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-amber-500 hover:text-gray-900 transition duration-200"
              >
                Add Assignment
              </button>
            </div>
          </form>
        </div>
      )}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Assignments</h2>
        {assignments.length ? (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                  <span className="text-sm text-purple-600">{assignment.type}</span>
                </div>
                <p className="mt-2 text-gray-600">Due: {assignment.dueDate}</p>
                <p className="mt-2 text-gray-600">
                  Status: {assignment.submitted ? 'Submitted' : 'Pending'}
                </p>
                {user.role === 'student' && !assignment.submitted && (
                  <Link
                    to={`/courses/${courseId}/assignments/${assignment.id}/submit`}
                    className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Submit Assignment
                  </Link>
                )}
                {user.role === 'faculty' && (
                  <Link
                    to={`/courses/${courseId}/assignments/${assignment.id}/submissions`}
                    className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View Submissions
                  </Link>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No assignments available.</p>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;