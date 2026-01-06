import { Student, CreateStudentDto, UpdateStudentDto } from './student.dto';

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

  findAll(page?: number, size?: number, search?: string): { students: Student[]; total: number } {
    let filtered = [...this.students];

    // Search by name or email
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchLower) ||
          s.email.toLowerCase().includes(searchLower)
      );
    }

    const total = filtered.length;

    // Pagination
    if (page && size) {
      const start = (page - 1) * size;
      const end = start + size;
      filtered = filtered.slice(start, end);
    }

    return { students: filtered, total };
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

  existsByEmail(email: string, excludeId?: number): boolean {
    return this.students.some(
      (s) => s.email.toLowerCase() === email.toLowerCase() && s.id !== excludeId
    );
  }
}