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
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
  getStudentsApi,
  updateStudentApi,
  deleteStudentApi,
} from '../api/student';
import type { Student, UpdateStudentDto } from '../types';
import { getUser } from '../utils/auth';

export default function Students() {
  const navigate = useNavigate();
  const user = getUser();
  
  // Check role
  useEffect(() => {
    if (user?.role === 'student') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [search, setSearch] = useState('');
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
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
  const canCreate = user?.role === 'admin';

  // Show snackbar
  const showSnackbar = useCallback((message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // Fetch students
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getStudentsApi(
        paginationModel.page + 1,
        paginationModel.pageSize,
        search
      );
      setStudents(data.students);
      setTotal(data.total);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showSnackbar(err.response?.data?.message || 'Failed to load students', 'error');
    } finally {
      setLoading(false);
    }
  }, [paginationModel.page, paginationModel.pageSize, search, showSnackbar]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Handle search
  const handleSearch = () => {
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  // Open create dialog
  const handleOpenCreate = () => {
    if (!canCreate) {
      showSnackbar('You do not have permission to create students', 'error');
      return;
    }
    setEditingStudent(null);
    setFormData({
      fullName: '',
      dateOfBirth: '',
      phone: '',
      address: '',
    });
    setOpenDialog(true);
  };

  // Open edit dialog
  const handleOpenEdit = (student: Student) => {
    if (!canEdit) {
      showSnackbar('You do not have permission to edit students', 'error');
      return;
    }
    setEditingStudent(student);
    setFormData({
      fullName: student.fullName,
      dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
      phone: student.phone || '',
      address: student.address || '',
    });
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingStudent(null);
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
    try {
      if (editingStudent) {
        const updateData: UpdateStudentDto = {
          fullName: formData.fullName,
          dateOfBirth: formData.dateOfBirth || undefined,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
        };
        await updateStudentApi(editingStudent.studentId, updateData);
        showSnackbar('Student updated successfully', 'success');
      } else {
        showSnackbar('Create functionality requires user selection', 'error');
        return;
      }
      
      handleCloseDialog();
      fetchStudents();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showSnackbar(err.response?.data?.message || 'Operation failed', 'error');
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!canDelete) {
      showSnackbar('You do not have permission to delete students', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this student?')) {
      return;
    }

    try {
      await deleteStudentApi(id);
      showSnackbar('Student deleted successfully', 'success');
      fetchStudents();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showSnackbar(err.response?.data?.message || 'Failed to delete student', 'error');
    }
  };

  // Table columns
  const columns: GridColDef[] = [
    { field: 'studentId', headerName: 'ID', width: 70 },
    { field: 'studentCode', headerName: 'Student Code', width: 120 },
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
      valueGetter: (_value: unknown, row: Student) => row.status || 'active',
    },
  ];

  // Add actions column if user can edit or delete
  if (canEdit || canDelete) {
    columns.push({
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params: { row: Student }) => (
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
              onClick={() => handleDelete(params.row.studentId)}
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
        <Typography variant="h4">Students</Typography>
        {canCreate && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
          >
            Add Student
          </Button>
        )}
      </Box>

      {/* Role info banner */}
      {user?.role === 'teacher' && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'info.light' }}>
          <Typography variant="body2" color="info.dark">
            You are viewing as Teacher. You can only view student information.
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
          rows={students}
          columns={columns}
          getRowId={(row: Student) => row.studentId}
          loading={loading}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rowCount={total}
          pageSizeOptions={[5, 10, 25, 50]}
          disableRowSelectionOnClick
        />
      </Box>

      {/* Dialog */}
      {canEdit && (
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingStudent ? 'Edit Student' : 'Create Student'}
          </DialogTitle>
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
              {editingStudent ? 'Update' : 'Create'}
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