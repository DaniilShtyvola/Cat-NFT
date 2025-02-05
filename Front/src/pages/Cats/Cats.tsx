import { FC, useState, useEffect } from 'react';
import {
   PageWrapper,
   PageContainer
} from '../Page.styled.ts';

import Web3 from "web3";
import { jwtDecode } from "jwt-decode";

import CONTRACT_ABI from '../../CatNFT.json';
import config from '../../config.ts';

import { Spinner, Pagination } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import CatCard from "../../components/CatCard/CatCard.tsx";

interface CatsPageProps { }

const CatsPage: FC<CatsPageProps> = () => {
   const [loading, setLoading] = useState(false);
   const [walletAddress, setWalletAddress] = useState<string | null>(null);
   const [cats, setCats] = useState<any[]>([]);
   const [currentPage, setCurrentPage] = useState<number>(1);

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
      if (walletAddress) {
         const fetchCats = async () => {
            setLoading(true);
            try {
               const web3 = new Web3(config.GANACHE_URL);
               const contract = new web3.eth.Contract(CONTRACT_ABI.abi, config.CONTRACT_ADDRESS);

               const catIds: number[] = await contract.methods.getCatsByOwner(walletAddress).call();

               const catsData = await Promise.all(catIds.map(async (catId: number) => {
                  const catData = await contract.methods.cats(catId).call();
                  return catData;
               }));

               console.log(catsData);

               setCats(catsData);
            } catch (error) {
               console.error('Error fetching cats:', error);
            }
            setLoading(false);
         };

         fetchCats();
      }
   }, [walletAddress]);

   return (
      <PageWrapper>
         <PageContainer>
            {loading ? (
               <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
                  <Spinner animation="border" style={{ color: "white" }} />
               </div>
            ) : (
               <div>
                  <div className="row">
                     {cats.slice(indexOfFirstCat, indexOfLastCat).map((cat, index) => (
                        <div className="col-3" key={`${cat.name}-${index}`}>
                           <CatCard id={index} cat={cat} walletAddress={walletAddress || ''} />
                        </div>
                     ))}
                  </div>

                  <div className="d-flex justify-content-center">
                     <Pagination>
                        {currentPage > 1 && (
                           <Pagination.Prev onClick={() => paginate(currentPage - 1)} />
                        )}

                        {pageNumbers.map((number) => (
                           <Pagination.Item
                              key={number}
                              active={currentPage === number}
                              onClick={() => paginate(number)}
                           >
                              {number}
                           </Pagination.Item>
                        ))}

                        {currentPage < pageNumbers.length && (
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

export default CatsPage;
