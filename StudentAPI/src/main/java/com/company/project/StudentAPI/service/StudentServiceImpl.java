package com.company.project.StudentAPI.service;

import com.company.project.StudentAPI.dto.StudentCreateDTO;
import com.company.project.StudentAPI.dto.StudentUpdateDTO;
import com.company.project.StudentAPI.exception.ResourceNotFoundException;
import com.company.project.StudentAPI.model.Student;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class StudentServiceImpl implements StudentService {
    private List<Student> students = new ArrayList<>();
    private Long nextId = 4L;

    public StudentServiceImpl() {
        students.add(new Student(1L, "Mason", "mason@gmail.com",20));
        students.add(new Student(2L, "Bruno", "bruno@gmail.com",22));
        students.add(new Student(3L, "Bryan", "bryan@gmail.com",19));
    }

    @Override
    public List<Student> getAllStudents() {
        return students;
    }

    @Override
    public Student getStudentById(Long id) {
        return students.stream()
                .filter(s -> s.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Can not find student with id: " + id));
    }

    @Override
    public Student createStudent(StudentCreateDTO dto) {
        Student student = new Student();
        student.setId(nextId++);
        student.setName(dto.getName());
        student.setEmail(dto.getEmail());
        student.setAge(dto.getAge());

        students.add(student);

        return student;
    }

    @Override
    public Student updateStudent(Long id, StudentUpdateDTO dto) {
        Student student = students.stream()
                .filter(s -> s.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Can not find student with id: " + id));

        if (student == null) {
            return null;
        }

        student.setName(dto.getName());
        student.setEmail(dto.getEmail());
        student.setAge(dto.getAge());

        return student;
    }
}
