import { FC } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Header from './components/PageHeader/PageHeader.tsx';
import Login from './pages/Login/Login.tsx';
import Mint from './pages/Mint/Mint.tsx';
import Register from './pages/Register/Register.tsx';
import Cats from './pages/CatsPage/Cats.ts';

interface AppProps {}

const App: FC<AppProps> = () => {
   return (
      <BrowserRouter>
         <Header />
         <main>
            <Routes>
               <Route path="/" element={<></>} />
               <Route path="/mint" element={<Mint />} />
               <Route path="/login" element={<Login />} />
               <Route path="/register" element={<Register />} />
               <Route path="/cats" element={<Cats />} />
            </Routes>
         </main>
      </BrowserRouter>
   );
};

export default App;