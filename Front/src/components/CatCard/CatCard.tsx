import { FC, useState } from 'react';
import {
   CardWrapper,
   CatName,
   CatPrice,
   GrayText
} from '../CatCard.styled.ts';
import './CatCard.css';

import Web3 from "web3";
import { Button, Spinner, InputGroup, Form } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEthereum } from '@fortawesome/free-brands-svg-icons'
import { faXmark, faCheck, faStar, faClock, faTag } from '@fortawesome/free-solid-svg-icons'

import CONTRACT_ABI from '../../CatNFT.json';
import config from '../../config.ts';

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
   const [newPrice, setNewPrice] = useState<number>(parseFloat(cat.price) / 1e18);

   const [isForSale, setIsForSale] = useState(cat.isForSale);
   const [loading, setLoading] = useState(false);

   const web3 = new Web3(config.GANACHE_URL);
   const contract = new web3.eth.Contract(CONTRACT_ABI.abi, config.CONTRACT_ADDRESS);

   const toggleSaleStatus = async () => {
      if (!walletAddress) {
         console.error("Wallet address not found!");
         return;
      }

      try {
         setLoading(true);

         if (newPrice == 0) {
            const event = new CustomEvent('noPriceError', {});
            window.dispatchEvent(event);

            return;
         }

         if (!isForSale) {
            await contract.methods.listForSale(cat.id, cat.price).send({ from: walletAddress });
         } else {
            await contract.methods.delist(cat.id).send({ from: walletAddress });
         }

         setIsForSale(!isForSale);

         const event = new CustomEvent('catChanged', {});
         window.dispatchEvent(event);
      } catch (error) {
         console.error("Transaction error:", error);
      } finally {
         setLoading(false);
      }
   };

   const toggleEditPrice = async () => {
      setEditPrice(!editPrice);
   };

   const handleNewPrice = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      const parsedValue = parseFloat(value);
      if (!isNaN(parsedValue)) {
         setNewPrice(parsedValue);
      }
   };

   const handlePriceChange = async () => {
      if (!walletAddress) {
         console.error("Wallet address not found!");
         return;
      }

      if (newPrice <= 0) {
         console.error("Price must be greater than zero!");
         return;
      }

      try {
         setLoading(true);

         const priceInWei = web3.utils.toWei(newPrice.toString(), "ether");

         await contract.methods.updatePrice(cat.id, priceInWei).send({ from: walletAddress });

         setEditPrice(false);

         const event = new CustomEvent('catChanged', {});
         window.dispatchEvent(event);
      } catch (error) {
         console.error("Error updating price:", error);
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
         <CatName style={{ marginBottom: "0" }}><GrayText>Name: </GrayText>{cat.name}</CatName>
         {editPrice ? (
            <div style={{
               display: "flex",
               marginBottom: "8px"
            }}>
               <InputGroup>
                  <InputGroup.Text style={{
                     backgroundColor: "rgb(23, 25, 27)",
                     border: "0",
                     color: "white",
                     borderRight: "rgb(33, 37, 41) 3px solid"
                  }}>
                     <FontAwesomeIcon icon={faEthereum} />
                  </InputGroup.Text>
                  <Form.Control style={{
                     backgroundColor: "rgb(23, 25, 27)",
                     border: "0",
                     color: "white",
                     flex: "1"
                  }}
                     aria-label="Amount"
                     type="number"
                     value={newPrice}
                     onChange={handleNewPrice}
                     min={0}
                     step="0.000001"
                  />
               </InputGroup>
               <Button
                  variant={"success"}
                  onClick={handlePriceChange}
                  style={{
                     marginLeft: "12px"
                  }}
                  disabled={loading}
               >
                  {loading ? (
                     <Spinner
                        animation="border"
                        style={{ width: "18px", height: "18px" }}
                     />
                  ) : (
                     <><FontAwesomeIcon icon={faCheck} /></>
                  )}
               </Button>
            </div>
         ) : (
            <CatPrice>
               {newPrice == 0 ? <GrayText>No price yet</GrayText> :
                  <>
                     <GrayText>Price: </GrayText> {newPrice} <FontAwesomeIcon icon={faEthereum} />
                  </>
               }
            </CatPrice>
         )}
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
               variant={editPrice ? "secondary" : isForSale ? "success" : "danger"}
               onClick={toggleSaleStatus}
               style={{
                  width: "190px",
                  marginTop: "8px"
               }}
               disabled={loading || editPrice}
            >
               {loading ? (
                  <Spinner
                     animation="border"
                     style={{ width: "18px", height: "18px" }}
                  />
               ) : (
                  isForSale ? <><FontAwesomeIcon icon={faCheck} /> On sale</> :
                     <><FontAwesomeIcon icon={faXmark} /> Not on sale</>
               )}
            </Button>
            <Button
               variant={editPrice ? "success" : "secondary"}
               onClick={toggleEditPrice}
               style={{
                  marginTop: "8px",
                  marginLeft: "12px"
               }}
               disabled={loading}
            >
               <><FontAwesomeIcon icon={faTag} /></>
            </Button>
         </div>
      </CardWrapper>
   );
};

export default CatCard;
