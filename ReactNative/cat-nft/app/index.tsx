import React, { FC, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faArrowDownWideShort,
  faArrowUpWideShort,
  faRotate,
  faFaceSadTear,
  faCheck,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';

import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import Web3 from 'web3';
import 'react-native-get-random-values';
import { jwtDecode } from 'jwt-decode';

import CONTRACT_ABI from '../contracts/CatNFT.json';
import { GANACHE_URL, CONTRACT_ADDRESS } from '../config';
import CatMarketCard from '../components/CatMarketCard';

import { customEventEmitter, CustomEvents } from '../events';

interface MarketProps { }

const Market: FC<MarketProps> = () => {
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [cats, setCats] = useState<any[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [message, setMessage] = useState<{ text: string; variant: string } | null>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  useEffect(() => {
    customEventEmitter.on(CustomEvents.CAT_BOUGHT, fetchMarketplaceCats);

    return () => {
      customEventEmitter.off(CustomEvents.CAT_BOUGHT, fetchMarketplaceCats);
    };
  }, []);

  useEffect(() => {
    const fetchToken = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          setWalletAddress(decoded.WalletAddress);
        } catch (error) {
          console.error('Error decoding JWT:', error);
        }
      } else {
        setWalletAddress(null);
      }
    };
    fetchToken();
    fetchMarketplaceCats();
  }, []);

  const fetchMarketplaceCats = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const web3 = new Web3(GANACHE_URL);
      const contract = new web3.eth.Contract(CONTRACT_ABI.abi, CONTRACT_ADDRESS);

      let catIds;

      if (token) {
        const decoded: any = jwtDecode(token);
        const WALLET_ADDRESS = decoded.WalletAddress;

        catIds = await contract.methods.getMarketplaceCats(WALLET_ADDRESS).call();
      } else {
        catIds = await contract.methods.getMarketplaceCats('0x0000000000000000000000000000000000000000').call();
      }

      if (Array.isArray(catIds) && catIds.length > 0) {
        const catsData = await Promise.all(
          catIds.map(async (catId: number) => {
            const catData = await contract.methods.cats(catId).call();
            return {
              id: catId,
              ...catData,
            };
          }),
        );
        setCats(catsData);
      } else {
        setCats([]);
      }
    } catch (error) {
      console.error('Error fetching marketplace cats:', error);
    } finally {
      setLoading(false);
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

  const sortedCats = [...cats].sort((a, b) => {
    const priceA = Number(a.price);
    const priceB = Number(b.price);
    return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
  });

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.sortContainer}>
        <IconButton
          icon={() => (
            <FontAwesomeIcon
              size={20}
              style={styles.sortIcon}
              icon={sortOrder === 'asc' ? faArrowUpWideShort : faArrowDownWideShort}
            />
          )}
          onPress={toggleSortOrder}
        />
      </View>
      <IconButton
        icon={() =>
          <FontAwesomeIcon
            size={20}
            style={styles.sortIcon}
            icon={faRotate}
          />
        }
        onPress={fetchMarketplaceCats}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedCats}
        keyExtractor={(item) => item.id.toString()}
        numColumns={1}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <CatMarketCard cat={item} walletAddress={walletAddress || ''} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesomeIcon icon={faFaceSadTear} size={24} color="white" />
            <Text style={styles.emptyText}>No cats available for sale</Text>
          </View>
        }
      />

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
          <FontAwesomeIcon
            icon={message.variant === 'success' ? faCheck : faTriangleExclamation}
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
    paddingTop: 52,
    flex: 1,
    padding: 16,
    backgroundColor: 'rgb(23, 25, 27)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortText: {
    marginRight: 8,
    color: 'white',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 64,
  },
  emptyText: {
    color: 'white',
    fontSize: 18,
    marginTop: 8,
  },
  sortIcon: {
    color: 'white'
  },
  alert: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    padding: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertText: {
    color: 'white',
    marginLeft: 8,
  },
});

export default Market;