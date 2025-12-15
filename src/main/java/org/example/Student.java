package org.example;

import jdk.jfr.DataAmount;
import  lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {
    private String name;
    private int age;
    private double score;

    public String toString() {
        return name + "," + age + "," + score;
    }

    public static Student stringFromFile(String line) {
            String[] parts = line.split(",");
            if (parts.length == 3) {
                String name = parts[0].trim();
                int age = Integer.parseInt(parts[1].trim());
                double score = Double.parseDouble(parts[2].trim());

                return new Student(name, age, score);
            }

            return null;
    }
}

