<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  type TopicType = 'systems' | 'hospitality' | 'horticulture' | 'ai' | 'play' | 'meta';

  let { topic = 'systems' as TopicType, size = 200 }: { topic: TopicType; size?: number } = $props();

  let canvas: HTMLCanvasElement;
  let animationId: number;
  let isReducedMotion = false;

  const topicColors: Record<TopicType, { primary: string; secondary: string }> = {
    systems: { primary: '#D4A574', secondary: '#C4725B' },
    hospitality: { primary: '#C4725B', secondary: '#D4A574' },
    horticulture: { primary: '#7D8B75', secondary: '#D4A574' },
    ai: { primary: '#6B9BD2', secondary: '#D4A574' },
    play: { primary: '#9B8BD2', secondary: '#D4A574' },
    meta: { primary: '#A0A0A0', secondary: '#D4A574' },
  };

  // Systems: Orbital rings
  function drawSystems(ctx: CanvasRenderingContext2D, time: number, w: number, h: number) {
    const cx = w / 2;
    const cy = h / 2;
    const colors = topicColors.systems;

    ctx.clearRect(0, 0, w, h);

    // Draw multiple orbital rings
    for (let i = 0; i < 3; i++) {
      const radius = 30 + i * 25;
      const rotation = time * 0.5 * (i % 2 === 0 ? 1 : -1) + i * Math.PI / 3;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);

      ctx.beginPath();
      ctx.ellipse(0, 0, radius, radius * 0.4, 0, 0, Math.PI * 2);
      ctx.strokeStyle = i === 1 ? colors.secondary : colors.primary;
      ctx.globalAlpha = 0.4 + i * 0.15;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Dot traveling on ring
      const dotAngle = time * 2 + i;
      const dotX = Math.cos(dotAngle) * radius;
      const dotY = Math.sin(dotAngle) * radius * 0.4;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
      ctx.fillStyle = colors.primary;
      ctx.globalAlpha = 0.8;
      ctx.fill();

      ctx.restore();
    }

    // Center node
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fillStyle = colors.primary;
    ctx.globalAlpha = 0.6;
    ctx.fill();
  }

  // Hospitality: Flow diagram
  function drawHospitality(ctx: CanvasRenderingContext2D, time: number, w: number, h: number) {
    const colors = topicColors.hospitality;
    ctx.clearRect(0, 0, w, h);

    // Draw flowing curves
    const curves = [
      { start: [20, h * 0.3], cp1: [w * 0.3, h * 0.1], cp2: [w * 0.7, h * 0.5], end: [w - 20, h * 0.4] },
      { start: [20, h * 0.5], cp1: [w * 0.4, h * 0.8], cp2: [w * 0.6, h * 0.2], end: [w - 20, h * 0.6] },
      { start: [20, h * 0.7], cp1: [w * 0.3, h * 0.9], cp2: [w * 0.7, h * 0.6], end: [w - 20, h * 0.8] },
    ];

    curves.forEach((curve, i) => {
      ctx.beginPath();
      ctx.moveTo(curve.start[0], curve.start[1]);
      ctx.bezierCurveTo(
        curve.cp1[0], curve.cp1[1],
        curve.cp2[0], curve.cp2[1],
        curve.end[0], curve.end[1]
      );
      ctx.strokeStyle = i === 1 ? colors.secondary : colors.primary;
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Animated dot along curve
      const t = (time * 0.3 + i * 0.3) % 1;
      const x = bezierPoint(t, curve.start[0], curve.cp1[0], curve.cp2[0], curve.end[0]);
      const y = bezierPoint(t, curve.start[1], curve.cp1[1], curve.cp2[1], curve.end[1]);

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = colors.primary;
      ctx.globalAlpha = 0.8;
      ctx.fill();
    });

    // Intersection nodes
    [[w * 0.35, h * 0.45], [w * 0.65, h * 0.55]].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = colors.primary;
      ctx.globalAlpha = 0.5;
      ctx.fill();
    });
  }

  // Horticulture: L-system branching
  function drawHorticulture(ctx: CanvasRenderingContext2D, time: number, w: number, h: number) {
    const colors = topicColors.horticulture;
    ctx.clearRect(0, 0, w, h);

    const breathe = 1 + Math.sin(time) * 0.03;

    function branch(x: number, y: number, angle: number, length: number, depth: number) {
      if (depth === 0 || length < 2) return;

      const endX = x + Math.cos(angle) * length * breathe;
      const endY = y + Math.sin(angle) * length * breathe;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = depth > 3 ? colors.primary : colors.secondary;
      ctx.globalAlpha = 0.2 + depth * 0.1;
      ctx.lineWidth = depth * 0.5;
      ctx.stroke();

      // Branch off
      const angleOffset = 0.4 + Math.sin(time * 0.5) * 0.1;
      branch(endX, endY, angle - angleOffset, length * 0.7, depth - 1);
      branch(endX, endY, angle + angleOffset, length * 0.7, depth - 1);
    }

    branch(w / 2, h - 20, -Math.PI / 2, 50, 6);
  }

  // AI: Network mesh
  function drawAI(ctx: CanvasRenderingContext2D, time: number, w: number, h: number) {
    const colors = topicColors.ai;
    ctx.clearRect(0, 0, w, h);

    // Grid of nodes
    const cols = 5;
    const rows = 4;
    const nodes: [number, number][] = [];

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = (w / (cols + 1)) * (i + 1) + Math.sin(time + i * j) * 5;
        const y = (h / (rows + 1)) * (j + 1) + Math.cos(time + i * j) * 5;
        nodes.push([x, y]);
      }
    }

    // Draw connections
    nodes.forEach((node, i) => {
      nodes.forEach((other, j) => {
        if (i >= j) return;
        const dist = Math.hypot(node[0] - other[0], node[1] - other[1]);
        if (dist < 80) {
          ctx.beginPath();
          ctx.moveTo(node[0], node[1]);
          ctx.lineTo(other[0], other[1]);
          ctx.strokeStyle = colors.primary;
          ctx.globalAlpha = 0.15;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });
    });

    // Draw nodes
    nodes.forEach(([x, y], i) => {
      const pulse = Math.sin(time * 2 + i) * 0.5 + 0.5;
      ctx.beginPath();
      ctx.arc(x, y, 4 + pulse * 2, 0, Math.PI * 2);
      ctx.fillStyle = i % 3 === 0 ? colors.secondary : colors.primary;
      ctx.globalAlpha = 0.5 + pulse * 0.3;
      ctx.fill();
    });

    // Data packet
    const packetProgress = (time * 0.5) % 1;
    const fromIdx = Math.floor(time) % nodes.length;
    const toIdx = (fromIdx + 1) % nodes.length;
    const px = nodes[fromIdx][0] + (nodes[toIdx][0] - nodes[fromIdx][0]) * packetProgress;
    const py = nodes[fromIdx][1] + (nodes[toIdx][1] - nodes[fromIdx][1]) * packetProgress;

    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fillStyle = colors.primary;
    ctx.globalAlpha = 0.9;
    ctx.fill();
  }

  // Play: Particle system
  function drawPlay(ctx: CanvasRenderingContext2D, time: number, w: number, h: number) {
    const colors = topicColors.play;
    ctx.clearRect(0, 0, w, h);

    // Bouncing particles
    const particles = 15;
    for (let i = 0; i < particles; i++) {
      const seed = i * 1234.5678;
      const speed = 0.5 + (seed % 1) * 0.5;
      const phase = seed % (Math.PI * 2);

      const x = (w / 2) + Math.sin(time * speed + phase) * (w * 0.35) * Math.cos(seed);
      const y = (h / 2) + Math.cos(time * speed * 1.3 + phase) * (h * 0.35) * Math.sin(seed * 2);
      const size = 3 + Math.sin(time * 2 + i) * 2;

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = i % 3 === 0 ? colors.secondary : colors.primary;
      ctx.globalAlpha = 0.4 + Math.sin(time + i) * 0.2;
      ctx.fill();
    }

    // Playful connecting lines
    for (let i = 0; i < 5; i++) {
      const seed = i * 9876.543;
      const x1 = (seed % w);
      const y1 = ((seed * 2) % h);
      const x2 = ((seed * 3) % w);
      const y2 = ((seed * 4) % h);

      const offset = Math.sin(time + i) * 10;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(w / 2 + offset, h / 2 + offset, x2, y2);
      ctx.strokeStyle = colors.primary;
      ctx.globalAlpha = 0.15;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // Meta: Abstract dots
  function drawMeta(ctx: CanvasRenderingContext2D, time: number, w: number, h: number) {
    const colors = topicColors.meta;
    ctx.clearRect(0, 0, w, h);

    // Concentric circles
    for (let i = 0; i < 4; i++) {
      const radius = 20 + i * 20;
      const rotation = time * 0.2 * (i % 2 === 0 ? 1 : -1);

      ctx.beginPath();
      ctx.arc(w / 2, h / 2, radius, 0, Math.PI * 2);
      ctx.strokeStyle = colors.primary;
      ctx.globalAlpha = 0.2;
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Dots on circle
      for (let j = 0; j < 3; j++) {
        const angle = rotation + (j * Math.PI * 2) / 3;
        const x = w / 2 + Math.cos(angle) * radius;
        const y = h / 2 + Math.sin(angle) * radius;

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = j === 0 ? colors.secondary : colors.primary;
        ctx.globalAlpha = 0.5;
        ctx.fill();
      }
    }
  }

  // Helper: cubic bezier point
  function bezierPoint(t: number, p0: number, p1: number, p2: number, p3: number): number {
    const mt = 1 - t;
    return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
  }

  const drawFunctions: Record<TopicType, (ctx: CanvasRenderingContext2D, time: number, w: number, h: number) => void> = {
    systems: drawSystems,
    hospitality: drawHospitality,
    horticulture: drawHorticulture,
    ai: drawAI,
    play: drawPlay,
    meta: drawMeta,
  };

  onMount(() => {
    if (!canvas) return;

    isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const drawFn = drawFunctions[topic] || drawMeta;
    let time = 0;

    function animate() {
      if (!isReducedMotion) {
        time += 0.016;
      }
      drawFn(ctx!, time, size, size);

      if (!isReducedMotion) {
        animationId = requestAnimationFrame(animate);
      }
    }

    animate();

    // Draw once for reduced motion
    if (isReducedMotion) {
      drawFn(ctx, 0, size, size);
    }
  });

  onDestroy(() => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  });
</script>

<canvas
  bind:this={canvas}
  class="topic-visual"
  style="width: {size}px; height: {size}px;"
  aria-hidden="true"
></canvas>

<style>
  .topic-visual {
    display: block;
  }
</style>
