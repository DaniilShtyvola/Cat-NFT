import { FC } from 'react';
import {
   CardWrapper,
   CatName,
   CatPrice
} from './CatCard.styled.ts';
import "./CatCard.css";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEthereum } from '@fortawesome/free-brands-svg-icons'

import 'bootstrap/dist/css/bootstrap.min.css';

interface CatCardProps {
   cat: {
      id: number;
      name: string;
      imageUrl: string;
      price: string;
      quality: number;
   };
}

const CatCard: FC<CatCardProps> = ({ cat }) => {
   const weiToEther = (wei: bigint): number => {
      return Number(wei) / 1e18;
   };

   const priceInEther = weiToEther(BigInt(cat.price));

   return (
      <CardWrapper style={{
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
         <CatName>{cat.name}</CatName>
         <CatPrice>{priceInEther} ETH <FontAwesomeIcon icon={faEthereum} /></CatPrice>
      </CardWrapper>
   );
};

export default CatCard;
