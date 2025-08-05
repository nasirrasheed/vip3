import { useEffect, useState } from 'react';
import { supabase, ChatConversation } from '../lib/supabase';

export default function ChatConversations() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading conversations...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Chat Conversations</h1>
      
      <div className="space-y-4">
        {conversations.length === 0 ? (
          <p className="text-gray-500">No conversations found</p>
        ) : (
          conversations.map((conv) => (
            <div key={conv.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">Session ID: {conv.session_id}</p>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(conv.created_at).toLocaleString()}
                  </p>
                  {conv.booking_id && (
                    <p className="text-sm text-gray-500">
                      Booking ID: {conv.booking_id}
                    </p>
                  )}
                </div>
                {conv.status && (
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    conv.status === 'active' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {conv.status}
                  </span>
                )}
              </div>
              
              <div className="mt-4 space-y-3">
                <h3 className="font-medium">Messages:</h3>
                {conv.messages?.length ? (
                  <div className="space-y-2">
                    {conv.messages.map((msg, idx) => (
                      <div key={idx} className={`p-3 rounded-lg ${
                        msg.role === 'user' ? 'bg-blue-50' : 'bg-gray-50'
                      }`}>
                        <p className="font-medium capitalize">{msg.role}:</p>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No messages in this conversation</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
