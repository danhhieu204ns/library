import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  CircularProgress,
  Grid,
  Paper,
  LinearProgress,
  Avatar
} from '@mui/material';
import {
  Book,
  Person as User,
  TrendingUp,
  CalendarToday as Calendar,
  Download,
  FilterList as Filter
} from '@mui/icons-material';
import { borrowingsAPI, userAPI, reportsAPI } from '../../services/api';

const UserReportsPage = () => {
  const [reportType, setReportType] = useState('overview');
  const [dateRange, setDateRange] = useState('month');
  const [userFilter, setUserFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Get user reports data
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['user-reports', reportType, dateRange, userFilter, searchTerm],
    queryFn: () => reportsAPI.getUserReports({
      type: reportType,
      dateRange,
      userType: userFilter !== 'all' ? userFilter : undefined,
      search: searchTerm,
    }),
  });

  // Get user statistics
  const { data: userStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['user-statistics'],
    queryFn: () => userAPI.getUserStatistics(),
  });

  const handleExportReport = () => {
    // Implementation for exporting reports
    console.log('Exporting report...');
  };
  const getActivityText = (level) => {
    switch (level) {
      case 'high': return 'Cao';
      case 'medium': return 'Trung bình';
      case 'low': return 'Thấp';
      default: return 'Không xác định';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h3" component="h1" fontWeight="bold">
          Báo Cáo Người Dùng
        </Typography>
        <Button 
          onClick={handleExportReport} 
          variant="contained"
          startIcon={<Download />}
        >
          Xuất Báo Cáo
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Filter />
            <Typography variant="h6">
              Bộ Lọc Báo Cáo
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Loại báo cáo</InputLabel>
                <Select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  label="Loại báo cáo"
                >
                  <MenuItem value="overview">Tổng quan</MenuItem>
                  <MenuItem value="activity">Hoạt động</MenuItem>
                  <MenuItem value="borrowing">Mượn sách</MenuItem>
                  <MenuItem value="registration">Đăng ký mới</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Khoảng thời gian</InputLabel>
                <Select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  label="Khoảng thời gian"
                >
                  <MenuItem value="week">Tuần này</MenuItem>
                  <MenuItem value="month">Tháng này</MenuItem>
                  <MenuItem value="quarter">Quý này</MenuItem>
                  <MenuItem value="year">Năm này</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Loại người dùng</InputLabel>
                <Select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  label="Loại người dùng"
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="User">Người dùng</MenuItem>
                  <MenuItem value="CTV">Cộng tác viên</MenuItem>
                  <MenuItem value="Admin">Quản trị viên</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Tìm kiếm"
                placeholder="Tìm theo tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>      {/* Statistics Overview */}
      {userStats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Tổng người dùng
                    </Typography>
                    <Typography variant="h4" component="div">
                      {userStats.totalUsers || 0}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <User />
                  </Avatar>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  +{userStats.newUsersThisMonth || 0} trong tháng
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Người dùng hoạt động
                    </Typography>
                    <Typography variant="h4" component="div">
                      {userStats.activeUsers || 0}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <TrendingUp />
                  </Avatar>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {((userStats.activeUsers / userStats.totalUsers) * 100).toFixed(1)}% tổng số
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Lượt mượn tháng này
                    </Typography>
                    <Typography variant="h4" component="div">
                      {userStats.borrowingsThisMonth || 0}
                    </Typography>
                  </Box>                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <Book />
                  </Avatar>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Trung bình {((userStats.borrowingsThisMonth || 0) / (userStats.activeUsers || 1)).toFixed(1)} lượt/người
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Đăng ký mới
                    </Typography>
                    <Typography variant="h4" component="div">
                      {userStats.newRegistrations || 0}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <Calendar />
                  </Avatar>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Tuần này: {userStats.newRegistrationsThisWeek || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}      {/* Report Content */}
      {isLoading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Đang tạo báo cáo...</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {reportType === 'overview' && reportData?.overview && (
            <Grid container spacing={3}>
              {/* User Distribution Chart */}
              <Grid item xs={12} lg={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Phân Bố Người Dùng Theo Loại
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {reportData.overview.userDistribution?.map((item, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="body1" fontWeight="medium">
                            {item.type}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 120, mr: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={(item.count / reportData.overview.totalUsers) * 100}
                                sx={{ height: 8, borderRadius: 4 }}
                              />
                            </Box>
                            <Typography variant="body2" fontWeight="medium">
                              {item.count}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Registration Trend */}
              <Grid item xs={12} lg={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Xu Hướng Đăng Ký
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {reportData.overview.registrationTrend?.map((item, index) => (
                        <Paper key={index} sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'grey.50' }}>
                          <Typography variant="body2">
                            {formatDate(item.date)}
                          </Typography>
                          <Chip size="small" label={`${item.count} người`} />
                        </Paper>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {reportType === 'activity' && reportData?.activity && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Báo Cáo Hoạt Động Người Dùng
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {reportData.activity.users?.map((user, index) => (
                    <Paper key={index} sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" gutterBottom>
                            {user.fullName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {user.email}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Chip 
                              size="small" 
                              variant="outlined" 
                              label={`${user.totalBorrowings || 0} lượt mượn`}
                            />
                            <Chip 
                              size="small" 
                              variant="outlined" 
                              label={`${user.totalReservations || 0} đặt trước`}
                            />
                          </Box>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Chip 
                            size="small"
                            color={user.activityLevel === 'high' ? 'success' : user.activityLevel === 'medium' ? 'warning' : 'error'}
                            label={getActivityText(user.activityLevel)}
                          />
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Lần cuối: {formatDate(user.lastActivity)}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}          {reportType === 'borrowing' && reportData?.borrowing && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Báo Cáo Mượn Sách
                </Typography>
                <Grid container spacing={3}>
                  {/* Top Borrowers */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                      Người Mượn Nhiều Nhất
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {reportData.borrowing.topBorrowers?.map((user, index) => (
                        <Paper key={index} sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'grey.50' }}>
                          <Box>
                            <Typography variant="body1" fontWeight="medium">
                              {user.fullName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {user.email}
                            </Typography>
                          </Box>
                          <Chip size="small" label={`${user.borrowCount} lượt`} />
                        </Paper>
                      ))}
                    </Box>
                  </Grid>

                  {/* Borrowing Statistics */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                      Thống Kê Mượn Sách
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>Tổng lượt mượn</Typography>
                          <Typography fontWeight="bold">{reportData.borrowing.totalBorrowings}</Typography>
                        </Box>
                      </Paper>
                      <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>Đã trả</Typography>
                          <Typography fontWeight="bold">{reportData.borrowing.returnedBorrowings}</Typography>
                        </Box>
                      </Paper>
                      <Paper sx={{ p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>Đang mượn</Typography>
                          <Typography fontWeight="bold">{reportData.borrowing.activeBorrowings}</Typography>
                        </Box>
                      </Paper>
                      <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>Quá hạn</Typography>
                          <Typography fontWeight="bold">{reportData.borrowing.overdueBorrowings}</Typography>
                        </Box>
                      </Paper>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {reportType === 'registration' && reportData?.registration && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Báo Cáo Đăng Ký Mới
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {reportData.registration.newUsers?.map((user, index) => (
                    <Paper key={index} sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {user.fullName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {user.email}
                          </Typography>
                          <Chip size="small" variant="outlined" label={user.role} />
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" fontWeight="medium">
                            {formatDate(user.createdAt)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {user.isActive ? 'Đã kích hoạt' : 'Chưa kích hoạt'}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      )}      {/* No Data Message */}
      {!isLoading && (!reportData || Object.keys(reportData).length === 0) && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <TrendingUp sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Không có dữ liệu để hiển thị báo cáo.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default UserReportsPage;
