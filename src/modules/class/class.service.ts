import { ClassRepository } from './class.repo';
import { CourseRepository } from '../course/course.repo';
import {
  ClassDto,
  CreateClassDto,
  UpdateClassDto,
  ClassStudentDto,
  PaginationQuery,
} from './class.dto';
import { NotFoundError, ConflictError } from '../../common/errors';

export class ClassService {
  private repo: ClassRepository;
  private courseRepo: CourseRepository;

  constructor() {
    this.repo = new ClassRepository();
    this.courseRepo = new CourseRepository();
  }

  private toClassDto(classData: any): ClassDto {
    return {
      classId: classData.classId,
      className: classData.className,
      courseId: classData.courseId,
      courseCode: classData.courseCode,
      courseName: classData.courseName,
      credits: classData.credits,
      teacherId: classData.teacherId,
      teacherName: classData.teacherName,
      totalSchedules: classData.totalSchedules,
      totalStudents: classData.totalStudents,
      createdAt: classData.createdAt.toISOString(),
    };
  }

  private toStudentDto(student: any): ClassStudentDto {
    return {
      studentId: student.studentId,
      studentCode: student.studentCode,
      fullName: student.fullName,
      email: student.email,
      enrollmentStatus: student.enrollmentStatus,
      enrolledAt: student.enrolledAt.toISOString(),
      finalScore: student.finalScore,
    };
  }

  async createClass(createDto: CreateClassDto): Promise<ClassDto> {
    // 1. Check course exists
    const course = await this.courseRepo.findById(createDto.courseId);
    if (!course) {
      throw new NotFoundError('Course');
    }

    // 2. Check class name unique for this course
    if (await this.repo.existsByClassNameAndCourse(createDto.className, createDto.courseId)) {
      throw new ConflictError('Class name already exists for this course');
    }

    // 3. Create class
    const classData = await this.repo.create(createDto);

    // 4. Get full class info
    const fullClass = await this.repo.findById(classData.classId);

    return this.toClassDto(fullClass);
  }

  async getAllClasses(
    query: PaginationQuery
  ): Promise<{
    classes: ClassDto[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
  }> {
    const { classes, total } = await this.repo.findAll(query);
    const page = query.page || 1;
    const size = query.size || 10;

    return {
      classes: classes.map((c) => this.toClassDto(c)),
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  async getClassById(classId: number): Promise<ClassDto> {
    const classData = await this.repo.findById(classId);

    if (!classData) {
      throw new NotFoundError('Class');
    }

    return this.toClassDto(classData);
  }

  async updateClass(classId: number, updateDto: UpdateClassDto): Promise<ClassDto> {
    // 1. Check class exists
    const existing = await this.repo.findById(classId);
    if (!existing) {
      throw new NotFoundError('Class');
    }

    // 2. Check class name unique for this course
    if (await this.repo.existsByClassNameAndCourse(updateDto.className!, existing.courseId, classId)) {
      throw new ConflictError('Class name already exists for this course');
    }

    // 3. Update class
    const updated = await this.repo.update(classId, updateDto);

    return this.toClassDto(updated);
  }

  async deleteClass(classId: number): Promise<void> {
    const deleted = await this.repo.delete(classId);

    if (!deleted) {
      throw new NotFoundError('Class');
    }
  }

  async getClassStudents(classId: number): Promise<ClassStudentDto[]> {
    // Check class exists
    const classData = await this.repo.findById(classId);
    if (!classData) {
      throw new NotFoundError('Class');
    }

    const students = await this.repo.getStudents(classId);

    return students.map((s) => this.toStudentDto(s));
  }
}