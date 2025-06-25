import React, { useRef } from 'react';
import { Button } from '../../components/ui/button';

const ImportBooks = ({ onImport, templateUrl, loading }) => {
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onImport(e.target.files[0]);
      e.target.value = '';
    }
  };

  const handleDownloadTemplate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(templateUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Không thể tải file mẫu');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'books-import-template.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Không thể tải file mẫu!');
    }
  };

  return (
    <div className="flex items-center gap-2 mb-4">
      <input
        type="file"
        accept=".xlsx,.xls"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <Button
        type="button"
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        disabled={loading}
      >
        Import Sách (Excel)
      </Button>
      <Button
        type="button"
        variant="outline"
        className="text-blue-600 underline text-sm"
        onClick={handleDownloadTemplate}
        disabled={loading}
      >
        Tải file mẫu
      </Button>
    </div>
  );
};

export default ImportBooks;
