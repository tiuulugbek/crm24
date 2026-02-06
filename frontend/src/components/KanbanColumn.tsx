import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import ClientCard from './ClientCard';

type Status = {
  id: string;
  name: string;
  slug: string;
  color: string;
  position: number;
};

type Client = {
  id: string;
  name?: string;
  phoneNumber?: string;
  email?: string;
  status: string;
  source?: string;
};

type Props = {
  status: Status;
  clients: Client[];
  onOpenClient?: (clientId: string) => void;
};

export default function KanbanColumn({ status, clients, onOpenClient }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: status.slug,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        flex-shrink-0 w-[280px] sm:w-72 rounded-xl border-2 p-3 sm:p-4 transition-colors
        ${isOver ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}
      `}
    >
      <div
        className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700"
        style={{ borderLeftColor: status.color, borderLeftWidth: '4px' }}
      >
        <span
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: status.color || '#6B7280' }}
        />
        <h3 className="font-semibold text-gray-900 dark:text-white">{status.name}</h3>
        <span className="ml-auto text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
          {clients.length}
        </span>
      </div>

      <SortableContext items={clients.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-[100px]">
          {clients.map((client) => (
            <ClientCard key={client.id} client={client} onOpenDetail={onOpenClient} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
