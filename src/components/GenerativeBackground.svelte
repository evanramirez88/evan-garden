<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { poissonDiskSample } from '../utils/poisson-disk';
  import { noise2D, seedNoise } from '../utils/simplex-noise';

  // Configuration
  const NODE_COUNT_TARGET = 100;
  const MIN_DISTANCE = 80;
  const NODE_RADIUS = 2;
  const CONNECTION_MAX_DISTANCE = 150;
  const MAX_CONNECTIONS_PER_NODE = 3;
  const NOISE_FREQUENCY = 0.0005;
  const NOISE_AMPLITUDE = 0.3;
  const MOUSE_INFLUENCE_RADIUS = 100;
  const MOUSE_REPEL_STRENGTH = 30;

  // Colors (from design system)
  const NODE_COLOR = 'rgba(212, 165, 116, 0.15)'; // amber at 15%
  const NODE_HOVER_COLOR = 'rgba(212, 165, 116, 0.4)'; // amber at 40%
  const CONNECTION_COLOR = 'rgba(61, 58, 54, 0.4)'; // warm gray at 40%

  interface Node {
    x: number;
    y: number;
    baseX: number;
    baseY: number;
    connections: number[];
    noiseOffsetX: number;
    noiseOffsetY: number;
  }

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null;
  let nodes: Node[] = [];
  let animationId: number;
  let time = 0;
  let mouseX = -1000;
  let mouseY = -1000;
  let width = 0;
  let height = 0;
  let isReducedMotion = false;
  let isVisible = true;

  function initializeNodes(): void {
    if (width === 0 || height === 0) return;

    // Generate points using Poisson disk sampling
    const points = poissonDiskSample(width, height, MIN_DISTANCE);

    // Convert to nodes with random noise offsets
    nodes = points.slice(0, NODE_COUNT_TARGET).map((p, i) => ({
      x: p.x,
      y: p.y,
      baseX: p.x,
      baseY: p.y,
      connections: [],
      noiseOffsetX: Math.random() * 1000,
      noiseOffsetY: Math.random() * 1000,
    }));

    // Create connections based on proximity
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const distances: { index: number; dist: number }[] = [];

      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue;
        const other = nodes[j];
        const dist = Math.hypot(node.baseX - other.baseX, node.baseY - other.baseY);
        if (dist < CONNECTION_MAX_DISTANCE) {
          distances.push({ index: j, dist });
        }
      }

      // Sort by distance and keep closest connections
      distances.sort((a, b) => a.dist - b.dist);
      node.connections = distances
        .slice(0, MAX_CONNECTIONS_PER_NODE)
        .map(d => d.index);
    }
  }

  function updateNodes(): void {
    if (isReducedMotion) return;

    time += 0.016; // ~60fps

    for (const node of nodes) {
      // Apply noise-based drift
      const noiseX = noise2D(
        (node.baseX + node.noiseOffsetX) * NOISE_FREQUENCY,
        time * 0.5
      );
      const noiseY = noise2D(
        (node.baseY + node.noiseOffsetY) * NOISE_FREQUENCY,
        time * 0.5 + 100
      );

      node.x = node.baseX + noiseX * NOISE_AMPLITUDE * 50;
      node.y = node.baseY + noiseY * NOISE_AMPLITUDE * 50;

      // Apply mouse repulsion
      const dx = node.x - mouseX;
      const dy = node.y - mouseY;
      const dist = Math.hypot(dx, dy);

      if (dist < MOUSE_INFLUENCE_RADIUS && dist > 0) {
        const force = (1 - dist / MOUSE_INFLUENCE_RADIUS) * MOUSE_REPEL_STRENGTH;
        node.x += (dx / dist) * force;
        node.y += (dy / dist) * force;
      }
    }
  }

  function draw(): void {
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw connections
    ctx.strokeStyle = CONNECTION_COLOR;
    ctx.lineWidth = 0.5;

    for (const node of nodes) {
      for (const connIndex of node.connections) {
        const other = nodes[connIndex];
        if (!other) continue;

        // Only draw each connection once
        if (connIndex > nodes.indexOf(node)) {
          ctx.beginPath();

          // Draw curved bezier for organic feel
          const midX = (node.x + other.x) / 2;
          const midY = (node.y + other.y) / 2;
          const offsetX = (node.y - other.y) * 0.1;
          const offsetY = (other.x - node.x) * 0.1;

          ctx.moveTo(node.x, node.y);
          ctx.quadraticCurveTo(midX + offsetX, midY + offsetY, other.x, other.y);
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    for (const node of nodes) {
      const dx = node.x - mouseX;
      const dy = node.y - mouseY;
      const dist = Math.hypot(dx, dy);
      const isNearMouse = dist < MOUSE_INFLUENCE_RADIUS;

      ctx.fillStyle = isNearMouse ? NODE_HOVER_COLOR : NODE_COLOR;
      ctx.beginPath();
      ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function animate(): void {
    if (!isVisible) {
      animationId = requestAnimationFrame(animate);
      return;
    }

    updateNodes();
    draw();
    animationId = requestAnimationFrame(animate);
  }

  function handleResize(): void {
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    width = rect.width;
    height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    // Reinitialize nodes for new dimensions
    seedNoise(12345); // Consistent seed for reproducibility
    initializeNodes();

    // Draw once immediately if reduced motion
    if (isReducedMotion) {
      draw();
    }
  }

  function handleMouseMove(e: MouseEvent): void {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  }

  function handleMouseLeave(): void {
    mouseX = -1000;
    mouseY = -1000;
  }

  function handleVisibilityChange(): void {
    isVisible = !document.hidden;
  }

  onMount(() => {
    ctx = canvas.getContext('2d');

    // Check reduced motion preference
    isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Initial setup
    handleResize();

    // Start animation (or just draw once for reduced motion)
    if (!isReducedMotion) {
      animate();
    }

    // Event listeners
    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Listen for reduced motion changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => {
      isReducedMotion = e.matches;
      if (isReducedMotion) {
        draw(); // Draw static frame
      }
    };
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  });

  onDestroy(() => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  });
</script>

<canvas
  bind:this={canvas}
  class="absolute inset-0 w-full h-full pointer-events-auto"
  onmousemove={handleMouseMove}
  onmouseleave={handleMouseLeave}
  aria-hidden="true"
/>

<style>
  canvas {
    z-index: 0;
  }
</style>
