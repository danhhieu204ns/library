import React, { useState, useEffect } from 'react';
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
  ListItemText
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FileDownload as DownloadIcon,
  Send as SendIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { format, addDays, isAfter, isBefore } from 'date-fns';
import { vi } from 'date-fns/locale';

const StaffBorrowingsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [overdueFilter, setOverdueFilter] = useState('all');
  const [selectedBorrowings, setSelectedBorrowings] = useState([]);
  const [selectedBorrowing, setSelectedBorrowing] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [extensionDays, setExtensionDays] = useState(7);

  const queryClient = useQueryClient();

  // Fetch borrowings data
  const { data: borrowingsData, isLoading, refetch } = useQuery(
    ['staff-borrowings', searchTerm, statusFilter, overdueFilter, page, rowsPerPage],
    async () => {
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        overdue: overdueFilter,
        page: page + 1,
        limit: rowsPerPage
      });
      
      const response = await fetch(`/api/staff/borrowings?${params}`);
      if (!response.ok) throw new Error('Không thể tải danh sách mượn sách');
      return response.json();
    },
    {
      keepPreviousData: true
    }
  );

  // Send reminder mutation
  const sendReminderMutation = useMutation(
    async (borrowingIds) => {
      const response = await fetch('/api/staff/borrowings/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ borrowingIds })
      });
      if (!response.ok) throw new Error('Không thể gửi nhắc nhở');
      return response.json();
    },
    {
      onSuccess: () => {
        toast.success('Đã gửi nhắc nhở thành công');
        setReminderDialogOpen(false);
        setSelectedBorrowings([]);
        refetch();
      },
      onError: (error) => {
        toast.error(error.message);
      }
    }
  );

  // Extend borrowing mutation
  const extendBorrowingMutation = useMutation(
    async ({ borrowingId, days }) => {
      const response = await fetch(`/api/staff/borrowings/${borrowingId}/extend`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days })
      });
      if (!response.ok) throw new Error('Không thể gia hạn mượn sách');
      return response.json();
    },
    {
      onSuccess: () => {
        toast.success('Đã gia hạn thành công');
        setExtendDialogOpen(false);
        setSelectedBorrowing(null);
        refetch();
      },
      onError: (error) => {
        toast.error(error.message);
      }
    }
  );

  // Mark as returned mutation
  const markReturnedMutation = useMutation(
    async (borrowingId) => {
      const response = await fetch(`/api/staff/borrowings/${borrowingId}/return`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Không thể đánh dấu đã trả');
      return response.json();
    },
    {
      onSuccess: () => {
        toast.success('Đã đánh dấu trả sách thành công');
        refetch();
      },
      onError: (error) => {
        toast.error(error.message);
      }
    }
  );

  const borrowings = borrowingsData?.data || [];
  const totalCount = borrowingsData?.total || 0;

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedBorrowings(borrowings.map(b => b.id));
    } else {
      setSelectedBorrowings([]);
    }
  };

  const handleSelectBorrowing = (borrowingId) => {
    setSelectedBorrowings(prev => 
      prev.includes(borrowingId)
        ? prev.filter(id => id !== borrowingId)
        : [...prev, borrowingId]
    );
  };

  const getStatusColor = (status, dueDate) => {
    if (status === 'returned') return 'success';
    if (status === 'overdue' || (dueDate && isAfter(new Date(), new Date(dueDate)))) return 'error';
    if (dueDate && isAfter(new Date(), addDays(new Date(dueDate), -3))) return 'warning';
    return 'primary';
  };

  const getStatusText = (status, dueDate) => {
    if (status === 'returned') return 'Đã trả';
    if (status === 'overdue' || (dueDate && isAfter(new Date(), new Date(dueDate)))) return 'Quá hạn';
    if (dueDate && isAfter(new Date(), addDays(new Date(dueDate), -3))) return 'Sắp hết hạn';
    return 'Đang mượn';
  };

  const handleExportData = () => {
    // Implementation for exporting data
    toast.info('Tính năng xuất dữ liệu đang được phát triển');
  };

  const filteredBorrowings = borrowings.filter(borrowing => {
    const matchesSearch = !searchTerm || 
      borrowing.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrowing.book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrowing.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || borrowing.status === statusFilter;
    
    const isOverdue = borrowing.dueDate && isAfter(new Date(), new Date(borrowing.dueDate));
    const matchesOverdue = overdueFilter === 'all' || 
      (overdueFilter === 'overdue' && isOverdue) ||
      (overdueFilter === 'not_overdue' && !isOverdue);

    return matchesSearch && matchesStatus && matchesOverdue;
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Quản lý mượn sách
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Theo dõi và quản lý các giao dịch mượn sách của thư viện
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
                placeholder="Tìm kiếm theo tên, email, sách..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                }}
              />
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
                  <MenuItem value="active">Đang mượn</MenuItem>
                  <MenuItem value="returned">Đã trả</MenuItem>
                  <MenuItem value="overdue">Quá hạn</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Quá hạn</InputLabel>
                <Select
                  value={overdueFilter}
                  onChange={(e) => setOverdueFilter(e.target.value)}
                  label="Quá hạn"
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="overdue">Quá hạn</MenuItem>
                  <MenuItem value="not_overdue">Chưa quá hạn</MenuItem>
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
                  onClick={handleExportData}
                >
                  Xuất dữ liệu
                </Button>
                {selectedBorrowings.length > 0 && (
                  <Button
                    variant="contained"
                    startIcon={<SendIcon />}
                    onClick={() => setReminderDialogOpen(true)}
                  >
                    Gửi nhắc nhở ({selectedBorrowings.length})
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
                Tổng số mượn
              </Typography>
              <Typography variant="h4">
                {totalCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Đang mượn
              </Typography>
              <Typography variant="h4" color="primary">
                {borrowings.filter(b => b.status === 'active').length}
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
              <Typography variant="h4" color="error">
                {borrowings.filter(b => b.dueDate && isAfter(new Date(), new Date(b.dueDate))).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Đã trả
              </Typography>
              <Typography variant="h4" color="success.main">
                {borrowings.filter(b => b.status === 'returned').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Borrowings Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedBorrowings.length > 0 && selectedBorrowings.length < borrowings.length}
                      checked={borrowings.length > 0 && selectedBorrowings.length === borrowings.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Người mượn</TableCell>
                  <TableCell>Sách</TableCell>
                  <TableCell>Ngày mượn</TableCell>
                  <TableCell>Hạn trả</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : filteredBorrowings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBorrowings.map((borrowing) => (
                    <TableRow key={borrowing.id}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedBorrowings.includes(borrowing.id)}
                          onChange={() => handleSelectBorrowing(borrowing.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {borrowing.user?.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {borrowing.user?.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {borrowing.book?.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {borrowing.book?.author}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {format(new Date(borrowing.borrowDate), 'dd/MM/yyyy', { locale: vi })}
                      </TableCell>
                      <TableCell>
                        {format(new Date(borrowing.dueDate), 'dd/MM/yyyy', { locale: vi })}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={getStatusText(borrowing.status, borrowing.dueDate)}
                          color={getStatusColor(borrowing.status, borrowing.dueDate)}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            setActionMenuAnchor(e.currentTarget);
                            setSelectedBorrowing(borrowing);
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
        {selectedBorrowing?.status !== 'returned' && (
          <>
            <MenuItem onClick={() => {
              setExtendDialogOpen(true);
              setActionMenuAnchor(null);
            }}>
              <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Gia hạn</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => {
              markReturnedMutation.mutate(selectedBorrowing.id);
              setActionMenuAnchor(null);
            }}>
              <ListItemIcon><CheckCircleIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Đánh dấu đã trả</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Chi tiết mượn sách</DialogTitle>
        <DialogContent>
          {selectedBorrowing && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Thông tin người mượn</Typography>
                <Typography><strong>Tên:</strong> {selectedBorrowing.user?.name}</Typography>
                <Typography><strong>Email:</strong> {selectedBorrowing.user?.email}</Typography>
                <Typography><strong>Điện thoại:</strong> {selectedBorrowing.user?.phone}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Thông tin sách</Typography>
                <Typography><strong>Tiêu đề:</strong> {selectedBorrowing.book?.title}</Typography>
                <Typography><strong>Tác giả:</strong> {selectedBorrowing.book?.author}</Typography>
                <Typography><strong>ISBN:</strong> {selectedBorrowing.book?.isbn}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Thông tin mượn</Typography>
                <Typography><strong>Ngày mượn:</strong> {format(new Date(selectedBorrowing.borrowDate), 'dd/MM/yyyy HH:mm', { locale: vi })}</Typography>
                <Typography><strong>Hạn trả:</strong> {format(new Date(selectedBorrowing.dueDate), 'dd/MM/yyyy', { locale: vi })}</Typography>
                <Typography><strong>Trạng thái:</strong> 
                  <Chip 
                    size="small" 
                    label={getStatusText(selectedBorrowing.status, selectedBorrowing.dueDate)}
                    color={getStatusColor(selectedBorrowing.status, selectedBorrowing.dueDate)}
                    sx={{ ml: 1 }}
                  />
                </Typography>
                {selectedBorrowing.returnDate && (
                  <Typography><strong>Ngày trả:</strong> {format(new Date(selectedBorrowing.returnDate), 'dd/MM/yyyy HH:mm', { locale: vi })}</Typography>
                )}
                {selectedBorrowing.notes && (
                  <Typography><strong>Ghi chú:</strong> {selectedBorrowing.notes}</Typography>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Reminder Dialog */}
      <Dialog open={reminderDialogOpen} onClose={() => setReminderDialogOpen(false)}>
        <DialogTitle>Gửi nhắc nhở</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Bạn sắp gửi nhắc nhở đến {selectedBorrowings.length} người mượn sách.
          </Alert>
          <Typography>
            Hệ thống sẽ gửi email nhắc nhở về việc trả sách đến các người dùng đã chọn.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReminderDialogOpen(false)}>Hủy</Button>
          <Button 
            onClick={() => sendReminderMutation.mutate(selectedBorrowings)}
            variant="contained"
            disabled={sendReminderMutation.isLoading}
          >
            {sendReminderMutation.isLoading ? 'Đang gửi...' : 'Gửi nhắc nhở'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Extend Dialog */}
      <Dialog open={extendDialogOpen} onClose={() => setExtendDialogOpen(false)}>
        <DialogTitle>Gia hạn mượn sách</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Gia hạn cho: <strong>{selectedBorrowing?.user?.name}</strong>
          </Typography>
          <TextField
            fullWidth
            type="number"
            label="Số ngày gia hạn"
            value={extensionDays}
            onChange={(e) => setExtensionDays(parseInt(e.target.value))}
            inputProps={{ min: 1, max: 30 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExtendDialogOpen(false)}>Hủy</Button>
          <Button 
            onClick={() => extendBorrowingMutation.mutate({ 
              borrowingId: selectedBorrowing?.id, 
              days: extensionDays 
            })}
            variant="contained"
            disabled={extendBorrowingMutation.isLoading}
          >
            {extendBorrowingMutation.isLoading ? 'Đang gia hạn...' : 'Gia hạn'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffBorrowingsPage;
