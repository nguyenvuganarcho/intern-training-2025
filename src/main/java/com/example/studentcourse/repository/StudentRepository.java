package com.example.studentcourse.repository;

import com.example.studentcourse.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    // Search by name (pagination)
    Page<Student> findByNameContainingIgnoreCase(String name, Pageable pageable);

    // Filter by age range
    List<Student> findByAgeBetween(Integer ageFrom, Integer ageTo);

    // Filter by email domain
    @Query("SELECT s FROM Student s WHERE s.email LIKE %:domain%")
    List<Student> findByEmailDomain(@Param("domain") String domain);

    // Check email exists
    boolean existsByEmail(String email);
}