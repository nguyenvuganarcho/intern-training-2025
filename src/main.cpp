#include "StudentManager.h"
#include <iostream>

using namespace std;

void displayMenu() {
    cout << "\n========================================" << endl;
    cout << "   STUDENT MANAGEMENT SYSTEM" << endl;
    cout << "========================================" << endl;
    cout << "1. Add Student" << endl;
    cout << "2. Find Student by ID" << endl;
    cout << "3. Update Student" << endl;
    cout << "4. Remove Student" << endl;
    cout << "5. Display All Students" << endl;
    cout << "6. Sort by Name" << endl;
    cout << "7. Show Top GPA Students" << endl;
    cout << "0. Exit" << endl;
    cout << "========================================" << endl;
    cout << "Your choice: ";
}

int main() {
    StudentManager manager;
    int choice;
    
    do {
        displayMenu();
        cin >> choice;
        cin.ignore();
        
        switch(choice) {
            case 1: {  // Add Student
                int id;
                double gpa;
                string name, email;
                
                cout << "\n--- Add New Student ---" << endl;
                cout << "Enter ID: ";
                cin >> id;
                cin.ignore();
                
                cout << "Enter GPA: ";
                cin >> gpa;
                cin.ignore();
                
                cout << "Enter Name: ";
                getline(cin, name);
                
                cout << "Enter Email: ";
                getline(cin, email);
                
                // Thứ tự: id, gpa, name, email
                Student newStudent(id, gpa, name, email);
                manager.addStudent(newStudent);
                break;
            }
            
            case 2: {  // Find Student
                int id;
                cout << "\nEnter Student ID: ";
                cin >> id;
                
                Student* student = manager.findStudentById(id);
                if (student != nullptr) {
                    cout << "\nStudent found:" << endl;
                    student->display();
                } else {
                    cout << "Student not found!" << endl;
                }
                break;
            }
            
            case 3: {  // Update Student
                int id;
                cout << "\nEnter Student ID to update: ";
                cin >> id;
                manager.updateStudent(id);
                break;
            }
            
            case 4: {  // Remove Student
                int id;
                cout << "\nEnter Student ID to remove: ";
                cin >> id;
                manager.removeStudent(id);
                break;
            }
            
            case 5: {  // Display All
                manager.displayAllStudent();
                break;
            }
            
            case 6: {  // Sort by Name
                manager.sortByName();
                manager.displayAllStudent();
                break;
            }
            
            case 7: {  // Top GPA
                vector<Student> topStudents = manager.getTopGpa();
                if (topStudents.empty()) {
                    cout << "No students in system!" << endl;
                } else {
                    cout << "\n=== Top GPA Students ===" << endl;
                    for (const Student& s : topStudents) {
                        s.display();
                    }
                }
                break;
            }
            
            case 0:
                cout << "Goodbye!" << endl;
                break;
                
            default:
                cout << "Invalid choice!" << endl;
        }
        
    } while (choice != 0);
    
    return 0;
}