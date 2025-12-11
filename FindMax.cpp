#include <iostream>

using namespace std;

int findMax(int arr[], int left, int right) {
    if (left == right) {
        return arr[left];
    }
    
    int mid = left + (right - left) / 2;
    
    int maxLeft = findMax(arr, left, mid);
    int maxRight = findMax(arr, mid + 1, right);
    
    return (maxLeft > maxRight) ? maxLeft : maxRight;
}

int findMax(int arr[], int size) {
    return findMax(arr, 0, size - 1);
}

int main() {
    int a[] = {3, 7, 2, 9, 1, 5, 8};
    int size = 7;

    cout << findMax(a, size) << endl;