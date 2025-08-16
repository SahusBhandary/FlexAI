import { Text, View, StyleSheet } from "react-native";
import Navbar from "@/components/navbar";
import Home from "@/pages/home";
import { useState } from "react";
import Charts from "@/pages/charts";
import Chatbot from "@/pages/chatbot";
import Diet from "@/pages/diet";
import Profile from "@/pages/profile";
import Workouts from "@/pages/workouts";

export default function Index() {
  const [activeTab, setActiveTab] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home 
          onNavigate={setActiveTab}
          isLoggedIn={isLoggedIn}
        />;
      case 'workouts':
        return <Workouts />;
      case 'diet':
        return <Diet />;
      case 'chatbot':
        return <Chatbot />;
      case 'charts':
        return <Charts />;
      case 'profile':
        return <Profile 
          isLoggedIn={isLoggedIn}
          onLogin={() => setIsLoggedIn(true)}
        />;
      default:
        return <Home 
          onNavigate={setActiveTab}
          isLoggedIn={isLoggedIn}
        />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Main content area */}
      <View style={styles.content}>
        {renderContent()}
      </View>
      
      {/* Bottom navbar */}
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
