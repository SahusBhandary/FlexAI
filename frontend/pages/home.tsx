import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { apiService } from '../services/api';

// Define the types directly in this file
interface UserProfile {
  height_feet: number;
  height_inches: number;
  weight: number;
  activity_level: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  profile?: UserProfile;
}

interface HomeProps {
  onNavigate?: (page: string) => void;
  isLoggedIn: boolean;        
  userData: User | null;     
}

const Home: React.FC<HomeProps> = ({ onNavigate, isLoggedIn, userData }) => {
  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    if (hour < 21) return 'Good Evening';
    return 'Good Night';
  };

  // Temporary data - will be replaced with API calls later
  const tempData = {
    currentWeight: userData?.profile?.weight || 150,
    caloriesIntaken: 1250,
    caloriesGoal: 2200,
    todaysWorkout: {
      name: "Upper Body Strength",
      duration: "45 min",
      exercises: 8,
      completed: false
    },
    aiTip: "Remember to stay hydrated! Aim for at least 8 glasses of water today, especially before and after your workout."
  };

  
  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <View style={styles.loginContainer}>
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome to FlexAI</Text>
            <Text style={styles.welcomeSubtitle}>
              Your personal AI-powered fitness and nutrition companion
            </Text>
          </View>

          {/* Features List */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>💪</Text>
              <Text style={styles.featureText}>Track your workouts</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🥗</Text>
              <Text style={styles.featureText}>Log your daily nutrition</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🤖</Text>
              <Text style={styles.featureText}>Get AI fitness coaching</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📊</Text>
              <Text style={styles.featureText}>Monitor your progress</Text>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => onNavigate?.('profile')}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.loginGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.loginButtonText}>Get Started</Text>
              <Text style={styles.loginButtonSubtext}>Set up your profile</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Bottom Text */}
          <Text style={styles.bottomText}>
            Start your fitness journey today!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home</Text>
        <Text style={styles.headerSubtitle}>Your fitness dashboard</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Greeting Section */}
        <View style={styles.greetingCard}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.username}>
            {userData?.name || 'User'}! 💪
          </Text>
          <Text style={styles.subtitle}>Ready to crush your fitness goals today?</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {/* Weight Card */}
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <MaterialIcons name="monitor-weight" size={24} color="#4CAF50" />
              <Text style={styles.statLabel}>Current Weight</Text>
            </View>
            <Text style={styles.statValue}>{userData?.profile?.weight}</Text>
            <Text style={styles.statUnit}>lbs</Text>
          </View>

          {/* Calories Card */}
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <MaterialIcons name="local-fire-department" size={24} color="#FF5722" />
              <Text style={styles.statLabel}>Calories</Text>
            </View>
            <Text style={styles.statValue}>{tempData.caloriesIntaken.toLocaleString()}</Text>
            <Text style={styles.statUnit}>of {tempData.caloriesGoal.toLocaleString()}</Text>
          </View>
        </View>

        {/* Today's Workout Card */}
        <View style={styles.workoutCard}>
          <View style={styles.workoutHeader}>
            <MaterialIcons name="fitness-center" size={24} color="#2196F3" />
            <Text style={styles.workoutTitle}>Today's Workout</Text>
            <View style={[styles.statusBadge, tempData.todaysWorkout.completed ? styles.completedBadge : styles.pendingBadge]}>
              <Text style={styles.statusText}>
                {tempData.todaysWorkout.completed ? 'Completed' : 'Pending'}
              </Text>
            </View>
          </View>
          
          <View style={styles.workoutContent}>
            <Text style={styles.workoutName}>{tempData.todaysWorkout.name}</Text>
            <View style={styles.workoutDetails}>
              <View style={styles.workoutDetail}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={styles.workoutDetailText}>{tempData.todaysWorkout.duration}</Text>
              </View>
              <View style={styles.workoutDetail}>
                <MaterialIcons name="fitness-center" size={16} color="#666" />
                <Text style={styles.workoutDetailText}>{tempData.todaysWorkout.exercises} exercises</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.workoutButton}
            onPress={() => onNavigate?.('workouts')}
          >
            <Text style={styles.workoutButtonText}>
              {tempData.todaysWorkout.completed ? 'View Workout' : 'Start Workout'}
            </Text>
            <MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* AI Tip Card */}
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <MaterialIcons name="lightbulb" size={24} color="#FFC107" />
            <Text style={styles.tipTitle}>AI Tip of the Day</Text>
          </View>
          <Text style={styles.tipText}>{tempData.aiTip}</Text>
          <TouchableOpacity 
            style={styles.tipButton}
            onPress={() => onNavigate?.('chatbot')}
          >
            <Text style={styles.tipButtonText}>Ask AI Coach</Text>
            <MaterialIcons name="chat" size={16} color="#000000" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onNavigate?.('workouts')}
            >
              <MaterialIcons name="fitness-center" size={28} color="#2196F3" />
              <Text style={styles.actionText}>Workouts</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onNavigate?.('diet')}
            >
              <MaterialIcons name="restaurant" size={28} color="#4CAF50" />
              <Text style={styles.actionText}>Nutrition</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onNavigate?.('chatbot')}
            >
              <MaterialIcons name="smart-toy" size={28} color="#FF5722" />
              <Text style={styles.actionText}>AI Coach</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onNavigate?.('charts')}
            >
              <MaterialIcons name="analytics" size={28} color="#9C27B0" />
              <Text style={styles.actionText}>Progress</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// Test Change

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  greetingCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flex: 0.48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
  },
  statUnit: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  workoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
    marginLeft: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadge: {
    backgroundColor: '#E8F5E8',
  },
  pendingBadge: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  workoutContent: {
    marginBottom: 16,
  },
  workoutName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  workoutDetails: {
    flexDirection: 'row',
  },
  workoutDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  workoutDetailText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
  },
  workoutButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  tipCard: {
    backgroundColor: '#FFFBF0',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginLeft: 12,
  },
  tipText: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
    marginBottom: 16,
  },
  tipButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignSelf: 'flex-start',
  },
  tipButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
  quickActions: {
    marginBottom: 30,
  },
  quickActionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginTop: 8,
  },

  // Login screen styles (unchanged)
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
    maxWidth: 280,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  loginButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    width: '100%',
    maxWidth: 280,
  },
  loginGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  loginButtonSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  bottomText: {
    fontSize: 14,
    color: '#95A5A6',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default Home;