"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/utils/translations';
import { X, Map, Shield, Coins, CheckCircle } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const slides = [
  {
    icon: Map,
    title: {
      en: 'Map of Opportunities',
      ru: 'Карта возможностей',
    },
    description: {
      en: 'Find tasks nearby or delegate your tasks to people around the world.',
      ru: 'Находи задания рядом или делегируй свои задачи людям по всему миру.',
    },
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Shield,
    title: {
      en: 'Secure Payments',
      ru: 'Безопасные платежи',
    },
    description: {
      en: 'Your Stars are protected. Payment occurs only after confirmation of completion.',
      ru: 'Твои Stars под защитой. Оплата происходит только после подтверждения выполнения.',
    },
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Coins,
    title: {
      en: 'Earn Everywhere',
      ru: 'Зарабатывай везде',
    },
    description: {
      en: 'Become part of the global Pulse helper network.',
      ru: 'Стань частью глобальной сети помощников Pulse.',
    },
    color: 'from-purple-500 to-pink-500',
  },
];

export default function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const { language } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const savedOnboarding = localStorage.getItem('onboarding_completed');
      if (savedOnboarding === 'true') {
        onComplete();
      }
    }
  }, [isOpen, onComplete]);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide(currentSlide + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      // Complete onboarding
      localStorage.setItem('onboarding_completed', 'true');
      setIsAnimating(true);
      setTimeout(() => {
        onComplete();
      }, 300);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    onComplete();
  };

  if (!isOpen) return null;

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <>
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[5000]" />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md z-[5001]">
        <div className={`bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl
                        border border-cyan-500/30 rounded-3xl p-8 
                        shadow-[0_0_40px_rgba(34,211,238,0.2)]
                        transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          
          {/* Close button (only on last slide) */}
          {currentSlide === slides.length - 1 && (
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          )}

          {/* Icon */}
          <div className="text-center mb-8">
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r ${slide.color}
                            flex items-center justify-center shadow-lg`}>
              <Icon size={48} className="text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-3">
              {slide.title[language as 'en' | 'ru']}
            </h2>
            <p className="text-gray-400 text-center leading-relaxed">
              {slide.description[language as 'en' | 'ru']}
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAnimating(true);
                  setTimeout(() => {
                    setCurrentSlide(index);
                    setIsAnimating(false);
                  }, 300);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? `w-8 bg-gradient-to-r ${slide.color}`
                    : 'bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={handleNext}
              className={`w-full py-4 rounded-xl font-bold text-white
                         bg-gradient-to-r ${slide.color}
                         hover:opacity-90 transition-all duration-300
                         active:scale-98 shadow-lg`}
            >
              {currentSlide === slides.length - 1 ? (
                <>
                  <CheckCircle size={20} className="inline mr-2" />
                  {language === 'ru' ? 'Начать!' : 'Get Started!'}
                </>
              ) : (
                'Next →'
              )}
            </button>

            {currentSlide < slides.length - 1 && (
              <button
                onClick={handleSkip}
                className="w-full py-3 text-gray-400 hover:text-white transition-colors text-sm"
              >
                {language === 'ru' ? 'Пропустить' : 'Skip'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
