import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { setAuthToken, getAdminStats, listUsers, listAllConversations } from "../lib/api";
import { AdminStats } from "../types";
import Navbar from "../components/layout/Navbar";
import { Users, MessageSquare, FileText, Sparkles } from "lucide-react";

export default function Admin() {
  const { getToken } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [tab, setTab] = useState<"stats" | "users" | "conversations">("stats");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      setAuthToken(token);
      try {
        const [s, u, c] = await Promise.all([getAdminStats(), listUsers(), listAllConversations()]);
        setStats(s.data);
        setUsers(u.data);
        setConversations(c.data);
      } catch {
        setError("Access denied or API error.");
      }
    })();
  }, []);

  if (error) return (
    <div className="flex h-screen items-center justify-center text-red-600 text-sm">{error}</div>
  );

  const statCards = stats ? [
    { label: "Total Users", value: stats.total_users, icon: <Users size={20} className="text-indigo-500" /> },
    { label: "Conversations", value: stats.total_conversations, icon: <MessageSquare size={20} className="text-green-500" /> },
    { label: "Messages", value: stats.total_messages, icon: <FileText size={20} className="text-orange-500" /> },
    { label: "Scheme Matches", value: stats.total_scheme_matches, icon: <Sparkles size={20} className="text-purple-500" /> },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isAdmin />
      <div className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

        {/* Tab bar */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {(["stats", "users", "conversations"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition ${
                tab === t ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Stats */}
        {tab === "stats" && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {statCards.map((s) => (
              <div key={s.label} className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  {s.icon}
                </div>
                <p className="mt-3 text-3xl font-bold text-gray-900">{s.value.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Users */}
        {tab === "users" && (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  {["Name", "Email", "Admin", "Joined"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{u.name || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.is_admin ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-500"}`}>
                        {u.is_admin ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Conversations */}
        {tab === "conversations" && (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  {["Title", "Messages", "Scheme Matches", "Date"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {conversations.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 max-w-xs truncate font-medium text-gray-900">{c.title}</td>
                    <td className="px-4 py-3 text-gray-600">{c.messages?.length ?? 0}</td>
                    <td className="px-4 py-3 text-gray-600">{c.scheme_matches?.length ?? 0}</td>
                    <td className="px-4 py-3 text-gray-400">{new Date(c.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}