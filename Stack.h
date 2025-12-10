#ifndef STACK_H
#define STACK_H

#include <vector>
#include <iostream>
#include <algorithm>

using namespace std;

class Stack {
    private:
    vector<int> data;
    public:
    void push(int value);
    int pop();
    int size();
    int peek();
    bool isEmpty();
    int findMax();
    void findDuplicates();
    bool checkForPalindrome();
    void twoSum(int sum);
    void print();
};

#endif