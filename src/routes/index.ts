import { Router } from 'express';
import { CourseController } from '../modules/course/course.controller';

const router = Router();
const courseController = new CourseController();

router.post('/courses', courseController.createCourse);
router.get('/courses', courseController.getAllCourses);
router.get('/courses/:id', courseController.getCourseById);
router.put('/courses/:id', courseController.updateCourse);
router.delete('/courses/:id', courseController.deleteCourse);

export default router;