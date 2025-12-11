#include <iostream>

using namespace std;

int largerThanFiftyPercent(int arr[], int size) {
    int candidate = arr[0];
    int count = 1;
    
    for (int i = 1; i < size; i++) {
        if (arr[i] == candidate) {
            count++;
        } else {
            count--;
            if (count == 0) {
                candidate = arr[i];
                count = 1;
            }
        }
    }

    return (count > size / 2) ? candidate : -1;
}

int main() {
    int a[] = {1, 1, 1, 1, 1 ,1};
    int size = 6;
    cout << largerThanFiftyPercent(a, size) << endl;
}