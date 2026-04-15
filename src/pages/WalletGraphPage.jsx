import React, { useEffect, useRef, useState } from 'react';
import api from '../api';
import './WalletGraphPage.css';

// Simple force-directed layout in pure React/Canvas - no external library needed.
// Nodes repel each other, edges act as springs pulling connected nodes together.

const W = 800;
const H = 550;
const NODE_RADIUS = 7;
const REPULSION  = 3500;
const SPRING_LEN = 120;
const SPRING_K   = 0.04;
const DAMPING    = 0.78;
const ITERATIONS = 80; // pre-compute layout before first paint

function initPositions(nodes) {
  return nodes.map((_, i) => {
    const angle = (i / nodes.length) * Math.PI * 2;
    const r = Math.min(W, H) * 0.3;
    return {
      x: W / 2 + r * Math.cos(angle) + (Math.random() - 0.5) * 40,
      y: H / 2 + r * Math.sin(angle) + (Math.random() - 0.5) * 40,
      vx: 0,
      vy: 0,
    };
  });
}

function runLayout(nodes, edges, iterations) {
  const pos = initPositions(nodes);
  const idxMap = new Map(nodes.map((n, i) => [n.id, i]));

  for (let iter = 0; iter < iterations; iter++) {
    // Repulsion between all node pairs
    for (let i = 0; i < pos.length; i++) {
      for (let j = i + 1; j < pos.length; j++) {
        const dx = pos[i].x - pos[j].x || 0.01;
        const dy = pos[i].y - pos[j].y || 0.01;
        const dist2 = dx * dx + dy * dy || 0.01;
        const force = REPULSION / dist2;
        pos[i].vx += force * dx / Math.sqrt(dist2);
        pos[i].vy += force * dy / Math.sqrt(dist2);
        pos[j].vx -= force * dx / Math.sqrt(dist2);
        pos[j].vy -= force * dy / Math.sqrt(dist2);
      }
    }

    // Spring attraction along edges
    for (const edge of edges) {
      const si = idxMap.get(edge.source);
      const ti = idxMap.get(edge.target);
      if (si == null || ti == null) continue;
      const dx = pos[ti].x - pos[si].x;
      const dy = pos[ti].y - pos[si].y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const stretch = (dist - SPRING_LEN) * SPRING_K;
      pos[si].vx += stretch * dx / dist;
      pos[si].vy += stretch * dy / dist;
      pos[ti].vx -= stretch * dx / dist;
      pos[ti].vy -= stretch * dy / dist;
    }

    // Apply velocity + damping + boundary clamp
    for (const p of pos) {
      p.vx *= DAMPING;
      p.vy *= DAMPING;
      p.x = Math.max(NODE_RADIUS + 4, Math.min(W - NODE_RADIUS - 4, p.x + p.vx));
      p.y = Math.max(NODE_RADIUS + 4, Math.min(H - NODE_RADIUS - 4, p.y + p.vy));
    }
  }
  return pos;
}

export default function WalletGraphPage({ onWhaleClick }) {
  const canvasRef = useRef(null);
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hovered, setHovered] = useState(null);
  const layoutRef = useRef(null);
  const hoveredRef = useRef(null);

  function drawGraph(nodes, edges, pos, hoveredIdx) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, H);

    // Background grid
    ctx.strokeStyle = 'rgba(108, 99, 255, 0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    const idxMap = new Map(nodes.map((n, i) => [n.id, i]));

    // Draw edges
    for (const edge of edges) {
      const si = idxMap.get(edge.source);
      const ti = idxMap.get(edge.target);
      if (si == null || ti == null) continue;
      const weight = Math.min(edge.sharedSignals, 5);
      const isHot = hoveredIdx != null && (si === hoveredIdx || ti === hoveredIdx);
      ctx.beginPath();
      ctx.moveTo(pos[si].x, pos[si].y);
      ctx.lineTo(pos[ti].x, pos[ti].y);
      ctx.strokeStyle = isHot ? 'rgba(108, 99, 255, 0.7)' : `rgba(108, 99, 255, ${0.1 + weight * 0.05})`;
      ctx.lineWidth = isHot ? 1.5 : 0.8;
      ctx.stroke();
    }

    // Draw nodes
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const { x, y } = pos[i];
      const isHov = i === hoveredIdx;
      const r = isHov ? NODE_RADIUS + 3 : NODE_RADIUS;
      const intensity = Math.min(node.signals / 5, 1);

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = isHov
        ? '#6c63ff'
        : `rgba(${Math.round(60 + intensity * 48)}, ${Math.round(50 + intensity * 50)}, 255, ${0.5 + intensity * 0.4})`;
      ctx.fill();
      ctx.strokeStyle = isHov ? '#fff' : 'rgba(255,255,255,0.12)';
      ctx.lineWidth = isHov ? 1.5 : 0.8;
      ctx.stroke();

      // Label for hovered node only (keep canvas clean)
      if (isHov) {
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = '10px "Courier New", monospace';
        ctx.fillText(`${node.id.slice(0, 6)}...${node.id.slice(-4)}`, x + r + 4, y + 4);
      }
    }
  }

  useEffect(() => {
    api.get('/api/signals/graph')
      .then(r => setGraphData(r.data))
      .catch(() => setError('Graph data unavailable.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!graphData?.nodes?.length) return;
    const { nodes, edges } = graphData;
    const pos = runLayout(nodes, edges, ITERATIONS);
    layoutRef.current = pos;
    drawGraph(nodes, edges, pos, null);
  }, [graphData]);

  function hitTest(mx, my) {
    const pos = layoutRef.current;
    for (let i = 0; i < pos.length; i++) {
      const dx = pos[i].x - mx;
      const dy = pos[i].y - my;
      if (Math.sqrt(dx * dx + dy * dy) <= NODE_RADIUS + 6) return i;
    }
    return null;
  }

  function handleMouseMove(e) {
    if (!graphData?.nodes?.length || !layoutRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (W / rect.width);
    const my = (e.clientY - rect.top)  * (H / rect.height);
    const found = hitTest(mx, my);

    if (found !== hovered) {
      hoveredRef.current = found;
      setHovered(found);
      drawGraph(graphData.nodes, graphData.edges, layoutRef.current, found);
      canvas.style.cursor = found != null ? 'pointer' : 'default';
    }
  }

  function handleClick() {
    if (!graphData?.nodes?.length || !layoutRef.current || hovered == null) return;
    const node = graphData.nodes[hovered];
    if (node && onWhaleClick) onWhaleClick({ address: node.id, chain: 'BASE' });
  }

  function getTouchPos(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0] || e.changedTouches[0];
    return {
      mx: (touch.clientX - rect.left) * (W / rect.width),
      my: (touch.clientY - rect.top)  * (H / rect.height),
    };
  }

  function handleTouchMove(e) {
    e.preventDefault();
    if (!graphData?.nodes?.length || !layoutRef.current) return;
    const { mx, my } = getTouchPos(e);
    const found = hitTest(mx, my);
    hoveredRef.current = found;
    setHovered(found);
    drawGraph(graphData.nodes, graphData.edges, layoutRef.current, found);
  }

  function handleTouchEnd(e) {
    e.preventDefault();
    if (!graphData?.nodes?.length || !layoutRef.current || hoveredRef.current == null) return;
    const node = graphData.nodes[hoveredRef.current];
    if (node && onWhaleClick) onWhaleClick({ address: node.id, chain: 'BASE' });
  }

  const hasData = graphData?.nodes?.length > 0;

  return (
    <div className="graph-page">
      <div className="graph-header">
        <p className="graph-sub">
          Smart wallets that moved together in the last 7 days. Clusters reveal coordination before narratives go public.
          {hasData && ` ${graphData.nodes.length} wallets, ${graphData.edges.length} connections.`}
        </p>
      </div>

      {loading && <div className="graph-state">Reading the chain...</div>}
      {error   && <div className="graph-state graph-error">{error}</div>}

      {!loading && !error && !hasData && (
        <div className="graph-state">
          No coordination signals detected yet. Graph builds as on-chain activity accumulates.
        </div>
      )}

      {hasData && (
        <div className="graph-canvas-wrap">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="graph-canvas"
            style={{ touchAction: 'none' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
              hoveredRef.current = null;
              setHovered(null);
              if (graphData?.nodes?.length && layoutRef.current) {
                drawGraph(graphData.nodes, graphData.edges, layoutRef.current, null);
              }
            }}
            onClick={handleClick}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
          <p className="graph-hint">Click a node to view wallet profile. Brighter nodes have more signals.</p>
        </div>
      )}

      {hasData && (
        <div className="graph-legend">
          <div className="graph-legend-item">
            <span className="graph-legend-dot dim" />
            <span>Low activity</span>
          </div>
          <div className="graph-legend-item">
            <span className="graph-legend-dot bright" />
            <span>High activity</span>
          </div>
          <div className="graph-legend-item">
            <span className="graph-legend-line" />
            <span>Shared signal</span>
          </div>
        </div>
      )}
    </div>
  );
}
