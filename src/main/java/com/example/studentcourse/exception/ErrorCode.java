package com.example.studentcourse.exception;

public enum ErrorCode {
    INVALID_INPUT("INVALID_INPUT", "Invalid input"),
    STUDENT_NOT_FOUND("STUDENT_NOT_FOUND", "Can not find student with id"),
    COURSE_NOT_FOUND("COURSE_NOT_FOUND", "Can not find course with id"),
    EMAIL_ALREADY_EXISTS("EMAIL_ALREADY_EXISTS", "Email exists"),
    ENROLLMENT_ALREADY_EXISTS("ENROLLMENT_ALREADY_EXITS", "Enrolment exists"),
    ENROLLMENT_NOT_FOUND("ENROLLMENT_NOT_FOUND", "Can not find the enrollment");

    private final String code;
    private final String message;

    ErrorCode(String code, String message) {
        this.code = code;
        this.message = message;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}