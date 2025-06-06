
import { createClient } from '@supabase/supabase-js';
// import { Database } from './types_db'; // Assuming you generate types from your Supabase schema

// Updated Supabase project URL and Anon Key
const supabaseUrl = 'https://rdfwwlyfhnhkusvmqjsq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZnd3bHlmaG5oa3Vzdm1xanNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNzc3MTAsImV4cCI6MjA2NDc1MzcxMH0.nKj8g3HAGjnB1XTrB3txZYCn9JGWPBNiCMaOB-B1R8c';

// If you have generated types for your database (recommended), use them here.
// Otherwise, you can use <any> or a more generic type.
// Example: export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
// For now, using a generic type as Database types might not be set up by the user yet.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to get public URL for Supabase storage items
export const getStoragePublicUrl = (bucketName: string, filePath: string): string | null => {
  if (!filePath) return null;
  
  // Assuming filePath is the correct path within the bucket (e.g., "public/filename.png" or "filename.png")
  // This path is what supabase.storage.from(bucketName).getPublicUrl() expects.
  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  
  return data?.publicUrl || null;
};
