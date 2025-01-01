import React, { useEffect, useRef, useState } from "react";
import { Rocket, Heart, ZapOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GameState {
  score: number;
  lives: number;
  gameOver: boolean;
  hyperspaceCooldown: number;
  laserCooldown: number;
  powerUps: {
    gold: number;
    silver: number;
    platinum: number;
    radioactive: number;
  };
}

interface Ship {
  x: number;
  y: number;
  rotation: number;
  velocity: { x: number; y: number };
  thrusting: boolean;
}

interface Asteroid {
  x: number;
  y: number;
  size: number;
  velocity: { x: number; y: number };
  rotation: number;
  rotationSpeed: number;
  isFragment?: boolean; // New property to track if it's a fragment
}

interface Laser {
  x: number;
  y: number;
  rotation: number;
  life: number;
}

interface Particle {
  x: number;
  y: number;
  velocity: { x: number; y: number };
  life: number;
}

interface Star {
  x: number;
  y: number;
  speed: number;
  size: number;
}

interface PowerUp {
  x: number;
  y: number;
  type: string;
  velocity: { x: number; y: number };
  life: number;
}

const AsteroidGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    lives: 3,
    gameOver: false,
    hyperspaceCooldown: 0,
    laserCooldown: 0,
    powerUps: {
      gold: 0,
      silver: 0,
      platinum: 0,
      radioactive: 0,
    },
  });

  const [ship, setShip] = useState<Ship>({
    x: 0,
    y: 0,
    rotation: 0,
    velocity: { x: 0, y: 0 },
    thrusting: false,
  });

  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [lasers, setLasers] = useState<Laser[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [stars, setStars] = useState<Star[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);

  const keys = useRef({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    Space: false,
    Shift: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.width = 800;
    canvas.height = 600;

    const initStars = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: Math.random() * 2 + 1,
      size: Math.random() * 2 + 1,
    }));
    setStars(initStars);

    setShip((prev) => ({
      ...prev,
      x: canvas.width / 2,
      y: canvas.height / 2,
    }));

    spawnAsteroids(3);
  }, []);

  useEffect(() => {
    if (gameState.gameOver) return;

    const gameLoop = setInterval(() => {
      update();
      draw();
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [ship, asteroids, lasers, particles, gameState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code in keys.current) {
        e.preventDefault();
        keys.current[e.code as keyof typeof keys.current] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code in keys.current) {
        e.preventDefault();
        keys.current[e.code as keyof typeof keys.current] = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const update = () => {
    updateShip();
    updateAsteroids();
    updateLasers();
    updateParticles();
    updateStars();
    updatePowerUps();
    checkCollisions();
    updateCooldowns();
  };

  const updateShip = () => {
    if (keys.current.ArrowLeft) {
      setShip((prev) => ({
        ...prev,
        rotation: prev.rotation - 0.1,
      }));
    }
    if (keys.current.ArrowRight) {
      setShip((prev) => ({
        ...prev,
        rotation: prev.rotation + 0.1,
      }));
    }

    if (keys.current.ArrowUp) {
      const thrust = 0.5;
      setShip((prev) => ({
        ...prev,
        velocity: {
          x: prev.velocity.x + Math.cos(prev.rotation) * thrust,
          y: prev.velocity.y + Math.sin(prev.rotation) * thrust,
        },
        thrusting: true,
      }));
    } else if (keys.current.ArrowDown) {
      const thrust = -0.5;
      setShip((prev) => ({
        ...prev,
        velocity: {
          x: prev.velocity.x + Math.cos(prev.rotation) * thrust,
          y: prev.velocity.y + Math.sin(prev.rotation) * thrust,
        },
        thrusting: true,
      }));
    } else {
      setShip((prev) => ({ ...prev, thrusting: false }));
    }

    setShip((prev) => ({
      ...prev,
      x: (prev.x + prev.velocity.x + 800) % 800,
      y: (prev.y + prev.velocity.y + 600) % 600,
      velocity: {
        x: prev.velocity.x * 0.99,
        y: prev.velocity.y * 0.99,
      },
    }));

    if (keys.current.Space && gameState.laserCooldown === 0) {
      shootLaser();
    }

    if (keys.current.Shift && gameState.hyperspaceCooldown === 0) {
      hyperspace();
    }
  };

  const updateAsteroids = () => {
    setAsteroids((prev) =>
      prev.map((asteroid) => ({
        ...asteroid,
        x: (asteroid.x + asteroid.velocity.x + 800) % 800,
        y: (asteroid.y + asteroid.velocity.y + 600) % 600,
        rotation: asteroid.rotation + asteroid.rotationSpeed,
      }))
    );
  };

  const updateLasers = () => {
    setLasers((prev) =>
      prev
        .map((laser) => ({
          ...laser,
          x: laser.x + Math.cos(laser.rotation) * 10,
          y: laser.y + Math.sin(laser.rotation) * 10,
          life: laser.life - 1,
        }))
        .filter(
          (laser) =>
            laser.life > 0 &&
            laser.x >= 0 &&
            laser.x <= 800 &&
            laser.y >= 0 &&
            laser.y <= 600
        )
    );
  };

  const updateParticles = () => {
    setParticles((prev) =>
      prev
        .map((particle) => ({
          ...particle,
          x: particle.x + particle.velocity.x,
          y: particle.y + particle.velocity.y,
          life: particle.life - 1,
        }))
        .filter((particle) => particle.life > 0)
    );
  };

  const updateStars = () => {
    setStars((prev) =>
      prev.map((star) => ({
        ...star,
        x: (star.x - star.speed + 800) % 800,
      }))
    );
  };

  const updatePowerUps = () => {
    setPowerUps((prev) =>
      prev
        .map((powerUp) => ({
          ...powerUp,
          x: powerUp.x + powerUp.velocity.x,
          y: powerUp.y + powerUp.velocity.y,
          life: powerUp.life - 1,
        }))
        .filter((powerUp) => powerUp.life > 0)
    );
  };

  const updateCooldowns = () => {
    setGameState((prev) => ({
      ...prev,
      laserCooldown: Math.max(0, prev.laserCooldown - 1),
      hyperspaceCooldown: Math.max(0, prev.hyperspaceCooldown - 1),
    }));
  };

  const checkCollisions = () => {
    lasers.forEach((laser) => {
      asteroids.forEach((asteroid) => {
        const dx = laser.x - asteroid.x;
        const dy = laser.y - asteroid.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < asteroid.size) {
          destroyAsteroid(asteroid);
          setLasers((prev) => prev.filter((l) => l !== laser));
        }
      });
    });

    asteroids.forEach((asteroid) => {
      if (asteroid.size > 10) {
        const dx = ship.x - asteroid.x;
        const dy = ship.y - asteroid.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < asteroid.size + 10) {
          shipHit();
        }
      }
    });

    powerUps.forEach((powerUp) => {
      const dx = ship.x - powerUp.x;
      const dy = ship.y - powerUp.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 20) {
        collectPowerUp(powerUp);
      }
    });
  };

  const destroyAsteroid = (asteroid: Asteroid) => {
    setAsteroids((prev) => {
      const newAsteroids = prev.filter((a) => a !== asteroid);

      if (asteroid.size > 20 && !asteroid.isFragment) {
        const fragmentCount = Math.min(3, Math.floor(asteroid.size / 20));
        const fragments = Array.from({ length: fragmentCount }, () => ({
          x: asteroid.x,
          y: asteroid.y,
          size: asteroid.size * 0.6,
          velocity: {
            x: asteroid.velocity.x + (Math.random() - 0.5) * 2,
            y: asteroid.velocity.y + (Math.random() - 0.5) * 2,
          },
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed:
            asteroid.rotationSpeed * (1 + (Math.random() - 0.5) * 0.5),
          isFragment: true, // Mark as fragment
        }));
        return [...newAsteroids, ...fragments];
      }
      return newAsteroids;
    });

    const maxParticles = 3;
    const particleCount = Math.min(maxParticles, Math.floor(asteroid.size / 3));

    setParticles((prev) => {
      const maxTotalParticles = 12;
      const currentParticles =
        prev.length > maxTotalParticles ? prev.slice(-maxTotalParticles) : prev;

      const newParticles = Array.from({ length: particleCount }, () => ({
        x: asteroid.x + (Math.random() - 0.5) * asteroid.size,
        y: asteroid.y + (Math.random() - 0.5) * asteroid.size,
        velocity: {
          x: asteroid.velocity.x * 0.5 + (Math.random() - 0.5) * 3,
          y: asteroid.velocity.y * 0.5 + (Math.random() - 0.5) * 3,
        },
        life: 20 + Math.random() * 10,
      }));
      return [...currentParticles, ...newParticles];
    });

    if (asteroid.size >= 30 && Math.random() < 0.05) {
      const powerUpType =
        Math.random() < 0.7
          ? "silver"
          : Math.random() < 0.9
          ? "gold"
          : Math.random() < 0.97
          ? "platinum"
          : "radioactive";
      const newPowerUp = {
        x: asteroid.x,
        y: asteroid.y,
        type: powerUpType,
        velocity: {
          x: asteroid.velocity.x * 0.3,
          y: asteroid.velocity.y * 0.3,
        },
        life: 240,
      };
      setPowerUps((prev) => [...prev.slice(-5), newPowerUp]);
    }

    setGameState((prev) => ({
      ...prev,
      score: prev.score + Math.floor(asteroid.size * 1.5),
    }));
  };

  const shipHit = () => {
    setGameState((prev) => {
      const newLives = prev.lives - 1;
      if (newLives <= 0) {
        return { ...prev, lives: 0, gameOver: true };
      }
      return { ...prev, lives: newLives };
    });

    setShip((prev) => ({
      ...prev,
      x: 400,
      y: 300,
      velocity: { x: 0, y: 0 },
      rotation: 0,
    }));
  };

  const collectPowerUp = (powerUp: PowerUp) => {
    setGameState((prev) => ({
      ...prev,
      powerUps: {
        ...prev.powerUps,
        [powerUp.type]:
          prev.powerUps[powerUp.type as keyof typeof prev.powerUps] + 1,
      },
    }));
    setPowerUps((prev) => prev.filter((p) => p !== powerUp));
  };

  const shootLaser = () => {
    setLasers((prev) => [
      ...prev,
      {
        x: ship.x + Math.cos(ship.rotation) * 20,
        y: ship.y + Math.sin(ship.rotation) * 20,
        rotation: ship.rotation,
        life: 50,
      },
    ]);
    setGameState((prev) => ({ ...prev, laserCooldown: 10 }));
  };

  const hyperspace = () => {
    const malfunction = Math.random() < 0.1;

    if (malfunction) {
      shipHit();
    } else {
      setShip((prev) => ({
        ...prev,
        x: Math.random() * 800,
        y: Math.random() * 600,
        velocity: { x: 0, y: 0 },
      }));
    }

    setGameState((prev) => ({ ...prev, hyperspaceCooldown: 60 }));
  };

  const spawnAsteroids = (count: number) => {
    const newAsteroids = Array.from({ length: count }, () => ({
      x: Math.random() * 800,
      y: Math.random() * 600,
      size: 40 + Math.random() * 20,
      velocity: {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
      },
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.05,
    }));
    setAsteroids((prev) => [...prev, ...newAsteroids]);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#FFF";
    stars.forEach((star) => {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.save();
    ctx.translate(ship.x, ship.y);
    ctx.rotate(ship.rotation);
    ctx.strokeStyle = "#FFF";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(-10, 10);
    ctx.lineTo(-10, -10);
    ctx.closePath();
    ctx.stroke();

    if (ship.thrusting) {
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(-20 - Math.random() * 10, 0);
      ctx.strokeStyle = "#F00";
      ctx.stroke();
    }
    ctx.restore();

    asteroids.forEach((asteroid) => {
      ctx.save();
      ctx.translate(asteroid.x, asteroid.y);
      ctx.rotate(asteroid.rotation);
      ctx.strokeStyle = "#FFF";
      ctx.beginPath();
      ctx.moveTo(asteroid.size, 0);
      for (let i = 1; i < 8; i++) {
        const angle = (i * Math.PI * 2) / 8;
        const radius = asteroid.size * (0.8 + Math.random() * 0.4);
        ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    });

    ctx.strokeStyle = "#F00";
    ctx.lineWidth = 2;
    lasers.forEach((laser) => {
      ctx.beginPath();
      ctx.moveTo(laser.x, laser.y);
      ctx.lineTo(
        laser.x - Math.cos(laser.rotation) * 10,
        laser.y - Math.sin(laser.rotation) * 10
      );
      ctx.stroke();
    });

    ctx.fillStyle = "#FFF";
    particles.forEach((particle) => {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 1, 0, Math.PI * 2);
      ctx.fill();
    });

    powerUps.forEach((powerUp) => {
      ctx.fillStyle =
        powerUp.type === "gold"
          ? "#FFD700"
          : powerUp.type === "silver"
          ? "#C0C0C0"
          : powerUp.type === "platinum"
          ? "#E5E4E2"
          : "#00FF00";
      ctx.beginPath();
      ctx.arc(powerUp.x, powerUp.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const restartGame = () => {
    setGameState({
      score: 0,
      lives: 3,
      gameOver: false,
      hyperspaceCooldown: 0,
      laserCooldown: 0,
      powerUps: {
        gold: 0,
        silver: 0,
        platinum: 0,
        radioactive: 0,
      },
    });
    setShip({
      x: 400,
      y: 300,
      rotation: 0,
      velocity: { x: 0, y: 0 },
      thrusting: false,
    });
    setAsteroids([]);
    setLasers([]);
    setParticles([]);
    setPowerUps([]);
    spawnAsteroids(3);
  };

  const handleButtonPress = (action: string) => {
    keys.current[action as keyof typeof keys.current] = true;
  };

  const handleButtonRelease = (action: string) => {
    keys.current[action as keyof typeof keys.current] = false;
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto p-4 bg-gray-900 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <div className="text-white text-xl">Score: {gameState.score}</div>
        <div className="flex items-center space-x-2">
          {Array.from({ length: gameState.lives }).map((_, i) => (
            <Heart key={i} className="text-red-500" size={24} />
          ))}
        </div>
      </div>

      <canvas ref={canvasRef} className="bg-black rounded-lg shadow-lg" />

      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-24 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500"
              initial={{ width: "0%" }}
              animate={{
                width: `${(1 - gameState.laserCooldown / 10) * 100}%`,
              }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <ZapOff className="text-blue-500" size={20} />
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-2 w-24 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-purple-500"
              initial={{ width: "0%" }}
              animate={{
                width: `${(1 - gameState.hyperspaceCooldown / 60) * 100}%`,
              }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <Rocket className="text-purple-500" size={20} />
        </div>
      </div>

      <div className="absolute bottom-4 left-4 text-gray-400 text-sm">
        <div>Arrow keys to move</div>
        <div>Space to shoot</div>
        <div>Shift for hyperspace</div>
      </div>

      <div className="absolute bottom-4 left-4 flex space-x-4">
        <button
          className="bg-blue-500 text-white p-4 rounded-full"
          onTouchStart={() => handleButtonPress("ArrowLeft")}
          onTouchEnd={() => handleButtonRelease("ArrowLeft")}
          onMouseDown={() => handleButtonPress("ArrowLeft")}
          onMouseUp={() => handleButtonRelease("ArrowLeft")}
        >
          ←
        </button>
        <button
          className="bg-blue-500 text-white p-4 rounded-full"
          onTouchStart={() => handleButtonPress("ArrowRight")}
          onTouchEnd={() => handleButtonRelease("ArrowRight")}
          onMouseDown={() => handleButtonPress("ArrowRight")}
          onMouseUp={() => handleButtonRelease("ArrowRight")}
        >
          →
        </button>
      </div>
      <div className="absolute bottom-4 right-4 flex space-x-4">
        <button
          className="bg-blue-500 text-white p-4 rounded-full"
          onTouchStart={() => handleButtonPress("ArrowUp")}
          onTouchEnd={() => handleButtonRelease("ArrowUp")}
          onMouseDown={() => handleButtonPress("ArrowUp")}
          onMouseUp={() => handleButtonRelease("ArrowUp")}
        >
          ↑
        </button>
        <button
          className="bg-blue-500 text-white p-4 rounded-full"
          onTouchStart={() => handleButtonPress("ArrowDown")}
          onTouchEnd={() => handleButtonRelease("ArrowDown")}
          onMouseDown={() => handleButtonPress("ArrowDown")}
          onMouseUp={() => handleButtonRelease("ArrowDown")}
        >
          ↓
        </button>
        <button
          className="bg-blue-500 text-white p-4 rounded-full"
          onTouchStart={() => handleButtonPress("Space")}
          onTouchEnd={() => handleButtonRelease("Space")}
          onMouseDown={() => handleButtonPress("Space")}
          onMouseUp={() => handleButtonRelease("Space")}
        >
          Shoot
        </button>
        <button
          className="bg-blue-500 text-white p-4 rounded-full"
          onTouchStart={() => handleButtonPress("Shift")}
          onTouchEnd={() => handleButtonRelease("Shift")}
          onMouseDown={() => handleButtonPress("Shift")}
          onMouseUp={() => handleButtonRelease("Shift")}
        >
          Hyperspace
        </button>
      </div>

      <AnimatePresence>
        {gameState.gameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80"
          >
            <div className="text-4xl text-white mb-4">Game Over</div>
            <div className="text-2xl text-gray-300 mb-8">
              Final Score: {gameState.score}
            </div>
            <button
              onClick={restartGame}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                           transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Play Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AsteroidGame;
