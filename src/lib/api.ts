import { supabase } from './supabase';

const N8N_API_URL = import.meta.env.VITE_N8N_API_URL || 'https://your-n8n-instance.com';

export interface GenerateVideoOptions {
  productName: string;
  productDescription?: string;
  ugcType: string;
  targetAudience: string;
  duration: string;
  platform: string;
}

export interface GenerateVideoResponse {
  success: boolean;
  jobId: string;
  message: string;
}

export interface JobStatusResponse {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress_percentage: number;
  current_step?: string;
  video_url?: string;
  thumbnail_url?: string;
  character_model?: {
    age: number;
    gender: string;
    style: string;
  };
  error_message?: string;
}

export async function generateVideo(
  imageFile: File,
  options: GenerateVideoOptions
): Promise<GenerateVideoResponse> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Not authenticated');
  }

  const formData = new FormData();
  formData.append('productImage', imageFile);
  formData.append('productName', options.productName);
  formData.append('productDescription', options.productDescription || '');
  formData.append('ugcType', options.ugcType);
  formData.append('targetAudience', options.targetAudience);
  formData.append('duration', options.duration);
  formData.append('platform', options.platform);

  const response = await fetch(`${N8N_API_URL}/v1/generate-ugc`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Failed to generate video',
    }));
    throw new Error(error.message || 'Failed to generate video');
  }

  return await response.json();
}

export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${N8N_API_URL}/v1/job-status/${jobId}`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch job status');
  }

  return await response.json();
}

export async function uploadProductImage(file: File): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Not authenticated');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file);

  if (error) {
    throw error;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('product-images').getPublicUrl(data.path);

  return publicUrl;
}
