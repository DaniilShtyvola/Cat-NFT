import { FC, useState, useEffect } from 'react';
import {
   PageWrapper,
   PageContainer
} from '../Page.styled.ts';
import './Cats.css';

import axios from 'axios';
import Web3 from "web3";
import { jwtDecode } from "jwt-decode";

import CONTRACT_ABI from '../../CatNFT.json';
import config from '../../config.ts';

import { Spinner, Pagination, Button, InputGroup, Form, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShuffle, faCheck, faXmark, faArrowDownWideShort, faArrowUpWideShort, faPaw, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'

import CatCard from "../../components/CatCard/CatCard.tsx";

interface CatsPageProps { }

const CatsPage: FC<CatsPageProps> = () => {
   const [pageLoading, setPageLoading] = useState(false);
   const [mintLoading, setMintLoading] = useState(false);

   const [isAdmin, setIsAdmin] = useState(false);

   const [walletAddress, setWalletAddress] = useState<string | null>(null);
   const [cats, setCats] = useState<any[]>([]);
   const [currentPage, setCurrentPage] = useState<number>(1);

   const indexOfLastCat = currentPage * 12;
   const indexOfFirstCat = indexOfLastCat - 12;

   const [message, setMessage] = useState<{ text: string, variant: string } | null>(null);
   const [isFadingOut, setIsFadingOut] = useState(false);

   const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
   const [filter, setFilter] = useState<number>(0);
   const [sortBy, setSortBy] = useState<string>("price");
   const toggleSortOrder = () => {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
   };

   const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

   const pageNumbers: number[] = [];
   for (let i = 1; i <= Math.ceil(cats.length / 12); i++) {
      pageNumbers.push(i);
   }

   useEffect(() => {
      fetchWalletAddress();

      fetchIsAdmin();
   }, []);

   const fetchIsAdmin = async () => {
      const token = localStorage.getItem("token");

      if (token) {
         try {
            const decoded: any = jwtDecode(token);
            const decodedIsAdmin = decoded.isAdmin;

            setIsAdmin(decodedIsAdmin == "true");
         } catch (error) {
            console.error('Error decoding JWT:', error);
         }
      }
   };

   const fetchWalletAddress = async () => {
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
   };

   const fetchCats = async () => {
      setPageLoading(true);
      try {
         const token = localStorage.getItem("token");

         if (token) {
            const decoded: any = jwtDecode(token);
            const WALLET_ADDRESS = decoded.WalletAddress;

            const web3 = new Web3(config.GANACHE_URL);
            const contract = new web3.eth.Contract(CONTRACT_ABI.abi, config.CONTRACT_ADDRESS);

            const catIds: number[] = await contract.methods.getCatsByOwner(WALLET_ADDRESS).call();

            const catsData = await Promise.all(catIds.map(async (catId: number) => {
               const catData = await contract.methods.cats(catId).call();
               return {
                  id: catId,
                  ...catData
               };
            }));

            setCats(catsData);
         }
      } catch (error) {
         console.error('Error fetching cats:', error);
      }
      setPageLoading(false);
   };

   useEffect(() => {
      if (walletAddress) {
         fetchCats();
      }
   }, [walletAddress]);

   const handleCreateCat = async (event: React.FormEvent) => {
      event.preventDefault();

      setMintLoading(true);

      try {
         const response = await axios.get(
            `https://api.thecatapi.com/v1/images/search?api_key=${config.CAT_API_KEY}&has_breeds=true`
         );

         const generatedImageUrl = response.data[0].url;
         const breed = response.data[0].breeds && response.data[0].breeds.length > 0
            ? response.data[0].breeds[0].name
            : "Unknown";
         const temperament = response.data[0].breeds && response.data[0].breeds.length > 0
            ? response.data[0].breeds[0].temperament || "Unknown"
            : "Unknown";

         const temperamentWords = temperament.split(',');
         const randomTemperament = temperamentWords[Math.floor(Math.random() * temperamentWords.length)].trim();
         const formattedTemperament = randomTemperament.charAt(0).toUpperCase() + randomTemperament.slice(1);

         const formattedBreed = breed.includes(" ") ? breed.split(" ")[1] : breed;

         const generatedCatName = `${formattedTemperament} ${formattedBreed}`;

         const web3 = new Web3(config.GANACHE_URL);
         const contract = new web3.eth.Contract(CONTRACT_ABI.abi, config.CONTRACT_ADDRESS);

         const transaction = contract.methods.createCat(generatedImageUrl, generatedCatName);

         if (walletAddress) {
            try {
               const gas = await transaction.estimateGas({
                  from: walletAddress
               });

               await transaction.send({
                  from: walletAddress,
                  gas: gas.toString()
               });
            } catch (error) {
               const errorMessage = (error as Error).message || "An unknown error occurred.";
               setMessage({ text: errorMessage, variant: "danger" });
            }
         } else {
            setMessage({ text: "Wallet address is not available.", variant: "danger" });
         }

         setMessage({ text: "NFT minted successfully!", variant: "success" });

         fetchCats();
      } catch (err) {
         setMessage({ text: "Error during NFT minting.", variant: "danger" });
      } finally {
         setMintLoading(false);
      }
   };

   useEffect(() => {
      const handleCatChanged = async () => {
         fetchCats();
      };

      window.addEventListener('catChanged', handleCatChanged as EventListener);

      return () => {
         window.removeEventListener('catChanged', handleCatChanged as EventListener);
      };
   }, []);

   useEffect(() => {
      const handleNoPrice = async () => {
         setMessage({ text: "Please set the price.", variant: "danger" })
      };

      window.addEventListener('noPriceError', handleNoPrice as EventListener);

      return () => {
         window.removeEventListener('noPriceError', handleNoPrice as EventListener);
      };
   }, []);

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
         if (sortBy === "price") {
            const priceA = Number(a.price);
            const priceB = Number(b.price);
            return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
         } else if (sortBy === "date") {
            const qualityA = Number(a.quality);
            const qualityB = Number(b.quality);
            return sortOrder === "asc" ? qualityA - qualityB : qualityB - qualityA;
         }
         return 0;
      });

   const totalPages = Math.ceil(sortedCats.length / 12);
   const currentCats = sortedCats.slice(indexOfFirstCat, indexOfLastCat);

   return (
      <PageWrapper>
         <PageContainer>
            <div style={{
               display: "flex",
               justifyContent: "space-between",
               marginBottom: "20px"
            }}>
               <InputGroup>
                  <p style={{
                     margin: "4px 12px 0 0",
                     color: "white"
                  }}>
                     Sort by
                  </p>
                  <Form.Select
                     style={{
                        flexGrow: "0",
                        width: "auto",
                        borderTopLeftRadius: "6px",
                        borderBottomLeftRadius: "6px",
                        backgroundColor: "rgb(33, 37, 41)",
                        border: "none",
                        color: "white"
                     }}
                     value={sortBy}
                     onChange={(e) => setSortBy(e.target.value)}
                  >
                     <option value="price">Price</option>
                     <option value="date">Quality</option>
                  </Form.Select>
                  <Button variant="dark" onClick={toggleSortOrder}>
                     <FontAwesomeIcon icon={sortOrder === "asc" ? faArrowUpWideShort : faArrowDownWideShort} />
                  </Button>
                  <Button
                     variant={filter == 0 ? "secondary" : filter == 1 ? "success" : "danger"}
                     onClick={toggleFilter}>
                     <FontAwesomeIcon icon={filter == 0 ? faShuffle : filter == 1 ? faCheck : faXmark} />
                  </Button>
               </InputGroup>
               {isAdmin && (
                  <Button
                     style={{
                        width: "180px"
                     }}
                     variant="dark"
                     type="submit"
                     onClick={handleCreateCat}
                     disabled={!isAdmin}
                  >
                     {mintLoading ? (
                        <Spinner
                           animation="border"
                           style={{ width: "18px", height: "18px" }}
                        />
                     ) : (
                        <><FontAwesomeIcon icon={faPaw} style={{ marginRight: "4px" }} /> Mint NFT</>
                     )}
                  </Button>
               )}
            </div>
            {pageLoading ? (
               <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
                  <Spinner animation="border" style={{ color: "white" }} />
               </div>
            ) : (
               <div>
                  <div className="row">
                     {currentCats.map((cat) => (
                        <div className="col-3" key={`${cat.id}`}>
                           <CatCard cat={cat} walletAddress={walletAddress || ''} />
                        </div>
                     ))}
                  </div>

                  {sortedCats.length > 12 && (
                     <div className="d-flex justify-content-center">
                        <Pagination>
                           {currentPage > 1 && (
                              <Pagination.Prev onClick={() => paginate(currentPage - 1)} />
                           )}

                           {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                              <Pagination.Item
                                 key={number}
                                 active={currentPage === number}
                                 onClick={() => paginate(number)}
                              >
                                 {number}
                              </Pagination.Item>
                           ))}

                           {currentPage < totalPages && (
                              <Pagination.Next onClick={() => paginate(currentPage + 1)} />
                           )}
                        </Pagination>
                     </div>
                  )};
               </div>
            )}
            {message && (
               <Alert
                  style={{
                     opacity: isFadingOut ? 0 : 1,
                     height: isFadingOut ? "10px" : "40px",
                     padding: isFadingOut ? "8px 20px" : "4px 20px",
                     minWidth: "120px",
                     textAlign: "center",
                     marginBottom: 0,
                     overflow: "hidden",
                     transition: "opacity 1s ease-in-out, height 1s ease-in-out, padding 1s ease-in-out",
                     backgroundColor: message.variant == "success" ? "rgb(40, 167, 69)" : "rgb(220, 53, 69)",
                     color: "white",
                     display: "flex",
                     justifyContent: "center",
                     alignItems: "center",
                     border: "rgb(33, 37, 41) 1px solid",
                     marginRight: "64px",
                     position: "fixed",
                     bottom: "20px",
                     left: "20px",
                     zIndex: 9999
                  }}
               >
                  <FontAwesomeIcon style={{ marginRight: "4px" }} icon={message.variant == "success" ? faCheck : faTriangleExclamation} />
                  {message.text}
               </Alert>
            )}
         </PageContainer>
      </PageWrapper>
   );
};

export default CatsPage;
