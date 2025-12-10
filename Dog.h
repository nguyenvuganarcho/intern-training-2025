#ifndef DOG_H
#define DOG_H

#include "Animal.h"
using namespace std;

class Dog : public Animal {
    public:
    void makeSound() override;
};

#endif