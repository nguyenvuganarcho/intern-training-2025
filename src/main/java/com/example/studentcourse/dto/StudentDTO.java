package com.example.studentcourse.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentDTO {
    private Long Id;

    @NotBlank(message = "Need to enter your name")
    @Size(min = 3, max = 50, message = "Must be between 3-50 char")
    private String name;

    @NotBlank(message = "Need to enter your email")
    @Email(message = "Invalid email")
    private String email;

    @NotNull(message = "Need to enter your age")
    @Min(value = 16, message = ">= 16")
    @Max(value = 60, message = "<= 60")
    private Integer age;
}
