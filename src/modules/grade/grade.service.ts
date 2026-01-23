import { GradeRepository } from './grade.repo';
import {
  CreateGradeDto,
  UpdateGradeDto,
  BulkCreateGradeDto,
  GradeDto,
} from './grade.dto';
import { NotFoundError, ConflictError, ForbiddenError } from '../../common/errors';

export class GradeService {
  private repo: GradeRepository;

  constructor() {
    this.repo = new GradeRepository();
  }

  private toDto(grade: any): GradeDto {
    return {
      gradeId: grade.gradeId,
      enrollId: grade.enrollId,
      studentId: grade.studentId,
      studentCode: grade.studentCode,
      studentName: grade.studentName,
      courseId: grade.courseId,
      courseCode: grade.courseCode,
      courseName: grade.courseName,
      credits: grade.credits,
      teacherId: grade.teacherId,
      teacherName: grade.teacherName,
      finalScore: parseFloat(grade.finalScore),
      gradedAt: grade.gradedAt.toISOString(),
      gradedBy: grade.gradedBy,
      gradedByName: grade.gradedByName,
    };
  }

  async createGrade(
    createDto: CreateGradeDto,
    userId: number,
    userRole: string
  ): Promise<GradeDto> {
    // Check if enrollment exists
    const enrollment = await this.repo.getEnrollment(createDto.enrollId);

    if (!enrollment) {
      throw new NotFoundError('Enrollment');
    }

    // Check if enrollment is active
    if (enrollment.status !== 'enrolled') {
      throw new ConflictError('Cannot grade a dropped enrollment');
    }

    // Check if grade already exists
    const exists = await this.repo.existsByEnrollId(createDto.enrollId);

    if (exists) {
      throw new ConflictError('Grade already exists for this enrollment');
    }

    // Authorization: Only teacher of the course or admin can grade
    if (userRole !== 'admin') {
      // Get teacher ID from user
      const pool = await require('../../config/database').getPool();
      const teacherResult = await pool
        .request()
        .input('userId', require('mssql').Int, userId)
        .query('SELECT teacherId FROM teachers WHERE userId = @userId');

      if (teacherResult.recordset.length === 0) {
        throw new ForbiddenError('Only teachers can create grades');
      }

      const teacherId = teacherResult.recordset[0].teacherId;

      if (enrollment.teacherId !== teacherId) {
        throw new ForbiddenError('You can only grade students in your courses');
      }
    }

    const created = await this.repo.create(createDto, userId);
    const grade = await this.repo.findById(created.gradeId);

    return this.toDto(grade);
  }

  async bulkCreateGrades(
    bulkDto: BulkCreateGradeDto,
    userId: number,
    userRole: string
  ): Promise<GradeDto[]> {
    const results: GradeDto[] = [];
    const errors: any[] = [];

    for (const gradeDto of bulkDto.grades) {
      try {
        const grade = await this.createGrade(gradeDto, userId, userRole);
        results.push(grade);
      } catch (error: any) {
        errors.push({
          enrollId: gradeDto.enrollId,
          error: error.message,
        });
      }
    }

    if (errors.length > 0 && results.length === 0) {
      throw new Error(`Failed to create all grades: ${JSON.stringify(errors)}`);
    }

    return results;
  }

  async updateGrade(
    gradeId: number,
    updateDto: UpdateGradeDto,
    userId: number,
    userRole: string
  ): Promise<GradeDto> {
    const existing = await this.repo.findById(gradeId);

    if (!existing) {
      throw new NotFoundError('Grade');
    }

    // Authorization: Only teacher of the course or admin can update
    if (userRole !== 'admin') {
      const pool = await require('../../config/database').getPool();
      const teacherResult = await pool
        .request()
        .input('userId', require('mssql').Int, userId)
        .query('SELECT teacherId FROM teachers WHERE userId = @userId');

      if (teacherResult.recordset.length === 0) {
        throw new ForbiddenError('Only teachers can update grades');
      }

      const teacherId = teacherResult.recordset[0].teacherId;

      if (existing.teacherId !== teacherId) {
        throw new ForbiddenError('You can only update grades in your courses');
      }
    }

    await this.repo.update(gradeId, updateDto);
    const updated = await this.repo.findById(gradeId);

    return this.toDto(updated);
  }
}