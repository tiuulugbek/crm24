import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plug, MessageCircle, Instagram, Youtube, Facebook, ShieldCheck, FileText, X, Trash2, Smartphone } from 'lucide-react';
import { integrationsApi } from '../lib/api';
import toast from 'react-hot-toast';

const PLATFORMS = [
  { id: 'telegram', name: 'Telegram', icon: MessageCircle, color: '#0088cc', description: 'Bot orqali xabarlar qabul qilish' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F', description: 'DM va izohlar' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#FF0000', description: 'Izohlar va javoblar' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2', description: 'Messenger xabarlari' },
  { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: '#25D366', description: 'WhatsApp Business API' },
  { id: 'eskiz_sms', name: 'Eskiz.uz SMS', icon: Smartphone, color: '#10B981', description: 'Mijozlarga SMS yuborish (Eskiz.uz shлюз)' },
];

/** Har bir platformaning o‘z integratsiya/API va developer qoidalariga muvofiq matn va havolalar */
const PLATFORM_INTEGRATION_RULES: Record<string, {
  title: string;
  summary: string;
  termsLabel: string;
  termsUrl: string;
  policyUrl?: string;
  dataUse: string;
}> = {
  telegram: {
    title: 'Telegram Bot API qoidalari',
    summary: 'Telegram botlar uchun rasmiy Bot API va foydalanish shartlari qo‘llanadi. Bot orqali faqat foydalanuvchi roziligi bilan ma’lumot qayta ishlanadi.',
    termsLabel: 'Telegram Bot API va foydalanish shartlari',
    termsUrl: 'https://core.telegram.org/bots/terms',
    policyUrl: 'https://telegram.org/privacy',
    dataUse: 'Bot orqali yozishmalar, foydalanuvchi ID va xabar tarixi faqat CRM xizmati va mijozlar bilan aloqa uchun ishlatiladi; Telegram qoidalariga zid ishlatilmaydi.',
  },
  instagram: {
    title: 'Meta (Instagram) Platform qoidalari',
    summary: 'Instagram Graph API va Meta Platform Terms, Developer Policy va Data Use qoidalariga bo‘ysunish shart. Reklama va ma’lumotlardan foydalanish Meta siyosatiga muvofiq bo‘lishi kerak.',
    termsLabel: 'Meta Platform Terms va Instagram Developer Policy',
    termsUrl: 'https://developers.facebook.com/terms',
    policyUrl: 'https://www.facebook.com/privacy/policy',
    dataUse: 'DM, izohlar va profil ma’lumotlari faqat Meta ruxsat etilgan doirasida va foydalanuvchi roziligi asosida qayta ishlanadi.',
  },
  youtube: {
    title: 'YouTube API Services qoidalari',
    summary: 'Google/YouTube API Services Terms of Service va YouTube Terms of Service qo‘llanadi. API orqali olingan ma’lumotlar Google Privacy Policy va YouTube qoidalariga muvofiq saqlanadi va ishlatiladi.',
    termsLabel: 'YouTube API Services Terms of Service',
    termsUrl: 'https://developers.google.com/youtube/terms/api-services-terms-of-service',
    policyUrl: 'https://policies.google.com/privacy',
    dataUse: 'Izohlar, javoblar va kanal ma’lumotlari faqat xizmat ko‘rsatish va hisobotlar uchun; Google/YouTube qoidalariga zid tarzda tashqariga berilmaydi.',
  },
  facebook: {
    title: 'Meta (Facebook) Platform qoidalari',
    summary: 'Facebook/Meta Platform Terms, Developer Policy va Messenger ilova qoidalariga bo‘ysunish shart. Ma’lumotlardan foydalanish Meta Data Use va Privacy Policy bo‘yicha amalga oshiriladi.',
    termsLabel: 'Meta Platform Terms va Messenger Policy',
    termsUrl: 'https://developers.facebook.com/terms',
    policyUrl: 'https://www.facebook.com/privacy/policy',
    dataUse: 'Messenger xabarlari va foydalanuvchi ma’lumotlari faqat CRM doirasida va Meta ruxsat etilgan maqsadlarda ishlatiladi.',
  },
  whatsapp: {
    title: 'WhatsApp Business API qoidalari',
    summary: 'WhatsApp Business Policy, Commerce Policy va Meta (WhatsApp) API/developer qoidalariga muvofiq integratsiya qilinadi. Faqat ruxsat etilgan Business API orqali xabar almashish va ma’lumotlardan foydalanish talab qilinadi.',
    termsLabel: 'WhatsApp Business Policy va API qoidalari',
    termsUrl: 'https://www.whatsapp.com/legal/business-policy',
    policyUrl: 'https://www.whatsapp.com/legal/privacy-policy',
    dataUse: 'Raqamlar va xabarlar faqat WhatsApp Business API va Commerce qoidalariga muvofiq, mijozlar bilan aloqa uchun ishlatiladi.',
  },
  eskiz_sms: {
    title: 'Eskiz.uz SMS shлюз',
    summary: 'Eskiz.uz orqali SMS yuborish. my.eskiz.uz hisobingizdagi email va parol bilan kirish. API hujjati: Postman.',
    termsLabel: 'Eskiz.uz SMS API va xizmat shartlari',
    termsUrl: 'https://documenter.getpostman.com/view/663428/RzfmES4z',
    dataUse: 'Email, parol va yuboruvchi nomi faqat SMS yuborish uchun ishlatiladi; Eskiz.uz maxfiylik qoidalariga muvofiq.',
  },
};

const ADD_LABEL: Record<string, string> = {
  telegram: 'Yana bot qo‘shish',
  instagram: 'Yana profil qo‘shish',
  youtube: 'Yana kanal qo‘shish',
  facebook: 'Yana profil qo‘shish',
  whatsapp: 'Yana hisob qo‘shish',
  eskiz_sms: 'Yana SMS ulanish qo‘shish',
};

const NAME_PLACEHOLDER: Record<string, string> = {
  telegram: 'Masalan: Reklama 1 bot, Landing bot',
  instagram: 'Masalan: Asosiy profil, Reklama kanali',
  youtube: 'Masalan: Asosiy kanal',
  facebook: 'Masalan: Asosiy sahifa',
  whatsapp: 'Masalan: Savdo qabul qilish',
  eskiz_sms: 'Masalan: Asosiy SMS',
};

export default function IntegrationsPage() {
  const queryClient = useQueryClient();
  const [connecting, setConnecting] = useState<string | null>(null);
  const [complianceModal, setComplianceModal] = useState<{ platform: string; platformName: string } | null>(null);
  const [integrationName, setIntegrationName] = useState('');
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramGroupChatId, setTelegramGroupChatId] = useState('');
  const [instagramAppId, setInstagramAppId] = useState('');
  const [instagramAppSecret, setInstagramAppSecret] = useState('');
  const [instagramPageToken, setInstagramPageToken] = useState('');
  const [instagramAccountId, setInstagramAccountId] = useState('');
  const [youtubeApiKey, setYoutubeApiKey] = useState('');
  const [youtubeChannelId, setYoutubeChannelId] = useState('');
  const [facebookAppId, setFacebookAppId] = useState('');
  const [facebookAppSecret, setFacebookAppSecret] = useState('');
  const [facebookPageId, setFacebookPageId] = useState('');
  const [facebookPageToken, setFacebookPageToken] = useState('');
  const [whatsappPhoneNumberId, setWhatsappPhoneNumberId] = useState('');
  const [whatsappAccessToken, setWhatsappAccessToken] = useState('');
  const [eskizEmail, setEskizEmail] = useState('');
  const [eskizPassword, setEskizPassword] = useState('');
  const [eskizFrom, setEskizFrom] = useState('Acoustic');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const { data: integrations = [] } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => integrationsApi.getAll().then((r) => r.data),
    retry: false,
  });

  const integrationsByPlatform = (integrations as any[]).reduce((acc: Record<string, any[]>, i: any) => {
    const p = i.platform || 'other';
    if (!acc[p]) acc[p] = [];
    acc[p].push(i);
    return acc;
  }, {});

  const configureMutation = useMutation({
    mutationFn: ({ platform, name, config, termsAcceptedAt }: { platform: string; name?: string; config?: Record<string, any>; termsAcceptedAt: string }) =>
      integrationsApi.configure(platform, { name, config }, termsAcceptedAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success('Integratsiya qo‘shildi');
      setComplianceModal(null);
      setIntegrationName('');
      setTelegramBotToken('');
      setTelegramGroupChatId('');
      setInstagramAppId('');
      setInstagramAppSecret('');
      setInstagramPageToken('');
      setInstagramAccountId('');
      setYoutubeApiKey('');
      setYoutubeChannelId('');
      setFacebookAppId('');
      setFacebookAppSecret('');
      setFacebookPageId('');
      setFacebookPageToken('');
      setWhatsappPhoneNumberId('');
      setWhatsappAccessToken('');
      setEskizEmail('');
      setEskizPassword('');
      setEskizFrom('Acoustic');
      setTermsAccepted(false);
      setConnecting(null);
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.message || 'Xato');
      setConnecting(null);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      integrationsApi.toggle(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success('Holat yangilandi');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Xato'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => integrationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success('O‘chirildi');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Xato'),
  });

  const openComplianceModal = (platformId: string, platformName: string) => {
    setIntegrationName('');
    setTelegramBotToken('');
    setTelegramGroupChatId('');
    setInstagramAppId('');
    setInstagramAppSecret('');
    setInstagramPageToken('');
    setInstagramAccountId('');
    setYoutubeApiKey('');
    setYoutubeChannelId('');
    setFacebookAppId('');
    setFacebookAppSecret('');
    setFacebookPageId('');
    setFacebookPageToken('');
    setWhatsappPhoneNumberId('');
    setWhatsappAccessToken('');
    setEskizEmail('');
    setEskizPassword('');
    setEskizFrom('Acoustic');
    setTermsAccepted(false);
    setComplianceModal({ platform: platformId, platformName });
  };

  const handleConnectAfterConsent = () => {
    if (!complianceModal || !termsAccepted) {
      toast.error('Davom etish uchun shartlar va maxfiylik siyosatiga rozilik bering');
      return;
    }
    setConnecting(complianceModal.platform);
    const config: Record<string, any> = {};
    if (complianceModal.platform === 'telegram') {
      if (!telegramBotToken.trim()) {
        toast.error('Telegram bot ulash uchun Bot Token kiritishingiz shart');
        return;
      }
      config.botToken = telegramBotToken.trim();
      if (telegramGroupChatId.trim()) config.groupChatId = telegramGroupChatId.trim();
    } else if (complianceModal.platform === 'instagram') {
      if (!instagramAppId.trim() || !instagramPageToken.trim() || !instagramAccountId.trim()) {
        toast.error('Instagram uchun App ID, Page Access Token va Instagram Account ID kiritishingiz shart');
        return;
      }
      config.appId = instagramAppId.trim();
      if (instagramAppSecret.trim()) config.appSecret = instagramAppSecret.trim();
      config.pageAccessToken = instagramPageToken.trim();
      config.instagramAccountId = instagramAccountId.trim();
    } else if (complianceModal.platform === 'youtube') {
      if (!youtubeApiKey.trim() || !youtubeChannelId.trim()) {
        toast.error('YouTube uchun API Key va Channel ID kiritishingiz shart');
        return;
      }
      config.apiKey = youtubeApiKey.trim();
      config.channelId = youtubeChannelId.trim();
    } else if (complianceModal.platform === 'facebook') {
      if (!facebookAppId.trim() || !facebookPageId.trim() || !facebookPageToken.trim()) {
        toast.error('Facebook uchun App ID, Page ID va Page Access Token kiritishingiz shart');
        return;
      }
      config.appId = facebookAppId.trim();
      if (facebookAppSecret.trim()) config.appSecret = facebookAppSecret.trim();
      config.pageId = facebookPageId.trim();
      config.pageAccessToken = facebookPageToken.trim();
    } else if (complianceModal.platform === 'whatsapp') {
      if (!whatsappPhoneNumberId.trim() || !whatsappAccessToken.trim()) {
        toast.error('WhatsApp uchun Phone Number ID va Access Token kiritishingiz shart');
        return;
      }
      config.phoneNumberId = whatsappPhoneNumberId.trim();
      config.accessToken = whatsappAccessToken.trim();
    } else if (complianceModal.platform === 'eskiz_sms') {
      if (!eskizEmail.trim() || !eskizPassword.trim()) {
        toast.error('Eskiz.uz uchun email va parol kiritishingiz shart');
        return;
      }
      config.email = eskizEmail.trim();
      config.password = eskizPassword.trim();
      config.from = (eskizFrom.trim() || 'Acoustic').slice(0, 11);
    }
    configureMutation.mutate({
      platform: complianceModal.platform,
      name: integrationName.trim() || undefined,
      config: Object.keys(config).length ? config : undefined,
      termsAcceptedAt: new Date().toISOString(),
    });
  };

  const handleToggle = (id: string, isActive: boolean) => {
    toggleMutation.mutate({ id, isActive });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
        <Plug className="w-7 h-7 text-primary" />
        Integratsiyalar
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Har bir kanal o‘z platformasining rasmiy integratsiya va API qoidalariga muvofiq ulanadi
      </p>

      {/* Integratsiya qoidalari haqida */}
      <div className="mb-6 p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10 flex gap-3">
        <ShieldCheck className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Platforma integratsiya qoidalariga muvofiqlik
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            Har bir kanal (Telegram, Instagram, YouTube, Facebook, WhatsApp) ulanishdan oldin o‘sha platformaning rasmiy
            developer/API shartlari va maxfiylik siyosati ko‘rsatiladi. Ulash uchun siz ushbu platforma qoidalariga rozi
            ekanligingizni tasdiqlashingiz shart. Ma’lumotlar faqat har bir platformaning ruxsat etilgan doirasida ishlatiladi.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {PLATFORMS.map(({ id, name, icon: Icon, color, description }) => {
          const list = integrationsByPlatform[id] || [];
          const hasAny = list.length > 0;
          return (
            <div
              key={id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: color }}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{name}</h3>
                  <span className="text-xs text-gray-500">
                    {hasAny ? `${list.length} ta ulangan` : 'Ulanmagan'}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex-1">{description}</p>
              <button
                type="button"
                onClick={() => openComplianceModal(id, name)}
                className="text-xs text-primary hover:underline text-left mb-3"
              >
                {name} integratsiya qoidalari →
              </button>
              {list.length > 0 && (
                <ul className="space-y-2 mb-3">
                  {list.map((item: any) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600"
                    >
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.name || `${name} #${item.id.slice(0, 8)}`}
                      </span>
                      <span className={`text-xs shrink-0 ${item.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                        {item.isActive ? 'Yoniq' : 'O‘chiq'}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggle(item.id, !item.isActive)}
                          disabled={toggleMutation.isPending}
                          className="p-1.5 rounded text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 text-xs"
                          title={item.isActive ? 'O‘chirib qo‘yish' : 'Yoqish'}
                        >
                          {item.isActive ? 'O‘chirib qo‘yish' : 'Yoqish'}
                        </button>
                        <button
                          type="button"
                          onClick={() => window.confirm('Ushbu ulanishni o‘chirib tashlashni xohlaysizmi?') && deleteMutation.mutate(item.id)}
                          disabled={deleteMutation.isPending}
                          className="p-1.5 rounded text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="O‘chirib tashlash"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                onClick={() => openComplianceModal(id, name)}
                disabled={connecting === id}
                className="w-full py-2 rounded-lg text-sm font-medium bg-primary text-white hover:opacity-90 disabled:opacity-50"
              >
                {connecting === id ? 'Sozlanmoqda...' : hasAny ? ADD_LABEL[id] || 'Yana ulash' : 'Ulash'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Platforma integratsiya qoidalari modali — har bir kanal o‘z qoidalariga muvofiq */}
      {complianceModal && (() => {
        const rules = PLATFORM_INTEGRATION_RULES[complianceModal.platform];
        if (!rules) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => { setComplianceModal(null); setTermsAccepted(false); setIntegrationName(''); setTelegramBotToken(''); setTelegramGroupChatId(''); setInstagramAppId(''); setInstagramAppSecret(''); setInstagramPageToken(''); setInstagramAccountId(''); setYoutubeApiKey(''); setYoutubeChannelId(''); setFacebookAppId(''); setFacebookAppSecret(''); setFacebookPageId(''); setFacebookPageToken(''); setWhatsappPhoneNumberId(''); setWhatsappAccessToken(''); }}>
            <div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {complianceModal.platformName} — yangi ulanish
                </h2>
                <button
                  type="button"
                  onClick={() => { setComplianceModal(null); setTermsAccepted(false); setIntegrationName(''); setTelegramBotToken(''); setTelegramGroupChatId(''); setInstagramAppId(''); setInstagramAppSecret(''); setInstagramPageToken(''); setInstagramAccountId(''); setYoutubeApiKey(''); setYoutubeChannelId(''); setFacebookAppId(''); setFacebookAppSecret(''); setFacebookPageId(''); setFacebookPageToken(''); setWhatsappPhoneNumberId(''); setWhatsappAccessToken(''); }}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nomi (ixtiyoriy)</label>
                <input
                  type="text"
                  value={integrationName}
                  onChange={(e) => setIntegrationName(e.target.value)}
                  placeholder={NAME_PLACEHOLDER[complianceModal.platform] || 'Masalan: Asosiy'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
                />
                <p className="text-xs text-gray-500 mt-1">Turli reklama kanallari yoki profillarni ajratish uchun nom bering</p>
              </div>
              {complianceModal.platform === 'telegram' && (
                <div className="mb-4 space-y-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bot Token (majburiy)</label>
                    <input
                      type="password"
                      value={telegramBotToken}
                      onChange={(e) => setTelegramBotToken(e.target.value)}
                      placeholder="123456:ABC-DEF..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
                    />
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      @BotFather da /newbot yordamida bot yarating, so‘ng token ni shu yerga kiriting. Botga yozilgan xabarlar CRM da Inbox bo‘limida ko‘rinadi.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Guruhga ham ulash: botni guruhga qo‘shing — guruh xabarlari CRM da bitta suhbatda (guruh nomi bilan) ko‘rinadi. Guruh chat ID (ixtiyoriy — qo‘shimcha)</label>
                    <input
                      type="text"
                      value={telegramGroupChatId}
                      onChange={(e) => setTelegramGroupChatId(e.target.value)}
                      placeholder="-1001234567890"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
                    />
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Botni guruhga qo‘shing. Guruhga yuboriladigan xabarlar uchun guruh ID sini kiriting (masalan @userinfobot yoki @getidsbot orqali bilib olish mumkin).
                    </p>
                  </div>
                </div>
              )}
              {complianceModal.platform === 'instagram' && (
                <div className="mb-4 space-y-3 p-3 rounded-lg bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Instagram Graph API (DM va izohlar)</p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meta App ID (majburiy)</label>
                    <input type="text" value={instagramAppId} onChange={(e) => setInstagramAppId(e.target.value)} placeholder="1234567890123456" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">App Secret (ixtiyoriy)</label>
                    <input type="password" value={instagramAppSecret} onChange={(e) => setInstagramAppSecret(e.target.value)} placeholder="••••••••" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Page Access Token — uzoq muddatli (majburiy)</label>
                    <input type="password" value={instagramPageToken} onChange={(e) => setInstagramPageToken(e.target.value)} placeholder="EAAx..." className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">developers.facebook.com → App → Tools → Graph API Explorer yoki Page → Settings → Access token</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instagram Business Account ID (majburiy)</label>
                    <input type="text" value={instagramAccountId} onChange={(e) => setInstagramAccountId(e.target.value)} placeholder="17841400008460056" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Instagram hisobni Facebook sahifaga ulang, so‘ng Graph API: me/accounts?fields=instagram_business_account</p>
                  </div>
                </div>
              )}
              {complianceModal.platform === 'youtube' && (
                <div className="mb-4 space-y-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">YouTube Data API v3 (izohlar va javoblar)</p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key (majburiy)</label>
                    <input type="password" value={youtubeApiKey} onChange={(e) => setYoutubeApiKey(e.target.value)} placeholder="AIza..." className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Google Cloud Console → APIs & Services → Credentials → API key. YouTube Data API v3 yoqilgan bo‘lishi kerak.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Channel ID (majburiy)</label>
                    <input type="text" value={youtubeChannelId} onChange={(e) => setYoutubeChannelId(e.target.value)} placeholder="UCxxxxxx..." className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Kanal sahifasi → Haqida → «Kanal ID» yoki YouTube Studio → Sozlamalar</p>
                  </div>
                </div>
              )}
              {complianceModal.platform === 'facebook' && (
                <div className="mb-4 space-y-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Facebook Messenger (sahifa xabarlari)</p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">App ID (majburiy)</label>
                    <input type="text" value={facebookAppId} onChange={(e) => setFacebookAppId(e.target.value)} placeholder="1234567890123456" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">App Secret (ixtiyoriy)</label>
                    <input type="password" value={facebookAppSecret} onChange={(e) => setFacebookAppSecret(e.target.value)} placeholder="••••••••" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Page ID (majburiy)</label>
                    <input type="text" value={facebookPageId} onChange={(e) => setFacebookPageId(e.target.value)} placeholder="123456789012345" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Sahifa sozlamalari → Sahifa ID yoki Graph API: me/accounts</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Page Access Token — uzoq muddatli (majburiy)</label>
                    <input type="password" value={facebookPageToken} onChange={(e) => setFacebookPageToken(e.target.value)} placeholder="EAAx..." className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">developers.facebook.com → Messenger → Sahifani ulash. Uzoq muddatli token oling.</p>
                  </div>
                </div>
              )}
              {complianceModal.platform === 'whatsapp' && (
                <div className="mb-4 space-y-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">WhatsApp Business API</p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number ID (majburiy)</label>
                    <input type="text" value={whatsappPhoneNumberId} onChange={(e) => setWhatsappPhoneNumberId(e.target.value)} placeholder="123456789012345" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Meta Business Suite → WhatsApp → Phone numbers. Phone number ID ni oling.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Access Token (majburiy)</label>
                    <input type="password" value={whatsappAccessToken} onChange={(e) => setWhatsappAccessToken(e.target.value)} placeholder="EAAx..." className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">developers.facebook.com → App → WhatsApp → System user token (uzoq muddatli).</p>
                  </div>
                </div>
              )}
              {complianceModal.platform === 'eskiz_sms' && (
                <div className="mb-4 space-y-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Eskiz.uz SMS shлюз</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <a href="https://documenter.getpostman.com/view/663428/RzfmES4z" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">API hujjati (Postman)</a> — my.eskiz.uz hisobingizdagi email va parol bilan kirishingiz kerak.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email (majburiy)</label>
                    <input type="email" value={eskizEmail} onChange={(e) => setEskizEmail(e.target.value)} placeholder="login@eskiz.uz" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parol (majburiy)</label>
                    <input type="password" value={eskizPassword} onChange={(e) => setEskizPassword(e.target.value)} placeholder="••••••••" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Yuboruvchi nomi (from, ixtiyoriy — max 11 belgi)</label>
                    <input type="text" value={eskizFrom} onChange={(e) => setEskizFrom(e.target.value)} placeholder="Acoustic" maxLength={11} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">SMS da ko‘rinadigan yuboruvchi nomi (masalan: Acoustic, 4546)</p>
                  </div>
                </div>
              )}
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300 mb-4">
                <p className="font-medium text-gray-900 dark:text-white">{rules.title}</p>
                <p>{rules.summary}</p>
                <p><strong>Ma’lumotlardan foydalanish:</strong> {rules.dataUse}</p>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-600 flex flex-wrap gap-x-4 gap-y-1">
                  <a href={rules.termsUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {rules.termsLabel} ↗
                  </a>
                  {rules.policyUrl && (
                    <a href={rules.policyUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Maxfiylik siyosati ↗
                    </a>
                  )}
                </div>
              </div>
              <label className="flex items-start gap-3 cursor-pointer mb-4 p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="rounded border-gray-300 text-primary mt-1"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Men {complianceModal.platformName} platformasining rasmiy integratsiya/API shartlari va maxfiylik siyosatiga roziman.
                  Ushbu platforma qoidalariga muvofiq ulashni tasdiqlayman.
                </span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleConnectAfterConsent}
                  disabled={!termsAccepted || configureMutation.isPending}
                  className="flex-1 py-2 bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  {configureMutation.isPending ? 'Sozlanmoqda...' : 'Ulash'}
                </button>
                <button
                  type="button"
                  onClick={() => { setComplianceModal(null); setTermsAccepted(false); setIntegrationName(''); setTelegramBotToken(''); setTelegramGroupChatId(''); setInstagramAppId(''); setInstagramAppSecret(''); setInstagramPageToken(''); setInstagramAccountId(''); setYoutubeApiKey(''); setYoutubeChannelId(''); setFacebookAppId(''); setFacebookAppSecret(''); setFacebookPageId(''); setFacebookPageToken(''); setWhatsappPhoneNumberId(''); setWhatsappAccessToken(''); }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300"
                >
                  Bekor qilish
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
