#include <algorithm>
#include <iostream>
#include <gtest/gtest.h>

using namespace std;

bool twoSum(int arr[], int n, int target) {
    // Sort mảng trước
    sort(arr, arr + n);
    
    // Two pointers
    int left = 0;
    int right = n - 1;
    
    while (left < right) {
        int sum = arr[left] + arr[right];
        
        if (sum == target) {
            cout << "YES" << endl;
            return true;
        } else if (sum < target) {
            left++;  
        } else {
            right--; 
        }
    }
    
    cout << "NO" << endl;
    return false;
}

class TwoSumTest : public ::testing::Test {
protected:
    void SetUp() override {}
};

TEST(TwoSumTest, BasicCase_Found) {
    int arr[] = {2, 7, 11, 15}; // anrange
    int size = 4; // arrange
    int target = 9; // arrange
    
    bool result = twoSum(arr, size, target); // act
    
    EXPECT_TRUE(result); // assert
}

TEST(TwoSumTest, BasicCase_NotFound) {
    int arr[] = {23, 71, 11, 14, 11};
    int size = 5;
    int target = 10;
    
    bool result = twoSum(arr, size, target);
    
    EXPECT_FALSE(result); 
}

TEST(TwoSumTest, NegativeNumbers) {
    int arr[] = {-12, -7, 11, 5, -1, 0};
    int size = 6;
    int target = -19;
    
    bool result = twoSum(arr, size, target);
    
    EXPECT_TRUE(result);  
}

TEST(TwoSumTest, EmptyArray) {
    int arr[] = {};
    int size = 0;
    int target = 5  ;
    
    bool result = twoSum(arr, size, target);
    
    EXPECT_FALSE(result); 
}




int main(int argc, char **argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}