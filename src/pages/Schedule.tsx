import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid as Grid,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Schedule as ScheduleIcon,
  Room as RoomIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  ViewList as ListIcon,
  ViewModule as GridIcon,
} from '@mui/icons-material';
import { getEnrollmentsApi } from '../api/enrollment';
import { getSchedulesApi } from '../api/schedule';
import type { Enrollment, Schedule } from '../types';
import { getUser } from '../utils/auth';

export default function Schedule() {
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    if (user?.role !== 'student' && user?.role !== 'teacher') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [filterDay, setFilterDay] = useState<string>('all');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Fetch schedules for student
  const fetchStudentSchedules = useCallback(async () => {
    if (!user?.studentId) return;

    setLoading(true);
    setError('');

    try {
      // 1. Get student's enrollments with classes
      const enrollmentsData = await getEnrollmentsApi(1, 100, user.studentId, 'enrolled');
      const enrollments: Enrollment[] = enrollmentsData.enrollments;

      // 2. Filter enrollments that have classId
      const enrolledClassIds = enrollments
        .filter(e => e.classId)
        .map(e => e.classId!);

      if (enrolledClassIds.length === 0) {
        setSchedules([]);
        setLoading(false);
        return;
      }

      // 3. Fetch all schedules
      const allSchedulesData = await getSchedulesApi(1, 100);
      
      // 4. Filter schedules for enrolled classes
      const mySchedules = allSchedulesData.schedules.filter(schedule => 
        enrolledClassIds.includes(schedule.classId)
      );

      setSchedules(mySchedules);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load schedules');
    } finally {
      setLoading(false);
    }
  }, [user?.studentId]);

  // Fetch schedules for teacher
  const fetchTeacherSchedules = useCallback(async () => {
    if (!user?.teacherId) return;

    setLoading(true);
    setError('');

    try {
      const data = await getSchedulesApi(1, 100, { teacherId: user.teacherId });
      setSchedules(data.schedules);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load schedules');
    } finally {
      setLoading(false);
    }
  }, [user?.teacherId]);

  useEffect(() => {
    if (user?.role === 'student') {
      fetchStudentSchedules();
    } else if (user?.role === 'teacher') {
      fetchTeacherSchedules();
    }
  }, [user?.role, fetchStudentSchedules, fetchTeacherSchedules]);

  // Filter schedules by day
  const filteredSchedules = filterDay === 'all' 
    ? schedules 
    : schedules.filter(s => s.dayOfTheWeek === filterDay);

  // Group schedules by day
  const schedulesByDay = daysOfWeek.reduce((acc, day) => {
    acc[day] = filteredSchedules
      .filter(s => s.dayOfTheWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {} as Record<string, Schedule[]>);

  // Format time
  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  // Get color for course
  const getCourseColor = (courseCode: string) => {
    const colors = ['primary', 'secondary', 'success', 'warning', 'info', 'error'];
    const hash = courseCode.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length] as 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error';
  };

  // Calculate total sessions
  const totalSessions = schedules.length;
  const uniqueCourses = [...new Set(schedules.map(s => s.courseCode))].length;

  if (user?.role !== 'student' && user?.role !== 'teacher') {
    return null;
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {user?.role === 'student' ? 'My Schedule' : 'Teaching Schedule'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Chip 
              icon={<ScheduleIcon />} 
              label={`${totalSessions} sessions`} 
              size="small" 
              color="primary" 
            />
            <Chip 
              icon={<SchoolIcon />} 
              label={`${uniqueCourses} courses`} 
              size="small" 
              variant="outlined" 
            />
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {/* Day Filter */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter by Day</InputLabel>
            <Select
              value={filterDay}
              label="Filter by Day"
              onChange={(e) => setFilterDay(e.target.value)}
            >
              <MenuItem value="all">All Days</MenuItem>
              {daysOfWeek.map(day => (
                <MenuItem key={day} value={day}>{day}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* View Toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="list">
              <ListIcon sx={{ mr: 1 }} />
              List
            </ToggleButton>
            <ToggleButton value="calendar">
              <GridIcon sx={{ mr: 1 }} />
              Calendar
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Empty state */}
      {!loading && !error && schedules.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
          <ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {user?.role === 'student' 
              ? 'No schedules yet' 
              : 'No teaching schedules yet'}
          </Typography>
          <Typography color="text.secondary">
            {user?.role === 'student' 
              ? 'Enroll in courses and select classes to see your schedule.' 
              : 'Schedules will appear once classes are scheduled.'}
          </Typography>
        </Paper>
      )}

      {/* List View */}
      {!loading && !error && filteredSchedules.length > 0 && viewMode === 'list' && (
        <Box>
          {daysOfWeek.map(day => {
            const daySchedules = schedulesByDay[day];
            if (daySchedules.length === 0) return null;

            return (
              <Box key={day} sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
                  {day}
                  <Chip label={`${daySchedules.length} session${daySchedules.length > 1 ? 's' : ''}`} size="small" sx={{ ml: 2 }} />
                </Typography>
                
                <Grid container spacing={2}>
                  {daySchedules.map(schedule => (
                    <Grid size={{ xs: 12, md: 6, lg: 4 }} key={schedule.scheduleId}>
                      <Card sx={{ height: '100%', borderLeft: 6, borderColor: `${getCourseColor(schedule.courseCode)}.main` }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                            <Box sx={{ flex: 1 }}>
                              <Chip 
                                label={schedule.courseCode} 
                                color={getCourseColor(schedule.courseCode)}
                                size="small"
                                sx={{ mb: 1 }}
                              />
                              <Typography variant="h6" gutterBottom>
                                {schedule.courseName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Class: {schedule.className}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Divider sx={{ my: 1.5 }} />
                          
                          <Stack spacing={1}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <ScheduleIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2" fontWeight="medium">
                                {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <RoomIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                Room {schedule.room}
                              </Typography>
                            </Box>
                            
                            {user?.role === 'student' && (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <PersonIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                                <Typography variant="body2">
                                  {schedule.teacherName}
                                </Typography>
                              </Box>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Calendar View */}
      {!loading && !error && filteredSchedules.length > 0 && viewMode === 'calendar' && (
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={1}>
            {daysOfWeek.map(day => (
              <Grid size={{ xs: 12, sm: 6, md: 3, lg: 12/7 }} key={day}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    minHeight: 400,
                    bgcolor: schedulesByDay[day].length > 0 ? 'background.paper' : 'grey.50',
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom align="center">
                    {day}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  {schedulesByDay[day].length === 0 ? (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
                      No classes
                    </Typography>
                  ) : (
                    <Stack spacing={1}>
                      {schedulesByDay[day].map(schedule => (
                        <Card 
                          key={schedule.scheduleId} 
                          variant="outlined" 
                          sx={{ 
                            bgcolor: 'background.default',
                            borderLeft: 4,
                            borderLeftColor: `${getCourseColor(schedule.courseCode)}.main`,
                            transition: 'all 0.2s',
                            '&:hover': {
                              transform: 'translateX(4px)',
                              boxShadow: 2,
                            }
                          }}
                        >
                          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                            </Typography>
                            <Typography variant="body2" fontWeight="medium" gutterBottom>
                              {schedule.courseCode}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {schedule.className}
                            </Typography>
                            <Chip 
                              icon={<RoomIcon sx={{ fontSize: 14 }} />}
                              label={schedule.room}
                              size="small"
                              sx={{ mt: 0.5, height: 20, fontSize: '0.7rem' }}
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Box>
  );
}