import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

interface NavBarProps {
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

const Navbar: React.FC<NavBarProps> = ({ activeTab, onTabChange}) => {
    const tabs = [
        {id: "home", label: "Home", IconComponent: Ionicons, iconName: "home-outline" as const, activeIconName: "home" as const},
        {id: "workouts", label: "Workouts", IconComponent: MaterialIcons, iconName: "fitness-center" as const, activeIconName: "fitness-center" as const},
        {id: "diet", label: "Food Log", IconComponent: Ionicons, iconName: "restaurant-outline" as const, activeIconName: "restaurant" as const},
        {id: "chatbot", label: "Ask AI", IconComponent: Ionicons, iconName: "chatbubble-outline" as const, activeIconName: "chatbubble" as const},
        {id: "charts", label: "Charts", IconComponent: Ionicons, iconName: "bar-chart-outline" as const, activeIconName: "bar-chart" as const},
        {id: "profile", label: "Profile", IconComponent: Ionicons, iconName: "person-outline" as const, activeIconName: "person" as const},
    ];

    return (
        <View style={styles.navbar}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const IconComponent = tab.IconComponent;
                
                return (
                    <TouchableOpacity
                        key={tab.id}
                        style={[
                            styles.tabItem,
                            isActive && styles.activeTab
                        ]}
                        onPress={() => onTabChange(tab.id)}
                    >
                        <IconComponent
                            name={isActive ? tab.activeIconName : tab.iconName}
                            size={22}
                            color={isActive ? '#007AFF' : '#8E8E93'}
                        />
                        <Text style={[
                            styles.label,
                            isActive && styles.activeLabel
                        ]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
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
        paddingBottom: 20, 
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