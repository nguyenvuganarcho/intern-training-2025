package com.example.studentcourse.service;

import com.example.studentcourse.entity.Enrollment;
import com.example.studentcourse.entity.Course;
import com.example.studentcourse.entity.Student;
import com.example.studentcourse.exception.*;
import com.example.studentcourse.repository.CourseRepository;
import com.example.studentcourse.repository.EnrollmentRepository;
import com.example.studentcourse.repository.StudentRepository;
import com.example.studentcourse.service.EnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EnrollmentServiceImpl implements EnrollmentService {
    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Override
    public void enrollCourse(Long studentId, Long courseId) {
        if (!studentRepository.existsById(studentId)) {
            throw new StudentNotFoundException(studentId);
        }

        if (!courseRepository.existsById(studentId)) {
            throw new CourseNotFoundException(studentId);
        }

        if (enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
            throw new EnrollmentAlreadyExistsException(studentId, courseId);
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setStudentId(studentId);
        enrollment.setCourseId(courseId);

        enrollmentRepository.save(enrollment);
    }

    @Override
    @Transactional
    public void unenrollCourse(Long studentId, Long courseId) {
        if (!enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
            throw new EnrollmentNotFoundException(studentId, courseId);
        }

        enrollmentRepository.deleteByStudentIdAndCourseId(studentId, courseId);
    }
}
