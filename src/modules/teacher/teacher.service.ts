import { TeacherRepository } from './teacher.repo';
import {
  TeacherProfileDto,
  UpdateTeacherProfileDto,
  TeacherCourseDto,
  PaginationQuery,
} from './teacher.dto';
import { NotFoundError } from '../../common/errors';

export class TeacherService {
  private repo: TeacherRepository;

  constructor() {
    this.repo = new TeacherRepository();
  }

  private toProfileDto(teacher: any): TeacherProfileDto {
    return {
      teacherId: teacher.teacherId,
      userId: teacher.userId,
      teacherCode: teacher.teacherCode,
      fullName: teacher.fullName,
      dateOfBirth: teacher.dateOfBirth
        ? teacher.dateOfBirth.toISOString().split('T')[0]
        : undefined,
      phone: teacher.phone,
      address: teacher.address,
      email: teacher.email,
      status: teacher.status,
      createdAt: teacher.createdAt.toISOString(),
    };
  }

  private toCourseDto(course: any): TeacherCourseDto {
    return {
      courseId: course.courseId,
      courseCode: course.courseCode,
      courseName: course.courseName,
      credits: course.credits,
      totalStudents: course.totalStudents,
      createdAt: course.createdAt.toISOString(),
    };
  }

  async getAllTeachers(
    query: PaginationQuery
  ): Promise<{
    teachers: TeacherProfileDto[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
  }> {
    const { teachers, total } = await this.repo.findAll(query);
    const page = query.page || 1;
    const size = query.size || 10;

    return {
      teachers: teachers.map((t) => this.toProfileDto(t)),
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  async getTeacherById(teacherId: number): Promise<TeacherProfileDto> {
    const teacher = await this.repo.findById(teacherId);

    if (!teacher) {
      throw new NotFoundError('Teacher');
    }

    return this.toProfileDto(teacher);
  }

  async updateTeacher(
    teacherId: number,
    updateDto: UpdateTeacherProfileDto
  ): Promise<TeacherProfileDto> {
    const existing = await this.repo.findById(teacherId);

    if (!existing) {
      throw new NotFoundError('Teacher');
    }

    const updated = await this.repo.update(teacherId, updateDto);

    return this.toProfileDto(updated);
  }

  async deleteTeacher(teacherId: number): Promise<void> {
    const deleted = await this.repo.delete(teacherId);

    if (!deleted) {
      throw new NotFoundError('Teacher');
    }
  }

  async getTeacherCourses(teacherId: number): Promise<TeacherCourseDto[]> {
    const teacher = await this.repo.findById(teacherId);

    if (!teacher) {
      throw new NotFoundError('Teacher');
    }

    const courses = await this.repo.getCourses(teacherId);

    return courses.map((c) => this.toCourseDto(c));
  }
}