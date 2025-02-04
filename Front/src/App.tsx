import { FC } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Header from './components/elements/PageHeader/PageHeader.tsx';
import LoginPage from './pages/LoginPage/LoginPage.tsx';
import MintPage from './pages/MintPage/MintPage.tsx';
import RegisterPage from './pages/RegisterPage/RegisterPage.tsx';
import CatsPage from './pages/CatsPage/CatsPage.tsx';

interface AppProps {}

const App: FC<AppProps> = () => {
   return (
      <BrowserRouter>
         <Header />
         <main>
            <Routes>
               <Route path="/" element={<></>} />
               <Route path="/mint" element={<MintPage />} />
               <Route path="/login" element={<LoginPage />} />
               <Route path="/register" element={<RegisterPage />} />
               <Route path="/cats" element={<CatsPage />} />
            </Routes>
         </main>
      </BrowserRouter>
   );
};

export default App;