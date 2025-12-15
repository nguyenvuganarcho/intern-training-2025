package org.example;

import java.util.Scanner;

public class CalculateAverage {
    public static double avg(int a, int b) throws Exception {
        if (a < 0 || a > 100) {
            throw new Exception("1st score is invalid (must be 0-100)");
        }

        if (b < 0 || b > 100) {
            throw new Exception("2nd score is invalid (must be 0-100)");
        }

        return (a + b) / 2.0;
    }

    public static void main(String[] args) {
        Scanner s = new Scanner(System.in);

        System.out.println("Average Score Calculator");

        while (true) {
            try {
                System.out.print("Enter first score (0-100, or -1 to exit): ");
                int score1 = s.nextInt();

                if (score1 == -1) {
                    System.out.println("\n Goodbye!");
                    break;
                }

                System.out.print("Enter second score (0-100): ");
                int score2 = s.nextInt();

                double average = avg(score1, score2);

                System.out.println("Average: " + average);
                System.out.println();
            } catch (Exception e) {
                System.out.println("Error: " + e.getMessage());
                System.out.println();
            }
        }

        s.close();
    }
}





