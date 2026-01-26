import { NewsRepository } from './news.repo';
import {
  CreateNewsDto,
  UpdateNewsDto,
  NewsDto,
  PaginationQuery,
} from './news.dto';
import { NotFoundError, ForbiddenError } from '../../common/errors';

export class NewsService {
  private repo: NewsRepository;

  constructor() {
    this.repo = new NewsRepository();
  }

  private toDto(news: any): NewsDto {
    return {
      newsId: news.newsId,
      title: news.title,
      content: news.content,
      authorId: news.authorId,
      authorName: news.authorName,
      publishedAt: news.publishedAt.toISOString(),
      createdAt: news.createdAt.toISOString(),
      updatedAt: news.updatedAt.toISOString(),
    };
  }

  async createNews(
    createDto: CreateNewsDto,
    userId: number,
    userRole: string
  ): Promise<NewsDto> {
    // Only admin can create news
    if (userRole !== 'admin') {
      throw new ForbiddenError('Only admin can create news');
    }

    const created = await this.repo.create(createDto, userId);
    const news = await this.repo.findById(created.newsId);

    return this.toDto(news);
  }

  async getAllNews(
    query: PaginationQuery
  ): Promise<{
    news: NewsDto[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
  }> {
    const { news, total } = await this.repo.findAll(query);
    const page = query.page || 1;
    const size = query.size || 10;

    return {
      news: news.map((n) => this.toDto(n)),
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  async getNewsById(newsId: number): Promise<NewsDto> {
    const news = await this.repo.findById(newsId);

    if (!news) {
      throw new NotFoundError('News');
    }

    return this.toDto(news);
  }

  async updateNews(
    newsId: number,
    updateDto: UpdateNewsDto,
    userId: number,
    userRole: string
  ): Promise<NewsDto> {
    // Only admin can update news
    if (userRole !== 'admin') {
      throw new ForbiddenError('Only admin can update news');
    }

    const existing = await this.repo.findById(newsId);

    if (!existing) {
      throw new NotFoundError('News');
    }

    await this.repo.update(newsId, updateDto);
    const updated = await this.repo.findById(newsId);

    return this.toDto(updated);
  }

  async deleteNews(
    newsId: number,
    userId: number,
    userRole: string
  ): Promise<void> {
    // Only admin can delete news
    if (userRole !== 'admin') {
      throw new ForbiddenError('Only admin can delete news');
    }

    const existing = await this.repo.findById(newsId);

    if (!existing) {
      throw new NotFoundError('News');
    }

    await this.repo.delete(newsId);
  }
}