package com.example.studentcourse.service;

import com.example.studentcourse.dto.StudentDTO;
import com.example.studentcourse.dto.CourseDTO;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Objects;
import java.util.HashMap;
import java.util.Map;

public interface StudentService {

    // CRUD
    StudentDTO createStudent(StudentDTO dto);
    StudentDTO getStudentById(Long id);
    Page<StudentDTO> getAllStudents(int page, int size, String sortBy, String direction);
    StudentDTO updateStudent(Long id, StudentDTO dto);
    void deleteStudent(Long id);

    // Search
    Page<StudentDTO> searchByName(String name, int page, int size);

    // Filter
    List<StudentDTO> getStudentsByAgeRange(Integer ageFrom, Integer ageTo);
    List<StudentDTO> getStudentsByEmailDomain(String domain);

    // Enrollment
    List<CourseDTO> getStudentCourses(Long studentId);

    // Advance
    List<Map<String, Object>> getTopStudents(int limit);
}