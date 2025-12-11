#include <iostream>
#include <vector>

using namespace std;

vector<int> removeDuplicates(int arr[], int size) {
    vector<int> result;
    
    if (size == 0) return result;
    
    result.push_back(arr[0]);  // Luôn thêm phần tử đầu tiên
    
    for (int i = 1; i < size; i++) {
        if (arr[i] != result.back()) {
            result.push_back(arr[i]);
        }
    }
    
    return result;
}

int main() {
    int a[] = {1, 1, 2, 2, 3, 3, 4};
    int size = 7;
    vector<int> result = removeDuplicates(a, size);
    for (int i = 0; i < result.size(); i++) {
        cout << result[i] << " ";
    }
    cout << endl;
}
