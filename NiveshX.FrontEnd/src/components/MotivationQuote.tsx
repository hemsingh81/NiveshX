import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

interface MotivationQuoteProps {
     quotes: { text: string; author?: string }[];
     interval?: number;
}

const slideInRight = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0%);
    opacity: 1;
  }
`;

const slideOutLeft = keyframes`
  from {
    transform: translateX(0%);
    opacity: 1;
  }
  to {
    transform: translateX(-100%);
    opacity: 0;
  }
`;

const AnimatedText = styled('div') <{ animateOut: boolean }>`
  animation: ${({ animateOut }) => (animateOut ? slideOutLeft : slideInRight)} 0.6s ease forwards;
`;

const MotivationQuote: React.FC<MotivationQuoteProps> = ({ quotes, interval = 10000 }) => {
     const [index, setIndex] = useState(0);
     const [animateOut, setAnimateOut] = useState(false);

     useEffect(() => {
          const timer = setInterval(() => {
               setAnimateOut(true);
               setTimeout(() => {
                    setIndex(prev => {
                         let next = Math.floor(Math.random() * quotes.length);
                         // Avoid repeating the same quote consecutively
                         return next === prev && quotes.length > 1
                              ? (next + 1) % quotes.length
                              : next;
                    });
                    setAnimateOut(false);
               }, 500);
          }, interval);
          return () => clearInterval(timer);
     }, [quotes.length, interval]);


     const current = quotes[index];

     return (
          <Box
               sx={{
                    width: '100%',
                    px: 0,
                    py: 4,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
               }}
          >
               <Card
                    sx={{
                         width: '100%',
                         borderRadius: 0,
                         background: 'linear-gradient(135deg, #f0f4ff, #ffffff)',
                         boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    }}
               >
                    <CardContent sx={{ textAlign: 'center', minHeight: 120 }}>
                         <AnimatedText animateOut={animateOut}>
                              <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
                                   “{current.text}”
                              </Typography>
                              {current.author && (
                                   <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 2 }}>
                                        — {current.author}
                                   </Typography>
                              )}
                         </AnimatedText>
                    </CardContent>
               </Card>
          </Box>

     );
};

export default MotivationQuote;
