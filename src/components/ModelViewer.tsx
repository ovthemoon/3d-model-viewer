import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

interface ModelViewerProps {
  file: File | null;
}

const ModelViewer: React.FC<ModelViewerProps> = ({ file }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameIdRef = useRef<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Setup scene, camera, renderer
  useEffect(() => {
    if (!containerRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);

    // Add grid helper
    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controlsRef.current = controls;

    // Animation loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameIdRef.current);
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      if (sceneRef.current) {
        sceneRef.current.clear();
      }
    };
  }, []);

  // Load model when file changes
  useEffect(() => {
    if (!file || !sceneRef.current) return;

    setLoading(true);
    setError(null);

    // Clear previous model
    if (sceneRef.current) {
      sceneRef.current.children = sceneRef.current.children.filter(
        child => child.type === 'AmbientLight' || 
                child.type === 'DirectionalLight' || 
                child.type === 'GridHelper'
      );
    }

    const fileURL = URL.createObjectURL(file);
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension === 'gltf' || fileExtension === 'glb') {
      // Load GLTF/GLB model
      const loader = new GLTFLoader();
      
      loader.load(
        fileURL,
        (gltf) => {
          if (sceneRef.current) {
            sceneRef.current.add(gltf.scene);
            
            // Center model and adjust camera
            const box = new THREE.Box3().setFromObject(gltf.scene);
            const center = box.getCenter(new THREE.Vector3());
            gltf.scene.position.x = -center.x;
            gltf.scene.position.y = -center.y;
            gltf.scene.position.z = -center.z;
            
            const size = box.getSize(new THREE.Vector3()).length();
            
            if (cameraRef.current) {
              const distance = size / Math.tan(Math.PI * cameraRef.current.fov / 360) * 1.2;
              cameraRef.current.position.z = distance;
              cameraRef.current.updateProjectionMatrix();
            }
            
            setLoading(false);
          }
        },
        (xhr) => {
          // Progress callback if needed
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
        },
        (error) => {
          console.error('Error loading GLTF model:', error);
          setError('Failed to load model. Please try again with a different file.');
          setLoading(false);
        }
      );
    } else if (fileExtension === 'obj') {
      // Load OBJ model
      const loader = new OBJLoader();
      
      loader.load(
        fileURL,
        (obj) => {
          if (sceneRef.current) {
            sceneRef.current.add(obj);
            
            // Center model and adjust camera
            const box = new THREE.Box3().setFromObject(obj);
            const center = box.getCenter(new THREE.Vector3());
            obj.position.x = -center.x;
            obj.position.y = -center.y;
            obj.position.z = -center.z;
            
            const size = box.getSize(new THREE.Vector3()).length();
            
            if (cameraRef.current) {
              const distance = size / Math.tan(Math.PI * cameraRef.current.fov / 360) * 1.2;
              cameraRef.current.position.z = distance;
              cameraRef.current.updateProjectionMatrix();
            }
            
            setLoading(false);
          }
        },
        (xhr) => {
          // Progress callback if needed
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
        },
        (error) => {
          console.error('Error loading OBJ model:', error);
          setError('Failed to load model. Please try again with a different file.');
          setLoading(false);
        }
      );
    } else {
      setError('Unsupported file format. Please use .gltf, .glb, or .obj files.');
      setLoading(false);
    }

    // Cleanup
    return () => {
      URL.revokeObjectURL(fileURL);
    };
  }, [file]);

  return (
    <div style={{ position: 'relative' }}>
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '500px', 
          border: '1px solid #ccc',
          borderRadius: '4px',
        }}
      />
      
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255, 255, 255, 0.8)',
          padding: '1rem',
          borderRadius: '4px'
        }}>
          Loading model...
        </div>
      )}
      
      {error && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255, 0, 0, 0.1)',
          color: 'red',
          padding: '1rem',
          borderRadius: '4px',
          border: '1px solid red'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default ModelViewer;
