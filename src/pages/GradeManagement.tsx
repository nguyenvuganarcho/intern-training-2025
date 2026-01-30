import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  TextField,
  IconButton,
  Snackbar,
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { getCoursesApi } from '../api/course';
import { getEnrollmentsApi } from '../api/enrollment';
import { updateGradeApi } from '../api/grade';
import type { Course, Enrollment } from '../types';
import { getUser } from '../utils/auth';

export default function GradeManagement() {
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    if (user?.role !== 'teacher') {
      navigate('/dashboard');
    }
  }, [user?.role, navigate]);

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseIndex, setSelectedCourseIndex] = useState(0);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Editing state
  const [editingEnrollId, setEditingEnrollId] = useState<number | null>(null);
  const [editingScore, setEditingScore] = useState<string>('');
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Fetch courses taught by teacher
  const fetchCourses = useCallback(async () => {
    if (!user?.teacherId) return;

    setLoading(true);
    try {
      const data = await getCoursesApi(1, 100, `teacherId=${user.teacherId}`);
      setCourses(data.courses);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [user?.teacherId]);

  // Fetch enrollments for selected course
  const fetchEnrollments = useCallback(async (courseId: number) => {
    setLoading(true);
    setError('');

    try {
      const data = await getEnrollmentsApi(1, 100, undefined, 'enrolled');
      // Filter enrollments for this course
      const courseEnrollments = data.enrollments.filter(e => e.courseId === courseId);
      setEnrollments(courseEnrollments);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    if (courses.length > 0) {
      fetchEnrollments(courses[selectedCourseIndex].courseId);
    }
  }, [courses, selectedCourseIndex, fetchEnrollments]);

  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedCourseIndex(newValue);
    setEditingEnrollId(null);
  };

  // Start editing
  const handleStartEdit = (enrollId: number, currentScore: number | null | undefined) => {
    setEditingEnrollId(enrollId);
    setEditingScore(currentScore !== null && currentScore !== undefined ? currentScore.toString() : '');
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingEnrollId(null);
    setEditingScore('');
  };

  // Save grade
  const handleSaveGrade = async (enrollId: number) => {
    const score = parseFloat(editingScore);

    if (isNaN(score) || score < 0 || score > 10) {
      setSnackbar({
        open: true,
        message: 'Score must be between 0 and 10',
        severity: 'error',
      });
      return;
    }

    try {
      await updateGradeApi(enrollId, { finalScore: score });
      setSnackbar({
        open: true,
        message: 'Grade updated successfully',
        severity: 'success',
      });
      
      // Refresh enrollments
      fetchEnrollments(courses[selectedCourseIndex].courseId);
      handleCancelEdit();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update grade',
        severity: 'error',
      });
    }
  };

  // Get grade color
  const getGradeColor = (score: number | null | undefined): 'success' | 'warning' | 'error' | 'default' => {
    if (score === null || score === undefined) return 'default';
    if (score >= 8) return 'success';
    if (score >= 5) return 'warning';
    return 'error';
  };

  if (user?.role !== 'teacher') {
    return null;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Grade Management
      </Typography>

      {/* Loading */}
      {loading && courses.length === 0 && (
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

      {/* No courses */}
      {!loading && courses.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No courses assigned
          </Typography>
          <Typography color="text.secondary">
            You are not teaching any courses yet.
          </Typography>
        </Paper>
      )}

      {/* Courses Tabs */}
      {courses.length > 0 && (
        <>
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={selectedCourseIndex}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              {courses.map((course) => (
                <Tab
                  key={course.courseId}
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {course.courseCode}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {course.courseName}
                      </Typography>
                    </Box>
                  }
                />
              ))}
            </Tabs>
          </Paper>

          {/* Students Table */}
          <Paper>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">
                {courses[selectedCourseIndex].courseName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {enrollments.length} student{enrollments.length !== 1 ? 's' : ''} enrolled
              </Typography>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : enrollments.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  No students enrolled in this course yet.
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Student Code</strong></TableCell>
                      <TableCell><strong>Student Name</strong></TableCell>
                      <TableCell align="center"><strong>Credits</strong></TableCell>
                      <TableCell align="center"><strong>Final Score</strong></TableCell>
                      <TableCell align="center"><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {enrollments.map((enrollment) => (
                      <TableRow key={enrollment.enrollId} hover>
                        <TableCell>
                          <Chip label={enrollment.studentCode} size="small" />
                        </TableCell>
                        <TableCell>{enrollment.studentName}</TableCell>
                        <TableCell align="center">{enrollment.credits}</TableCell>
                        <TableCell align="center">
                          {editingEnrollId === enrollment.enrollId ? (
                            <TextField
                              size="small"
                              type="number"
                              value={editingScore}
                              onChange={(e) => setEditingScore(e.target.value)}
                              inputProps={{ min: 0, max: 10, step: 0.1 }}
                              sx={{ width: 100 }}
                              autoFocus
                            />
                          ) : (
                            <Chip
                              label={enrollment.finalScore !== null && enrollment.finalScore !== undefined 
                                ? enrollment.finalScore.toFixed(1) 
                                : 'N/A'}
                              color={getGradeColor(enrollment.finalScore)}
                              sx={{ minWidth: 60, fontWeight: 'bold' }}
                            />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {editingEnrollId === enrollment.enrollId ? (
                            <>
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleSaveGrade(enrollment.enrollId)}
                              >
                                <SaveIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={handleCancelEdit}
                              >
                                <CancelIcon />
                              </IconButton>
                            </>
                          ) : (
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleStartEdit(enrollment.enrollId, enrollment.finalScore)}
                            >
                              <EditIcon />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </>
      )}

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