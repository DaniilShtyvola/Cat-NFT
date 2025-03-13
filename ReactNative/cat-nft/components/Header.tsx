import React, { FC, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faQuestion,
  faRightToBracket,
  faShop,
  faTable,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';

import Market from '../app/index';
import Cats from '../app/cats';
import Login from '../app/login';

const Tab = createBottomTabNavigator();

interface PageHeaderProps {}

const PageHeader: FC<PageHeaderProps> = () => {
  const [nickname, setNickname] = useState<string | null>(null);

  useEffect(() => {
    const fetchNickname = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const decoded: any = jwtDecode(token);
        const username = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
        setNickname(username);
      }
    };
    fetchNickname();
  }, []);

  const handleLogOut = async () => {
    await AsyncStorage.removeItem('token');
    setNickname(null);
    Alert.alert('Logged out', 'You have been successfully logged out.');
  };

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === 'Market') {
              iconName = faShop;
            } else if (route.name === 'Cats') {
              iconName = faTable;
            } else if (route.name === 'Login') {
              iconName = faRightToBracket;
            } else {
                iconName = faQuestion
            }

            return <FontAwesomeIcon icon={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen
          name="Market"
          component={Market}
          options={{ title: 'Market' }}
        />
        {nickname && (
          <Tab.Screen
            name="Cats"
            component={Cats}
            options={{ title: 'My Cats' }}
          />
        )}
        {!nickname && (
          <Tab.Screen
            name="Login"
            component={Login}
            options={{ title: 'Log In' }}
          />
        )}
      </Tab.Navigator>

      {nickname && (
        <View style={styles.userInfoContainer}>
          <Text style={styles.userInfoText}>Logged in as: {nickname}</Text>
          <TouchableOpacity onPress={handleLogOut} style={styles.logoutButton}>
            <FontAwesomeIcon icon={faRightFromBracket} color="white" />
            <Text style={styles.logoutText}>Sign out</Text>
          </TouchableOpacity>
        </View>
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  userInfoContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 8,
  },
  userInfoText: {
    color: 'white',
    marginRight: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    marginLeft: 5,
  },
});

export default PageHeader;