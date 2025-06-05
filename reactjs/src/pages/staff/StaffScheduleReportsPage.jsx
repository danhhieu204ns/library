import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  DatePicker,
  LocalizationProvider
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  FileDownload as DownloadIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
  CalendarToday as CalendarIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { vi } from 'date-fns/locale';

const StaffScheduleReportsPage = () => {
  const [reportType, setReportType] = useState('monthly');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  });

  // Fetch schedule reports data
  const { data: reportsData, isLoading, refetch } = useQuery(
    ['schedule-reports', reportType, selectedDate, dateRange],
    async () => {
      const params = new URLSearchParams({
        type: reportType,
        date: selectedDate.toISOString(),
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString()
      });
      
      const response = await fetch(`/api/staff/schedules/reports?${params}`);
      if (!response.ok) throw new Error('Không thể tải báo cáo lịch trình');
      return response.json();
    }
  );

  // Fetch schedule statistics
  const { data: statsData } = useQuery(
    ['schedule-statistics', selectedDate],
    async () => {
      const response = await fetch(`/api/staff/schedules/statistics?date=${selectedDate.toISOString()}`);
      if (!response.ok) throw new Error('Không thể tải thống kê');
      return response.json();
    }
  );

  const reports = reportsData || {};
  const stats = statsData || {};

  // Sample data for charts
  const monthlyData = [
    { month: 'T1', schedules: 45, participants: 156, completion: 92 },
    { month: 'T2', schedules: 52, participants: 184, completion: 88 },
    { month: 'T3', schedules: 38, participants: 142, completion: 95 },
    { month: 'T4', schedules: 61, participants: 203, completion: 90 },
    { month: 'T5', schedules: 47, participants: 167, completion: 93 },
    { month: 'T6', schedules: 55, participants: 189, completion: 87 }
  ];

  const categoryData = [
    { name: 'Đào tạo', value: 35, color: '#8884d8' },
    { name: 'Họp định kỳ', value: 25, color: '#82ca9d' },
    { name: 'Sự kiện', value: 20, color: '#ffc658' },
    { name: 'Khác', value: 20, color: '#ff7300' }
  ];

  const attendanceData = [
    { day: 'T2', present: 85, absent: 15 },
    { day: 'T3', present: 90, absent: 10 },
    { day: 'T4', present: 82, absent: 18 },
    { day: 'T5', present: 95, absent: 5 },
    { day: 'T6', present: 88, absent: 12 },
    { day: 'T7', present: 92, absent: 8 },
    { day: 'CN', present: 70, absent: 30 }
  ];

  const handleExportReport = () => {
    toast.info('Tính năng xuất báo cáo đang được phát triển');
  };

  const StatCard = ({ title, value, change, icon, color = 'primary' }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            {change !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {change >= 0 ? (
                  <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16 }} />
                ) : (
                  <TrendingDownIcon sx={{ color: 'error.main', fontSize: 16 }} />
                )}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: change >= 0 ? 'success.main' : 'error.main',
                    ml: 0.5 
                  }}
                >
                  {Math.abs(change)}%
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}.main` }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Báo cáo lịch trình
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Thống kê và phân tích hoạt động lịch trình thư viện
          </Typography>
        </Box>

        {/* Controls */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Loại báo cáo</InputLabel>
                  <Select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    label="Loại báo cáo"
                  >
                    <MenuItem value="daily">Hàng ngày</MenuItem>
                    <MenuItem value="weekly">Hàng tuần</MenuItem>
                    <MenuItem value="monthly">Hàng tháng</MenuItem>
                    <MenuItem value="quarterly">Hàng quý</MenuItem>
                    <MenuItem value="yearly">Hàng năm</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <DatePicker
                  label="Chọn thời gian"
                  value={selectedDate}
                  onChange={(newValue) => setSelectedDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <DatePicker
                  label="Từ ngày"
                  value={dateRange.start}
                  onChange={(newValue) => setDateRange(prev => ({ ...prev, start: newValue }))}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={refetch}
                  >
                    Làm mới
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleExportReport}
                  >
                    Xuất báo cáo
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Statistics Overview */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng lịch trình"
              value={stats.totalSchedules || 156}
              change={12}
              icon={<ScheduleIcon />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng tham gia"
              value={stats.totalParticipants || 847}
              change={8}
              icon={<PeopleIcon />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Hoàn thành"
              value={`${stats.completionRate || 92}%`}
              change={5}
              icon={<EventIcon />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Sự kiện tháng này"
              value={stats.monthlyEvents || 28}
              change={-3}
              icon={<CalendarIcon />}
              color="warning"
            />
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Monthly Schedule Trends */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Xu hướng lịch trình theo tháng
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="schedules" fill="#8884d8" name="Lịch trình" />
                    <Bar dataKey="participants" fill="#82ca9d" name="Tham gia" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Schedule Categories */}
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Phân loại lịch trình
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Attendance Rate */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tỷ lệ tham dự theo ngày trong tuần
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="present" stroke="#8884d8" name="Có mặt (%)" />
                    <Line type="monotone" dataKey="absent" stroke="#82ca9d" name="Vắng mặt (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Detailed Reports */}
        <Grid container spacing={3}>
          {/* Top Performers */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Nhân viên tích cực nhất
                </Typography>
                <List>
                  {[
                    { name: 'Nguyễn Văn A', schedules: 15, attendance: 95 },
                    { name: 'Trần Thị B', schedules: 12, attendance: 92 },
                    { name: 'Lê Văn C', schedules: 10, attendance: 88 },
                    { name: 'Phạm Thị D', schedules: 9, attendance: 90 },
                    { name: 'Hoàng Văn E', schedules: 8, attendance: 85 }
                  ].map((person, index) => (
                    <ListItem key={index}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {person.name.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={person.name}
                        secondary={`${person.schedules} lịch trình • ${person.attendance}% tham dự`}
                      />
                      <ListItemSecondaryAction>
                        <Chip
                          size="small"
                          label={`#${index + 1}`}
                          color={index === 0 ? 'primary' : 'default'}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activities */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Hoạt động gần đây
                </Typography>
                <List>
                  {[
                    { title: 'Họp định kỳ thư viện', date: '2024-01-15', participants: 25 },
                    { title: 'Đào tạo hệ thống mới', date: '2024-01-14', participants: 18 },
                    { title: 'Sự kiện đọc sách', date: '2024-01-12', participants: 45 },
                    { title: 'Họp ban điều hành', date: '2024-01-10', participants: 8 },
                    { title: 'Tập huấn nghiệp vụ', date: '2024-01-08', participants: 32 }
                  ].map((activity, index) => (
                    <ListItem key={index}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'secondary.main' }}>
                          <EventIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.title}
                        secondary={`${format(new Date(activity.date), 'dd/MM/yyyy', { locale: vi })} • ${activity.participants} người tham gia`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton size="small">
                          <ViewIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Detailed Analytics */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Phân tích chi tiết
                </Typography>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Báo cáo theo thể loại</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Thể loại</TableCell>
                            <TableCell align="right">Số lượng</TableCell>
                            <TableCell align="right">Tham gia</TableCell>
                            <TableCell align="right">Hoàn thành</TableCell>
                            <TableCell align="right">Đánh giá</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {[
                            { category: 'Đào tạo', count: 35, participants: 280, completion: 92, rating: 4.5 },
                            { category: 'Họp định kỳ', count: 25, participants: 150, completion: 88, rating: 4.2 },
                            { category: 'Sự kiện', count: 20, participants: 450, completion: 95, rating: 4.7 },
                            { category: 'Khác', count: 20, participants: 120, completion: 85, rating: 4.0 }
                          ].map((row) => (
                            <TableRow key={row.category}>
                              <TableCell>{row.category}</TableCell>
                              <TableCell align="right">{row.count}</TableCell>
                              <TableCell align="right">{row.participants}</TableCell>
                              <TableCell align="right">{row.completion}%</TableCell>
                              <TableCell align="right">{row.rating}/5</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Báo cáo theo thời gian</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>Chi tiết báo cáo theo thời gian sẽ được hiển thị ở đây...</Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Báo cáo hiệu suất</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>Phân tích hiệu suất và đề xuất cải thiện sẽ được hiển thị ở đây...</Typography>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default StaffScheduleReportsPage;
