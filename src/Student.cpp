#include "Student.h"
#include <iostream>

using namespace std;

// constructor
Student::Student(int id, double gpa, string name, string email) {
    this->id = id;
    this->gpa = gpa;
    this->name = name;
    this ->email = email;
}

// getters
int Student::getId() const {
    return id;
}

string Student::getName() const {
    return name;
}

double Student::getGpa() const {
    return gpa;
}

string Student::getEmail() const {
    return email;
}

// setter
void Student::setGpa(double newGpa) {
    if (newGpa >= 0.0 && newGpa <= 4.0) { 
        gpa = newGpa;
    } else {
        cout << "Invalid GPA" << endl;
    }
}

// Display
void Student::display() const {
    cout << "ID: " << id 
         << " | Name: " << name 
         << " | GPA: " << gpa 
         << " | Email: " << email << endl;
}


