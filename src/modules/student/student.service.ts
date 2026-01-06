import { StudentRepository } from './student.repo';
import { CreateStudentDto, UpdateStudentDto, StudentResponseDto } from './student.dto';
import { NotFoundError, ConflictError } from '../../common/errors';

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

  async createStudent(createDto: CreateStudentDto): Promise<StudentResponseDto> {
    // Check email unique
    if (this.repo.existsByEmail(createDto.email)) {
      throw new ConflictError('Email already exists');
    }

    const student = this.repo.create(createDto);
    return this.toResponseDto(student);
  }

  async getAllStudents(
    page?: number,
    size?: number,
    search?: string
  ): Promise<{ students: StudentResponseDto[]; total: number; page?: number; size?: number; totalPages?: number }> {
    const { students, total } = this.repo.findAll(page, size, search);

    const response = {
      students: students.map((s) => this.toResponseDto(s)),
      total,
      ...(page && size && {
        page,
        size,
        totalPages: Math.ceil(total / size),
      }),
    };

    return response;
  }

  async getStudentById(id: number): Promise<StudentResponseDto> {
    const student = this.repo.findById(id);
    if (!student) {
      throw new NotFoundError('Student');
    }
    return this.toResponseDto(student);
  }

  async updateStudent(id: number, updateDto: UpdateStudentDto): Promise<StudentResponseDto> {
    const existing = this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError('Student');
    }

    // Check email unique if updating email
    if (updateDto.email && this.repo.existsByEmail(updateDto.email, id)) {
      throw new ConflictError('Email already exists');
    }

    const student = this.repo.update(id, updateDto);
    if (!student) {
      throw new NotFoundError('Student');
    }
    return this.toResponseDto(student);
  }

  async deleteStudent(id: number): Promise<void> {
    const deleted = this.repo.delete(id);
    if (!deleted) {
      throw new NotFoundError('Student');
    }
  }
}