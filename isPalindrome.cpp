#include <iostream>
#include <gtest/gtest.h>
#include <string>

using namespace std;

bool isPalindrome(string s) {
    int left = 0;
    int right = s.length() - 1;
    
    while (left < right) {
        if (s[left] != s[right]) {
            return false;
        }
        left++;
        right--;
    }
    
    return true;
}

class PalindromeTest : public ::testing::Test {
protected:
    void SetUp() override {}
};

TEST(PalindromeTest, SimplePalindrome) {
    string s = "racecar"; // arrange
    
    bool result = isPalindrome(s); // act
    
    EXPECT_TRUE(result); // assert
}

TEST(PalindromeTest, NotPalindrome) {
    string s = "messi";
    
    bool result = isPalindrome(s);
    
    EXPECT_FALSE(result);
}

TEST(PalindromeTest, EvenPalindrome) {
    string s = "cddc";
    
    bool result = isPalindrome(s);
    
    EXPECT_TRUE(result);
}

TEST(PalindromeTest, oddPalindrome) {
    string s = "gdg";
    
    bool result = isPalindrome(s);
    
    EXPECT_TRUE(result);
}

TEST(PalindromeTest, SinglePalindrome) {
    string s = "r";
    
    bool result = isPalindrome(s);
    
    EXPECT_TRUE(result);
}

TEST(PalindromeTest, EmptyPalindrome) {
    string s = "";
    
    bool result = isPalindrome(s);
    
    EXPECT_TRUE(result);
}


int main(int argc, char **argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}



