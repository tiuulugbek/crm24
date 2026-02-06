import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Send, User } from 'lucide-react';
import { messagesApi } from '../lib/api';
import toast from 'react-hot-toast';

export default function InboxPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');

  const sendMutation = useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) =>
      messagesApi.sendMessage(conversationId, content),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setMessageText('');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Xabar yuborilmadi'),
  });

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messagesApi.getConversations().then((r) => r.data).catch(() => []),
    retry: false,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', selectedId],
    queryFn: () => (selectedId ? messagesApi.getMessages(selectedId).then((r) => r.data) : Promise.resolve([])),
    enabled: !!selectedId,
    retry: false,
  });

  const firstConversation = conversations[0];
  const activeId = selectedId || (firstConversation as any)?.id;

  const handleSend = () => {
    const text = messageText.trim();
    if (!activeId || !text) return;
    sendMutation.mutate({ conversationId: activeId, content: text });
  };

  return (
    <div className="p-6 h-[calc(100vh-8rem)] flex flex-col">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
        <MessageSquare className="w-7 h-7 text-primary" />
        Inbox
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-4">Barcha kanallardan kelgan xabarlar</p>

      <div className="flex-1 flex gap-4 min-h-0 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder="Suhbatlarni qidirish..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500 text-sm">Yuklanmoqda...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">Suhbatlar yo‘q. Kanallar ulanganda shu yerda ko‘rinadi.</div>
            ) : (
              conversations.map((c: any) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full text-left p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${activeId === c.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{c.client?.name || c.platform || 'Mijoz'}</p>
                      <p className="text-xs text-gray-500 truncate">{c.lastMessage?.content || 'Xabar yo‘q'}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          {activeId ? (
            <>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Suhbat</p>
                  <p className="text-xs text-gray-500">Javob yozing</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {Array.isArray(messages) && messages.length > 0 ? (
                  messages.map((m: any) => (
                    <div
                      key={m.id}
                      className={`flex ${m.direction === 'inbound' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          m.direction === 'inbound'
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                            : 'bg-primary text-white'
                        }`}
                      >
                        <p className="text-sm">{m.content}</p>
                        <p className="text-xs opacity-70 mt-1">{new Date(m.createdAt).toLocaleTimeString('uz')}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">Xabarlar yo‘q. Birinchi xabarni yuboring.</div>
                )}
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                  placeholder="Xabar yozing..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!messageText.trim() || sendMutation.isPending}
                  className="p-2 bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                  title="Yuborish"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              {conversations.length === 0 ? 'Suhbatni tanlang yoki kanallarni ulang' : 'Suhbatni tanlang'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
