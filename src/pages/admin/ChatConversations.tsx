import { useEffect, useState } from 'react';
import { supabase, ChatConversation } from '../lib/supabase';

export default function ChatConversations() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    const { data, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
    } else {
      setConversations(data);
    }
  };

  return (
    <div>
      <h1>Chat Conversations</h1>
      <ul>
        {conversations.map((conv) => (
          <li key={conv.id}>
            <strong>Session:</strong> {conv.session_id}
            <br />
            <strong>Messages:</strong>
            <ul>
              {conv.messages.map((msg: any, index: number) => (
                <li key={index}>
                  <strong>{msg.role}</strong>: {msg.content}
                </li>
              ))}
            </ul>
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
}
