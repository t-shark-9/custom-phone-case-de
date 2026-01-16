import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface Model3DViewerProps {
  modelPath: string;
  title: string;
}

export function Model3DViewer({ modelPath, title }: Model3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 100);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(1, 1, 1);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-1, -1, -1);
    scene.add(directionalLight2);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Load GLTF model
    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;

        // Center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        // Create material with nice colors
        const material = new THREE.MeshPhongMaterial({
          color: 0x3b82f6,
          specular: 0x111111,
          shininess: 200,
          flatShading: false,
        });

        // Apply material to all meshes
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = material;
          }
        });
        
        // Auto-scale to fit in view
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 80 / maxDim;
        model.scale.setScalar(scale);

        scene.add(model);

        // Add grid helper
        const gridHelper = new THREE.GridHelper(200, 20, 0xcccccc, 0xeeeeee);
        scene.add(gridHelper);
      },
      (progress) => {
        if (progress.total > 0) {
          console.log(`Loading: ${(progress.loaded / progress.total) * 100}%`);
        }
      },
      (error) => {
        console.error('Error loading GLTF:', error);
      }
    );

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      controls.dispose();
    };
  }, [modelPath]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={containerRef}
          className="w-full h-[500px] rounded-lg overflow-hidden border border-gray-200"
        />
        <p className="mt-2 text-sm text-gray-600">
          Nutze Maus zum Drehen • Scroll zum Zoomen • Rechtsklick zum Verschieben
        </p>
      </CardContent>
    </Card>
  );
}
