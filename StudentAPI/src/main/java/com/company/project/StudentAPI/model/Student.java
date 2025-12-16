package com.company.project.StudentAPI.model;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Student {
    private Long id;
    private String name;
    private int age;
}
