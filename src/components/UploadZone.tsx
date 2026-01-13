import { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  acceptedFormats?: string[];
  maxSizeMB?: number;
  className?: string;
}

export function UploadZone({
  onFileSelect,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/jpg'],
  maxSizeMB = 10,
  className,
}: UploadZoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!acceptedFormats.includes(file.type)) {
      return 'Invalid file format. Please upload JPG or PNG images only.';
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File too large. Maximum size is ${maxSizeMB}MB.`;
    }
    return null;
  };

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      setFile(file);
      onFileSelect(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [onFileSelect]
  );

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setError(null);
  };

  if (preview && file) {
    return (
      <div className={cn('relative', className)}>
        <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-800">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-contain bg-gray-50 dark:bg-gray-900"
          />
          <Button
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2"
            onClick={removeFile}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          <p className="font-medium">{file.name}</p>
          <p className="text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 transition-all duration-200 cursor-pointer hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950',
          dragActive
            ? 'border-purple-500 bg-purple-50 dark:bg-purple-950'
            : 'border-gray-300 dark:border-gray-700',
          error && 'border-red-500'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleChange}
          accept={acceptedFormats.join(',')}
        />
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center mb-4">
            {dragActive ? (
              <ImageIcon className="w-8 h-8 text-white" />
            ) : (
              <Upload className="w-8 h-8 text-white" />
            )}
          </div>
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
            {dragActive ? 'Drop your image here' : 'Drag & drop your product image'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            or click to browse
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Max {maxSizeMB}MB • JPG, PNG only
          </p>
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
