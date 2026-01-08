"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Box, Typography, IconButton, Paper } from "@mui/material";
import { PhotoCamera, Close, CloudUpload, Image } from "@mui/icons-material";

interface ImageUploadProps {
  value?: string | null;
  onChange: (file: File | null, previewUrl: string | null) => void;
  label?: string;
  size?: number;
  disabled?: boolean;
  error?: string;
}

export function ImageUpload({
  value,
  onChange,
  label = "画像を選択",
  size = 120,
  disabled = false,
  error,
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviewUrl(value || null);
  }, [value]);

  const validateFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

    if (!allowedTypes.includes(file.type)) {
      return 'JPEGまたはPNG形式の画像のみアップロードできます。';
    }

    if (file.size > maxSize) {
      return '画像サイズは5MB以下にしてください。';
    }

    return null;
  };

  const processFile = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      // エラーハンドリングは親コンポーネントで
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
      onChange(file, result);
    };
    reader.readAsDataURL(file);
  }, [onChange]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(event.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile) {
      processFile(imageFile);
    }
  }, [disabled, processFile]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleRemove = () => {
    setPreviewUrl(null);
    onChange(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          width: size + 40,
          height: size + 40,
          borderRadius: 2,
          border: `2px dashed ${isDragOver ? '#8B0000' : previewUrl ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.2)'}`,
          backgroundColor: isDragOver ? 'rgba(139, 0, 0, 0.1)' : previewUrl ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: disabled ? 'default' : 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': disabled ? {} : {
            borderColor: '#8B0000',
            backgroundColor: 'rgba(139, 0, 0, 0.05)',
          },
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        {previewUrl ? (
          <>
            <Box
              component="img"
              src={previewUrl}
              sx={{
                width: size,
                height: size,
                borderRadius: 1,
                objectFit: 'cover',
              }}
              alt="プレビュー"
            />
            {!disabled && (
              <IconButton
                size="small"
                sx={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  bgcolor: '#8B0000',
                  color: 'white',
                  boxShadow: 2,
                  '&:hover': {
                    bgcolor: '#A52A2A',
                  },
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            )}
          </>
        ) : (
          <Box sx={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)' }}>
            {isDragOver ? (
              <CloudUpload sx={{ fontSize: 40, mb: 1, color: '#8B0000' }} />
            ) : (
              <Image sx={{ fontSize: 40, mb: 1 }} />
            )}
            <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
              {isDragOver ? 'ドロップしてアップロード' : label}
            </Typography>
          </Box>
        )}
      </Paper>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={disabled}
      />

      {error && (
        <Typography variant="caption" sx={{ color: '#f44336', textAlign: 'center' }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
