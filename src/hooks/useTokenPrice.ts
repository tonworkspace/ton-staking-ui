import { useState, useEffect } from 'react';

export const useTokenPrice = () => {
  const [price, setPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd'
        );
        const data = await response.json();
        setPrice(data['the-open-network'].usd);
      } catch (error) {
        console.error('Failed to fetch TON price:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrice();
    // Refresh price every 60 seconds
    const interval = setInterval(fetchPrice, 60000);

    return () => clearInterval(interval);
  }, []);

  return { price, isLoading };
}; 