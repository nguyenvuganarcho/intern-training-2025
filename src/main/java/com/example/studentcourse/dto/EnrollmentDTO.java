package com.example.studentcourse.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentDTO {

    @NotNull(message = "Need to enter your student id")
    private Long studentId;

    @NotNull(message = "Need to enter your course id")
    private Long courseId;
}