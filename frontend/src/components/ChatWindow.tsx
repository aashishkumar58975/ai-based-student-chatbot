import { useEffect, useRef, useState } from "react";
import type { Message } from "../types";

const EXAMPLES = [
  "What is Object-Oriented Programming?",
  "Explain DBMS in simple words.",
  "What is a React component?",
  "Explain the OSI model.",
];

interface Props {
  messages: Message[];
  loading: boolean;
  onSend: (text: string) => void;
}

function MessageBubble({ message }: { message: Message }) {
  const cls = message.role === "user" ? "user" : message.isError ? "ai error" : "ai";
  return (
    <div className={`bubble-row ${message.role}`}>
      <div className={`bubble ${cls}`}>{message.content}</div>
    </div>
  );
}

export default function ChatWindow({ messages, loading, onSend }: Props) {
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const submit = () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    onSend(text);
  };

  return (
    <>
      <div className="messages">
        {messages.length === 0 ? (
          <div className="welcome">
            <h2>Welcome to STUDS-HELP AI</h2>
            <p>Ask questions, understand concepts, and learn better.</p>
            <div className="examples">
              {EXAMPLES.map((q) => (
                <button key={q} onClick={() => setInput(q)}>{q}</button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => <MessageBubble key={i} message={m} />)
        )}
        {loading && <div className="thinking">Thinking...</div>}
        <div ref={endRef} />
      </div>
      <div className="input-bar">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Ask your academic question..."
        />
        <button onClick={submit} disabled={loading || !input.trim()}>Send</button>
      </div>
    </>
  );
}
