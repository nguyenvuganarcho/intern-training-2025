import { Router } from 'express';
import { AuthController } from '../modules/auth/auth.controller';
import { UserController } from '../modules/user/user.controller';
import { StudentController } from '../modules/student/student.controller';
import { CourseController } from '../modules/course/course.controller';
import { ClassController } from '../modules/class/class.controller';
import { ScheduleController } from '../modules/schedule/schedule.controller';
import { EnrollmentController } from '../modules/enrollment/enrollment.controller';
import { GradeController } from '../modules/grade/grade.controller';
import { NotificationController } from '../modules/notification/notification.controller';
import { NewsController } from '../modules/news/news.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { FeedbackController } from '../modules/feedback/feedback.controller';

const router = Router();

// Auth routes
const authController = new AuthController();
router.post('/auth/login', authController.login);
router.post('/auth/refresh-token', authController.refreshToken);
router.post('/auth/logout', authController.logout);
router.post('/auth/reset-password', authController.resetPassword);
router.post('/auth/confirm-reset-password', authController.confirmResetPassword);

// User routes (admin only)
const userController = new UserController();
router.get('/users', requireAuth, requireRole(['admin']), userController.getAllUsers);
router.get('/users/:id', requireAuth, requireRole(['admin']), userController.getUserById);
router.post('/users', requireAuth, requireRole(['admin']), userController.createUser);
router.put('/users/:id', requireAuth, requireRole(['admin']), userController.updateUser);
router.delete('/users/:id', requireAuth, requireRole(['admin']), userController.deleteUser);
router.put('/users/:id/password', requireAuth, requireRole(['admin']), userController.changePassword);

const studentController = new StudentController();
router.get('/students', requireAuth, requireRole(['admin', 'teacher']), studentController.getAllStudents);
router.get('/students/:id', requireAuth, studentController.getStudentById);
router.put('/students/:id', requireAuth, requireRole(['admin']), studentController.updateStudent);
router.delete('/students/:id', requireAuth, requireRole(['admin']), studentController.deleteStudent);
router.get('/students/:id/grades', requireAuth, studentController.getStudentGrades);

const courseController = new CourseController();
router.get('/courses/available', requireAuth, courseController.getAvailableCourses);
router.get('/courses', requireAuth, courseController.getAllCourses);
router.get('/courses/:id', requireAuth, courseController.getCourseById);
router.post('/courses', requireAuth, requireRole(['admin']), courseController.createCourse);
router.put('/courses/:id', requireAuth, requireRole(['admin']), courseController.updateCourse);
router.delete('/courses/:id', requireAuth, requireRole(['admin']), courseController.deleteCourse);
router.get('/courses/:id/classes', requireAuth, courseController.getCourseClasses);

const classController = new ClassController();
router.get('/classes', requireAuth, requireRole(['admin', 'teacher']), classController.getAllClasses);
router.get('/classes/:id', requireAuth, classController.getClassById);
router.post('/classes', requireAuth, requireRole(['admin']), classController.createClass);
router.put('/classes/:id', requireAuth, requireRole(['admin']), classController.updateClass);
router.delete('/classes/:id', requireAuth, requireRole(['admin']), classController.deleteClass);
router.get('/classes/:id/students', requireAuth, requireRole(['admin', 'teacher']), classController.getClassStudents);

const scheduleController = new ScheduleController();
router.post('/schedules/check-conflict', requireAuth, requireRole(['admin']), scheduleController.checkConflict); 
router.get('/schedules', requireAuth, requireRole(['admin', 'teacher']), scheduleController.getAllSchedules);
router.post('/schedules', requireAuth, requireRole(['admin']), scheduleController.createSchedule);
router.put('/schedules/:id', requireAuth, requireRole(['admin']), scheduleController.updateSchedule);
router.delete('/schedules/:id', requireAuth, requireRole(['admin']), scheduleController.deleteSchedule);

const enrollmentController = new EnrollmentController();
router.get('/enrollments', requireAuth, requireRole(['admin', 'teacher']), enrollmentController.getAllEnrollments);
router.post('/enrollments', requireAuth, enrollmentController.createEnrollment);
router.delete('/enrollments/:id', requireAuth, enrollmentController.deleteEnrollment);

const gradeController = new GradeController();
router.post('/grades', requireAuth, requireRole(['admin', 'teacher']), gradeController.createGrade);
router.put('/grades/:id', requireAuth, requireRole(['admin', 'teacher']), gradeController.updateGrade)
router.post('/grades/bulk', requireAuth, requireRole(['admin', 'teacher']), gradeController.bulkCreateGrades);

const notificationController = new NotificationController();
router.get('/notifications', requireAuth, notificationController.getAllNotifications);
router.post('/notifications', requireAuth, requireRole(['admin']), notificationController.createNotification);
router.put('/notifications/:id', requireAuth, notificationController.markAsRead);
router.put('/notifications/mark-all-read', requireAuth, notificationController.markAllAsRead);

const newsController = new NewsController();
router.get('/news', newsController.getAllNews);
router.get('/news/:id', newsController.getNewsById);
router.post('/news', requireAuth, requireRole(['admin']), newsController.createNews);
router.put('/news/:id', requireAuth, requireRole(['admin']), newsController.updateNews);
router.delete('/news/:id', requireAuth, requireRole(['admin']), newsController.deleteNews);

const feedbackController = new FeedbackController();
router.get('/feedback', requireAuth, feedbackController.getAllFeedbacks);
router.post('/feedback', requireAuth, feedbackController.createFeedback);
router.put('/feedback/:id', requireAuth, requireRole(['admin']), feedbackController.updateFeedback);
export default router;