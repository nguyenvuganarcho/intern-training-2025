# Student Management System

A simple student management system built with C++.

## Project Structure
```
student_management/
├── src/
│   ├── Student.h
│   ├── Student.cpp
│   ├── StudentManager.h
│   ├── StudentManager.cpp
│   └── main.cpp
├── tests/
│   └── test_student_manager.cpp
├── bin/
│   ├── student_manager
│   └── test_manager
├── docs/
│   ├── class_diagram.png
|
└── README.md
```

## Features

- Add student
- Find student by ID
- Update student GPA
- Remove student
- Display all students
- Sort students by name
- Find top GPA students

## How to Run

### Compile and run
```bash
g++ -std=c++11 -Isrc src/Student.cpp src/StudentManager.cpp src/main.cpp -o bin/student_manager
./bin/student_manager
```

## Example Input/Output

### Add Student
```
Student added successfully!
```

### Display All Students
```
ID: 101 | Name: Alice Johnson | GPA: 3.85 | Email: alice@email.com
ID: 102 | Name: Bob Smith | GPA: 3.42 | Email: bob@email.com
ID: 103 | Name: Charlie Davis | GPA: 3.91 | Email: charlie@email.com
Total: 3 students
```

### Sort by Name
```
ID: 101 | Name: Alice Johnson | GPA: 3.85 | Email: alice@email.com
ID: 102 | Name: Bob Smith | GPA: 3.42 | Email: bob@email.com
ID: 103 | Name: Charlie Davis | GPA: 3.91 | Email: charlie@email.com
Total: 3 students
```

### Find Top GPA
```
ID: 103 | Name: Charlie Davis | GPA: 3.91 | Email: charlie@email.com
ID: 107 | Name: Grace Lee | GPA: 3.91 | Email: grace@email.com
```

## Unit Testing

### Prerequisites
Google Test framework:

### Compile and run tests
```bash
g++ -std=c++11 -Isrc src/Student.cpp src/StudentManager.cpp test/test_student_manager.cpp -lgtest -lgtest_main -pthread -o bin/test_manager
./bin/test_manager
```



