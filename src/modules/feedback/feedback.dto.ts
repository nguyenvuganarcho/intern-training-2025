export interface FeedbackDto {
  feedbackId: number;
  userId: number;
  userName: string;
  userRole: string;
  subject: string;
  message: string;
  status: 'pending' | 'reviewed' | 'resolved';
  response?: string;
  respondedBy?: number;
  respondedByName?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeedbackDto {
  subject: string;
  message: string;
}

export interface UpdateFeedbackDto {
  status: 'pending' | 'reviewed' | 'resolved';
  response?: string;
}

export interface PaginationQuery {
  page?: number;
  size?: number;
  status?: string;
  userId?: number;
}