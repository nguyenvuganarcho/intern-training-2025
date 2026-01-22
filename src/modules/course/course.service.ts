import { CourseRepository } from './course.repo';
import { TeacherRepository } from '../teacher/teacher.repo';
import {
  CourseDto,
  CreateCourseDto,
  UpdateCourseDto,
  CourseClassDto,
  PaginationQuery,
} from './course.dto';
import { NotFoundError, ConflictError } from '../../common/errors';

export class CourseService {
  private repo: CourseRepository;
  private teacherRepo: TeacherRepository;

  constructor() {
    this.repo = new CourseRepository();
    this.teacherRepo = new TeacherRepository();
  }

  private toCourseDto(course: any): CourseDto {
    return {
      courseId: course.courseId,
      courseCode: course.courseCode,
      courseName: course.courseName,
      credits: course.credits,
      teacherId: course.teacherId,
      teacherName: course.teacherName,
      teacherCode: course.teacherCode,
      totalStudents: course.totalStudents,
      createdAt: course.createdAt.toISOString(),
    };
  }

  private toClassDto(classData: any): CourseClassDto {
    return {
      classId: classData.classId,
      className: classData.className,
      totalSchedules: classData.totalSchedules,
      createdAt: classData.createdAt.toISOString(),
    };
  }

  async createCourse(createDto: CreateCourseDto): Promise<CourseDto> {
    // 1. Check course code unique
    if (await this.repo.existsByCourseCode(createDto.courseCode)) {
      throw new ConflictError('Course code already exists');
    }

    // 2. Check teacher exists
    const teacher = await this.teacherRepo.findById(createDto.teacherId);
    if (!teacher) {
      throw new NotFoundError('Teacher');
    }

    // 3. Create course
    const course = await this.repo.create(createDto);

    // 4. Get full course info
    const fullCourse = await this.repo.findById(course.courseId);

    return this.toCourseDto(fullCourse);
  }

  async getAllCourses(
    query: PaginationQuery
  ): Promise<{
    courses: CourseDto[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
  }> {
    const { courses, total } = await this.repo.findAll(query);
    const page = query.page || 1;
    const size = query.size || 10;

    return {
      courses: courses.map((c) => this.toCourseDto(c)),
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  async getCourseById(courseId: number): Promise<CourseDto> {
    const course = await this.repo.findById(courseId);

    if (!course) {
      throw new NotFoundError('Course');
    }

    return this.toCourseDto(course);
  }

  async updateCourse(courseId: number, updateDto: UpdateCourseDto): Promise<CourseDto> {
    // 1. Check course exists
    const existing = await this.repo.findById(courseId);
    if (!existing) {
      throw new NotFoundError('Course');
    }

    // 2. Check teacher exists if updating
    if (updateDto.teacherId) {
      const teacher = await this.teacherRepo.findById(updateDto.teacherId);
      if (!teacher) {
        throw new NotFoundError('Teacher');
      }
    }

    // 3. Update course
    const updated = await this.repo.update(courseId, updateDto);

    return this.toCourseDto(updated);
  }

  async deleteCourse(courseId: number): Promise<void> {
    const deleted = await this.repo.delete(courseId);

    if (!deleted) {
      throw new NotFoundError('Course');
    }
  }

  async getAvailableCourses(studentId?: number): Promise<CourseDto[]> {
    const courses = await this.repo.findAvailable(studentId);

    return courses.map((c) => this.toCourseDto(c));
  }

  async getCourseClasses(courseId: number): Promise<CourseClassDto[]> {
    // Check course exists
    const course = await this.repo.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course');
    }

    const classes = await this.repo.getClasses(courseId);

    return classes.map((c) => this.toClassDto(c));
  }
}