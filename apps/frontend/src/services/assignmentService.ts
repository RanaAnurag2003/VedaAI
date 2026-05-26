import type {
  AssignmentDetailResponse,
  CreateAssignmentResponse,
  GenerationProgress,
  AssignmentResponse,
} from '@vedaai/shared-types';
import { api } from './api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export async function createAssignment(formData: FormData): Promise<CreateAssignmentResponse> {
  const { data } = await api.post<ApiResponse<CreateAssignmentResponse>>(
    '/assignments/create',
    formData,
  );
  return data.data;
}

export async function getAssignment(id: string): Promise<AssignmentDetailResponse> {
  const { data } = await api.get<ApiResponse<AssignmentDetailResponse>>(`/assignments/${id}`);
  return data.data;
}

export async function getAssignmentStatus(id: string): Promise<GenerationProgress> {
  const { data } = await api.get<ApiResponse<GenerationProgress>>(`/assignments/${id}/status`);
  return data.data;
}

export async function regenerateAssignment(id: string): Promise<CreateAssignmentResponse> {
  const { data } = await api.post<ApiResponse<CreateAssignmentResponse>>(
    `/assignments/${id}/regenerate`,
  );
  return data.data;
}

export async function listAssignments(): Promise<AssignmentResponse[]> {
  const { data } = await api.get<ApiResponse<AssignmentResponse[]>>('/assignments');
  return data.data;
}

export async function deleteAssignment(id: string): Promise<void> {
  await api.delete(`/assignments/${id}`);
}
