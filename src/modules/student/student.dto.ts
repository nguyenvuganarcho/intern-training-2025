export interface Student {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStudentDto {
  name: string;
  email: string;
}

export interface StudentResponseDto {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}