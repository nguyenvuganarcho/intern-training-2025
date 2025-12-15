package org.example;

import java.util.Scanner;

public class Main {
    public static void main(String[] args) {

        StudentManager manager = new StudentManager();
        Scanner scanner = new Scanner(System.in);

        System.out.println("=== STUDENT MANAGER ===\n");

        while (true) {
            System.out.println("\n1. Add Student");
            System.out.println("2. Print All");
            System.out.println("3. Find Highest");
            System.out.println("4. Save to File");
            System.out.println("5. Load from File");
            System.out.println("0. Exit");
            System.out.print("\nChoice: ");

            int choice = scanner.nextInt();
            scanner.nextLine(); // Clear buffer

            if (choice == 1) {
                // Add student
                System.out.print("Name: ");
                String name = scanner.nextLine();

                System.out.print("Age: ");
                int age = scanner.nextInt();

                System.out.print("Score: ");
                double score = scanner.nextDouble();
                scanner.nextLine();

                manager.add(name, age, score);

            } else if (choice == 2) {
                manager.print();

            } else if (choice == 3) {
                // Find highest
                Student highest = manager.findHighest();
                if (highest != null) {
                    System.out.println("Highest: " + highest.getName() + " - " + highest.getScore());
                }

            } else if (choice == 4) {
                manager.writeToFile();

            } else if (choice == 5) {
                manager.readFromFile();

            } else if (choice == 0) {
                System.out.println("Goodbye!");
                break;

            } else {
                System.out.println("Invalid choice");
            }
        }

        scanner.close();
    }
}