#include <iostream>

using namespace std;

int sumArray(int arr[], int n) {
    if (n <= 0) {
        return 0;
    }
    
    return arr[n - 1] + sumArray(arr, n - 1);
}

int main() {
    int a[] = {4, 5, 6, 7};
    int size = 4;
    cout << sumArray(a, size) << endl;
}