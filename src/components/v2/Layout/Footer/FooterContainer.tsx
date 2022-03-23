import React from 'react';
import { useBlock } from 'hooks/useBlock';
import { Footer } from './Footer';

export const ConnectedFooter = () => {
  const currentBlockNumber = useBlock();
  return <Footer currentBlockNumber={currentBlockNumber} />;
};
