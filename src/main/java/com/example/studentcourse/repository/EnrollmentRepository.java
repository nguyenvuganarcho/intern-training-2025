package com.example.studentcourse.repository;

import com.example.studentcourse.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    // Check enrollment exists
    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);

    // Delete enrollment
    void deleteByStudentIdAndCourseId(Long studentId, Long courseId);

    // Get all courses of a student
    @Query("SELECT e FROM Enrollment e WHERE e.studentId = :studentId")
    List<Enrollment> findByStudentId(@Param("studentId") Long studentId);

    // Get all students of a course
    @Query("SELECT e FROM Enrollment e WHERE e.courseId = :courseId")
    List<Enrollment> findByCourseId(@Param("courseId") Long courseId);

    // Count enrollments by student
    @Query("SELECT e.studentId, COUNT(e) FROM Enrollment e GROUP BY e.studentId ORDER BY COUNT(e) DESC")
    List<Object[]> countEnrollmentsByStudent();

    // Count enrollments by course
    @Query("SELECT e.courseId, COUNT(e) FROM Enrollment e GROUP BY e.courseId ORDER BY COUNT(e) DESC")
    List<Object[]> countEnrollmentsByCourse();
}