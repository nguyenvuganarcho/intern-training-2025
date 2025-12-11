#include <algorithm>
#include <iostream>

using namespace std;

void twoSum(int arr[], int n, int target) {
    // Sort mảng trước
    sort(arr, arr + n);
    
    // Two pointers
    int left = 0;
    int right = n - 1;
    
    while (left < right) {
        int sum = arr[left] + arr[right];
        
        if (sum == target) {
            cout << "YES" << endl;
            return;
        } else if (sum < target) {
            left++;  
        } else {
            right--; 
        }
    }
    
    cout << "NO" << endl;
    return;
}

int main() {
    int a[5] = {3, 5, 6, 10, 2};
    int size = 5;
    twoSum(a, size, 12);
}
