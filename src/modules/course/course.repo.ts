import { Course, CreateCourseDto, UpdateCourseDto } from './course.dto';

export class CourseRepository {
  private courses: Course[] = [];
  private currentId = 1;

  create(createDto: CreateCourseDto): Course {
    const now = new Date();
    const course: Course = {
      id: this.currentId++,
      name: createDto.name,
      duration: createDto.duration,
      createdAt: now,
      updatedAt: now,
    };

    this.courses.push(course);
    return course;
  }

  findAll(page?: number, size?: number, search?: string): { courses: Course[]; total: number } {
    let filtered = [...this.courses];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((c) =>
        c.name.toLowerCase().includes(searchLower)
      );
    }

    const total = filtered.length;

    if (page && size) {
      const start = (page - 1) * size;
      const end = start + size;
      filtered = filtered.slice(start, end);
    }

    return { courses: filtered, total };
  }

  findById(id: number): Course | undefined {
    return this.courses.find((c) => c.id === id);
  }

  update(id: number, updateDto: UpdateCourseDto): Course | undefined {
    const index = this.courses.findIndex((c) => c.id === id);
    if (index === -1) return undefined;

    const existing = this.courses[index];
    
    const updated: Course = {
      id: existing.id,
      name: updateDto.name !== undefined ? updateDto.name : existing.name,
      duration: updateDto.duration !== undefined ? updateDto.duration : existing.duration,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    };

    this.courses[index] = updated;
    return updated;
  }

  delete(id: number): boolean {
    const index = this.courses.findIndex((c) => c.id === id);
    if (index === -1) return false;

    this.courses.splice(index, 1);
    return true;
  }

  existsByName(name: string, excludeId?: number): boolean {
    return this.courses.some(
      (c) => c.name.toLowerCase() === name.toLowerCase() && c.id !== excludeId
    );
  }
}