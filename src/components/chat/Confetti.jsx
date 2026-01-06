import { useEffect, useState } from 'react';
import './../../styles/confetti.css';

const CONFETTI_COLORS = [
  '#9b59b6', '#a855f7', '#ec4899', '#f59e0b',
  '#10b981', '#3b82f6', '#ffffff', '#fbbf24'
];

const CONFETTI_SHAPES = ['square', 'circle', 'triangle'];

const generateConfettiPieces = (count = 100) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    shape: CONFETTI_SHAPES[Math.floor(Math.random() * CONFETTI_SHAPES.length)],
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
    drift: -50 + Math.random() * 100
  }));
};

const Confetti = ({ show = true, duration = 4000 }) => {
  const [pieces, setPieces] = useState([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setPieces(generateConfettiPieces(80));
      setVisible(true);

      const timer = setTimeout(() => {
        setVisible(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!visible) return null;

  return (
    <div className="confetti-container" aria-hidden="true">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className={`confetti-piece ${piece.shape}`}
          style={{
            left: `${piece.left}%`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            backgroundColor: piece.shape !== 'triangle' ? piece.color : 'transparent',
            borderBottomColor: piece.shape === 'triangle' ? piece.color : 'transparent',
            width: piece.shape !== 'triangle' ? `${piece.size}px` : '0',
            height: piece.shape !== 'triangle' ? `${piece.size}px` : '0',
            borderWidth: piece.shape === 'triangle' ? `0 ${piece.size/2}px ${piece.size}px ${piece.size/2}px` : '0',
            '--drift': `${piece.drift}px`,
            '--rotation': `${piece.rotation}deg`
          }}
        />
      ))}

      {/* Sparkle bursts */}
      <div className="sparkle-burst left" />
      <div className="sparkle-burst right" />
      <div className="sparkle-burst center" />
    </div>
  );
};

export default Confetti;
