import { Router } from 'express';
import { AuthController } from '../modules/auth/auth.controller';
import { CourseController } from '../modules/course/course.controller';
import { StudentController } from '../modules/student/student.controller';
import { AdminController } from '../modules/admin/admin.controller';
import { UserController } from '../modules/user/user.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

const authController = new AuthController();
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

const courseController = new CourseController();
router.get('/courses', requireAuth, courseController.getAllCourses);
router.get('/courses/:id', requireAuth, courseController.getCourseById);
router.post('/courses', requireAuth, courseController.createCourse);
router.put('/courses/:id', requireAuth, courseController.updateCourse);
router.delete('/courses/:id', requireAuth, requireRole(['ADMIN']), courseController.deleteCourse);

const studentController = new StudentController();
router.get('/students', requireAuth, studentController.getAllStudents);
router.get('/students/:id', requireAuth, studentController.getStudentById);
router.post('/students', requireAuth, studentController.createStudent);
router.put('/students/:id', requireAuth, studentController.updateStudent);
router.delete('/students/:id', requireAuth, requireRole(['ADMIN']), studentController.deleteStudent);


const adminController = new AdminController();
router.get('/admin/stats', requireAuth, requireRole(['ADMIN']), adminController.getStats);

const userController = new UserController();
router.get('/users/me', requireAuth, userController.getMe);

export default router;