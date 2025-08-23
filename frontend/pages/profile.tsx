import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { apiService } from '../services/api';
import AuthService from '../services/auth';

const { width } = Dimensions.get('window');

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

interface ProfileProps {
  isLoggedIn?: boolean;
  onLogin?: (userData: User) => void;
  onLogout?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ isLoggedIn = false, onLogin, onLogout }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [name, setName] = useState('');
    const [heightFeet, setHeightFeet] = useState('');
    const [heightInches, setHeightInches] = useState('');
    const [weight, setWeight] = useState('');
    const [activityLevel, setActivityLevel] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [userData, setUserData] = useState<User | null>(null);

    useEffect(() => {
        if (isLoggedIn) {
            loadUserData();
        }
    }, [isLoggedIn]);

    const createUser = async () => {
        console.log("Creating user...");
        setIsLoading(true);
        
        try {
            const response = await apiService.createUser(
                name, heightFeet, heightInches, weight, activityLevel, email, password
            );
            
            if (response.data.status === 'success') {
                const { tokens, user } = response.data;
                
                // Store tokens and user data
                await AuthService.storeTokens(tokens.access, tokens.refresh);
                await AuthService.storeUserData(user);
                
                console.log("User created successfully:", user);
                Alert.alert('Success', 'Account created successfully!');
                
                // Call login callback
                onLogin?.(user);
            }
        } catch (err: unknown) {
            console.error("Error creating user:", err);
            
            // Type guard for axios error
            if (err && typeof err === 'object' && 'response' in err) {
                const error = err as { response?: { data?: { message?: string; missing_fields?: string[] } } };
                
                if (error.response?.data) {
                    const { message, missing_fields } = error.response.data;
                    
                    if (message === "User with this email already exists") {
                        Alert.alert('Account Exists', 'An account with this email already exists. Please try logging in instead.');
                    } else if (missing_fields) {
                        Alert.alert('Missing Information', `Please fill in: ${missing_fields.join(', ')}`);
                    } else {
                        Alert.alert('Error', message || 'Unknown error occurred');
                    }
                } else {
                    Alert.alert('Error', 'Network error. Please try again.');
                }
            } else {
                Alert.alert('Error', 'Connection error. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const loginUser = async () => {
        console.log("Logging in user...");
        setIsLoading(true);
        
        try {
            const response = await apiService.loginUser(email, password);
            
            if (response.data.status === 'success') {
                const { tokens, user } = response.data;
                
                // Store tokens and user data
                await AuthService.storeTokens(tokens.access, tokens.refresh);
                await AuthService.storeUserData(user);
                
                console.log("Login successful:", user);
                Alert.alert('Success', 'Login successful!');
                
                // Call login callback
                onLogin?.(user);
            }
        } catch (err: unknown) {
            console.error("Error logging in:", err);
            
            // Type guard for axios error
            if (err && typeof err === 'object' && 'response' in err) {
                const error = err as { 
                    response?: { 
                        status?: number;
                        data?: { 
                            message?: string;
                            detail?: string;
                            non_field_errors?: string[];
                        } 
                    } 
                };
                
                if (error.response?.status) {
                    switch (error.response.status) {
                        case 401:
                            Alert.alert(
                                'Login Failed', 
                                'Invalid email or password. Please check your credentials and try again.',
                                [{ text: 'OK' }]
                            );
                            break;
                        case 400:
                            const errorMessage = error.response.data?.message || 
                                            error.response.data?.detail ||
                                            error.response.data?.non_field_errors?.[0] ||
                                            'Invalid login credentials.';
                            Alert.alert('Login Failed', errorMessage, [{ text: 'OK' }]);
                            break;
                        case 429:
                            Alert.alert(
                                'Too Many Attempts', 
                                'Too many login attempts. Please wait a few minutes before trying again.',
                                [{ text: 'OK' }]
                            );
                            break;
                        case 500:
                            Alert.alert(
                                'Server Error', 
                                'Our servers are experiencing issues. Please try again later.',
                                [{ text: 'OK' }]
                            );
                            break;
                        default:
                            Alert.alert(
                                'Login Failed', 
                                error.response.data?.message || 'An unexpected error occurred. Please try again.',
                                [{ text: 'OK' }]
                            );
                    }
                } else if (error.response?.data?.message) {
                    Alert.alert('Login Failed', error.response.data.message, [{ text: 'OK' }]);
                } else {
                    Alert.alert(
                        'Network Error', 
                        'Unable to connect to the server. Please check your internet connection.',
                        [{ text: 'OK' }]
                    );
                }
            } else {
                // Handle non-axios errors (network issues, etc.)
                Alert.alert(
                    'Connection Error', 
                    'Unable to connect to the server. Please check your internet connection and try again.',
                    [{ text: 'OK' }]
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await AuthService.logout();
            setUserData(null);
            Alert.alert('Success', 'Logged out successfully!');
            onLogout?.();
        } catch (err: unknown) {
            console.error('Error logging out:', err);
            Alert.alert('Error', 'Failed to logout properly');
        }
    };

    const loadUserData = async () => {
        try {
            const storedUserData = await AuthService.getUserData();
            if (storedUserData) {
                setUserData(storedUserData);
            }
        } catch (err: unknown) {
            console.error('Error loading user data:', err);
        }
    };

    const validatePasswords = () => {
        if (!isLoginMode && password !== confirmPassword) {
            Alert.alert(
                'Password Mismatch',
                'Passwords do not match. Please make sure both password fields are identical.',
                [{ text: 'OK' }]
            );
            return false;
        }
        return true;
    };

    const validatePasswordStrength = (password: string) => {
        if (password.length < 6) {
            Alert.alert(
                'Weak Password',
                'Password must be at least 6 characters long.',
                [{ text: 'OK' }]
            );
            return false;
        }
        return true;
    };

    const handleAuth = async () => {
        // Basic validation
        if (!email || !password) {
            Alert.alert('Missing Information', 'Please enter both email and password.');
            return;
        }

        if (!isLoginMode) {
            // Additional validation for signup
            if (!name || !heightFeet || !heightInches || !weight || !activityLevel) {
                Alert.alert('Missing Information', 'Please fill in all required fields.');
                return;
            }

            // Validate password strength
            if (!validatePasswordStrength(password)) {
                return;
            }

            // Validate password confirmation
            if (!validatePasswords()) {
                return;
            }

            await createUser();
        } else {
            await loginUser();
        }
    };

    // Password strength indicator
    const getPasswordStrength = (password: string) => {
        if (password.length === 0) return { strength: 0, text: '', color: '#E0E0E0' };
        if (password.length < 6) return { strength: 1, text: 'Weak', color: '#FF6B6B' };
        if (password.length < 10) return { strength: 2, text: 'Fair', color: '#FFB84D' };
        return { strength: 3, text: 'Strong', color: '#51CF66' };
    };

    const passwordStrength = getPasswordStrength(password);
    const passwordsMatch = password === confirmPassword;

    const isUserDataValid = (data: User | null): data is User => {
        return data !== null && typeof data === 'object' && 'name' in data && 'email' in data;
    };

    if (isLoggedIn && isUserDataValid(userData)) {
        return (
            <View style={styles.container}>
                <View style={styles.profileContainer}>
                    <Text style={styles.profileTitle}>Profile</Text>
                    <Text style={styles.profileSubtitle}>Welcome back, {userData.name}!</Text>
                    
                    {/* User Info Card */}
                    <View style={styles.profileCard}>
                        <Text style={styles.cardTitle}>Account Information</Text>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Name:</Text>
                            <Text style={styles.infoValue}>{userData.name}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Email:</Text>
                            <Text style={styles.infoValue}>{userData.email}</Text>
                        </View>
                        {userData.profile && (
                            <>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Height:</Text>
                                    <Text style={styles.infoValue}>
                                        {userData.profile.height_feet}'{userData.profile.height_inches}"
                                    </Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Weight:</Text>
                                    <Text style={styles.infoValue}>{userData.profile.weight} lbs</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Activity Level:</Text>
                                    <Text style={styles.infoValue}>{userData.profile.activity_level} days/week</Text>
                                </View>
                            </>
                        )}
                    </View>

                    {/* Logout Button */}
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
                        <Text style={styles.logoutButtonText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

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
                                {[
                                    { value: '1-2', label: '1-2 days a week' },
                                    { value: '3-5', label: '3-5 days a week' },
                                    { value: '6-7', label: '6-7 days a week' }
                                ].map((option) => (
                                    <TouchableOpacity 
                                        key={option.value}
                                        style={styles.radioOption} 
                                        onPress={() => setActivityLevel(option.value)}
                                    >
                                        <View style={[styles.radioCircle, activityLevel === option.value && styles.radioCircleSelected]}>
                                            {activityLevel === option.value && <View style={styles.radioDot} />}
                                        </View>
                                        <Text style={[styles.radioLabel, activityLevel === option.value && styles.radioLabelSelected]}>
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
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
                    {/* Password Strength Indicator */}
                    {!isLoginMode && password.length > 0 && (
                        <View style={styles.passwordStrengthContainer}>
                            <View style={styles.passwordStrengthBar}>
                                <View 
                                    style={[
                                        styles.passwordStrengthFill,
                                        { 
                                            width: `${(passwordStrength.strength / 3) * 100}%`,
                                            backgroundColor: passwordStrength.color
                                        }
                                    ]} 
                                />
                            </View>
                            <Text style={[styles.passwordStrengthText, { color: passwordStrength.color }]}>
                                {passwordStrength.text}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Confirm Password Field - Only show in signup mode */}
                {!isLoginMode && (
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Confirm Password</Text>
                        <TextInput
                            style={[
                                styles.input,
                                confirmPassword.length > 0 && !passwordsMatch && styles.inputError
                            ]}
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                        />
                        {/* Password Match Indicator */}
                        {confirmPassword.length > 0 && (
                            <View style={styles.passwordMatchContainer}>
                                <Ionicons 
                                    name={passwordsMatch ? "checkmark-circle" : "close-circle"} 
                                    size={16} 
                                    color={passwordsMatch ? "#51CF66" : "#FF6B6B"} 
                                />
                                <Text style={[
                                    styles.passwordMatchText,
                                    { color: passwordsMatch ? "#51CF66" : "#FF6B6B" }
                                ]}>
                                    {passwordsMatch ? "Passwords match" : "Passwords don't match"}
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Auth Button */}
                <TouchableOpacity 
                    style={[styles.authButton, isLoading && styles.authButtonDisabled]} 
                    onPress={handleAuth}
                    disabled={isLoading}
                >
                    <Text style={styles.authButtonText}>
                        {isLoading ? 'Please wait...' : (isLoginMode ? 'Sign In' : 'Create Account')}
                    </Text>
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
                                <MaterialIcons name="fitness-center" size={20} color="#333" />
                                <Text style={styles.featureText}>Personalized workout tracking</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <MaterialIcons name="restaurant" size={20} color="#333" />
                                <Text style={styles.featureText}>Smart nutrition logging</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <MaterialIcons name="psychology" size={20} color="#333" />
                                <Text style={styles.featureText}>AI-powered fitness coaching</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <MaterialIcons name="analytics" size={20} color="#333" />
                                <Text style={styles.featureText}>Detailed progress analytics</Text>
                            </View>
                        </View>
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
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
        color: '#000000',
        textAlign: 'center',
        marginBottom: 12,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#666666',
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
        color: '#000000',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#000000',
    },
    inputError: {
        borderColor: '#FF6B6B',
        borderWidth: 2,
    },
    // Password validation styles
    passwordStrengthContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    passwordStrengthBar: {
        flex: 1,
        height: 4,
        backgroundColor: '#E0E0E0',
        borderRadius: 2,
        marginRight: 12,
    },
    passwordStrengthFill: {
        height: '100%',
        borderRadius: 2,
    },
    passwordStrengthText: {
        fontSize: 12,
        fontWeight: '600',
        minWidth: 50,
    },
    passwordMatchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    passwordMatchText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 6,
    },
    // Radio button styles
    radioContainer: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        padding: 16,
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
        borderColor: '#000000',
    },
    radioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#000000',
    },
    radioLabel: {
        fontSize: 16,
        color: '#000000',
        flex: 1,
    },
    radioLabelSelected: {
        color: '#000000',
        fontWeight: '600',
    },
    authButton: {
        backgroundColor: '#000000',
        borderRadius: 12,
        paddingVertical: 18,
        paddingHorizontal: 32,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    authButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    switchText: {
        fontSize: 14,
        color: '#666666',
    },
    switchLink: {
        fontSize: 14,
        color: '#000000',
        fontWeight: '600',
    },
    featuresPreview: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    featuresTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
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
    featureText: {
        fontSize: 14,
        color: '#333333',
        fontWeight: '500',
        marginLeft: 12,
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
        color: '#000000',
        marginBottom: 8,
    },
    profileSubtitle: {
        fontSize: 16,
        color: '#666666',
        marginBottom: 30,
    },
    profileCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#666666',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    infoLabel: {
        fontSize: 14,
        color: '#666666',
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        color: '#000000',
        fontWeight: '600',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF0F0',
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#FFE0E0',
    },
    logoutButtonText: {
        color: '#FF6B6B',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    authButtonDisabled: {
        backgroundColor: '#CCCCCC',
    },
});

export default Profile;