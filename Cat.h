#ifndef CAT_H
#define CAT_H

#include "Animal.h"
using namespace std;

class Cat : public Animal {
    public:
    void makeSound() override;
};

#endif