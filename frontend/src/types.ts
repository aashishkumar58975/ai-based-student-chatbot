export interface Message {
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}
