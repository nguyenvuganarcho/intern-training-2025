export interface NewsDto {
  newsId: number;
  title: string;
  content: string;
  authorId: number;
  authorName: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNewsDto {
  title: string;
  content: string;
}

export interface UpdateNewsDto {
  title: string;
  content: string;
}

export interface PaginationQuery {
  page?: number;
  size?: number;
  search?: string;
}