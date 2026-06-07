import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";
import { gsap } from "gsap";

// Images from /public/images/
const IMAGES = [
  '/images/4e0bd6c5-a9c0-4aa2-9801-31ae5e768703_1818x1228.webp',
  '/images/5afc7d94-8fd5-4b37-beb2-162e47328a92_1500x1000.webp',
  '/images/c194d64b-5ee5-4e23-9f26-38c31fc4e5b9_4000x2667.webp',
  '/images/Screenshot_3-6-2026_201654_sunchicaphotography.com.jpeg',
  '/images/Screenshot_3-6-2026_20171_sunchicaphotography.com.jpeg',
  '/images/WhatsApp Image 2026-06-03 at 19.01.30 (1).jpeg',
  '/images/WhatsApp Image 2026-06-03 at 19.01.30 (2).jpeg',
  '/images/WhatsApp Image 2026-06-03 at 19.01.30 (3).jpeg',
  '/images/WhatsApp Image 2026-06-03 at 19.01.30 (5).jpeg',
  '/images/WhatsApp Image 2026-06-03 at 19.01.30 (6).jpeg',
  '/images/WhatsApp Image 2026-06-03 at 19.01.30.jpeg',
  '/images/WhatsApp Image 2026-06-03 at 19.01.31 (1).jpeg',
  '/images/WhatsApp Image 2026-06-03 at 19.01.31 (2).jpeg',
  '/images/WhatsApp Image 2026-06-03 at 19.01.31 (3).jpeg',
];

type Phase = "rushing" | "glitch" | "whiteFlash" | "holdBlack" | "fadeBlack" | "holdText" | "tvOff" | "done";

export function Tunnel({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridCanvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("rushing");
  const gridOffsetRef = useRef<number>(0);
  const glitchStartRef = useRef<number | null>(null);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 0; // Camera stays at origin, stationary

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Star particles for background
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 1000;
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i++) {
      starPositions[i] = (Math.random() - 0.5) * 200;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.15,
      transparent: true,
      opacity: 0.6,
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Image planes flying through tunnel toward camera
    const imagePlanes: THREE.Mesh[] = [];
    const textureLoader = new THREE.TextureLoader();
    const PLANE_COUNT = 30;
    const SPACING = 40; // Distance between planes
    const FAR_START = -120; // Images start far away
    const NEAR_DISTANCE = 50; // Distance at which images reach full size
    const BASE_SIZE = 6; // Base plane size
    let currentImageIndex = 0;

    console.log('Loading images:', IMAGES.length);

    for (let i = 0; i < PLANE_COUNT; i++) {
      const imagePath = IMAGES[currentImageIndex % IMAGES.length];
      currentImageIndex++;

      // Create plane geometry
      const geometry = new THREE.PlaneGeometry(BASE_SIZE, BASE_SIZE);

      // Load texture
      const texture = textureLoader.load(
        imagePath,
        (tex) => {
          console.log('Loaded texture:', imagePath);
        },
        undefined,
        (err) => {
          console.error('Failed to load texture:', imagePath, err);
        }
      );

      const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0, // Start invisible
      });

      const plane = new THREE.Mesh(geometry, material);

      // ALL images start at the far end of the tunnel (vanishing point)
      // Stagger them going FURTHER back, not closer
      // This ensures first image starts at FAR_START and travels full distance
      plane.position.z = FAR_START - (i * SPACING);

      // Position in circular pattern around tunnel center
      const angle = (i % 8) * (Math.PI / 4); // 8 positions around circle
      const radius = 5;
      plane.position.x = Math.cos(angle) * radius;
      plane.position.y = Math.sin(angle) * radius;

      // Start at near-zero scale (microscopic)
      plane.scale.set(0.001, 0.001, 0.001);

      // Face toward camera (which is at z=0)
      plane.lookAt(camera.position);

      imagePlanes.push(plane);
      scene.add(plane);
    }

    console.log('Created', imagePlanes.length, 'image planes');

    // Animation parameters
    const params = {
      speed: 0.05,  // Start slow
      passedImages: 0,
      startTime: Date.now(),
    };

    // Acceleration timeline - much more gradual
    const CALM_DURATION = 4000; // 4 seconds for first 3 images - slow & clear
    const ACCEL_DURATION = 7000; // 7 seconds to gradually reach max speed
    const MAX_SPEED_DURATION = 2000; // 2 seconds at max speed only
    const EXIT_DURATION = 2000; // 2 seconds to clear all images from screen

    // Draw perspective square corridor tunnel - like reference image
    function drawPerspectiveGrid(offset: number, glitchIntensity: number = 0) {
      const canvas = gridCanvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // VIOLENT glitch effect - extreme displacement and flickering
      const glitchOffset = glitchIntensity > 0 ? {
        x: (Math.random() - 0.5) * glitchIntensity * 300, // 3x more displacement
        y: (Math.random() - 0.5) * glitchIntensity * 300,
      } : { x: 0, y: 0 };

      // AGGRESSIVE flicker: rapid on/off
      if (glitchIntensity > 0.2 && Math.random() < glitchIntensity * 0.7) {
        return; // Much more frequent flickering
      }

      ctx.save();

      // Exploding/dispersing effect - pieces fly outward
      const explosionScale = 1 + glitchIntensity * 2;
      const explosionRotation = glitchIntensity * Math.PI * 2 * (Math.random() - 0.5);

      ctx.translate(centerX + glitchOffset.x, centerY + glitchOffset.y);
      ctx.scale(explosionScale, explosionScale);
      ctx.rotate(explosionRotation);
      ctx.translate(-centerX, -centerY);

      // Opacity reduces dramatically during glitch
      const baseOpacity = glitchIntensity > 0 ? 0.15 * (1 - glitchIntensity * 0.9) : 0.15;

      ctx.strokeStyle = `rgba(200, 200, 200, ${baseOpacity})`; // Subtle low opacity
      ctx.lineWidth = 1 + glitchIntensity * 2; // Lines get thicker during glitch

      const GRID_DIVISIONS = 12; // Number of grid divisions on each wall
      const DEPTH_LAYERS = 15; // Number of depth layers going into distance

      // Animated offset for movement toward viewer
      const animatedOffset = offset % 80;

      // Draw 4 corner lines (perspective rails)
      ctx.strokeStyle = `rgba(200, 200, 200, ${baseOpacity * 1.3})`;
      ctx.lineWidth = 1.5 + glitchIntensity * 3;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(centerX, centerY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(width, 0);
      ctx.lineTo(centerX, centerY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(centerX, centerY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(width, height);
      ctx.lineTo(centerX, centerY);
      ctx.stroke();

      // VIOLENT shatter effect: flying debris during intense glitch
      if (glitchIntensity > 0.4) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.random() * glitchIntensity})`;
        ctx.lineWidth = 2 + Math.random() * 4;

        // Flying debris - random lines shooting outward
        const debrisCount = Math.floor(glitchIntensity * 100);
        for (let i = 0; i < debrisCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const distance = glitchIntensity * 500 * Math.random();
          const startX = centerX + Math.cos(angle) * (distance * 0.3);
          const startY = centerY + Math.sin(angle) * (distance * 0.3);
          const endX = centerX + Math.cos(angle) * distance;
          const endY = centerY + Math.sin(angle) * distance;

          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }
      }

      ctx.strokeStyle = `rgba(200, 200, 200, ${baseOpacity * 0.8})`;
      ctx.lineWidth = 1;

      // Draw grid lines on all 4 walls
      for (let layer = 0; layer < DEPTH_LAYERS; layer++) {
        const depth = (layer + 1) / DEPTH_LAYERS;
        const animatedDepth = ((layer * 80) + animatedOffset) / (DEPTH_LAYERS * 80);
        const scale = 1 - (animatedDepth * 0.95); // Scale from 1.0 at edges to 0.05 at center

        if (scale <= 0) continue;

        // Calculate the square at this depth
        const halfW = (width / 2) * scale;
        const halfH = (height / 2) * scale;

        const left = centerX - halfW;
        const right = centerX + halfW;
        const top = centerY - halfH;
        const bottom = centerY + halfH;

        // Draw horizontal lines across top and bottom walls
        for (let i = 0; i <= GRID_DIVISIONS; i++) {
          const t = i / GRID_DIVISIONS;

          // Horizontal line on top wall
          const topX = left + (right - left) * t;
          ctx.beginPath();
          ctx.moveTo(topX, top);
          ctx.lineTo(centerX + (topX - centerX) * 0.05, centerY + (top - centerY) * 0.05);
          ctx.stroke();

          // Horizontal line on bottom wall
          const bottomX = left + (right - left) * t;
          ctx.beginPath();
          ctx.moveTo(bottomX, bottom);
          ctx.lineTo(centerX + (bottomX - centerX) * 0.05, centerY + (bottom - centerY) * 0.05);
          ctx.stroke();
        }

        // Draw vertical lines across left and right walls
        for (let i = 0; i <= GRID_DIVISIONS; i++) {
          const t = i / GRID_DIVISIONS;

          // Vertical line on left wall
          const leftY = top + (bottom - top) * t;
          ctx.beginPath();
          ctx.moveTo(left, leftY);
          ctx.lineTo(centerX + (left - centerX) * 0.05, centerY + (leftY - centerY) * 0.05);
          ctx.stroke();

          // Vertical line on right wall
          const rightY = top + (bottom - top) * t;
          ctx.beginPath();
          ctx.moveTo(right, rightY);
          ctx.lineTo(centerX + (right - centerX) * 0.05, centerY + (rightY - centerY) * 0.05);
          ctx.stroke();
        }

        // Draw the square outline at this depth
        ctx.strokeStyle = `rgba(200, 200, 200, ${baseOpacity})`;
        ctx.beginPath();
        ctx.moveTo(left, top);
        ctx.lineTo(right, top);
        ctx.lineTo(right, bottom);
        ctx.lineTo(left, bottom);
        ctx.lineTo(left, top);
        ctx.stroke();
        ctx.strokeStyle = `rgba(200, 200, 200, ${baseOpacity * 0.8})`;
      }

      ctx.restore();
    }

    // Animation loop
    function animate() {
      const elapsed = Date.now() - params.startTime;

      // Speed control - much more gradual acceleration
      if (elapsed < CALM_DURATION) {
        // Slow speed - first 3 images calm and clear
        params.speed = 0.12;
      } else if (elapsed < CALM_DURATION + ACCEL_DURATION) {
        // Accelerate GRADUALLY over 7 seconds
        const accelProgress = (elapsed - CALM_DURATION) / ACCEL_DURATION;
        const eased = Math.pow(accelProgress, 2.5); // Gentler curve - slower ramp
        params.speed = 0.12 + eased * 3.6; // Gradual increase to 3.72
      } else if (elapsed < CALM_DURATION + ACCEL_DURATION + MAX_SPEED_DURATION) {
        // Max speed - only at the very end
        params.speed = 3.72;
      } else if (elapsed < CALM_DURATION + ACCEL_DURATION + MAX_SPEED_DURATION + EXIT_DURATION) {
        // EXIT PHASE - hyperspeed to clear all images off screen
        params.speed = 8.0; // Very fast to push all images past camera
      } else {
        // All images cleared, trigger VIOLENT glitch before fade
        setPhase("glitch");
        if (!glitchStartRef.current) {
          glitchStartRef.current = Date.now();
        }
        const glitchElapsed = Date.now() - glitchStartRef.current;

        if (glitchElapsed > 800) {
          // Glitch done, WHITE FLASH then hard cut to black
          setPhase("whiteFlash");
          return;
        }
        // Continue with glitch effect
        params.speed = 0; // Stop movement during glitch
      }

      // Camera stays stationary - images move toward it
      // Move images forward (toward camera from far away)
      imagePlanes.forEach((plane) => {
        // Move toward camera
        plane.position.z += params.speed;

        // Calculate distance from camera
        const distanceFromCamera = Math.abs(plane.position.z - camera.position.z);

        // PERSPECTIVE SCALING: scale = constant / distance
        // This creates natural perspective - objects appear smaller as they get further
        // At far distance (1200): scale ≈ 0.04 (microscopic)
        // At near distance (50): scale = 1.0 (full size)
        // At camera position (0): scale = infinity (but clamped)
        const perspectiveScale = NEAR_DISTANCE / Math.max(distanceFromCamera, 1);
        const scaleFactor = Math.min(perspectiveScale, 1.5); // Clamp max size
        plane.scale.set(scaleFactor, scaleFactor, scaleFactor);

        // Opacity - invisible when very far, fade in as they approach
        // First 1000 units: completely invisible
        // Next 200 units: fade in gradually
        let opacity = 0;
        if (distanceFromCamera < 200) {
          opacity = 1 - (distanceFromCamera / 200); // 0 at 200, 1 at 0
        }
        (plane.material as THREE.MeshBasicMaterial).opacity = opacity;

        // Recycle when plane passes camera (exits screen)
        // BUT: stop recycling during exit phase - let all images fly out
        const inExitPhase = elapsed > CALM_DURATION + ACCEL_DURATION + MAX_SPEED_DURATION;

        if (plane.position.z > camera.position.z + 15 && !inExitPhase) {
          // Find furthest plane position
          const furthestZ = Math.min(...imagePlanes.map(p => p.position.z));

          // Teleport back to far distance
          plane.position.z = furthestZ - SPACING;

          // Change to new texture
          const newImagePath = IMAGES[currentImageIndex % IMAGES.length];
          const newTexture = textureLoader.load(newImagePath);
          (plane.material as THREE.MeshBasicMaterial).map = newTexture;
          (plane.material as THREE.MeshBasicMaterial).needsUpdate = true;
          currentImageIndex++;
          params.passedImages++;
        }

        // Keep plane facing camera
        plane.lookAt(camera.position);
      });

      // Subtle star rotation
      stars.rotation.z += 0.0002;

      // Update grid offset synchronized with tunnel speed
      gridOffsetRef.current += params.speed * 2; // Grid moves at same speed as images

      // Calculate glitch intensity - faster, more aggressive
      let glitchIntensity = 0;
      if (phase === "glitch" && glitchStartRef.current) {
        const glitchElapsed = Date.now() - glitchStartRef.current;
        glitchIntensity = Math.min(glitchElapsed / 800, 1); // 0 to 1 over 0.8s - faster!
      }

      drawPerspectiveGrid(gridOffsetRef.current, glitchIntensity);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    animate();

    // Initialize grid canvas size
    if (gridCanvasRef.current) {
      gridCanvasRef.current.width = window.innerWidth;
      gridCanvasRef.current.height = window.innerHeight;
    }

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);

      // Resize grid canvas too
      if (gridCanvasRef.current) {
        gridCanvasRef.current.width = window.innerWidth;
        gridCanvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      imagePlanes.forEach(plane => {
        plane.geometry.dispose();
        (plane.material as THREE.Material).dispose();
      });
      starGeometry.dispose();
      starMaterial.dispose();
    };
  }, []);

  // Ending phase machine
  useEffect(() => {
    if (phase === "glitch") {
      // Glitch phase handled in animation loop
      return;
    }
    if (phase === "whiteFlash") {
      // White flash for 100ms then hard cut to black
      const t = window.setTimeout(() => setPhase("holdBlack"), 100);
      return () => window.clearTimeout(t);
    }
    if (phase === "holdBlack") {
      // Hold black screen for 1 second in silence
      const t = window.setTimeout(() => setPhase("fadeBlack"), 1000);
      return () => window.clearTimeout(t);
    }
    if (phase === "fadeBlack") {
      const t = window.setTimeout(() => setPhase("holdText"), 900);
      return () => window.clearTimeout(t);
    }
    if (phase === "holdText") {
      const t = window.setTimeout(() => setPhase("tvOff"), 5000);
      return () => window.clearTimeout(t);
    }
    if (phase === "tvOff") {
      const t = window.setTimeout(() => {
        setPhase("done");
        onComplete();
      }, 950);
      return () => window.clearTimeout(t);
    }
  }, [phase, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[9000] overflow-hidden"
      style={{ pointerEvents: "all", cursor: "none" }}
      aria-hidden
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    >
      {/* Three.js canvas container */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Perspective grid overlay - transparent with only white lines */}
      <canvas
        ref={gridCanvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 10 }}
      />

      {/* White flash - system crash effect */}
      <motion.div
        className="absolute inset-0 bg-white pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === "whiteFlash" ? 1 : 0 }}
        transition={{ duration: 0 }}
      />

      {/* Black screen - hard cut after white flash */}
      <motion.div
        className="absolute inset-0 bg-black pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{
          opacity: phase === "holdBlack" || phase === "fadeBlack" || phase === "holdText" || phase === "tvOff" ? 1 : 0
        }}
        transition={{ duration: 0 }}
      />

      {/* Text layer + CRT TV-off collapse */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center bg-black"
        style={{ transformOrigin: "50% 50%" }}
        initial={{ opacity: 0, scaleX: 1, scaleY: 1 }}
        animate={
          phase === "holdText"
            ? { opacity: 1, scaleX: 1, scaleY: 1 }
            : phase === "tvOff"
              ? {
                  opacity: [1, 1, 1, 0],
                  scaleY: [1, 0.004, 0.004, 0],
                  scaleX: [1, 1, 0.001, 0],
                  boxShadow: [
                    "0 0 0 rgba(255,255,255,0)",
                    "0 0 40px 8px rgba(255,255,255,0.9)",
                    "0 0 60px 4px rgba(255,255,255,0.9)",
                    "0 0 0 rgba(255,255,255,0)",
                  ],
                }
              : phase === "fadeBlack"
                ? { opacity: 0 }
                : { opacity: 0 }
        }
        transition={
          phase === "tvOff"
            ? { duration: 0.9, times: [0, 0.45, 0.85, 1], ease: "easeInOut" }
            : { duration: 0.5, ease: "easeInOut" }
        }
      >
        <span
          className="font-serif italic text-white"
          style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
        >
          Good things don't last..
        </span>
      </motion.div>
    </motion.div>
  );
}
