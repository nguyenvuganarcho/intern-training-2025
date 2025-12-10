#DAY2CODE
##Pseudocode
Class Animal
Tạo abstract function makeSound()
Class Dog, Cat kết thừa Animal
Tạo function makeSound() override

Implement Stack bằng vector
tạo các function của stack dùng bult-in function của vector
push(int value): để add value lên đầu stack, sử dụng push_back
pop(): remove element ở đầu stack, sử dụng pop_back
size(): sử dụng size để trả về size của stack
peek(): xem element đầu của stack
isEmpty(): kiểm tra xem stack có trống ko, sử dụng emtpy built-in function của vector
findMax() {
    initialize element đầu là max 
    loop qua stack
    element > max => max = element
    return max
}

findDuplicates() {
    check isEmpty
    dùng sort built-in function để sort Stack
    while qua element
    đếm duplicates
    print ra kết quả
}

checkForPalinDrome() {
    so sánh 2 đầu của Stack
    nếu khác => false
}

twoSum(int sum) {
    dùng 2 loop để tìm tổng 2 element = sum
    tránh trường hợp tìm tổng của cùng 1 element (eg. data[1] + data[1])
}

print(): cout ra các phần tử trong vector từ top -> bottom, dùng cho testing