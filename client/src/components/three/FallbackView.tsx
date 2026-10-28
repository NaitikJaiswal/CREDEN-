import React from 'react';
import { NodeInfo } from './IdentityNetwork3D';

export const FallbackNetworkView: React.FC<{
  onSelectNode: (node: NodeInfo) => void;
  selectedNode: NodeInfo | null;
}> = ({ onSelectNode, selectedNode }) => {
  const nodes: NodeInfo[] = [
    { id: '1', name: 'COEP Tech University', code: 'AICTE-MH-1029', recordsSubmitted: 128, passRate: 98.4, status: 'VERIFIED', position: [0, 0, 0], color: '#FFFFFF' },
    { id: '2', name: 'IIT Delhi', code: 'AICTE-DL-2001', recordsSubmitted: 145, passRate: 99.1, status: 'VERIFIED', position: [0, 0, 0], color: '#D4D4D8' },
    { id: '3', name: 'RV College of Engg', code: 'AICTE-KA-3042', recordsSubmitted: 110, passRate: 94.5, status: 'REVIEW PENDING', position: [0, 0, 0], color: '#FBBF24' },
    { id: '4', name: 'Anna University', code: 'AICTE-TN-4010', recordsSubmitted: 160, passRate: 97.8, status: 'VERIFIED', position: [0, 0, 0], color: '#36D399' },
    { id: '5', name: 'VJTI Mumbai', code: 'AICTE-MH-1002', recordsSubmitted: 118, passRate: 96.2, status: 'VERIFIED', position: [0, 0, 0], color: '#FFFFFF' },
    { id: '6', name: 'Jadavpur University', code: 'AICTE-WB-5001', recordsSubmitted: 104, passRate: 95.0, status: 'VERIFIED', position: [0, 0, 0], color: '#A1A1AA' },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-[#000000]">
      {/* Ambient background grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>

      {/* SVG Interactive Holographic Network */}
      <svg className="w-full max-w-2xl h-96 relative z-10" viewBox="0 0 600 400" fill="none">
        <defs>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Orbit Rings */}
        <circle cx="300" cy="200" r="160" stroke="#262626" strokeWidth="1.5" strokeDasharray="4 6" />
        <circle cx="300" cy="200" r="100" stroke="#404040" strokeWidth="1" strokeOpacity="0.4" />

        {/* Center Node */}
        <circle cx="300" cy="200" r="45" fill="url(#centerGlow)" opacity="0.2" />
        <circle cx="300" cy="200" r="22" fill="#121212" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="300" cy="200" r="8" fill="#FFFFFF" />

        {/* Radiating Nodes */}
        {nodes.map((node, i) => {
          const angle = (i * (360 / nodes.length) * Math.PI) / 180;
          const radius = 140;
          const x = 300 + Math.cos(angle) * radius;
          const y = 200 + Math.sin(angle) * radius;
          const isSelected = selectedNode?.id === node.id;

          return (
            <g
              key={node.id}
              onClick={() => onSelectNode(node)}
              className="cursor-pointer group"
            >
              <line x1="300" y1="200" x2={x} y2={y} stroke={node.color} strokeWidth="1.5" strokeOpacity="0.4" />
              <circle
                cx={x}
                cy={y}
                r={isSelected ? 16 : 11}
                fill="#121212"
                stroke={node.color}
                strokeWidth={isSelected ? 3 : 2}
                className="transition-all"
              />
              <circle cx={x} cy={y} r={isSelected ? 7 : 4} fill={node.color} />
              <text
                x={x}
                y={y + 24}
                fill="#A3A3A3"
                fontSize="10"
                textAnchor="middle"
                className="font-medium group-hover:fill-white transition-colors"
              >
                {node.name.split(' ')[0]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

