import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, User, Mail, Phone, Calendar, Book, Eye } from 'lucide-react';
import { userAPI, borrowingsAPI } from '../../services/api';

const UserSearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('fullName');
  const [selectedUser, setSelectedUser] = useState(null);

  // Search users
  const { data: users, isLoading } = useQuery({
    queryKey: ['users-search', searchTerm, userTypeFilter, sortBy],
    queryFn: () => userAPI.getUsers({ 
      search: searchTerm, 
      role: userTypeFilter !== 'all' ? userTypeFilter : undefined,
      sortBy,
      limit: 50 
    }),
    enabled: searchTerm.length > 0,
  });

  // Get user borrowing history
  const { data: userBorrowings, isLoading: isLoadingBorrowings } = useQuery({
    queryKey: ['user-borrowings', selectedUser?.id],
    queryFn: () => borrowingsAPI.getBorrowings({ userId: selectedUser.id }),
    enabled: !!selectedUser,
  });

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-800';
      case 'CTV': return 'bg-blue-100 text-blue-800';
      case 'User': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';  
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBorrowingStatusColor = (status) => {
    switch (status) {
      case 'borrowed': return 'bg-blue-100 text-blue-800';
      case 'returned': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Tìm Kiếm Người Dùng</h1>

      {/* Search and Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Tìm Kiếm & Lọc
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Tìm kiếm</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Tên, email, hoặc số điện thoại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Loại người dùng</Label>
              <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="User">Người dùng</SelectItem>
                  <SelectItem value="CTV">Cộng tác viên</SelectItem>
                  <SelectItem value="Admin">Quản trị viên</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Sắp xếp theo</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fullName">Tên</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="createdAt">Ngày tạo</SelectItem>
                  <SelectItem value="lastActivity">Hoạt động gần nhất</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Results */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Kết Quả Tìm Kiếm</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Đang tìm kiếm...</span>
                </div>
              )}

              {users?.data && users.data.length === 0 && searchTerm.length > 0 && (
                <div className="text-center py-8 text-gray-500">
                  Không tìm thấy người dùng nào.
                </div>
              )}

              {users?.data && users.data.length > 0 && (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {users.data.map((user) => (
                    <div
                      key={user.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedUser?.id === user.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{user.fullName}</h3>
                            <Badge className={getRoleColor(user.role)}>
                              {user.role}
                            </Badge>
                            <Badge className={getStatusColor(user.status)}>
                              {user.status === 'active' ? 'Hoạt động' : 
                               user.status === 'inactive' ? 'Không hoạt động' : 'Tạm khóa'}
                            </Badge>
                          </div>
                          
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                {user.phone}
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Tham gia: {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(user);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searchTerm.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nhập từ khóa để tìm kiếm người dùng.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* User Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Chi Tiết Người Dùng
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedUser ? (
                <div className="text-center py-8 text-gray-500">
                  Chọn một người dùng để xem chi tiết.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Basic Info */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{selectedUser.fullName}</h3>
                      <div className="flex gap-2 mt-1">
                        <Badge className={getRoleColor(selectedUser.role)}>
                          {selectedUser.role}
                        </Badge>
                        <Badge className={getStatusColor(selectedUser.status)}>
                          {selectedUser.status === 'active' ? 'Hoạt động' : 
                           selectedUser.status === 'inactive' ? 'Không hoạt động' : 'Tạm khóa'}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">ID:</span> {selectedUser.id}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {selectedUser.email}
                      </div>
                      {selectedUser.phone && (
                        <div>
                          <span className="font-medium">Điện thoại:</span> {selectedUser.phone}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Ngày tham gia:</span>{' '}
                        {new Date(selectedUser.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>

                  {/* Borrowing History */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Book className="h-4 w-4" />
                      Lịch Sử Mượn Sách
                    </h4>
                    
                    {isLoadingBorrowings ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : userBorrowings?.data && userBorrowings.data.length > 0 ? (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {userBorrowings.data.slice(0, 10).map((borrowing) => (
                          <div key={borrowing.id} className="p-2 bg-gray-50 rounded text-sm">
                            <div className="font-medium">{borrowing.copy?.book?.title}</div>
                            <div className="flex items-center justify-between text-gray-600">
                              <span>{new Date(borrowing.borrowDate).toLocaleDateString('vi-VN')}</span>
                              <Badge className={getBorrowingStatusColor(borrowing.status)}>
                                {borrowing.status === 'borrowed' ? 'Đang mượn' :
                                 borrowing.status === 'returned' ? 'Đã trả' : 'Quá hạn'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                        {userBorrowings.data.length > 10 && (
                          <div className="text-center text-sm text-gray-500">
                            và {userBorrowings.data.length - 10} giao dịch khác...
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm">Chưa có lịch sử mượn sách.</div>
                    )}
                  </div>

                  {/* Statistics */}
                  {userBorrowings?.data && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3">Thống Kê</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <div className="font-semibold text-blue-600">
                            {userBorrowings.data.filter(b => b.status === 'borrowed').length}
                          </div>
                          <div className="text-gray-600">Đang mượn</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="font-semibold text-green-600">
                            {userBorrowings.data.filter(b => b.status === 'returned').length}
                          </div>
                          <div className="text-gray-600">Đã trả</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserSearchPage;
