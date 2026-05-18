
import { Bot, Send, Sparkles, User, Terminal as TerminalIcon, Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useChatMessages, useAskAnalyst } from '../hooks/api/useChat';
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AnimatedSportsBackground } from "@/components/shared/AnimatedBackground";

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
		<div className="relative flex flex-col h-[calc(100vh-6rem)] max-w-[1400px] mx-auto overflow-hidden rounded-[32px] border border-white/5 bg-[#08090a]/50 backdrop-blur-xl shadow-2xl">
			<div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0c0d0e]/80">
				<div className="flex items-center gap-4">
					<div className="relative">
                        <div className="size-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                            <Bot className="size-6 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 size-3 rounded-full bg-emerald-500 border-2 border-[#0c0d0e] shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    </div>
					<div>
						<h1 className="text-lg font-black italic tracking-tighter text-white uppercase">Neural <span className="text-primary font-[900]">Analyst</span></h1>
						<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Session active • Real-time Data citation</p>
					</div>
				</div>
                <div className="hidden md:flex items-center gap-4">
                    <Badge variant="outline" className="bg-white/5 border-white/10 text-[9px] font-black tracking-widest px-3 py-1">MODEL: V3-PRO</Badge>
                </div>
			</div>

			<div className="relative flex-1 overflow-y-auto px-6 py-8 space-y-6 scrollbar-thin">
                <div className="pointer-events-none fixed inset-0 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />

				{(!chatMessages || chatMessages.length === 0) && (
					<div className="max-w-2xl mx-auto py-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
						<div className="size-20 mx-auto rounded-[32px] bg-gradient-to-br from-indigo-500/20 to-primary/20 border border-white/10 flex items-center justify-center mb-6 shadow-2xl">
							<Sparkles className="size-10 text-primary" />
						</div>
						<h2 className="text-3xl font-black italic text-white uppercase tracking-tighter mb-2">Initialize Intelligent Search</h2>
						<p className="text-muted-foreground text-sm uppercase tracking-widest font-bold opacity-40 mb-10">Select a neural node to begin deep market analysis</p>
						
						<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
							{PRESETS.map((preset, i) => (
								<button
									key={i}
									onClick={() => handleSend(preset.query)}
									className="group p-4 rounded-[20px] bg-white/[0.02] border border-white/5 text-left hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
								>
									<div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{preset.icon}</div>
									<div className="text-[10px] font-black text-white uppercase tracking-widest group-hover:text-primary">
										{preset.label}
									</div>
								</button>
							))}
						</div>
					</div>
				)}

				<AnimatePresence mode="popLayout">
					{chatMessages?.map((msg: any) => (
						<motion.div
							key={msg._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
							className={cn("flex gap-4", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
						>
							<div className={cn(
                                "size-10 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-xl border border-white/5",
                                msg.role === "user" ? "bg-white/5" : "bg-indigo-600 shadow-indigo-600/20"
                            )}>
								{msg.role === "user" ? <User className="size-5 text-white/40" /> : <Bot className="size-5 text-white" />}
							</div>
							<div className={cn(
								"max-w-[80%] rounded-[24px] p-6 shadow-2xl text-[#f7f8f8]",
								msg.role === "user"
									? "bg-indigo-500/10 border border-indigo-500/20 rounded-tr-none"
									: "bg-white/[0.03] border border-white/5 rounded-tl-none"
							)}>
								{msg.role === "assistant" ? (
									<MarkdownContent content={msg.content} />
								) : (
									<p className="text-sm font-medium leading-relaxed">
										{msg.content}
									</p>
								)}
								<div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-4 opacity-40">
                                    <Clock className="size-2.5" />
									{new Date(msg.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                                    <span>•</span>
                                    <span>ENCRYPTED ALPHA</span>
								</div>
							</div>
						</motion.div>
					))}
				</AnimatePresence>

				{loading && (
					<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
						<div className="size-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 mt-1 shadow-lg shadow-indigo-600/20">
							<Bot className="size-5 text-white" />
						</div>
						<div className="bg-white/[0.03] border border-white/5 rounded-[24px] rounded-tl-none p-6 flex items-center gap-4">
							<div className="flex gap-1.5">
								{[0, 1, 2].map((i) => (
                                    <motion.div 
                                        key={i}
                                        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                        className="size-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(0,255,136,0.5)]" 
                                    />
                                ))}
							</div>
							<span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Processing Neural Slate...</span>
						</div>
					</motion.div>
				)}
				<div ref={messagesEnd} />
			</div>

			<div className="p-6 bg-[#0c0d0e]/80 border-t border-white/5 backdrop-blur-md">
                <div className="max-w-4xl mx-auto">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-primary rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition-opacity" />
                        <div className="relative flex items-center gap-2 bg-[#08090a] rounded-2xl p-2 border border-white/10">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                placeholder="Consult the analyst..."
                                disabled={loading}
                                className="flex-1 bg-transparent px-4 py-2 text-sm text-white placeholder:text-muted-foreground/30 focus:outline-none disabled:opacity-50"
                            />
                            <Button
                                onClick={() => handleSend()}
                                disabled={!input.trim() || loading}
                                className="bg-primary text-primary-foreground h-11 w-12 p-0 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,255,136,0.2)]"
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
		<div className="text-sm text-[#f7f8f8]/90 space-y-4 font-medium leading-relaxed">
			{lines.map((line, i) => {
				const trimmed = line.trim();
				if (!trimmed) return null;
				if (trimmed.startsWith("## ")) return <h2 key={i} className="text-xl font-black italic uppercase tracking-tighter text-white pt-2">{trimmed.slice(3)}</h2>;
				if (trimmed.startsWith("### ")) return <h3 key={i} className="text-sm font-black uppercase tracking-[0.2em] text-primary">{trimmed.slice(4)}</h3>;
                if (trimmed.startsWith("*Step ") && trimmed.endsWith("*")) return (
                    <div key={i} className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl flex items-center gap-3">
                        <TerminalIcon className="size-4 text-indigo-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300 italic">{trimmed.replace(/\*/g, "")}</span>
                    </div>
                );
				if (trimmed.startsWith("• ") || trimmed.startsWith("- ")) return (
                    <div key={i} className="flex items-start gap-4 pl-2">
                        <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0 shadow-[0_0_8px_rgba(0,255,136,1)]" />
                        <p className="text-sm font-medium"><InlineFormatted text={trimmed.slice(2)} /></p>
                    </div>
                );
				return <p key={i} className="text-sm font-medium"><InlineFormatted text={trimmed} /></p>;
			})}
		</div>
	);
}

function InlineFormatted({ text }: { text: string }) {
	const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
	return (
		<>
			{parts.map((part, i) => {
				if (part.startsWith("**") && part.endsWith("**")) return <strong key={i} className="text-white font-[900] italic">{part.slice(2, -2)}</strong>;
				if (part.startsWith("*") && part.endsWith("*")) return <em key={i} className="text-primary italic font-[700]">{part.slice(1, -1)}</em>;
				return <span key={i}>{part}</span>;
			})}
		</>
	);
}
