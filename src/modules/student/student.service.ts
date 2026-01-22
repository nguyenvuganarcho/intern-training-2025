import { StudentRepository } from './student.repo';
import {
  StudentProfileDto,
  UpdateStudentProfileDto,
  StudentGradeDto,
  StudentScheduleDto,
  PaginationQuery,
} from './student.dto';
import { NotFoundError } from '../../common/errors';

export class StudentService {
  private repo: StudentRepository;

  constructor() {
    this.repo = new StudentRepository();
  }

  private toProfileDto(student: any): StudentProfileDto {
    return {
      studentId: student.studentId,
      userId: student.userId,
      studentCode: student.studentCode,
      fullName: student.fullName,
      dateOfBirth: student.dateOfBirth
        ? student.dateOfBirth.toISOString().split('T')[0]
        : undefined,
      phone: student.phone,
      address: student.address,
      email: student.email,
      status: student.status,
      createdAt: student.createdAt.toISOString(),
      updatedAt: student.updatedAt.toISOString(),
    };
  }

  private toGradeDto(grade: any): StudentGradeDto {
    return {
      enrollId: grade.enrollId,
      courseId: grade.courseId,
      courseCode: grade.courseCode,
      courseName: grade.courseName,
      credits: grade.credits,
      finalScore: grade.finalScore,
      enrollmentStatus: grade.enrollmentStatus,
      enrolledAt: grade.enrolledAt.toISOString(),
      teacherName: grade.teacherName,
    };
  }

  private toScheduleDto(schedule: any): StudentScheduleDto {
    return {
      courseCode: schedule.courseCode,
      courseName: schedule.courseName,
      className: schedule.className,
      dayOfTheWeek: schedule.dayOfTheWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      room: schedule.room,
      teacherName: schedule.teacherName,
    };
  }

  async getAllStudents(
    query: PaginationQuery
  ): Promise<{
    students: StudentProfileDto[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
  }> {
    const { students, total } = await this.repo.findAll(query);
    const page = query.page || 1;
    const size = query.size || 10;

    return {
      students: students.map((s) => this.toProfileDto(s)),
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  async getStudentById(studentId: number): Promise<StudentProfileDto> {
    const student = await this.repo.findById(studentId);

    if (!student) {
      throw new NotFoundError('Student');
    }

    return this.toProfileDto(student);
  }

  async updateStudent(
    studentId: number,
    updateDto: UpdateStudentProfileDto
  ): Promise<StudentProfileDto> {
    const existing = await this.repo.findById(studentId);

    if (!existing) {
      throw new NotFoundError('Student');
    }

    const updated = await this.repo.update(studentId, updateDto);

    return this.toProfileDto(updated);
  }

  async deleteStudent(studentId: number): Promise<void> {
    const deleted = await this.repo.delete(studentId);

    if (!deleted) {
      throw new NotFoundError('Student');
    }
  }

  async getStudentGrades(studentId: number): Promise<StudentGradeDto[]> {
    const student = await this.repo.findById(studentId);

    if (!student) {
      throw new NotFoundError('Student');
    }

    const grades = await this.repo.getGrades(studentId);

    return grades.map((g) => this.toGradeDto(g));
  }

  async getStudentSchedule(studentId: number): Promise<StudentScheduleDto[]> {
    const student = await this.repo.findById(studentId);

    if (!student) {
      throw new NotFoundError('Student');
    }

    const schedules = await this.repo.getSchedule(studentId);

    return schedules.map((s) => this.toScheduleDto(s));
  }
}