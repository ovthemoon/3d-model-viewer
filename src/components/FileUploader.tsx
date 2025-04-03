import React, { useRef, useState } from 'react';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div 
      style={{
        border: `2px dashed ${isDragging ? '#4a90e2' : '#ccc'}`,
        borderRadius: '4px',
        padding: '2rem',
        textAlign: 'center',
        cursor: 'pointer',
        background: isDragging ? 'rgba(74, 144, 226, 0.1)' : 'transparent',
        transition: 'all 0.3s ease'
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleButtonClick}
    >
      <div>
        <p style={{ margin: '0 0 1rem 0' }}>
          <strong>Drag & Drop</strong> your 3D model here
        </p>
        <p style={{ margin: '0 0 1rem 0' }}>or</p>
        <button 
          style={{
            background: '#4a90e2',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Select File
        </button>
        <p style={{ margin: '1rem 0 0 0', fontSize: '0.8rem', color: '#666' }}>
          Supported formats: .gltf, .glb, .obj
        </p>
      </div>
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange} 
        accept=".gltf,.glb,.obj"
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default FileUploader;
