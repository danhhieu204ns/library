import React, { useState } from 'react';
import { Palette, Check } from 'lucide-react';

const ThemeSelector = () => {
  const [selectedTheme, setSelectedTheme] = useState('default');

  const themes = [
    {
      id: 'default',
      name: 'Indigo Tranquil',
      description: 'Soft indigo colors reflecting peace and knowledge',
      primary: '#6366F1',
      secondary: '#F59E0B',
      accent: '#10B981',
      preview: 'bg-gradient-to-r from-indigo-500 to-amber-400'
    },
    {
      id: 'nature',
      name: 'Nature Green', 
      description: 'Green tones inspired by growth and nature',
      primary: '#059669',
      secondary: '#D97706', 
      accent: '#7C3AED',
      preview: 'bg-gradient-to-r from-green-600 to-orange-600'
    },
    {
      id: 'classic',
      name: 'Classic Library',
      description: 'Traditional warm browns and greens',
      primary: '#92400E',
      secondary: '#065F46',
      accent: '#B45309',
      preview: 'bg-gradient-to-r from-amber-800 to-green-800'
    },
    {
      id: 'peaceful',
      name: 'Peaceful Blue',
      description: 'Calming blues reflecting tranquility',
      primary: '#3B82F6',
      secondary: '#F59E0B',
      accent: '#10B981', 
      preview: 'bg-gradient-to-r from-blue-500 to-amber-400'
    }
  ];

  const applyTheme = (theme) => {
    const root = document.documentElement;
    
    switch(theme.id) {
      case 'nature':
        root.style.setProperty('--primary-color', '#059669');
        root.style.setProperty('--primary-light', '#D1FAE5');
        root.style.setProperty('--primary-dark', '#065F46');
        root.style.setProperty('--secondary-color', '#D97706');
        root.style.setProperty('--secondary-light', '#FED7AA');
        root.style.setProperty('--secondary-dark', '#92400E');
        root.style.setProperty('--bg-accent', '#F0FDF4');
        break;
      case 'classic':
        root.style.setProperty('--primary-color', '#92400E');
        root.style.setProperty('--primary-light', '#FEF3C7');
        root.style.setProperty('--primary-dark', '#451A03');
        root.style.setProperty('--secondary-color', '#065F46');
        root.style.setProperty('--secondary-light', '#D1FAE5');
        root.style.setProperty('--secondary-dark', '#022C22');
        root.style.setProperty('--bg-primary', '#FFFBEB');
        root.style.setProperty('--bg-secondary', '#FEF3C7');
        root.style.setProperty('--bg-accent', '#F7F4F1');
        break;
      case 'peaceful':
        root.style.setProperty('--primary-color', '#3B82F6');
        root.style.setProperty('--primary-light', '#DBEAFE');
        root.style.setProperty('--primary-dark', '#1E40AF');
        root.style.setProperty('--secondary-color', '#F59E0B');
        root.style.setProperty('--secondary-light', '#FEF3C7');
        root.style.setProperty('--secondary-dark', '#D97706');
        root.style.setProperty('--bg-primary', '#FFFFFF');
        root.style.setProperty('--bg-secondary', '#F8FAFC');
        root.style.setProperty('--bg-accent', '#F1F5F9');
        break;
      default: // indigo tranquil
        root.style.setProperty('--primary-color', '#6366F1');
        root.style.setProperty('--primary-light', '#E0E7FF');
        root.style.setProperty('--primary-dark', '#4338CA');
        root.style.setProperty('--secondary-color', '#F59E0B');
        root.style.setProperty('--secondary-light', '#FEF3C7');
        root.style.setProperty('--secondary-dark', '#D97706');
        root.style.setProperty('--bg-primary', '#FFFFFF');
        root.style.setProperty('--bg-secondary', '#F9FAFB');
        root.style.setProperty('--bg-accent', '#F3F4F6');
        break;
    }
    
    setSelectedTheme(theme.id);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center">
          <Palette className="h-8 w-8 mr-3" style={{ color: 'var(--primary-color)' }} />
          Chọn Giao Diện Cho Thư Viện Yên
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Chọn bảng màu phù hợp với phong cách và cảm xúc mà bạn muốn truyền tải cho thư viện cộng đồng Yên
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className={`cursor-pointer rounded-xl p-6 border-2 transition-all duration-300 hover:shadow-lg ${
              selectedTheme === theme.id 
                ? 'border-current shadow-lg transform scale-[1.02]' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            style={{ 
              borderColor: selectedTheme === theme.id ? 'var(--primary-color)' : undefined,
              backgroundColor: selectedTheme === theme.id ? 'var(--primary-light)' : 'white'
            }}
            onClick={() => applyTheme(theme)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{theme.name}</h3>
              {selectedTheme === theme.id && (
                <Check className="h-6 w-6" style={{ color: 'var(--primary-color)' }} />
              )}
            </div>
            
            <div className={`h-16 rounded-lg mb-4 ${theme.preview}`}></div>
            
            <p className="text-gray-600 mb-4">{theme.description}</p>
            
            <div className="flex space-x-3">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: theme.primary }}
                ></div>
                <span className="text-sm text-gray-500">Chủ đạo</span>
              </div>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: theme.secondary }}
                ></div>
                <span className="text-sm text-gray-500">Phụ</span>
              </div>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: theme.accent }}
                ></div>
                <span className="text-sm text-gray-500">Nhấn</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
        <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--primary-color)' }}>
          Xem Trước Giao Diện
        </h3>
        
        <div className="space-y-6">
          {/* Header Preview */}
          <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--primary-color)' }}>
            <h4 className="text-white font-semibold">Không gian đọc Yên</h4>
            <div className="flex space-x-3">
              <button className="text-white hover:opacity-80">Trang chủ</button>
              <button className="text-white hover:opacity-80">Sách</button>
              <button className="text-white hover:opacity-80">Đăng nhập</button>
            </div>
          </div>

          {/* Content Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 rounded-lg border-2" style={{ borderColor: 'var(--primary-color)', backgroundColor: 'var(--primary-light)' }}>
              <div className="w-8 h-8 rounded mb-3" style={{ backgroundColor: 'var(--primary-color)' }}></div>
              <h5 className="font-semibold mb-2">Tìm kiếm sách</h5>
              <p className="text-gray-600 text-sm">Khám phá kho tàng tri thức</p>
            </div>
            
            <div className="p-6 rounded-lg border-2" style={{ borderColor: 'var(--secondary-color)', backgroundColor: 'var(--secondary-light)' }}>
              <div className="w-8 h-8 rounded mb-3" style={{ backgroundColor: 'var(--secondary-color)' }}></div>
              <h5 className="font-semibold mb-2">Mượn trả sách</h5>
              <p className="text-gray-600 text-sm">Quản lý việc mượn trả dễ dàng</p>
            </div>
            
            <div className="p-6 rounded-lg border-2" style={{ borderColor: 'var(--accent-color)', backgroundColor: 'var(--accent-light)' }}>
              <div className="w-8 h-8 rounded mb-3" style={{ backgroundColor: 'var(--accent-color)' }}></div>
              <h5 className="font-semibold mb-2">Cộng đồng</h5>
              <p className="text-gray-600 text-sm">Kết nối với độc giả khác</p>
            </div>
          </div>

          {/* Button Preview */}
          <div className="flex flex-wrap gap-4">
            <button 
              className="px-6 py-3 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--primary-color)' }}
            >
              Nút Chính
            </button>
            <button 
              className="px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--secondary-color)', color: 'var(--text-on-secondary)' }}
            >
              Nút Phụ
            </button>
            <button 
              className="px-6 py-3 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--accent-color)' }}
            >
              Nút Nhấn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;
