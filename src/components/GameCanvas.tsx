import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { PremiumConstructionScene } from '../game/PremiumConstructionScene';

function GameCanvas() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!hostRef.current || gameRef.current) return;

    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      parent: hostRef.current,
      width: 1024,
      height: 768,
      backgroundColor: '#78d5ff',
      scene: [PremiumConstructionScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      render: {
        antialias: true,
        pixelArt: false,
      },
    });

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div className="game-canvas-host" ref={hostRef} />;
}

export default GameCanvas;
