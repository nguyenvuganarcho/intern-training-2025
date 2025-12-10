#include "Stack.h"

using namespace std;

void Stack::push(int value) {
    data.push_back(value);
    return;
}

int Stack::pop() {
    if (isEmpty()) {
        return -1;
    }

    int valuePop = data.back();
    data.pop_back();
    return valuePop;
}

int Stack::size() {
    return data.size();
}

int Stack::peek() {
    if (isEmpty()) return -1;
    
    return data.back();
}

bool Stack::isEmpty() {
    return data.empty();
}

int Stack::findMax() {
    if (isEmpty()) return -1;
    int max = data[0];
    for (int i = 0; i < data.size() - 1; i++) {
        if (max < data[i]) {
            max = data[i];
        }
    }
    return max;
}

void Stack::findDuplicates() {
    if (isEmpty()) return;

    vector<int> sorted = data;
    sort(sorted.begin(), sorted.end());

    cout << "Duplicate elements: " << endl;
    int i = 0;
    while (i < sorted.size()) {
        int current = sorted[i];
        int count = 0;

        while (i < sorted.size() && sorted[i] == current) {
            i++;
            count++;
        }
        if (count > 1) {
            cout << current << ": " << count << " times" << endl;
            return;
        }
    }
    cout << "No Duplicates" << endl;
}

bool Stack::checkForPalindrome() {
    int left = 0;
    int right = data.size() - 1;

    while (left < right) {
        if (data[left] != data[right]) {
            return false;
        } 
        left++;
        right--;
    }
    return true;
}

void Stack::twoSum(int sum) {
    for (int i = 0; i < data.size() - 1; i++) {
        for (int j = i + 1; j < data.size()- 1; j++) {
            if (data[i] + data[j] == sum) {
                cout << "Elements: " << i + 1 << ", " << j + 1 << " add up to " << sum << endl;
            }
        }
    }
}

void Stack::print() {
    for (int i = data.size() - 1; i >= 0; i--) {
        cout << data[i] << " ";
    }
    cout << endl;
}
