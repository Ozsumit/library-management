"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Star, Heart, PartyPopper } from "lucide-react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface TimeUnitProps {
  value: number;
  label: string;
}

interface FloatingElementProps {
  index: number;
}

const NewYearCountdown = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [showCelebration, setShowCelebration] = useState(false);

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

  const FloatingElement: React.FC<FloatingElementProps> = React.memo(
    ({ index }) => {
      const style = useMemo(() => {
        // Create a grid-like distribution with some randomness
        const gridSize = 6; // 6x6 grid for 36 potential positions
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;

        // Calculate base position as percentage
        const baseX = (col / (gridSize - 1)) * 100;
        const baseY = (row / (gridSize - 1)) * 100;

        // Add randomness to position
        const randomOffsetX = (Math.random() - 0.5) * 20;
        const randomOffsetY = (Math.random() - 0.5) * 20;

        const x = baseX + randomOffsetX;
        const y = baseY + randomOffsetY;

        // Animation properties
        const duration = 15 + (index % 7) * 2;
        const delay = -(index * 0.5);
        const radius = 30 + Math.sin(index * 0.5) * 20;

        return {
          position: "absolute",
          left: `${x}%`,
          top: `${y}%`,
          animation: `
          float${index % 3} ${duration}s infinite ${delay}s ease-in-out,
          pulse ${3 + (index % 2)}s infinite ${delay}s ease-in-out
        `,
          transform: "translate(-50%, -50%)",
          transformOrigin: "center",
        } as const;
      }, [index]);

      const size = useMemo(() => 16 + (index % 5) * 4, [index]);

      return (
        <div className="absolute transform-gpu" style={style}>
          {index % 3 === 0 ? (
            <Star
              className="text-yellow-300 transform-gpu opacity-80"
              size={size}
              strokeWidth={1.5}
            />
          ) : index % 3 === 1 ? (
            <Heart
              className="text-pink-400 transform-gpu opacity-80"
              size={size}
              strokeWidth={1.5}
            />
          ) : (
            <PartyPopper
              className="text-purple-400 transform-gpu opacity-80"
              size={size}
              strokeWidth={1.5}
            />
          )}
        </div>
      );
    }
  );

  const TimeUnit: React.FC<TimeUnitProps> = React.memo(({ value, label }) => (
    <div className="flex flex-col items-center space-y-2">
      <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
        <span className="text-4xl font-bold text-white">
          {value.toString().padStart(2, "0")}
        </span>
      </div>
      <span className="text-white/80 text-sm uppercase tracking-wider">
        {label}
      </span>
    </div>
  ));

  const backgroundElements = useMemo(
    () => [...Array(36)].map((_, i) => <FloatingElement key={i} index={i} />),
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-60">{backgroundElements}</div>

      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="text-[150px] md:text-[250px] font-bold text-white/10 select-none tracking-wider">
          2024
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-12">
        <h1 className="text-white text-4xl md:text-5xl font-bold tracking-wider mb-8">
          New Year Countdown
        </h1>

        {!showCelebration ? (
          <div className="flex flex-wrap justify-center gap-6">
            <TimeUnit value={timeLeft.days} label="Days" />
            <TimeUnit value={timeLeft.hours} label="Hours" />
            <TimeUnit value={timeLeft.minutes} label="Minutes" />
            <TimeUnit value={timeLeft.seconds} label="Seconds" />
          </div>
        ) : (
          <div className="text-center space-y-6 animate-bounce">
            <h2 className="text-7xl md:text-8xl font-bold text-white">
              Happy 2025!
            </h2>
            <PartyPopper className="w-20 h-20 text-yellow-400 mx-auto" />
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
            transform: translate(-50%, -50%) rotate(180deg) translateY(-20px);
          }
        }

        @keyframes float1 {
          0%,
          100% {
            transform: translate(-50%, -50%) rotate(0deg) translateX(0);
          }
          50% {
            transform: translate(-50%, -50%) rotate(-180deg) translateX(20px);
          }
        }

        @keyframes float2 {
          0%,
          100% {
            transform: translate(-50%, -50%) rotate(0deg) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) rotate(180deg) scale(1.1);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.8;
          }
          50% {
            opacity: 0.4;
          }
        }
      `}</style>
    </div>
  );
};

export default NewYearCountdown;
