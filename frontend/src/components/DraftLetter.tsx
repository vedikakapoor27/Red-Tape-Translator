import { useState } from "react";
import { CheckCircle2, Copy, FileText, X } from "lucide-react";

interface Props {
  letter: string;
  schemeName: string;
  onClose?: () => void;
}

export default function DraftLetter({ letter, schemeName, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-indigo-600" />
          <div>
            <p className="text-sm font-semibold text-indigo-800">Draft Application Letter</p>
            <p className="text-xs text-indigo-500">{schemeName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copy}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition"
          >
            {copied ? (
              <><CheckCircle2 size={12} /> Copied!</>
            ) : (
              <><Copy size={12} /> Copy Letter</>
            )}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-indigo-400 hover:bg-indigo-100 hover:text-indigo-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Letter content */}
      <div className="rounded-xl border border-indigo-100 bg-white p-4">
        <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-sans">
          {letter}
        </pre>
      </div>

      {/* Footer tip */}
      <p className="mt-3 text-xs text-indigo-500">
        💡 Tip — Print this letter, sign it, and attach photocopies of all required documents before submitting.
      </p>
    </div>
  );
}