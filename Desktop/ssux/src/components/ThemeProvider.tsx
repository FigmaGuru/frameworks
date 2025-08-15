import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
type Product = 'Core' | 'Quant' | 'Expressive';

interface ThemeContextType {
  theme: Theme;
  product: Product;
  setTheme: (theme: Theme) => void;
  setProduct: (product: Product) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [product, setProduct] = useState<Product>('Core');

  useEffect(() => {
    // Apply theme and product to HTML element
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-product', product);
  }, [theme, product]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value: ThemeContextType = {
    theme,
    product,
    setTheme,
    setProduct,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
