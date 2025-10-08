'use client';

import dynamic from 'next/dynamic';

export const withWeb3 = (Component) => {
  return dynamic(() => Promise.resolve(Component), {
    ssr: false,
  });
};