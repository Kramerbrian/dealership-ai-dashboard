import React from 'react';
import { PulseThread } from '@/lib/types/pulse';

interface ThreadDrawerProps {
  thread: PulseThread | null;
  onClose: () => void;
}

export function ThreadDrawer({ thread, onClose }: ThreadDrawerProps) {
  if (!thread) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div
        className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">{thread.title}</h3>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded hover:bg-gray-100"
          >
            Close
          </button>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {thread.messages?.map((msg, i) => (
              <div key={i} className="border-l-2 border-gray-300 pl-4">
                <div className="text-sm text-gray-500">{msg.author}</div>
                <div className="text-gray-800">{msg.text}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(msg.ts).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
