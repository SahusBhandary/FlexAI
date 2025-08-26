import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { BasePageProps } from '../types/user';
import { apiService } from '../services/api';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const Chatbot: React.FC<BasePageProps> = ({ isLoggedIn, userData }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your AI fitness and nutrition coach. I'm here to help you with workout routines, diet plans, nutrition advice, and answer any fitness-related questions you have. How can I assist you today?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Get AI response from backend API
  const getAIResponse = async (userMessage: string): Promise<string> => {
    try {
      const response = await apiService.chatWithAI(userMessage);
      
      if (response.data.status === 'success') {
        return response.data.response;
      } else {
        return "Sorry, I'm having trouble connecting right now. Please try again.";
      }
    } catch (error: any) {
      console.error('AI chat error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        return "Please log in to continue chatting with the AI coach.";
      } else if (error.response?.status === 429) {
        return "I'm experiencing high demand right now. Please wait a moment and try again.";
      } else if (error.response?.status === 500) {
        return "I'm experiencing some technical difficulties. Please try again later.";
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return "The request is taking longer than expected. Please try again.";
      } else if (error.message.includes('Network Error')) {
        return "Unable to connect to the server. Please check your internet connection.";
      } else {
        return "Sorry, I'm having trouble responding right now. Please check your connection and try again.";
      }
    }
  };

  // Fallback responses for non-logged-in users
  const getFallbackResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('workout') || message.includes('exercise')) {
      return "For personalized workout advice tailored to your height, weight, and fitness level, please log in to your account. I can provide much better recommendations based on your profile!";
    }
    
    if (message.includes('diet') || message.includes('nutrition')) {
      return "I'd love to help with nutrition advice! Please log in so I can tailor my recommendations to your specific body stats and activity level for the most effective results.";
    }

    if (message.includes('protein')) {
      return "For accurate protein requirements based on your weight and activity level, please log in. I can give you personalized recommendations!";
    }
    
    return "Hi there! For the best experience and personalized fitness coaching based on your profile, please log in to your account. I can provide much more helpful and tailored advice when I know your fitness stats!";
  };

  // Send message function
  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputText.trim();
    setInputText('');
    setIsTyping(true);

    try {
      let aiResponseText: string;
      
      if (isLoggedIn) {
        // Use OpenAI API for logged-in users
        aiResponseText = await getAIResponse(messageText);
      } else {
        // Use fallback responses for non-logged-in users
        aiResponseText = getFallbackResponse(messageText);
      }
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error in sendMessage:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble responding right now. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle quick actions
  const handleQuickAction = (actionText: string) => {
    if (!isLoggedIn) {
      setInputText("I'd like to know about: " + actionText);
    } else {
      setInputText(actionText);
    }
  };

  // Quick action buttons
  const quickActions = [
    { text: "Beginner workout plan", icon: "fitness-center" },
    { text: "Healthy meal ideas", icon: "restaurant" },
    { text: "Weight loss tips", icon: "trending-down" },
    { text: "Protein requirements", icon: "egg" },
    { text: "Motivation advice", icon: "psychology" },
  ];

  // Scroll to bottom when new message arrives
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Fitness Coach</Text>
        <Text style={styles.headerSubtitle}>
          {isLoggedIn 
            ? `Your personal diet & workout expert${userData?.name ? ` for ${userData.name}` : ''}`
            : 'Log in for personalized advice'
          }
        </Text>
      </View>

      {/* Login prompt for non-logged-in users */}
      {!isLoggedIn && (
        <View style={styles.loginPrompt}>
          <MaterialIcons name="info" size={16} color="#FF6B35" />
          <Text style={styles.loginPromptText}>
            Log in to get personalized AI coaching based on your fitness profile
          </Text>
        </View>
      )}

      {/* Quick Actions */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.quickActionsContainer}
        contentContainerStyle={styles.quickActionsContent}
      >
        {quickActions.map((action, index) => (
          <TouchableOpacity 
            key={index}
            style={styles.quickAction}
            onPress={() => handleQuickAction(action.text)}
          >
            <MaterialIcons name={action.icon as any} size={16} color="#333" />
            <Text style={styles.quickActionText}>{action.text}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.isUser ? styles.userMessage : styles.aiMessage
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                message.isUser ? styles.userBubble : styles.aiBubble
              ]}
            >
              <Text style={[
                styles.messageText,
                message.isUser ? styles.userMessageText : styles.aiMessageText
              ]}>
                {message.text}
              </Text>
              <Text style={[
                styles.messageTime,
                message.isUser ? styles.userMessageTime : styles.aiMessageTime
              ]}>
                {formatTime(message.timestamp)}
              </Text>
            </View>
          </View>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <View style={[styles.messageContainer, styles.aiMessage]}>
            <View style={[styles.messageBubble, styles.aiBubble]}>
              <Text style={styles.typingText}>
                {isLoggedIn ? 'AI is thinking...' : 'Processing your request...'}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder={isLoggedIn 
              ? "Ask me about workouts, nutrition, or fitness..." 
              : "Ask me anything (log in for personalized advice)..."
            }
            multiline
            maxLength={500}
            returnKeyType="send"
            blurOnSubmit={false}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 4,
  },
  loginPrompt: {
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FFE0B2',
    borderRadius: 8,
    padding: 12,
    margin: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginPromptText: {
    fontSize: 14,
    color: '#E65100',
    marginLeft: 8,
    flex: 1,
  },
  quickActionsContainer: {
    maxHeight: 80,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  quickActionsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  quickAction: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 120,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quickActionText: {
    fontSize: 12,
    color: '#333333',
    fontWeight: '600',
    marginLeft: 6,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: width * 0.8,
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#000000',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  aiMessageText: {
    color: '#000000',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  userMessageTime: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  aiMessageTime: {
    color: '#666666',
  },
  typingText: {
    fontSize: 16,
    color: '#666666',
    fontStyle: 'italic',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 110 : 90,
    paddingHorizontal: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    minHeight: 44,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
    color: '#000000',
    textAlignVertical: 'center',
  },
  sendButton: {
    backgroundColor: '#000000',
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
});

export default Chatbot;