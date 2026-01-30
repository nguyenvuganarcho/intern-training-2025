import { EnrollmentRepository } from "./enrollment.repo";
import { StudentRepository } from "../student/student.repo";
import { CourseRepository } from "../course/course.repo";
import { ClassRepository } from "../class/class.repo";
import { ScheduleRepository } from "../schedule/schedule.repo";
import {
  EnrollmentDto,
  CreateEnrollmentDto,
  PaginationQuery,
} from "./enrollment.dto";
import {
  NotFoundError,
  ConflictError,
  ForbiddenError,
} from "../../common/errors";

export class EnrollmentService {
  private repo: EnrollmentRepository;
  private studentRepo: StudentRepository;
  private courseRepo: CourseRepository;
  private classRepo: ClassRepository;      
  private scheduleRepo: ScheduleRepository;

  constructor() {
    this.repo = new EnrollmentRepository();
    this.studentRepo = new StudentRepository();
    this.courseRepo = new CourseRepository();
    this.classRepo = new ClassRepository();       
    this.scheduleRepo = new ScheduleRepository();
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
      classId: enrollment.classId || null,
      className: enrollment.className || null,
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
  const student = await this.studentRepo.findById(createDto.studentId);
  if (!student) {
    throw new NotFoundError('Student');
  }

  if (currentUserRole !== 'admin' && student.userId !== currentUserId) {
    throw new ForbiddenError('You can only enroll yourself');
  }

  const course = await this.courseRepo.findById(createDto.courseId);
  if (!course) {
    throw new NotFoundError('Course');
  }

  if (await this.repo.existsByStudentAndCourse(createDto.studentId, createDto.courseId)) {
    throw new ConflictError('Student is already enrolled in this course');
  }


  const existingEnrollment = await this.repo.findByStudentAndCourse(
    createDto.studentId, 
    createDto.courseId
  );

  let enrollment;
  if (existingEnrollment) {
    console.log('Reactivating existing enrollment:', existingEnrollment.enrollId);
    enrollment = await this.repo.reactivate(existingEnrollment.enrollId);
  } else {
    console.log('Creating new enrollment');
    enrollment = await this.repo.create(createDto);
  }

  const fullEnrollment = await this.repo.findById(enrollment.enrollId);
  return this.toEnrollmentDto(fullEnrollment);
}

  async getAllEnrollments(query: PaginationQuery): Promise<{
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
    currentUserRole?: string,
  ): Promise<void> {
    // 1. Check enrollment exists
    const enrollment = await this.repo.findById(enrollId);
    if (!enrollment) {
      throw new NotFoundError("Enrollment");
    }

    // 2. Check if already dropped
    if (enrollment.status === "dropped") {
      throw new ConflictError("Enrollment is already dropped");
    }

    // 3. Get student info
    const student = await this.studentRepo.findById(enrollment.studentId);
    if (!student) {
      throw new NotFoundError("Student");
    }

    // 4. Authorization: Only admin or the student themselves can drop
    if (currentUserRole !== "admin" && student.userId !== currentUserId) {
      throw new ForbiddenError("You can only drop your own enrollment");
    }

    // 5. Drop enrollment (soft delete)
    const deleted = await this.repo.delete(enrollId);

    if (!deleted) {
      throw new NotFoundError("Enrollment");
    }
  }

  async selectClass(
    enrollId: number,
    classId: number,
    currentUserId?: number,
    currentUserRole?: string
  ): Promise<EnrollmentDto> {
    // 1. Get enrollment
    const enrollment = await this.repo.findById(enrollId);
    if (!enrollment) {
      throw new NotFoundError('Enrollment');
    }

    // 2. Authorization check
    if (currentUserRole !== 'admin') {
      const student = await this.studentRepo.findById(enrollment.studentId);
      if (student.userId !== currentUserId) {
        throw new ForbiddenError('You can only select class for your own enrollment');
      }
    }

    // 3. Check class exists and belongs to same course
    const classData = await this.classRepo.findById(classId);
    if (!classData) {
      throw new NotFoundError('Class');
    }

    if (classData.courseId !== enrollment.courseId) {
      throw new ConflictError('Class does not belong to the enrolled course');
    }

    const newClassSchedules = await this.scheduleRepo.findAll({ classId, size: 100 });
    
    if (newClassSchedules.schedules.length > 0) {
      // Get student's current enrollments with classes
      const currentEnrollments = await this.repo.findAll({
        studentId: enrollment.studentId,
        status: 'enrolled',
        size: 100,
      });

      // Get class IDs (excluding current enrollment)
      const enrolledClassIds = currentEnrollments.enrollments
        .filter((e: any) => e.classId && e.enrollId !== enrollId)
        .map((e: any) => e.classId);

      if (enrolledClassIds.length > 0) {
        // Get schedules for all enrolled classes
        const allSchedules = await this.scheduleRepo.findAll({ size: 1000 });
        const studentSchedules = allSchedules.schedules.filter((s: any) => 
          enrolledClassIds.includes(s.classId)
        );

        // Check for time conflicts
        for (const newSchedule of newClassSchedules.schedules) {
          for (const existingSchedule of studentSchedules) {
            if (newSchedule.dayOfTheWeek === existingSchedule.dayOfTheWeek) {
              const newStart = newSchedule.startTime;
              const newEnd = newSchedule.endTime;
              const existingStart = existingSchedule.startTime;
              const existingEnd = existingSchedule.endTime;

              if (newStart < existingEnd && newEnd > existingStart) {
                throw new ConflictError(
                  `Schedule conflict: ${newSchedule.courseCode} ${newSchedule.dayOfTheWeek} ${newStart}-${newEnd} conflicts with ${existingSchedule.courseCode} (${existingStart}-${existingEnd})`
                );
              }
            }
          }
        }
      }
    }

    // 5. Update enrollment with classId
    const updated = await this.repo.updateClass(enrollId, classId);
    
    return this.toEnrollmentDto(updated);
  }
}

