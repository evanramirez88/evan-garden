<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
  import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
  import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
  import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

  let container: HTMLDivElement;
  let tooltip = $state({ visible: false, text: '', x: 0, y: 0 });
  let isReducedMotion = $state(false);

  // Colors from design system
  const AMBER = 0xD4A574;
  const TERRACOTTA = 0xC4725B;
  const BACKGROUND = 0x121212;
  const TEXT_PRIMARY = 0xF5F0E8;

  // Stock definitions (nodes in the system)
  const stocks = [
    { name: 'Resources', position: [0, 0, 0], color: AMBER, description: 'Available inputs and capital' },
    { name: 'Production', position: [3, 1, 0], color: AMBER, description: 'Output generation capacity' },
    { name: 'Demand', position: [3, -1, 2], color: TERRACOTTA, description: 'Market pull for outputs' },
    { name: 'Quality', position: [-2, 2, 1], color: AMBER, description: 'Standards and consistency' },
    { name: 'Feedback', position: [-2, -1, -1], color: TERRACOTTA, description: 'Information flows back' },
  ];

  // Flow definitions (connections between stocks)
  const flows = [
    { from: 0, to: 1, type: 'reinforcing' },
    { from: 1, to: 2, type: 'reinforcing' },
    { from: 2, to: 0, type: 'balancing' },
    { from: 1, to: 3, type: 'reinforcing' },
    { from: 3, to: 4, type: 'balancing' },
    { from: 4, to: 0, type: 'balancing' },
  ];

  onMount(() => {
    if (!container) return;

    isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(BACKGROUND);

    // Camera
    const width = container.clientWidth;
    const height = container.clientHeight;
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(8, 5, 8);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Post-processing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.5,  // strength
      0.4,  // radius
      0.85  // threshold
    );
    composer.addPass(bloomPass);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + Math.PI / 4; // Limit vertical rotation
    controls.minPolarAngle = Math.PI / 4;
    controls.enableZoom = true;
    controls.minDistance = 5;
    controls.maxDistance = 20;
    controls.autoRotate = !isReducedMotion;
    controls.autoRotateSpeed = 0.5;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(AMBER, 1, 50);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(TERRACOTTA, 0.5, 50);
    pointLight2.position.set(-5, -3, -5);
    scene.add(pointLight2);

    // Create stocks (spheres)
    const stockMeshes: THREE.Mesh[] = [];
    const stockGroup = new THREE.Group();

    stocks.forEach((stock, i) => {
      // Outer glow sphere
      const glowGeometry = new THREE.SphereGeometry(0.6, 32, 32);
      const glowMaterial = new THREE.MeshStandardMaterial({
        color: stock.color,
        emissive: stock.color,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.6,
        roughness: 0.3,
        metalness: 0.1,
      });
      const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);

      // Inner core sphere
      const coreGeometry = new THREE.SphereGeometry(0.35, 32, 32);
      const coreMaterial = new THREE.MeshStandardMaterial({
        color: stock.color,
        emissive: stock.color,
        emissiveIntensity: 0.8,
        roughness: 0.2,
        metalness: 0.3,
      });
      const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);

      const group = new THREE.Group();
      group.add(glowMesh);
      group.add(coreMesh);
      group.position.set(stock.position[0], stock.position[1], stock.position[2]);
      group.userData = { name: stock.name, description: stock.description, index: i };

      stockGroup.add(group);
      stockMeshes.push(coreMesh);
    });

    scene.add(stockGroup);

    // Create flows (curved lines with particles)
    const flowGroups: THREE.Group[] = [];
    const particles: { mesh: THREE.Mesh; progress: number; speed: number; curve: THREE.CatmullRomCurve3 }[] = [];

    flows.forEach((flow) => {
      const fromPos = new THREE.Vector3(...stocks[flow.from].position);
      const toPos = new THREE.Vector3(...stocks[flow.to].position);

      // Create curved path
      const midPoint = new THREE.Vector3()
        .addVectors(fromPos, toPos)
        .multiplyScalar(0.5);
      midPoint.y += 1;
      midPoint.x += (Math.random() - 0.5) * 2;

      const curve = new THREE.CatmullRomCurve3([fromPos, midPoint, toPos]);

      // Draw the curve as a line
      const points = curve.getPoints(50);
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: flow.type === 'reinforcing' ? AMBER : TERRACOTTA,
        transparent: true,
        opacity: 0.3,
      });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(line);

      // Create particles that travel along the curve
      if (!isReducedMotion) {
        for (let i = 0; i < 3; i++) {
          const particleGeometry = new THREE.SphereGeometry(0.08, 8, 8);
          const particleMaterial = new THREE.MeshBasicMaterial({
            color: flow.type === 'reinforcing' ? AMBER : TERRACOTTA,
          });
          const particle = new THREE.Mesh(particleGeometry, particleMaterial);
          scene.add(particle);

          particles.push({
            mesh: particle,
            progress: i / 3,
            speed: 0.002 + Math.random() * 0.002,
            curve,
          });
        }
      }
    });

    // Create orbital ring around center
    const ringGeometry = new THREE.TorusGeometry(4, 0.02, 16, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: AMBER,
      transparent: true,
      opacity: 0.4,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    // Second ring at angle
    const ring2 = new THREE.Mesh(ringGeometry, ringMaterial.clone());
    ring2.rotation.x = Math.PI / 3;
    ring2.rotation.z = Math.PI / 4;
    scene.add(ring2);

    // Raycaster for interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredObject: THREE.Object3D | null = null;

    function onMouseMove(event: MouseEvent) {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(stockGroup.children, true);

      if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj.parent && !obj.userData.name) {
          obj = obj.parent;
        }

        if (obj.userData.name) {
          hoveredObject = obj;
          tooltip = {
            visible: true,
            text: `${obj.userData.name}: ${obj.userData.description}`,
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          };
          container.style.cursor = 'pointer';
          controls.autoRotate = false;
        }
      } else {
        if (hoveredObject) {
          hoveredObject = null;
          tooltip = { ...tooltip, visible: false };
          container.style.cursor = 'grab';
          if (!isReducedMotion) {
            controls.autoRotate = true;
          }
        }
      }
    }

    function onMouseLeave() {
      tooltip = { ...tooltip, visible: false };
      hoveredObject = null;
      if (!isReducedMotion) {
        controls.autoRotate = true;
      }
    }

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseLeave);

    // Animation loop
    let animationId: number;
    let time = 0;

    function animate() {
      animationId = requestAnimationFrame(animate);
      time += 0.01;

      controls.update();

      // Animate particles along flows
      if (!isReducedMotion) {
        particles.forEach((p) => {
          p.progress += p.speed;
          if (p.progress > 1) p.progress = 0;

          const point = p.curve.getPoint(p.progress);
          p.mesh.position.copy(point);
        });

        // Gentle pulse on stocks
        stockMeshes.forEach((mesh, i) => {
          const scale = 1 + Math.sin(time * 2 + i) * 0.05;
          mesh.scale.setScalar(scale);
        });

        // Rotate rings slowly
        ring.rotation.z = time * 0.1;
        ring2.rotation.z = -time * 0.08;
      }

      composer.render();
    }

    animate();

    // Handle resize
    function onResize() {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(newWidth, newHeight);
      composer.setSize(newWidth, newHeight);
    }

    window.addEventListener('resize', onResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onResize);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);

      renderer.dispose();
      composer.dispose();
    };
  });
</script>

<div class="visualization-container">
  <div bind:this={container} class="canvas-container"></div>

  {#if tooltip.visible}
    <div
      class="tooltip"
      style="left: {tooltip.x + 15}px; top: {tooltip.y + 15}px;"
    >
      {tooltip.text}
    </div>
  {/if}

  <div class="legend">
    <div class="legend-item">
      <span class="dot reinforcing"></span>
      <span>Reinforcing Loop</span>
    </div>
    <div class="legend-item">
      <span class="dot balancing"></span>
      <span>Balancing Loop</span>
    </div>
  </div>

  <div class="instructions">
    Drag to rotate • Scroll to zoom • Hover nodes for details
  </div>
</div>

<style>
  .visualization-container {
    position: relative;
    width: 100%;
    height: 500px;
    background: #121212;
    border-radius: 12px;
    overflow: hidden;
  }

  .canvas-container {
    width: 100%;
    height: 100%;
    cursor: grab;
  }

  .canvas-container:active {
    cursor: grabbing;
  }

  .tooltip {
    position: absolute;
    padding: 8px 12px;
    background: rgba(28, 28, 28, 0.95);
    border: 1px solid #3D3A36;
    border-radius: 6px;
    color: #F5F0E8;
    font-size: 0.875rem;
    max-width: 250px;
    pointer-events: none;
    z-index: 10;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .legend {
    position: absolute;
    top: 1rem;
    left: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: rgba(18, 18, 18, 0.8);
    border-radius: 8px;
    font-size: 0.75rem;
    color: #A0A0A0;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .dot.reinforcing {
    background: #D4A574;
    box-shadow: 0 0 6px #D4A574;
  }

  .dot.balancing {
    background: #C4725B;
    box-shadow: 0 0 6px #C4725B;
  }

  .instructions {
    position: absolute;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    padding: 0.5rem 1rem;
    background: rgba(18, 18, 18, 0.8);
    border-radius: 6px;
    font-size: 0.75rem;
    color: #6B6B6B;
  }

  @media (max-width: 640px) {
    .visualization-container {
      height: 350px;
    }

    .legend {
      font-size: 0.625rem;
      padding: 0.5rem 0.75rem;
    }

    .instructions {
      font-size: 0.625rem;
    }
  }
</style>
