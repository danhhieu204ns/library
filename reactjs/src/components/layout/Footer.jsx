import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-10">
          {/* About Section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <BookOpen className="h-8 w-8 text-yellow-400" style={{ color: "var(--primary-color)" }}/>
              <h3 className="text-2xl font-bold">Không gian đọc Yên
              </h3>
            </div>            
            <p className="text-gray-300 leading-relaxed mb-6 max-w-md">
              Hệ thống quản lý thư viện cộng đồng hiện đại, giúp người dùng dễ dàng 
              tìm kiếm, mượn và quản lý sách một cách thuận tiện. Chúng tôi cam kết mang đến 
              trải nghiệm đọc sách tốt nhất cho cộng đồng.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-yellow-400 hover:text-gray-900 transition-colors" 
                style={{ "--hover-bg": "var(--primary-color)" }}>
                <span className="sr-only">Facebook</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-yellow-400 hover:text-gray-900 transition-colors"
                style={{ "--hover-bg": "var(--primary-color)" }}>
                <span className="sr-only">Twitter</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-yellow-400 hover:text-gray-900 transition-colors"
                style={{ "--hover-bg": "var(--primary-color)" }}>
                <span className="sr-only">Instagram</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-6 border-b border-gray-800 pb-2">Liên kết nhanh</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/books" className="text-gray-300 hover:text-yellow-400 transition-colors flex items-center" style={{ "--hover-text": "var(--primary-color)" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2 rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19V5M5 12l7-7 7 7"/>
                  </svg>
                  <span>Tìm kiếm sách</span>
                </Link>
              </li>              <li>
                <Link to="/about" className="text-gray-300 hover:text-yellow-400 transition-colors flex items-center" style={{ "--hover-text": "var(--primary-color)" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2 rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19V5M5 12l7-7 7 7"/>
                  </svg>
                  <span>Giới thiệu</span>
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-gray-300 hover:text-yellow-400 transition-colors flex items-center" style={{ "--hover-text": "var(--primary-color)" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2 rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19V5M5 12l7-7 7 7"/>
                  </svg>
                  <span>Sự kiện</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-yellow-400 transition-colors flex items-center" style={{ "--hover-text": "var(--primary-color)" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2 rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19V5M5 12l7-7 7 7"/>
                  </svg>
                  <span>Liên hệ</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-semibold mb-6 border-b border-gray-800 pb-2">Thông tin liên hệ</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 text-gray-300">
                <MapPin className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-1" style={{ color: "var(--primary-color)" }} />
                <span>4 Đường Đinh Công Tráng, trị trấn Nga Sơn, huyện Nga Sơn, tỉnh Thanh Hóa</span>
              </div>              <div className="flex items-center space-x-3 text-gray-300">
                <Phone className="h-5 w-5 text-yellow-400 flex-shrink-0" style={{ color: "var(--primary-color)" }} />
                <span>(+84)975 454 911</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Mail className="h-5 w-5 text-yellow-400 flex-shrink-0" style={{ color: "var(--primary-color)" }} />
                <span>khonggiandocyen@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Bottom */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              © {currentYear} Không gian đọc Yên. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-400 hover:text-yellow-400 text-sm" style={{ "--hover-text": "var(--primary-color)" }}>
                Chính sách bảo mật
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-yellow-400 text-sm" style={{ "--hover-text": "var(--primary-color)" }}>
                Điều khoản sử dụng
              </Link>
            </div>
          </div>
        </div>      </div>
      
      {/* Scroll to top button */}
      <button 
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 bg-yellow-400 text-gray-900 rounded-full p-3 shadow-lg hover:bg-yellow-500 transition-colors focus:outline-none"
        style={{ backgroundColor: "var(--primary-color)", color: "var(--text-on-primary)" }}
        aria-label="Lên đầu trang"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5M5 12l7-7 7 7"/>
        </svg>
      </button>
    </footer>
  );
};

export default Footer;
