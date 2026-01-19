import { useEffect, useState } from "react";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mostra a animação apenas no primeiro carregamento
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="relative flex flex-col items-center">
          {/* Foguete animado */}
          <div className="rocket-container">
            <svg
              className="w-20 h-20 rocket-animation"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Corpo do foguete */}
              <path
                d="M50 10 C50 10 70 35 70 60 C70 75 60 85 50 85 C40 85 30 75 30 60 C30 35 50 10 50 10 Z"
                fill="url(#rocketGrad)"
              />

              {/* Janela */}
              <circle cx="50" cy="45" r="10" fill="#6366F1" />
              <circle cx="50" cy="45" r="6" fill="#1a1a2e" />

              {/* Asas */}
              <path d="M30 60 L15 80 L30 72 Z" fill="#8B5CF6" />
              <path d="M70 60 L85 80 L70 72 Z" fill="#8B5CF6" />

              {/* Chamas animadas */}
              <g className="flame-animation">
                <path
                  d="M40 85 L50 105 L60 85 Q50 92 40 85 Z"
                  fill="url(#flameGrad)"
                />
                <path d="M44 85 L50 95 L56 85 Q50 89 44 85 Z" fill="#FBBF24" />
              </g>

              {/* Gradientes */}
              <defs>
                <linearGradient
                  id="rocketGrad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="100%" stopColor="#e2e8f0" />
                </linearGradient>
                <linearGradient
                  id="flameGrad"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#F97316" />
                  <stop offset="50%" stopColor="#EAB308" />
                  <stop offset="100%" stopColor="#FBBF24" />
                </linearGradient>
              </defs>
            </svg>

            {/* Partículas de fumaça */}
            <div className="smoke-particles">
              <div
                className="smoke-particle"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="smoke-particle"
                style={{ animationDelay: "100ms" }}
              />
              <div
                className="smoke-particle"
                style={{ animationDelay: "200ms" }}
              />
            </div>
          </div>

          {/* Texto */}
          <p className="mt-6 text-lg font-medium gradient-text">TurbineApp</p>
          <p className="mt-1 text-sm text-muted-foreground animate-pulse">
            Preparando decolagem...
          </p>
        </div>

        {/* Estilos da animação */}
        <style>{`
          .rocket-container {
            position: relative;
            animation: rocket-takeoff 1.5s ease-in-out forwards;
          }
          
          @keyframes rocket-takeoff {
            0% {
              transform: translateY(50px);
              opacity: 0;
            }
            30% {
              transform: translateY(0px);
              opacity: 1;
            }
            70% {
              transform: translateY(0px);
              opacity: 1;
            }
            100% {
              transform: translateY(-100px);
              opacity: 0;
            }
          }
          
          .rocket-animation {
            animation: rocket-hover 0.3s ease-in-out infinite;
          }
          
          @keyframes rocket-hover {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-5px);
            }
          }
          
          .flame-animation {
            animation: flame-flicker 0.1s ease-in-out infinite;
            transform-origin: center top;
          }
          
          @keyframes flame-flicker {
            0%, 100% {
              transform: scaleY(1) scaleX(1);
            }
            50% {
              transform: scaleY(1.3) scaleX(0.85);
            }
          }
          
          .smoke-particles {
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 8px;
          }
          
          .smoke-particle {
            width: 10px;
            height: 10px;
            background: linear-gradient(135deg, #6366F1, #8B5CF6);
            border-radius: 50%;
            animation: smoke-rise 0.4s ease-out infinite;
            opacity: 0.7;
          }
          
          @keyframes smoke-rise {
            0% {
              transform: translateY(0) scale(1);
              opacity: 0.7;
            }
            100% {
              transform: translateY(40px) scale(0.2);
              opacity: 0;
            }
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
}
