import React, { FC, useState, useEffect } from 'react';
import {
   PageWrapper,
   PageContainer
} from '../Page.styled.ts';
import './Register.css';

import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { Form, Button, Alert } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

import { API_URL } from '../../config.ts';

interface RegisterPageProps { }

const RegisterPage: FC<RegisterPageProps> = () => {
   const navigate = useNavigate();

   const [username, setUsername] = useState("");
   const [password, setPassword] = useState("");
   const [email, setEmail] = useState("");
   const [wallet, setWallet] = useState("");

   const [message, setMessage] = useState<{ text: string, variant: string } | null>(null);
   const [isFadingOut, setIsFadingOut] = useState(false);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      try {
         await axios.post(`${API_URL}/Auth/register-user`, {
            userName: username,
            email: email,
            password: password,
            walletAddress: wallet
         });

         setMessage({ text: "Successfully registered!", variant: "success" });

         navigate('/login');
      } catch (error) {
         setMessage({ text: "Registration failed.", variant: "danger" });
         console.error("Error during registration:", error);
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
            <Form onSubmit={handleSubmit} style={{ width: "300px" }}>
               <Form.Group controlId="formUsername" className="mb-3">
                  <Form.Control
                     className='FormPlaceholder'
                     style={{
                        backgroundColor: "rgb(33, 37, 41)",
                        color: "white",
                        border: "none"
                     }}
                     type="text"
                     placeholder="Enter username"
                     value={username}
                     onChange={(e) => setUsername(e.target.value)}
                     required
                  />
               </Form.Group>
               <Form.Group controlId="formPassword" className="mb-3">
                  <Form.Control
                     className='FormPlaceholder'
                     style={{
                        backgroundColor: "rgb(33, 37, 41)",
                        color: "white",
                        border: "none"
                     }}
                     type="password"
                     placeholder="Enter password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     required
                  />
               </Form.Group>
               <Form.Group controlId="formEmail" className="mb-3">
                  <Form.Control
                     className='FormPlaceholder'
                     style={{
                        backgroundColor: "rgb(33, 37, 41)",
                        color: "white",
                        border: "none"
                     }}
                     type="email"
                     placeholder="Enter email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     required
                  />
               </Form.Group>
               <Form.Group controlId="formWallet" className="mb-3">
                  <Form.Control
                     className='FormPlaceholder'
                     style={{
                        backgroundColor: "rgb(33, 37, 41)",
                        color: "white",
                        border: "none"
                     }}
                     type="wallet"
                     placeholder="Enter wallet address"
                     value={wallet}
                     onChange={(e) => setWallet(e.target.value)}
                     required
                  />
               </Form.Group>
               <Button className="w-100" variant="dark" type="submit">
                  Create an account
               </Button>
               {message && (
                  <Alert
                     style={{
                        opacity: isFadingOut ? 0 : 1,
                        height: isFadingOut ? 0 : "42px",
                        padding: isFadingOut ? 0 : '8px',
                        marginTop: "16px",
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
         </PageContainer>
      </PageWrapper>
   );
};

export default RegisterPage;
