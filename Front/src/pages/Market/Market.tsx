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
import { faArrowDownWideShort, faArrowUpWideShort } from '@fortawesome/free-solid-svg-icons'

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
      }
   }, []);

   useEffect(() => {
      const fetchMarketplaceCats = async () => {
         setLoading(true);
         try {
            const web3 = new Web3(config.GANACHE_URL);
            const contract = new web3.eth.Contract(CONTRACT_ABI.abi, config.CONTRACT_ADDRESS);

            const catIds: number[] = await contract.methods.getMarketplaceCats().call();

            const catsData = await Promise.all(
               catIds.map(async (catId: number) => {
                  const catData = await contract.methods.cats(catId).call();
                  return { ...catData, id: catId };
               })
            );

            setCats(catsData);
         } catch (error) {
            console.error("Error fetching marketplace cats:", error);
         } finally {
            setLoading(false);
         }
      };

      fetchMarketplaceCats();
   }, []);

   const sortedCats = [...cats].sort((a, b) => {
      if (sortBy === "price") {
         return sortOrder === "asc" ? a.price - b.price : b.price - a.price;
      } else if (sortBy === "date") {
         return sortOrder === "asc" ? a.quality - b.quality : b.quality - a.quality;
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
               <div>
                  <InputGroup className="d-flex align-items-center w-auto">
                     <span className="me-2">Sort by</span>
                     <Form.Select
                        className="w-auto"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                     >
                        <option value="price">Price</option>
                        <option value="date">Quality</option>
                     </Form.Select>
                     <Button variant="primary" onClick={toggleSortOrder}>
                        <FontAwesomeIcon icon={sortOrder === "asc" ? faArrowDownWideShort : faArrowUpWideShort} />
                     </Button>
                  </InputGroup>

                  <div className="row">
                     {currentCats.map((cat, index) => (
                        <div className="col-3" key={`${cat.name}-${index}`}>
                           <CatMarketCard id={index} cat={cat} walletAddress={walletAddress || ""} />
                        </div>
                     ))}
                  </div>

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
               </div>
            )}
         </PageContainer>
      </PageWrapper>
   );
};

export default Market;
