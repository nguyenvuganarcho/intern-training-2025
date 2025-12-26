package com.example.studentcourse.controller;

import com.example.studentcourse.dto.CourseDTO;
import com.example.studentcourse.dto.StudentDTO;
import com.example.studentcourse.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/course")
@CrossOrigin(origins = "*")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @PostMapping
    public ResponseEntity<CourseDTO> createCourse(@Valid @RequestBody CourseDTO dto) {
        CourseDTO created = courseService.createCourse(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // GET /api/courses/{id} - Lấy course theo ID
    @GetMapping("/{id}")
    public ResponseEntity<CourseDTO> getCourseById(@PathVariable Long id) {
        CourseDTO course = courseService.getCourseById(id);
        return ResponseEntity.ok(course);
    }

    // GET /api/courses - Lấy tất cả courses (pagination + sort)
    @GetMapping
    public ResponseEntity<Page<CourseDTO>> getAllCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "courseName") String sortBy,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        Page<CourseDTO> courses = courseService.getAllCourses(page, size, sortBy, direction);
        return ResponseEntity.ok(courses);
    }

    // PUT /api/courses/{id} - Update course
    @PutMapping("/{id}")
    public ResponseEntity<CourseDTO> updateCourse(
            @PathVariable Long id,
            @Valid @RequestBody CourseDTO dto
    ) {
        CourseDTO updated = courseService.updateCourse(id, dto);
        return ResponseEntity.ok(updated);
    }

    // DELETE /api/courses/{id} - Xóa course
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok("Delete course success");
    }


    @GetMapping("/search")
    public ResponseEntity<Page<CourseDTO>> searchByName(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<CourseDTO> courses = courseService.searchByName(name, page, size);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/popular")
    public ResponseEntity<List<Map<String, Object>>> getPopularCourses(
            @RequestParam(defaultValue = "5") int limit
    ) {
        List<Map<String, Object>> courses = courseService.getPopularCourses(limit);
        return ResponseEntity.ok(courses);
    }

    // GET /api/courses/{id}/students - Lấy students của course
    @GetMapping("/{id}/student")
    public ResponseEntity<List<StudentDTO>> getCourseStudents(@PathVariable Long id) {
        List<StudentDTO> students = courseService.getCourseStudents(id);
        return ResponseEntity.ok(students);
    }
}
