export interface GradeDto {
  gradeId: number;
  enrollId: number;
  studentId: number;
  studentCode: string;
  studentName: string;
  courseId: number;
  courseCode: string;
  courseName: string;
  credits: number;
  teacherId: number;
  teacherName: string;
  finalScore: number;
  gradedAt: string;
  gradedBy: number;
  gradedByName: string;
}

export interface CreateGradeDto {
  enrollId: number;
  finalScore: number;
}

export interface UpdateGradeDto {
  finalScore: number;
}

export interface BulkCreateGradeDto {
  grades: Array<{
    enrollId: number;
    finalScore: number;
  }>;
}