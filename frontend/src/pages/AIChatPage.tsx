import { AlertTriangle, Bot, Clock, Send, Sparkles, User, Terminal as TerminalIcon, Zap, BookOpen } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useChatMessages, useAskAnalyst } from '../hooks/api/useChat';
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const PRESETS = [
  { icon: "🔥", label: "Best Overs", query: "Best overs tonight — detailed breakdown with Monte Carlo data" },
  { icon: "📉", label: "Best Unders", query: "Best unders tonight with defensive context and fade reasoning" },
  { icon: "🏀", label: "NBA Edges", query: "Top NBA edges tonight — step by step analysis with projections" },
  { icon: "🏗️", label: "Build 6-Pick", query: "Build me a 6-pick PrizePicks flex entry with diversification" },
  { icon: "🛡️", label: "Lower Variance", query: "Show me the lowest bust risk picks with highest confidence" },
  { icon: "💹", label: "Value Score", query: "Show the highest Value Score picks across all sports and platforms" },
];

export function AIChatPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: chatMessages } = useChatMessages();
  const askAnalyst = useAskAnalyst();
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, loading]);

  const handleSend = async (text?: string) => {
    const question = text || input.trim();
    if (!question || loading) return;
    setInput("");
    setLoading(true);
    try {
      await askAnalyst.mutateAsync(question);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col h-[calc(100vh-6rem)] max-w-[1400px] mx-auto overflow-hidden rounded-3xl border border-white/[0.06] bg-[#08090a]/60 backdrop-blur-xl shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-[#0c0d0e]/90 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="size-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center" style={{ boxShadow: '0 0 25px rgba(79,70,229,0.3)' }}>
              <Bot className="size-6 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 size-3.5 rounded-full bg-emerald-500 border-2 border-[#0c0d0e] shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white">
              Neural <span className="text-primary">Analyst</span>
            </h1>
            <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Session Active · Real-time Citations</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Badge variant="outline" className="bg-white/[0.03] border-white/[0.08] text-[9px] font-black tracking-widest px-3 py-1">MODEL: V3-PRO</Badge>
          <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black tracking-widest px-3 py-1">
            <Zap className="size-2.5 mr-1 fill-current" /> LIVE DATA
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <div className="relative flex-1 overflow-y-auto px-4 lg:px-6 py-6 space-y-5 scrollbar-thin">
        {/* Empty State */}
        {(!chatMessages || chatMessages.length === 0) && !loading && (
          <div className="max-w-2xl mx-auto py-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="size-20 mx-auto rounded-3xl bg-gradient-to-br from-indigo-500/15 to-primary/10 border border-white/[0.08] flex items-center justify-center mb-6 shadow-2xl">
              <Sparkles className="size-10 text-primary" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight mb-2">Ask the Neural Analyst</h2>
            <p className="text-sm text-muted-foreground/40 mb-8">Select a quick prompt or type your own question</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PRESETS.map((preset, i) => (
                <motion.button
                  key={i}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSend(preset.query)}
                  className="group p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-left hover:border-primary/30 hover:bg-primary/[0.03] transition-all duration-300"
                >
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{preset.icon}</div>
                  <div className="text-[10px] font-black text-white/70 uppercase tracking-widest group-hover:text-primary transition-colors">
                    {preset.label}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <AnimatePresence mode="popLayout">
          {chatMessages?.map((msg: any) => (
            <motion.div
              key={msg._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
            >
              <div className={cn(
                "size-9 rounded-xl flex items-center justify-center shrink-0 mt-1 border border-white/[0.06]",
                msg.role === "user" ? "bg-white/[0.04]" : "bg-gradient-to-br from-indigo-600 to-purple-600"
              )}>
                {msg.role === "user" ? <User className="size-4 text-white/40" /> : <Bot className="size-4 text-white" />}
              </div>
              <div className={cn(
                "max-w-[80%] rounded-2xl p-5 text-[#f7f8f8]",
                msg.role === "user"
                  ? "bg-indigo-500/[0.08] border border-indigo-500/20 rounded-tr-sm"
                  : "bg-white/[0.02] border border-white/[0.06] rounded-tl-sm"
              )}>
                {msg.role === "assistant" ? (
                  <div className="space-y-3">
                    <MarkdownContent content={msg.content} />
                    {/* Source Citations */}
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/[0.04]">
                      <span className="text-[8px] font-bold text-muted-foreground/30 uppercase tracking-wider flex items-center gap-1">
                        <BookOpen className="size-2.5" /> Sources:
                      </span>
                      {['PropEdge Model', 'Historical Stats', 'Odds API'].map((src, i) => (
                        <span key={i} className="text-[8px] font-bold text-primary/50 bg-primary/5 px-1.5 py-0.5 rounded">{src}</span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                )}
                <div className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest text-muted-foreground/30 mt-3">
                  <Clock className="size-2.5" />
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="size-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shrink-0 mt-1">
              <Bot className="size-4 text-white" />
            </div>
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl rounded-tl-sm p-5 flex items-center gap-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="size-1.5 rounded-full bg-primary"
                    style={{ boxShadow: '0 0 6px rgba(0,255,136,0.5)' }}
                  />
                ))}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Analyzing...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEnd} />
      </div>

      {/* Risk Warning */}
      <div className="px-6 py-2 bg-amber-500/[0.03] border-t border-amber-500/10">
        <div className="flex items-center gap-2 text-[9px] text-amber-400/60 font-bold">
          <AlertTriangle className="size-3 shrink-0" />
          <span>AI analysis is for informational purposes only. Always do your own research before placing any bets.</span>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 lg:p-6 bg-[#0c0d0e]/90 border-t border-white/[0.06] backdrop-blur-xl">
        <div className="max-w-4xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-primary/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <div className="relative flex items-center gap-2 bg-[#08090a] rounded-2xl p-2 border border-white/[0.08]">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about edges, picks, player matchups..."
                disabled={loading}
                className="flex-1 bg-transparent px-4 py-2 text-sm text-white placeholder:text-muted-foreground/30 focus:outline-none disabled:opacity-50"
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="bg-primary text-primary-foreground h-10 w-12 p-0 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,255,136,0.2)]"
              >
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="text-sm text-[#f7f8f8]/85 space-y-3 leading-relaxed">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith("## ")) return <h2 key={i} className="text-lg font-black text-white pt-1">{trimmed.slice(3)}</h2>;
        if (trimmed.startsWith("### ")) return <h3 key={i} className="text-sm font-black uppercase tracking-widest text-primary">{trimmed.slice(4)}</h3>;
        if (trimmed.startsWith("*Step ") && trimmed.endsWith("*")) return (
          <div key={i} className="bg-indigo-500/[0.08] border border-indigo-500/15 p-3 rounded-xl flex items-center gap-2">
            <TerminalIcon className="size-3.5 text-indigo-400 shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300/80">{trimmed.replace(/\*/g, "")}</span>
          </div>
        );
        if (trimmed.startsWith("• ") || trimmed.startsWith("- ")) return (
          <div key={i} className="flex items-start gap-3 pl-1">
            <div className="size-1.5 rounded-full bg-primary mt-2 shrink-0" style={{ boxShadow: '0 0 4px rgba(0,255,136,0.5)' }} />
            <p className="text-sm"><InlineFormatted text={trimmed.slice(2)} /></p>
          </div>
        );
        return <p key={i} className="text-sm"><InlineFormatted text={trimmed} /></p>;
      })}
    </div>
  );
}

function InlineFormatted({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
        if (part.startsWith("*") && part.endsWith("*")) return <em key={i} className="text-primary font-semibold">{part.slice(1, -1)}</em>;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
