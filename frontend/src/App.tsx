import { useEffect, useState } from "react";
import type { Chat, Message } from "./types";
import { sendMessage } from "./services/api";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import AboutMe from "./components/AboutMe";

const STORAGE_KEY = "studs-help-chats";

function loadChats(): Chat[] {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [chats, setChats] = useState<Chat[]>(loadChats);
  const [activeId, setActiveId] = useState<string | null>(null); // null = new, empty chat
  const [view, setView] = useState<"chat" | "about">("chat");
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    } catch {
      /* storage full or unavailable: keep chatting in memory */
    }
  }, [chats]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const active = chats.find((c) => c.id === activeId) || null;
  const messages = active?.messages ?? [];

  const go = (id: string | null, v: "chat" | "about" = "chat") => {
    setActiveId(id);
    setView(v);
    setMenuOpen(false);
  };

  const deleteChat = (id: string) => {
    setChats((cs) => cs.filter((c) => c.id !== id));
    if (id === activeId) setActiveId(null);
  };

  const handleSend = async (text: string) => {
    const userMsg: Message = { role: "user", content: text };
    const history = messages;
    let id = activeId;

    if (!active) {
      id = crypto.randomUUID();
      const chat: Chat = {
        id,
        title: text.length > 40 ? text.slice(0, 40) + "…" : text,
        messages: [userMsg],
        createdAt: new Date().toISOString(),
      };
      setChats((cs) => [chat, ...cs]);
      setActiveId(id);
    } else {
      setChats((cs) => cs.map((c) => (c.id === id ? { ...c, messages: [...c.messages, userMsg] } : c)));
    }

    setLoading(true);
    let reply: Message;
    try {
      reply = { role: "assistant", content: await sendMessage(text, history) };
    } catch (e) {
      reply = { role: "assistant", content: (e as Error).message, isError: true };
    }
    setChats((cs) => cs.map((c) => (c.id === id ? { ...c, messages: [...c.messages, reply] } : c)));
    setLoading(false);
  };

  return (
    <div className="app">
      <header className="nav">
        <div className="nav-inner">
          <button type="button" className="brand" onClick={() => go(null)} aria-label="STUDS-HELP AI, start a new chat">
            STUDS-HELP AI
          </button>
          <nav className="nav-links" aria-label="Primary">
            <button type="button" className={view === "chat" ? "current" : ""} aria-current={view === "chat" ? "page" : undefined} onClick={() => go(activeId)}>Chat</button>
            <button type="button" className={view === "about" ? "current" : ""} aria-current={view === "about" ? "page" : undefined} onClick={() => go(activeId, "about")}>About</button>
            <button type="button" className="pill-btn" onClick={() => go(null)}>New chat</button>
          </nav>
          <button type="button" className="menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen}>
            Menu
          </button>
        </div>
      </header>
      {menuOpen && <div className="backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true" />}
      <div className="workspace">
        <Sidebar
          chats={chats}
          activeId={activeId}
          view={view}
          open={menuOpen}
          onNew={() => go(null)}
          onSelect={(id) => go(id)}
          onDelete={deleteChat}
          onAbout={() => go(activeId, "about")}
          onClose={() => setMenuOpen(false)}
        />
        <main className="main">
          {view === "about" ? (
            <AboutMe />
          ) : (
            <ChatWindow messages={messages} loading={loading} onSend={handleSend} />
          )}
        </main>
      </div>
    </div>
  );
}
