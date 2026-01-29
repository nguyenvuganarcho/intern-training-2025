import bcrypt from 'bcrypt';
import { UserRepository } from './user.repo';
import {
  CreateUserDto,
  UpdateUserDto,
  ChangePasswordDto,
  UserResponseDto,
  PaginationQuery,
} from './user.dto';
import { ConflictError, NotFoundError, UnauthorizedError } from '../../common/errors';

export class UserService {
  private repo: UserRepository;
  private saltRounds = 10;

  constructor() {
    this.repo = new UserRepository();
  }

  private toUserResponseDto(user: any): UserResponseDto {
  const response: UserResponseDto = {
    userId: user.userId,
    username: user.username,
    email: user.email,
    fullName: user.studentName || user.teacherName || null, 
    role: user.role,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
  };

  // Add student profile if exists
  if (user.studentId) {
    response.profile = {
      studentId: user.studentId,
      studentCode: user.studentCode,
      fullName: user.studentName,
      dateOfBirth: user.studentDOB ? user.studentDOB.toISOString().split('T')[0] : undefined,
      phone: user.studentPhone,
      address: user.studentAddress,
    };
  }

  // Add teacher profile if exists
  if (user.teacherId) {
    response.profile = {
      teacherId: user.teacherId,
      teacherCode: user.teacherCode,
      fullName: user.teacherName,
      dateOfBirth: user.teacherDOB ? user.teacherDOB.toISOString().split('T')[0] : undefined,
      phone: user.teacherPhone,
      address: user.teacherAddress,
    };
  }

  return response;
}

  async createUser(createDto: CreateUserDto): Promise<UserResponseDto> {
    // 1. Check username unique
    if (await this.repo.existsByUsername(createDto.username)) {
      throw new ConflictError('Username already exists');
    }

    // 2. Check email unique
    if (await this.repo.existsByEmail(createDto.email)) {
      throw new ConflictError('Email already exists');
    }

    // 3. Check student code unique (if role = student)
    if (createDto.role === 'student' && createDto.studentCode) {
      if (await this.repo.existsByStudentCode(createDto.studentCode)) {
        throw new ConflictError('Student code already exists');
      }
    }

    // 4. Check teacher code unique (if role = teacher)
    if (createDto.role === 'teacher' && createDto.teacherCode) {
      if (await this.repo.existsByTeacherCode(createDto.teacherCode)) {
        throw new ConflictError('Teacher code already exists');
      }
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(createDto.password, this.saltRounds);

    // 6. Create user
    const user = await this.repo.create(createDto, hashedPassword);

    // 7. Fetch full user data (with profile)
    const fullUser = await this.repo.findById(user.userId);

    return this.toUserResponseDto(fullUser);
  }

  async getAllUsers(
    query: PaginationQuery
  ): Promise<{ users: UserResponseDto[]; total: number; page: number; size: number; totalPages: number }> {
    const { users, total } = await this.repo.findAll(query);
    const page = query.page || 1;
    const size = query.size || 10;

    return {
      users: users.map((u) => this.toUserResponseDto(u)),
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  async getUserById(userId: number): Promise<UserResponseDto> {
    const user = await this.repo.findById(userId);

    if (!user) {
      throw new NotFoundError('User');
    }

    return this.toUserResponseDto(user);
  }

  async updateUser(userId: number, updateDto: UpdateUserDto): Promise<UserResponseDto> {
    // 1. Check user exists
    const existing = await this.repo.findById(userId);
    if (!existing) {
      throw new NotFoundError('User');
    }

    // 2. Check email unique if updating
    if (updateDto.email && (await this.repo.existsByEmail(updateDto.email, userId))) {
      throw new ConflictError('Email already exists');
    }

    // 3. Update user
    const updated = await this.repo.update(userId, updateDto);

    return this.toUserResponseDto(updated);
  }

  async deleteUser(userId: number): Promise<void> {
    const deleted = await this.repo.delete(userId);

    if (!deleted) {
      throw new NotFoundError('User');
    }
  }

  async changePassword(userId: number, dto: ChangePasswordDto): Promise<void> {
    // 1. Get user
    const user = await this.repo.findById(userId);

    if (!user) {
      throw new NotFoundError('User');
    }

    // 2. Verify current password
    const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // 3. Hash new password
    const hashedPassword = await bcrypt.hash(dto.newPassword, this.saltRounds);

    // 4. Update password
    await this.repo.updatePassword(userId, hashedPassword);
  }
}