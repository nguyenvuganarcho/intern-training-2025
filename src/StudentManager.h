#ifndef STUDENT_MANAGER_H
#define STUDENT_MANAGER_H

#include "Student.h"
#include <vector>

using namespace std;

class StudentManager {
    private:
    vector<Student> students;

    public:
    StudentManager();
    void addStudent(const Student& student);
    Student* findStudentById(int id);
    void updateStudent(int id);
    void removeStudent(int id);
    void sortByName();
    vector<Student> getTopGpa();

    // Utility
    void displayAllStudent() const;
    bool isIdExists(int id) const;
};

#endif