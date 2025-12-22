package com.company.project.StudentAPI.service;

import com.company.project.StudentAPI.dto.StudentCreateDTO;
import com.company.project.StudentAPI.dto.StudentUpdateDTO;
import com.company.project.StudentAPI.Entity.StudentEntity;
import com.company.project.StudentAPI.dto.PageResponseDTO;
import com.company.project.StudentAPI.dto.StudentResponseDTO;
import java.util.List;

public interface StudentService {
    //Read
    StudentEntity getStudentById(Long id);
    PageResponseDTO<StudentResponseDTO> getAllStudents(
            int page,
            int size,
            String sortField,
            String sortDirection
    );

    //Create
    StudentEntity createStudent(StudentCreateDTO dto);

    //Update
    StudentEntity updateStudent(Long id, StudentUpdateDTO dto);

    //Delete
    void deleteStudent(Long id);

    // SEARCH
    PageResponseDTO<StudentResponseDTO> searchStudents(
            String keyword,
            int page,
            int size,
            String sortField,
            String sortDirection
    );
}
