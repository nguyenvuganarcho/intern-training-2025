package com.example.studentcourse.exception;

public class EnrollmentAlreadyExistsException extends BaseException {
    public EnrollmentAlreadyExistsException(String message) {
        super(ErrorCode.ENROLLMENT_ALREADY_EXISTS, message);
    }

    public EnrollmentAlreadyExistsException(Long studentId, Long courseId) {
        super(ErrorCode.ENROLLMENT_ALREADY_EXISTS, "Student already enroll this course");
    }
}
