import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Navbar from '../components/navbar';
import Home from '../pages/home';
import Workouts from '../pages/workouts';
import Diet from '../pages/diet';
import Chatbot from '../pages/chatbot';
import Charts from '../pages/charts';
import Profile from '../pages/profile';
import AuthService from '../services/auth';
import { BasePageProps, User } from '../types/user';


export default function Index() {
  const [activeTab, setActiveTab] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const loggedIn = await AuthService.isLoggedIn();
      if (loggedIn) {
        const storedUserData = await AuthService.getUserData();
        setIsLoggedIn(true);
        setUserData(storedUserData);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const handleLogin = (userData: User) => {
    setIsLoggedIn(true);
    setUserData(userData);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserData(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home 
          onNavigate={setActiveTab}
          isLoggedIn={isLoggedIn}
          userData={userData}
        />;
      case 'workouts':
        return <Workouts isLoggedIn={isLoggedIn} userData={userData} />;
      case 'diet':
        return <Diet isLoggedIn={isLoggedIn} userData={userData} />;
      case 'chatbot':
        return <Chatbot isLoggedIn={isLoggedIn} userData={userData} />;
      case 'charts':
        return <Charts isLoggedIn={isLoggedIn} userData={userData}/>;
      case 'profile':
        return <Profile 
          isLoggedIn={isLoggedIn}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />;
      default:
        return <Home 
          onNavigate={setActiveTab}
          isLoggedIn={isLoggedIn}
          userData={userData}
        />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {renderContent()}
      </View>
      
      <Navbar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
});
