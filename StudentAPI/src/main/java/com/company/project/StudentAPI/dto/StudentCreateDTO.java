package com.company.project.StudentAPI.dto;

import lombok.*;
import jakarta.validation.constraints.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentCreateDTO {
    @NotBlank(message = "Name cant be blank")
    @Size(min = 3, max = 30, message = "Name must be within 3-30 words")
    private String name;

    @NotBlank(message = "Email cant be blank")
    @Email(message =  "Invalid email")
    private String email;

    @Min(value = 16, message = "Must be 16 or above")
    @Max(value = 60, message = "Must be under 60")
    private int age;
}
