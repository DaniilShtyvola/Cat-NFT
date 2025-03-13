import React, { FC, useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { Button } from 'react-native-paper';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { emitUserLoggedOutEvent } from '../events';

interface AccountPageProps { }

const Account: FC<AccountPageProps> = () => {
    const [userInfo, setUserInfo] = useState<{
        name: string;
        walletAddress: string;
        isAdmin: boolean;
    } | null>(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                try {
                    const decoded: any = jwtDecode(token);
                    const username = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
                    setUserInfo({
                        name: username || 'Unknown',
                        walletAddress: decoded.WalletAddress || 'No wallet address',
                        isAdmin: decoded.isAdmin === 'true',
                    });
                } catch (error) {
                    console.error('Error decoding token:', error);
                }
            }
        };

        fetchUserInfo();
    }, []);

    const handleLogOut = async () => {
        emitUserLoggedOutEvent();
    };

    return (
        <View style={styles.container}>
            {userInfo ? (
                <>
                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>Username:</Text>
                        <Text style={styles.value}>{userInfo.name}</Text>
                    </View>

                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>Wallet Address:</Text>
                        <Text style={styles.walletValue}>{userInfo.walletAddress}</Text>
                    </View>

                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>Admin:</Text>
                        <Text style={styles.value}>{userInfo.isAdmin ? 'Yes' : 'No'}</Text>
                    </View>

                    <Button
                        mode="contained"
                        onPress={handleLogOut}
                        style={styles.logoutButton}
                        labelStyle={styles.logoutButtonText}
                    >
                        <FontAwesomeIcon style={styles.exitIcon} icon={faRightFromBracket} /> {'  '}Log Out
                    </Button>
                </>
            ) : (
                <Text style={styles.loadingText}>Loading user information...</Text>
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
    logoutButton: {
        marginTop: 20,
        backgroundColor: 'rgb(220, 53, 69)',
        paddingVertical: 6,
    },
    logoutButtonText: {
        color: 'white',
        fontSize: 16,
    },
    exitIcon: {
        color: 'white',
    },
    loadingText: {
        fontSize: 18,
        color: 'white',
        textAlign: 'center',
    },
});

export default Account;