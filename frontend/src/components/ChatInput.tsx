import { useState, useRef, KeyboardEvent } from "react";
import { Send, Loader2 } from "lucide-react";

interface Props {
  onSend: (message: string) => void;
  loading: boolean;
  disabled?: boolean;
}

export default function ChatInput({ onSend, loading, disabled }: Props) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || loading) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end gap-3 rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Describe your situation — e.g. 'I am a farmer with 1 acre land in MP, annual income ₹80,000, looking for financial help for my daughter's education...'"
            rows={1}
            disabled={disabled || loading}
            className="flex-1 resize-none bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none disabled:opacity-50"
            style={{ maxHeight: "160px" }}
          />
          <button
            onClick={handleSend}
            disabled={!value.trim() || loading || disabled}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-gray-400">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}