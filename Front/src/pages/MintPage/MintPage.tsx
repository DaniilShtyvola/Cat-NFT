import { useState, useEffect } from "react";
import {
   PageWrapper,
   PageContainer
} from '../Page.styled.ts';

import Web3 from "web3";
import { jwtDecode } from "jwt-decode";

import CONTRACT_ABI from '../../CatNFT.json';
import config from '../../config.ts';

import { Spinner, Form, Button, Alert } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

const CreateCatNFT = () => {
   const [walletAddress, setWalletAddress] = useState<string | null>(null);

   const [imageUrl, setImageUrl] = useState("");
   const [name, setName] = useState("");
   const [price, setPrice] = useState("");

   const [loading, setLoading] = useState(false);
   const [message, setMessage] = useState<{ text: string, variant: string } | null>(null);
   const [isFadingOut, setIsFadingOut] = useState(false);

   useEffect(() => {
      const token = localStorage.getItem("token");

      if (token) {
         try {
            const decoded: any = jwtDecode(token);
            const WALLET_ADDRESS = decoded.WalletAddress;

            setWalletAddress(WALLET_ADDRESS);
         } catch (error) {
            console.error('Error decoding JWT:', error);
         }
      }
   }, []);

   const handleCreateCat = async (event: React.FormEvent) => {
      event.preventDefault();

      setLoading(true);

      if (!imageUrl || !name || !price) {
         setMessage({ text: "Please fill in all fields.", variant: "danger" });
         return;
      }

      try {
         const web3 = new Web3(config.GANACHE_URL);

         const contract = new web3.eth.Contract(CONTRACT_ABI.abi, config.CONTRACT_ADDRESS);

         const transaction = contract.methods.createCat(imageUrl, name, web3.utils.toWei(price, "ether"));

         if (walletAddress) {
            const gas = await transaction.estimateGas({ from: walletAddress });
            await transaction.send({
               from: walletAddress,
               gas: gas.toString(),
            });
         } else {
            console.error('Wallet address is not available');
         }

         console.log("Created succesfully");
      } catch (err) {
         setMessage({ text: "Error during NFT minting.", variant: "danger" });
         console.error("Error during NFT minting:", err);
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

   return (
      <PageWrapper>
         <PageContainer style={{ display: "flex", justifyContent: "center" }}>
            {loading ? (
               <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
                  <Spinner animation="border" style={{ color: "white" }} />
               </div>
            ) : (
               <Form onSubmit={handleCreateCat} style={{ width: "300px" }}>
                  <Form.Group controlId="formImageUrl" className="mb-3">
                     <Form.Control
                        className='FormPlaceholder'
                        style={{
                           backgroundColor: "rgb(33, 37, 41)",
                           color: "white",
                           border: "none"
                        }}
                        type="text"
                        placeholder="Enter image url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        required
                     />
                  </Form.Group>
                  <Form.Group controlId="formName" className="mb-3">
                     <Form.Control
                        className='FormPlaceholder'
                        style={{
                           backgroundColor: "rgb(33, 37, 41)",
                           color: "white",
                           border: "none"
                        }}
                        type="text"
                        placeholder="Enter name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                     />
                  </Form.Group>
                  <Form.Group controlId="formPrice" className="mb-3">
                     <Form.Control
                        className='FormPlaceholder'
                        style={{
                           backgroundColor: "rgb(33, 37, 41)",
                           color: "white",
                           border: "none"
                        }}
                        type="text"
                        placeholder="Enter price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                     />
                  </Form.Group>
                  <Button className="w-100" variant="dark" type="submit">
                     Mint NFT
                  </Button>
                  {message && (
                     <Alert
                        style={{
                           opacity: isFadingOut ? 0 : 1,
                           height: isFadingOut ? 0 : "42px",
                           padding: isFadingOut ? 0 : '8px',
                           textAlign: "center",
                           marginBottom: 0,
                           overflow: "hidden",
                           transition: "opacity 1s ease-in-out, height 1s ease-in-out, padding 1s ease-in-out",
                           backgroundColor: message.variant == "success" ? "rgb(40, 167, 69)" : "rgb(220, 53, 69)",
                           color: "white",
                           border: "rgb(33, 37, 41) 1px solid",
                        }}
                     >
                        {message.text}
                     </Alert>
                  )}
               </Form>
            )};
         </PageContainer>
      </PageWrapper>
   );
};

export default CreateCatNFT;