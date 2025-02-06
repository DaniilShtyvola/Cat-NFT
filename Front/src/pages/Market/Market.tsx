import { FC, useState, useEffect } from 'react';
import {
   PageWrapper,
   PageContainer
} from '../Page.styled.ts';

import Web3 from "web3";
import { jwtDecode } from "jwt-decode";

import CONTRACT_ABI from '../../CatNFT.json';
import config from '../../config.ts';

import { Spinner, Pagination, Button, Form, InputGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowDownWideShort, faArrowUpWideShort, faRotate, faFaceSadTear } from '@fortawesome/free-solid-svg-icons'

import CatMarketCard from "../../components/CatMarketCard/CatMarketCard.tsx";

interface MarketProps { }

const Market: FC<MarketProps> = () => {
   const [loading, setLoading] = useState(false);
   const [walletAddress, setWalletAddress] = useState<string | null>(null);
   const [cats, setCats] = useState<any[]>([]);
   const [currentPage, setCurrentPage] = useState<number>(1);

   const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
   const [sortBy, setSortBy] = useState<string>("price");
   const toggleSortOrder = () => {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
   };

   const indexOfLastCat = currentPage * 12;
   const indexOfFirstCat = indexOfLastCat - 12;

   const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

   const pageNumbers: number[] = [];
   for (let i = 1; i <= Math.ceil(cats.length / 12); i++) {
      pageNumbers.push(i);
   }

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
      } else {
         setWalletAddress(null);
      }
   }, []);

   const fetchMarketplaceCats = async () => {
      setLoading(true);
      try {
         const token = localStorage.getItem("token");
         const web3 = new Web3(config.GANACHE_URL);
         const contract = new web3.eth.Contract(CONTRACT_ABI.abi, config.CONTRACT_ADDRESS);

         let catIds;

         if (token) {
            const decoded: any = jwtDecode(token);
            const WALLET_ADDRESS = decoded.WalletAddress;

            catIds = await contract.methods.getMarketplaceCats(WALLET_ADDRESS).call();
         } else {
            catIds = await contract.methods.getMarketplaceCats("0x0000000000000000000000000000000000000000").call();
         }

         if (Array.isArray(catIds) && catIds.length > 0) {
            const catsData = await Promise.all(catIds.map(async (catId: number) => {
               const catData = await contract.methods.cats(catId).call();
               return {
                  id: catId,
                  ...catData
               };
            }));

            setCats(catsData);
         } else {
            setCats([]);
         }
      } catch (error) {
         console.error("Error fetching marketplace cats:", error);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      const handleCatChanged = async () => {
         fetchMarketplaceCats();
      };

      window.addEventListener('catBought', handleCatChanged as EventListener);

      return () => {
         window.removeEventListener('catBought', handleCatChanged as EventListener);
      };
   }, []);

   useEffect(() => {
      fetchMarketplaceCats();
   }, []);

   const sortedCats = [...cats]
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
            {loading ? (
               <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
                  <Spinner animation="border" style={{ color: "white" }} />
               </div>
            ) : (
               sortedCats.length > 0 ? (
                  <div>
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
                        </InputGroup>
                        <Button variant="dark" onClick={fetchMarketplaceCats}>
                           <FontAwesomeIcon icon={faRotate} />
                        </Button>
                     </div>

                     <div className="row">
                        {currentCats.map((cat) => (
                           <div className="col-3" key={`${cat.id}`}>
                              <CatMarketCard cat={cat} walletAddress={walletAddress || ''} />
                           </div>
                        ))}
                     </div>

                     {totalPages > 1 && (
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
               ) : (
                  <div style={{
                     display: "flex",
                     justifyContent: "center",
                     color: "white",
                     fontSize: "140%",
                     marginTop: "64px"
                  }}>
                     <FontAwesomeIcon style={{ margin: "7px 7px" }} icon={faFaceSadTear} /> No cats available for sale
                  </div>
               )
            )}
         </PageContainer>
      </PageWrapper>
   );
};

export default Market;
