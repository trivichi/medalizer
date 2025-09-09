export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Blood Report Analyzer</h3>
            <p className="text-gray-400">Making health data understandable</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Navigations</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-gray-400 hover:text-white">Features</a></li>
              <li><a href="#how-it-works" className="text-gray-400 hover:text-white">How it Works</a></li>
              <li><a href="#about" className="text-gray-400 hover:text-white">About</a></li>
            </ul>
          </div>
          
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Blood Report Analyzer</p>
        </div>
      </div>
    </footer>
  );
}
