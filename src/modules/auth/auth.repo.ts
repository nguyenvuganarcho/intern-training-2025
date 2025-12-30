import { User, RegisterRequestDto, UserRole } from './auth.dto';

export class AuthRepository {
  private users: User[] = [];
  private currentId = 1;

  create(registerDto: RegisterRequestDto, hashedPassword: string): User {
    const now = new Date();
    const user: User = {
      id: this.currentId++,
      username: registerDto.username,
      email: registerDto.email,
      password: hashedPassword,
      role: registerDto.role || UserRole.USER,
      createdAt: now,
      updatedAt: now,
    };

    this.users.push(user);
    return user;
  }

  findByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findByUsername(username: string): User | undefined {
    return this.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  }

  findById(id: number): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  existsByEmail(email: string): boolean {
    return this.users.some((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  existsByUsername(username: string): boolean {
    return this.users.some((u) => u.username.toLowerCase() === username.toLowerCase());
  }
}