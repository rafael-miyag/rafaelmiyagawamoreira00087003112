import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string | null;
  onChange: (file: File | null) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  error?: string;
  maxSizeMB?: number;
}

export default function ImageUpload({
  value,
  onChange,
  className,
  size = 'md',
  error,
  maxSizeMB = 5,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sizes = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
  };

  const handleFileSelect = useCallback(
    (file: File | null) => {
      if (!file) {
        setPreview(null);
        onChange(null);
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setUploadError('Arquivo deve ser uma imagem');
        return;
      }

      // Validate file size
      const maxSize = maxSizeMB * 1024 * 1024;
      if (file.size > maxSize) {
        setUploadError(`Arquivo deve ter no máximo ${maxSizeMB}MB`);
        return;
      }

      setUploadError(null);

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      onChange(file);
    },
    [onChange, maxSizeMB]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0] || null;
      handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const displayError = uploadError || error;

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative rounded-lg border-2 border-dashed cursor-pointer transition-colors overflow-hidden',
          sizes[size],
          dragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400',
          displayError && 'border-red-500'
        )}
      >
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X className="w-3 h-3" />
            </button>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            {dragOver ? (
              <Upload className="w-8 h-8" />
            ) : (
              <ImageIcon className="w-8 h-8" />
            )}
            <span className="text-xs mt-1">Upload</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {displayError && <p className="text-sm text-red-500">{displayError}</p>}
    </div>
  );
}
