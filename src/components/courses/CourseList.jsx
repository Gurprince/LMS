import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

const CourseList = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Dummy data with categories
  const courses = [
    { id: 1, title: 'Introduction to AI', description: 'Learn AI basics.', faculty: 'Dr. Smith', category: 'AI', enrolled: true, status: 'active', role: 'faculty' },
    { id: 2, title: 'Web Development', description: 'Build modern websites.', faculty: 'Prof. Jones', category: 'Web', enrolled: false, status: 'inactive', role: 'faculty' },
    { id: 3, title: 'Data Science', description: 'Analyze data with Python.', faculty: 'Dr. Lee', category: 'Data', enrolled: true, status: 'active', role: 'student' },
  ];

  const filteredCourses = courses
    .filter((course) => {
      if (user.role === 'student') return course.enrolled;
      if (user.role === 'faculty') return course.role === 'faculty';
      if (filterRole !== 'all') return course.role === filterRole;
      return true;
    })
    .filter((course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((course) => filterCategory === 'all' || course.category === filterCategory)
    .filter((course) => filterStatus === 'all' || course.status === filterStatus);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
        <p className="mt-2 text-gray-600">Browse {user.role === 'student' ? 'your enrolled' : user.role === 'faculty' ? 'your teaching' : 'all'} courses.</p>
      </div>
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200"
            aria-label="Search courses"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200"
          aria-label="Filter by category"
        >
          <option value="all">All Categories</option>
          <option value="AI">AI</option>
          <option value="Web">Web</option>
          <option value="Data">Data</option>
        </select>
        {user.role === 'admin' && (
          <>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200"
              aria-label="Filter by role"
            >
              <option value="all">All Roles</option>
              <option value="faculty">Faculty</option>
              <option value="student">Student</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200"
              aria-label="Filter by status"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.length ? (
          filteredCourses.map((course) => (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col"
            >
              <div className="flex justify-between items-start">
                <h2 className="text-lg font-semibold text-gray-900 truncate">{course.title}</h2>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    course.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {course.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600 truncate">{course.description}</p>
              <p className="mt-1 text-sm text-gray-600">Faculty: {course.faculty}</p>
              <span className="mt-2 text-sm text-purple-600">{course.category}</span>
              <span className="mt-3 inline-block text-blue-600 hover:text-blue-700 font-medium text-sm">
                {user.role === 'student' ? 'View Details' : user.role === 'faculty' ? 'Manage Course' : 'Edit Course'}
              </span>
            </Link>
          ))
        ) : (
          <p className="text-gray-600 col-span-full text-center">No courses found.</p>
        )}
      </div>
    </div>
  );
};

export default CourseList;