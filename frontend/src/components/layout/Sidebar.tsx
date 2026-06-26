import { Conversation } from "../../types";
import { MessageSquare, Trash2, Plus } from "lucide-react";
import clsx from "clsx";

interface Props {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

export default function Sidebar({ conversations, activeId, onSelect, onNew, onDelete }: Props) {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
        <span className="text-sm font-semibold text-gray-700">Conversations</span>
        <button
          onClick={onNew}
          className="flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
        >
          <Plus size={13} /> New
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <MessageSquare size={24} className="mx-auto text-gray-300" />
            <p className="mt-2 text-xs text-gray-400">No conversations yet. Start by describing your situation.</p>
          </div>
        ) : (
          <ul className="py-2">
            {conversations.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => onSelect(c.id)}
                  className={clsx(
                    "group flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition",
                    activeId === c.id ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <MessageSquare size={14} className="shrink-0 opacity-60" />
                  <span className="flex-1 truncate">{c.title}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
                    className="hidden shrink-0 text-gray-400 hover:text-red-500 group-hover:block"
                  >
                    <Trash2 size={13} />
                  </button>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}