import ChatUI from "@/components/chat/ChatUI";

export default function TerminalPage() {
  return (
    <main className="flex flex-col flex-1 items-center justify-center p-4 md:p-8 bg-gray-950 relative h-full">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="w-full flex justify-center relative z-10 mt-4">
        <ChatUI />
      </div>
    </main>
  );
}