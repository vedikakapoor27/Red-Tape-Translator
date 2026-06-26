import { useState, useCallback } from "react";
import { Conversation, ClaudeResponse, Message, SchemeMatch } from "../types";
import { sendMessage, getConversation, listConversations, deleteConversation } from "../lib/api";

export function useConversation() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [schemeMatches, setSchemeMatches] = useState<SchemeMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await listConversations();
      setConversations(res.data);
    } catch {
      setError("Failed to load conversations.");
    }
  }, []);

  const loadConversation = useCallback(async (id: string) => {
    try {
      const res = await getConversation(id);
      setActiveConversation(res.data);
      setSchemeMatches(res.data.scheme_matches || []);
    } catch {
      setError("Failed to load conversation.");
    }
  }, []);

  const startNewConversation = useCallback(() => {
    setActiveConversation(null);
    setSchemeMatches([]);
    setError(null);
  }, []);

  const send = useCallback(
    async (content: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await sendMessage(content, activeConversation?.id);
        const data: ClaudeResponse = res.data;

        // Append messages locally
        const userMsg: Message = {
          id: `temp-${Date.now()}`,
          role: "user",
          content,
          created_at: new Date().toISOString(),
        };
        const assistantMsg = data.assistant_message;

        setActiveConversation((prev) => {
          if (!prev) {
            return {
              id: data.conversation_id,
              title: content.slice(0, 60),
              created_at: new Date().toISOString(),
              messages: [userMsg, assistantMsg],
              scheme_matches: [],
            };
          }
          return {
            ...prev,
            messages: [...prev.messages, userMsg, assistantMsg],
          };
        });

        if (data.scheme_matches?.length) {
          setSchemeMatches((prev) => [...data.scheme_matches, ...prev]);
        }

        // Refresh sidebar list
        await fetchConversations();
      } catch (err: any) {
        const msg = err?.response?.data?.detail || "Something went wrong. Please try again.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [activeConversation, fetchConversations]
  );

  const remove = useCallback(
    async (id: string) => {
      try {
        await deleteConversation(id);
        if (activeConversation?.id === id) startNewConversation();
        await fetchConversations();
      } catch {
        setError("Failed to delete conversation.");
      }
    },
    [activeConversation, fetchConversations, startNewConversation]
  );

  return {
    conversations,
    activeConversation,
    schemeMatches,
    loading,
    error,
    fetchConversations,
    loadConversation,
    startNewConversation,
    send,
    remove,
  };
}