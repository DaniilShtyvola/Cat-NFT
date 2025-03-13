import React, { FC, useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import { Button } from 'react-native-paper';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faCheck,
    faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';

import { emitUserLoggedInEvent } from '../events';
import { API_URL } from '../config';

interface LoginProps {}

const Login: FC<LoginProps> = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [wallet, setWallet] = useState('');
    const [message, setMessage] = useState<{
        text: string;
        variant: string;
    } | null>(null);
    const [isFadingOut, setIsFadingOut] = useState(false);

    const handleLogin = async () => {
        const loginData = {
            email: email,
            password: password,
        };

        if (email == '' || password == '') {
            setMessage({
                text: 'You must fill in all fields.',
                variant: 'danger',
            });
            return;
        }

        try {
            const response = await axios.post(
                `${API_URL}/Auth/login`,
                loginData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            );

            const { token } = response.data;

            await AsyncStorage.setItem('token', token);

            const decoded: any = jwtDecode(token);
            const username =
                decoded[
                    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
                ];

            emitUserLoggedInEvent(username);

            setEmail('');
            setPassword('');

            setMessage({ text: 'Login successful!', variant: 'success' });
        } catch (error) {
            setMessage({ text: 'Login failed.', variant: 'danger' });
        }
    };

    const handleRegister = async () => {
        try {
            await axios.post(`${API_URL}/Auth/register-user`, {
                userName: username,
                email: email,
                password: password,
                walletAddress: wallet,
            });

            setMessage({
                text: 'Successfully registered!',
                variant: 'success',
            });

            setWallet('');
            setUsername('');
            setEmail('');
            setPassword('');

            setIsLogin(true);
        } catch (error) {
            setMessage({ text: 'Registration failed.', variant: 'danger' });
        }
    };

    const handleSubmit = () => {
        if (isLogin) {
            handleLogin();
        } else {
            handleRegister();
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
                {isLogin ? (
                    <>
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
                            placeholder="Enter password"
                            placeholderTextColor="gray"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </>
                ) : (
                    <>
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
                    </>
                )}

                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    style={styles.button}
                >
                    {isLogin ? 'Log in' : 'Create an account'}
                </Button>

                <Text style={styles.toggleText}>
                    {isLogin
                        ? "Don't have an account? "
                        : 'Already have an account? '}
                    <Text
                        style={styles.toggleLink}
                        onPress={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? 'Create one!' : 'Log in'}
                    </Text>
                </Text>
            </View>
            {message && (
                <View
                    style={[
                        styles.alert,
                        {
                            backgroundColor:
                                message.variant === 'success'
                                    ? 'rgb(25, 135, 84)'
                                    : 'rgb(220, 53, 69)',
                            opacity: isFadingOut ? 0 : 1,
                        },
                    ]}
                >
                    <FontAwesomeIcon
                        icon={
                            message.variant === 'success'
                                ? faCheck
                                : faTriangleExclamation
                        }
                        color="white"
                    />
                    <Text style={styles.alertText}>
                        {'  '}
                        {message.text}
                    </Text>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgb(23, 25, 27)',
    },
    formContainer: {
        width: '80%',
    },
    input: {
        backgroundColor: 'rgb(33, 37, 41)',
        color: 'white',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    button: {
        marginTop: 8,
        backgroundColor: 'rgb(25, 135, 84)',
    },
    toggleText: {
        color: 'gray',
        textAlign: 'center',
        marginTop: 12,
    },
    toggleLink: {
        color: 'rgb(87, 165, 204)',
        textDecorationLine: 'underline',
    },
    alert: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        padding: 12,
        paddingRight: 16,
        paddingLeft: 16,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    alertText: {
        color: 'white',
        marginLeft: 8,
    },
});

export default Login;
