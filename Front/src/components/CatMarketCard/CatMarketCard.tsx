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
import { GANACHE_URL, CONTRACT_ADDRESS } from '../../config.ts';

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
         const event = new CustomEvent('notLoggedIn', {});
         window.dispatchEvent(event);

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

         const event = new CustomEvent('catBought', {});
         window.dispatchEvent(event);
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
         <CatName style={{marginBottom: "0"}}><GrayText>Name: </GrayText>{cat.name}</CatName>
         <CatPrice><GrayText>Price: </GrayText>{priceInEther} <FontAwesomeIcon icon={faEthereum} /></CatPrice>
         <CatPrice style={{ fontSize: "90%", marginBottom: "0" }}><GrayText><FontAwesomeIcon style={{ margin: "0 2px 1px 0 " }} icon={faClock} />  </GrayText>{new Date(Number(cat.creationTime) * 1000).toLocaleString()}</CatPrice>
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
                  flex: "1",
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
