import React, { FC, useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    FlatList,
} from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import 'react-native-get-random-values';
import {
    faCheck,
    faXmark,
    faShuffle,
    faArrowDownWideShort,
    faArrowUpWideShort,
    faPaw,
    faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Web3 from 'web3';
import { jwtDecode } from 'jwt-decode';
import CONTRACT_ABI from '../contracts/CatNFT.json';
import { GANACHE_URL, CONTRACT_ADDRESS, CAT_API_KEY } from '../config';
import { customEventEmitter, CustomEvents } from '../events';
import CatCard from '../components/CatCard';

interface CatsPageProps { }

const Cats: FC<CatsPageProps> = () => {
    const [pageLoading, setPageLoading] = useState(false);
    const [mintLoading, setMintLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [cats, setCats] = useState<any[]>([]);

    const [message, setMessage] = useState<{ text: string; variant: string } | null>(null);
    const [isFadingOut, setIsFadingOut] = useState(false);

    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [filter, setFilter] = useState<number>(0);

    const toggleSortOrder = () => {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    };

    const fetchIsAdmin = async () => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                setIsAdmin(decoded.isAdmin === 'true');
            } catch (error) {
                console.error('Error decoding JWT:', error);
            }
        }
    };

    const fetchWalletAddress = async () => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                setWalletAddress(decoded.WalletAddress);
            } catch (error) {
                console.error('Error decoding JWT:', error);
            }
        }
    };

    useEffect(() => {
        const showMessage = (text: string, variant: string) => {
            setMessage({ text, variant });
        };

        customEventEmitter.on(CustomEvents.SHOW_MESSAGE, showMessage);
        customEventEmitter.on(CustomEvents.CAT_PRICE_CHANGED, fetchCats);
        customEventEmitter.on(CustomEvents.CAT_BOUGHT, fetchCats);

        return () => {
            customEventEmitter.off(CustomEvents.SHOW_MESSAGE, showMessage);
            customEventEmitter.off(CustomEvents.CAT_PRICE_CHANGED, fetchCats);
            customEventEmitter.off(CustomEvents.CAT_BOUGHT, fetchCats);
        };
    }, []);

    const fetchCats = async () => {
        setPageLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                const decoded: any = jwtDecode(token);
                const WALLET_ADDRESS = decoded.WalletAddress;

                const web3 = new Web3(GANACHE_URL);
                const contract = new web3.eth.Contract(CONTRACT_ABI.abi, CONTRACT_ADDRESS);

                const catIds: number[] = await contract.methods.getCatsByOwner(WALLET_ADDRESS).call();

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
            }
        } catch (error) {
            console.error('Error fetching cats:', error);
        }
        setPageLoading(false);
    };

    useEffect(() => {
        fetchWalletAddress();
        fetchIsAdmin();
    }, []);

    useEffect(() => {
        if (walletAddress) {
            fetchCats();
        }
    }, [walletAddress]);

    const handleCreateCat = async () => {
        setMintLoading(true);

        try {
            const response = await axios.get(
                `https://api.thecatapi.com/v1/images/search?api_key=${CAT_API_KEY}&has_breeds=true`,
            );

            const generatedImageUrl = response.data[0].url;
            const breed =
                response.data[0].breeds && response.data[0].breeds.length > 0
                    ? response.data[0].breeds[0].name
                    : 'Unknown';
            const temperament =
                response.data[0].breeds && response.data[0].breeds.length > 0
                    ? response.data[0].breeds[0].temperament || 'Unknown'
                    : 'Unknown';

            const temperamentWords = temperament.split(',');
            const randomTemperament = temperamentWords[Math.floor(Math.random() * temperamentWords.length)].trim();
            const formattedTemperament = randomTemperament.charAt(0).toUpperCase() + randomTemperament.slice(1);

            const formattedBreed = breed.includes(' ') ? breed.split(' ')[1] : breed;

            const generatedCatName = `${formattedTemperament} ${formattedBreed}`;

            const web3 = new Web3(GANACHE_URL);
            const contract = new web3.eth.Contract(CONTRACT_ABI.abi, CONTRACT_ADDRESS);

            const transaction = contract.methods.createCat(generatedImageUrl, generatedCatName);

            if (walletAddress) {
                try {
                    const gas = await transaction.estimateGas({
                        from: walletAddress,
                    });

                    await transaction.send({
                        from: walletAddress,
                        gas: gas.toString(),
                    });
                } catch (error) {
                    const errorMessage = (error as Error).message || 'An unknown error occurred.';
                    setMessage({ text: errorMessage, variant: 'danger' });
                }
            } else {
                setMessage({ text: 'Wallet address is not available.', variant: 'danger' });
            }

            setMessage({ text: 'NFT minted successfully!', variant: 'success' });
            fetchCats();
        } catch (err) {
            setMessage({ text: 'Error during NFT minting.', variant: 'danger' });
        } finally {
            setMintLoading(false);
        }
    };

    const toggleFilter = () => {
        setFilter((filter + 1) % 3);
    };

    const sortedCats = [...cats]
        .filter((cat) => {
            if (filter === 1) {
                return cat.isForSale === true;
            } else if (filter === 2) {
                return cat.isForSale === false;
            }
            return true;
        })
        .sort((a, b) => {
            const priceA = parseFloat(a.price);
            const priceB = parseFloat(b.price);

            if (isNaN(priceA)) return 1;
            if (isNaN(priceB)) return -1;

            return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
        });

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

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.filterContainer}>
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
                <IconButton
                    icon={() => (
                        <FontAwesomeIcon
                            size={20}
                            style={styles.sortIcon}
                            icon={filter === 0 ? faShuffle : filter === 1 ? faCheck : faXmark}
                        />
                    )}
                    onPress={toggleFilter}
                />
            </View>
            {isAdmin && (
                <Button
                    mode="contained"
                    onPress={handleCreateCat}
                    disabled={!isAdmin}
                    style={styles.mintButton}
                    loading={mintLoading}
                >
                    {!mintLoading && (
                        <>
                            <FontAwesomeIcon style={styles.mintIcon} icon={faPaw} />
                        </>
                    )}
                    {'  '}Mint NFT
                </Button>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={sortedCats} // Используем отсортированный массив
                keyExtractor={(item) => item.id.toString()}
                numColumns={1}
                ListHeaderComponent={renderHeader}
                renderItem={({ item }) => (
                    <CatCard cat={item} walletAddress={walletAddress || ''} />
                )}
            />

            {message && (
                <View
                    style={[
                        styles.alert,
                        {
                            backgroundColor: message.variant === 'success' ? 'rgb(25, 135, 84)' : 'rgb(220, 53, 69)',
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
        paddingRight: 16,
        paddingLeft: 16,
        backgroundColor: 'rgb(23, 25, 27)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    mintButton: {
        backgroundColor: 'rgb(33, 37, 41)',
        color: 'white'
    },
    mintIcon: {
        color: 'white'
    },
    sortIcon: {
        color: 'white'
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

export default Cats;