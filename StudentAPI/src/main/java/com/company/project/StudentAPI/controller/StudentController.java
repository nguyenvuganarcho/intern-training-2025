package com.company.project.StudentAPI.controller;

import com.company.project.StudentAPI.Entity.StudentEntity;
import com.company.project.StudentAPI.service.StudentService;
import com.company.project.StudentAPI.dto.StudentCreateDTO;
import com.company.project.StudentAPI.dto.StudentUpdateDTO;
import com.company.project.StudentAPI.dto.StudentResponseDTO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/students")
public class StudentController {
    @Autowired
    private StudentService studentService;

    // helper method
    private StudentResponseDTO convertToResponseDTO(StudentEntity studentEntity) {
            return new StudentResponseDTO(
                    studentEntity.getId(),
                    studentEntity.getName(),
                    studentEntity.getEmail(),
                    studentEntity.getAge()
            );
    }

    @GetMapping
    public ResponseEntity<List<StudentResponseDTO>> getAllStudents() {
        List<StudentEntity> students = studentService.getAllStudents();

        List<StudentResponseDTO> response = students.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentResponseDTO> getStudentById(@PathVariable Long id) {
        StudentEntity studentEntity = studentService.getStudentById(id);

        StudentResponseDTO response = convertToResponseDTO(studentEntity);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<StudentResponseDTO> createStudent(@Valid @RequestBody StudentCreateDTO student) {
        StudentEntity created = studentService.createStudent(student);
        StudentResponseDTO response = convertToResponseDTO(created);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentResponseDTO> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody StudentUpdateDTO dto
    ) {
        StudentEntity updated = studentService.updateStudent(id, dto);

        StudentResponseDTO response = convertToResponseDTO(updated);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }
}
