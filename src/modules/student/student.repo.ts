import { Student, CreateStudentDto } from './student.dto';

export class StudentRepository {
  private students: Student[] = [];
  private currentId = 1;

  create(createDto: CreateStudentDto): Student {
    const now = new Date();
    const student: Student = {
      id: this.currentId++,
      name: createDto.name,
      email: createDto.email,
      createdAt: now,
      updatedAt: now,
    };

    this.students.push(student);
    return student;
  }

  findAll(): Student[] {
    return this.students;
  }
}