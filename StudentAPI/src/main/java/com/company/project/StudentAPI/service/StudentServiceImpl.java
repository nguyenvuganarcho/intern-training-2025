package com.company.project.StudentAPI.service;

import com.company.project.StudentAPI.StudentApiApplication;
import com.company.project.StudentAPI.dto.StudentCreateDTO;
import com.company.project.StudentAPI.dto.StudentUpdateDTO;
import com.company.project.StudentAPI.exception.DuplicateEmailException;
import com.company.project.StudentAPI.exception.ResourceNotFoundException;
import com.company.project.StudentAPI.Entity.StudentEntity;
import com.company.project.StudentAPI.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class StudentServiceImpl implements StudentService {

    @Autowired
    private StudentRepository studentRepository;


    @Override
    public List<StudentEntity> getAllStudents() {
        return studentRepository.findAll();
    }

    @Override
    public StudentEntity getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Can not find student with id: " + id));
    }

    @Override
    public StudentEntity createStudent(StudentCreateDTO dto) {
        if (studentRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateEmailException("Email exists: " + dto.getEmail());
        }
        StudentEntity studentEntity = new StudentEntity();
        studentEntity.setName(dto.getName());
        studentEntity.setEmail(dto.getEmail());
        studentEntity.setAge(dto.getAge());
        studentEntity.setCreatedAt(LocalDateTime.now());

        return studentRepository.save(studentEntity);
    }

    @Override
    public StudentEntity updateStudent(Long id, StudentUpdateDTO dto) {
        StudentEntity studentEntity = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Can not find student with id: " + id));

        if (!studentEntity.getEmail().equals(dto.getEmail())
                && studentRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateEmailException("Email exits: " + dto.getEmail());
            // ↑ Đổi từ IllegalArgumentException
        }

        studentEntity.setName(dto.getName());
        studentEntity.setEmail(dto.getEmail());
        studentEntity.setAge(dto.getAge());

        return studentRepository.save(studentEntity);
    }

    @Override
    public void deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
                throw new ResourceNotFoundException("Can not find student with id: " + id);
        }

        studentRepository.deleteById(id);
    }
}
