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
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Grade as GradeIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { getEnrollmentsApi } from '../api/enrollment';
import type { Enrollment } from '../types';
import { getUser } from '../utils/auth';

export default function MyGrades() {
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    if (user?.role !== 'student') {
      navigate('/dashboard');
    }
  }, [user?.role, navigate]);

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Fetch enrollments with grades
  const fetchGrades = useCallback(async () => {
    if (!user?.studentId) return;

    setLoading(true);
    setError('');

    try {
      const data = await getEnrollmentsApi(1, 100, user.studentId, 'enrolled');
      setEnrollments(data.enrollments);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load grades');
    } finally {
      setLoading(false);
    }
  }, [user?.studentId]);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  // Calculate statistics
  const totalCourses = enrollments.length;
  const gradedCourses = enrollments.filter(e => e.finalScore !== null && e.finalScore !== undefined).length;
  const totalCredits = enrollments.reduce((sum, e) => sum + e.credits, 0);
  const completedCredits = enrollments
    .filter(e => e.finalScore !== null && e.finalScore !== undefined)
    .reduce((sum, e) => sum + e.credits, 0);
  
  // Calculate GPA (only graded courses)
  const gpa = gradedCourses > 0
    ? enrollments
        .filter(e => e.finalScore !== null && e.finalScore !== undefined)
        .reduce((sum, e) => sum + (e.finalScore! * e.credits), 0) / completedCredits
    : null;

  // Get grade color
  const getGradeColor = (score: number | null | undefined): 'success' | 'warning' | 'error' | 'default' => {
    if (score === null || score === undefined) return 'default';
    if (score >= 8) return 'success';
    if (score >= 5) return 'warning';
    return 'error';
  };

  // Get grade label
  const getGradeLabel = (score: number | null | undefined): string => {
    if (score === null || score === undefined) return 'N/A';
    return score.toFixed(1);
  };

  if (user?.role !== 'student') {
    return null;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Grades
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body2" color="text.secondary">
                  Total Courses
                </Typography>
              </Box>
              <Typography variant="h4">{totalCourses}</Typography>
              <Typography variant="caption" color="text.secondary">
                {gradedCourses} graded
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <GradeIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="body2" color="text.secondary">
                  GPA
                </Typography>
              </Box>
              <Typography variant="h4">
                {gpa !== null ? gpa.toFixed(2) : 'N/A'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Out of 10.0
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="body2" color="text.secondary">
                  Total Credits
                </Typography>
              </Box>
              <Typography variant="h4">{totalCredits}</Typography>
              <Typography variant="caption" color="text.secondary">
                {completedCredits} completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SchoolIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="body2" color="text.secondary">
                  Pending
                </Typography>
              </Box>
              <Typography variant="h4">{totalCourses - gradedCourses}</Typography>
              <Typography variant="caption" color="text.secondary">
                Not graded yet
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
      {!loading && !error && enrollments.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
          <GradeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No courses enrolled
          </Typography>
          <Typography color="text.secondary">
            Enroll in courses to see your grades here.
          </Typography>
        </Paper>
      )}

      {/* Grades Table */}
      {!loading && !error && enrollments.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Course Code</strong></TableCell>
                <TableCell><strong>Course Name</strong></TableCell>
                <TableCell align="center"><strong>Credits</strong></TableCell>
                <TableCell><strong>Teacher</strong></TableCell>
                <TableCell align="center"><strong>Final Score</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {enrollments.map((enrollment) => (
                <TableRow key={enrollment.enrollId} hover>
                  <TableCell>
                    <Chip label={enrollment.courseCode} size="small" color="primary" />
                  </TableCell>
                  <TableCell>{enrollment.courseName}</TableCell>
                  <TableCell align="center">{enrollment.credits}</TableCell>
                  <TableCell>{enrollment.teacherName}</TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={getGradeLabel(enrollment.finalScore)}
                      color={getGradeColor(enrollment.finalScore)}
                      sx={{ minWidth: 60, fontWeight: 'bold' }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}