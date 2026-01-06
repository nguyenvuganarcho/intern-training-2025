import { EnrollmentRepository } from './enrollment.repo';
import { EnrollmentResponseDto, StudentEnrollmentsResponseDto } from './enrollment.dto';
import { ConflictError, NotFoundError } from '../../common/errors';
import { StudentRepository } from '../student/student.repo';
import { CourseRepository } from '../course/course.repo';

export class EnrollmentService {
  private enrollmentRepo: EnrollmentRepository;
  private studentRepo: StudentRepository;
  private courseRepo: CourseRepository;

  constructor() {
    this.enrollmentRepo = new EnrollmentRepository();
    this.studentRepo = new StudentRepository();
    this.courseRepo = new CourseRepository();
  }

  async enrollStudent(studentId: number, courseId: number): Promise<EnrollmentResponseDto> {
    const student = this.studentRepo.findById(studentId);
    if (!student) {
      throw new NotFoundError('Student');
    }

    const course = this.courseRepo.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course');
    }

    if (this.enrollmentRepo.existsByStudentAndCourse(studentId, courseId)) {
      throw new ConflictError('Student already enrolled in this course');
    }

    // 4. Create enrollment
    const enrollment = this.enrollmentRepo.create(studentId, courseId);

    return {
      id: enrollment.id,
      studentId: enrollment.studentId,
      courseId: enrollment.courseId,
      courseName: course.name,
      enrolledAt: enrollment.enrolledAt.toISOString()  ,
    };
  }

  // Get all enrollments of a student
  async getStudentEnrollments(studentId: number): Promise<StudentEnrollmentsResponseDto> {
    // 1. Check student exists
    const student = this.studentRepo.findById(studentId);
    if (!student) {
      throw new NotFoundError('Student');
    }

    const enrollments = this.enrollmentRepo.findByStudentId(studentId);

    const enrollmentDtos = enrollments.map((e) => {
      const course = this.courseRepo.findById(e.courseId);
      return {
        id: e.id,
        studentId: e.studentId,
        courseId: e.courseId,
        courseName: course?.name || 'Unknown',
        enrolledAt: e.enrolledAt.toISOString(),
      };
    });

    return {
      studentId: student.id,
      studentName: student.name,
      enrollments: enrollmentDtos,
      totalEnrollments: enrollmentDtos.length,
    };
  }

  
  async unenrollStudent(studentId: number, courseId: number): Promise<void> {
    const student = this.studentRepo.findById(studentId);
    if (!student) {
      throw new NotFoundError('Student');
    }

    const course = this.courseRepo.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course');
    }

    if (!this.enrollmentRepo.existsByStudentAndCourse(studentId, courseId)) {
      throw new NotFoundError('Enrollment');
    }

    this.enrollmentRepo.deleteByStudentAndCourse(studentId, courseId);
  }
}