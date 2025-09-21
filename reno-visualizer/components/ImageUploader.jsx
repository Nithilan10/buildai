import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import PropTypes from 'prop-types';
import styles from './ImageUploader.module.css';

const ImageUploader = ({
  onImageUpload,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes = ['image/jpeg', 'image/png', 'image/webp'],
  maxResolution = { width: 4096, height: 4096 },
  onError
}) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const validateImage = (file) => {
    return new Promise((resolve, reject) => {
      if (file.size > maxFileSize) {
        reject(`File size must be less than ${maxFileSize / 1024 / 1024}MB`);
        return;
      }

      if (!acceptedFileTypes.includes(file.type)) {
        reject('Please upload a valid image file (JPEG, PNG, or WebP)');
        return;
      }

      const img = new Image();
      img.onload = () => {
        if (img.width > maxResolution.width || img.height > maxResolution.height) {
          reject(`Image resolution must be ${maxResolution.width}x${maxResolution.height} or smaller`);
          return;
        }
        resolve();
      };
      img.onerror = () => reject('Invalid image file');
      img.src = URL.createObjectURL(file);
    });
  };

  const processFile = async (file) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      await validateImage(file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));

      setUploadProgress(100);
      clearInterval(progressInterval);

      // Call the callback with file data
      onImageUpload({
        file,
        previewUrl,
        metadata: {
          name: file.name,
          size: file.size,
          type: file.type,
          width: 0, // Would be set from actual image analysis
          height: 0
        }
      });

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);

    } catch (err) {
      setError(err);
      onError && onError(err);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      setError('Some files were rejected. Please check file type and size.');
      return;
    }

    if (acceptedFiles.length > 0) {
      processFile(acceptedFiles[0]);
    }
  }, [maxFileSize, acceptedFileTypes, maxResolution]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': acceptedFileTypes
    },
    maxSize: maxFileSize,
    multiple: false
  });

  const resetUpload = () => {
    setPreview(null);
    setError('');
    setUploadProgress(0);
    setIsUploading(false);
  };

  return (
    <div className={styles.uploaderContainer}>
      <div
        {...getRootProps()}
        className={`${styles.dropzone} ${isDragActive ? styles.active : ''} ${preview ? styles.hasPreview : ''}`}
      >
        <input {...getInputProps()} />

        {preview ? (
          <div className={styles.previewContainer}>
            <img src={preview} alt="Preview" className={styles.previewImage} />
            {isUploading && (
              <div className={styles.uploadOverlay}>
                <div className={styles.progressContainer}>
                  <div
                    className={styles.progressBar}
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className={styles.progressText}>{uploadProgress}%</span>
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetUpload();
              }}
              className={styles.resetButton}
              disabled={isUploading}
            >
              ✕
            </button>
          </div>
        ) : (
          <div className={styles.uploadContent}>
            <div className={styles.uploadIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
            </div>
            <p className={styles.uploadText}>
              {isDragActive ? 'Drop your image here' : 'Drag & drop an image here'}
            </p>
            <p className={styles.uploadSubtext}>
              or click to browse files
            </p>
            <div className={styles.requirements}>
              <p>Requirements:</p>
              <ul>
                <li>JPEG, PNG, or WebP</li>
                <li>Max {maxFileSize / 1024 / 1024}MB</li>
                <li>Up to {maxResolution.width}x{maxResolution.height}px</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
    </div>
  );
};

ImageUploader.propTypes = {
  onImageUpload: PropTypes.func.isRequired,
  maxFileSize: PropTypes.number,
  acceptedFileTypes: PropTypes.arrayOf(PropTypes.string),
  maxResolution: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number
  }),
  onError: PropTypes.func
};

export default ImageUploader;
