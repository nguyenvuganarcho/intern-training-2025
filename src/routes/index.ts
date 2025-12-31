import { Router } from 'express';
import { AuthController } from '../modules/auth/auth.controller';
import { CourseController } from '../modules/course/course.controller';
import { StudentController } from '../modules/student/student.controller';
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
router.post('/students', requireAuth, studentController.createStudent);

export default router;