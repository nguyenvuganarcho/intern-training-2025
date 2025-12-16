package com.company.project.StudentAPI.service;

import com.company.project.StudentAPI.model.Student;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class StudentServiceImpl implements StudentService {
    private List<Student> students = new ArrayList<>();
    private Long nextId = 4L;

    public StudentServiceImpl() {
        students.add(new Student(1L, "Mason", 20));
        students.add(new Student(2L, "Bruno", 22));
        students.add(new Student(3L, "Bryan", 19));
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
                .orElse(null);
    }

    @Override
    public Student createStudent(Student student) {
        student.setId(nextId++);
        students.add(student);
        return student;
    }

}
