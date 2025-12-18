package com.company.project.StudentAPI.service;

import com.company.project.StudentAPI.dto.StudentCreateDTO;
import com.company.project.StudentAPI.dto.StudentUpdateDTO;
import com.company.project.StudentAPI.Entity.StudentEntity;
import java.util.List;

public interface StudentService {
    //Read
    List<StudentEntity> getAllStudents();
    StudentEntity getStudentById(Long id);

    //Create
    StudentEntity createStudent(StudentCreateDTO dto);

    //Update
    StudentEntity updateStudent(Long id, StudentUpdateDTO dto);

    //Delete
    void deleteStudent(Long id);
}
