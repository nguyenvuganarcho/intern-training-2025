package com.company.project.StudentAPI.controller;

import com.company.project.StudentAPI.dto.PageResponseDTO;
import com.company.project.StudentAPI.dto.StudentCreateDTO;
import com.company.project.StudentAPI.dto.StudentUpdateDTO;
import com.company.project.StudentAPI.dto.StudentResponseDTO;
import com.company.project.StudentAPI.Entity.StudentEntity;
import com.company.project.StudentAPI.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentService studentService;

    private StudentResponseDTO convertToResponseDTO(StudentEntity entity) {
        return new StudentResponseDTO(
                entity.getId(),
                entity.getName(),
                entity.getEmail(),
                entity.getAge()
        );
    }

    @PostMapping
    public ResponseEntity<StudentResponseDTO> createStudent(
            @Valid @RequestBody StudentCreateDTO dto
    ) {
        StudentEntity created = studentService.createStudent(dto);
        StudentResponseDTO response = convertToResponseDTO(created);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // READ ALL - GET /api/students (Pagination + Sorting)
    @GetMapping
    public ResponseEntity<PageResponseDTO<StudentResponseDTO>> getAllStudents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        PageResponseDTO<StudentResponseDTO> response =
                studentService.getAllStudents(page, size, sort, direction);

        return ResponseEntity.ok(response);
    }

    // READ BY ID - GET /api/students/{id}
    @GetMapping("/{id}")
    public ResponseEntity<StudentResponseDTO> getStudentById(@PathVariable Long id) {
        StudentEntity entity = studentService.getStudentById(id);
        StudentResponseDTO response = convertToResponseDTO(entity);
        return ResponseEntity.ok(response);
    }

    // UPDATE - PUT /api/students/{id}
    @PutMapping("/{id}")
    public ResponseEntity<StudentResponseDTO> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody StudentUpdateDTO dto
    ) {
        StudentEntity updated = studentService.updateStudent(id, dto);
        StudentResponseDTO response = convertToResponseDTO(updated);
        return ResponseEntity.ok(response);
    }

    // DELETE - DELETE /api/students/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }

    // SEARCH - GET /api/students/search
    @GetMapping("/search")
    public ResponseEntity<PageResponseDTO<StudentResponseDTO>> searchStudents(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        PageResponseDTO<StudentResponseDTO> response =
                studentService.searchStudents(keyword, page, size, sort, direction);

        return ResponseEntity.ok(response);
    }
}