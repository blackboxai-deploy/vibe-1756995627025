"use client";

import { useEffect, useRef, useState } from 'react';

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);

  // Game variables
  const gridSize = 20;
  const gameRef = useRef({
    snake: [{ x: 10, y: 10 }],
    food: { x: 0, y: 0 },
    dx: 0,
    dy: 0,
    gameRunning: true,
    tileCount: 0,
    touchStartX: 0,
    touchStartY: 0
  });

  // Initialize game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const tileCount = canvas.width / gridSize;
    gameRef.current.tileCount = tileCount;
    
    generateFood();
    
    const gameLoop = setInterval(() => {
      update();
      draw();
    }, 150);

    return () => clearInterval(gameLoop);
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameRef.current.gameRunning) return;

      // Prevent default behavior for game keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      // Pause/Resume
      if (e.code === 'Space') {
        setGamePaused(prev => !prev);
        return;
      }

      if (gamePaused) return;

      const { dx, dy } = gameRef.current;

      // Movement controls
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          if (dy !== 1) {
            gameRef.current.dx = 0;
            gameRef.current.dy = -1;
          }
          break;
        case 'ArrowDown':
        case 'KeyS':
          if (dy !== -1) {
            gameRef.current.dx = 0;
            gameRef.current.dy = 1;
          }
          break;
        case 'ArrowLeft':
        case 'KeyA':
          if (dx !== 1) {
            gameRef.current.dx = -1;
            gameRef.current.dy = 0;
          }
          break;
        case 'ArrowRight':
        case 'KeyD':
          if (dx !== -1) {
            gameRef.current.dx = 1;
            gameRef.current.dy = 0;
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [gamePaused]);

  // Generate random food position
  const generateFood = () => {
    const { snake, tileCount } = gameRef.current;
    
    let foodPosition: { x: number; y: number };
    do {
      foodPosition = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
      };
    } while (snake.some(segment => segment.x === foodPosition.x && segment.y === foodPosition.y));
    
    gameRef.current.food = foodPosition;
  };

  // Draw game elements
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { snake, food } = gameRef.current;

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    ctx.fillStyle = '#4ecdc4';
    for (let i = 1; i < snake.length; i++) {
      const segment = snake[i];
      ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    }

    // Draw snake head with different color
    ctx.fillStyle = '#45b7aa';
    ctx.fillRect(snake[0].x * gridSize, snake[0].y * gridSize, gridSize - 2, gridSize - 2);

    // Draw food
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(
      food.x * gridSize + gridSize / 2,
      food.y * gridSize + gridSize / 2,
      gridSize / 2 - 1,
      0,
      2 * Math.PI
    );
    ctx.fill();

    // Draw pause indicator
    if (gamePaused) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '30px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    }
  };

  // Update game state
  const update = () => {
    if (!gameRef.current.gameRunning || gamePaused) return;

    const { snake, food, dx, dy, tileCount } = gameRef.current;
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Check wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
      handleGameOver();
      return;
    }

    // Check self collision
    for (let segment of snake) {
      if (head.x === segment.x && head.y === segment.y) {
        handleGameOver();
        return;
      }
    }

    snake.unshift(head);

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
      setScore(prev => prev + 10);
      generateFood();
    } else {
      snake.pop();
    }
  };

  // Game over
  const handleGameOver = () => {
    gameRef.current.gameRunning = false;
    setGameOver(true);
  };

  // Restart game
  const restartGame = () => {
    gameRef.current.snake = [{ x: 10, y: 10 }];
    gameRef.current.dx = 0;
    gameRef.current.dy = 0;
    gameRef.current.gameRunning = true;
    setScore(0);
    setGameOver(false);
    setGamePaused(false);
    generateFood();
  };

  // Touch controls for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    gameRef.current.touchStartX = touch.clientX;
    gameRef.current.touchStartY = touch.clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!gameRef.current.gameRunning || gamePaused) return;

    const touch = e.changedTouches[0];
    const touchEndX = touch.clientX;
    const touchEndY = touch.clientY;
    
    const deltaX = touchEndX - (gameRef.current.touchStartX || 0);
    const deltaY = touchEndY - (gameRef.current.touchStartY || 0);
    
    const minSwipeDistance = 30;
    const { dx, dy } = gameRef.current;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0 && dx !== -1) {
          gameRef.current.dx = 1;
          gameRef.current.dy = 0; // Right
        } else if (deltaX < 0 && dx !== 1) {
          gameRef.current.dx = -1;
          gameRef.current.dy = 0; // Left
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0 && dy !== -1) {
          gameRef.current.dx = 0;
          gameRef.current.dy = 1; // Down
        } else if (deltaY < 0 && dy !== 1) {
          gameRef.current.dx = 0;
          gameRef.current.dy = -1; // Up
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-purple-800 flex items-center justify-center p-4">
      <div className="text-center bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 max-w-md w-full">
        <h1 className="text-4xl font-bold text-white mb-6 text-shadow-lg">
          🐍 Snake Game
        </h1>
        
        <div className="text-2xl text-white mb-6 font-semibold">
          Score: <span className="text-yellow-300">{score}</span>
        </div>
        
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="border-4 border-white/30 rounded-2xl bg-black/20 block mx-auto mb-6 max-w-full h-auto"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        />
        
        <div className="text-white text-lg mb-4">
          Use arrow keys or WASD to move<br />
          Press SPACE to pause/resume<br />
          <span className="text-sm opacity-75">Swipe on mobile devices</span>
        </div>

        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-3xl">
            <div className="bg-black/90 p-8 rounded-2xl text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Game Over!</h2>
              <p className="text-xl text-white mb-6">
                Final Score: <span className="text-yellow-300 font-bold">{score}</span>
              </p>
              <button
                onClick={restartGame}
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-full text-lg transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Play Again
              </button>
            </div>
          </div>
        )}

        {gamePaused && !gameOver && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-3xl">
            <div className="text-white text-4xl font-bold">PAUSED</div>
          </div>
        )}
      </div>
    </div>
  );
}