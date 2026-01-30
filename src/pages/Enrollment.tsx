import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
} from "@mui/material";
import {
  School as SchoolIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Room as RoomIcon,
  CalendarMonth as CalendarIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { getCoursesApi } from "../api/course";
import {
  getEnrollmentsApi,
  enrollCourseApi,
  dropEnrollmentApi,
  selectClassApi,
} from "../api/enrollment";
import { getClassesByCourseApi } from "../api/class";
import { getSchedulesApi } from "../api/schedule";
import type { Course, Enrollment, Class, Schedule } from "../types";
import { getUser } from "../utils/auth";

export default function EnrollmentPage() {
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    if (user?.role !== "student") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Enroll/Drop dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "enroll" | "drop";
    course?: Course;
    enrollment?: Enrollment;
  }>({
    open: false,
    type: "enroll",
  });

  // ✅ Class selection dialog
  const [classDialog, setClassDialog] = useState<{
    open: boolean;
    enrollment?: Enrollment;
    classes: Class[];
    schedules: Record<number, Schedule[]>;
    loading: boolean;
  }>({
    open: false,
    classes: [],
    schedules: {},
    loading: false,
  });

  const [studentId, setStudentId] = useState<number | null>(null);

  const showSnackbar = useCallback(
    (message: string, severity: "success" | "error") => {
      setSnackbar({ open: true, message, severity });
    },
    [],
  );

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    try {
      const data = await getCoursesApi(1, 100);
      setAllCourses(data.courses);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showSnackbar(
        err.response?.data?.message || "Failed to load courses",
        "error",
      );
    }
  }, [showSnackbar]);

  // Fetch enrollments
  const fetchEnrollments = useCallback(async () => {
    if (!studentId) return;

    setLoading(true);
    try {
      const data = await getEnrollmentsApi(1, 100, studentId, "enrolled");
      setEnrollments(data.enrollments);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showSnackbar(
        err.response?.data?.message || "Failed to load enrollments",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [studentId, showSnackbar]);

  useEffect(() => {
    if (user?.studentId) {
      setStudentId(user.studentId);
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
    return enrollments.some((e) => e.courseId === courseId);
  };

  const getEnrollment = (courseId: number): Enrollment | undefined => {
    return enrollments.find((e) => e.courseId === courseId);
  };

  // Enroll handlers
  const handleOpenConfirm = (
    type: "enroll" | "drop",
    course?: Course,
    enrollment?: Enrollment,
  ) => {
    setConfirmDialog({ open: true, type, course, enrollment });
  };

  const handleCloseConfirm = () => {
    setConfirmDialog({ open: false, type: "enroll" });
  };

  const handleEnroll = async () => {
    const { course } = confirmDialog;
    if (!course || !studentId) return;

    setLoading(true);
    handleCloseConfirm();

    try {
      await enrollCourseApi({
        studentId,
        courseId: course.courseId,
      });
      showSnackbar(`Successfully enrolled in ${course.courseName}`, "success");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showSnackbar(err.response?.data?.message || "Failed to enroll", "error");
    } finally {
      setLoading(false);
      await fetchEnrollments();
    }
  };

  const handleDrop = async () => {
    const { enrollment } = confirmDialog;
    if (!enrollment) return;

    setLoading(true);
    handleCloseConfirm();

    try {
      await dropEnrollmentApi(enrollment.enrollId);
      showSnackbar(`Successfully dropped ${enrollment.courseName}`, "success");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showSnackbar(
        err.response?.data?.message || "Failed to drop course",
        "error",
      );
    } finally {
      setLoading(false);
      await fetchEnrollments();
    }
  };

  // ✅ Class selection handlers
  const handleOpenClassDialog = async (enrollment: Enrollment) => {
    setClassDialog({
      open: true,
      enrollment,
      classes: [],
      schedules: {},
      loading: true,
    });

    try {
      // Fetch classes for this course
      const classes = await getClassesByCourseApi(enrollment.courseId);

      // Fetch schedules for each class
      const schedules: Record<number, Schedule[]> = {};
      await Promise.all(
        classes.map(async (cls) => {
          const scheduleData = await getSchedulesApi(1, 100, {
            classId: cls.classId,
          });
          schedules[cls.classId] = scheduleData.schedules;
        }),
      );

      setClassDialog({
        open: true,
        enrollment,
        classes,
        schedules,
        loading: false,
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showSnackbar(
        err.response?.data?.message || "Failed to load classes",
        "error",
      );
      handleCloseClassDialog();
    }
  };

  const handleCloseClassDialog = () => {
    setClassDialog({
      open: false,
      classes: [],
      schedules: {},
      loading: false,
    });
  };

  const handleSelectClass = async (classId: number) => {
    const { enrollment } = classDialog;
    if (!enrollment) return;

    setClassDialog({ ...classDialog, loading: true });

    try {
      const result = await selectClassApi(enrollment.enrollId, classId);
      console.log("=== SELECT CLASS RESULT ===");
      console.log("API response:", result);
      console.log("Has classId?", result.classId);
      console.log("Has className?", result.className);

      showSnackbar("Class selected successfully", "success");
      handleCloseClassDialog();
      
      setTimeout(async () => {
        await fetchEnrollments();
      }, 500);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Select class error:", err);
      showSnackbar(
        err.response?.data?.message || "Failed to select class",
        "error",
      );
      setClassDialog({ ...classDialog, loading: false });
    }
  };

  // Format time
  const formatTime = (time: string) => {
    if (!time) return '';
  // If time is already "HH:MM", return as is
    return time.substring(0, 5);
  };

  const availableCourses = allCourses.filter(
    (course) => !isEnrolled(course.courseId),
  );
  const enrolledCourses = allCourses.filter((course) =>
    isEnrolled(course.courseId),
  );

  if (user?.role !== "student") {
    return null;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Course Enrollment
      </Typography>

      {/* My Enrolled Courses */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <CheckCircleIcon sx={{ mr: 1, color: "success.main" }} />
          <Typography variant="h5">
            My Enrolled Courses ({enrollments.length})
          </Typography>
        </Box>

        {loading && enrolledCourses.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : enrolledCourses.length === 0 ? (
          <Card sx={{ bgcolor: "grey.50" }}>
            <CardContent>
              <Typography color="text.secondary" align="center">
                You haven't enrolled in any courses yet.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {enrolledCourses.map((course) => {
              const enrollment = getEnrollment(course.courseId);
              const hasClass = enrollment?.classId;

              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={course.courseId}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      border: 2,
                      borderColor: hasClass ? "success.light" : "warning.light",
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Chip
                          label={course.courseCode}
                          size="small"
                          color="primary"
                        />
                        <Chip
                          label={`${course.credits} credits`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      <Typography variant="h6" gutterBottom>
                        {course.courseName}
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <PersonIcon
                          sx={{
                            fontSize: 16,
                            mr: 0.5,
                            color: "text.secondary",
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {course.teacherName}
                        </Typography>
                      </Box>

                      {/* Class Info */}
                      {hasClass ? (
                        <Chip
                          icon={<CheckCircleIcon />}
                          label={`Class: ${enrollment.className}`}
                          size="small"
                          color="success"
                          sx={{ mt: 1 }}
                        />
                      ) : (
                        <Chip
                          icon={<WarningIcon />}
                          label="No class selected"
                          size="small"
                          color="warning"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </CardContent>
                    <CardActions>
                      {!hasClass && enrollment && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ScheduleIcon />}
                          onClick={() => handleOpenClassDialog(enrollment)}
                          disabled={loading}
                        >
                          Select Class
                        </Button>
                      )}
                      <Button
                        size="small"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() =>
                          handleOpenConfirm("drop", course, enrollment)
                        }
                        disabled={loading}
                      >
                        Drop
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

      {/* Available Courses */}
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <SchoolIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h5">
            Available Courses ({availableCourses.length})
          </Typography>
        </Box>

        {availableCourses.length === 0 ? (
          <Card sx={{ bgcolor: "grey.50" }}>
            <CardContent>
              <Typography color="text.secondary" align="center">
                No available courses to enroll.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {availableCourses.map((course) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={course.courseId}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Chip
                        label={course.courseCode}
                        size="small"
                        color="primary"
                      />
                      <Chip
                        label={`${course.credits} credits`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      {course.courseName}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <PersonIcon
                        sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }}
                      />
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
                      onClick={() => handleOpenConfirm("enroll", course)}
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

      {/* Enroll/Drop Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={handleCloseConfirm}>
        <DialogTitle>
          {confirmDialog.type === "enroll"
            ? "Confirm Enrollment"
            : "Confirm Drop"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.type === "enroll" ? (
              <>
                Are you sure you want to enroll in{" "}
                <strong>{confirmDialog.course?.courseName}</strong>?
                <br />
                <br />
                You will need to select a class after enrolling.
              </>
            ) : (
              <>
                Are you sure you want to drop{" "}
                <strong>{confirmDialog.enrollment?.courseName}</strong>?
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={
              confirmDialog.type === "enroll" ? handleEnroll : handleDrop
            }
            variant="contained"
            color={confirmDialog.type === "enroll" ? "primary" : "error"}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ Class Selection Dialog */}
      <Dialog
        open={classDialog.open}
        onClose={handleCloseClassDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Select Class for {classDialog.enrollment?.courseName}
        </DialogTitle>
        <DialogContent>
          {classDialog.loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : classDialog.classes.length === 0 ? (
            <Alert severity="warning">
              No classes available for this course.
            </Alert>
          ) : (
            <List>
              {classDialog.classes.map((cls) => {
                const schedules = classDialog.schedules[cls.classId] || [];

                return (
                  <Paper key={cls.classId} sx={{ mb: 2 }} variant="outlined">
                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={() => handleSelectClass(cls.classId)}
                      >
                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography variant="h6">
                                {cls.className}
                              </Typography>
                              <Chip
                                label={`${schedules.length} sessions`}
                                size="small"
                              />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              {schedules.length === 0 ? (
                                <Box
                                  component="span"
                                  sx={{
                                    color: "text.secondary",
                                    fontSize: "0.875rem",
                                  }}
                                >
                                  No schedule available
                                </Box>
                              ) : (
                                <Stack spacing={0.5}>
                                  {schedules.map((schedule) => (
                                    <Box
                                      key={schedule.scheduleId}
                                      sx={{
                                        display: "flex",
                                        gap: 2,
                                        alignItems: "center",
                                      }}
                                    >
                                      <Chip
                                        icon={<CalendarIcon />}
                                        label={schedule.dayOfTheWeek}
                                        size="small"
                                        variant="outlined"
                                        sx={{minWidth: 100}}
                                      />
                                      <Chip
                                        icon={<ScheduleIcon />}
                                        label={`${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)}`}
                                        size="small"
                                        variant="outlined"
                                        sx={{minWidth: 120}}
                                      />
                                      <Chip
                                        icon={<RoomIcon />}
                                        label={schedule.room}
                                        size="small"
                                        variant="outlined"
                                        sx={{minWidth: 80}}
                                      />
                                    </Box>
                                  ))}
                                </Stack>
                              )}
                            </Box>
                          }
                          secondaryTypographyProps={{ component: "div" }}
                        />
                      </ListItemButton>
                    </ListItem>
                  </Paper>
                );
              })}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseClassDialog}
            disabled={classDialog.loading}
          >
            Close
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
