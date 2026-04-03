"use client";

import { useState } from 'react';
import NeuroChat from './NeuroChat';

interface SupportChatProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function SupportChat({ isOpen, onClose, userId }: SupportChatProps) {
  return <NeuroChat isOpen={isOpen} onClose={onClose} userId={userId} />;
}
