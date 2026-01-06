import { Enrollment } from "./enrollment.dto";

export class EnrollmentRepository {
  private enrollments: Enrollment[] = [];
  private currentId = 1;

  create(studentId: number, courseId: number): Enrollment {
    const now = new Date();
    const enrollment: Enrollment = {
      id: this.currentId++,
      studentId,
      courseId,
      enrolledAt: now,
    };

    this.enrollments.push(enrollment);
    return enrollment;
  }
  existsByStudentAndCourse(studentId: number, courseId: number): boolean {
    return this.enrollments.some(
      (e) => e.studentId === studentId && e.courseId === courseId
    );
  }

  findByStudentId(studentId: number): Enrollment[] {
    return this.enrollments.filter((e) => e.studentId === studentId);
  }

  deleteByStudentAndCourse(studentId: number, courseId: number): boolean {
    const index = this.enrollments.findIndex(
      (e) => e.studentId === studentId && e.courseId === courseId
    );

    if (index === -1) return false;

    this.enrollments.splice(index, 1);
    return true;
  }

  findAll(): Enrollment[] {
    return this.enrollments;
  }
}
