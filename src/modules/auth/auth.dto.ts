export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN'
}

export interface User {
    id: number;
    username: string;
    email: string;
    password: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

export interface RegisterRequestDto {
    username: string;
    email: string;
    password: string;
    role?: UserRole;
}

export interface LoginRequestDto {
    username: string;
    password: string;
}

export interface UserResponseDto {
    id: number;
    username: string;
    email: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthResponseDto {
    token: String;
    user: UserResponseDto;
}
