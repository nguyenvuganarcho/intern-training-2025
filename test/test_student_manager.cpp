#include <gtest/gtest.h>
#include "StudentManager.h"

class StudentManagerTest : public ::testing::Test {
protected:
    StudentManager manager;
    
    void SetUp() override {
    manager.addStudent(Student(101, 3.85, "Alice", "alice@email.com"));
    manager.addStudent(Student(102, 3.42, "Bob", "bob@email.com"));
    manager.addStudent(Student(103, 3.91, "Charlie", "charlie@email.com"));
    manager.addStudent(Student(104, 3.25, "David", "david@email.com"));
    manager.addStudent(Student(105, 3.78, "Emma", "emma@email.com"));
    manager.addStudent(Student(106, 3.55, "Frank", "frank@email.com"));
    manager.addStudent(Student(107, 3.91, "Grace", "grace@email.com"));
    manager.addStudent(Student(108, 3.10, "Henry", "henry@email.com"));
    manager.addStudent(Student(109, 3.67, "Anderson", "anderson@email.com"));
    manager.addStudent(Student(110, 3.88, "Jack", "jack@email.com"));
    }
};

TEST_F(StudentManagerTest, FindStudentById_Found) {
    Student* student = manager.findStudentById(105);
    
    ASSERT_NE(student, nullptr);
    EXPECT_EQ(student->getId(), 105);
    EXPECT_EQ(student->getName(), "Emma");
    EXPECT_DOUBLE_EQ(student->getGpa(), 3.78);
}

TEST_F(StudentManagerTest, FindStudentById_NotFound) {
    Student* student = manager.findStudentById(999);
    
    EXPECT_EQ(student, nullptr);
}

TEST_F(StudentManagerTest, FindStudentById_FirstStudent) {
    Student* student = manager.findStudentById(101);
    
    ASSERT_NE(student, nullptr);
    EXPECT_EQ(student->getName(), "Alice");
}

TEST_F(StudentManagerTest, FindStudentById_LastStudent) {
    Student* student = manager.findStudentById(110);
    
    ASSERT_NE(student, nullptr);
    EXPECT_EQ(student->getName(), "Jack");
}

TEST_F(StudentManagerTest, SortByName_CorrectOrder) {
    manager.sortByName();
    
    Student* s1 = manager.findStudentById(101);  // Alice
    Student* s2 = manager.findStudentById(102);  // Bob
    Student* s3 = manager.findStudentById(103);  // Charlie
    Student* s4 = manager.findStudentById(104);  // David
    Student* s5 = manager.findStudentById(105);  // Emma
    
   
    EXPECT_LT(s1->getName(), s2->getName());
    EXPECT_LT(s2->getName(), s3->getName());
    EXPECT_LT(s3->getName(), s4->getName());
    EXPECT_LT(s4->getName(), s5->getName());
}

TEST_F(StudentManagerTest, SortByName_FirstIsAlice) {
    manager.sortByName();
    
    Student* first = manager.findStudentById(101);
    ASSERT_NE(first, nullptr);
    EXPECT_EQ(first->getName(), "Alice");
}


int main(int argc, char **argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}