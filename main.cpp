#include <iostream>
#include "Stack.h"

using namespace std;

int main() {
    Stack a;

    // test push
    a.push(2);
    a.push(21);
    a.push(14);
    a.push(3);
    a.push(5);
    a.push(9);
    a.print();

    // test pop
    a.pop();
    a.print();

    // test size
    a.size();
    // test peek
    a.peek();
    // test isEmpty
    Stack b;
    a.isEmpty();
    b.isEmpty();

    // test findMax
    a.findMax();

    // test findDuplicates;
    a.findDuplicates();
    Stack c;
    c.push(3);
    c.push(3);
    c.push(4);
    c.findDuplicates();

    //test check palindrome
    Stack d;
    d.push(1);
    d.push(2);
    d.push(1);
    d.checkForPalindrome();
    a.checkForPalindrome();

    // test for two sum
    a.twoSum(17);
}