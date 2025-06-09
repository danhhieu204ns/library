import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search, Users, Calendar, Star, ChevronRight, BookOpenCheck, BookMarked, ArrowRight, AlertCircle } from 'lucide-react';
import { booksAPI } from '../services/api';
import EmptyState from '../components/common/EmptyState';
import YenLibraryGallery from '../components/YenLibraryGallery';

const HomePage = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedBooks = async () => {
      try {
        setIsLoading(true);
        // Get books with highest ratings or marked as featured
        const response = await booksAPI.getBooks({ limit: 6, sort: '-rating', featured: true });
        console.log('Featured books response:', response);
        setFeaturedBooks(response?.data?.data?.books || []);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching featured books:', err);
        setError('Không thể tải sách nổi bật. Vui lòng thử lại sau.');
        setIsLoading(false);
      }
    };

    fetchFeaturedBooks();
  }, []);

  return (    
    <div className="overflow-hidden">      
    {/* Hero Section with Split Design */}
      <section className="relative">
        <div className="flex flex-col md:flex-row">          
          {/* Text Content - Left Side */}
          <div className="md:w-1/2 bg-white py-12 md:py-20 px-6 md:px-12 lg:px-16 flex items-center">
            <div className="max-w-xl mx-auto md:mx-0 md:max-w-none">
              {/* <div className="mb-4 inline-block">                
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-3 py-1 rounded-full" style={{ backgroundColor: "var(--primary-light)", color: "var(--text-on-primary)" }}>
                  Không gian đọc Yên
                </span>
              </div>               */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 leading-tight">
                Chào mừng đến với
                <br />
                <span className="text-yellow-500 relative" style={{ color: "var(--primary-color)" }}>
                  Không gian đọc Yên
                  <span className="absolute bottom-2 left-0 w-full h-3 bg-yellow-200 -z-10 opacity-40" style={{ backgroundColor: "var(--primary-light)" }}></span>
                </span>
              </h1>         
              <p className="text-base sm:text-lg md:text-xl mb-8 text-gray-700 max-w-md">
                Thư viện cộng đồng miễn phí tại Nga Sơn - nơi lan tỏa tri thức và kết nối cộng đồng yêu sách
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/books"
                  className="bg-yellow-400 text-gray-900 px-6 sm:px-8 py-3 rounded-lg font-medium hover:bg-yellow-500 transition-colors inline-flex items-center justify-center space-x-2 shadow-md w-full sm:w-auto" 
                  style={{ backgroundColor: "var(--primary-color)", color: "var(--text-on-primary)" }}
                >
                  <Search className="h-5 w-5" />
                  <span>Tìm kiếm sách</span>
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Link>
                <Link
                  to="/register"
                  className="bg-white border-2 border-gray-300 text-gray-800 px-6 sm:px-8 py-3 rounded-lg font-medium hover:border-gray-400 transition-colors inline-flex items-center justify-center space-x-2 w-full sm:w-auto"
                >
                  <Users className="h-5 w-5" />
                  <span>Đăng ký thành viên</span>
                </Link>
              </div>
            </div>
          </div>
            {/* Image/Visual - Right Side */}
          <div className="md:w-1/2 bg-yellow-400 min-h-[300px] md:min-h-[600px] relative overflow-hidden"  style={{ backgroundColor: "var(--primary-color)" }}>
            <div className="absolute inset-0 bg-opacity-70 flex items-center justify-center">
              <div className="text-center p-8">
                <BookOpenCheck className="h-16 md:h-24 w-16 md:w-24 mx-auto mb-6 md:mb-8 text-gray-900" />
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">10,000+ đầu sách</h2>
                <p className="text-lg md:text-xl text-gray-800">Sẵn sàng cho bạn khám phá</p>
              </div>
            </div>
          </div>
        </div>      </section>

      {/* About Yên Library Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Giới thiệu về Không gian đọc Yên
              </h2>
              <div className="w-24 h-1 bg-yellow-400 mx-auto mb-6" style={{ backgroundColor: "var(--primary-color)" }}></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Main Introduction */}
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-8 rounded-xl border-l-4 border-yellow-400" style={{ borderColor: "var(--primary-color)" }}>
                  <div className="flex items-start space-x-4 mb-4">
                    <BookOpen className="h-8 w-8 text-yellow-500 mt-1 flex-shrink-0" style={{ color: "var(--primary-color)" }} />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Sứ mệnh của chúng tôi</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Không gian đọc Yên được thành lập vào tháng 4 năm 2021 với sứ mệnh lan tỏa tri thức và xây dựng một cộng đồng yêu sách. 
                        Là một thư viện sách cộng đồng hoàn toàn miễn phí tại Nga Sơn, Yên chào đón tất cả những ai mong muốn tìm một góc nhỏ để đọc, học hỏi và kết nối.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl border-l-4 border-blue-400">
                  <div className="flex items-start space-x-4">
                    <BookMarked className="h-8 w-8 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Kho sách đa dạng</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Kho sách của Yên đa dạng với nhiều thể loại phù hợp với bạn đọc tại địa phương, bao gồm truyện tranh, sách văn học Việt Nam và thế giới, 
                        sách kỹ năng sống, kinh doanh, tiếng Anh, danh nhân, tôn giáo – triết học, khoa học – đời sống, lịch sử – văn hóa, tâm lý – giới tính…
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Community Mission */}
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-xl border-l-4 border-green-400">
                  <div className="flex items-start space-x-4">
                    <Users className="h-8 w-8 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Sứ mệnh cộng đồng</h3>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        Không chỉ là một không gian đọc, Yên còn mang trong mình sứ mệnh cộng đồng. Yên có quỹ từ thiện Yên, 
                        nhằm hỗ trợ trẻ em mồ côi tại huyện Nga Sơn, góp phần lan tỏa yêu thương và tạo điều kiện tốt hơn cho các em nhỏ có hoàn cảnh khó khăn.
                      </p>
                      <p className="text-gray-700 leading-relaxed">
                        Bên cạnh đó, Yên thường xuyên tổ chức các buổi workshop, talkshow nhằm giúp cộng đồng phát triển nhiều kỹ năng quan trọng, 
                        từ tư duy, giao tiếp đến ứng dụng kiến thức vào cuộc sống.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Organization Structure */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-xl border-l-4 border-purple-400">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="h-6 w-6 text-purple-500 mr-3" />
                    Cơ cấu tổ chức
                  </h3>
                  <div className="space-y-3">
                    <p className="text-gray-700">🔸 Ban điều hành & Đội ngũ tình nguyện viên luôn đồng hành, phát triển và duy trì các hoạt động của Yên.</p>
                    <p className="text-gray-700 font-medium">🔸 5 ban hoạt động online:</p>
                    <ul className="ml-6 space-y-2 text-gray-700">
                      <li><span className="font-medium text-purple-600">Ban Sách & Bạn Đọc</span> – Quản lý kho sách, hỗ trợ bạn đọc.</li>
                      <li><span className="font-medium text-purple-600">Ban Truyền Thông</span> – Lan tỏa giá trị của Yên qua các nền tảng.</li>
                      <li><span className="font-medium text-purple-600">Ban Nhân Sự Trụ Sở</span> – Kết nối, tổ chức hoạt động tại thư viện.</li>
                      <li><span className="font-medium text-purple-600">Ban Radio</span> – Sản xuất nội dung âm thanh truyền cảm hứng.</li>
                      <li><span className="font-medium text-purple-600">Ban Yentalk</span> – Phụ trách các buổi talkshow, workshop chia sẻ kiến thức.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center mt-12">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-8 rounded-2xl shadow-lg" style={{ background: "linear-gradient(135deg, var(--primary-color), #f59e0b)" }}>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Tham gia cộng đồng Yên ngay hôm nay!
                </h3>
                <p className="text-gray-800 mb-6 max-w-2xl mx-auto">
                  Hãy đến với chúng tôi để cùng nhau xây dựng một cộng đồng yêu sách, lan tỏa tri thức và chia sẻ giá trị tích cực đến mọi người.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/books"
                    className="bg-white text-gray-900 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors inline-flex items-center justify-center space-x-2 shadow-md"
                  >
                    <BookOpen className="h-5 w-5" />
                    <span>Khám phá sách ngay</span>
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors inline-flex items-center justify-center space-x-2 shadow-md"
                  >
                    <Users className="h-5 w-5" />
                    <span>Trở thành thành viên</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Improved Design */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
              Tính năng nổi bật
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Hệ thống quản lý thư viện hiện đại với nhiều tính năng tiện ích
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-yellow-400 group hover:scale-105 transform transition-transform" style={{ borderColor: "var(--primary-color)" }}>
              <div className="mb-6">
                <Search className="h-10 w-10 text-yellow-500 group-hover:text-yellow-600 transition-colors" style={{ color: "var(--primary-color)" }} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Tìm kiếm thông minh</h3>
              <p className="text-gray-600">
                Tìm kiếm sách theo tên, tác giả, thể loại với bộ lọc chi tiết
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-yellow-400 group hover:scale-105 transform transition-transform" style={{ borderColor: "var(--primary-color)" }}>
              <div className="mb-6">
                <BookOpen className="h-10 w-10 text-yellow-500 group-hover:text-yellow-600 transition-colors" style={{ color: "var(--primary-color)" }} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Mượn trả dễ dàng</h3>
              <p className="text-gray-600">
                Quản lý việc mượn trả sách một cách thuận tiện và nhanh chóng
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-yellow-400 group hover:scale-105 transform transition-transform" style={{ borderColor: "var(--primary-color)" }}>
              <div className="mb-6">
                <Calendar className="h-10 w-10 text-yellow-500 group-hover:text-yellow-600 transition-colors" style={{ color: "var(--primary-color)" }} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Đặt trước sách</h3>
              <p className="text-gray-600">
                Đặt trước sách yêu thích khi không có sẵn và nhận thông báo khi có sẵn
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-yellow-400 group hover:scale-105 transform transition-transform" style={{ borderColor: "var(--primary-color)" }}>
              <div className="mb-6">
                <Star className="h-10 w-10 text-yellow-500 group-hover:text-yellow-600 transition-colors" style={{ color: "var(--primary-color)" }} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Đánh giá & Nhận xét</h3>
              <p className="text-gray-600">
                Chia sẻ đánh giá và tham khảo ý kiến từ cộng đồng độc giả
              </p>
            </div>
          </div>
        </div>
      </section>      {/* Stats Section with Modern Design */}
      <section className="py-16 md:py-20" style={{ backgroundColor: "var(--primary-color)" }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Thống kê thư viện
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-10">
            <div className="text-center bg-white p-8 rounded-xl shadow-xl transform transition-transform hover:scale-105">
              <BookMarked className="h-12 w-12 text-yellow-500 mx-auto mb-4" style={{ color: "var(--primary-color)" }} />              <div className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 text-gray-900 flex justify-center items-end">
                <span className="counter">10,000</span>
                <span className="text-xl md:text-2xl ml-1">+</span>
              </div>
              <div className="text-gray-700 font-medium text-base md:text-lg">Đầu sách</div>
            </div>
            
            <div className="text-center bg-white p-8 rounded-xl shadow-xl transform transition-transform hover:scale-105">
              <Users className="h-12 w-12 text-yellow-500 mx-auto mb-4" style={{ color: "var(--primary-color)" }} />              <div className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 text-gray-900 flex justify-center items-end">
                <span className="counter">1,000</span>
                <span className="text-xl md:text-2xl ml-1">+</span>
              </div>
              <div className="text-gray-700 font-medium text-base md:text-lg">Thành viên</div>
            </div>
            
            <div className="text-center bg-white p-8 rounded-xl shadow-xl transform transition-transform hover:scale-105">
              <BookOpen className="h-12 w-12 text-yellow-500 mx-auto mb-4" style={{ color: "var(--primary-color)" }} />              <div className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 text-gray-900 flex justify-center items-end">
                <span className="counter">50</span>
                <span className="text-xl md:text-2xl ml-1">+</span>
              </div>
              <div className="text-gray-700 font-medium text-base md:text-lg">Thể loại</div>
            </div>
            
            <div className="text-center bg-white p-8 rounded-xl shadow-xl transform transition-transform hover:scale-105">
              <Calendar className="h-12 w-12 text-yellow-500 mx-auto mb-4" style={{ color: "var(--primary-color)" }} />              <div className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 text-gray-900">24/7</div>
              <div className="text-gray-700 font-medium text-base md:text-lg">Hỗ trợ online</div>
            </div>
          </div>
        </div>
      </section>      {/* Featured Books Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">Sách nổi bật</h2>
            <Link 
              to="/books" 
              className="mt-4 md:mt-0 flex items-center text-gray-800 hover:text-yellow-500 transition-colors font-medium"
              style={{ color: "var(--text-on-primary)" }}
            >
              Xem tất cả sách
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">            
            {isLoading ? (
              Array(6).fill().map((_, index) => (
                <div key={index} className="bg-gray-100 rounded-lg p-4 animate-pulse h-64 sm:h-80 md:h-96"></div>
              ))
            ) : error ? (
              <div className="col-span-full">
                <EmptyState 
                  type="error" 
                  title="Không thể tải sách"
                  description={error}
                  icon={<AlertCircle className="h-12 w-12 text-red-500" />}
                  action={
                    <button 
                      onClick={() => window.location.reload()} 
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Thử lại
                    </button>
                  }
                />
              </div>
            ) : featuredBooks.length === 0 ? (
              <div className="col-span-full">
                <EmptyState 
                  type="noBooks" 
                  title="Không có sách nổi bật"
                  description="Hiện tại chúng tôi chưa có sách nổi bật nào. Vui lòng quay lại sau."
                  icon={<BookOpen className="h-12 w-12 text-gray-400" />}
                />
              </div>
            ) : (
              featuredBooks.map((book) => (                
              <Link to={`/books/${book._id}`} key={book._id} className="group">
                  <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow h-full flex flex-col">
                    <div className="h-48 sm:h-56 md:h-64 overflow-hidden bg-gray-200">
                      {book.coverImage ? (
                        <img 
                          src={book.coverImage} 
                          alt={book.title} 
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-yellow-100" style={{ backgroundColor: "var(--primary-light)" }}>
                          <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-yellow-500" style={{ color: "var(--primary-color)" }} />
                        </div>
                      )}
                    </div>                    <div className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col">
                      <div className="flex items-center mb-2">
                        <span className="text-xs sm:text-sm font-medium px-2 py-1 bg-yellow-100 text-yellow-800 rounded truncate max-w-[70%]" style={{ backgroundColor: "var(--primary-light)", color: "var(--text-on-primary)" }}>
                          {book.genre.genre_name}
                        </span>
                        {book.rating && (
                          <div className="flex items-center ml-auto">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" style={{ color: "var(--primary-color)" }} />
                            <span className="ml-1 text-xs sm:text-sm font-medium">{book.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 group-hover:text-yellow-500 transition-colors line-clamp-2" style={{ "--hover-color": "var(--primary-color)" }}>
                        {book.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2">
                        {book.author}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 sm:line-clamp-3 mb-3 sm:mb-4 flex-1">
                        {book.description}
                      </p>
                      <div className="mt-auto">
                        <span className="inline-flex items-center text-xs sm:text-sm font-medium text-yellow-500 group-hover:text-yellow-600" style={{ color: "var(--primary-color)" }}>
                          Xem chi tiết
                          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <YenLibraryGallery />
        </div>
      </section>

      {/* Modern CTA Section */}
      <section className="py-16 md:py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-2/3 p-6 sm:p-8 md:p-12 lg:p-16">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 leading-tight">
                  Bắt đầu hành trình<br className="hidden sm:block" /> khám phá tri thức
                </h2>                <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 md:mb-8 max-w-xl">
                  Tham gia cộng đồng độc giả và khám phá thế giới sách phong phú cùng chúng tôi
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/register"
                    className="bg-yellow-400 text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium hover:bg-yellow-500 transition-colors inline-flex items-center justify-center space-x-2 shadow-lg w-full sm:w-auto"
                    style={{ backgroundColor: "var(--primary-color)", color: "var(--text-on-primary)" }}
                  >
                    <Users className="h-5 w-5" />
                    <span>Đăng ký ngay</span>
                  </Link>
                  <Link
                    to="/books"
                    className="bg-transparent border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium hover:bg-white/10 transition-colors inline-flex items-center justify-center space-x-2 w-full sm:w-auto"
                  >
                    <Search className="h-5 w-5" />
                    <span>Khám phá sách</span>
                  </Link>
                </div>
              </div>
              <div className="md:w-1/3 bg-yellow-400 flex items-center justify-center p-8 hidden md:block" style={{ backgroundColor: "var(--primary-color)" }}>
                <div className="text-center">
                  <BookOpen className="h-24 w-24 text-gray-900 mx-auto" />
                  <div className="text-xl font-bold text-gray-900 mt-4">Thư viện mở 24/7</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
