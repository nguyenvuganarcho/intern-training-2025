package com.example.studentcourse.exception;

public class CourseNotFoundException extends BaseException {
    public CourseNotFoundException(Long id) {
        super(ErrorCode.COURSE_NOT_FOUND, "Can not find course with id: " + id);
    }

    public CourseNotFoundException(String message) {
        super(ErrorCode.STUDENT_NOT_FOUND, message);
    }
}
