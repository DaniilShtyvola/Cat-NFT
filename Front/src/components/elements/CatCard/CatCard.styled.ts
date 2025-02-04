import styled from 'styled-components';

export const CardWrapper = styled.div`
width: 272px;
background-color: rgb(33, 37, 41);
padding: 12px;
border-radius: 12px;
margin-bottom: 14px;
display: flex;
flex-direction: column;
color: white;
`;

export const CatName = styled.p`
margin-bottom: 4px;
font-weight: bold;
font-size: 120%;
margin-top: 8px;
`;

export const CatStatus = styled.p`
color: lightgray;
font-size: 80%;
`;

export const CatPrice = styled.p`
font-size: 110%;
margin-bottom: 4px;
`;

export const GrayText = styled.span`
font-size: 12px;
font-weight: 400;
color: gray;
`;