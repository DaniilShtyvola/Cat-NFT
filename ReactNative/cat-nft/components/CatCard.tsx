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

import Web3 from 'web3';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEthereum } from '@fortawesome/free-brands-svg-icons';
import {
    faXmark,
    faCheck,
    faStar,
    faClock,
    faTag,
    faFire,
    faAngleUp,
    faAngleDown,
} from '@fortawesome/free-solid-svg-icons';

import { emitShowMessage, emitCatPriceChanged, emitCatBurned } from '../events';
import CONTRACT_ABI from '../contracts/CatNFT.json';
import { GANACHE_URL, CONTRACT_ADDRESS } from '../config';

interface CatCardProps {
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

const CatCard: FC<CatCardProps> = ({ cat, walletAddress }) => {
    const [editPrice, setEditPrice] = useState(false);
    const [newPrice, setNewPrice] = useState<string>(
        (parseFloat(cat.price) / 1e18).toString(),
    );
    const [isForSale, setIsForSale] = useState(cat.isForSale);
    const [loading, setLoading] = useState(false);
    const [editMenu, setEditMenu] = useState(false);

    const web3 = new Web3(GANACHE_URL);
    const contract = new web3.eth.Contract(CONTRACT_ABI.abi, CONTRACT_ADDRESS);

    const toggleSaleStatus = async () => {
        if (!walletAddress) {
            console.error('Wallet address not found!');
            return;
        }

        try {
            setLoading(true);

            const parsedPrice = parseFloat(newPrice);
            if (parsedPrice == 0) {
                emitShowMessage('First you need to set a price.', 'danger');
                return;
            }

            if (!isForSale) {
                await contract.methods
                    .listForSale(cat.id, cat.price)
                    .send({ from: walletAddress });
            } else {
                await contract.methods
                    .delist(cat.id)
                    .send({ from: walletAddress });
            }

            setIsForSale(!isForSale);
        } catch (error) {
            console.error('Transaction error:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleEditPrice = () => {
        setEditPrice(!editPrice);
    };

    const handleNewPrice = (value: string) => {
        setNewPrice(value);
    };

    const handlePriceChange = async () => {
        if (!walletAddress) {
            console.error('Wallet address not found!');
            return;
        }

        const parsedPrice = parseFloat(newPrice);
        if (parsedPrice <= 0 || isNaN(parsedPrice)) {
            emitShowMessage('Price must be greater than zero!', 'danger');
            return;
        }

        try {
            setLoading(true);

            const priceInWei = web3.utils.toWei(newPrice, 'ether');

            await contract.methods
                .updatePrice(cat.id, priceInWei)
                .send({ from: walletAddress });

            setEditPrice(false);

            emitCatPriceChanged();
        } catch (error) {
            console.error('Error updating price:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditMenu = () => {
        setEditMenu(!editMenu);
    };

    const handleBurn = async () => {
        try {
            setLoading(true);

            const gasEstimate: bigint = await contract.methods
                .burnCat(cat.id)
                .estimateGas({ from: walletAddress });

            const gasWithBuffer: bigint =
                (gasEstimate * BigInt(120)) / BigInt(100);

            await contract.methods.burnCat(cat.id).send({
                from: walletAddress,
                gas: gasWithBuffer.toString(),
            });

            emitCatBurned();
        } catch (error) {
            console.error('Error burning cat:', error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <Card
            style={[
                styles.card,
                { borderColor: getBorderColor(Number(cat.quality)) },
            ]}
        >
            <Image source={{ uri: cat.imageUrl }} style={styles.image} />
            <Card.Content>
                <Text style={styles.catName}>
                    <Text style={styles.grayText}>Name: </Text>
                    {cat.name}
                </Text>
                {editPrice ? (
                    <View style={styles.priceInputContainer}>
                        <TextInput
                            style={styles.priceInput}
                            value={newPrice}
                            onChangeText={handleNewPrice}
                            keyboardType="numeric"
                            placeholder="Price"
                            placeholderTextColor="rgba(255, 255, 255, 0.543)"
                        />
                        <Button
                            mode="contained"
                            onPress={handlePriceChange}
                            disabled={loading}
                            style={styles.priceButton}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <FontAwesomeIcon
                                    icon={faCheck}
                                    size={24}
                                    style={styles.confirmIcon}
                                />
                            )}
                        </Button>
                    </View>
                ) : (
                    <Text style={styles.catPrice}>
                        {newPrice === '0' || newPrice === '' ? (
                            <Text style={styles.grayText}>No price yet</Text>
                        ) : (
                            <>
                                <Text style={styles.grayText}>Price: </Text>
                                <Text style={styles.whiteText}>{newPrice}</Text>
                                <FontAwesomeIcon
                                    icon={faEthereum}
                                    color="white"
                                />
                            </>
                        )}
                    </Text>
                )}
                <Text style={styles.catPrice}>
                    <Text style={styles.grayText}>Quality: </Text>
                    {Array.from({ length: Number(cat.quality) }, (_, index) => (
                        <View key={index}>
                            <FontAwesomeIcon
                                icon={faStar}
                                style={styles.starIcon}
                            />
                        </View>
                    ))}
                </Text>
                <View style={styles.timeContainer}>
                    <Text style={styles.creationTime}>
                        <FontAwesomeIcon
                            icon={faClock}
                            style={styles.clockIcon}
                        />
                        {'  '}
                        {new Date(
                            Number(cat.creationTime) * 1000,
                        ).toLocaleString()}
                    </Text>
                    <TouchableOpacity
                        onPress={handleEditMenu}
                        style={styles.editMenuButton}
                    >
                        <FontAwesomeIcon
                            style={styles.editMenuIcon}
                            icon={editMenu ? faAngleUp : faAngleDown}
                        />
                    </TouchableOpacity>
                </View>
                {editMenu && (
                    <View style={styles.editMenu}>
                        <Button
                            mode="contained"
                            onPress={toggleSaleStatus}
                            disabled={loading || editPrice}
                            style={[
                                styles.saleButton,
                                {
                                    backgroundColor: isForSale
                                        ? 'rgb(25, 135, 84)'
                                        : 'rgb(220, 53, 69)',
                                },
                            ]}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="black" />
                            ) : isForSale ? (
                                <>
                                    <FontAwesomeIcon
                                        style={styles.saleIcon}
                                        icon={faCheck}
                                        size={24}
                                    />{' '}
                                    On sale
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon
                                        style={styles.saleIcon}
                                        icon={faXmark}
                                        size={24}
                                    />{' '}
                                    Not on sale
                                </>
                            )}
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleBurn}
                            disabled={loading}
                            style={styles.burnButton}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="black" />
                            ) : (
                                <FontAwesomeIcon icon={faFire} size={24} />
                            )}
                        </Button>
                        <Button
                            mode="contained"
                            onPress={toggleEditPrice}
                            disabled={loading}
                            style={[
                                styles.editPriceButton,
                                {
                                    backgroundColor: editPrice
                                        ? 'rgb(25, 135, 84)'
                                        : 'rgb(108, 117, 125)',
                                },
                            ]}
                        >
                            <FontAwesomeIcon
                                style={styles.editPriceIcon}
                                size={24}
                                icon={faTag}
                            />
                        </Button>
                    </View>
                )}
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
        color: 'white',
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
        color: 'white',
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
    whiteText: {
        color: 'white',
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    starIcon: {
        marginLeft: 2,
        fontSize: 14,
        color: 'white',
    },
    editMenuButton: {
        padding: 8,
    },
    creationTime: {
        fontSize: 14,
        color: 'white',
        flexDirection: 'row',
        alignItems: 'center',
    },
    clockIcon: {
        color: 'rgb(128, 128, 128)',
    },
    editMenu: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    burnButton: {
        width: 20,
        backgroundColor: 'rgb(255, 193, 7)',
        marginRight: 8,
    },
    saleButton: {
        flex: 1,
        marginRight: 8,
        backgroundColor: 'rgb(220, 53, 69)',
    },
    confirmIcon: {
        color: 'white',
    },
    editPriceButton: {
        width: 20,
        backgroundColor: 'rgb(108, 117, 125)',
    },
    editPriceIcon: {
        color: 'white',
    },
    saleIcon: {
        color: 'white',
    },
});

export default CatCard;
