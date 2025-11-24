import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { KnowledgeItem } from '../types';

interface VisualizerProps {
  items: KnowledgeItem[];
  onNodeClick: (item: KnowledgeItem) => void;
}

// Color map for categories
const CATEGORY_COLORS: Record<string, string> = {
  Technology: '#3b82f6', // blue-500
  Science: '#10b981', // emerald-500
  Health: '#f43f5e', // rose-500
  Philosophy: '#8b5cf6', // violet-500
  Art: '#f59e0b', // amber-500
  Productivity: '#06b6d4', // cyan-500
  Uncategorized: '#94a3b8', // slate-400
};

const Visualizer: React.FC<VisualizerProps> = ({ items, onNodeClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!svgRef.current || !items.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const { width, height } = dimensions;

    // Create a simulation
    // We treat items sharing tags as linked
    const nodes = items.map(d => ({ ...d }));
    
    // Simple logic: create links between nodes that share a category
    const links: any[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].category === nodes[j].category) {
          links.push({ source: nodes[i].id, target: nodes[j].id, value: 1 });
        }
      }
    }

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100).strength(0.1))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(30));

    // Add a glowing core (The "Sun" or "User")
    const defs = svg.append("defs");
    const gradient = defs.append("radialGradient")
      .attr("id", "sun-gradient")
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%");
    
    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#ffffff").attr("stop-opacity", 1);
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#6366f1").attr("stop-opacity", 0);

    // Draw Links
    const link = svg.append("g")
      .attr("stroke", "#94a3b8")
      .attr("stroke-opacity", 0.2)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 1);

    // Draw Nodes
    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("cursor", "pointer")
      .call(d3.drag<any, any>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }) as any
      )
      .on("click", (event, d) => {
        onNodeClick(d as unknown as KnowledgeItem);
      });

    // Node Circles (Planets)
    node.append("circle")
      .attr("r", (d) => Math.max(10, Math.min(20, d.summary.length / 10))) // Size based on content richness
      .attr("fill", (d) => CATEGORY_COLORS[d.category] || CATEGORY_COLORS['Uncategorized'])
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .attr("fill-opacity", 0.8)
      .append("title") // Tooltip
      .text((d) => d.title);

    // Node Labels
    node.append("text")
      .text((d) => d.title.length > 15 ? d.title.substring(0, 12) + '...' : d.title)
      .attr("x", 15)
      .attr("y", 5)
      .attr("font-size", "10px")
      .attr("fill", "#e2e8f0")
      .style("pointer-events", "none")
      .style("text-shadow", "1px 1px 2px black");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [items, dimensions, onNodeClick]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <div className="text-6xl mb-4">🌌</div>
        <p className="text-xl">Your galaxy is empty.</p>
        <p className="text-sm">Start adding knowledge to see your universe grow.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black">
        {/* Background Stars Effect */}
        <div className="absolute inset-0 z-0 opacity-50" style={{
            backgroundImage: 'radial-gradient(white 1px, transparent 1px)',
            backgroundSize: '50px 50px'
        }}></div>
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="relative z-10" />
    </div>
  );
};

export default Visualizer;
