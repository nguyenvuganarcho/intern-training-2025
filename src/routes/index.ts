import { Router } from 'express';
import { AuthController } from '../modules/auth/auth.controller';
import { UserController } from '../modules/user/user.controller';
import { StudentController } from '../modules/student/student.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

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

export default router;