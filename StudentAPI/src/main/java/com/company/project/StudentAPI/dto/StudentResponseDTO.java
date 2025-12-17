package com.company.project.StudentAPI.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentResponseDTO {
    private Long id;
    private String name;
    private String email;
    private int age;
}
