import React, { FC, useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import { Button, Card } from 'react-native-paper';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEthereum } from '@fortawesome/free-brands-svg-icons'
import {
    faStar,
    faClock,
    faCartShopping
} from '@fortawesome/free-solid-svg-icons';
import Web3 from 'web3';

import { emitShowMessage, emitCatPriceChanged, emitCatBought } from '../events';

import CONTRACT_ABI from '../contracts/CatNFT.json';
import { GANACHE_URL, CONTRACT_ADDRESS } from '../config';

interface CatMarketCardProps {
    cat: {
        id: number;
        name: string;
        imageUrl: string;
        price: string;
        quality: number;
        isForSale: boolean;
        creationTime: string;
    };
    walletAddress: string;
}

const CatMarketCard: FC<CatMarketCardProps> = ({ cat, walletAddress }) => {
    const [isForSale, setIsForSale] = useState(cat.isForSale);
    const [loading, setLoading] = useState(false);

    const web3 = new Web3(GANACHE_URL);
    const contract = new web3.eth.Contract(CONTRACT_ABI.abi, CONTRACT_ADDRESS);

    const weiToEther = (wei: bigint): number => {
        return Number(wei) / 1e18;
    };

    const priceInEther = weiToEther(BigInt(cat.price));

    const handleBuy = async () => {
        if (!walletAddress) {
            alert('To buy NFT, you need to log in to your account.');
            return;
        }

        setLoading(true);

        try {
            const priceInWei = cat.price;

            const transaction = contract.methods.buyCat(cat.id);
            const gasLimit = await transaction.estimateGas({
                from: walletAddress,
                value: priceInWei,
            });

            await transaction.send({
                from: walletAddress,
                value: priceInWei,
                gas: gasLimit.toString(),
            });

            setIsForSale(false);

            emitCatBought();
        } catch (error) {
            console.error('Error buying cat:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card style={[styles.card, { borderColor: getBorderColor(Number(cat.quality)) }]}>
            <Image source={{ uri: cat.imageUrl }} style={styles.image} />
            <Card.Content>
                <Text style={styles.catName}>
                    <Text style={styles.grayText}>Name: </Text>
                    {cat.name}
                </Text>
                <Text style={styles.catPrice}>
                    <Text style={styles.grayText}>Price: </Text>
                    <Text style={styles.whiteText}>{priceInEther}</Text>
                    <FontAwesomeIcon icon={faEthereum} color="white" />
                </Text>
                <Text style={styles.catPrice}>
                    <Text style={styles.grayText}>Quality: </Text>
                    {Array.from({ length: Number(cat.quality) }, (_, index) => (
                        <View key={index}>
                            <FontAwesomeIcon icon={faStar} style={styles.starIcon} />
                        </View>
                    ))}
                </Text>
                <Text style={styles.creationTime}>
                    <FontAwesomeIcon icon={faClock} style={styles.clockIcon} />{'  '}
                    {new Date(Number(cat.creationTime) * 1000).toLocaleString()}
                </Text>
                <Button
                    mode="contained"
                    onPress={handleBuy}
                    disabled={loading || !isForSale}
                    style={styles.buyButton}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <>
                            <FontAwesomeIcon icon={faCartShopping} style={styles.buyIcon}/> {"  "}Buy
                        </>
                    )}
                </Button>
            </Card.Content>
        </Card>
    );
};

const getBorderColor = (quality: number) => {
    switch (quality) {
        case 1:
            return 'rgb(195, 195, 195)';
        case 2:
            return 'rgb(14, 209, 69)';
        case 3:
            return 'rgb(63, 72, 204)';
        case 4:
            return 'rgb(184, 61, 186)';
        case 5:
            return 'rgb(255, 205, 24)';
        default:
            return 'transparent';
    }
};

const styles = StyleSheet.create({
    card: {
        margin: 8,
        borderRadius: 12,
        borderWidth: 2,
        backgroundColor: 'rgb(33, 37, 41)',
        overflow: 'hidden',
    },
    buyIcon: {
        color: 'white'
    },
    image: {
        width: '100%',
        height: 240,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    catName: {
        fontSize: 18,
        marginTop: 12,
        fontWeight: 'bold',
        marginBottom: 8,
        color: "white"
    },
    grayText: {
        color: 'rgb(128, 128, 128)',
    },
    priceInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    editMenuIcon: {
        color: 'white'
    },
    priceInput: {
        flex: 1,
        backgroundColor: '#1f1f1f',
        color: 'white',
        borderRadius: 8,
        padding: 8,
        marginRight: 8,
    },
    priceButton: {
        width: 50,
        backgroundColor: 'rgb(25, 135, 84)',
        justifyContent: 'center',
    },
    catPrice: {
        fontSize: 16,
        marginBottom: 8,
    },
    clockIcon: {
        color: 'rgb(128, 128, 128)'
    },
    buyButton: {
        marginTop: 12,
        backgroundColor: 'rgb(25, 135, 84)'
    },
    whiteText: {
        color: 'white',
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    starIcon: {
        marginLeft: 2,
        fontSize: 14,
        color: 'white'
    },
    editMenuButton: {
        padding: 8
    },
    creationTime: {
        fontSize: 14,
        color: 'white',
        flexDirection: 'row',
        alignItems: 'center',
    }
});

export default CatMarketCard;