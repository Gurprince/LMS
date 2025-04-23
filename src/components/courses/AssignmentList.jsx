import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const AssignmentList = () => {
  const { user } = useAuth();

  // Dummy data
  const assignments = [
    { id: 1, courseId: 1, title: 'AI Basics Quiz', course: 'Introduction to AI', dueDate: '2025-05-01', submitted: false, type: 'quiz' },
    { id: 2, courseId: 1, title: 'ML Project', course: 'Introduction to AI', dueDate: '2025-06-01', submitted: true, type: 'project' },
    { id: 3, courseId: 3, title: 'Data Analysis', course: 'Data Science', dueDate: '2025-05-15', submitted: false, type: 'assignment' },
  ];

  const filteredAssignments = assignments.filter((assignment) => {
    if (user.role === 'student') return !assignment.submitted;
    return true; // Faculty sees all
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
        <p className="mt-2 text-gray-600">
          {user.role === 'student' ? 'Your pending assignments' : 'Manage assignments'}
        </p>
      </div>
      <div className="space-y-4">
        {filteredAssignments.length ? (
          filteredAssignments.map((assignment) => (
            <div key={assignment.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                <span className="text-sm text-purple-600">{assignment.type}</span>
              </div>
              <p className="mt-2 text-gray-600">Course: {assignment.course}</p>
              <p className="mt-2 text-gray-600">Due: {assignment.dueDate}</p>
              {user.role === 'student' && (
                <Link
                  to={`/courses/${assignment.courseId}/assignments/${assignment.id}/submit`}
                  className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium"
                >
                  Submit Assignment
                </Link>
              )}
              {user.role === 'faculty' && (
                <Link
                  to={`/courses/${assignment.courseId}/assignments/${assignment.id}/submissions`}
                  className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium"
                >
                  View Submissions
                </Link>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-600">No assignments available.</p>
        )}
      </div>
    </div>
  );
};

export default AssignmentList;