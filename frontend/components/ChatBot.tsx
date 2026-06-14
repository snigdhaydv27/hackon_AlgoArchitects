"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Sparkles, Recycle, Bot } from "lucide-react";

// ============================================================================
// LOOPY - ReLoop's animated assistant.
// Single-file: avatar (SVG robot with cursor-tracking eyes + mood) + chat panel.
// Drop into layout to appear on every page.
// ============================================================================

type Msg = { id: string; role: "bot" | "user"; text: string; chips?: string[] };
type Mood = "idle" | "thinking" | "talking" | "happy";

const TEASERS = [
  "Need a tour? 👋",
  "Ask me how Neighbor First works",
  "Curious about the AI grading?",
  "I can explain the economics ✨",
];

const QUICK_CHIPS = [
  "What is Amazon?",
  "How does AI grading work?",
  "Show me Neighbor First",
  "Explain the economics",
];

const KB: { test: RegExp; answer: string; chips?: string[] }[] = [
  {
    test: /(hello|hi|hey|namaste|hola)/i,
    answer:
      "Hi! I'm Loopy 🤖 - Amazon's circular companion. Every returned, unused, or outgrown product finds its next best owner here. Ask me anything.",
    chips: ["What is Amazon?", "How do I try the demo?", "Why circular?"],
  },
  {
    test: /(what is|tell me about|introduce|explain|reloop|amazon)/i,
    answer:
      "Amazon solves the long-tail return problem. ₹200-₹800 items where shipping costs more than the product. We use AI grading + smart routing + hyperlocal locker handoffs so every return finds its next best owner - instead of being liquidated for ₹0.",
    chips: ["AI grading?", "Neighbor First?", "Show economics"],
  },
  {
    test: /(ai|grad|claude|vision|photo)/i,
    answer:
      "Upload a photo -> Claude vision returns A/B/C/D in under 2 seconds, with a defect list, AI summary, confidence score, and a price band. Provider-abstracted: swap Anthropic / Bedrock / Nova / mock by one env var.",
    chips: ["Smart routing?", "Trust Layer?"],
  },
  {
    test: /(neighbor|local|map|locker|hyperlocal|kirana)/i,
    answer:
      "Neighbor First is the magic. Verified buyer ≤ 20km. MongoDB $geoNear matches the closest. Drop at a kirana locker. Buyer pays + picks up via QR. Zero strangers, zero shipping, zero haggling.",
    chips: ["How is locker partner picked?", "What if no buyer?"],
  },
  {
    test: /(rout|decide|engine|path|liquidat)/i,
    answer:
      "Smart routing picks one of 5 paths: Neighbor First -> Renewed -> Refurbish -> Donate -> Recycle. Decision is recovery vs logistics, transparent, never blind liquidation.",
    chips: ["Neighbor First?", "Show economics"],
  },
  {
    test: /(prevent|warn|size|fit|wrong)/i,
    answer:
      "The most circular outcome is the return that never starts. When you pick a size, prevention auto-fires: \\\"847 customers with your foot profile preferred Size 8.\\\" One click prevents a return.",
    chips: ["Try the demo", "How is data sourced?"],
  },
  {
    test: /(trust|health|card|verify|safe|fraud)/i,
    answer:
      "Every listing gets a Product Health Card: AI summary, defect list with severity, Amazon signature, fixed price, locker pickup. No haggling. No strangers. No doorstep visits.",
    chips: ["Show me", "Pricing?"],
  },
  {
    test: /(econom|recover|money|saving|profit|liquidation)/i,
    answer:
      "₹0 (old liquidation) -> ₹350+ avg net recovery per ₹500-₹800 return. 100% logistics saved when Neighbor First fires. The admin dashboard shows live numbers.",
    chips: ["See dashboard", "How sustainable?"],
  },
  {
    test: /(demo|try|how do i|where do i|test)/i,
    answer:
      "Easiest path: click Login -> pick Priya -> upload any product photo -> watch AI grade + smart route -> see the locker QR. The whole loop in 90 seconds.",
    chips: ["What is Amazon?", "Personas?"],
  },
  {
    test: /(persona|priya|rahul|seller|buyer)/i,
    answer:
      "Three faces: Priya (returns ₹500 shoes), Rahul (sells unused baby monitor), Anjali (small seller, 200 returns/month). All pre-seeded in Bangalore so the geo matching just works.",
    chips: ["Try as Priya", "Why Bangalore?"],
  },
  {
    test: /(thanks|thank you|cool|nice|amazing|love|wow)/i,
    answer:
      "Made my circuits glow ✨ Anything else you want to loop in on?",
    chips: ["Show me Neighbor First", "Try the demo"],
  },
  {
    test: /(bye|see you|goodbye|cya)/i,
    answer: "Bye! 👋 Remember - every return finds its next best owner.",
  },
];

const FALLBACK = {
  answer:
    "Good question. I know about AI grading, smart routing, Neighbor First, the Trust Layer, prevention, economics, and our personas. Try one of these:",
  chips: QUICK_CHIPS,
};

function answerFor(input: string): { text: string; chips?: string[] } {
  for (const e of KB) {
    if (e.test.test(input)) return { text: e.answer, chips: e.chips };
  }
  return { text: FALLBACK.answer, chips: FALLBACK.chips };
}

// Fallback UUID generator that works everywhere without relying on window.crypto
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

// ============================================================================
// Robot avatar - SVG with cursor-tracking eyes, blink, antenna LED, mouth.
// ============================================================================

function RobotFace({
  mood,
  size = 56,
  mouseX,
  mouseY,
  anchor,
}: {
  mood: Mood;
  size?: number;
  mouseX: number | null;
  mouseY: number | null;
  anchor?: { x: number; y: number } | null;
}) {
  const [blink, setBlink] = useState(false);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });

  // Random blink loop
  useEffect(() => {
    const id = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 140);
    }, 2400 + Math.random() * 2200);
    return () => clearInterval(id);
  }, []);

  // Eye tracking - follow cursor relative to anchor
  useEffect(() => {
    if (mouseX === null || mouseY === null || !anchor) return;
    const dx = mouseX - anchor.x;
    const dy = mouseY - anchor.y;
    const dist = Math.hypot(dx, dy) || 1;
    const max = 2.4;
    setEyeOffset({
      x: (dx / dist) * Math.min(dist / 80, max),
      y: (dy / dist) * Math.min(dist / 80, max),
    });
  }, [mouseX, mouseY, anchor]);

  const ledColor =
    mood === "thinking" ? "#f59e0b" : mood === "happy" ? "#10b981" : "#46d195";
  const eyeShape = blink ? 0.08 : 1; // scaleY when blinking
  const mouthOpen = mood === "talking";

  return (
    <svg viewBox="0 0 80 80" width={size} height={size} aria-hidden>
      <defs>
        <linearGradient id="bot-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1d3d33" />
          <stop offset="50%" stopColor="#102822" />
          <stop offset="100%" stopColor="#04120e" />
        </linearGradient>
        <linearGradient id="bot-face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f7651" />
          <stop offset="100%" stopColor="#0c4d38" />
        </linearGradient>
        <radialGradient id="bot-led">
          <stop offset="0%" stopColor={ledColor} stopOpacity="1" />
          <stop offset="100%" stopColor={ledColor} stopOpacity="0" />
        </radialGradient>
        <filter id="bot-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>

      {/* Antenna */}
      <line
        x1="40"
        y1="14"
        x2="40"
        y2="6"
        stroke="#0a1f1a"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="40" cy="40" r="22" fill="url(#bot-led)" opacity="0.0" />
      {/* LED with pulse ring */}
      <circle cx="40" cy="6" r="6" fill="url(#bot-led)" opacity="0.45">
        <animate
          attributeName="r"
          values="6;9;6"
          dur="1.6s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.45;0.1;0.45"
          dur="1.6s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="40" cy="6" r="2.5" fill={ledColor} filter="url(#bot-glow)" />

      {/* Head body - rounded square */}
      <rect
        x="14"
        y="16"
        width="52"
        height="48"
        rx="14"
        fill="url(#bot-body)"
        stroke="#0a1f1a"
        strokeWidth="1"
      />
      {/* Inner face plate */}
      <rect x="20" y="22" width="40" height="32" rx="10" fill="url(#bot-face)" />
      {/* Subtle scanlines */}
      <g opacity="0.18">
        {Array.from({ length: 6 }).map((_, i) => (
          <line
            key={i}
            x1="20"
            y1={26 + i * 5}
            x2="60"
            y2={26 + i * 5}
            stroke="#46d195"
            strokeWidth="0.3"
          />
        ))}
      </g>

      {/* Eyes */}
      <g transform={`translate(${eyeOffset.x}, ${eyeOffset.y})`}>
        <ellipse
          cx="31"
          cy="36"
          rx="3.2"
          ry={3.2 * eyeShape}
          fill="#7ce4b6"
          filter="url(#bot-glow)"
        />
        {!blink && (
          <animate
            attributeName="ry"
            values="3.2;3.2;0.4;3.2"
            keyTimes="0;0.92;0.96;1"
            dur="4s"
            repeatCount="indefinite"
          />
        )}
        <ellipse
          cx="49"
          cy="36"
          rx="3.2"
          ry={3.2 * eyeShape}
          fill="#7ce4b6"
          filter="url(#bot-glow)"
        />
        {/* Eye shine */}
        <circle cx="32.4" cy="34.8" r="0.7" fill="#fff" opacity="0.9" />
        <circle cx="50.4" cy="34.8" r="0.7" fill="#fff" opacity="0.9" />
      </g>

      {/* Mouth */}
      {mouthOpen ? (
        <rect x="34" y="46" width="12" height="3.2" rx="1.6" fill="#46d195">
          <animate
            attributeName="height"
            values="2;4;2"
            dur="0.45s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="y"
            values="46.5;45.5;46.5"
            dur="0.45s"
            repeatCount="indefinite"
          />
        </rect>
      ) : mood === "happy" ? (
        <path
          d="M 33 46 Q 40 51 47 46"
          fill="none"
          stroke="#46d195"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ) : (
        <line
          x1="35"
          y1="48"
          x2="45"
          y2="48"
          stroke="#46d195"
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}

      {/* Side ear-bolts */}
      <rect x="11" y="32" width="4" height="14" rx="2" fill="#0a1f1a" />
      <rect x="65" y="32" width="4" height="14" rx="2" fill="#0a1f1a" />

      {/* Cheek vents */}
      <line x1="22" y1="58" x2="26" y2="58" stroke="#1eb877" strokeWidth="1" opacity="0.6" />
      <line x1="22" y1="60" x2="28" y2="60" stroke="#1eb877" strokeWidth="1" opacity="0.6" />
      <line x1="54" y1="58" x2="58" y2="58" stroke="#1eb877" strokeWidth="1" opacity="0.6" />
      <line x1="52" y1="60" x2="58" y2="60" stroke="#1eb877" strokeWidth="1" opacity="0.6" />
    </svg>
  );
}

// ============================================================================
// Main ChatBot
// ============================================================================

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "boot",
      role: "bot",
      text: "Hi! I'm Loopy 🤖 - Amazon's circular companion. Ask me anything about how returns find their next best owner.",
      chips: QUICK_CHIPS,
    },
  ]);
  const [input, setInput] = useState("");
  const [mood, setMood] = useState<Mood>("idle");
  const [teaserIdx, setTeaserIdx] = useState(0);
  const [showTeaser, setShowTeaser] = useState(true);

  // For mouse-tracking
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [anchorPos, setAnchorPos] = useState<{ x: number; y: number } | null>(null);

  const avatarRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Teaser cycle loop
  useEffect(() => {
    if (open) return;
    const t = setInterval(() => {
      setShowTeaser(false);
      setTimeout(() => {
        setTeaserIdx((prev) => (prev + 1) % TEASERS.length);
        setShowTeaser(true);
      }, 400);
    }, 7000);
    return () => clearInterval(t);
  }, [open]);

  // Global mouse tracking
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  // Compute anchor bounding rect on layout / open
  useEffect(() => {
    if (avatarRef.current) {
      const r = avatarRef.current.getBoundingClientRect();
      setAnchorPos({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    }
  }, [open]);

  // Scroll to bottom when messages list grows
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (textStr: string) => {
    if (!textStr.trim()) return;

    const userMsg: Msg = {
      id: generateId(),
      role: "user",
      text: textStr.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setMood("thinking");

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("reloop_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({ message: textStr.trim() }),
      });

      const data = await res.json();
      setMood("talking");

      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "bot",
          text: data.reply || "Sorry, I couldn't process that. Please try again.",
        },
      ]);

      setTimeout(() => setMood("idle"), 3000);
    } catch (error) {
      setMood("idle");
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "bot",
          text: "Oops! I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans selection:bg-emerald-500/30 selection:text-emerald-200 text-zinc-300">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-[360px] max-w-[calc(100vw-2rem)] h-[480px] max-h-[calc(100vh-8rem)] bg-[#051410] border border-emerald-950/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 backdrop-blur-md"
          >
            {/* Panel Header */}
            <div className="p-4 bg-gradient-to-r from-[#030e0b] to-[#061813] border-b border-emerald-950/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-emerald-950/40 border border-emerald-800/20 rounded-lg">
                  <RobotFace
                    mood={mood}
                    size={34}
                    mouseX={mousePos.x}
                    mouseY={mousePos.y}
                    anchor={anchorPos}
                  />
                </div>
                <div>
                  <div className="text-sm font-semibold text-emerald-400 tracking-wide flex items-center gap-1.5">
                    Loopy Assistant
                    {mood === "thinking" && (
                      <span className="flex gap-0.5 items-center ml-1">
                        <span className="w-1 h-1 bg-amber-500 rounded-full animate-bounce" />
                        <span className="w-1 h-1 bg-amber-500 rounded-full animate-bounce [animation-delay:0.15s]" />
                        <span className="w-1 h-1 bg-amber-500 rounded-full animate-bounce [animation-delay:0.3s]" />
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-emerald-600/80 tracking-normal font-medium">
                    {mood === "thinking"
                      ? "Querying core memory..."
                      : mood === "talking"
                      ? "Synthesizing audio/text..."
                      : "Online • Ready to loop"}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 hover:bg-emerald-950/40 border border-transparent hover:border-emerald-900/30 rounded-lg text-emerald-700 hover:text-emerald-400 transition-all duration-200"
              >
                <X size={16} />
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-emerald-950">
              {messages.map((m) => (
                <div key={m.id} className="space-y-2.5">
                  <div
                    className={`flex gap-3 max-w-[85%] ${
                      m.role === "user" ? "ml-auto flex-row-reverse" : ""
                    }`}
                  >
                    {m.role === "bot" && (
                      <div className="mt-0.5 shrink-0 p-1 bg-emerald-950/30 border border-emerald-900/20 rounded-md h-fit">
                        <Bot size={14} className="text-emerald-500" />
                      </div>
                    )}
                    <div
                      className={`text-[13px] leading-relaxed rounded-xl px-3.5 py-2.5 shadow-sm whitespace-pre-wrap selection:bg-emerald-500/20 ${
                        m.role === "user"
                          ? "bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-medium rounded-tr-none"
                          : "bg-emerald-950/20 border border-emerald-950/60 text-zinc-200 rounded-tl-none font-normal"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>

                  {/* Contextual Chips inside feed */}
                  {m.chips && m.chips.length > 0 && (
                    <div className="pl-8 flex flex-wrap gap-1.5">
                      {m.chips.map((chip) => (
                        <button
                          key={chip}
                          onClick={() => handleSend(chip)}
                          className="text-[11px] font-medium bg-[#041612] hover:bg-emerald-950/50 text-emerald-400 border border-emerald-950 hover:border-emerald-800/40 rounded-md px-2.5 py-1 transition-all duration-200 shadow-sm"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div ref={scrollRef} />
            </div>

            {/* Input Footer Area */}
            <div className="p-3 bg-[#030d0a] border-t border-emerald-950/40 space-y-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }}
                className="flex items-center gap-2 bg-[#061914] border border-emerald-950/80 rounded-xl px-3 py-1 focus-within:border-emerald-800/60 transition-all duration-200"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about AI grading, smart routing, kirana lockers..."
                  className="flex-1 bg-transparent border-none text-[13px] placeholder-emerald-800/60 text-emerald-200 focus:outline-none focus:ring-0 py-1.5"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-1.5 bg-emerald-600/10 hover:bg-emerald-600 border border-emerald-500/10 hover:border-emerald-400/20 rounded-lg text-emerald-500 hover:text-white transition-all duration-200 disabled:opacity-20 disabled:bg-transparent disabled:text-emerald-800"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher Button + Cycler Teasers */}
      <div className="flex items-center gap-3">
        <AnimatePresence mode="wait">
          {!open && showTeaser && (
            <motion.button
              key={teaserIdx}
              initial={{ opacity: 0, x: 15, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -10, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              onClick={() => {
                setOpen(true);
                handleSend(TEASERS[teaserIdx]);
              }}
              className="bg-[#051511] hover:bg-[#08221b] border border-emerald-950/80 rounded-xl px-3.5 py-2 text-[12px] font-medium text-emerald-400 shadow-xl flex items-center gap-2 transition-all duration-200 group backdrop-blur-sm"
            >
              <Sparkles size={12} className="text-amber-500 group-hover:animate-pulse" />
              {TEASERS[teaserIdx]}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Trigger Badge */}
        <button
          ref={avatarRef}
          onClick={() => setOpen(!open)}
          className={`p-2.5 rounded-2xl shadow-2xl transition-all duration-300 relative border flex items-center justify-center group ${
            open
              ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
              : "bg-gradient-to-b from-[#0e2c23] to-[#04120e] border-emerald-900/40 text-emerald-400 hover:border-emerald-700/60 hover:scale-105"
          }`}
        >
          {open ? (
            <X size={26} />
          ) : (
            <div className="relative">
              <RobotFace
                mood={mood}
                size={38}
                mouseX={mousePos.x}
                mouseY={mousePos.y}
                anchor={anchorPos}
              />
              {/* Spinning green background loop decorator */}
              <div className="absolute -inset-1 border border-dashed border-emerald-500/10 group-hover:border-emerald-500/30 rounded-2xl animate-[spin_20s_linear_infinite] pointer-events-none flex items-center justify-center">
                <Recycle
                  size={10}
                  className="text-emerald-500/40 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#04120e] p-0.5 rounded-full"
                />
              </div>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#04120e] rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#04120e] rounded-full" />
            </div>
          )}
        </button>
      </div>
    </div>
  );
}