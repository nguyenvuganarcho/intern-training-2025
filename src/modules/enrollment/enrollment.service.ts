import { EnrollmentRepository } from './enrollment.repo';
import { StudentRepository } from '../student/student.repo';
import { CourseRepository } from '../course/course.repo';
import {
  EnrollmentDto,
  CreateEnrollmentDto,
  PaginationQuery,
} from './enrollment.dto';
import { NotFoundError, ConflictError, ForbiddenError } from '../../common/errors';

export class EnrollmentService {
  private repo: EnrollmentRepository;
  private studentRepo: StudentRepository;
  private courseRepo: CourseRepository;

  constructor() {
    this.repo = new EnrollmentRepository();
    this.studentRepo = new StudentRepository();
    this.courseRepo = new CourseRepository();
  }

  private toEnrollmentDto(enrollment: any): EnrollmentDto {
    return {
      enrollId: enrollment.enrollId,
      studentId: enrollment.studentId,
      studentCode: enrollment.studentCode,
      studentName: enrollment.studentName,
      courseId: enrollment.courseId,
      courseCode: enrollment.courseCode,
      courseName: enrollment.courseName,
      credits: enrollment.credits,
      teacherId: enrollment.teacherId,
      teacherName: enrollment.teacherName,
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt.toISOString(),
      finalScore: enrollment.finalScore,
    };
  }

  async createEnrollment(
    createDto: CreateEnrollmentDto,
    currentUserId?: number,
    currentUserRole?: string
  ): Promise<EnrollmentDto> {
    // 1. Check student exists
    const student = await this.studentRepo.findById(createDto.studentId);
    if (!student) {
      throw new NotFoundError('Student');
    }

    // 2. Check course exists
    const course = await this.courseRepo.findById(createDto.courseId);
    if (!course) {
      throw new NotFoundError('Course');
    }

    // 3. Authorization: Only admin or the student themselves can enroll
    if (currentUserRole !== 'admin' && student.userId !== currentUserId) {
      throw new ForbiddenError('You can only enroll yourself');
    }

    // 4. Check if already enrolled
    if (await this.repo.existsByStudentAndCourse(createDto.studentId, createDto.courseId)) {
      throw new ConflictError('Student is already enrolled in this course');
    }

    // 5. Create enrollment
    const enrollment = await this.repo.create(createDto);

    // 6. Get full enrollment info
    const fullEnrollment = await this.repo.findById(enrollment.enrollId);

    return this.toEnrollmentDto(fullEnrollment);
  }

  async getAllEnrollments(
    query: PaginationQuery
  ): Promise<{
    enrollments: EnrollmentDto[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
  }> {
    const { enrollments, total } = await this.repo.findAll(query);
    const page = query.page || 1;
    const size = query.size || 10;

    return {
      enrollments: enrollments.map((e) => this.toEnrollmentDto(e)),
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  async deleteEnrollment(
    enrollId: number,
    currentUserId?: number,
    currentUserRole?: string
  ): Promise<void> {
    // 1. Check enrollment exists
    const enrollment = await this.repo.findById(enrollId);
    if (!enrollment) {
      throw new NotFoundError('Enrollment');
    }

    // 2. Check if already dropped
    if (enrollment.status === 'dropped') {
      throw new ConflictError('Enrollment is already dropped');
    }

    // 3. Get student info
    const student = await this.studentRepo.findById(enrollment.studentId);
    if (!student) {
      throw new NotFoundError('Student');
    }

    // 4. Authorization: Only admin or the student themselves can drop
    if (currentUserRole !== 'admin' && student.userId !== currentUserId) {
      throw new ForbiddenError('You can only drop your own enrollment');
    }

    // 5. Drop enrollment (soft delete)
    const deleted = await this.repo.delete(enrollId);

    if (!deleted) {
      throw new NotFoundError('Enrollment');
    }
  }
}