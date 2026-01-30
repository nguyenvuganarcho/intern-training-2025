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
} from '@mui/material';
import { DataGrid, type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import {  Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
  getTeachersApi,
  updateTeacherApi,
  deleteTeacherApi,
} from '../api/teacher';
import type { Teacher, UpdateTeacherDto } from '../types';
import { getUser } from '../utils/auth';

export default function Teachers() {
  const navigate = useNavigate();
  const user = getUser();
  
  // Check role - Student không được vào
  useEffect(() => {
    if (user?.role === 'student') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [search, setSearch] = useState('');
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    phone: '',
    address: '',
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

  // Show snackbar
  const showSnackbar = useCallback((message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // Fetch teachers
  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTeachersApi(
        paginationModel.page + 1,
        paginationModel.pageSize,
        search
      );
      setTeachers(data.teachers);
      setTotal(data.total);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showSnackbar(err.response?.data?.message || 'Failed to load teachers', 'error');
    } finally {
      setLoading(false);
    }
  }, [paginationModel.page, paginationModel.pageSize, search, showSnackbar]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  // Handle search
  const handleSearch = () => {
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  // Open edit dialog
  const handleOpenEdit = (teacher: Teacher) => {
    if (!canEdit) {
      showSnackbar('You do not have permission to edit teachers', 'error');
      return;
    }
    setEditingTeacher(teacher);
    setFormData({
      fullName: teacher.fullName,
      dateOfBirth: teacher.dateOfBirth ? teacher.dateOfBirth.split('T')[0] : '',
      phone: teacher.phone || '',
      address: teacher.address || '',
    });
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTeacher(null);
  };

  // Handle form change
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!editingTeacher) return;

    try {
      const updateData: UpdateTeacherDto = {
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
      };
      await updateTeacherApi(editingTeacher.teacherId, updateData);
      showSnackbar('Teacher updated successfully', 'success');
      
      handleCloseDialog();
      fetchTeachers();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showSnackbar(err.response?.data?.message || 'Operation failed', 'error');
    }
  };

  // Handle delete
  const handleDelete = async (teacherId: number) => {
    if (!canDelete) {
      showSnackbar('You do not have permission to delete teachers', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this teacher?')) {
      return;
    }

    try {
      await deleteTeacherApi(teacherId);
      showSnackbar('Teacher deleted successfully', 'success');
      fetchTeachers();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showSnackbar(err.response?.data?.message || 'Failed to delete teacher', 'error');
    }
  };

  // Table columns
  const columns: GridColDef[] = [
    { field: 'userId', headerName: 'User ID', width: 80 },
    { field: 'teacherCode', headerName: 'Teacher Code', width: 120 },
    { field: 'fullName', headerName: 'Full Name', width: 200 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'phone', headerName: 'Phone', width: 130 },
    { field: 'address', headerName: 'Address', width: 150 },
    {
      field: 'dateOfBirth',
      headerName: 'Date of Birth',
      width: 130,
      valueFormatter: (value: string) => {
        return value ? new Date(value).toLocaleDateString() : '';
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      valueGetter: (_value: unknown, row: Teacher) => row.status || 'active',
    },
  ];

  // Add actions column if user can edit or delete
  if (canEdit || canDelete) {
    columns.push({
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params: { row: Teacher }) => (
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
              onClick={() => handleDelete(params.row.teacherId)}
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
        <Typography variant="h4">Teachers</Typography>
      </Box>

      {/* Role info banner */}
      {user?.role === 'teacher' && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'info.light' }}>
          <Typography variant="body2" color="info.dark">
            You are viewing as Teacher. You can only view teacher information.
          </Typography>
        </Paper>
      )}

      {/* Search */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          size="small"
          placeholder="Search by name, code, email..."
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
          rows={teachers}
          columns={columns}
          getRowId={(row: Teacher) => row.userId}
          loading={loading}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rowCount={total}
          pageSizeOptions={[5, 10, 25, 50]}
          disableRowSelectionOnClick
        />
      </Box>

      {/* Edit Dialog */}
      {canEdit && (
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Teacher</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleFormChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleFormChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleFormChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleFormChange}
              margin="normal"
              multiline
              rows={2}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              Update
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