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
  getClassesApi,
  createClassApi,
  updateClassApi,
  deleteClassApi,
  getCoursesForDropdownApi,
} from '../api/class';
import type { Class, CreateClassDto, UpdateClassDto } from '../types';
import { getUser } from '../utils/auth';

export default function Classes() {
  const navigate = useNavigate();
  const user = getUser();
  
  // Check role
  useEffect(() => {
    if (user?.role === 'student') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [search, setSearch] = useState('');
  
  // Courses dropdown
  const [courses, setCourses] = useState<{ courseId: number; courseCode: string; courseName: string }[]>([]);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState({
    courseId: 0,
    className: '',
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

  // Fetch classes
  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getClassesApi(
        paginationModel.page + 1,
        paginationModel.pageSize,
        search
      );
      setClasses(data.classes);
      setTotal(data.total);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showSnackbar(err.response?.data?.message || 'Failed to load classes', 'error');
    } finally {
      setLoading(false);
    }
  }, [paginationModel.page, paginationModel.pageSize, search, showSnackbar]);

  // Fetch courses for dropdown
  const fetchCourses = async () => {
    try {
      const data = await getCoursesForDropdownApi();
      setCourses(data);
    } catch (error: unknown) {
      console.error('Failed to load courses:', error);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    if (canCreate || canEdit) {
      fetchCourses();
    }
  }, [canCreate, canEdit]);

  // Handle search
  const handleSearch = () => {
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  // Open create dialog
  const handleOpenCreate = () => {
    if (!canCreate) {
      showSnackbar('You do not have permission to create classes', 'error');
      return;
    }
    setEditingClass(null);
    setFormData({
      courseId: courses.length > 0 ? courses[0].courseId : 0,
      className: '',
    });
    setOpenDialog(true);
  };

  // Open edit dialog
  const handleOpenEdit = (classItem: Class) => {
    if (!canEdit) {
      showSnackbar('You do not have permission to edit classes', 'error');
      return;
    }
    setEditingClass(classItem);
    setFormData({
      courseId: classItem.courseId,
      className: classItem.className,
    });
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingClass(null);
  };

  // Handle form change
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string | number } }) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'courseId' ? Number(value) : value,
    });
  };

  // Handle submit
  const handleSubmit = async () => {
    // Validation
    if (!formData.courseId || !formData.className) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }

    try {
      if (editingClass) {
        // Update
        const updateData: UpdateClassDto = {
          courseId: formData.courseId,
          className: formData.className,
        };
        await updateClassApi(editingClass.classId, updateData);
        showSnackbar('Class updated successfully', 'success');
      } else {
        // Create
        const createData: CreateClassDto = {
          courseId: formData.courseId,
          className: formData.className,
        };
        await createClassApi(createData);
        showSnackbar('Class created successfully', 'success');
      }
      
      handleCloseDialog();
      fetchClasses();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showSnackbar(err.response?.data?.message || 'Operation failed', 'error');
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!canDelete) {
      showSnackbar('You do not have permission to delete classes', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this class?')) {
      return;
    }

    try {
      await deleteClassApi(id);
      showSnackbar('Class deleted successfully', 'success');
      fetchClasses();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showSnackbar(err.response?.data?.message || 'Failed to delete class', 'error');
    }
  };

  // Table columns
  const columns: GridColDef[] = [
    { field: 'classId', headerName: 'ID', width: 70 },
    { field: 'courseCode', headerName: 'Course Code', width: 120 },
    { field: 'courseName', headerName: 'Course Name', width: 250 },
    { field: 'className', headerName: 'Class Name', width: 120 },
    { field: 'teacherName', headerName: 'Teacher', width: 200 },
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
      renderCell: (params: { row: Class }) => (
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
              onClick={() => handleDelete(params.row.classId)}
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
        <Typography variant="h4">Classes</Typography>
        {canCreate && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
          >
            Add Class
          </Button>
        )}
      </Box>

      {/* Role info banner */}
      {user?.role === 'teacher' && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'info.light' }}>
          <Typography variant="body2" color="info.dark">
            ℹ️ You are viewing as Teacher. You can only view class information.
          </Typography>
        </Paper>
      )}

      {/* Search */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          size="small"
          placeholder="Search by course code, class name..."
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
          rows={classes}
          columns={columns}
          getRowId={(row: Class) => row.classId}
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
            {editingClass ? 'Edit Class' : 'Create Class'}
          </DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Course</InputLabel>
              <Select
                name="courseId"
                value={formData.courseId}
                onChange={(e) => handleFormChange({ target: { name: 'courseId', value: e.target.value } })}
                label="Course"
              >
                {courses.map((course) => (
                  <MenuItem key={course.courseId} value={course.courseId}>
                    {course.courseCode} - {course.courseName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Class Name"
              name="className"
              value={formData.className}
              onChange={handleFormChange}
              margin="normal"
              required
              placeholder="e.g., L01, L02, L03"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingClass ? 'Update' : 'Create'}
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