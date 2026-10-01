import { createContext } from 'react';

import { type LiquidFinish } from '../../liquid/finish';

export const FinishContext = createContext<LiquidFinish>('glossy');
