import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Grid,
  Avatar,
} from "@mui/material";
import { AccountCircle, Lock as LockIcon } from "@mui/icons-material";
import { getUser } from "../utils/auth";
import { changePasswordApi } from "../api/profile";
import type { ChangePasswordRequest } from "../types";

export default function Profile() {
  const user = getUser(); // Lấy từ localStorage
  const [loading, setLoading] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);

  // Password form state
  const [passwordForm, setPasswordForm] = useState<ChangePasswordRequest>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Show snackbar
  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  // Handle password form change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });
  };

  // Change password
  const handleChangePassword = async () => {
    // Validation
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      showSnackbar("Please fill in all password fields", "error");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showSnackbar("New passwords do not match", "error");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showSnackbar("New password must be at least 6 characters", "error");
      return;
    }

    if (!user?.userId) {
      showSnackbar("User ID not found", "error");
      return;
    }

    setLoading(true);
    try {
      await changePasswordApi(user.userId, {
        // ← PASS userId
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      // Reset form
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setOpenPasswordDialog(false);
      showSnackbar("Password changed successfully", "success");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showSnackbar(
        err.response?.data?.message || "Failed to change password",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Profile Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Info Card */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <AccountCircle sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h6">Personal Information</Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth
                label="Full Name"
                value={user?.fullName || "N/A"}
                disabled
              />

              <TextField
                fullWidth
                label="Email"
                value={user?.email || "N/A"}
                disabled
              />

              <TextField
                fullWidth
                label="Username"
                value={user?.username || ""}
                disabled
              />

              <TextField
                fullWidth
                label="Role"
                value={user?.role || ""}
                disabled
              />
            </Box>
          </Paper>
        </Grid>

        {/* Quick Info Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: "primary.main",
                  mb: 2,
                  fontSize: 40,
                }}
              >
                {user?.fullName?.charAt(0) || user?.username?.charAt(0) || "?"}
              </Avatar>
              <Typography variant="h6" gutterBottom>
                {user?.fullName || user?.username}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                @{user?.username}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  bgcolor: "primary.light",
                  color: "primary.dark",
                  px: 2,
                  py: 0.5,
                  borderRadius: 1,
                  textTransform: "uppercase",
                  fontWeight: "bold",
                }}
              >
                {user?.role}
              </Typography>
            </Box>
          </Paper>

          {/* Security Card */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <LockIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Security</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary" paragraph>
              Keep your account secure by using a strong password.
            </Typography>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<LockIcon />}
              onClick={() => setOpenPasswordDialog(true)}
            >
              Change Password
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Change Password Dialog */}
      <Dialog
        open={openPasswordDialog}
        onClose={() => setOpenPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Current Password"
              name="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              autoFocus
            />
            <TextField
              fullWidth
              label="New Password"
              name="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              helperText="At least 6 characters"
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenPasswordDialog(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Change Password"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
