package com.example.studentcourse.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Enrollment",
        uniqueConstraints = @UniqueConstraint(columnNames = {"StudentId", "CourseId"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "StudentId", nullable = false)
    private Long studentId;

    @Column(name = "CourseId", nullable = false)
    private Long courseId;

    @Column(name = "CreatedAt", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}