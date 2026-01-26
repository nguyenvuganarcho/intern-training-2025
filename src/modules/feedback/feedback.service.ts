import { FeedbackRepository } from './feedback.repo';
import {
  CreateFeedbackDto,
  UpdateFeedbackDto,
  FeedbackDto,
  PaginationQuery,
} from './feedback.dto';
import { NotFoundError, ForbiddenError } from '../../common/errors';

export class FeedbackService {
  private repo: FeedbackRepository;

  constructor() {
    this.repo = new FeedbackRepository();
  }

  private toDto(feedback: any): FeedbackDto {
    return {
      feedbackId: feedback.feedbackId,
      userId: feedback.userId,
      userName: feedback.userName,
      userRole: feedback.userRole,
      subject: feedback.subject,
      message: feedback.message,
      status: feedback.status,
      response: feedback.response || undefined,
      respondedBy: feedback.respondedBy || undefined,
      respondedByName: feedback.respondedByName || undefined,
      respondedAt: feedback.respondedAt ? feedback.respondedAt.toISOString() : undefined,
      createdAt: feedback.createdAt.toISOString(),
      updatedAt: feedback.updatedAt.toISOString(),
    };
  }

  async createFeedback(
    createDto: CreateFeedbackDto,
    userId: number
  ): Promise<FeedbackDto> {
    const created = await this.repo.create(createDto, userId);
    const feedback = await this.repo.findById(created.feedbackId);

    return this.toDto(feedback);
  }

  async getAllFeedbacks(
    query: PaginationQuery,
    userId: number,
    userRole: string
  ): Promise<{
    feedbacks: FeedbackDto[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
  }> {
    // If not admin, user can only see their own feedbacks
    if (userRole !== 'admin') {
      query.userId = userId;
    }

    const { feedbacks, total } = await this.repo.findAll(query);
    const page = query.page || 1;
    const size = query.size || 10;

    return {
      feedbacks: feedbacks.map((f) => this.toDto(f)),
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  async updateFeedback(
    feedbackId: number,
    updateDto: UpdateFeedbackDto,
    userId: number,
    userRole: string
  ): Promise<FeedbackDto> {
    // Only admin can update feedback
    if (userRole !== 'admin') {
      throw new ForbiddenError('Only admin can update feedback status');
    }

    const existing = await this.repo.findById(feedbackId);

    if (!existing) {
      throw new NotFoundError('Feedback');
    }

    await this.repo.update(feedbackId, updateDto, userId);
    const updated = await this.repo.findById(feedbackId);

    return this.toDto(updated);
  }
}