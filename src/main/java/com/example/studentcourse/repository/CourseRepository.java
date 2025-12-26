package com.example.studentcourse.repository;

import com.example.studentcourse.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    // Search by course name (pagination)
    Page<Course> findByCourseNameContainingIgnoreCase(String courseName, Pageable pageable);
}