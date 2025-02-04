import React, { FC, useState } from 'react';
import {
   PageWrapper,
   PageContainer
} from '../Page.styled.ts';
import './MainPage.css';

import { Spinner, Form, Pagination } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import CatCard from "../../components/elements/CatCard/CatCard.tsx";

interface MainPageProps { }

const MainPage: FC<MainPageProps> = () => {
   const [loading, setLoading] = useState(false);

   const [currentPage, setCurrentPage] = useState<number>(1);

   const indexOfLastCat = currentPage * 12;
   const indexOfFirstCat = indexOfLastCat - 12;

   const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

   const pageNumbers: number[] = [];
   for (let i = 1; i <= Math.ceil(cats.length / 12); i++) {
      pageNumbers.push(i);
   }

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
                     {cats.map((cat) => (
                        <div className="col-3" key={cat.id}>
                           <CatCard cat={cat} />
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
      </PageWrapper >
   );
};

export default MainPage;