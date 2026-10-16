import { useState } from "react";
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
  onClose: () => void;
}

export default function Sidebar({ chats, activeId, view, open, onNew, onSelect, onDelete, onAbout, onClose }: Props) {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  return (
    <aside className={`sidebar ${open ? "open" : ""}`} aria-label="Conversations">
      <div className="sidebar-head">
        <span className="sidebar-title">Menu</span>
        <button type="button" className="icon-btn drawer-close" onClick={onClose} aria-label="Close menu">×</button>
      </div>
      <button type="button" className="new-chat" onClick={onNew}>
        <span aria-hidden="true">+</span> New chat
      </button>
      <div className="history-title">History</div>
      <nav className="history" aria-label="Chat history">
        {chats.length === 0 && <p className="muted">No chats yet.</p>}
        {chats.map((c) => {
          const active = view === "chat" && c.id === activeId;
          const confirming = confirmId === c.id;
          return (
            <div key={c.id} className={`history-item ${active ? "active" : ""}`}>
              {confirming ? (
                <div className="confirm" role="group" aria-label={`Delete ${c.title}?`}>
                  <span>Delete chat?</span>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => {
                      setConfirmId(null);
                      onDelete(c.id);
                    }}
                  >
                    Delete
                  </button>
                  <button type="button" onClick={() => setConfirmId(null)}>Cancel</button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    className="history-btn"
                    onClick={() => onSelect(c.id)}
                    title={c.title}
                    aria-current={active ? "page" : undefined}
                  >
                    {c.title}
                  </button>
                  <button
                    type="button"
                    className="delete"
                    onClick={() => setConfirmId(c.id)}
                    aria-label={`Delete chat: ${c.title}`}
                  >
                    ×
                  </button>
                </>
              )}
            </div>
          );
        })}
      </nav>
      <button type="button" className={`about-btn ${view === "about" ? "active" : ""}`} onClick={onAbout}>
        About Me
      </button>
    </aside>
  );
}
