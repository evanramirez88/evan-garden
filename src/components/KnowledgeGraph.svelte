<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  interface Node {
    id: string;
    title: string;
    topic: string;
    maturity: string;
    href: string;
    x?: number;
    y?: number;
    fx?: number | null;
    fy?: number | null;
  }

  interface Link {
    source: string | Node;
    target: string | Node;
  }

  interface GraphData {
    nodes: Node[];
    links: Link[];
  }

  export let data: GraphData;

  let container: HTMLDivElement;
  let width = 800;
  let height = 600;

  const topicColors: Record<string, string> = {
    systems: '#D4A574',      // amber
    hospitality: '#C4725B',  // terracotta
    horticulture: '#7D8B75', // sage
    ai: '#6B9BD2',           // blue
    play: '#9B8BD2',         // purple
    meta: '#A0A0A0',         // gray
  };

  const maturityRadius: Record<string, number> = {
    seedling: 6,
    budding: 9,
    evergreen: 12,
  };

  onMount(() => {
    if (!container) return;

    const rect = container.getBoundingClientRect();
    width = rect.width;
    height = rect.height;

    // Create SVG
    const svg = d3.select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', [0, 0, width, height]);

    // Add zoom behavior
    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create simulation
    const simulation = d3.forceSimulation(data.nodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(data.links)
        .id((d: any) => d.id)
        .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(20));

    // Draw links
    const link = g.append('g')
      .attr('stroke', '#3D3A36')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('stroke-width', 1);

    // Draw nodes
    const node = g.append('g')
      .selectAll('g')
      .data(data.nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<SVGGElement, Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      );

    // Node circles
    node.append('circle')
      .attr('r', (d) => maturityRadius[d.maturity] || 8)
      .attr('fill', (d) => topicColors[d.topic] || '#A0A0A0')
      .attr('stroke', '#1C1C1C')
      .attr('stroke-width', 2);

    // Node labels
    node.append('text')
      .text((d) => d.title.length > 25 ? d.title.slice(0, 25) + '...' : d.title)
      .attr('x', (d) => (maturityRadius[d.maturity] || 8) + 6)
      .attr('y', 4)
      .attr('fill', '#F5F0E8')
      .attr('font-size', '12px')
      .attr('font-family', 'DM Sans, sans-serif')
      .attr('opacity', 0.8);

    // Hover effects
    node.on('mouseover', function(event, d) {
      d3.select(this).select('circle')
        .transition()
        .duration(200)
        .attr('stroke', '#D4A574')
        .attr('stroke-width', 3);
      d3.select(this).select('text')
        .transition()
        .duration(200)
        .attr('opacity', 1);
    })
    .on('mouseout', function(event, d) {
      d3.select(this).select('circle')
        .transition()
        .duration(200)
        .attr('stroke', '#1C1C1C')
        .attr('stroke-width', 2);
      d3.select(this).select('text')
        .transition()
        .duration(200)
        .attr('opacity', 0.8);
    })
    .on('click', (event, d) => {
      window.location.href = d.href;
    });

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGGElement, Node, Node>, d: Node) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, Node, Node>, d: Node) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, Node, Node>, d: Node) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Cleanup
    return () => {
      simulation.stop();
    };
  });
</script>

<div bind:this={container} class="w-full h-full bg-garden-black"></div>

<style>
  div {
    background: #121212;
  }
</style>
