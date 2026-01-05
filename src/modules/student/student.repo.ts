import { Student, CreateStudentDto, UpdateStudentDto } from "./student.dto";

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

  findById(id: number): Student | undefined {
    return this.students.find((s) => s.id === id);
  }

  update(id: number, updateDto: UpdateStudentDto): Student | undefined {
    const index = this.students.findIndex((s) => s.id === id);
    if (index === -1) return undefined;

    const student = this.students[index];

    this.students[index] = {
      id: student.id,
      name: updateDto.name ?? student.name,
      email: updateDto.email ?? student.email,
      createdAt: student.createdAt,
      updatedAt: new Date(),
    };

    return this.students[index];
  }

  delete(id: number): boolean {
    const index = this.students.findIndex((s) => s.id === id);
    if (index === -1) return false;

    this.students.splice(index, 1);
    return true;
  }
}
