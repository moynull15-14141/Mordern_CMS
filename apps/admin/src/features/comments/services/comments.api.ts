import { api, type PaginatedResponse } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type {
  ApproveCommentInput,
  Comment,
  CommentFilters,
  CommentTree,
  CreateCommentInput,
  RejectCommentInput,
  SpamCommentInput,
  UpdateCommentInput,
} from '../types/comment';

export const commentsApi = {
  list(filters: CommentFilters): Promise<PaginatedResponse<Comment[]>> {
    return api.getPaginated<Comment[]>(API_ENDPOINTS.COMMENTS, { params: filters });
  },

  get(id: string): Promise<Comment> {
    return api.get<Comment>(`${API_ENDPOINTS.COMMENTS}/${id}`);
  },

  replies(commentId: string, filters: CommentFilters): Promise<PaginatedResponse<Comment[]>> {
    return api.getPaginated<Comment[]>(`${API_ENDPOINTS.COMMENTS}/${commentId}/replies`, {
      params: filters,
    });
  },

  articleComments(articleId: string, filters: CommentFilters): Promise<PaginatedResponse<Comment[]>> {
    return api.getPaginated<Comment[]>(`${API_ENDPOINTS.ARTICLES.byId(articleId)}/comments`, {
      params: filters,
    });
  },

  articleTree(articleId: string): Promise<CommentTree[]> {
    return api.get<CommentTree[]>(`${API_ENDPOINTS.ARTICLES.byId(articleId)}/comments/tree`);
  },

  userComments(userId: string, filters: CommentFilters): Promise<PaginatedResponse<Comment[]>> {
    return api.getPaginated<Comment[]>(`${API_ENDPOINTS.USERS.byId(userId)}/comments`, {
      params: filters,
    });
  },

  create(input: CreateCommentInput): Promise<Comment> {
    return api.post<Comment>(API_ENDPOINTS.COMMENTS, input);
  },

  update(id: string, input: UpdateCommentInput): Promise<Comment> {
    return api.patch<Comment>(`${API_ENDPOINTS.COMMENTS}/${id}`, input);
  },

  remove(id: string): Promise<Comment> {
    return api.delete<Comment>(`${API_ENDPOINTS.COMMENTS}/${id}`);
  },

  restore(id: string): Promise<Comment> {
    return api.post<Comment>(`${API_ENDPOINTS.COMMENTS}/${id}/restore`);
  },

  approve(id: string, input: ApproveCommentInput): Promise<Comment> {
    return api.post<Comment>(`${API_ENDPOINTS.COMMENTS}/${id}/approve`, input);
  },

  reject(id: string, input: RejectCommentInput): Promise<Comment> {
    return api.post<Comment>(`${API_ENDPOINTS.COMMENTS}/${id}/reject`, input);
  },

  spam(id: string, input: SpamCommentInput): Promise<Comment> {
    return api.post<Comment>(`${API_ENDPOINTS.COMMENTS}/${id}/spam`, input);
  },
};
