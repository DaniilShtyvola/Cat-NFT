import { FC, useState } from 'react';
import {
   CardWrapper,
   CatName,
   CatPrice,
   GrayText
} from './CatCard.styled.ts';

import Web3 from "web3";
import { Button } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEthereum } from '@fortawesome/free-brands-svg-icons'
import { faXmark, faCheck, faStar } from '@fortawesome/free-solid-svg-icons'

import CONTRACT_ABI from '../../../CatNFT.json';
import config from '../../../config.ts';

interface CatCardProps {
   id: number;
   cat: {
      name: string;
      imageUrl: string;
      price: string;
      quality: number;
      isForSale: boolean;
   };
   walletAddress: string;
}

const CatCard: FC<CatCardProps> = ({ cat, id, walletAddress }) => {
   const [isForSale, setIsForSale] = useState(cat.isForSale);
   const [loading, setLoading] = useState(false);

   const web3 = new Web3(config.GANACHE_URL);
   const contract = new web3.eth.Contract(CONTRACT_ABI.abi, config.CONTRACT_ADDRESS);

   const weiToEther = (wei: bigint): number => {
      return Number(wei) / 1e18;
   };

   const priceInEther = weiToEther(BigInt(cat.price));

   const toggleSaleStatus = async () => {
      if (!walletAddress) {
         console.error("Wallet address not found!");
         return;
      }

      try {
         setLoading(true);

         if (!isForSale) {
            await contract.methods.listForSale(id, cat.price).send({ from: walletAddress });
         } else {
            await contract.methods.delist(id).send({ from: walletAddress });
         }

         setIsForSale(!isForSale);
      } catch (error) {
         console.error("Transaction error:", error);
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
               onClick={toggleSaleStatus}
               style={{
                  width: "140px",
                  marginTop: "8px"
               }}
               disabled={loading}
            >
               {loading ? "Processing..." :
                  isForSale ? <><FontAwesomeIcon icon={faCheck} /> On sale</> :
                     <><FontAwesomeIcon icon={faXmark} /> Not on sale</>}
            </Button>
         </div>
      </CardWrapper>
   );
};

export default CatCard;
