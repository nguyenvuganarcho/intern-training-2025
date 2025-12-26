package com.example.studentcourse.service;

import com.example.studentcourse.dto.CourseDTO;
import com.example.studentcourse.dto.StudentDTO;
import com.example.studentcourse.entity.Course;
import com.example.studentcourse.entity.Enrollment;
import com.example.studentcourse.entity.Student;
import com.example.studentcourse.exception.StudentNotFoundException;
import com.example.studentcourse.exception.EmailAlreadyExistsException;
import com.example.studentcourse.repository.CourseRepository;
import com.example.studentcourse.repository.EnrollmentRepository;
import com.example.studentcourse.repository.StudentRepository;
import com.example.studentcourse.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.Map;

@Service
public class StudentServiceImpl implements StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private CourseRepository courseRepository;

    private Student findStudentOrThrow(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new StudentNotFoundException(id));
    }

    private StudentDTO convertToDTO(Student student) {
        StudentDTO dto = new StudentDTO();
        dto.setId(student.getId());
        dto.setName(student.getName());
        dto.setEmail(student.getEmail());
        dto.setAge(student.getAge());
        return dto;
    }

    private CourseDTO convertCourseToDTO(Course course) {
        CourseDTO dto = new CourseDTO();
        dto.setId(course.getId());
        dto.setCourseName(course.getCourseName());
        return dto;
    }

    @Override
    @Transactional
    public StudentDTO createStudent(StudentDTO dto) {
        if (studentRepository.existsByEmail(dto.getEmail())) {
            throw new EmailAlreadyExistsException("Email exists: " + dto.getEmail());
        }


        Student student = new Student();
        student.setName(dto.getName());
        student.setEmail(dto.getEmail());
        student.setAge(dto.getAge());

        Student saved = studentRepository.save(student);

        return convertToDTO(saved);
    }

    @Override
    public StudentDTO getStudentById(Long id) {
        Student student = findStudentOrThrow(id);
        return convertToDTO(student);
    }

    @Override
    public Page<StudentDTO> getAllStudents(int page, int size, String sortBy, String direction) {
        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Student> students = studentRepository.findAll(pageable);

        return students.map(this::convertToDTO);
    }

    @Override
    @Transactional
    public StudentDTO updateStudent(Long id, StudentDTO dto) {
        Student student = findStudentOrThrow(id);

        if (!student.getEmail().equals(dto.getEmail()) &&
                studentRepository.existsByEmail(dto.getEmail())) {
            throw new EmailAlreadyExistsException("Email exists: " + dto.getEmail());
        }

        // Update
        student.setName(dto.getName());
        student.setEmail(dto.getEmail());
        student.setAge(dto.getAge());

        Student updated = studentRepository.save(student);

        return convertToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteStudent(Long id) {
        Student student = findStudentOrThrow(id);

        enrollmentRepository.deleteAll(
                enrollmentRepository.findByStudentId(id)
        );

        // Xóa student
        studentRepository.deleteById(id);
    }

    @Override
    public Page<StudentDTO> searchByName(String name, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<Student> students = studentRepository.findByNameContainingIgnoreCase(name, pageable);

        return students.map(this::convertToDTO);
    }

    @Override
    public List<StudentDTO> getStudentsByAgeRange(Integer ageFrom, Integer ageTo) {
        List<Student> students = studentRepository.findByAgeBetween(ageFrom, ageTo);

        return students.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<StudentDTO> getStudentsByEmailDomain(String domain) {
        List<Student> students = studentRepository.findByEmailDomain(domain);

        return students.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }


    @Override
    public List<CourseDTO> getStudentCourses(Long studentId) {
        Student student = findStudentOrThrow(studentId);

        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(studentId);

        return enrollments.stream()
                .map(enrollment -> {
                    Course course = courseRepository.findById(enrollment.getCourseId())
                            .orElse(null);
                    return course != null ? convertCourseToDTO(course) : null;
                })
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getTopStudents(int limit) {
        List<Object[]> results = enrollmentRepository.countEnrollmentsByStudent();

        return results.stream()
                .limit(limit)
                .map(row -> {
                    Long studentId = ((Number) row[0]).longValue();
                    Long courseCount = ((Number) row[1]).longValue();

                    Student student = studentRepository.findById(studentId).orElse(null);

                    if (student != null) {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", student.getId());
                        map.put("name", student.getName());
                        map.put("email", student.getEmail());
                        map.put("age", student.getAge());
                        map.put("courseCount", courseCount);
                        return map;
                    }
                    return null;
                })
                .filter(m -> m != null)
                .collect(Collectors.toList());
    }
}