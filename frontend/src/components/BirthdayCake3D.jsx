import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const BirthdayCake3D = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const canvas = mountRef.current;
    if (!canvas) return;

    // Dimensions
    let width = canvas.clientWidth || 300;
    let height = canvas.clientHeight || 300;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 12);
    camera.lookAt(0, 1.2, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const candleLight = new THREE.PointLight(0xfbbf24, 2, 8);
    candleLight.position.set(0, 3.2, 0);
    scene.add(candleLight);

    // 5. Cake Group
    const cakeGroup = new THREE.Group();

    // Bottom Layer
    const botGeo = new THREE.CylinderGeometry(3, 3, 1.5, 32);
    const botMat = new THREE.MeshStandardMaterial({ 
      color: 0x7c3aed, // Purple Aurora
      roughness: 0.1,
      metalness: 0.1,
      flatShading: false
    });
    const bottomCake = new THREE.Mesh(botGeo, botMat);
    bottomCake.position.y = 0.75;
    cakeGroup.add(bottomCake);

    // Top Layer
    const topGeo = new THREE.CylinderGeometry(2, 2, 1.2, 32);
    const topMat = new THREE.MeshStandardMaterial({ 
      color: 0xec4899, // Pink Glow
      roughness: 0.1,
      metalness: 0.1
    });
    const topCake = new THREE.Mesh(topGeo, topMat);
    topCake.position.y = 2.1;
    cakeGroup.add(topCake);

    // Cream Frosting Drops (Decorative spheres around cake rim)
    const creamMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    const creamGeo = new THREE.SphereGeometry(0.18, 16, 16);
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const cream = new THREE.Mesh(creamGeo, creamMat);
      cream.position.set(Math.cos(angle) * 1.9, 2.7, Math.sin(angle) * 1.9);
      cakeGroup.add(cream);
    }

    // Candle Stand
    const candleGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 16);
    const candleMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.3 }); // Golden Stripe
    const candle = new THREE.Mesh(candleGeo, candleMat);
    candle.position.set(0, 3.3, 0);
    cakeGroup.add(candle);

    // Wick
    const wickGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.2, 8);
    const wickMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const wick = new THREE.Mesh(wickGeo, wickMat);
    wick.position.set(0, 3.95, 0);
    cakeGroup.add(wick);

    // Flame (Cone)
    const flameGeo = new THREE.ConeGeometry(0.16, 0.45, 16);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffa500 });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.set(0, 4.2, 0);
    cakeGroup.add(flame);

    // Add Cake to Scene
    scene.add(cakeGroup);

    // Animate Loop
    let animationId;
    let clock = new THREE.Clock();

    const animate = () => {
      // Rotate cake
      cakeGroup.rotation.y += 0.012;
      
      // Flickering flame effect (oscillate scale)
      const elapsedTime = clock.getElapsedTime();
      const scaleVal = 1 + Math.sin(elapsedTime * 15) * 0.15;
      flame.scale.set(scaleVal, scaleVal * 1.2, scaleVal);
      
      // Flickering candlelight intensity
      candleLight.intensity = 2 + Math.sin(elapsedTime * 25) * 0.4;

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      const w = canvas.clientWidth || 300;
      const h = canvas.clientHeight || 300;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      botGeo.dispose();
      botMat.dispose();
      topGeo.dispose();
      topMat.dispose();
      creamGeo.dispose();
      creamMat.dispose();
      candleGeo.dispose();
      candleMat.dispose();
      wickGeo.dispose();
      wickMat.dispose();
      flameGeo.dispose();
      flameMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative flex items-center justify-center w-full max-w-[300px] aspect-square">
      {/* 3D Canvas */}
      <canvas ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing block" />
      
      {/* Ambient shadow/glow below cake */}
      <div className="absolute bottom-6 w-32 h-4 bg-purple-500/20 rounded-full blur-md -z-10 animate-pulse" />
    </div>
  );
};

export default BirthdayCake3D;
