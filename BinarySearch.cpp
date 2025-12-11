#include <iostream>

using namespace std;

int binarySearch(int arr[], int left, int right, int target) {
    if (left > right) {
        return -1; 
    }
    
    int mid = left + (right - left) / 2;
    
    if (arr[mid] == target) {
        return mid;
    }
    
    if (arr[mid] > target) {
        return binarySearch(arr, left, mid - 1, target);
    } else {
        return binarySearch(arr, mid + 1, right, target);
    }
}

int binarySearch(int arr[], int size, int target) {
    return binarySearch(arr, 0, size - 1, target);
}

int main() {
    int a[] = {1, 3, 5, 7, 9, 11, 13, 15};
    int size = 8;
    
    cout << binarySearch(a, size, 7) << endl;
    cout << binarySearch(a, size, 15) << endl;
    cout << binarySearch(a, size, 10) << endl;
}