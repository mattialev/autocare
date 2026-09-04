update storage.buckets
set
  file_size_limit = 52428800,
  allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
  public = false
where id = 'vehicle-documents';
