import { type InputHTMLAttributes, type ReactNode } from 'react';

export interface GameSliderProps extends Pick<
  InputHTMLAttributes<HTMLInputElement>,
  'max' | 'min' | 'value' | 'step' | 'disabled' | 'name' | 'id'
> {
  label: string;
  onChange?: (value: number) => void;
}

export function GameSlider({
  label,
  max,
  min,
  step,
  disabled,
  name,
  id,
  onChange,
  value,
}: GameSliderProps): ReactNode {
  return (
    <label className="game-ui-slider">
      <span>{label}</span>
      <input
        aria-label={label}
        max={max}
        min={min}
        step={step}
        disabled={disabled}
        name={name}
        id={id}
        onChange={onChange ? (event) => onChange(Number(event.currentTarget.value)) : undefined}
        readOnly={!onChange}
        type="range"
        value={value}
        data-game-ui-paint=""
      />
    </label>
  );
}
