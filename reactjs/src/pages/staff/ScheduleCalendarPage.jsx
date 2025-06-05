import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/vi';
import 'react-big-calendar/lib/css/react-big-calendar.css';
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
  Box,
  CircularProgress,
  Grid,
  Paper
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  People as Users,
  Schedule as Clock,
  Add as Plus
} from '@mui/icons-material';
import { schedulesAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

// Configure moment localizer for Vietnamese
moment.locale('vi');
const localizer = momentLocalizer(moment);

const ScheduleCalendarPage = () => {
  const [viewType, setViewType] = useState('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigate = useNavigate();

  // Get schedules for calendar
  const { data: schedules, isLoading } = useQuery({
    queryKey: ['calendar-schedules'],
    queryFn: () => schedulesAPI.getSchedules(),
  });

  // Transform schedule data for calendar
  const calendarEvents = React.useMemo(() => {
    if (!schedules?.data) return [];

    return schedules.data.map(schedule => {
      const date = new Date(schedule.date);
      let startTime, endTime;

      // Set times based on shift
      switch (schedule.shift) {
        case 'morning':
          startTime = new Date(date.setHours(8, 0, 0));
          endTime = new Date(date.setHours(12, 0, 0));
          break;
        case 'afternoon':
          startTime = new Date(date.setHours(13, 0, 0));
          endTime = new Date(date.setHours(17, 0, 0));
          break;
        case 'evening':
          startTime = new Date(date.setHours(18, 0, 0));
          endTime = new Date(date.setHours(22, 0, 0));
          break;
        default:
          startTime = new Date(date.setHours(9, 0, 0));
          endTime = new Date(date.setHours(17, 0, 0));
      }

      return {
        id: schedule.id,
        title: `${getShiftText(schedule.shift)} (${schedule.currentStaff}/${schedule.maxStaff})`,
        start: startTime,
        end: endTime,
        resource: schedule,
      };
    });
  }, [schedules]);

  const getShiftText = (shift) => {
    switch (shift) {
      case 'morning': return 'Ca sáng';
      case 'afternoon': return 'Ca chiều';
      case 'evening': return 'Ca tối';
      default: return 'Ca trực';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#fbbf24';
      case 'confirmed': return '#10b981';
      case 'cancelled': return '#ef4444';
      case 'completed': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const eventStyleGetter = (event) => {
    const schedule = event.resource;
    const backgroundColor = getStatusColor(schedule.status);
    const isRegistered = schedule.isRegistered;
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: isRegistered ? '2px solid #1f2937' : 'none',
        fontWeight: isRegistered ? 'bold' : 'normal',
      },
    };
  };

  const handleSelectEvent = (event) => {
    const schedule = event.resource;
    // Navigate to schedule details or show modal
    console.log('Selected schedule:', schedule);
  };

  const handleSelectSlot = (slotInfo) => {
    // Handle creating new schedule
    console.log('Selected slot:', slotInfo);
  };

  const views = {
    month: true,
    week: true,
    day: true,
    agenda: true,
  };

  const messages = {
    allDay: 'Cả ngày',
    previous: 'Trước',
    next: 'Sau',
    today: 'Hôm nay',
    month: 'Tháng',
    week: 'Tuần',
    day: 'Ngày',
    agenda: 'Lịch trình',
    date: 'Ngày',
    time: 'Thời gian',
    event: 'Sự kiện',
    noEventsInRange: 'Không có lịch trực trong khoảng thời gian này',
    showMore: (total) => `+${total} lịch trực khác`,
  };
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h3" component="h1" fontWeight="bold">
          Lịch Trực
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={() => navigate('/staff/schedules')} variant="outlined">
            Xem danh sách
          </Button>
          <Button variant="contained" startIcon={<Plus />}>
            Tạo lịch trực
          </Button>
        </Box>
      </Box>

      {/* Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Điều khiển hiển thị
          </Typography>
          <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Chế độ xem</InputLabel>
              <Select
                value={viewType}
                onChange={(e) => setViewType(e.target.value)}
                label="Chế độ xem"
              >
                <MenuItem value="month">Tháng</MenuItem>
                <MenuItem value="week">Tuần</MenuItem>
                <MenuItem value="day">Ngày</MenuItem>
                <MenuItem value="agenda">Lịch trình</MenuItem>
              </Select>
            </FormControl>

            {/* Legend */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 16, height: 16, bgcolor: '#fbbf24', borderRadius: 0.5 }}></Box>
                <Typography variant="body2">Chờ xác nhận</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 16, height: 16, bgcolor: '#10b981', borderRadius: 0.5 }}></Box>
                <Typography variant="body2">Đã xác nhận</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 16, height: 16, bgcolor: '#3b82f6', borderRadius: 0.5 }}></Box>
                <Typography variant="body2">Hoàn thành</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 16, height: 16, bgcolor: '#ef4444', borderRadius: 0.5 }}></Box>
                <Typography variant="body2">Đã hủy</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 16, 
                  height: 16, 
                  bgcolor: '#6b7280', 
                  border: '2px solid #1f2937', 
                  borderRadius: 0.5 
                }}></Box>
                <Typography variant="body2">Bạn đã đăng ký</Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>      {/* Calendar */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Đang tải lịch trực...</Typography>
            </Box>
          ) : (
            <Box sx={{ height: '600px' }}>
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                selectable
                view={viewType}
                onView={setViewType}
                date={selectedDate}
                onNavigate={setSelectedDate}
                views={views}
                messages={messages}
                eventPropGetter={eventStyleGetter}
                popup
                step={60}
                showMultiDayTimes
                components={{
                  toolbar: ({ label, onNavigate, onView }) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="outlined" onClick={() => onNavigate('PREV')}>
                          ←
                        </Button>
                        <Button variant="outlined" onClick={() => onNavigate('TODAY')}>
                          Hôm nay
                        </Button>
                        <Button variant="outlined" onClick={() => onNavigate('NEXT')}>
                          →
                        </Button>
                      </Box>
                      <Typography variant="h5" component="h2">
                        {label}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {Object.keys(views).map(view => (
                          <Button
                            key={view}
                            variant={viewType === view ? "contained" : "outlined"}
                            size="small"
                            onClick={() => onView(view)}
                          >
                            {messages[view]}
                          </Button>
                        ))}
                      </Box>
                    </Box>
                  ),
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>      {/* Today's Schedule Summary */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <CalendarIcon />
            <Typography variant="h6">
              Lịch Trực Hôm Nay
            </Typography>
          </Box>
          {schedules?.data && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {schedules.data
                .filter(schedule => {
                  const scheduleDate = new Date(schedule.date);
                  const today = new Date();
                  return scheduleDate.toDateString() === today.toDateString();
                })
                .map(schedule => (
                  <Paper key={schedule.id} sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Clock sx={{ color: 'grey.600' }} />
                        <Box>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {getShiftText(schedule.shift)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {schedule.description}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Users sx={{ fontSize: 16, color: 'grey.600' }} />
                          <Typography variant="body2" color="text.secondary">
                            {schedule.currentStaff}/{schedule.maxStaff}
                          </Typography>
                        </Box>
                        <Chip 
                          size="small"
                          sx={{ 
                            bgcolor: getStatusColor(schedule.status), 
                            color: 'white' 
                          }}
                          label={
                            schedule.status === 'pending' ? 'Chờ xác nhận' :
                            schedule.status === 'confirmed' ? 'Đã xác nhận' :
                            schedule.status === 'cancelled' ? 'Đã hủy' : 'Hoàn thành'
                          }
                        />
                        {schedule.isRegistered && (
                          <Chip size="small" variant="outlined" label="Đã đăng ký" />
                        )}
                      </Box>
                    </Box>
                  </Paper>
                ))}
              
              {schedules.data.filter(schedule => {
                const scheduleDate = new Date(schedule.date);
                const today = new Date();
                return scheduleDate.toDateString() === today.toDateString();
              }).length === 0 && (
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  Không có lịch trực nào hôm nay.
                </Typography>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ScheduleCalendarPage;
