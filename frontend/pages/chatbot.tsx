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
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const Chatbot = () => {
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

  // Predefined responses for different topics
  const getAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Workout-related responses
    if (message.includes('workout') || message.includes('exercise') || message.includes('training')) {
      if (message.includes('beginner')) {
        return "For beginners, I recommend starting with 3 days per week:\n\n• Day 1: Full body (bodyweight squats, push-ups, planks)\n• Day 2: Rest or light cardio\n• Day 3: Upper body focus\n• Day 4: Rest\n• Day 5: Lower body focus\n\nStart with 2-3 sets of 8-12 reps. Focus on proper form over heavy weights!";
      }
      if (message.includes('muscle') || message.includes('strength')) {
        return "For muscle building:\n\n• Train each muscle group 2-3x per week\n• Use progressive overload (gradually increase weight/reps)\n• Focus on compound movements (squats, deadlifts, bench press)\n• Rest 48-72 hours between training same muscle groups\n• Aim for 6-12 reps for strength, 8-15 for hypertrophy";
      }
      if (message.includes('cardio') || message.includes('fat loss')) {
        return "For fat loss, combine:\n\n• 3-4 strength training sessions\n• 2-3 cardio sessions (HIIT is very effective)\n• NEAT activities (walking, taking stairs)\n• Consistent sleep (7-9 hours)\n\nRemember: Fat loss is 70% diet, 30% exercise!";
      }
      return "I'd be happy to help with your workout! Could you be more specific about your goals? Are you looking to:\n\n• Build muscle\n• Lose fat\n• Improve endurance\n• Get stronger\n• Start as a beginner\n\nThis will help me give you more targeted advice!";
    }
    
    // Diet and nutrition responses
    if (message.includes('diet') || message.includes('nutrition') || message.includes('food') || message.includes('eat')) {
      if (message.includes('protein')) {
        return "Protein recommendations:\n\n• General: 0.8-1g per kg body weight\n• Active individuals: 1.2-1.6g per kg\n• Muscle building: 1.6-2.2g per kg\n\nGreat sources: lean meats, fish, eggs, dairy, legumes, quinoa. Spread intake throughout the day for optimal absorption!";
      }
      if (message.includes('weight loss') || message.includes('lose weight')) {
        return "For sustainable weight loss:\n\n• Create a moderate calorie deficit (300-500 calories/day)\n• Focus on whole foods: vegetables, lean proteins, whole grains\n• Stay hydrated (aim for 8-10 glasses water/day)\n• Don't skip meals - eat regularly\n• Allow 1-2 lbs loss per week maximum\n\nCrash diets don't work long-term!";
      }
      if (message.includes('meal plan') || message.includes('what to eat')) {
        return "Balanced meal template:\n\n🍽️ Each meal should include:\n• 1 palm-sized protein source\n• 1-2 cupped handfuls of vegetables\n• 1 cupped handful of carbs\n• 1 thumb-sized portion of healthy fats\n\nAdjust portions based on your goals and hunger levels!";
      }
      return "I'm here to help with nutrition! Are you interested in:\n\n• Weight loss strategies\n• Muscle building nutrition\n• Meal planning\n• Specific nutrient information\n• Healthy recipe ideas\n\nLet me know what you'd like to learn about!";
    }
    
    // Supplement responses
    if (message.includes('supplement') || message.includes('protein powder') || message.includes('creatine')) {
      return "Basic supplement recommendations:\n\n✅ Evidence-based:\n• Protein powder (if not meeting needs through food)\n• Creatine monohydrate (3-5g daily)\n• Vitamin D (if deficient)\n• Omega-3 (if low fish intake)\n\n❌ Usually unnecessary:\n• Fat burners\n• BCAAs (if eating enough protein)\n• Most pre-workouts\n\nFocus on whole foods first!";
    }
    
    // Recovery and sleep
    if (message.includes('recovery') || message.includes('sleep') || message.includes('rest')) {
      return "Recovery is crucial for progress:\n\n💤 Sleep (7-9 hours):\n• Go to bed/wake up at consistent times\n• Cool, dark room\n• No screens 1 hour before bed\n\n🔄 Active recovery:\n• Light walking\n• Gentle stretching\n• Yoga\n\n🛁 Other recovery methods:\n• Adequate hydration\n• Stress management\n• Proper nutrition timing";
    }
    
    // Motivation and mindset
    if (message.includes('motivation') || message.includes('consistency') || message.includes('habit')) {
      return "Building lasting habits:\n\n🎯 Start small:\n• 10-15 minute workouts initially\n• Add one healthy meal per day\n• Focus on consistency over perfection\n\n📅 Systems over goals:\n• Schedule workouts like appointments\n• Prep meals in advance\n• Track progress (photos, measurements, how you feel)\n\n💪 Remember: Progress isn't always linear. Trust the process!";
    }
    
    // Injury prevention
    if (message.includes('injury') || message.includes('pain') || message.includes('hurt')) {
      return "⚠️ Important: For acute pain or injuries, consult a healthcare professional.\n\nInjury prevention tips:\n• Always warm up before workouts\n• Focus on proper form over heavy weights\n• Progress gradually (10% rule)\n• Include mobility work\n• Listen to your body\n• Get adequate rest\n\nIf something hurts, don't push through it!";
    }
    
    // General fitness questions
    if (message.includes('how often') || message.includes('frequency')) {
      return "General frequency guidelines:\n\n🏋️ Strength training: 2-4x per week\n🏃 Cardio: 3-5x per week\n🧘 Flexibility/mobility: Daily\n😴 Rest days: At least 1-2 per week\n\nAdjust based on your fitness level, goals, and recovery capacity. Quality over quantity!";
    }
    
    // Default responses
    const defaultResponses = [
      "That's a great question! Could you provide a bit more detail so I can give you the most helpful advice?",
      "I'm here to help with all things fitness and nutrition. Could you be more specific about what you'd like to know?",
      "Let me help you with that! Could you tell me more about your specific situation or goals?",
      "I'd love to assist you! Can you provide more context about what you're looking for guidance on?",
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
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
    setInputText('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(inputText.trim()),
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  };

  // Quick action buttons
  const quickActions = [
    { text: "Beginner workout plan", icon: "💪" },
    { text: "Healthy meal ideas", icon: "🥗" },
    { text: "Weight loss tips", icon: "⚖️" },
    { text: "Protein requirements", icon: "🥚" },
    { text: "Motivation advice", icon: "🔥" },
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
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>AI Fitness Coach</Text>
        <Text style={styles.headerSubtitle}>Your personal diet & workout expert</Text>
      </LinearGradient>

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
            onPress={() => setInputText(action.text)}
          >
            <Text style={styles.quickActionIcon}>{action.icon}</Text>
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
              <Text style={styles.typingText}>AI is typing...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask me about workouts, nutrition, or fitness..."
          multiline
          maxLength={500}
          onSubmitEditing={sendMessage}
          blurOnSubmit={false}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  quickActionsContainer: {
    maxHeight: 80,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  quickActionsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  quickAction: {
    backgroundColor: '#F0F8FF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 120,
  },
  quickActionIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  quickActionText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 100,
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
    backgroundColor: '#667eea',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: 'white',
  },
  aiMessageText: {
    color: '#2C3E50',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  userMessageTime: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'right',
  },
  aiMessageTime: {
    color: '#95A5A6',
  },
  typingText: {
    fontSize: 16,
    color: '#95A5A6',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingBottom: 100, // Account for navbar
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    backgroundColor: '#667eea',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sendButtonDisabled: {
    backgroundColor: '#BDC3C7',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default Chatbot;