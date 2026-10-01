import { createContext, useContext } from 'react';
import { type PreviewCopy } from './data/copyTypes';
import { PREVIEW_COPY } from './data/copy';

export const CopyContext = createContext<PreviewCopy>(PREVIEW_COPY.en);

export const useCopy = (): PreviewCopy => useContext(CopyContext);
