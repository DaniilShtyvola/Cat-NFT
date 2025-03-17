import React, { FC, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Image } from 'react-native';
import { Button } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faRightFromBracket,
    faEdit,
    faCheck,
    faXmark,
    faImage,
    faTriangleExclamation,
    faUser,
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

    const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageSizeInKB, setImageSizeInKB] = useState<number | null>(null);

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

                    fetchAvatar(token);
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
        await AsyncStorage.removeItem('token');
        setSelectedImage(null);
        setAvatarBase64(null);
        emitUserLoggedOutEvent();
    };

    const handleCancelAvatarUpdate = async () => {
        setSelectedImage(null);
    };

    const fetchAvatar = async (token: string) => {
        try {
            const response = await fetch(`${API_URL}/Auth/get-avatar`, {
                method: 'GET',
                headers: {
                    token: token,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setAvatarBase64(data.avatarBase64);
            } else if (response.status === 404) {
                setAvatarBase64(null);
            } else {
                const errorText = await response.text();
                console.error(
                    `Failed to fetch avatar (${response.status}):`,
                    errorText,
                );
            }
        } catch (error) {
            console.error('Error fetching avatar:', error);
        }
    };

    const handleChooseImage = async () => {
        const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            setSelectedImage(
                `data:image/jpeg;base64,${result.assets[0].base64}`,
            );
        }
    };

    useEffect(() => {
        if (selectedImage) {
            const sizeInBytes = selectedImage.length * (3 / 4);
            const sizeInKB = sizeInBytes / 1024;
            setImageSizeInKB(sizeInKB);
        }
    }, [selectedImage]);

    const handleUpdateAvatar = async () => {
        if (!selectedImage) return;

        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch(`${API_URL}/Auth/update-avatar`, {
                method: 'POST',
                headers: {
                    token: token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(selectedImage),
            });

            if (response.ok) {
                setAvatarBase64(selectedImage);
                setSelectedImage(null);
                setMessage({
                    text: 'Avatar updated successfully!',
                    variant: 'success',
                });
            } else if (response.status === 400) {
                setMessage({
                    text: 'Avatar size exceeds the limit of 200 KB.',
                    variant: 'warning',
                });
            } else {
                const errorData = await response.json();
                setMessage({
                    text: errorData.message || 'Failed to update avatar.',
                    variant: 'danger',
                });
            }
        } catch (error) {
            setMessage({
                text: 'An error occurred while updating the avatar.',
                variant: 'danger',
            });
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
        <View style={styles.container}>
            {userInfo ? (
                <>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.label}>Avatar icon:</Text>
                        <View style={styles.avatarButtonsContainer}>
                            {selectedImage ? (
                                <>
                                    <Button
                                        onPress={handleUpdateAvatar}
                                        style={styles.confirmButton}
                                    >
                                        <FontAwesomeIcon
                                            style={styles.editIcon}
                                            size={18}
                                            icon={faCheck}
                                        />
                                    </Button>
                                    <Button
                                        onPress={handleCancelAvatarUpdate}
                                        style={styles.cancelButton}
                                    >
                                        <FontAwesomeIcon
                                            style={styles.editIcon}
                                            size={18}
                                            icon={faXmark}
                                        />
                                    </Button>
                                </>
                            ) : (
                                <Button onPress={handleChooseImage}>
                                    <FontAwesomeIcon
                                        style={styles.editIcon}
                                        size={18}
                                        icon={faImage}
                                    />
                                </Button>
                            )}
                        </View>
                    </View>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatarImageContainer}>
                            {avatarBase64 ? (
                                <Image
                                    source={{ uri: avatarBase64 }}
                                    style={styles.avatar}
                                />
                            ) : (
                                <View style={styles.falseIconContainer}>
                                    <FontAwesomeIcon
                                        style={styles.falseIcon}
                                        size={64}
                                        icon={faUser}
                                    />
                                    <Text style={styles.label}>No icon</Text>
                                </View>
                            )}
                            {selectedImage && (
                                <Text style={styles.label}>Old avatar</Text>
                            )}
                        </View>
                        {selectedImage && (
                            <View style={styles.avatarImageContainer}>
                                <Image
                                    source={{ uri: selectedImage }}
                                    style={styles.avatar}
                                />
                                <Text style={styles.label}>
                                    New avatar,{' '}
                                    {imageSizeInKB?.toFixed(2) || ''}KB
                                </Text>
                            </View>
                        )}
                    </View>
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
    avatarButtonsContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    avatarContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: 10,
        justifyContent: 'space-between',
    },
    avatar: {
        width: 165,
        height: 165,
        borderRadius: 180,
        marginBottom: 6,
    },
    avatarPlaceholder: {
        fontSize: 16,
        color: 'white',
    },
    avatarImageContainer: {
        alignItems: 'center',
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
    falseIcon: {
        marginBottom: 8,
        color: 'rgb(128, 128, 128)',
    },
    falseIconContainer: {
        width: 165,
        height: 165,
        borderRadius: 180,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: 'rgb(128, 128, 128)',
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
