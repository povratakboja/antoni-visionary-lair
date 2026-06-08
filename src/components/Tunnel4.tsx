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

type Phase = "rushing" | "whiteFlash" | "pureBlack" | "holdText" | "tvOff" | "done";

export function Tunnel4({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridCanvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("rushing");
  const gridOffsetRef = useRef<number>(0);
  const lastImageExitTimeRef = useRef<number | null>(null);
  const flashTriggeredRef = useRef<boolean>(false);
  const sceneBlackenedRef = useRef<boolean>(false);

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
    const FAR_START = -160; // Images start far away
    const NEAR_DISTANCE = 50; // Distance at which images reach full size
    const BASE_SIZE = 6; // Base plane size
    let currentImageIndex = 0;

    console.log('Loading images:', IMAGES.length);

    for (let i = 0; i < PLANE_COUNT; i++) {
      const imagePath = IMAGES[currentImageIndex % IMAGES.length];
      currentImageIndex++;

      // Random tilt for natural floating feel (-8 to +8 degrees)
      const randomTilt = (Math.random() - 0.5) * 16 * (Math.PI / 180); // Convert to radians

      // Create glow plane (larger, semi-transparent white behind image)
      const glowGeometry = new THREE.PlaneGeometry(BASE_SIZE * 1.15, BASE_SIZE * 1.15);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0, // Start invisible, will sync with image
        side: THREE.DoubleSide,
      });
      const glowPlane = new THREE.Mesh(glowGeometry, glowMaterial);

      // Create white frame plane (slightly larger than image)
      const frameGeometry = new THREE.PlaneGeometry(BASE_SIZE * 1.08, BASE_SIZE * 1.08);
      const frameMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0, // Start invisible, will sync with image
        side: THREE.DoubleSide,
      });
      const framePlane = new THREE.Mesh(frameGeometry, frameMaterial);

      // Create image plane geometry
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

      // Create a group to hold all three layers (glow, frame, image)
      const imageGroup = new THREE.Group();

      // Position layers: glow furthest back, then frame, then image on top
      glowPlane.position.z = -0.02;
      framePlane.position.z = -0.01;
      plane.position.z = 0;

      // Add random tilt to the entire group
      imageGroup.rotation.z = randomTilt;

      imageGroup.add(glowPlane);
      imageGroup.add(framePlane);
      imageGroup.add(plane);

      // ALL images start at the far end of the tunnel (vanishing point)
      // Stagger them going FURTHER back, not closer
      // This ensures first image starts at FAR_START and travels full distance
      imageGroup.position.z = FAR_START - (i * SPACING);

      // Position all images in center (straight through tunnel)
      imageGroup.position.x = 0;
      imageGroup.position.y = 0;

      // Start at near-zero scale (microscopic)
      imageGroup.scale.set(0.001, 0.001, 0.001);

      // Face toward camera (which is at z=0)
      imageGroup.lookAt(camera.position);

      // Store the group as the "plane" so existing logic works
      // But also store references to individual components for opacity control
      (imageGroup as any).imageMesh = plane;
      (imageGroup as any).frameMesh = framePlane;
      (imageGroup as any).glowMesh = glowPlane;

      imagePlanes.push(imageGroup as any);
      scene.add(imageGroup);
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
    const ACCEL_DURATION = 4000; // 4 seconds to reach max speed (faster acceleration)
    const MAX_SPEED_DURATION = 2000; // 2 seconds at max speed only
    const EXIT_DURATION = 2000; // 2 seconds to clear all images from screen

    // Draw perspective square corridor tunnel - like reference image
    function drawPerspectiveGrid(offset: number, speed: number) {
      const canvas = gridCanvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Hide grid completely during flash phase and after
      if (phase !== "rushing") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      ctx.save();

      // Speed-based effects
      // Normalize speed: 0.12 (slow) to 8.0 (max) -> 0 to 1
      const speedNormalized = Math.min((speed - 0.12) / 7.88, 1);

      // Zoom effect - tunnel walls rush past faster at high speed
      const zoomScale = 1 + speedNormalized * 0.3; // Up to 30% zoom at max speed
      ctx.translate(centerX, centerY);
      ctx.scale(zoomScale, zoomScale);
      ctx.translate(-centerX, -centerY);

      // Vanishing point pulse at high speed
      const pulseAmount = speedNormalized > 0.5 ? Math.sin(Date.now() * 0.01) * speedNormalized * 3 : 0;

      const baseOpacity = 0.15;
      ctx.strokeStyle = `rgba(200, 200, 200, ${baseOpacity})`; // Subtle low opacity

      // Motion blur effect - thicker lines at high speed
      const baseLineWidth = 1 + speedNormalized * 1.5;
      ctx.lineWidth = baseLineWidth;

      const GRID_DIVISIONS = 12; // Number of grid divisions on each wall
      const DEPTH_LAYERS = 15; // Number of depth layers going into distance

      // Animated offset for movement toward viewer - accelerates with speed
      const offsetMultiplier = 1 + speedNormalized * 3; // Up to 4x faster offset at max speed
      const animatedOffset = (offset * offsetMultiplier) % 80;

      // Draw 4 corner lines (perspective rails) with motion blur streaks
      ctx.strokeStyle = `rgba(200, 200, 200, ${baseOpacity * 1.3})`;
      ctx.lineWidth = 1.5 + speedNormalized * 2; // Thicker at high speed

      // Motion blur: draw multiple overlapping lines at high speed
      const blurPasses = speedNormalized > 0.6 ? 3 : 1;
      const blurOpacity = baseOpacity * 1.3 / blurPasses;

      for (let pass = 0; pass < blurPasses; pass++) {
        const blurOffset = (pass - 1) * speedNormalized * 2;
        ctx.globalAlpha = pass === 0 ? 1 : 0.3;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(centerX + pulseAmount, centerY + pulseAmount);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(width, 0);
        ctx.lineTo(centerX + pulseAmount, centerY + pulseAmount);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(centerX + pulseAmount, centerY + pulseAmount);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(width, height);
        ctx.lineTo(centerX + pulseAmount, centerY + pulseAmount);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;

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

          // Horizontal line on top wall with motion blur
          const topX = left + (right - left) * t;
          const stretchFactor = 1 + speedNormalized * 0.05; // Elongate toward center at high speed
          ctx.beginPath();
          ctx.moveTo(topX, top);
          ctx.lineTo(centerX + (topX - centerX) * 0.05 * stretchFactor + pulseAmount, centerY + (top - centerY) * 0.05 * stretchFactor + pulseAmount);
          ctx.stroke();

          // Horizontal line on bottom wall with motion blur
          const bottomX = left + (right - left) * t;
          ctx.beginPath();
          ctx.moveTo(bottomX, bottom);
          ctx.lineTo(centerX + (bottomX - centerX) * 0.05 * stretchFactor + pulseAmount, centerY + (bottom - centerY) * 0.05 * stretchFactor + pulseAmount);
          ctx.stroke();
        }

        // Draw vertical lines across left and right walls
        for (let i = 0; i <= GRID_DIVISIONS; i++) {
          const t = i / GRID_DIVISIONS;

          // Vertical line on left wall with motion blur
          const leftY = top + (bottom - top) * t;
          const stretchFactor = 1 + speedNormalized * 0.05; // Elongate toward center at high speed
          ctx.beginPath();
          ctx.moveTo(left, leftY);
          ctx.lineTo(centerX + (left - centerX) * 0.05 * stretchFactor + pulseAmount, centerY + (leftY - centerY) * 0.05 * stretchFactor + pulseAmount);
          ctx.stroke();

          // Vertical line on right wall with motion blur
          const rightY = top + (bottom - top) * t;
          ctx.beginPath();
          ctx.moveTo(right, rightY);
          ctx.lineTo(centerX + (right - centerX) * 0.05 * stretchFactor + pulseAmount, centerY + (rightY - centerY) * 0.05 * stretchFactor + pulseAmount);
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
      // FORCE HIDE everything when flash starts - FRAME 1 INSTANT BLACKENING
      if (phase !== "rushing") {
        // Only do this ONCE at the start of the flash
        if (!sceneBlackenedRef.current) {
          sceneBlackenedRef.current = true;

          // Set scene background to pure black
          scene.background = new THREE.Color(0x000000);

          // Set renderer clear color to pure black
          renderer.setClearColor(0x000000, 1);

          // Hide ALL scene objects instantly
          scene.children.forEach(child => {
            child.visible = false;
          });

          console.log('FLASH STARTED - Scene forcefully blacked out');
        }

        // Clear grid canvas every frame
        const canvas = gridCanvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }

        // Continue animation loop but don't render anything
        requestAnimationFrame(animate);
        return;
      }

      // Make sure stars are visible during rushing phase
      stars.visible = true;

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
        // All images should be off screen - stop movement
        params.speed = 0;

        // Check if all images have exited the screen
        const allImagesExited = imagePlanes.every(plane => plane.position.z > camera.position.z + 15);
        if (allImagesExited && !lastImageExitTimeRef.current) {
          lastImageExitTimeRef.current = Date.now();
        }

        // Trigger white flash immediately when last image exits (0.5s earlier than before)
        if (lastImageExitTimeRef.current && !flashTriggeredRef.current) {
          flashTriggeredRef.current = true;
          setPhase("whiteFlash");
          return;
        }
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

        // Apply opacity to all three layers
        const imageMesh = (plane as any).imageMesh;
        const frameMesh = (plane as any).frameMesh;
        const glowMesh = (plane as any).glowMesh;

        if (imageMesh) (imageMesh.material as THREE.MeshBasicMaterial).opacity = opacity;
        if (frameMesh) (frameMesh.material as THREE.MeshBasicMaterial).opacity = opacity * 0.9; // Frame slightly less opaque
        if (glowMesh) (glowMesh.material as THREE.MeshBasicMaterial).opacity = opacity * 0.125; // Half glow intensity

        // Recycle when plane passes camera (exits screen)
        // BUT: stop recycling during exit phase - let all images fly out
        const inExitPhase = elapsed > CALM_DURATION + ACCEL_DURATION + MAX_SPEED_DURATION;

        if (plane.position.z > camera.position.z + 15 && !inExitPhase) {
          // Find furthest plane position
          const furthestZ = Math.min(...imagePlanes.map(p => p.position.z));

          // Teleport back to far distance
          plane.position.z = furthestZ - SPACING;

          // Change to new texture and apply new random tilt
          const newImagePath = IMAGES[currentImageIndex % IMAGES.length];
          const newTexture = textureLoader.load(newImagePath);
          const imageMesh = (plane as any).imageMesh;
          if (imageMesh) {
            (imageMesh.material as THREE.MeshBasicMaterial).map = newTexture;
            (imageMesh.material as THREE.MeshBasicMaterial).needsUpdate = true;
          }

          // Apply new random tilt for natural variation
          const newTilt = (Math.random() - 0.5) * 16 * (Math.PI / 180);
          plane.rotation.z = newTilt;

          currentImageIndex++;
          params.passedImages++;
        }

        // Keep plane facing camera
        plane.lookAt(camera.position);
      });

      // Update grid offset synchronized with tunnel speed - accelerates with params.speed
      const gridSpeedMultiplier = 2 + (params.speed / 8.0) * 2; // 2x at slow, up to 4x at max speed
      gridOffsetRef.current += params.speed * gridSpeedMultiplier; // Grid moves faster as speed increases

      drawPerspectiveGrid(gridOffsetRef.current, params.speed);

      // Only render scene during rushing phase
      if (phase === "rushing") {
        renderer.render(scene, camera);
      }

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
    if (phase === "rushing") {
      // Animation loop handles rushing and triggers whiteFlash
      return;
    }
    if (phase === "whiteFlash") {
      // White flash for 2 seconds then go to pure black
      const t = window.setTimeout(() => setPhase("pureBlack"), 2000);
      return () => window.clearTimeout(t);
    }
    if (phase === "pureBlack") {
      // Hold pure black for 0.9s before showing text (0.4s longer delay)
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
      {/* Three.js canvas container - forcefully hide when flash starts */}
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{
          opacity: phase === "rushing" ? 1 : 0,
          visibility: phase === "rushing" ? "visible" : "hidden",
          display: phase === "rushing" ? "block" : "none"
        }}
      />

      {/* Perspective grid overlay - forcefully hide when flash starts */}
      <canvas
        ref={gridCanvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 10,
          opacity: phase === "rushing" ? 1 : 0,
          visibility: phase === "rushing" ? "visible" : "hidden",
          display: phase === "rushing" ? "block" : "none"
        }}
      />

      {/* Dark vignette overlay for cinematic depth - only during rushing phase */}
      {phase === "rushing" && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 12,
            background: "radial-gradient(circle at center, transparent 0%, transparent 40%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.8) 100%)"
          }}
        />
      )}

      {/* White flash - cross dissolve to black, cinematic fade */}
      <motion.div
        className="absolute inset-0 bg-white pointer-events-none"
        style={{ zIndex: 20 }}
        initial={{ opacity: 0 }}
        animate={{
          opacity: phase === "whiteFlash" ? [0, 1, 1, 0] : 0
        }}
        transition={{
          duration: phase === "whiteFlash" ? 2 : 0,
          times: phase === "whiteFlash" ? [0, 0.05, 0.25, 1] : undefined,
          ease: "easeInOut"
        }}
      />

      {/* Pure black background - appears after flash ends */}
      <motion.div
        className="absolute inset-0 bg-black pointer-events-none"
        style={{ zIndex: 15 }}
        initial={{ opacity: 0 }}
        animate={{
          opacity: (phase === "pureBlack" || phase === "holdText" || phase === "tvOff") ? 1 : 0
        }}
        transition={{ duration: 0 }}
      />

      {/* Text layer + CRT TV-off collapse - only visible during holdText and tvOff phases */}
      {(phase === "holdText" || phase === "tvOff") && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transformOrigin: "50% 50%", zIndex: 25 }}
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
                : { opacity: 0 }
          }
          transition={
            phase === "tvOff"
              ? { duration: 0.9, times: [0, 0.45, 0.85, 1], ease: "easeInOut" }
              : { duration: 1, ease: "easeIn" }
          }
        >
          <span
            className="font-serif italic text-white"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
          >
            Good things don't last..
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
