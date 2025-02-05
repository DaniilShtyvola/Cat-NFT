import { FC } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Header from './components/PageHeader/PageHeader.tsx';
import Login from './pages/Login/Login.tsx';
import Register from './pages/Register/Register.tsx';
import Cats from './pages/Cats/Cats.tsx';
import Market from './pages/Market/Market.tsx'

interface AppProps {}

const App: FC<AppProps> = () => {
   return (
      <BrowserRouter>
         <Header />
         <main>
            <Routes>
               <Route path="/" element={<Market />} />
               <Route path="/login" element={<Login />} />
               <Route path="/register" element={<Register />} />
               <Route path="/cats" element={<Cats />} />
            </Routes>
         </main>
      </BrowserRouter>
   );
};

export default App;