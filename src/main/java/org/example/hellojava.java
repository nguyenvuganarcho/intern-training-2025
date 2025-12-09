package org.example;

import java.util.Scanner;

public class hellojava {
    public static void main(String[] args) {
        Scanner s = new Scanner(System.in);
        System.out.println("Enter your name: ");
        String name = s.nextLine();
        System.out.println("Hello, my name is: " + name);
    }
}
