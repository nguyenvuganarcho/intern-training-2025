package com.example.studentcourse.controller;

import com.example.studentcourse.dto.CourseDTO;
import com.example.studentcourse.dto.StudentDTO;
import com.example.studentcourse.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @PostMapping
    public ResponseEntity<StudentDTO> createStudent(@Valid @RequestBody StudentDTO dto) {
        StudentDTO created = studentService.createStudent(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // GET /api/students/{id} - Lấy student theo ID
    @GetMapping("/{id}")
    public ResponseEntity<StudentDTO> getStudentById(@PathVariable Long id) {
        StudentDTO student = studentService.getStudentById(id);
        return ResponseEntity.ok(student);
    }

    @GetMapping
    public ResponseEntity<Page<StudentDTO>> getAllStudents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        Page<StudentDTO> students = studentService.getAllStudents(page, size, sortBy, direction);
        return ResponseEntity.ok(students);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentDTO> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody StudentDTO dto
    ) {
        StudentDTO updated = studentService.updateStudent(id, dto);
        return ResponseEntity.ok(updated);
    }

    // DELETE /api/students/{id} - Xóa student
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok("Xóa student thành công!");
    }

    // GET /api/students/search?name=xxx
    @GetMapping("/search")
    public ResponseEntity<Page<StudentDTO>> searchByName(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<StudentDTO> students = studentService.searchByName(name, page, size);
        return ResponseEntity.ok(students);
    }

    @GetMapping("/filter/age")
    public ResponseEntity<List<StudentDTO>> filterByAge(
            @RequestParam Integer ageFrom,
            @RequestParam Integer ageTo
    ) {
        List<StudentDTO> students = studentService.getStudentsByAgeRange(ageFrom, ageTo);
        return ResponseEntity.ok(students);
    }

    @GetMapping("/filter/domain")
    public ResponseEntity<List<StudentDTO>> filterByEmailDomain(
            @RequestParam String email
    ) {
        List<StudentDTO> students = studentService.getStudentsByEmailDomain(email);
        return ResponseEntity.ok(students);
    }

    @GetMapping("/{id}/course")
    public ResponseEntity<List<CourseDTO>> getStudentCourses(@PathVariable Long id) {
        List<CourseDTO> courses = studentService.getStudentCourses(id);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/top")
    public ResponseEntity<List<Map<String, Object>>> getTopStudents(
            @RequestParam(defaultValue = "5") int limit
    ) {
        List<Map<String, Object>> students = studentService.getTopStudents(limit);
        return ResponseEntity.ok(students);
    }
}