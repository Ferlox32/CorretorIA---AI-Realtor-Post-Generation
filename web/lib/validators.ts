export const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png"] as const;

export function isValidImageType(file: File): boolean {
  return ACCEPTED_MIME_TYPES.includes(file.type as (typeof ACCEPTED_MIME_TYPES)[number]);
}

export function isValidSize(file: File, maxBytes: number = 10 * 1024 * 1024): boolean {
  return file.size <= maxBytes;
}

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}


