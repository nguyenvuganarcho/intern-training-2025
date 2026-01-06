export interface Enrollment {
    id: number;
    courseId: number;
    studentId: number;
    enrolledAt: Date;
}

export interface EnrollmentResponseDto {
    id: number;
    courseId: number;
    studentId: number;
    courseName: string;
    enrolledAt: string;
}

export interface StudentEnrollmentsResponseDto {
    studentId: number;
    studentName: string;
    enrollments: EnrollmentResponseDto[];
    totalEnrollments: number;
}