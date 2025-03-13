import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faQuestion,
  faRightToBracket,
  faShop,
  faTable,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

import { customEventEmitter, CustomEvents } from '../events';
import { useColorScheme } from '@/hooks/useColorScheme';

const Tab = createBottomTabNavigator();

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [nickname, setNickname] = useState<string | null>(null);

  useEffect(() => {
    const fetchNickname = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const decoded: any = jwtDecode(token);
        const username =
          decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
        setNickname(username);
      }
    };

    fetchNickname();

    const onUserLoggedIn = (username: string) => {
      setNickname(username);
    };

    const onUserLoggedOut = () => {
      AsyncStorage.removeItem('token');
      setNickname(null);
    };

    customEventEmitter.on(CustomEvents.USER_LOGGED_IN, onUserLoggedIn);
    customEventEmitter.on(CustomEvents.USER_LOGGED_OUT, onUserLoggedOut);

    return () => {
      customEventEmitter.off(CustomEvents.USER_LOGGED_IN, onUserLoggedIn);
      customEventEmitter.off(CustomEvents.USER_LOGGED_OUT, onUserLoggedOut);
    };
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
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
            } else if (route.name === 'Account') {
              iconName = faUser;
            } else {
              iconName = faQuestion;
            }

            return <FontAwesomeIcon icon={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'rgb(25, 135, 84)',
          tabBarInactiveTintColor: 'rgb(128, 128, 128)',
          tabBarStyle: {
            backgroundColor: 'rgb(23, 25, 27)',
          },
          headerShown: false,
        })}
      >
        <Tab.Screen
          name="Market"
          component={MarketScreen}
          options={{ title: 'Market' }}
        />
        {nickname && (
          <Tab.Screen
            name="Cats"
            component={CatsScreen}
            options={{ title: 'My Cats' }}
          />
        )}
        {!nickname && (
          <Tab.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: 'Log In' }}
          />
        )}
        {nickname && (
          <Tab.Screen
            name="Account"
            component={AccountScreen}
            options={{ title: 'Account' }}
          />
        )}
      </Tab.Navigator>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

const MarketScreen = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
};

const CatsScreen = () => {
  return (
    <Stack>
      <Stack.Screen name="cats" options={{ headerShown: false }} />
    </Stack>
  );
};

const LoginScreen = () => {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
    </Stack>
  );
};

const AccountScreen = () => {
  return (
    <Stack>
      <Stack.Screen name="account" options={{ headerShown: false }} />
    </Stack>
  );
};