import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  ScrollView,
  Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface ProfileProps {
    isLoggedIn?: boolean;
    onLogin?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ isLoggedIn = false, onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [name, setName] = useState('');
    const [heightFeet, setHeightFeet] = useState('');
    const [heightInches, setHeightInches] = useState('');
    const [weight, setWeight] = useState('');
    const [activityLevel, setActivityLevel] = useState('');

    const activityOptions = [
        { value: '1-2', label: '1-2 days a week' },
        { value: '3-5', label: '3-5 days a week' },
        { value: '6-7', label: '6-7 days a week' }
    ];

    const handleAuth = () => {
        // Basic validation
        if (!email || !password || (!isLoginMode && (!name || !heightFeet || !heightInches || !weight || !activityLevel))) {
            return;
        }
        
        // Call the login callback
        onLogin?.();
    };

    // Radio button component
    const RadioOption = ({ option, selected, onSelect }: { 
        option: { value: string; label: string }, 
        selected: boolean, 
        onSelect: () => void 
    }) => (
        <TouchableOpacity style={styles.radioOption} onPress={onSelect}>
            <View style={[styles.radioCircle, selected && styles.radioCircleSelected]}>
                {selected && <View style={styles.radioDot} />}
            </View>
            <Text style={[styles.radioLabel, selected && styles.radioLabelSelected]}>
                {option.label}
            </Text>
        </TouchableOpacity>
    );

    if (!isLoggedIn) {
        return (
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>
                        {isLoginMode ? 'Welcome Back!' : 'Join FlexAI'}
                    </Text>
                    <Text style={styles.headerSubtitle}>
                        {isLoginMode 
                            ? 'Sign in to continue your fitness journey' 
                            : 'Create your account to get started'
                        }
                    </Text>
                </View>

                {/* Auth Form */}
                <View style={styles.formContainer}>
                    {!isLoginMode && (
                        <>
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Full Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your full name"
                                    value={name}
                                    onChangeText={setName}
                                    autoCapitalize="words"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Height (Feet)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="5"
                                    value={heightFeet}
                                    onChangeText={setHeightFeet}
                                    keyboardType="numeric"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Height (Inches)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="8"
                                    value={heightInches}
                                    onChangeText={setHeightInches}
                                    keyboardType="numeric"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Weight (lbs)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="150"
                                    value={weight}
                                    onChangeText={setWeight}
                                    keyboardType="numeric"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Activity Level</Text>
                                <View style={styles.radioContainer}>
                                    {activityOptions.map((option) => (
                                        <RadioOption
                                            key={option.value}
                                            option={option}
                                            selected={activityLevel === option.value}
                                            onSelect={() => setActivityLevel(option.value)}
                                        />
                                    ))}
                                </View>
                            </View>
                        </>
                    )}

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    {/* Auth Button */}
                    <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
                        <LinearGradient
                            colors={['#667eea', '#764ba2']}
                            style={styles.authGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={styles.authButtonText}>
                                {isLoginMode ? 'Sign In' : 'Create Account'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Switch Mode */}
                    <View style={styles.switchContainer}>
                        <Text style={styles.switchText}>
                            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                        </Text>
                        <TouchableOpacity onPress={() => setIsLoginMode(!isLoginMode)}>
                            <Text style={styles.switchLink}>
                                {isLoginMode ? 'Sign Up' : 'Sign In'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Features Preview */}
                    {isLoginMode && (
                        <View style={styles.featuresPreview}>
                            <Text style={styles.featuresTitle}>What you'll get:</Text>
                            <View style={styles.featuresList}>
                                <View style={styles.featureItem}>
                                    <Text style={styles.featureIcon}>💪</Text>
                                    <Text style={styles.featureText}>Personalized workout tracking</Text>
                                </View>
                                <View style={styles.featureItem}>
                                    <Text style={styles.featureIcon}>🥗</Text>
                                    <Text style={styles.featureText}>Smart nutrition logging</Text>
                                </View>
                                <View style={styles.featureItem}>
                                    <Text style={styles.featureIcon}>🤖</Text>
                                    <Text style={styles.featureText}>AI-powered fitness coaching</Text>
                                </View>
                                <View style={styles.featureItem}>
                                    <Text style={styles.featureIcon}>📊</Text>
                                    <Text style={styles.featureText}>Detailed progress analytics</Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>
        );
    }

    // Logged in profile view
    return (
        <View style={styles.container}>
            <View style={styles.profileContainer}>
                <Text style={styles.profileTitle}>Profile</Text>
                <Text style={styles.profileSubtitle}>Manage your account and preferences</Text>
                
                {/* Profile content will go here */}
                <View style={styles.profileCard}>
                    <Text style={styles.cardTitle}>Account Settings</Text>
                    <Text style={styles.cardSubtitle}>Update your personal information</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2C3E50',
        textAlign: 'center',
        marginBottom: 12,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#7F8C8D',
        textAlign: 'center',
        lineHeight: 24,
    },
    formContainer: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    // Radio button styles
    radioContainer: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioCircleSelected: {
        borderColor: '#667eea',
    },
    radioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#667eea',
    },
    radioLabel: {
        fontSize: 16,
        color: '#2C3E50',
        flex: 1,
    },
    radioLabelSelected: {
        color: '#667eea',
        fontWeight: '600',
    },
    authButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 20,
        marginBottom: 20,
    },
    authGradient: {
        paddingVertical: 18,
        paddingHorizontal: 32,
        alignItems: 'center',
    },
    authButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    switchText: {
        fontSize: 14,
        color: '#7F8C8D',
    },
    switchLink: {
        fontSize: 14,
        color: '#667eea',
        fontWeight: '600',
    },
    featuresPreview: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    featuresTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 16,
        textAlign: 'center',
    },
    featuresList: {
        gap: 12,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    featureIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    featureText: {
        fontSize: 14,
        color: '#2C3E50',
        fontWeight: '500',
    },
    // Logged in profile styles
    profileContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 60,
    },
    profileTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 8,
    },
    profileSubtitle: {
        fontSize: 16,
        color: '#7F8C8D',
        marginBottom: 30,
    },
    profileCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#7F8C8D',
    },
});

export default Profile;