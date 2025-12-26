package com.example.studentcourse.controller;

import com.example.studentcourse.dto.EnrollmentDTO;
import com.example.studentcourse.service.EnrollmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/enrollment")
@CrossOrigin(origins = "*")
public class EnrollmentController {

    @Autowired
    private EnrollmentService enrollmentService;

    @PostMapping
    public ResponseEntity<String> enrollCourse(@Valid @RequestBody EnrollmentDTO dto) {
        enrollmentService.enrollCourse(dto.getStudentId(), dto.getCourseId());
        return ResponseEntity.ok("Enroll success");
    }

    @DeleteMapping
    public ResponseEntity<String> unenrollCourse(
            @RequestParam Long studentId,
            @RequestParam Long courseId
    ) {
        enrollmentService.unenrollCourse(studentId, courseId);
        return ResponseEntity.ok("Unenroll success");
    }
}