import { Link } from 'react-router-dom';
import { FiLinkedin, FiTwitter, FiMail, FiArrowUp, FiUser } from 'react-icons/fi';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#1a1a1a] text-white pt-20 pb-10 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* 1. Brand Section */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-serif font-bold mb-6 tracking-tighter uppercase">
              Prof. Vishal Gupta
            </h3>
            <p className="text-gray-400 font-serif italic leading-relaxed mb-6">
              Professor of Strategy and Organizational Behavior at Indian Institute of Management Ahmedabad.
            </p>
            <div className="flex gap-5">
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><FiLinkedin size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><FiTwitter size={20} /></a>
              <a href="mailto:prof@iima.ac.in" className="text-gray-400 hover:text-white transition-colors"><FiMail size={20} /></a>
            </div>
          </div>

          {/* 2. Navigation Links */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-8 text-center md:text-left">Navigation</h4>
            <ul className="space-y-4 text-sm font-medium uppercase tracking-widest text-center md:text-left">
              <li><a href="#home" className="text-gray-400 hover:text-white transition-all">Home</a></li>
              <li><a href="#about" className="text-gray-400 hover:text-white transition-all">About me</a></li>
              <li><a href="#research" className="text-gray-400 hover:text-white transition-all">Research</a></li>
              <li><a href="#books" className="text-gray-400 hover:text-white transition-all">Books</a></li>
            </ul>
          </div>

          {/* 3. Resources Links */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-8 text-center md:text-left">Resources</h4>
            <ul className="space-y-4 text-sm font-medium uppercase tracking-widest text-center md:text-left">
              <li><a href="#courses" className="text-gray-400 hover:text-white transition-all">Courses</a></li>
              <li><a href="#newsletter" className="text-gray-400 hover:text-white transition-all">Newsletter</a></li>
              <li><a href="#contact" className="text-gray-400 hover:text-white transition-all">Talk to me</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-all">CV / Resume</a></li>
            </ul>
          </div>

          {/* 4. Contact Info */}
          <div className="text-center md:text-left">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-8">Location</h4>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              IIM Ahmedabad, Vastrapur,<br />
              Ahmedabad, Gujarat 380015
            </p>
            <div className="flex flex-col items-center md:items-start gap-3">
              <button 
                onClick={scrollToTop}
                className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border border-white/20 px-4 py-2 rounded-full hover:bg-white hover:text-black transition-all"
              >
                Back to top <FiArrowUp />
              </button>
              <Link 
                to="/admin"
                className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border border-white/10 px-4 py-2 rounded-full hover:bg-white hover:text-black transition-all opacity-30 hover:opacity-100"
              >
                Admin <FiUser />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 text-center">
            © {currentYear} Prof. Vishal Gupta. All Rights Reserved.
          </p>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">
            Crafted with Precision for Academia
          </p>
        </div>
      </div>
    </footer>
  );
}