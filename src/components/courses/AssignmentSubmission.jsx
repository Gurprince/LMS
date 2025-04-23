import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { FaUpload } from 'react-icons/fa';

const AssignmentSubmission = () => {
  const { user } = useAuth();
  const { courseId, assignmentId } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  // Dummy assignment data
  const assignment = {
    id: assignmentId,
    title: 'AI Basics Quiz',
    dueDate: '2025-05-01',
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
      setError('');
    },
    multiple: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    try {
      // Placeholder for API call
      console.log('Submitting file:', file.name, 'for assignment:', assignmentId);
      navigate(`/courses/${courseId}`);
    } catch (err) {
      setError('Submission failed. Please try again.');
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Submit: {assignment.title}</h1>
        <p className="mt-2 text-gray-600">Due: {assignment.dueDate}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
        {error && (
          <p className="text-red-600 bg-red-50 p-3 rounded-md mb-6 text-center font-medium">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-md p-6 text-center transition-colors duration-200 ${
              isDragActive ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-gray-50'
            }`}
          >
            <input {...getInputProps()} aria-label="Upload assignment file" />
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-4" />
            {file ? (
              <p className="text-gray-700">Selected: {file.name}</p>
            ) : (
              <p className="text-gray-600">
                Drag and drop your file here, or{' '}
                <span className="text-blue-600 hover:underline cursor-pointer">click to upload</span>
              </p>
            )}
            <p className="text-sm text-gray-500 mt-2">Accepted: PDF, DOCX, JPG, PNG</p>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-amber-500 hover:text-gray-900 transition duration-200"
          >
            Submit Assignment
          </button>
        </form>
      </div>
    </div>
  );
};

export default AssignmentSubmission;