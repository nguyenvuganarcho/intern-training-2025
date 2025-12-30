import bcrypt from 'bcrypt';
import { AuthRepository } from './auth.repo';
import {
  RegisterRequestDto,
  LoginRequestDto,
  UserResponseDto,
  AuthResponseDto,
} from './auth.dto';
import { ConflictError, UnauthorizedError } from '../../common/errors';

export class AuthService {
  private repo: AuthRepository;
  private saltRounds = 10;

  constructor() {
    this.repo = new AuthRepository();
  }

  private toUserResponseDto(user: any): UserResponseDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async register(registerDto: RegisterRequestDto): Promise<UserResponseDto> {
    if (this.repo.existsByEmail(registerDto.email)) {
      throw new ConflictError('Email already exists');
    }

    if (this.repo.existsByUsername(registerDto.username)) {
      throw new ConflictError('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, this.saltRounds);

    const user = this.repo.create(registerDto, hashedPassword);

    return this.toUserResponseDto(user);
  }

  async login(loginDto: LoginRequestDto): Promise<AuthResponseDto> {
    const user = this.repo.findByUsername(loginDto.username);

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const token = 'MOCK-TOKEN-DAY-2';

    return {
      token,
      user: this.toUserResponseDto(user),
    };
  }
}