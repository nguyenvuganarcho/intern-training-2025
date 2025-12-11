#include <iostream>
#include <unordered_map>

using namespace std;

int fibMemoi(int n, unordered_map<int,int>& memo) {
    if (n == 0) return 0;
    if (n == 1) return 1;

    if (memo.find(n) != memo.end()) {
        return memo[n];
    }

    memo[n] = fibMemoi(n - 1, memo) + fibMemoi(n - 2, memo);
    return memo[n];
}

int fibMemoi(int n) {
    unordered_map<int,int> memo;
    return fibMemoi(n, memo);
}

int main() {
    cout << fibMemoi(5) << endl;
}