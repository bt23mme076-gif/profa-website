import { Link } from 'react-router-dom';
import { FiLinkedin, FiTwitter, FiMail, FiArrowUp } from 'react-icons/fi';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#1a1a1a] text-white pt-12 sm:pt-16 pb-8 px-6 sm:px-8 lg:px-12">
      <div className="max-w-4xl mx-auto">
        
        {/* Brand/Logo */}
        <div className="mb-8 sm:mb-10">
          <h3 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
            Prof. Vishal Gupta
          </h3>
        </div>

        {/* Navigation Grid - 2 Columns */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-10 sm:mb-12">
          <a href="#home" className="text-white hover:text-gray-300 transition-colors text-base sm:text-lg font-medium border-b border-transparent hover:border-white pb-1 inline-block w-fit">
            Home
          </a>
          <a href="#about" className="text-white hover:text-gray-300 transition-colors text-base sm:text-lg font-medium border-b border-transparent hover:border-white pb-1 inline-block w-fit">
            About
          </a>
          <a href="#research" className="text-white hover:text-gray-300 transition-colors text-base sm:text-lg font-medium border-b border-transparent hover:border-white pb-1 inline-block w-fit">
            Research
          </a>
          <a href="#courses" className="text-white hover:text-gray-300 transition-colors text-base sm:text-lg font-medium border-b border-transparent hover:border-white pb-1 inline-block w-fit">
            Courses
          </a>
          <a href="#books" className="text-white hover:text-gray-300 transition-colors text-base sm:text-lg font-medium border-b border-transparent hover:border-white pb-1 inline-block w-fit">
            Books
          </a>
          <a href="#contact" className="text-white hover:text-gray-300 transition-colors text-base sm:text-lg font-medium border-b border-transparent hover:border-white pb-1 inline-block w-fit">
            Contact
          </a>
          <Link to="/trainings" className="text-white hover:text-gray-300 transition-colors text-base sm:text-lg font-medium border-b border-transparent hover:border-white pb-1 inline-block w-fit">
            Trainings
          </Link>
          <a href="#newsletter" className="text-white hover:text-gray-300 transition-colors text-base sm:text-lg font-medium border-b border-transparent hover:border-white pb-1 inline-block w-fit">
            Newsletter
          </a>
        </div>

        {/* Social Icons Row */}
        <div className="flex gap-4 mb-10 sm:mb-12 flex-wrap">
          <a href="#" className="w-11 h-11 sm:w-12 sm:h-12 bg-white/10 hover:bg-white hover:text-[#1a1a1a] rounded-full flex items-center justify-center transition-all">
            <FiLinkedin size={20} />
          </a>
          <a href="#" className="w-11 h-11 sm:w-12 sm:h-12 bg-white/10 hover:bg-white hover:text-[#1a1a1a] rounded-full flex items-center justify-center transition-all">
            <FiTwitter size={20} />
          </a>
          <a href="mailto:prof@iima.ac.in" className="w-11 h-11 sm:w-12 sm:h-12 bg-white/10 hover:bg-white hover:text-[#1a1a1a] rounded-full flex items-center justify-center transition-all">
            <FiMail size={20} />
          </a>
        </div>

        {/* Newsletter Section */}
        <div className="mb-10 sm:mb-12 pb-10 sm:pb-12 border-b border-white/10">
          <h4 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">
            Newsletter
          </h4>
          <a 
            href="#newsletter" 
            className="text-white hover:text-gray-300 transition-colors text-base sm:text-lg font-medium border-b border-white hover:border-gray-300 pb-1 inline-block"
          >
            Subscribe for the latest
          </a>
        </div>

        {/* Bottom - Copyright & Admin */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-sm text-gray-400">
            © {currentYear} Prof. Vishal Gupta.<br className="sm:hidden" />
            <span className="hidden sm:inline"> </span>All rights reserved.
          </div>
          
          <div className="flex gap-4 text-sm">
            <Link to="/admin" className="text-gray-500 hover:text-white transition-colors">
              Admin
            </Link>
            <button 
              onClick={scrollToTop}
              className="text-gray-500 hover:text-white transition-colors flex items-center gap-1"
            >
              Back to top <FiArrowUp size={14} />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}