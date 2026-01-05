import { StudentRepository } from "./student.repo";
import {
  CreateStudentDto,
  StudentResponseDto,
  UpdateStudentDto,
} from "./student.dto";

export class StudentService {
  private repo: StudentRepository;

  constructor() {
    this.repo = new StudentRepository();
  }

  private toResponseDto(student: any): StudentResponseDto {
    return {
      id: student.id,
      name: student.name,
      email: student.email,
      createdAt: student.createdAt.toISOString(),
      updatedAt: student.updatedAt.toISOString(),
    };
  }

  async createStudent(
    createDto: CreateStudentDto
  ): Promise<StudentResponseDto> {
    const student = this.repo.create(createDto);
    return this.toResponseDto(student);
  }

  async getAllStudents(): Promise<StudentResponseDto[]> {
    const students = this.repo.findAll();
    return students.map((s) => this.toResponseDto(s));
  }

  async getStudentById(id: number): Promise<StudentResponseDto> {
    const student = this.repo.findById(id);
    return this.toResponseDto(student);
  }

  async updateStudent(
    id: number,
    updateDto: UpdateStudentDto
  ): Promise<StudentResponseDto> {
    const student = this.repo.update(id, updateDto);
    return this.toResponseDto(student);
  }

  async deleteStudent(id: number): Promise<void> {
    this.repo.delete(id);
  }
}
