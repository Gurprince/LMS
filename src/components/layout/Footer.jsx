const Footer = () => {
    return (
      <footer className="bg-white shadow-inner p-6 mt-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">SmartLMS</h3>
            <p className="text-gray-600">
              Empowering education with AI-driven learning solutions.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-gray-600 hover:text-purple-600 transition-colors duration-200">
                  About
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-600 hover:text-purple-600 transition-colors duration-200">
                  Contact
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-gray-600 hover:text-purple-600 transition-colors duration-200">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Us</h3>
            <p className="text-gray-600">Email: support@smartlms.com</p>
            <p className="text-gray-600">Phone: (123) 456-7890</p>
          </div>
        </div>
        <div className="mt-8 text-center text-gray-600">
          &copy; {new Date().getFullYear()} SmartLMS. All rights reserved.
        </div>
      </footer>
    );
  };
  
  export default Footer;