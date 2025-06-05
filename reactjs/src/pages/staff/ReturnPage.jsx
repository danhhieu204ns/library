import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Book, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { borrowingsAPI } from '../../services/api';

const ReturnPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBorrowings, setSelectedBorrowings] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  // Search active borrowings
  const { data: borrowings, isLoading, refetch } = useQuery({
    queryKey: ['active-borrowings', searchTerm],
    queryFn: () => borrowingsAPI.getBorrowings({ 
      search: searchTerm, 
      status: 'borrowed',
      limit: 20 
    }),
    enabled: searchTerm.length > 2,
  });

  const returnMutation = useMutation({
    mutationFn: (borrowingId) => borrowingsAPI.returnBorrowing(borrowingId),
    onSuccess: () => {
      queryClient.invalidateQueries(['active-borrowings']);
      queryClient.invalidateQueries(['borrowings']);
      setSelectedBorrowings([]);
      refetch();
    },
  });

  const handleReturn = async (borrowingId) => {
    setIsProcessing(true);
    try {
      await returnMutation.mutateAsync(borrowingId);
    } catch (error) {
      console.error('Error returning book:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkReturn = async () => {
    if (selectedBorrowings.length === 0) return;

    setIsProcessing(true);
    try {
      for (const borrowingId of selectedBorrowings) {
        await returnMutation.mutateAsync(borrowingId);
      }
    } catch (error) {
      console.error('Error returning books:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleBorrowingSelection = (borrowingId) => {
    setSelectedBorrowings(prev => 
      prev.includes(borrowingId)
        ? prev.filter(id => id !== borrowingId)
        : [...prev, borrowingId]
    );
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const getDaysOverdue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Trả Sách</h1>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Tìm Kiếm Sách Đang Mượn
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="search">Tìm theo tên người dùng, tên sách, hoặc mã sách</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Nhập tên người dùng, tên sách hoặc mã sách..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {searchTerm.length > 0 && searchTerm.length <= 2 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Vui lòng nhập ít nhất 3 ký tự để tìm kiếm.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Đang tìm kiếm...</span>
        </div>
      )}

      {borrowings?.data && borrowings.data.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Kết Quả Tìm Kiếm ({borrowings.data.length})</CardTitle>
            {selectedBorrowings.length > 0 && (
              <Button
                onClick={handleBulkReturn}
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Trả {selectedBorrowings.length} sách
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {borrowings.data.map((borrowing) => (
                <div
                  key={borrowing.id}
                  className={`p-4 border rounded-lg ${
                    selectedBorrowings.includes(borrowing.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  } ${isOverdue(borrowing.dueDate) ? 'border-l-4 border-l-red-500' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      {/* Book Info */}
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedBorrowings.includes(borrowing.id)}
                          onChange={() => toggleBorrowingSelection(borrowing.id)}
                          className="w-4 h-4"
                        />
                        <div>
                          <h3 className="font-semibold text-lg">{borrowing.copy?.book?.title}</h3>
                          <p className="text-gray-600">Mã sách: {borrowing.copy?.barcode}</p>
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="font-medium">Người mượn: {borrowing.user?.fullName}</p>
                        <p className="text-sm text-gray-600">Email: {borrowing.user?.email}</p>
                        <p className="text-sm text-gray-600">ID: {borrowing.user?.id}</p>
                      </div>

                      {/* Borrowing Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Ngày mượn:</span>
                          <p>{new Date(borrowing.borrowDate).toLocaleDateString('vi-VN')}</p>
                        </div>
                        <div>
                          <span className="font-medium">Hạn trả:</span>
                          <p className={isOverdue(borrowing.dueDate) ? 'text-red-600 font-medium' : ''}>
                            {new Date(borrowing.dueDate).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Trạng thái:</span>
                          <div className="mt-1">
                            {isOverdue(borrowing.dueDate) ? (
                              <Badge variant="destructive">
                                Quá hạn {getDaysOverdue(borrowing.dueDate)} ngày
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Đang mượn</Badge>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Phí phạt:</span>
                          <p className="text-red-600 font-medium">
                            {isOverdue(borrowing.dueDate) 
                              ? `${getDaysOverdue(borrowing.dueDate) * 5000} VNĐ`
                              : '0 VNĐ'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => handleReturn(borrowing.id)}
                      disabled={isProcessing}
                      className="ml-4 flex items-center gap-2"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Book className="h-4 w-4" />
                      )}
                      Trả Sách
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {borrowings?.data && borrowings.data.length === 0 && searchTerm.length > 2 && (
        <Card>
          <CardContent className="text-center py-8">
            <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Không tìm thấy sách đang mượn nào.</p>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {selectedBorrowings.length > 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Đã chọn {selectedBorrowings.length} sách để trả. 
            {borrowings?.data && (
              <>
                {' '}Tổng phí phạt ước tính: {
                  borrowings.data
                    .filter(b => selectedBorrowings.includes(b.id))
                    .reduce((total, b) => total + (getDaysOverdue(b.dueDate) * 5000), 0)
                    .toLocaleString('vi-VN')
                } VNĐ
              </>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ReturnPage;
