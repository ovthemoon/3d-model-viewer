import React, { useState } from 'react';
import './App.css';
import ModelViewer from './components/ModelViewer';
import FileUploader from './components/FileUploader';

function App() {
  const [modelFile, setModelFile] = useState<File | null>(null);

  const handleFileUpload = (file: File) => {
    setModelFile(file);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>3D Model Viewer</h1>
        <p>Upload and view 3D models in your browser</p>
      </header>
      
      <main style={{ 
        padding: '2rem', 
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        {!modelFile && (
          <div style={{ marginBottom: '2rem' }}>
            <FileUploader onFileUpload={handleFileUpload} />
          </div>
        )}
        
        {modelFile && (
          <div>
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>
                Viewing: {modelFile.name}
              </h2>
              <button
                onClick={() => setModelFile(null)}
                style={{
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Close Model
              </button>
            </div>
            <ModelViewer file={modelFile} />
          </div>
        )}
      </main>
      
      <footer style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        borderTop: '1px solid #eee',
        textAlign: 'center',
        color: '#666'
      }}>
        <p>Created with React, TypeScript, and Three.js</p>
      </footer>
    </div>
  );
}

export default App;
