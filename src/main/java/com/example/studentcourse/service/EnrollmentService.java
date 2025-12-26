package com.example.studentcourse.service;

public interface EnrollmentService {

    void enrollCourse(Long studentId, Long courseId);
    void unenrollCourse(Long studentId, Long courseId);
}