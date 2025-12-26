package com.example.studentcourse.exception;

public class StudentNotFoundException extends BaseException {
    public StudentNotFoundException(Long id) {
        super(ErrorCode.STUDENT_NOT_FOUND, "Can not find student with id: " + id);
    }

    public StudentNotFoundException(String message) {
        super(ErrorCode.STUDENT_NOT_FOUND, message);
    }
}
