import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid as Grid,
  Chip,
  Snackbar,
  Alert,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { getCoursesApi } from '../api/course';
import { getEnrollmentsApi, enrollCourseApi, dropEnrollmentApi } from '../api/enrollment';
import type { Course, Enrollment } from '../types';
import { getUser } from '../utils/auth';

export default function EnrollmentPage() {
  const navigate = useNavigate();
  const user = getUser();

  // Check role - Only students
  useEffect(() => {
    if (user?.role !== 'student') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'enroll' | 'drop';
    course?: Course;
    enrollment?: Enrollment;
  }>({
    open: false,
    type: 'enroll',
  });

  // Get student profile to get studentId
  const [studentId, setStudentId] = useState<number | null>(null);

  // Show snackbar
  const showSnackbar = useCallback((message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // Fetch all courses
  const fetchCourses = useCallback(async () => {
    try {
      const data = await getCoursesApi(1, 100); // Get all courses
      setAllCourses(data.courses);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showSnackbar(err.response?.data?.message || 'Failed to load courses', 'error');
    }
  }, [showSnackbar]);

  // Fetch enrollments
  const fetchEnrollments = useCallback(async () => {
    if (!studentId) return;

    setLoading(true);
    try {
      const data = await getEnrollmentsApi(1, 100, studentId, 'enrolled');
      setEnrollments(data.enrollments);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showSnackbar(err.response?.data?.message || 'Failed to load enrollments', 'error');
    } finally {
      setLoading(false);
    }
  }, [studentId, showSnackbar]);

  // Get studentId from user
  useEffect(() => {
    if (user?.userId) {
      setStudentId(user.userId);
    }
  }, [user]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    if (studentId) {
      fetchEnrollments();
    }
  }, [studentId, fetchEnrollments]);

  // Check if course is enrolled
  const isEnrolled = (courseId: number): boolean => {
    return enrollments.some(e => e.courseId === courseId);
  };

  // Get enrollment by courseId
  const getEnrollment = (courseId: number): Enrollment | undefined => {
    return enrollments.find(e => e.courseId === courseId);
  };

  // Open confirmation dialog
  const handleOpenConfirm = (type: 'enroll' | 'drop', course?: Course, enrollment?: Enrollment) => {
    setConfirmDialog({ open: true, type, course, enrollment });
  };

  // Close confirmation dialog
  const handleCloseConfirm = () => {
    setConfirmDialog({ open: false, type: 'enroll' });
  };

  // Handle enroll
  const handleEnroll = async () => {
    const { course } = confirmDialog;
    if (!course || !studentId) return;

    setLoading(true);
    try {
      await enrollCourseApi({
        studentId,
        courseId: course.courseId,
      });
      showSnackbar(`Successfully enrolled in ${course.courseName}`, 'success');
      fetchEnrollments();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showSnackbar(err.response?.data?.message || 'Failed to enroll', 'error');
    } finally {
      setLoading(false);
      handleCloseConfirm();
    }
  };

  // Handle drop
  const handleDrop = async () => {
    const { enrollment } = confirmDialog;
    if (!enrollment) return;

    setLoading(true);
    try {
      await dropEnrollmentApi(enrollment.enrollId);
      showSnackbar(`Successfully dropped ${enrollment.courseName}`, 'success');
      fetchEnrollments();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showSnackbar(err.response?.data?.message || 'Failed to drop course', 'error');
    } finally {
      setLoading(false);
      handleCloseConfirm();
    }
  };

  // Available courses (not enrolled)
  const availableCourses = allCourses.filter(course => !isEnrolled(course.courseId));

  // Enrolled courses
  const enrolledCourses = allCourses.filter(course => isEnrolled(course.courseId));

  if (user?.role !== 'student') {
    return null;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Course Enrollment
      </Typography>

      {/* My Enrolled Courses Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
          <Typography variant="h5">
            My Enrolled Courses ({enrollments.length})
          </Typography>
        </Box>

        {loading && enrolledCourses.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : enrolledCourses.length === 0 ? (
          <Card sx={{ bgcolor: 'grey.50' }}>
            <CardContent>
              <Typography color="text.secondary" align="center">
                You haven't enrolled in any courses yet.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {enrolledCourses.map(course => {
              const enrollment = getEnrollment(course.courseId);
              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={course.courseId}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: 2, borderColor: 'success.light' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Chip label={course.courseCode} size="small" color="primary" />
                        <Chip label={`${course.credits} credits`} size="small" variant="outlined" />
                      </Box>
                      <Typography variant="h6" gutterBottom>
                        {course.courseName}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PersonIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {course.teacherName}
                        </Typography>
                      </Box>
                      {enrollment && (
                        <Typography variant="caption" color="text.secondary">
                          Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() => handleOpenConfirm('drop', course, enrollment)}
                        disabled={loading}
                      >
                        Drop Course
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Available Courses Section */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h5">
            Available Courses ({availableCourses.length})
          </Typography>
        </Box>

        {availableCourses.length === 0 ? (
          <Card sx={{ bgcolor: 'grey.50' }}>
            <CardContent>
              <Typography color="text.secondary" align="center">
                No available courses to enroll.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {availableCourses.map(course => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={course.courseId}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip label={course.courseCode} size="small" color="primary" />
                      <Chip label={`${course.credits} credits`} size="small" variant="outlined" />
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      {course.courseName}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {course.teacherName}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleOpenConfirm('enroll', course)}
                      disabled={loading}
                    >
                      Enroll Now
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={handleCloseConfirm}>
        <DialogTitle>
          {confirmDialog.type === 'enroll' ? 'Confirm Enrollment' : 'Confirm Drop'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.type === 'enroll' ? (
              <>
                Are you sure you want to enroll in <strong>{confirmDialog.course?.courseName}</strong> ({confirmDialog.course?.courseCode})?
              </>
            ) : (
              <>
                Are you sure you want to drop <strong>{confirmDialog.enrollment?.courseName}</strong> ({confirmDialog.enrollment?.courseCode})?
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={confirmDialog.type === 'enroll' ? handleEnroll : handleDrop}
            variant="contained"
            color={confirmDialog.type === 'enroll' ? 'primary' : 'error'}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}