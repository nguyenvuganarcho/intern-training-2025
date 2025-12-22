package com.company.project.StudentAPI.service;

import com.company.project.StudentAPI.StudentApiApplication;
import com.company.project.StudentAPI.dto.StudentCreateDTO;
import com.company.project.StudentAPI.dto.StudentUpdateDTO;
import com.company.project.StudentAPI.dto.PageResponseDTO;
import com.company.project.StudentAPI.dto.StudentResponseDTO;
import com.company.project.StudentAPI.exception.EmailAlreadyExistsException;
import com.company.project.StudentAPI.exception.StudentNotFoundException;
import com.company.project.StudentAPI.Entity.StudentEntity;
import com.company.project.StudentAPI.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;
import java.util.Set;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentServiceImpl implements StudentService {

    @Autowired
    private StudentRepository studentRepository;

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id", "name", "email", "age", "createdAt"
    );

    private StudentEntity findStudentOrThrow(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new StudentNotFoundException(id));
    }

    /**
     * Convert Entity to ResponseDTO
     */
    private StudentResponseDTO convertToResponseDTO(StudentEntity entity) {
        return new StudentResponseDTO(
                entity.getId(),
                entity.getName(),
                entity.getEmail(),
                entity.getAge()
        );
    }

    private Sort createSort(String sortField, String sortDirection) {

        return sortDirection.equalsIgnoreCase("desc")
                ? Sort.by(sortField).descending()
                : Sort.by(sortField).ascending();
    }

    private PageResponseDTO<StudentResponseDTO> convertToPageResponse(
            Page<StudentEntity> pageData
    ) {
        List<StudentResponseDTO> items = pageData.getContent().stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());

        return new PageResponseDTO<>(
                true,
                items,
                pageData.getNumber(),
                pageData.getSize(),
                pageData.getTotalElements(),
                pageData.getTotalPages()
        );
    }

    @Override
    public PageResponseDTO<StudentResponseDTO> getAllStudents(
            int page,
            int size,
            String sortField,
            String sortDirection
    ) {

        // Create Sort
        Sort sort = createSort(sortField, sortDirection);

        // Create PageRequest
        PageRequest pageRequest = PageRequest.of(page, size, sort);

        // Query database
        Page<StudentEntity> pageData = studentRepository.findAll(pageRequest);

        // Convert to PageResponseDTO
        return convertToPageResponse(pageData);
    }

    @Override
    public StudentEntity getStudentById(Long id) {
        return findStudentOrThrow(id);
    }

    @Override
    public StudentEntity createStudent(StudentCreateDTO dto) {
        if (studentRepository.existsByEmail(dto.getEmail())) {
            throw new EmailAlreadyExistsException("Email exists: " + dto.getEmail());
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
        StudentEntity studentEntity = findStudentOrThrow(id);

        if (!studentEntity.getEmail().equals(dto.getEmail())
                && studentRepository.existsByEmail(dto.getEmail())) {
            throw new EmailAlreadyExistsException("Email exits: " + dto.getEmail());
            // ↑ Đổi từ IllegalArgumentException
        }

        studentEntity.setName(dto.getName());
        studentEntity.setEmail(dto.getEmail());
        studentEntity.setAge(dto.getAge());

        return studentRepository.save(studentEntity);
    }

    @Override
    public void deleteStudent(Long id) {
       StudentEntity studentEntity = findStudentOrThrow(id);

        studentRepository.deleteById(id);
    }

    @Override
    public PageResponseDTO<StudentResponseDTO> searchStudents(
            String keyword,
            int page,
            int size,
            String sortField,
            String sortDirection
    ) {
        Sort sort = createSort(sortField, sortDirection);

        PageRequest pageRequest = PageRequest.of(page, size, sort);

        Page<StudentEntity> pageData;

        if (keyword == null || keyword.trim().isEmpty()) {
            pageData = studentRepository.findAll(pageRequest);
        } else {
            pageData = studentRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                    keyword.trim(),
                    keyword.trim(),
                    pageRequest
            );
        }

        return convertToPageResponse(pageData);
    }
}

