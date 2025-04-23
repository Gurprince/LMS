import { useAuth } from '../../context/AuthContext';
import { useParams } from 'react-router-dom';

const SubmissionReview = () => {
  const { user } = useAuth();
  const { courseId, assignmentId } = useParams();

  // Dummy data
  const assignment = {
    id: assignmentId,
    title: 'AI Basics Quiz',
    course: 'Introduction to AI',
  };

  const submissions = [
    { id: 1, student: 'John Doe', file: 'quiz.pdf', submittedAt: '2025-04-20', grade: null },
    { id: 2, student: 'Jane Smith', file: 'answers.docx', submittedAt: '2025-04-21', grade: 'A' },
  ];

  const handleGrade = (submissionId, grade) => {
    // Placeholder for AI grading
    console.log(`Grading submission ${submissionId} with ${grade}`);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Review: {assignment.title}</h1>
        <p className="mt-2 text-gray-600">Course: {assignment.course}</p>
      </div>
      <div className="space-y-4">
        {submissions.length ? (
          submissions.map((submission) => (
            <div key={submission.id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900">{submission.student}</h3>
              <p className="mt-2 text-gray-600">File: {submission.file}</p>
              <p className="mt-2 text-gray-600">Submitted: {submission.submittedAt}</p>
              <p className="mt-2 text-gray-600">
                Grade: {submission.grade || 'Pending'}
              </p>
              {!submission.grade && (
                <div className="mt-4 flex gap-4">
                  <button
                    onClick={() => handleGrade(submission.id, 'A')}
                    className="bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-amber-500 hover:text-gray-900 transition duration-200"
                  >
                    Grade A
                  </button>
                  <button
                    onClick={() => handleGrade(submission.id, 'AI')}
                    className="bg-purple-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-purple-700 transition duration-200"
                  >
                    AI Grade
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-600">No submissions yet.</p>
        )}
      </div>
    </div>
  );
};

export default SubmissionReview;