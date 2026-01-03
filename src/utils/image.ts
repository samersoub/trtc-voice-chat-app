"use client";

export async function resizeImage(file: File, maxWidth = 512, maxHeight = 512, quality = 0.85): Promise<File> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const canvas = document.createElement("canvas");
  let { width, height } = img;

  // Keep aspect ratio, fit within max dimensions
  const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
  width = Math.round(width * ratio);
  height = Math.round(height * ratio);

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);

  const type = file.type && file.type.startsWith("image/") ? file.type : "image/jpeg";
  const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b || file), type, quality));
  return new File([blob], file.name.replace(/\.(png|jpg|jpeg|webp|gif)$/i, "") + ".jpg", { type });
}