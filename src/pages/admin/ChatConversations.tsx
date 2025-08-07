import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, User, Bot, Calendar, Eye, Trash2 } from 'lucide-react';
import { supabase, ChatConversation } from '../../lib/supabase';

export default function ChatConversations() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
    setupRealtimeUpdates();
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
      setError(err.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeUpdates = () => {
    const channel = supabase
      .channel('chat_conversations_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_conversations'
      }, () => fetchConversations())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const deleteConversation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return;
    
    try {
      const { error } = await supabase
        .from('chat_conversations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchConversations();
      setSelectedConversation(null);
    } catch (err) {
      console.error('Error deleting conversation:', err);
      setError(err.message || 'Failed to delete conversation');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'abandoned': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Error: {error}</p>
        <button 
          onClick={fetchConversations}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Chat Conversations</h1>
          <p className="text-gray-600 mt-1">View all AI assistant conversations with customers</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                Conversations ({conversations.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No conversations found</p>
                  <p className="text-sm">Conversations will appear here when customers chat with the AI assistant</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation?.id === conv.id ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''
                    }`}
                    onClick={() => setSelectedConversation(conv)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            Session: {conv.session_id.slice(-8)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {conv.messages?.length || 0} messages
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(conv.status || 'active')}`}>
                        {(conv.status || 'active').toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      <p>Created: {new Date(conv.created_at).toLocaleDateString()}</p>
                      <p>Updated: {new Date(conv.updated_at).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Conversation Details */}
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Conversation Details
                  </h2>
                  <p className="text-sm text-gray-600">
                    Session ID: {selectedConversation.session_id}
                  </p>
                </div>
                <button
                  onClick={() => deleteConversation(selectedConversation.id)}
                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                  title="Delete conversation"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4">
                {/* Conversation Info */}
                <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Created: {new Date(selectedConversation.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Updated: {new Date(selectedConversation.updated_at).toLocaleString()}</span>
                  </div>
                  {selectedConversation.booking_id && (
                    <div className="col-span-2 flex items-center space-x-2">
                      <span className="font-medium">Booking ID:</span>
                      <span className="text-blue-600">{selectedConversation.booking_id}</span>
                    </div>
                  )}
                </div>

                {/* Messages */}
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  <h3 className="font-semibold text-gray-900 mb-4">Messages:</h3>
                  {selectedConversation.messages?.length ? (
                    <div className="space-y-4">
                      {selectedConversation.messages.map((msg, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                            msg.role === 'user'
                              ? 'bg-yellow-100 text-gray-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            <div className="flex items-center space-x-2 mb-2">
                              {msg.role === 'user' ? (
                                <User className="w-4 h-4 text-yellow-600" />
                              ) : (
                                <Bot className="w-4 h-4 text-gray-600" />
                              )}
                              <span className="text-xs font-medium capitalize">
                                {msg.role === 'user' ? 'Customer' : 'AI Assistant'}
                              </span>
                              {msg.timestamp && (
                                <span className="text-xs text-gray-500">
                                  {new Date(msg.timestamp).toLocaleTimeString()}
                                </span>
                              )}
                            </div>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">
                              {msg.content}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No messages in this conversation</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
              <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Conversation</h3>
              <p>Click on a conversation from the list to view the complete chat history between the customer and AI assistant.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}