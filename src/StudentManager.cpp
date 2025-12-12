#include "StudentManager.h"
#include <algorithm>
#include <iostream>

using namespace std;

StudentManager::StudentManager() {}

void StudentManager::addStudent(const Student& student) {
    if (isIdExists(student.getId())) {
        cout << "Student already exist" << endl;
        return;
    }

    students.push_back(student);
}

Student* StudentManager::findStudentById(int id) {
    for (int i = 0; i < students.size(); i++) {
        if (students[i].getId() == id) {
            return &students[i];
        }
    }
    cout << "Student not found" << endl;
    return nullptr;
}

void StudentManager::updateStudent(int id) {
    Student* student = findStudentById(id);

    if (student == nullptr) {
        cout << "Student not found" << endl;
        return;
    }

    double newGpa;
    cout << "Update student's gpa" << endl;
    cout << "Enter new Gpa" << endl;
    cin >> newGpa;
    student->setGpa(newGpa);
    cout << "Update successfully" << endl;
}

void StudentManager::removeStudent(int id) {
    Student* student = findStudentById(id); 
    
    if (student == nullptr) {
        cout << "Student not found" << endl;
        return;
    }
    
    cout << "Removing: ";
    student->display();
}

// Sắp xếp theo tên
void StudentManager::sortByName() {
    // Sử dụng lambda function để sort
    sort(students.begin(), students.end(), 
         [](const Student& a, const Student& b) {
             return a.getName() < b.getName();
         });
    
    cout << "Students sorted by name!" << endl;
}

// Tìm sinh viên có GPA cao nhất
vector<Student> StudentManager::getTopGpa() {
    vector<Student> topStudents;
    
    if (students.empty()) {
        return topStudents;
    }
    
    double maxGpa = students[0].getGpa();
    for (int i = 1; i < students.size(); i++) {
        if (students[i].getGpa() > maxGpa) {
            maxGpa = students[i].getGpa();
        }
    }
    
    for (int i = 0; i < students.size(); i++) {
        if (students[i].getGpa() == maxGpa) {
            topStudents.push_back(students[i]);
        }
    }
    
    return topStudents;
}

void StudentManager::displayAllStudent() const {
    if (students.empty()) {
        cout << "No students in the system." << endl;
        return;
    }
    
    cout << "\n=== LIST OF STUDENTS ===" << endl;
    for (const Student& s : students) {
        s.display();
    }
    cout << "Total: " << students.size() << " students\n" << endl;
}

bool StudentManager::isIdExists(int id) const {
    for (const Student& s : students) {
        if (s.getId() == id) {
            return true;
        }
    }
    return false;
}