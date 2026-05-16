import { useAction, useQuery } from "convex/react";
import { Bot, Send, Sparkles, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "../../convex/_generated/api";

const PRESETS = [
  {
    icon: "🔥",
    label: "Best Overs",
    query: "Best overs tonight — detailed breakdown with Monte Carlo data",
  },
  {
    icon: "📉",
    label: "Best Unders",
    query: "Best unders tonight with defensive context and fade reasoning",
  },
  {
    icon: "🏀",
    label: "NBA Edges",
    query: "Top NBA edges tonight — step by step analysis with projections",
  },
  {
    icon: "🏈",
    label: "NFL Props",
    query: "Best NFL player props with edge and consensus analysis",
  },
  {
    icon: "⚾",
    label: "MLB Picks",
    query: "Top MLB edges today with pitcher matchup analysis",
  },
  {
    icon: "🏗️",
    label: "Build 6-Pick",
    query: "Build me a 6-pick PrizePicks flex entry with diversification",
  },
  {
    icon: "💹",
    label: "Kalshi Markets",
    query: "Kalshi market analysis — best YES and NO positions with payouts",
  },
  {
    icon: "🛡️",
    label: "Lower Variance",
    query: "Show me the lowest bust risk picks with highest confidence",
  },
  {
    icon: "🔥",
    label: "Hot Streaks",
    query: "Which players are on hot streaks with positive edge?",
  },
  {
    icon: "🎲",
    label: "Monte Carlo",
    query: "Show me the Monte Carlo simulation analysis for top props",
  },
  {
    icon: "⚖️",
    label: "Compare Values",
    query: "Compare the best overs vs best unders — which side has more value?",
  },
  {
    icon: "🐕",
    label: "Underdog Entry",
    query: "Build me an optimized 5-pick Underdog flex entry under $25",
  },
  {
    icon: "💎",
    label: "Value Score",
    query: "Show the highest Value Score picks across all sports and platforms",
  },
  {
    icon: "📊",
    label: "Full Analysis",
    query:
      "Give me a complete analysis of tonight's slate — edges, games, and picks",
  },
];

export function AIChatPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatMessages = useQuery(api.chat.messages, {});
  const askAnalyst = useAction(api.chat.askAnalyst);
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSend = async (text?: string) => {
    const question = text || input.trim();
    if (!question || loading) return;
    setInput("");
    setLoading(true);
    try {
      await askAnalyst({ question });
    } catch {
      // Error handled by fallback in backend
    } finally {
      setLoading(false);
    }
  };

  const handlePreset = (query: string) => {
    handleSend(query);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-[1200px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-[#A855F7] to-[#00FF88] flex items-center justify-center">
            <Bot className="size-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              PropEdge AI Analyst
            </h1>
            <p className="text-xs text-muted-foreground">
              Step-by-step reasoning with real data citations
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="text-[10px] bg-[#00FF88]/15 text-[#00FF88] border-[#00FF88]/20 gap-1">
            <div className="size-1.5 rounded-full bg-[#00FF88] animate-pulse" />
            ONLINE
          </Badge>
        </div>
      </div>

      {/* Preset Buttons */}
      {(!chatMessages || chatMessages.length === 0) && (
        <div className="py-6">
          <div className="text-center mb-4">
            <div className="size-16 mx-auto rounded-2xl bg-gradient-to-br from-[#A855F7]/20 to-[#00FF88]/20 border border-[#A855F7]/30 flex items-center justify-center mb-3">
              <Sparkles className="size-7 text-[#A855F7]" />
            </div>
            <h2 className="text-lg font-bold text-white">
              What can I analyze?
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Pick a preset or ask anything about today's props, edges, and
              markets
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {PRESETS.map((preset, i) => (
              <button
                key={i}
                onClick={() => handlePreset(preset.query)}
                className="p-3 rounded-xl bg-[#111827] border border-[#1E293B] text-left hover:border-[#A855F7]/30 hover:bg-[#1A2236]/50 transition-all group"
              >
                <div className="text-lg mb-1">{preset.icon}</div>
                <div className="text-xs font-semibold text-white group-hover:text-[#A855F7] transition-colors">
                  {preset.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 scrollbar-thin">
        {chatMessages?.map((msg: any) => (
          <div
            key={msg._id}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="size-8 rounded-lg bg-gradient-to-br from-[#A855F7] to-[#00FF88] flex items-center justify-center shrink-0 mt-1">
                <Bot className="size-4 text-white" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-xl p-4 ${
                msg.role === "user"
                  ? "bg-[#A855F7]/15 border border-[#A855F7]/20"
                  : "bg-[#111827] border border-[#1E293B]"
              }`}
            >
              {msg.role === "assistant" ? (
                <MarkdownContent content={msg.content} />
              ) : (
                <p className="text-sm text-white whitespace-pre-wrap">
                  {msg.content}
                </p>
              )}
              <div className="text-[10px] text-muted-foreground mt-2">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </div>
            </div>
            {msg.role === "user" && (
              <div className="size-8 rounded-lg bg-[#1A2236] border border-[#1E293B] flex items-center justify-center shrink-0 mt-1">
                <User className="size-4 text-[#7B8BA8]" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="size-8 rounded-lg bg-gradient-to-br from-[#A855F7] to-[#00FF88] flex items-center justify-center shrink-0">
              <Bot className="size-4 text-white" />
            </div>
            <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-4 max-w-[80%]">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div
                    className="size-2 rounded-full bg-[#A855F7] animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="size-2 rounded-full bg-[#00FF88] animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="size-2 rounded-full bg-[#00D4FF] animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  Analyzing data...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEnd} />
      </div>

      {/* Quick Presets Bar (always visible) */}
      {chatMessages && chatMessages.length > 0 && (
        <div className="flex gap-1.5 py-2 overflow-x-auto scrollbar-none">
          {PRESETS.slice(0, 8).map((preset, i) => (
            <button
              key={i}
              onClick={() => handlePreset(preset.query)}
              disabled={loading}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#111827] border border-[#1E293B] text-xs text-muted-foreground hover:text-white hover:border-[#A855F7]/30 transition-all whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              <span>{preset.icon}</span>
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="pt-3 pb-2 border-t border-[#1E293B]">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder="Ask about props, edges, matchups, or build entries..."
              disabled={loading}
              className="w-full bg-[#111827] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#4B5A78] focus:border-[#A855F7]/50 focus:ring-1 focus:ring-[#A855F7]/20 outline-none disabled:opacity-50"
            />
          </div>
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="bg-[#A855F7] hover:bg-[#A855F7]/90 text-white size-11 p-0 rounded-xl shrink-0"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Render AI markdown responses with step-by-step highlighting
function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <div className="text-sm text-[#C8D0E0] space-y-1.5">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1" />;

        // ## Header
        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={i} className="text-base font-bold text-white mt-3 mb-1">
              {trimmed.slice(3)}
            </h2>
          );
        }
        // ### Sub-header
        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={i} className="text-sm font-bold text-[#00D4FF] mt-2 mb-1">
              {trimmed.slice(4)}
            </h3>
          );
        }
        // Step markers
        if (trimmed.startsWith("*Step ") && trimmed.endsWith("*")) {
          return (
            <div key={i} className="flex items-center gap-2 mt-2 mb-1">
              <div className="size-5 rounded-full bg-[#A855F7]/20 flex items-center justify-center shrink-0">
                <span className="text-[9px] font-bold text-[#A855F7]">
                  {trimmed.match(/Step (\d)/)?.[1] || "?"}
                </span>
              </div>
              <span className="text-xs font-semibold text-[#A855F7]">
                {trimmed.replace(/\*/g, "")}
              </span>
            </div>
          );
        }
        // Horizontal rule
        if (trimmed === "---") {
          return <hr key={i} className="border-[#1E293B] my-2" />;
        }
        // Bullet
        if (trimmed.startsWith("• ") || trimmed.startsWith("- ")) {
          return (
            <div key={i} className="flex items-start gap-2 pl-1">
              <span className="text-[#A855F7] mt-0.5 shrink-0">•</span>
              <span className="text-sm">
                <InlineFormatted text={trimmed.slice(2)} />
              </span>
            </div>
          );
        }
        // Numbered
        if (/^\d+\./.test(trimmed)) {
          return (
            <div key={i} className="flex items-start gap-2 pl-1">
              <span className="text-[#00D4FF] font-mono text-xs mt-0.5 shrink-0">
                {trimmed.match(/^(\d+\.)/)?.[1]}
              </span>
              <span className="text-sm">
                <InlineFormatted text={trimmed.replace(/^\d+\.\s*/, "")} />
              </span>
            </div>
          );
        }
        // Default paragraph
        return (
          <p key={i} className="text-sm">
            <InlineFormatted text={trimmed} />
          </p>
        );
      })}
    </div>
  );
}

// Parse **bold** and *italic* inline
function InlineFormatted({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="text-white font-bold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("*") && part.endsWith("*")) {
          return (
            <em key={i} className="text-muted-foreground italic">
              {part.slice(1, -1)}
            </em>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
