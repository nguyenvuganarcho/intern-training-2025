package org.example;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class StudentManager {
        private List<Student> students;
        private static final String FILE_NAME = "students.txt";

        public StudentManager() {
            this.students = new ArrayList<>();
        }

    public void add(String name, int age, double score) {
        if (score < 0 || score > 100) {
            System.out.println("Score must be between 0 and 100");
            return;
        }

        // Tạo Student nếu tất cả hợp lệ
        Student student = new Student(name, age, score);
        students.add(student);
        System.out.println("Added: " + name);
    }

        public Student findHighest() {
            if (students.isEmpty()) {
                return null;
            }

            Student highest = students.get(0);

            for (Student student : students) {
                if(student.getScore() > highest.getScore()) {
                    highest = student;
                }
            }

            return highest;
        }

    public void print() {
        if (students.isEmpty()) {
            System.out.println("No students to display");
            return;
        }

        System.out.printf("%-20s %-5s %-10s%n", "Name", "Age", "Score \n");

        for (Student s : students) {
            System.out.printf("%-20s %-5d %-10.2f%n \n",
                    s.getName(), s.getAge(), s.getScore());
        }
    }

    public void writeToFile() {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(FILE_NAME))) {
            for (Student student : students) {
                writer.write(student.getName() + "," +
                        student.getAge() + "," +
                        student.getScore());
                writer.newLine();
            }

            System.out.println("Saved " + students.size() + " students to " + FILE_NAME);

        } catch (IOException e) {
            System.out.println("Error writing to file: " + e.getMessage());
        }
    }

    public void readFromFile() {
        File file = new File(FILE_NAME);

        if (!file.exists()) {
            System.out.println("File " + FILE_NAME + " does not exist");
            return;
        }

        try (BufferedReader reader = new BufferedReader(new FileReader(FILE_NAME))) {
            students.clear();
            String line;
            int count = 0;

            // Đọc từng dòng
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(",");

                if (parts.length == 3) {
                    String name = parts[0].trim();
                    int age = Integer.parseInt(parts[1].trim());
                    double score = Double.parseDouble(parts[2].trim());

                    Student student = new Student(name, age, score);
                    students.add(student);
                    count++;
                }
            }

            System.out.println("Loaded " + count + " students from " + FILE_NAME);

        } catch (IOException e) {
            System.out.println("Error reading from file: " + e.getMessage());
        }
    }
}

