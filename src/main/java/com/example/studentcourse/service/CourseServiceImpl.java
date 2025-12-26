package com.example.studentcourse.service.impl;

import com.example.studentcourse.dto.CourseDTO;
import com.example.studentcourse.dto.StudentDTO;
import com.example.studentcourse.entity.Course;
import com.example.studentcourse.entity.Enrollment;
import com.example.studentcourse.entity.Student;
import com.example.studentcourse.exception.CourseNotFoundException;
import com.example.studentcourse.repository.CourseRepository;
import com.example.studentcourse.repository.EnrollmentRepository;
import com.example.studentcourse.repository.StudentRepository;
import com.example.studentcourse.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CourseServiceImpl implements CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private StudentRepository studentRepository;

    // helper
    private CourseDTO convertToDTO(Course course) {
        CourseDTO dto = new CourseDTO();
        dto.setId(course.getId());
        dto.setCourseName(course.getCourseName());
        return dto;
    }

    private StudentDTO convertStudentToDTO(Student student) {
        StudentDTO dto = new StudentDTO();
        dto.setId(student.getId());
        dto.setName(student.getName());
        dto.setEmail(student.getEmail());
        dto.setAge(student.getAge());
        return dto;
    }

    private Course finCourseOrThrow(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new CourseNotFoundException(id));
    }

    @Override
    @Transactional
    public CourseDTO createCourse(CourseDTO dto) {
        Course course = new Course();
        course.setCourseName(dto.getCourseName());
        Course saved = courseRepository.save(course);

        return convertToDTO(saved);
    }

    @Override
    public CourseDTO getCourseById(Long id) {
        Course course = finCourseOrThrow(id);

        return convertToDTO(course);
    }

    @Override
    public Page<CourseDTO> getAllCourses(int page, int size, String sortBy, String direction) {
        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Course> courses = courseRepository.findAll(pageable);

        return courses.map(this::convertToDTO);
    }

    @Override
    @Transactional
    public CourseDTO updateCourse(Long id, CourseDTO dto) {
        Course course = finCourseOrThrow(id);

        course.setCourseName(dto.getCourseName());

        Course updated = courseRepository.save(course);

        return convertToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteCourse(Long id) {
        Course course = finCourseOrThrow(id);

        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(id);
        enrollmentRepository.deleteAll(enrollments);

        courseRepository.deleteById(id);
    }


    @Override
    public Page<CourseDTO> searchByName(String courseName, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<Course> courses = courseRepository.findByCourseNameContainingIgnoreCase(courseName, pageable);

        return courses.map(this::convertToDTO);
    }


    @Override
    public List<Map<String, Object>> getPopularCourses(int limit) {
        List<Object[]> results = enrollmentRepository.countEnrollmentsByCourse();

        return results.stream()
                .limit(limit)
                .map(row -> {
                    Long courseId = ((Number) row[0]).longValue();
                    Long studentCount = ((Number) row[1]).longValue();

                    Course course = courseRepository.findById(courseId).orElse(null);

                    if (course != null) {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", course.getId());
                        map.put("courseName", course.getCourseName());
                        map.put("studentCount", studentCount);
                        return map;
                    }
                    return null;
                })
                .filter(m -> m != null)
                .collect(Collectors.toList());
    }

    @Override
    public List<StudentDTO> getCourseStudents(Long courseId) {
       Course course = finCourseOrThrow(courseId);

        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);

        return enrollments.stream()
                .map(enrollment -> {
                    Student student = studentRepository.findById(enrollment.getStudentId()).orElse(null);
                    return student != null ? convertStudentToDTO(student) : null;
                })
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
    }

}