import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';
import { MapPin, ChevronRight, MessageSquare } from 'lucide-react';

type Client = {
  id: string;
  name?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  status: string;
  source?: string;
  branch?: { id: string; name: string } | null;
  notes?: string | null;
};

type Props = {
  client: Client;
  isDragging?: boolean;
  onOpenDetail?: (clientId: string) => void;
};

export default function ClientCard({ client, isDragging: isOverlay, onOpenDetail }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: client.id,
  });

  const style = transform && !isOverlay
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  const dragging = isOverlay ?? isDragging;

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      className={clsx(
        'flex items-start gap-2 p-3 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
        'transition-shadow',
        dragging && 'opacity-90 shadow-lg ring-2 ring-primary scale-105 z-50'
      )}
    >
      <div
        {...(isOverlay ? {} : { ...attributes, ...listeners })}
        className={clsx('flex-1 min-w-0', !isOverlay && 'cursor-grab active:cursor-grabbing')}
      >
        <p className="font-medium text-gray-900 dark:text-white truncate">
          {client.name || 'Ismsiz mijoz'}
        </p>
        {client.phoneNumber && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">
            {client.phoneNumber}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {client.branch && (
            <span className="inline-flex items-center gap-0.5 text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
              <MapPin className="w-3 h-3" />
              {client.branch.name}
            </span>
          )}
          {client.source && (
            <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              {client.source}
            </span>
          )}
        </div>
        {client.notes != null && client.notes.trim() !== '' && (
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-600 flex items-start gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2" title={client.notes}>
              {client.notes}
            </p>
          </div>
        )}
      </div>
      {!isOverlay && onOpenDetail && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onOpenDetail(client.id); }}
          className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex-shrink-0 touch-manipulation"
          title="To‘liq ochish"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
