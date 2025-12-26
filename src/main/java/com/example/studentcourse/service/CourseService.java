package com.example.studentcourse.service;

import com.example.studentcourse.dto.CourseDTO;
import com.example.studentcourse.dto.StudentDTO;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Map;
import java.util.HashMap;


public interface CourseService {

    // CRUD
    CourseDTO createCourse(CourseDTO dto);
    CourseDTO getCourseById(Long id);
    Page<CourseDTO> getAllCourses(int page, int size, String sortBy, String direction);
    CourseDTO updateCourse(Long id, CourseDTO dto);
    void deleteCourse(Long id);

    // Search
    Page<CourseDTO> searchByName(String courseName, int page, int size);

    // Advanced
    List<Map<String, Object>> getPopularCourses(int limit);
    List<StudentDTO> getCourseStudents(Long courseId);
}