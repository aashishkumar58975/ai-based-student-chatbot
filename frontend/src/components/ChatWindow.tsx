import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Message } from "../types";
import Markdown from "./Markdown";

const EXAMPLES = [
  "What is Object-Oriented Programming?",
  "Explain DBMS in simple words.",
  "What is a React component?",
  "Explain the OSI model.",
];

const MAX_LEN = 4000; // matches the backend's message max_length

interface Props {
  messages: Message[];
  loading: boolean;
  onSend: (text: string) => void;
}

function MessageItem({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <div className="msg msg-user">
        <div className="msg-body">{message.content}</div>
      </div>
    );
  }
  if (message.isError) {
    return (
      <div className="msg msg-ai">
        <div className="msg-label">STUDS-HELP AI</div>
        <div className="msg-error" role="alert">
          <span aria-hidden="true">!</span>
          <p>{message.content}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="msg msg-ai">
      <div className="msg-label">STUDS-HELP AI</div>
      <Markdown text={message.content} />
    </div>
  );
}

export default function ChatWindow({ messages, loading, onSend }: Props) {
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    endRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "end" });
  }, [messages, loading]);

  // Auto-grow the textarea up to a cap.
  useLayoutEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [input]);

  const submit = () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    onSend(text);
  };

  const canSend = !loading && input.trim().length > 0;

  return (
    <>
      <div className="messages" role="log" aria-live="polite" aria-label="Conversation">
        <div className="messages-inner">
          {messages.length === 0 ? (
            <div className="welcome">
              <p className="eyebrow">Academic assistant</p>
              <h2>Ask anything. Understand it properly.</h2>
              <p className="welcome-sub">Questions, concepts and explanations, in plain words.</p>
              <div className="examples" role="group" aria-label="Example questions">
                {EXAMPLES.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      setInput(q);
                      areaRef.current?.focus();
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => <MessageItem key={i} message={m} />)
          )}
          {loading && (
            <div className="msg msg-ai thinking" role="status">
              <div className="msg-label">STUDS-HELP AI</div>
              <span className="dots" aria-hidden="true"><i /><i /><i /></span>
              <span className="sr-only">Thinking…</span>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      <div className="composer-wrap">
        <div className="composer">
          <label htmlFor="chat-input" className="sr-only">Your question</label>
          <textarea
            id="chat-input"
            ref={areaRef}
            rows={1}
            value={input}
            maxLength={MAX_LEN}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Ask your academic question..."
          />
          <button type="button" className="send" onClick={submit} disabled={!canSend} aria-label="Send message">
            Send
          </button>
        </div>
        <p className="composer-hint">
          <span>Enter to send · Shift+Enter for a new line</span>
          {input.length > MAX_LEN - 500 && (
            <span className="count" aria-live="polite">{input.length}/{MAX_LEN}</span>
          )}
        </p>
      </div>
    </>
  );
}
