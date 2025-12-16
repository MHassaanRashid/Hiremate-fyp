"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Upload } from "lucide-react";

interface FileUploadWithPreviewProps {
  label?: string;
  initialUrl?: string | null;
  onFileSelected?: (file: File) => Promise<string | void> | void;
}

export function FileUploadWithPreview({
  label = "Profile picture",
  initialUrl,
  onFileSelected,
}: FileUploadWithPreviewProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl || null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSelect = async (file: File) => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    if (onFileSelected) {
      setIsUploading(true);
      try {
        await onFileSelected(file);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-16 w-16 rounded-full overflow-hidden bg-blue-50 flex items-center justify-center text-blue-600 font-semibold">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Profile preview"
            fill
            className="object-cover"
          />
        ) : (
          <span>HM</span>
        )}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">Upload a clear, professional headshot.</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700"
          >
            <Upload className="w-3 h-3" />
            Upload
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleSelect(file);
            }}
          />
        </div>
      </div>
    </div>
  );
}
