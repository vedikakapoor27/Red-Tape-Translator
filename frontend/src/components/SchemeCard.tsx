import { SchemeMatch } from "../types";
import { ExternalLink, FileText, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const CATEGORY_COLORS: Record<string, string> = {
  agriculture: "bg-green-100 text-green-700",
  health: "bg-red-100 text-red-700",
  housing: "bg-orange-100 text-orange-700",
  education: "bg-blue-100 text-blue-700",
  entrepreneurship: "bg-purple-100 text-purple-700",
  insurance: "bg-teal-100 text-teal-700",
  pension: "bg-gray-100 text-gray-700",
  food: "bg-yellow-100 text-yellow-700",
  skill_training: "bg-cyan-100 text-cyan-700",
  women_livelihood: "bg-pink-100 text-pink-700",
  women_children: "bg-rose-100 text-rose-700",
  labour: "bg-amber-100 text-amber-700",
  employment: "bg-lime-100 text-lime-700",
};

interface Props {
  match: SchemeMatch;
}

export default function SchemeCard({ match }: Props) {
  const { scheme, confidence_score, reason, draft_letter } = match;
  const [showLetter, setShowLetter] = useState(false);
  const [copied, setCopied] = useState(false);
  const pct = Math.round((confidence_score ?? 0) * 100);
  const colorClass = CATEGORY_COLORS[scheme.category ?? ""] ?? "bg-indigo-100 text-indigo-700";

  const copyLetter = () => {
    if (draft_letter) {
      navigator.clipboard.writeText(draft_letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
              {(scheme.category ?? "general").replace("_", " ")}
            </span>
            <span className="text-xs text-gray-400">{scheme.ministry}</span>
          </div>
          <h3 className="text-base font-semibold text-gray-900">{scheme.name}</h3>
        </div>
        {/* Confidence ring */}
        <div className="flex flex-col items-center">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full border-4 text-sm font-bold"
            style={{
              borderColor: pct >= 80 ? "#22c55e" : pct >= 60 ? "#f59e0b" : "#6b7280",
              color: pct >= 80 ? "#16a34a" : pct >= 60 ? "#d97706" : "#4b5563",
            }}
          >
            {pct}%
          </div>
          <span className="mt-1 text-xs text-gray-400">match</span>
        </div>
      </div>

      {/* Description */}
      {scheme.description && (
        <p className="mt-3 text-sm text-gray-600 leading-relaxed">{scheme.description}</p>
      )}

      {/* Why you qualify */}
      {reason && (
        <div className="mt-3 rounded-xl bg-indigo-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">Why you qualify</p>
          <p className="mt-1 text-sm text-indigo-800">{reason}</p>
        </div>
      )}

      {/* Benefits */}
      {scheme.benefits && (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Benefits</p>
          <p className="mt-1 text-sm text-gray-700">{scheme.benefits}</p>
        </div>
      )}

      {/* Documents */}
      {scheme.documents_required?.length ? (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Documents needed</p>
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {scheme.documents_required.map((doc) => (
              <li key={doc} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                {doc}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        {scheme.official_url && (
          
            href={scheme.official_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            <ExternalLink size={12} /> Official Portal
          </a>
        )}
        {draft_letter && (
          <button
            onClick={() => setShowLetter((p) => !p)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
          >
            <FileText size={12} /> {showLetter ? "Hide Letter" : "View Draft Letter"}
          </button>
        )}
      </div>

      {/* Draft Letter */}
      {showLetter && draft_letter && (
        <div className="mt-4 rounded-xl border border-dashed border-indigo-200 bg-indigo-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">Draft Application Letter</p>
            <button
              onClick={copyLetter}
              className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline"
            >
              {copied ? <><CheckCircle2 size={12} /> Copied!</> : "Copy"}
            </button>
          </div>
          <pre className="whitespace-pre-wrap text-xs text-gray-700 leading-relaxed font-sans">{draft_letter}</pre>
        </div>
      )}
    </div>
  );
}