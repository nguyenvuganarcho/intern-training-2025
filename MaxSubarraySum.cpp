#include <iostream>

using namespace std;

int maxSubarraySum(int arr[], int size) {
    int maxSoFar = arr[0];
    int maxEndingHere = arr[0];
    
    for (int i = 1; i < size; i++) {
        maxEndingHere = max(arr[i], maxEndingHere + arr[i]);
        maxSoFar = max(maxSoFar, maxEndingHere);
    }
    
    return maxSoFar;
}

int main() {
    int a[] = {3, 7, 2, 9, 1, 5, 8};
    int size = 3;

    cout << maxSubarraySum(a, size) << endl;

}