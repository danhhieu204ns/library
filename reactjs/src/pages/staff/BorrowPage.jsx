import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, User, Book, Calendar, CheckCircle } from 'lucide-react';
import { userAPI, borrowingsAPI } from '../../services/api';

const BorrowPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [bookSearchTerm, setBookSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  // Search users
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users', searchTerm],
    queryFn: () => userAPI.getUsers({ search: searchTerm, limit: 10 }),
    enabled: searchTerm.length > 2,
  });

  // Search books/copies
  const { data: books, isLoading: isLoadingBooks } = useQuery({
    queryKey: ['available-books', bookSearchTerm],
    queryFn: () => borrowingsAPI.getAvailableBooks({ search: bookSearchTerm, limit: 10 }),
    enabled: bookSearchTerm.length > 2,
  });

  const borrowMutation = useMutation({
    mutationFn: (borrowData) => borrowingsAPI.createBorrowing(borrowData),
    onSuccess: () => {
      queryClient.invalidateQueries(['borrowings']);
      setSelectedUser(null);
      setSelectedBooks([]);
      setSearchTerm('');
      setBookSearchTerm('');
    },
  });

  const handleBorrow = async () => {
    if (!selectedUser || selectedBooks.length === 0) return;

    setIsProcessing(true);
    try {
      for (const book of selectedBooks) {
        await borrowMutation.mutateAsync({
          userId: selectedUser.id,
          copyId: book.id,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        });
      }
    } catch (error) {
      console.error('Error processing borrows:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const addBookToSelection = (book) => {
    if (!selectedBooks.find(b => b.id === book.id)) {
      setSelectedBooks([...selectedBooks, book]);
    }
  };

  const removeBookFromSelection = (bookId) => {
    setSelectedBooks(selectedBooks.filter(b => b.id !== bookId));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Cho Mượn Sách</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Tìm Người Dùng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="userSearch">Tìm kiếm theo tên hoặc email</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="userSearch"
                  placeholder="Nhập tên hoặc email người dùng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {isLoadingUsers && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}

            {users?.data && users.data.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {users.data.map((user) => (
                  <div
                    key={user.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedUser?.id === user.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="font-medium">{user.fullName}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    <div className="text-sm text-gray-500">ID: {user.id}</div>
                  </div>
                ))}
              </div>
            )}

            {selectedUser && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Đã chọn: <strong>{selectedUser.fullName}</strong> ({selectedUser.email})
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Book Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Tìm Sách
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bookSearch">Tìm kiếm sách có sẵn</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="bookSearch"
                  placeholder="Nhập tên sách..."
                  value={bookSearchTerm}
                  onChange={(e) => setBookSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {isLoadingBooks && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}

            {books?.data && books.data.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {books.data.map((book) => (
                  <div
                    key={book.id}
                    className="p-3 border rounded-lg cursor-pointer hover:border-gray-300 transition-colors"
                    onClick={() => addBookToSelection(book)}
                  >
                    <div className="font-medium">{book.title}</div>
                    <div className="text-sm text-gray-500">Mã: {book.barcode}</div>
                    <div className="text-sm text-green-600">Có sẵn</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Selected Books */}
      {selectedBooks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sách Đã Chọn ({selectedBooks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedBooks.map((book) => (
                <div key={book.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{book.title}</div>
                    <div className="text-sm text-gray-500">Mã: {book.barcode}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeBookFromSelection(book.id)}
                  >
                    Xóa
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={handleBorrow}
          disabled={!selectedUser || selectedBooks.length === 0 || isProcessing}
          className="flex items-center gap-2"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Calendar className="h-4 w-4" />
          )}
          Cho Mượn ({selectedBooks.length} sách)
        </Button>
        
        <Button
          variant="outline"
          onClick={() => {
            setSelectedUser(null);
            setSelectedBooks([]);
            setSearchTerm('');
            setBookSearchTerm('');
          }}
        >
          Hủy Bỏ
        </Button>
      </div>
    </div>
  );
};

export default BorrowPage;
