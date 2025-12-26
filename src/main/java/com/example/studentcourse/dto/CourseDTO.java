package com.example.studentcourse.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseDTO {

    private Long id;

    @NotBlank(message = "Need to enter your course")
    @Size(min = 3, max = 200, message = "Must be between 3 and 200")
    private String courseName;
}