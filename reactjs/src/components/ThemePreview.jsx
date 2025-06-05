import React, { useState } from 'react';
import { BookOpen, Users, Calendar, Star, Heart, Palette } from 'lucide-react';

const ThemePreview = () => {
  const [currentTheme, setCurrentTheme] = useState('bright-yellow');
  const themes = {
    'bright-yellow': {
      name: 'Vàng Rực Rỡ #FFF000 (Hiện tại)',
      primary: '#FFF000',
      primaryLight: '#FFFBCC',
      secondary: '#059669',
      accent: '#8B5CF6',
      background: '#FFFBEB',
      description: 'Theme với màu vàng rực rỡ #FFF000, nổi bật và thu hút'
    },
    'warm-golden': {
      name: 'Ấm áp Vàng Mật',
      primary: '#F59E0B',
      primaryLight: '#FEF3C7',
      secondary: '#059669',
      accent: '#8B5CF6',
      background: '#FFFBEB',
      description: 'Theme ấm áp với màu vàng mật ong, tạo cảm giác bình yên và thân thiện'
    },
    'sage-green': {
      name: 'Xanh Yên Bình',
      primary: '#059669',
      primaryLight: '#D1FAE5',
      secondary: '#F59E0B',
      accent: '#8B5CF6',
      background: '#F0FDF4',
      description: 'Theme xanh lá nhẹ nhàng, tượng trưng cho sự bình yên và tri thức'
    },
    'warm-brown': {
      name: 'Nâu Gỗ Ấm',
      primary: '#92400E',
      primaryLight: '#FEF3C7',
      secondary: '#065F46',
      accent: '#DC2626',
      background: '#FFFBEB',
      description: 'Theme nâu ấm như sách cũ, tạo cảm giác cổ điển và thân thuộc'
    },
    'soft-purple': {
      name: 'Tím Dịu Dàng',
      primary: '#8B5CF6',
      primaryLight: '#F3E8FF',
      secondary: '#F59E0B',
      accent: '#EC4899',
      background: '#FEFCFF',
      description: 'Theme tím nhẹ nhàng, tượng trưng cho trí tuệ và sáng tạo'
    },
    'ocean-blue': {
      name: 'Xanh Biển Yên',
      primary: '#0EA5E9',
      primaryLight: '#E0F2FE',
      secondary: '#F59E0B',
      accent: '#10B981',
      background: '#F8FAFC',
      description: 'Theme xanh biển tươi mát, mang lại cảm giác rộng mở và sảng khoái'
    }
  };

  const applyTheme = (themeKey) => {
    const theme = themes[themeKey];
    const root = document.documentElement;
      // Apply CSS variables based on theme
    switch(themeKey) {
      case 'bright-yellow':
        root.style.setProperty('--primary-color', '#FFF000');
        root.style.setProperty('--primary-light', '#FFFBCC');
        root.style.setProperty('--secondary-color', '#059669');
        root.style.setProperty('--accent-color', '#8B5CF6');
        root.style.setProperty('--bg-primary', '#FFFBEB');
        root.style.setProperty('--bg-secondary', '#FEF3C7');
        root.style.setProperty('--text-on-primary', '#1F2937');
        break;
      case 'warm-golden':
        root.style.setProperty('--primary-color', '#F59E0B');
        root.style.setProperty('--primary-light', '#FEF3C7');
        root.style.setProperty('--secondary-color', '#059669');
        root.style.setProperty('--accent-color', '#8B5CF6');
        root.style.setProperty('--bg-primary', '#FFFBEB');
        root.style.setProperty('--bg-secondary', '#FEF3C7');
        root.style.setProperty('--text-on-primary', '#1F2937');
        break;
      case 'sage-green':
        root.style.setProperty('--primary-color', '#059669');
        root.style.setProperty('--primary-light', '#D1FAE5');
        root.style.setProperty('--secondary-color', '#F59E0B');
        root.style.setProperty('--accent-color', '#8B5CF6');
        root.style.setProperty('--bg-primary', '#F0FDF4');
        root.style.setProperty('--bg-secondary', '#DCFCE7');
        root.style.setProperty('--text-on-primary', '#FFFFFF');
        break;
      case 'warm-brown':
        root.style.setProperty('--primary-color', '#92400E');
        root.style.setProperty('--primary-light', '#FEF3C7');
        root.style.setProperty('--secondary-color', '#065F46');
        root.style.setProperty('--accent-color', '#DC2626');
        root.style.setProperty('--bg-primary', '#FFFBEB');
        root.style.setProperty('--bg-secondary', '#FEF3C7');
        root.style.setProperty('--text-on-primary', '#FFFFFF');
        break;
      case 'soft-purple':
        root.style.setProperty('--primary-color', '#8B5CF6');
        root.style.setProperty('--primary-light', '#F3E8FF');
        root.style.setProperty('--secondary-color', '#F59E0B');
        root.style.setProperty('--accent-color', '#EC4899');
        root.style.setProperty('--bg-primary', '#FEFCFF');
        root.style.setProperty('--bg-secondary', '#FAF5FF');
        root.style.setProperty('--text-on-primary', '#FFFFFF');
        break;
      case 'ocean-blue':
        root.style.setProperty('--primary-color', '#0EA5E9');
        root.style.setProperty('--primary-light', '#E0F2FE');
        root.style.setProperty('--secondary-color', '#F59E0B');
        root.style.setProperty('--accent-color', '#10B981');
        root.style.setProperty('--bg-primary', '#F8FAFC');
        root.style.setProperty('--bg-secondary', '#F1F5F9');        root.style.setProperty('--text-on-primary', '#FFFFFF');
        break;
      default: // bright-yellow
        root.style.setProperty('--primary-color', '#FFF000');
        root.style.setProperty('--primary-light', '#FFFBCC');
        root.style.setProperty('--secondary-color', '#059669');
        root.style.setProperty('--accent-color', '#8B5CF6');
        root.style.setProperty('--bg-primary', '#FFFBEB');
        root.style.setProperty('--bg-secondary', '#FEF3C7');
        root.style.setProperty('--text-on-primary', '#1F2937');
    }
    
    setCurrentTheme(themeKey);
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <Palette className="inline-block mr-3 h-10 w-10" style={{ color: 'var(--primary-color)' }} />
            Chọn Theme cho Không gian đọc Yên
          </h1>
          <p className="text-xl text-gray-600">
            Lựa chọn bảng màu phù hợp nhất với tông màu và cảm xúc bạn muốn truyền tải
          </p>
        </div>

        {/* Theme Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {Object.entries(themes).map(([key, theme]) => (
            <div 
              key={key}
              className={`bg-white rounded-xl p-6 shadow-lg border-2 cursor-pointer transition-all hover:shadow-xl ${
                currentTheme === key ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
              }`}
              onClick={() => applyTheme(key)}
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{theme.name}</h3>
                <p className="text-sm text-gray-600">{theme.description}</p>
              </div>
              
              <div className="flex space-x-2 mb-4">
                <div 
                  className="w-8 h-8 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: theme.primary }}
                  title="Primary Color"
                ></div>
                <div 
                  className="w-8 h-8 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: theme.primaryLight }}
                  title="Primary Light"
                ></div>
                <div 
                  className="w-8 h-8 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: theme.secondary }}
                  title="Secondary Color"
                ></div>
                <div 
                  className="w-8 h-8 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: theme.accent }}
                  title="Accent Color"
                ></div>
              </div>

              <div className="text-center">
                <button
                  className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"                  style={{ 
                    backgroundColor: theme.primary,
                    color: (themeKey === 'bright-yellow' || themeKey === 'warm-golden') ? '#1F2937' : '#FFFFFF'
                  }}
                >
                  {currentTheme === key ? 'Đang sử dụng' : 'Áp dụng theme'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Preview Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Xem trước giao diện</h2>
          
          {/* Header Preview */}
          <div className="mb-8 p-6 rounded-lg" style={{ backgroundColor: 'var(--primary-color)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <BookOpen className="h-8 w-8" style={{ color: 'var(--text-on-primary)' }} />
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-on-primary)' }}>
                  Không gian đọc Yên
                </h3>
              </div>
              <div className="flex space-x-4">
                <button 
                  className="px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm"
                  style={{ color: 'var(--text-on-primary)' }}
                >
                  Đăng nhập
                </button>
                <button 
                  className="px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm"
                  style={{ color: 'var(--text-on-primary)' }}
                >
                  Đăng ký
                </button>
              </div>
            </div>
          </div>

          {/* Content Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg">
              <Users className="h-8 w-8 mb-3" style={{ color: 'var(--secondary-color)' }} />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Cộng đồng</h4>
              <p className="text-gray-600">Kết nối với những người yêu sách</p>
            </div>
            
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg">
              <Calendar className="h-8 w-8 mb-3" style={{ color: 'var(--accent-color)' }} />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Sự kiện</h4>
              <p className="text-gray-600">Tham gia các buổi thảo luận sách</p>
            </div>
            
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg">
              <Heart className="h-8 w-8 mb-3" style={{ color: 'var(--error-color)' }} />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Yêu thích</h4>
              <p className="text-gray-600">Lưu những cuốn sách ưa thích</p>
            </div>
          </div>

          {/* Button Preview */}
          <div className="flex flex-wrap gap-4 mt-8">
            <button 
              className="px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ 
                backgroundColor: 'var(--primary-color)', 
                color: 'var(--text-on-primary)' 
              }}
            >
              Nút chính
            </button>
            <button 
              className="px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ 
                backgroundColor: 'var(--secondary-color)', 
                color: 'var(--text-on-secondary)' 
              }}
            >
              Nút phụ
            </button>
            <button 
              className="px-6 py-3 rounded-lg font-medium border-2 bg-white transition-colors"
              style={{ 
                borderColor: 'var(--primary-color)', 
                color: 'var(--primary-color)' 
              }}
            >
              Nút viền
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div 
          className="bg-blue-50 border border-blue-200 rounded-lg p-6"
          style={{ backgroundColor: 'var(--primary-light)' }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Hướng dẫn sử dụng:</h3>
          <ul className="text-gray-700 space-y-1">
            <li>• Click vào các theme card để xem trước ngay lập tức</li>
            <li>• Theme hiện tại sẽ được đánh dấu với viền xanh</li>
            <li>• Sau khi chọn theme ưng ý, bạn có thể quay lại trang chủ để xem toàn bộ</li>
            <li>• Theme sẽ được áp dụng trên toàn bộ website</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ThemePreview;
