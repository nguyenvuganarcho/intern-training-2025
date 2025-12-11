#include <algorithm>
#include <unordered_set>
#include <string>

using namespace std;

int longestSubstring(string s) {
    unordered_set<char> seen;
    int maxLen = 0;
    int left = 0;

    for (int i = 0; i < s.length(); i++) {
        while (seen.find(s[i]) != seen.end()) {
            seen.erase(s[left]);
            left++;
        }

        seen.insert(s[i]);

        maxLen = max(maxLen, i - left + 1);

        return maxLen;
    }
}