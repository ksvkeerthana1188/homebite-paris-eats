import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseImageUploadOptions {
  bucket: 'meal-images' | 'avatars';
  folder?: string;
}

export function useImageUpload({ bucket, folder }: UseImageUploadOptions) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!file) return null;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return null;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return null;
    }

    setUploading(true);
    setProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to upload images');
        return null;
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${folder ? `${folder}/` : ''}${Date.now()}.${fileExt}`;

      setProgress(30);

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error('Failed to upload image');
        return null;
      }

      setProgress(80);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      setProgress(100);
      toast.success('Image uploaded successfully!');
      
      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return { uploadImage, uploading, progress };
}
