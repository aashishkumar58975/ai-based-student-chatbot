import type { Chat } from "../types";

interface Props {
  chats: Chat[];
  activeId: string | null;
  view: "chat" | "about";
  open: boolean;
  onNew: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onAbout: () => void;
}

export default function Sidebar({ chats, activeId, view, open, onNew, onSelect, onDelete, onAbout }: Props) {
  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="brand">STUDS-HELP AI</div>
      <button className="new-chat" onClick={onNew}>+ New Chat</button>
      <div className="history-title">History</div>
      <div className="history">
        {chats.length === 0 && <p className="muted">No chats yet.</p>}
        {chats.map((c) => (
          <div key={c.id} className={`history-item ${view === "chat" && c.id === activeId ? "active" : ""}`}>
            <button className="history-btn" onClick={() => onSelect(c.id)} title={c.title}>{c.title}</button>
            <button className="delete" onClick={() => onDelete(c.id)} aria-label="Delete chat">×</button>
          </div>
        ))}
      </div>
      <button className={`about-btn ${view === "about" ? "active" : ""}`} onClick={onAbout}>About Me</button>
    </aside>
  );
}
