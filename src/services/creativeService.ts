/**
 * Creative Space service — generate & manage creative outputs.
 */
import { apiPost, apiGet, apiDelete, API_ROUTES, type ApiResponse } from '@/lib/api';

export type OutputType =
  | 'report'
  | 'quiz'
  | 'cheatsheet'
  | 'debate'
  | 'infographic'
  | 'mind_map'
  | 'timeline'
  | 'visual_slides';

export interface CreativeOutput {
  id: string;
  output_type: OutputType;
  title: string;
  file_format: string;         // "application/pdf" | "image/png"
  file_name: string;
  file_size?: number;
  storage_file_id: string;
  chat_id: string | null;
  created_at: string;
  content?: string;            // markdown text (text tiles only; persisted in DB)
}

export interface GenerateRequest {
  chat_id: string;
  output_type: OutputType;
}

export const creativeService = {
  /**
   * Generate a creative output from a chat.
   */
  async generate(payload: GenerateRequest): Promise<ApiResponse<{ success: boolean; data: CreativeOutput }>> {
    return apiPost(API_ROUTES.CREATIVE.GENERATE, payload);
  },

  /**
   * Get all creative outputs for the current user.
   */
  async getHistory(): Promise<ApiResponse<{ success: boolean; data: CreativeOutput[] }>> {
    return apiGet(API_ROUTES.CREATIVE.HISTORY);
  },

  /**
   * Delete a creative output.
   */
  async deleteOutput(outputId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiDelete(API_ROUTES.CREATIVE.DELETE(outputId));
  },
};
