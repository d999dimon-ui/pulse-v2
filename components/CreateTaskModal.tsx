"use client";

import { useState, useRef, useEffect } from 'react';
import { CATEGORIES, TaskCategory, Currency } from '@/types/task';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, X, MapPin, Map, Navigation, Loader2 } from 'lucide-react';

const translations = {
  ru: {
    title: 'Создание заказа',
    taskTitle: 'Название заказа *',
    taskTitlePlaceholder: 'Например: Доставка документов',
    description: 'Описание *',
    descriptionPlaceholder: 'Опишите задание подробно...',
    category: 'Категория *',
    reward: 'Сумма награды *',
    currency: 'Валюта',
    priority: 'Приоритет',
    normal: 'Обычный',
    urgent: 'Срочный',
    asap: 'Как можно скорее',
    address: 'Адрес',
    addressPlaceholder: 'Введите адрес...',
    addressFromMap: 'Указать на карте',
    createTask: 'Создать заказ',
    creating: 'Создание...',
    terms: 'Создавая заказ, вы соглашаетесь с условиями сервиса',
    errors: {
      title: 'Введите название',
      description: 'Введите описание',
      reward: 'Сумма должна быть больше 0',
      category: 'Выберите категорию',
      submit: 'Ошибка при создании',
    },
    addresses: {
      detecting: 'Определяю адрес...',
      found: 'Адрес найден',
    },
  },
  en: {
    title: 'Create New Task',
    taskTitle: 'Task Title *',
    taskTitlePlaceholder: 'e.g., Deliver documents',
    description: 'Description *',
    descriptionPlaceholder: 'Describe the task in detail...',
    category: 'Category *',
    reward: 'Reward Amount *',
    currency: 'Currency',
    priority: 'Priority',
    normal: 'Normal',
    urgent: 'Urgent',
    asap: 'As Soon As Possible',
    address: 'Address',
    addressPlaceholder: 'Enter address...',
    addressFromMap: 'Set on Map',
    createTask: 'Create Task',
    creating: 'Creating...',
    terms: 'By creating a task, you agree to our Terms of Service',
    errors: {
      title: 'Enter a title',
      description: 'Enter a description',
      reward: 'Amount must be greater than 0',
      category: 'Select a category',
      submit: 'Failed to create task',
    },
    addresses: {
      detecting: 'Detecting address...',
      found: 'Address found',
    },
  }
};

// Address suggestions mock
const addressSuggestions = [
  'Москва, ул. Тверская, 1',
  'Москва, ул. Арбат, 10',
  'Санкт-Петербург, Невский проспект, 28',
  'Казань, ул. Баумана, 36',
  'Новосибирск, Красный проспект, 50',
  'Екатеринбург, ул. Ленина, 24',
];

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  userPosition: [number, number];
  onCreateTask: (taskData: {
    title: string;
    description: string;
    reward: number;
    currency: Currency;
    category: TaskCategory;
    latitude: number;
    longitude: number;
    street_address: string;
    priority: 'normal' | 'urgent' | 'asap';
  }) => Promise<void>;
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  userPosition,
  onCreateTask,
}: CreateTaskModalProps) {
  const { language } = useLanguage();
  const t = translations[language === 'ru' ? 'ru' : 'en'];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState('10');
  const [currency, setCurrency] = useState<Currency>('usdt');
  const [category, setCategory] = useState<TaskCategory>('it');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent' | 'asap'>('normal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [isDetectingAddress, setIsDetectingAddress] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter suggestions based on input
  const filteredSuggestions = addressSuggestions.filter(a => a.toLowerCase().includes(address.toLowerCase()));

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = t.errors.title;
    if (!description.trim()) newErrors.description = t.errors.description;
    if (Number(reward) <= 0) newErrors.reward = t.errors.reward;
    if (!category) newErrors.category = t.errors.category;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onCreateTask({
        title,
        description,
        reward: Number(reward),
        currency,
        category,
        latitude: userPosition[0],
        longitude: userPosition[1],
        street_address: address,
        phone,
        sender_phone: senderPhone,
        receiver_phone: receiverPhone,
        priority,
      });

      setTitle('');
      setDescription('');
      setReward('10');
      setCurrency('usdt');
      setCategory('it');
      setAddress('');
      setPhone('');
      setSenderPhone('');
      setReceiverPhone('');
      setPriority('normal');
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
      setErrors({ submit: t.errors.submit });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Detect address from GPS
  const detectAddress = async () => {
    setIsDetectingAddress(true);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      const { latitude, longitude } = pos.coords;
      // Reverse geocoding via Nominatim
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=${language}`);
      const data = await res.json();
      if (data.display_name) {
        setAddress(data.display_name);
      }
    } catch (e) {
      console.error('Error detecting address:', e);
    } finally {
      setIsDetectingAddress(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl z-50">
        <div className="bg-[#1a1f3a] rounded-3xl p-6 max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">{t.title}</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">{t.taskTitle}</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder={t.taskTitlePlaceholder}
                className="w-full bg-white/5 rounded-xl px-4 py-3 text-white placeholder-gray-500 border border-white/10 focus:border-yellow-400 focus:outline-none transition" />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">{t.description}</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder={t.descriptionPlaceholder} rows={4}
                className="w-full bg-white/5 rounded-xl px-4 py-3 text-white placeholder-gray-500 border border-white/10 focus:border-yellow-400 focus:outline-none transition resize-none" />
              {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">{t.category}</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full bg-white/5 rounded-xl px-4 py-3 text-white border border-white/10 focus:border-yellow-400 focus:outline-none transition">
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-[#1a1f3a]">
                    {cat.icon} {cat.value === 'it' ? (language === 'ru' ? 'IT Услуги' : 'IT Services') :
                      cat.value === 'couriers' ? (language === 'ru' ? 'Курьеры' : 'Couriers') :
                      cat.value === 'household_services' ? (language === 'ru' ? 'Бытовые услуги' : 'Household Services') :
                      cat.value === 'marketing' ? (language === 'ru' ? 'Маркетинг' : 'Marketing') :
                      cat.value === 'delivery' ? (language === 'ru' ? 'Доставка' : 'Delivery') :
                      cat.value === 'cleaning' ? (language === 'ru' ? 'Уборка' : 'Cleaning') :
                      cat.value === 'photo' ? (language === 'ru' ? 'Фото' : 'Photo') :
                      cat.value === 'translation' ? (language === 'ru' ? 'Переводы' : 'Translation') :
                      cat.value === 'tutoring' ? (language === 'ru' ? 'Репетиторство' : 'Tutoring') :
                      (language === 'ru' ? 'Ремонт' : 'Repair')}
                  </option>
                ))}
              </select>
            </div>

            {/* Reward & Currency */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-white mb-2">{t.reward}</label>
                <input type="number" value={reward} onChange={(e) => setReward(e.target.value)}
                  min="1" step="0.1"
                  className="w-full bg-white/5 rounded-xl px-4 py-3 text-white border border-white/10 focus:border-yellow-400 focus:outline-none transition" />
                {errors.reward && <p className="text-red-400 text-xs mt-1">{errors.reward}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">{t.currency}</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="w-full bg-white/5 rounded-xl px-4 py-3 text-white border border-white/10 focus:border-yellow-400 focus:outline-none transition">
                  <option value="usdt" className="bg-[#1a1f3a]">USDT</option>
                  <option value="stars" className="bg-[#1a1f3a]">Stars</option>
                  <option value="ton" className="bg-[#1a1f3a]">TON</option>
                </select>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">{t.priority}</label>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { key: 'normal', label: t.normal },
                  { key: 'urgent', label: t.urgent },
                  { key: 'asap', label: t.asap },
                ] as const).map((p) => (
                  <button key={p.key} type="button" onClick={() => setPriority(p.key)}
                    className={`py-2 rounded-lg font-medium transition text-sm ${
                      priority === p.key
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                        : 'bg-white/5 text-gray-300 hover:text-white'
                    }`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Address with suggestions */}
            <div className="relative">
              <label className="flex items-center text-sm font-semibold text-white mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                {t.address}
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={address}
                  onChange={(e) => { setAddress(e.target.value); setShowAddressSuggestions(true); }}
                  onFocus={() => setShowAddressSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowAddressSuggestions(false), 200)}
                  placeholder={t.addressPlaceholder}
                  className="w-full bg-white/5 rounded-xl px-4 py-3 pr-10 text-white placeholder-gray-500 border border-white/10 focus:border-yellow-400 focus:outline-none transition"
                />
                <button type="button" onClick={detectAddress} disabled={isDetectingAddress}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-yellow-400 hover:text-yellow-300 disabled:opacity-50">
                  {isDetectingAddress ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
                </button>
              </div>
              {/* Address suggestions */}
              {showAddressSuggestions && address.length > 2 && (
                <div className="absolute z-10 w-full mt-1 bg-[#1a1f3a] border border-white/10 rounded-xl shadow-2xl max-h-40 overflow-y-auto">
                  {filteredSuggestions.slice(0, 5).map((a, i) => (
                    <button key={i} type="button"
                      onMouseDown={() => { setAddress(a); setShowAddressSuggestions(false); }}
                      className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                      <span className="truncate">{a}</span>
                    </button>
                  ))}
                </div>
              )}
              <button type="button" onClick={detectAddress}
                className="mt-2 flex items-center gap-2 text-yellow-400 text-sm hover:text-yellow-300 transition">
                <Map className="w-4 h-4" />
                {t.addressFromMap}
              </button>
            </div>

            {/* Phone Number */}
            <div>
              <label className="flex items-center text-sm font-semibold text-white mb-2">
                <Phone className="w-4 h-4 mr-1" />
                {language === 'ru' ? 'Номер телефона *' : 'Phone Number *'}
              </label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder={language === 'ru' ? '+996 ___ ___ ___' : '+1 (___) ___-____'}
                className="w-full bg-white/5 rounded-xl px-4 py-3 text-white placeholder-gray-500 border border-white/10 focus:border-yellow-400 focus:outline-none transition" />
            </div>

            {/* Delivery-specific phones */}
            {(category === 'delivery' || category === 'couriers') && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-white mb-2 block">
                    {language === 'ru' ? 'Телефон отправителя' : 'Sender Phone'}
                  </label>
                  <input type="tel" value={senderPhone} onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder={language === 'ru' ? '+996 ___ ___ ___' : '+1 (___) ___-____'}
                    className="w-full bg-white/5 rounded-xl px-4 py-3 text-white placeholder-gray-500 border border-white/10 focus:border-yellow-400 focus:outline-none transition" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-white mb-2 block">
                    {language === 'ru' ? 'Телефон получателя' : 'Receiver Phone'}
                  </label>
                  <input type="tel" value={receiverPhone} onChange={(e) => setReceiverPhone(e.target.value)}
                    placeholder={language === 'ru' ? '+996 ___ ___ ___' : '+1 (___) ___-____'}
                    className="w-full bg-white/5 rounded-xl px-4 py-3 text-white placeholder-gray-500 border border-white/10 focus:border-yellow-400 focus:outline-none transition" />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button type="submit" disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-yellow-500/25 disabled:opacity-50 transition flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" />
              {isSubmitting ? t.creating : t.createTask}
            </button>

            {errors.submit && <p className="text-red-400 text-sm text-center">{errors.submit}</p>}
            <p className="text-xs text-gray-400 text-center">{t.terms}</p>
          </form>
        </div>
      </div>
    </>
  );
}
