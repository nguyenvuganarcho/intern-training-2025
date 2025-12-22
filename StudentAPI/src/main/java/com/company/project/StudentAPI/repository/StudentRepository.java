package com.company.project.StudentAPI.repository;

import com.company.project.StudentAPI.Entity.StudentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<StudentEntity, Long> {
    boolean existsByEmail(String email);
    Optional<StudentEntity> findByEmail(String email);
    Page<StudentEntity> findByNameContainingIgnoreCase(String keyword, Pageable pageable);

    Page<StudentEntity> findByEmailContainingIgnoreCase(String keyword, Pageable pageable);

    Page<StudentEntity> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String nameKeyword,
            String emailKeyword,
            Pageable pageable
    );
}
