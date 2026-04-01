"use client";

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { X, Heart, Globe, Users, Zap } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const { language } = useLanguage();

  if (!isOpen) return null;

  return (
    <>
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[4000]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md z-[4001]">
        <div className="bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl
                        border border-purple-500/30 rounded-3xl overflow-hidden
                        shadow-[0_0_40px_rgba(168,85,247,0.2)] max-h-[80vh] overflow-y-auto">
          
          {/* Header */}
          <div className="relative p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-white/10">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X size={20} className="text-white" />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500
                              flex items-center justify-center shadow-lg">
                <Heart size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">About Pulse</h2>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Mission */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Globe size={20} className="text-cyan-400" />
                {language === 'ru' ? 'Наша миссия' : 'Our Mission'}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {language === 'ru'
                  ? 'Pulse — это глобальный мост между людьми. Мы создали платформу, чтобы каждый мог получить помощь или заработать в любой точке мира, используя прозрачные технологии и доверие. Наша миссия — сделать мир ближе, а решение повседневных задач — быстрее и честнее.'
                  : 'Pulse is a global bridge between people. We created a platform so that everyone can get help or earn anywhere in the world, using transparent technologies and trust. Our mission is to make the world closer, and solving everyday tasks faster and more honest.'}
              </p>
            </div>

            {/* Values */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users size={20} className="text-purple-400" />
                {language === 'ru' ? 'Наши ценности' : 'Our Values'}
              </h3>
              
              <div className="grid gap-3">
                <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
                  <Zap size={20} className="text-yellow-400 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">
                      {language === 'ru' ? 'Скорость' : 'Speed'}
                    </div>
                    <div className="text-sm text-gray-400">
                      {language === 'ru'
                        ? 'Быстрое решение задач'
                        : 'Quick task resolution'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
                  <Shield size={20} className="text-green-400 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">
                      {language === 'ru' ? 'Безопасность' : 'Safety'}
                    </div>
                    <div className="text-sm text-gray-400">
                      {language === 'ru'
                        ? 'Защищённые транзакции'
                        : 'Secure transactions'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
                  <Heart size={20} className="text-pink-400 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">
                      {language === 'ru' ? 'Доверие' : 'Trust'}
                    </div>
                    <div className="text-sm text-gray-400">
                      {language === 'ru'
                        ? 'Честность и прозрачность'
                        : 'Honesty and transparency'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">150+</div>
                <div className="text-xs text-gray-500 mt-1">
                  {language === 'ru' ? 'Стран' : 'Countries'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">10K+</div>
                <div className="text-xs text-gray-500 mt-1">
                  {language === 'ru' ? 'Пользователей' : 'Users'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-400">50K+</div>
                <div className="text-xs text-gray-500 mt-1">
                  {language === 'ru' ? 'Заданий' : 'Tasks'}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 text-center">
            <p className="text-xs text-gray-500">
              © 2026 Pulse. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// Simple Shield icon component
function Shield({ size, className }: { size: number; className: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
