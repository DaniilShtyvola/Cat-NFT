import { FC, useState } from 'react';
import {
   CardWrapper,
   CatName,
   CatPrice,
   GrayText
} from '../CatCard.styled.ts';

import Web3 from "web3";
import { Button, Spinner } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEthereum } from '@fortawesome/free-brands-svg-icons'
import { faCartShopping, faStar, faClock } from '@fortawesome/free-solid-svg-icons'

import CONTRACT_ABI from '../../CatNFT.json';
import config from '../../config.ts';

interface CatMarketCardProps {
   id: number;
   cat: {
      name: string;
      imageUrl: string;
      price: string;
      quality: number;
      isForSale: boolean;
      creationTime: string;
   };
   walletAddress: string;
}

const CatMarketCard: FC<CatMarketCardProps> = ({ cat, id, walletAddress }) => {
   const [isForSale, setIsForSale] = useState(cat.isForSale);
   const [loading, setLoading] = useState(false);

   const web3 = new Web3(config.GANACHE_URL);
   const contract = new web3.eth.Contract(CONTRACT_ABI.abi, config.CONTRACT_ADDRESS);

   const weiToEther = (wei: bigint): number => {
      return Number(wei) / 1e18;
   };

   const priceInEther = weiToEther(BigInt(cat.price));

   const handleBuy = async () => {
      if (!walletAddress) {
         console.error("Wallet address is not available");
         return;
      }

      setLoading(true);

      try {
         const priceInWei = web3.utils.toWei(cat.price, "ether");

         const transaction = contract.methods.buyCat(id);
         const gas = await transaction.estimateGas({
            from: walletAddress,
            value: priceInWei,
         });

         await transaction.send({
            from: walletAddress,
            value: priceInWei,
            gas: gas.toString(),
         });

         setIsForSale(false);
      } catch (error) {
         console.error("Error buying cat:", error);
      } finally {
         setLoading(false);
      }
   };

   return (
      <CardWrapper
         style={{
            border: cat.quality == 1 ? '2px solid rgb(195, 195, 195)' :
               cat.quality == 2 ? '2px solid rgb(14, 209, 69)' :
                  cat.quality == 3 ? '2px solid rgb(63, 72, 204)' :
                     cat.quality == 4 ? '2px solid rgb(184, 61, 186)' :
                        cat.quality == 5 ? '2px solid rgb(255, 205, 24)' : 'none',
         }}
      >
         <img
            className="d-block"
            src={cat.imageUrl}
            alt="Slide 1"
            style={{
               borderRadius: "12px",
               width: '100%',
               maxHeight: '240px',
               objectFit: 'cover'
            }}
         />
         <CatName><GrayText>Name: </GrayText>{cat.name}</CatName>
         <CatPrice><GrayText>Price: </GrayText>{priceInEther} <FontAwesomeIcon icon={faEthereum} /></CatPrice>
         <CatPrice><GrayText><FontAwesomeIcon icon={faClock} /> Minted: </GrayText>{cat.creationTime}</CatPrice>
         <CatPrice>
            <GrayText>Quality: </GrayText>
            {Array.from({ length: Number(cat.quality) }, (_, index) => (
               <FontAwesomeIcon key={index} icon={faStar} style={{ marginLeft: "2px", fontSize: "80%" }} />
            ))}
         </CatPrice>
         <div style={{
            display: "flex",
            justifyContent: "center",
         }}>
            <Button
               variant={isForSale ? "success" : "danger"}
               onClick={handleBuy}
               style={{
                  width: "140px",
                  marginTop: "8px"
               }}
               disabled={loading}
            >
               {loading ? (
                  <Spinner
                     animation="border"
                     style={{ width: "18px", height: "18px" }}
                  />
               ) : (
                  <>
                     <FontAwesomeIcon icon={faCartShopping} /> Buy
                  </>
               )}
            </Button>
         </div>
      </CardWrapper>
   );
};

export default CatMarketCard;
