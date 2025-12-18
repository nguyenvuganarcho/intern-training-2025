package com.company.project.StudentAPI.repository;

import com.company.project.StudentAPI.Entity.StudentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentRepository extends JpaRepository<StudentEntity, Long> {
    boolean existsByEmail(String email);
}
