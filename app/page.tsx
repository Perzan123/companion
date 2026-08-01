import { ChatWindow } from "@/components/chat/ChatWindow";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-12">
      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-text-muted">
          Welcome back
        </p>
        <h1 className="mt-2 font-display text-3xl italic text-text-primary">
          I&apos;m here.
        </h1>
      </div>
      <ChatWindow />
    </main>
  );
}
