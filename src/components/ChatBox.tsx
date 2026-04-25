import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  request_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

interface ChatBoxProps {
  requestId: string;
  /** Optional map of user_id -> display label (e.g. "Donor", full name) */
  participants?: Record<string, string>;
  className?: string;
  readOnly?: boolean;
  title?: string;
}

export const ChatBox = ({ requestId, participants = {}, className, readOnly, title }: ChatBoxProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("request_id", requestId)
        .order("created_at", { ascending: true });
      if (!active) return;
      if (error) toast.error(error.message);
      setMessages((data ?? []) as Message[]);
      setLoading(false);
    })();

    const channel = supabase
      .channel(`messages:${requestId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `request_id=eq.${requestId}` },
        (payload) => {
          setMessages((prev) =>
            prev.some((m) => m.id === (payload.new as Message).id) ? prev : [...prev, payload.new as Message],
          );
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [requestId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !body.trim()) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert({
      request_id: requestId,
      sender_id: user.id,
      body: body.trim(),
    });
    setSending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setBody("");
  };

  const labelFor = (uid: string) => {
    if (uid === user?.id) return "You";
    return participants[uid] ?? "User";
  };

  return (
    <div className={`bg-card rounded-xl border border-border/60 shadow-card flex flex-col ${className ?? ""}`}>
      <div className="px-4 py-3 border-b border-border/60 flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-primary" />
        <span className="font-medium text-sm">{title ?? "Conversation"}</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 max-h-80 min-h-48">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : messages.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-8">
            No messages yet. {readOnly ? "" : "Say hello to coordinate pickup."}
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === user?.id;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                  mine ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}>
                  <div className="text-[10px] opacity-70 mb-0.5">{labelFor(m.sender_id)}</div>
                  <div className="whitespace-pre-wrap break-words">{m.body}</div>
                  <div className="text-[10px] opacity-60 mt-1 text-right">
                    {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {!readOnly && (
        <form onSubmit={send} className="border-t border-border/60 p-3 flex gap-2">
          <Input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Type a message…"
            maxLength={2000}
            disabled={sending}
          />
          <Button type="submit" size="icon" disabled={sending || !body.trim()} className="bg-gradient-warm shadow-warm">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      )}
    </div>
  );
};
