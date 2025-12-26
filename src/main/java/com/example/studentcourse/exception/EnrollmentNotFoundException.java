package com.example.studentcourse.exception;

public class EnrollmentNotFoundException extends BaseException {
    public EnrollmentNotFoundException(String message) {
        super(ErrorCode.ENROLLMENT_NOT_FOUND, message);
    }

    public EnrollmentNotFoundException(Long studentId, Long courseId) {
        super(ErrorCode.ENROLLMENT_NOT_FOUND, "Can not find the enrollment");
    }
}
