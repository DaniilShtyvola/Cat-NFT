import React, { FC, useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
} from 'react-native';
import { Button } from 'react-native-paper';

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { API_URL } from '../config';

type RootStackParamList = {
    Home: undefined;
    Register: undefined;
};

interface RegisterPageProps { }

const RegisterPage: FC<RegisterPageProps> = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [wallet, setWallet] = useState('');
    const [message, setMessage] = useState<{ text: string; variant: string } | null>(null);
    const [isFadingOut, setIsFadingOut] = useState(false);

    const handleSubmit = async () => {
        try {
            await axios.post(`${API_URL}/Auth/register-user`, {
                userName: username,
                email: email,
                password: password,
                walletAddress: wallet,
            });

            setMessage({ text: 'Successfully registered!', variant: 'success' });

            setTimeout(() => {
                navigation.navigate('Home');
            }, 3000);
        } catch (error) {
            setMessage({ text: 'Registration failed.', variant: 'danger' });
            console.error('Error during registration:', error);
        }
    };

    useEffect(() => {
        if (message) {
            const fadeOutTimer = setTimeout(() => {
                setIsFadingOut(true);
            }, 3000);

            const removeMessageTimer = setTimeout(() => {
                setMessage(null);
                setIsFadingOut(false);
            }, 4000);

            return () => {
                clearTimeout(fadeOutTimer);
                clearTimeout(removeMessageTimer);
            };
        }
    }, [message]);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.formContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter username"
                    placeholderTextColor="gray"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Enter password"
                    placeholderTextColor="gray"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                <TextInput
                    style={styles.input}
                    placeholder="Enter email"
                    placeholderTextColor="gray"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Enter wallet address"
                    placeholderTextColor="gray"
                    value={wallet}
                    onChangeText={setWallet}
                    autoCapitalize="none"
                />
                <Button mode="contained" onPress={handleSubmit} style={styles.button}>
                    Create an account
                </Button>
                {message && (
                    <View
                        style={[
                            styles.alert,
                            {
                                backgroundColor: message.variant === 'success' ? 'green' : 'red',
                                opacity: isFadingOut ? 0 : 1,
                            },
                        ]}
                    >
                        <Text style={styles.alertText}>{message.text}</Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#121212',
    },
    formContainer: {
        width: '80%',
    },
    input: {
        backgroundColor: '#333',
        color: 'white',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    button: {
        marginTop: 8,
        backgroundColor: '#6200ee',
    },
    alert: {
        padding: 10,
        borderRadius: 8,
        marginTop: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertText: {
        color: 'white',
    },
});

export default RegisterPage;