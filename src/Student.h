#ifndef STUDENT_H
#define STUDENT_H

#include <string>

using namespace std;

class Student {
    private:
    int id;
    double gpa;
    string name;
    string email;
    
    public:
    // constructor
    Student(int id, double gpa, string name, string email);

    // getters
    int getId() const;
    double getGpa() const;
    string getName() const;
    string getEmail() const;

    // setter
    void setGpa(double newGpa);

    //Utility
    void display() const;


};

#endif
