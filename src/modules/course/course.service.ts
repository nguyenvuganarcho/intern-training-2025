import { CourseRepository } from './course.repo';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CourseResponseDto,
  CoursesListResponseDto,
} from './course.dto';
import { NotFoundError, ConflictError } from '../../common/errors';

export class CourseService {
  private repo: CourseRepository;

  constructor() {
    this.repo = new CourseRepository();
  }

  private toResponseDto(course: any): CourseResponseDto {
    return {
      id: course.id,
      name: course.name,
      duration: course.duration,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
    };
  }

  async createCourse(createDto: CreateCourseDto): Promise<CourseResponseDto> {
    if (this.repo.existsByName(createDto.name)) {
      throw new ConflictError(`Course with name "${createDto.name}" already exists`);
    }

    const course = this.repo.create(createDto);
    return this.toResponseDto(course);
  }

  async getAllCourses(
    page?: number,
    size?: number,
    search?: string     
  ): Promise<CoursesListResponseDto> {
    const { courses, total } = this.repo.findAll(page, size, search);

    const response: CoursesListResponseDto = {
      courses: courses.map((c) => this.toResponseDto(c)),
      total,
    };

    if (page && size) {
      response.page = page;
      response.size = size;
      response.totalPages = Math.ceil(total / size);
    }

    return response;
  }

  async getCourseById(id: number): Promise<CourseResponseDto> {
    const course = this.repo.findById(id);
    if (!course) {
      throw new NotFoundError('Course');
    }

    return this.toResponseDto(course);
  }

  async updateCourse(id: number, updateDto: UpdateCourseDto): Promise<CourseResponseDto> {
    const existing = this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError('Course');
    }

    if (updateDto.name && this.repo.existsByName(updateDto.name, id)) {
      throw new ConflictError(`Course with name "${updateDto.name}" already exists`);
    }

    const updated = this.repo.update(id, updateDto);
    if (!updated) {
      throw new NotFoundError('Course');
    }

    return this.toResponseDto(updated);
  }

  async deleteCourse(id: number): Promise<void> {
    const deleted = this.repo.delete(id);
    if (!deleted) {
      throw new NotFoundError('Course');
    }
  }
}