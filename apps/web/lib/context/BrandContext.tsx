import { createContext, useContext } from 'react';
import { brandAccent } from '@/lib/utils/brandHue';

const BrandContext = createContext(brandAccent(195)); // default cyan
export const useBrandContext = () => useContext(BrandContext);
