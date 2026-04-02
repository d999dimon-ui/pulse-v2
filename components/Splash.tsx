"use client";

import { useEffect, useState } from 'react';
import PulseLogo from './PulseLogo';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/i18n';

interface SplashProps {
  onFinish: () => void;
}

export default function Splash({ onFinish }: SplashProps) {
  const { language } = useLanguage();
  const [stage, setStage] = useState<'logo' | 'lightning' | 'subtitle' | 'fade'>('logo');

  useEffect(() => {
    // Animation sequence
    const timeline = [
      { stage: 'logo' as const, delay: 300 },
      { stage: 'lightning' as const, delay: 800 },
      { stage: 'subtitle' as const, delay: 1400 },
      { stage: 'fade' as const, delay: 2400 },
    ];

    timeline.forEach(({ stage: s, delay }) => {
      setTimeout(() => setStage(s), delay);
    });

    // Finish after animation
    const timer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  const subtitle = language === 'ru' 
    ? 'Быстрее, чем бьется пульс'
    : 'Faster than a heartbeat';

  return (
    <div className={`fixed inset-0 z-[10000] flex flex-col items-center justify-center
                       bg-gradient-to-b from-black via-gray-900 to-black
                       transition-opacity duration-500
                       ${stage === 'fade' ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255, 153, 0, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 153, 0, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Main Logo */}
      <div className={`relative transition-all duration-700 transform
                        ${stage === 'logo' ? 'scale-100 opacity-100' : 'scale-100 opacity-100'}
                        ${stage === 'fade' ? 'scale-110 opacity-0' : ''}`}>
        <PulseLogo size={180} withText={true} />
      </div>

      {/* Lightning animation overlay */}
      {stage === 'lightning' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] pointer-events-none">
          <div className="w-full h-full relative">
            {/* Lightning bolt effect */}
            <svg viewBox="0 0 200 200" className="w-full h-full absolute">
              <path
                d="M100 20 L90 80 L110 80 L100 140"
                stroke="#FF9900"
                strokeWidth="3"
                fill="none"
                filter="url(#neonGlow)"
                className="animate-pulse"
                style={{
                  strokeDasharray: '200',
                  strokeDashoffset: '200',
                  animation: 'drawLightning 0.6s ease-out forwards'
                }}
              />
              <defs>
                <filter id="neonGlow">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
            </svg>
          </div>
        </div>
      )}

      {/* Subtitle */}
      <div className={`mt-8 transition-all duration-700 transform
                        ${stage === 'subtitle' || stage === 'fade' 
                          ? 'opacity-100 translate-y-0' 
                          : 'opacity-0 translate-y-4'}`}>
        <p className="text-gray-400 text-sm font-light tracking-widest uppercase">
          {subtitle}
        </p>
      </div>

      {/* Loading indicator */}
      <div className={`absolute bottom-20 transition-opacity duration-500
                        ${stage === 'logo' ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes drawLightning {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}
