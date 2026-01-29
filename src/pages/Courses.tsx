import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Alert,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { DataGrid, type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
  getCoursesApi,
  createCourseApi,
  updateCourseApi,
  deleteCourseApi,
  getTeachersForDropdownApi,
} from '../api/course';
import type { Course, CreateCourseDto, UpdateCourseDto } from '../types';
import { getUser } from '../utils/auth';

export default function Courses() {
  const navigate = useNavigate();
  const user = getUser();
  
  // Check role
  useEffect(() => {
    if (user?.role === 'student') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [search, setSearch] = useState('');
  
  // Teachers dropdown
  const [teachers, setTeachers] = useState<{ teacherId: number; teacherCode: string; fullName: string }[]>([]);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    credits: 3,
    teacherId: 0,
  });
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Check permissions
  const canEdit = user?.role === 'admin';
  const canDelete = user?.role === 'admin';
  const canCreate = user?.role === 'admin';

  // Show snackbar
  const showSnackbar = useCallback((message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCoursesApi(
        paginationModel.page + 1,
        paginationModel.pageSize,
        search
      );
      setCourses(data.courses);
      setTotal(data.total);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showSnackbar(err.response?.data?.message || 'Failed to load courses', 'error');
    } finally {
      setLoading(false);
    }
  }, [paginationModel.page, paginationModel.pageSize, search, showSnackbar]);

  // Fetch teachers for dropdown
  const fetchTeachers = async () => {
    try {
      const data = await getTeachersForDropdownApi();
      setTeachers(data);
    } catch (error: unknown) {
      console.error('Failed to load teachers:', error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    if (canCreate || canEdit) {
      fetchTeachers();
    }
  }, [canCreate, canEdit]);

  // Handle search
  const handleSearch = () => {
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  // Open create dialog
  const handleOpenCreate = () => {
    if (!canCreate) {
      showSnackbar('You do not have permission to create courses', 'error');
      return;
    }
    setEditingCourse(null);
    setFormData({
      courseCode: '',
      courseName: '',
      credits: 3,
      teacherId: teachers.length > 0 ? teachers[0].teacherId : 0,
    });
    setOpenDialog(true);
  };

  // Open edit dialog
  const handleOpenEdit = async (course: Course) => {
    if (!canEdit) {
      showSnackbar('You do not have permission to edit courses', 'error');
      return;
    }
    setEditingCourse(course);
    setFormData({
      courseCode: course.courseCode,
      courseName: course.courseName,
      credits: course.credits,
      teacherId: course.teacherId,
    });
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCourse(null);
  };

  // Handle form change
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string | number } }) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'credits' || name === 'teacherId' ? Number(value) : value,
    });
  };

  // Handle submit
  const handleSubmit = async () => {
    // Validation
    if (!formData.courseCode || !formData.courseName || !formData.teacherId) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }

    if (formData.credits < 1 || formData.credits > 10) {
      showSnackbar('Credits must be between 1 and 10', 'error');
      return;
    }

    try {
      if (editingCourse) {
        // Update
        const updateData: UpdateCourseDto = {
          courseCode: formData.courseCode,
          courseName: formData.courseName,
          credits: formData.credits,
          teacherId: formData.teacherId,
        };
        await updateCourseApi(editingCourse.courseId, updateData);
        showSnackbar('Course updated successfully', 'success');
      } else {
        // Create
        const createData: CreateCourseDto = {
          courseCode: formData.courseCode,
          courseName: formData.courseName,
          credits: formData.credits,
          teacherId: formData.teacherId,
        };
        await createCourseApi(createData);
        showSnackbar('Course created successfully', 'success');
      }
      
      handleCloseDialog();
      fetchCourses();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showSnackbar(err.response?.data?.message || 'Operation failed', 'error');
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!canDelete) {
      showSnackbar('You do not have permission to delete courses', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      await deleteCourseApi(id);
      showSnackbar('Course deleted successfully', 'success');
      fetchCourses();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showSnackbar(err.response?.data?.message || 'Failed to delete course', 'error');
    }
  };

  // Table columns
  const columns: GridColDef[] = [
    { field: 'courseId', headerName: 'ID', width: 70 },
    { field: 'courseCode', headerName: 'Course Code', width: 120 },
    { field: 'courseName', headerName: 'Course Name', width: 250 },
    { field: 'credits', headerName: 'Credits', width: 100 },
    { field: 'teacherCode', headerName: 'Teacher Code', width: 120 },
    { field: 'teacherName', headerName: 'Teacher Name', width: 200 },
    {
      field: 'createdAt',
      headerName: 'Created At',
      width: 130,
      valueFormatter: (value: string) => {
        return value ? new Date(value).toLocaleDateString() : '';
      },
    },
  ];

  // Add actions column if user can edit or delete
  if (canEdit || canDelete) {
    columns.push({
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params: { row: Course }) => (
        <Box>
          {canEdit && (
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleOpenEdit(params.row)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
          {canDelete && (
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row.courseId)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      ),
    });
  }

  if (user?.role === 'student') {
    return null;
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Courses</Typography>
        {canCreate && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
          >
            Add Course
          </Button>
        )}
      </Box>

      {/* Role info banner */}
      {user?.role === 'teacher' && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'info.light' }}>
          <Typography variant="body2" color="info.dark">
            ℹ️ You are viewing as Teacher. You can only view course information.
          </Typography>
        </Paper>
      )}

      {/* Search */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          size="small"
          placeholder="Search by code, name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          sx={{ width: 300 }}
        />
        <Button variant="outlined" onClick={handleSearch}>
          Search
        </Button>
      </Box>

      {/* Table */}
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={courses}
          columns={columns}
          getRowId={(row: Course) => row.courseId}
          loading={loading}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rowCount={total}
          pageSizeOptions={[5, 10, 25, 50]}
          disableRowSelectionOnClick
        />
      </Box>

      {/* Create/Edit Dialog */}
      {(canCreate || canEdit) && (
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingCourse ? 'Edit Course' : 'Create Course'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Course Code"
              name="courseCode"
              value={formData.courseCode}
              onChange={handleFormChange}
              margin="normal"
              required
              placeholder="e.g., CS101"
            />
            <TextField
              fullWidth
              label="Course Name"
              name="courseName"
              value={formData.courseName}
              onChange={handleFormChange}
              margin="normal"
              required
              placeholder="e.g., Introduction to Programming"
            />
            <TextField
              fullWidth
              label="Credits"
              name="credits"
              type="number"
              value={formData.credits}
              onChange={handleFormChange}
              margin="normal"
              required
              inputProps={{ min: 1, max: 10 }}
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Teacher</InputLabel>
              <Select
                name="teacherId"
                value={formData.teacherId}
                onChange={(e) => handleFormChange({ target: { name: 'teacherId', value: e.target.value } })}
                label="Teacher"
              >
                {teachers.map((teacher) => (
                  <MenuItem key={teacher.teacherId} value={teacher.teacherId}>
                    {teacher.teacherCode} - {teacher.fullName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingCourse ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
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