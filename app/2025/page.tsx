"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Star,
  Heart,
  PartyPopper,
  Sparkles,
  Music,
  Volume2,
  VolumeX,
} from "lucide-react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface TimeUnitProps {
  value: number;
  label: string;
  onClick: () => void;
}

interface FloatingElementProps {
  index: number;
  interactive?: boolean;
}

interface Position {
  x: number;
  y: number;
}

interface PlayfulFiveProps {
  position: Position;
  setPosition: (position: Position | ((prev: Position) => Position)) => void;
  isHovered: boolean;
  setIsHovered: (isHovered: boolean) => void;
  isCelebrating: boolean;
}

const PlayfulFive: React.FC<PlayfulFiveProps> = ({
  position,
  setPosition,
  isHovered,
  setIsHovered,
  isCelebrating,
}) => {
  const [direction, setDirection] = useState({ x: 1, y: 1 });
  const [isJumping, setIsJumping] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  const [speech, setSpeech] = useState("");

  useEffect(() => {
    if (isCelebrating) return;

    const moveCharacter = () => {
      setPosition((prev) => {
        const newX = prev.x + direction.x * 2;
        const newY = prev.y + direction.y * 2;

        let newDirectionX = direction.x;
        let newDirectionY = direction.y;

        if (newX < 0 || newX > window.innerWidth - 50) newDirectionX *= -1;
        if (newY < 0 || newY > window.innerHeight - 50) newDirectionY *= -1;

        setDirection({ x: newDirectionX, y: newDirectionY });

        return {
          x: Math.max(0, Math.min(window.innerWidth - 50, newX)),
          y: Math.max(0, Math.min(window.innerHeight - 50, newY)),
        };
      });
    };

    const moveInterval = setInterval(moveCharacter, 50);
    return () => clearInterval(moveInterval);
  }, [direction, isCelebrating, setPosition]);

  useEffect(() => {
    if (isCelebrating) return;

    const randomAction = () => {
      const actions = [
        () => setIsJumping(true),
        () => setIsWaving(true),
        () => setSpeech("I'm the future! 👋"),
        () => setSpeech("2025 here I come! 🎉"),
        () => setSpeech("Can't wait! ⭐"),
      ];

      const action = actions[Math.floor(Math.random() * actions.length)];
      action();

      setTimeout(() => {
        setIsJumping(false);
        setIsWaving(false);
        setSpeech("");
      }, 2000);
    };

    const actionInterval = setInterval(randomAction, 5000);
    return () => clearInterval(actionInterval);
  }, [isCelebrating]);

  return (
    <div
      className={`absolute transition-transform cursor-pointer select-none z-50
        ${isJumping ? "animate-jump" : ""}
        ${isWaving ? "animate-wave" : ""}
        ${isHovered ? "scale-110" : ""}
        ${isCelebrating ? "animate-celebration-dance" : ""}`}
      style={{
        left: position.x,
        top: position.y,
        transform: `scaleX(${direction.x < 0 ? -1 : 1})`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {speech && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white rounded-lg px-4 py-2 text-black text-sm whitespace-nowrap animate-pop-in">
          {speech}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-white border-r-transparent border-l-transparent" />
        </div>
      )}

      <div className="relative">
        <svg
          width="40"
          height="60"
          viewBox="0 0 40 60"
          className="filter drop-shadow-lg"
        >
          <path
            d="M5 10 H30 V25 Q35 25 35 30 Q35 35 30 35 H10 Q5 35 5 40 Q5 45 10 45 H35"
            stroke={isHovered ? "#FFD700" : "#FFF"}
            strokeWidth="4"
            fill="none"
            className="transition-colors duration-300"
          />
          <circle
            cx="15"
            cy="20"
            r="2"
            fill={isHovered ? "#FFD700" : "#FFF"}
            className="animate-blink"
          />
          <circle
            cx="25"
            cy="20"
            r="2"
            fill={isHovered ? "#FFD700" : "#FFF"}
            className="animate-blink"
          />
          <path
            d="M15 25 Q20 30 25 25"
            stroke={isHovered ? "#FFD700" : "#FFF"}
            strokeWidth="2"
            fill="none"
          />
          <path
            className={`${isWaving ? "animate-wave-arm" : ""}`}
            d="M0 30 H5 M35 30 H40"
            stroke={isHovered ? "#FFD700" : "#FFF"}
            strokeWidth="3"
          />
          <path
            className={`${isJumping ? "animate-kick" : ""}`}
            d="M10 45 L5 55 M30 45 L35 55"
            stroke={isHovered ? "#FFD700" : "#FFF"}
            strokeWidth="3"
          />
        </svg>
      </div>
    </div>
  );
};

const FloatingElement: React.FC<FloatingElementProps> = React.memo(
  ({ index, interactive }) => {
    const [isHovered, setIsHovered] = useState(false);

    const style = useMemo(() => {
      const gridSize = 8;
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;

      const baseX = (col / (gridSize - 1)) * 100;
      const baseY = (row / (gridSize - 1)) * 100;

      const randomOffsetX = (Math.random() - 0.5) * 25;
      const randomOffsetY = (Math.random() - 0.5) * 25;

      const x = baseX + randomOffsetX;
      const y = baseY + randomOffsetY;

      const duration = 12 + (index % 8) * 2;
      const delay = -(index * 0.3);

      return {
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        animation: `
        float${index % 4} ${duration}s infinite ${delay}s ease-in-out,
        pulse ${4 + (index % 3)}s infinite ${delay}s ease-in-out
      `,
        transform: isHovered ? "scale(1.2)" : "scale(1)",
        transition: "transform 0.3s ease-in-out",
        cursor: interactive ? "pointer" : "default",
      } as const;
    }, [index, isHovered, interactive]);

    const size = useMemo(() => 16 + (index % 6) * 4, [index]);

    return (
      <div
        className="absolute transform-gpu"
        style={style}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {index % 4 === 0 ? (
          <Star
            className="text-yellow-300 transform-gpu opacity-80"
            size={size}
            strokeWidth={1.5}
          />
        ) : index % 4 === 1 ? (
          <Heart
            className="text-pink-400 transform-gpu opacity-80"
            size={size}
            strokeWidth={1.5}
          />
        ) : index % 4 === 2 ? (
          <PartyPopper
            className="text-purple-400 transform-gpu opacity-80"
            size={size}
            strokeWidth={1.5}
          />
        ) : (
          <Sparkles
            className="text-blue-400 transform-gpu opacity-80"
            size={size}
            strokeWidth={1.5}
          />
        )}
      </div>
    );
  }
);

const TimeUnit: React.FC<TimeUnitProps> = React.memo(
  ({ value, label, onClick }) => (
    <div
      className="flex flex-col items-center space-y-2 group cursor-pointer"
      onClick={onClick}
    >
      <div
        className="
      w-24 h-24 bg-white/10 backdrop-blur-md rounded-xl
      flex items-center justify-center
      transform transition-all duration-300
      group-hover:scale-110 group-hover:bg-white/20 group-hover:shadow-lg group-hover:shadow-white/20
    "
      >
        <span
          className="
        text-4xl font-bold
        text-white group-hover:text-yellow-300
        transition-colors duration-300
      "
        >
          {value.toString().padStart(2, "0")}
        </span>
      </div>
      <span
        className="
      text-sm uppercase tracking-wider
      text-white/80 group-hover:text-yellow-300
      transition-colors duration-300
    "
      >
        {label}
      </span>
    </div>
  )
);

const NewYearCountdown: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [showCelebration, setShowCelebration] = useState(false);
  const [sound, setSound] = useState(false);
  const [characterPosition, setCharacterPosition] = useState({
    x: 100,
    y: 100,
  });
  const [isCharacterHovered, setIsCharacterHovered] = useState(false);
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);

  useEffect(() => {
    const calculateTimeLeft = (): TimeLeft => {
      const now = new Date();
      const newYear = new Date(2025, 0, 1);
      const difference = newYear.getTime() - now.getTime();

      if (difference <= 0) {
        setShowCelebration(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const addParticle = useCallback((x: number, y: number) => {
    const newParticle = {
      x,
      y,
      id: Date.now() + Math.random(),
    };
    setParticles((prev) => [...prev, newParticle]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
    }, 1000);
  }, []);

  const backgroundElements = useMemo(
    () =>
      [...Array(48)].map((_, i) => (
        <FloatingElement key={i} index={i} interactive={i % 3 === 0} />
      )),
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-60">{backgroundElements}</div>

      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute pointer-events-none animate-particle"
          style={{
            left: particle.x,
            top: particle.y,
          }}
        >
          <Sparkles className="text-yellow-300" size={24} />
        </div>
      ))}

      <PlayfulFive
        position={characterPosition}
        setPosition={setCharacterPosition}
        isHovered={isCharacterHovered}
        setIsHovered={setIsCharacterHovered}
        isCelebrating={showCelebration}
      />

      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="text-[150px] md:text-[250px] font-bold text-white/10 select-none tracking-wider animate-pulse">
          {showCelebration ? "2025" : "2024"}
        </div>
      </div>

      <button
        onClick={() => setSound(!sound)}
        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors duration-300"
      >
        {sound ? (
          <Volume2 className="w-6 h-6" />
        ) : (
          <VolumeX className="w-6 h-6" />
        )}
      </button>

      <div className="relative z-10 flex flex-col items-center space-y-12">
        <h1 className="text-white text-4xl md:text-5xl font-bold tracking-wider mb-8 animate-text-glow">
          New Year Countdown
        </h1>

        {!showCelebration ? (
          <div className="flex flex-wrap justify-center gap-6">
            <TimeUnit
              value={timeLeft.days}
              label="Days"
              onClick={() =>
                addParticle(
                  Math.random() * window.innerWidth,
                  Math.random() * window.innerHeight
                )
              }
            />
            <TimeUnit
              value={timeLeft.hours}
              label="Hours"
              onClick={() =>
                addParticle(
                  Math.random() * window.innerWidth,
                  Math.random() * window.innerHeight
                )
              }
            />
            <TimeUnit
              value={timeLeft.minutes}
              label="Minutes"
              onClick={() =>
                addParticle(
                  Math.random() * window.innerWidth,
                  Math.random() * window.innerHeight
                )
              }
            />
            <TimeUnit
              value={timeLeft.seconds}
              label="Seconds"
              onClick={() =>
                addParticle(
                  Math.random() * window.innerWidth,
                  Math.random() * window.innerHeight
                )
              }
            />
          </div>
        ) : (
          <div className="text-center space-y-6 animate-celebration">
            <h2 className="text-7xl md:text-8xl font-bold text-white animate-text-glow">
              Happy 2025!
            </h2>
            <PartyPopper className="w-20 h-20 text-yellow-400 mx-auto animate-bounce" />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes float0 {
          0%,
          100% {
            transform: translate(-50%, -50%) rotate(0deg) translateY(0);
          }
          50% {
            transform: translate(-50%, -50%) rotate(180deg) translateY(-30px);
          }
        }

        @keyframes float1 {
          0%,
          100% {
            transform: translate(-50%, -50%) rotate(0deg) translateX(0);
          }
          50% {
            transform: translate(-50%, -50%) rotate(-180deg) translateX(30px);
          }
        }

        @keyframes float2 {
          0%,
          100% {
            transform: translate(-50%, -50%) rotate(0deg) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) rotate(180deg) scale(1.2);
          }
        }

        @keyframes float3 {
          0%,
          100% {
            transform: translate(-50%, -50%) rotate(0deg) translateY(0)
              translateX(0);
          }
          50% {
            transform: translate(-50%, -50%) rotate(360deg) translateY(-20px)
              translateX(20px);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.8;
          }
          50% {
            opacity: 0.3;
          }
        }

        @keyframes particle {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(
                calc(var(--random-x) * 100px),
                calc(var(--random-y) * -100px)
              )
              scale(0);
            opacity: 0;
          }
        }

        @keyframes text-glow {
          0%,
          100% {
            text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
          }
          50% {
            text-shadow: 0 0 30px rgba(255, 255, 255, 0.8);
          }
        }

        @keyframes celebration {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes jump {
          0%,
          100% {
            transform: translateY(0) scaleY(1);
          }
          50% {
            transform: translateY(-20px) scaleY(0.9);
          }
        }

        @keyframes wave {
          0%,
          100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-15deg);
          }
          75% {
            transform: rotate(15deg);
          }
        }

        @keyframes wave-arm {
          0%,
          100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-20deg);
          }
          75% {
            transform: rotate(20deg);
          }
        }

        @keyframes kick {
          0%,
          100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(15deg);
          }
        }

        @keyframes blink {
          0%,
          90%,
          100% {
            transform: scaleY(1);
          }
          95% {
            transform: scaleY(0.1);
          }
        }

        @keyframes pop-in {
          0% {
            transform: translate(-50%, 10px) scale(0);
            opacity: 0;
          }
          100% {
            transform: translate(-50%, 0) scale(1);
            opacity: 1;
          }
        }

        @keyframes celebration-dance {
          0%,
          100% {
            transform: scale(1) rotate(0deg);
          }
          25% {
            transform: scale(1.1) rotate(-5deg);
          }
          75% {
            transform: scale(1.1) rotate(5deg);
          }
        }

        .animate-particle {
          --random-x: ${Math.random() * 2 - 1};
          --random-y: ${Math.random()};
          animation: particle 1s ease-out forwards;
        }

        .animate-text-glow {
          animation: text-glow 2s ease-in-out infinite;
        }

        .animate-celebration {
          animation: celebration 1s ease-out forwards;
        }

        .animate-jump {
          animation: jump 0.5s ease-in-out;
        }

        .animate-wave {
          animation: wave 0.5s ease-in-out;
        }

        .animate-blink {
          animation: blink 3s infinite;
        }

        .animate-pop-in {
          animation: pop-in 0.3s ease-out forwards;
        }

        .animate-celebration-dance {
          animation: celebration-dance 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default NewYearCountdown;
