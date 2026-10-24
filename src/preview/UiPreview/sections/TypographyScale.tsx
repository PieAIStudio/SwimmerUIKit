import { type ReactNode } from 'react';
import { useCopy } from '../context';

export function TypographyScale(): ReactNode {
  const { type } = useCopy();
  return (
    <div className="game-ui-type-scale">
      <p className="game-ui-type-kicker">{type.kicker}</p>
      <h1>{type.h1}</h1>
      <h2>{type.h2}</h2>
      <p>{type.body}</p>
      <small>{type.small}</small>
    </div>
  );
}
