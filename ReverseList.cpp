#include <iostream>
#include "List.h"

using namespace std;

List* reverseList(List* head) {
    List* prev = nullptr;
    List* current = head;
    
    while (current != nullptr) {
        List* nextTemp = current->next;
        current->next = prev;
        prev = current;
        current = nextTemp;
    }
    
    return prev;
}

void printList(List* head) {
    while (head != nullptr) {
        cout << head->val;
        if (head->next != nullptr) cout << " -> ";
        head = head->next;
    }
    cout << endl;
}

int main() {
    List* head = new List(1);
    head->next = new List(2);
    head->next->next = new List(3);
    head->next->next->next = new List(4);
    head->next->next->next->next = new List(5);
    
    printList(head);
    head = reverseList(head);
    printList(head);
}