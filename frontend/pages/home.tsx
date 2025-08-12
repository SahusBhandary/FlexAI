import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const Home = () => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Good Morning</Text>
        <Text style={styles.username}>Sarah! 💪</Text>
        <Text style={styles.subtitle}>Ready to crush your fitness goals today?</Text>
      </View>

      {/* AI Insight Card */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.aiCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.aiCardContent}>
          <Text style={styles.aiCardIcon}>🤖</Text>
          <View style={styles.aiCardText}>
            <Text style={styles.aiCardTitle}>AI Insight</Text>
            <Text style={styles.aiCardSubtitle}>
              Based on your progress, consider adding 15 mins of cardio to boost fat burning!
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Today's Overview</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>2,450</Text>
            <Text style={styles.statLabel}>Calories Burned</Text>
            <Text style={styles.statIcon}>🔥</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>8,247</Text>
            <Text style={styles.statLabel}>Steps</Text>
            <Text style={styles.statIcon}>👣</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#FF6B6B' }]}>
            <Text style={styles.actionIcon}>💪</Text>
            <Text style={styles.actionTitle}>Start Workout</Text>
            <Text style={styles.actionSubtitle}>AI-powered routine</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#4ECDC4' }]}>
            <Text style={styles.actionIcon}>🥗</Text>
            <Text style={styles.actionTitle}>Log Meal</Text>
            <Text style={styles.actionSubtitle}>Track nutrition</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#45B7D1' }]}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionTitle}>Ask AI</Text>
            <Text style={styles.actionSubtitle}>Get fitness advice</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#F7DC6F' }]}>
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionTitle}>View Progress</Text>
            <Text style={styles.actionSubtitle}>Check analytics</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.activityContainer}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityTitle}>Morning Cardio</Text>
            <Text style={styles.activityTime}>2 hours ago</Text>
          </View>
          <Text style={styles.activityDetails}>30 min • 245 calories • Zone 2</Text>
        </View>
        
        <View style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityTitle}>Protein Smoothie</Text>
            <Text style={styles.activityTime}>4 hours ago</Text>
          </View>
          <Text style={styles.activityDetails}>320 calories • 25g protein • Post-workout</Text>
        </View>
      </View>

      {/* Achievement Badge */}
      <View style={styles.achievementContainer}>
        <LinearGradient
          colors={['#FFD700', '#FFA500']}
          style={styles.achievementBadge}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.achievementIcon}>🏆</Text>
          <Text style={styles.achievementText}>7-day streak!</Text>
          <Text style={styles.achievementSubtext}>Keep it going!</Text>
        </LinearGradient>
      </View>

      {/* Bottom spacing for navbar */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 8,
  },
  aiCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
  },
  aiCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiCardIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  aiCardText: {
    flex: 1,
  },
  aiCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  aiCardSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: (width - 60) / 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  statLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
    textAlign: 'center',
  },
  statIcon: {
    fontSize: 20,
    marginTop: 8,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - 60) / 2,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
  activityContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  activityTime: {
    fontSize: 12,
    color: '#95A5A6',
  },
  activityDetails: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  achievementContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  achievementBadge: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  achievementSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default Home;