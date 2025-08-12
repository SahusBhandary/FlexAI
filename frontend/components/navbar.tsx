import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface NavBarProps {
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

const Navbar: React.FC<NavBarProps> = ({ activeTab, onTabChange}) => {
    const tabs = [
        {id: "home", label: "Home", icon: "🏠"},
        {id: "workouts", label: "Workouts", icon: "💪"},
        {id: "diet", label: "Food Log", icon: "🥗"},
        {id: "chatbot", label: "Ask AI", icon: "🤖"},
        {id: "charts", label: "Charts", icon: "📈"},
        {id: "profile", label: "Profile", icon: "🏋️‍♂️"},
    ];

    return (
        <View style={styles.navbar}>
            {tabs.map((tab) => (
                <TouchableOpacity
                    key={tab.id}
                    style={[
                        styles.tabItem,
                        activeTab === tab.id && styles.activeTab
                    ]}
                    onPress={() => onTabChange(tab.id)}
                >
                    <Text style={styles.icon}>{tab.icon}</Text>
                    <Text style={[
                        styles.label,
                        activeTab === tab.id && styles.activeLabel
                    ]}>
                        {tab.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );


};

const styles = StyleSheet.create({
    navbar: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
        paddingVertical: 8,
        paddingBottom: 20, // Extra padding for safe area
        justifyContent: 'space-around',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 4,
    },
    activeTab: {
        backgroundColor: '#F0F8FF',
        borderRadius: 8,
        marginHorizontal: 2,
    },
    icon: {
        fontSize: 20,
        marginBottom: 2,
    },
    label: {
        fontSize: 10,
        color: '#8E8E93',
        textAlign: 'center',
        fontWeight: '500',
    },
    activeLabel: {
        color: '#007AFF',
        fontWeight: '600',
    },
});

export default Navbar;