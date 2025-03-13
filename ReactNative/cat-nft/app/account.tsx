import React, { FC, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { Button } from 'react-native-paper';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faRightFromBracket,
    faEdit,
    faCheck,
    faXmark,
    faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';

import { emitUserLoggedOutEvent } from '../events';
import { API_URL } from '../config';

interface AccountPageProps {}

const Account: FC<AccountPageProps> = () => {
    const [userInfo, setUserInfo] = useState<{
        name: string;
        email: string;
        walletAddress: string;
        isAdmin: boolean;
    } | null>(null);

    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);

    const [message, setMessage] = useState<{
        text: string;
        variant: string;
    } | null>(null);
    const [isFadingOut, setIsFadingOut] = useState(false);

    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');

    useEffect(() => {
        const fetchUserInfo = async () => {
            const token = await AsyncStorage.getItem('token');

            if (token) {
                try {
                    const decoded: any = jwtDecode(token);
                    const username =
                        decoded[
                            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
                        ];
                    const email =
                        decoded[
                            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
                        ];
                    setUserInfo({
                        name: username || 'Unknown',
                        email: email || 'No email',
                        walletAddress:
                            decoded.WalletAddress || 'No wallet address',
                        isAdmin: decoded.isAdmin === 'true',
                    });
                    setNewName(username);
                    setNewEmail(email);
                } catch (error) {
                    console.error('Error decoding token:', error);
                }
            }
        };

        fetchUserInfo();
    }, []);

    const handleUpdateName = async () => {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch(`${API_URL}/Auth/update-username`, {
                method: 'POST',
                headers: {
                    token: token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newName),
            });

            if (response.ok) {
                setUserInfo((prev) =>
                    prev ? { ...prev, name: newName } : null,
                );
                setIsEditingName(false);
                setMessage({
                    text: 'Succesfully changed username!',
                    variant: 'success',
                });
            } else {
                setMessage({
                    text: 'Failed to update username.',
                    variant: 'danger',
                });
            }
        } catch (error) {
            console.error('Error updating username:', error);
        }
    };

    const handleUpdateEmail = async () => {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch(`${API_URL}/Auth/update-email`, {
                method: 'POST',
                headers: {
                    token: token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newEmail),
            });

            if (response.ok) {
                setUserInfo((prev) =>
                    prev ? { ...prev, email: newEmail } : null,
                );
                setIsEditingEmail(false);
                setMessage({
                    text: 'Succesfully changed username!',
                    variant: 'success',
                });
            } else {
                setMessage({
                    text: 'Failed to update email.',
                    variant: 'danger',
                });
            }
        } catch (error) {
            console.error('Error updating email:', error);
        }
    };

    const handleLogOut = async () => {
        emitUserLoggedOutEvent();
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
        <View style={styles.container}>
            {userInfo ? (
                <>
                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>Username:</Text>
                        {isEditingName ? (
                            <View style={styles.editContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={newName}
                                    onChangeText={setNewName}
                                />
                                <Button
                                    style={styles.confirmButton}
                                    onPress={handleUpdateName}
                                >
                                    <FontAwesomeIcon
                                        style={styles.editIcon}
                                        size={18}
                                        icon={faCheck}
                                    />
                                </Button>
                                <Button
                                    style={styles.cancelButton}
                                    onPress={() => setIsEditingName(false)}
                                >
                                    <FontAwesomeIcon
                                        style={styles.editIcon}
                                        size={18}
                                        icon={faXmark}
                                    />
                                </Button>
                            </View>
                        ) : (
                            <View style={styles.editContainer}>
                                <Text style={styles.value}>
                                    {userInfo.name}
                                </Text>
                                <Button onPress={() => setIsEditingName(true)}>
                                    <FontAwesomeIcon
                                        style={styles.editIcon}
                                        size={18}
                                        icon={faEdit}
                                    />
                                </Button>
                            </View>
                        )}
                    </View>

                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>Email:</Text>
                        {isEditingEmail ? (
                            <View style={styles.editContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={newEmail}
                                    onChangeText={setNewEmail}
                                />
                                <Button
                                    style={styles.confirmButton}
                                    onPress={handleUpdateEmail}
                                >
                                    <FontAwesomeIcon
                                        style={styles.editIcon}
                                        size={18}
                                        icon={faCheck}
                                    />
                                </Button>
                                <Button
                                    style={styles.cancelButton}
                                    onPress={() => setIsEditingEmail(false)}
                                >
                                    <FontAwesomeIcon
                                        style={styles.editIcon}
                                        size={18}
                                        icon={faXmark}
                                    />
                                </Button>
                            </View>
                        ) : (
                            <View style={styles.editContainer}>
                                <Text style={styles.value}>
                                    {userInfo.email}
                                </Text>
                                <Button onPress={() => setIsEditingEmail(true)}>
                                    <FontAwesomeIcon
                                        style={styles.editIcon}
                                        size={18}
                                        icon={faEdit}
                                    />
                                </Button>
                            </View>
                        )}
                    </View>

                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>Wallet Address:</Text>
                        <Text style={styles.walletValue}>
                            {userInfo.walletAddress}
                        </Text>
                    </View>

                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>Admin:</Text>
                        <Text style={styles.value}>
                            {userInfo.isAdmin ? 'Yes' : 'No'}
                        </Text>
                    </View>

                    <Button
                        mode="contained"
                        onPress={handleLogOut}
                        style={styles.logoutButton}
                        labelStyle={styles.logoutButtonText}
                    >
                        <FontAwesomeIcon
                            style={styles.exitIcon}
                            icon={faRightFromBracket}
                        />{' '}
                        {'  '}Log Out
                    </Button>
                </>
            ) : (
                <Text style={styles.loadingText}>
                    Loading user information...
                </Text>
            )}
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
                    <Text style={styles.alertText}>{message.text}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 52,
        padding: 16,
        backgroundColor: 'rgb(23, 25, 27)',
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarPlaceholder: {
        fontSize: 16,
        color: 'white',
    },
    avatarButton: {
        marginTop: 10,
    },
    infoContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        color: 'rgb(128, 128, 128)',
        marginBottom: 4,
    },
    walletValue: {
        fontSize: 17,
        color: 'white',
    },
    value: {
        fontSize: 18,
        color: 'white',
    },
    input: {
        fontSize: 18,
        color: 'white',
        borderBottomWidth: 1,
        borderBottomColor: 'white',
        flex: 1,
    },
    editContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },
    editIcon: {
        color: 'white',
    },
    confirmButton: {
        backgroundColor: 'rgb(25, 135, 84)',
        alignSelf: 'center',
    },
    cancelButton: {
        backgroundColor: 'rgb(220, 53, 69)',
    },
    logoutButton: {
        marginTop: 20,
        backgroundColor: 'rgb(220, 53, 69)',
        width: 180,
        justifyContent: 'space-between',
    },
    logoutButtonText: {
        color: 'white',
    },
    exitIcon: {
        color: 'white',
    },
    loadingText: {
        fontSize: 18,
        color: 'white',
        textAlign: 'center',
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

export default Account;
