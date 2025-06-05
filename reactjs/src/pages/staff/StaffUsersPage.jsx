import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Alert,
  TablePagination,
  Checkbox,
  Menu,
  ListItemIcon,
  ListItemText,
  Avatar,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FileDownload as DownloadIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  MoreVert as MoreVertIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Book as BookIcon,
  History as HistoryIcon,
  Warning as WarningIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const StaffUsersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState(0);

  const queryClient = useQueryClient();

  // Fetch users data
  const { data: usersData, isLoading, refetch } = useQuery(
    ['staff-users', searchTerm, roleFilter, statusFilter, page, rowsPerPage],
    async () => {
      const params = new URLSearchParams({
        search: searchTerm,
        role: roleFilter,
        status: statusFilter,
        page: page + 1,
        limit: rowsPerPage
      });
      
      const response = await fetch(`/api/staff/users?${params}`);
      if (!response.ok) throw new Error('Không thể tải danh sách người dùng');
      return response.json();
    },
    {
      keepPreviousData: true
    }
  );

  // Fetch user statistics
  const { data: statsData } = useQuery(
    'user-statistics',
    async () => {
      const response = await fetch('/api/staff/users/statistics');
      if (!response.ok) throw new Error('Không thể tải thống kê');
      return response.json();
    }
  );

  // Update user status mutation
  const updateStatusMutation = useMutation(
    async ({ userId, status }) => {
      const response = await fetch(`/api/staff/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error('Không thể cập nhật trạng thái người dùng');
      return response.json();
    },
    {
      onSuccess: () => {
        toast.success('Đã cập nhật trạng thái thành công');
        refetch();
      },
      onError: (error) => {
        toast.error(error.message);
      }
    }
  );

  // Send notification mutation
  const sendNotificationMutation = useMutation(
    async (userIds) => {
      const response = await fetch('/api/staff/users/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds })
      });
      if (!response.ok) throw new Error('Không thể gửi thông báo');
      return response.json();
    },
    {
      onSuccess: () => {
        toast.success('Đã gửi thông báo thành công');
        setSelectedUsers([]);
      },
      onError: (error) => {
        toast.error(error.message);
      }
    }
  );

  const users = usersData?.data?.data?.users || [];
  const totalCount = usersData?.total || 0;
  const stats = statsData || {};

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedUsers(users.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return 'error';
      case 'CTV': return 'warning';
      case 'User': return 'primary';
      default: return 'default';
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'Admin': return 'Quản trị viên';
      case 'CTV': return 'Cộng tác viên';
      case 'User': return 'Người dùng';
      default: return role;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'suspended': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'suspended': return 'Tạm khóa';
      case 'pending': return 'Chờ duyệt';
      default: return status;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Quản lý người dùng
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý thông tin và hoạt động của người dùng thư viện
        </Typography>
      </Box>

      {/* Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Vai trò</InputLabel>
                <Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  label="Vai trò"
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="User">Người dùng</MenuItem>
                  <MenuItem value="CTV">Cộng tác viên</MenuItem>
                  <MenuItem value="Admin">Quản trị viên</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Trạng thái"
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="active">Hoạt động</MenuItem>
                  <MenuItem value="suspended">Tạm khóa</MenuItem>
                  <MenuItem value="pending">Chờ duyệt</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={refetch}
                >
                  Làm mới
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => toast.info('Tính năng xuất dữ liệu đang được phát triển')}
                >
                  Xuất dữ liệu
                </Button>
                {selectedUsers.length > 0 && (
                  <Button
                    variant="contained"
                    startIcon={<EmailIcon />}
                    onClick={() => sendNotificationMutation.mutate(selectedUsers)}
                  >
                    Gửi thông báo ({selectedUsers.length})
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tổng người dùng
              </Typography>
              <Typography variant="h4">
                {stats.totalUsers || totalCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Đang hoạt động
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.activeUsers || users.filter(u => u.status === 'active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Đang mượn sách
              </Typography>
              <Typography variant="h4" color="primary.main">
                {stats.borrowingUsers || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Quá hạn
              </Typography>
              <Typography variant="h4" color="error.main">
                {stats.overdueUsers || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Users Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length}
                      checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Người dùng</TableCell>
                  <TableCell>Liên hệ</TableCell>
                  <TableCell>Vai trò</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Ngày tham gia</TableCell>
                  <TableCell>Hoạt động</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar src={user.avatar}>
                            {user.name?.charAt(0)?.toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {user.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {user.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {user.email}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.phone}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={getRoleText(user.role)}
                          color={getRoleColor(user.role)}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={getStatusText(user.status)}
                          color={getStatusColor(user.status)}
                        />
                      </TableCell>
                      <TableCell>
                        {user.createdAt && format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: vi })}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title={`${user.borrowedBooks || 0} sách đang mượn`}>
                            <Chip size="small" icon={<BookIcon />} label={user.borrowedBooks || 0} />
                          </Tooltip>
                          {user.overdueBooks > 0 && (
                            <Tooltip title={`${user.overdueBooks} sách quá hạn`}>
                              <Chip size="small" icon={<WarningIcon />} label={user.overdueBooks} color="error" />
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            setActionMenuAnchor(e.currentTarget);
                            setSelectedUser(user);
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Số hàng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} của ${count}`}
          />
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={() => setActionMenuAnchor(null)}
      >
        <MenuItem onClick={() => {
          setDetailDialogOpen(true);
          setActionMenuAnchor(null);
        }}>
          <ListItemIcon><ViewIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Xem chi tiết</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          setEditDialogOpen(true);
          setActionMenuAnchor(null);
        }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Chỉnh sửa</ListItemText>
        </MenuItem>
        {selectedUser?.status === 'active' ? (
          <MenuItem onClick={() => {
            updateStatusMutation.mutate({ userId: selectedUser.id, status: 'suspended' });
            setActionMenuAnchor(null);
          }}>
            <ListItemIcon><BlockIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Tạm khóa</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem onClick={() => {
            updateStatusMutation.mutate({ userId: selectedUser.id, status: 'active' });
            setActionMenuAnchor(null);
          }}>
            <ListItemIcon><CheckCircleIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Kích hoạt</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Chi tiết người dùng</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box>
              <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                <Tab label="Thông tin cơ bản" />
                <Tab label="Hoạt động mượn sách" />
                <Tab label="Lịch sử giao dịch" />
              </Tabs>

              <TabPanel value={activeTab} index={0}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                    <Avatar 
                      src={selectedUser.avatar} 
                      sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
                    >
                      {selectedUser.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Typography variant="h6">{selectedUser.name}</Typography>
                    <Chip 
                      size="small" 
                      label={getRoleText(selectedUser.role)} 
                      color={getRoleColor(selectedUser.role)}
                      sx={{ mb: 1 }}
                    />
                    <br />
                    <Chip 
                      size="small" 
                      label={getStatusText(selectedUser.status)} 
                      color={getStatusColor(selectedUser.status)}
                    />
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Typography variant="h6" gutterBottom>Thông tin liên hệ</Typography>
                    <Typography><strong>Email:</strong> {selectedUser.email}</Typography>
                    <Typography><strong>Điện thoại:</strong> {selectedUser.phone}</Typography>
                    <Typography><strong>Địa chỉ:</strong> {selectedUser.address}</Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>Thông tin tài khoản</Typography>
                    <Typography><strong>Ngày tham gia:</strong> {selectedUser.createdAt && format(new Date(selectedUser.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</Typography>
                    <Typography><strong>Lần đăng nhập cuối:</strong> {selectedUser.lastLoginAt && format(new Date(selectedUser.lastLoginAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</Typography>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">{selectedUser.borrowedBooks || 0}</Typography>
                      <Typography variant="caption">Đang mượn</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">{selectedUser.totalBorrowed || 0}</Typography>
                      <Typography variant="caption">Tổng đã mượn</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="error.main">{selectedUser.overdueBooks || 0}</Typography>
                      <Typography variant="caption">Quá hạn</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main">{selectedUser.reservations || 0}</Typography>
                      <Typography variant="caption">Đặt trước</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={activeTab} index={2}>
                <Typography>Lịch sử giao dịch sẽ được hiển thị ở đây...</Typography>
              </TabPanel>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
        <DialogContent>
          <Typography>Tính năng chỉnh sửa người dùng đang được phát triển...</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffUsersPage;
