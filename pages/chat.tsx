import ChatBox from '../components/ChatBox';
import AuthGuard from '../components/AuthGuard';

export default function ChatPage() {
  return (
    <AuthGuard>
      <div className="container mx-auto h-[80vh] p-4 md:p-8 flex flex-col">
        <h1 className="text-3xl font-bold text-center text-gray-100 mb-4">Global Chat</h1>
        <div className="flex-1 overflow-hidden bg-gray-800 rounded-lg shadow-md">
          <ChatBox />
        </div>
      </div>
    </AuthGuard>
  );
}