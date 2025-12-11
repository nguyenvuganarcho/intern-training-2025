#include "Tree.h"
#include <vector>
#include <iostream>

using namespace std;

void preorderTraversal(Tree* root, vector<int>& result) {
    if (root == nullptr) {
        return;
    }
    
    result.push_back(root->val);
    preorderTraversal(root->left, result);
    preorderTraversal(root->right, result);
}

void printVector(const vector<int>& vec) {
    for (int i = 0; i < vec.size(); i++) {
        cout << vec[i];
        if (i < vec.size() - 1) cout << " -> ";
    }
    cout << endl;
}

int main() {
    Tree* tree1 = new Tree(1);
    tree1->left = new Tree(2);
    tree1->right = new Tree(3);
    tree1->left->left = new Tree(4);
    tree1->left->right = new Tree(5);

    vector<int> preorder1;

    preorderTraversal(tree1, preorder1);
    printVector(preorder1);
}