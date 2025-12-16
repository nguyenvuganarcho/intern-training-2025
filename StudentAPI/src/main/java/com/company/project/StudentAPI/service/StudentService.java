package com.company.project.StudentAPI.service;

import com.company.project.StudentAPI.model.Student;
import java.util.List;

public interface StudentService {
    List<Student> getAllStudents();
    Student getStudentById(Long id);
    Student createStudent(Student student);
}
