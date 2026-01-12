/**
 * Weather Icon Component
 * SVG icons for weather conditions
 */

interface WeatherIconProps {
  type: string;
  className?: string;
}

export function WeatherIcon({ type, className }: WeatherIconProps) {
  switch (type) {
    case 'CLD':
      return (
        <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
          <path d="M20 44h30a10 10 0 0 0 0-20 14 14 0 0 0-27-2A10 10 0 0 0 20 44Z" fill="currentColor" />
        </svg>
      );
    case 'RAIN':
      return (
        <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
          <path d="M20 36h26a10 10 0 0 0 0-20 14 14 0 0 0-27-2A10 10 0 0 0 20 36Z" fill="currentColor" />
          <path d="M26 42l-4 10M38 42l-4 10M50 42l-4 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case 'SNW':
      return (
        <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
          <path d="M32 14v36M18 22l28 20M46 22L18 42M20 32h24" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case 'PTC':
      return (
        <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="24" cy="24" r="10" fill="currentColor" />
          <path d="M24 44h24a10 10 0 0 0 0-20 14 14 0 0 0-10-6" fill="currentColor" />
        </svg>
      );
    case 'SUN':
    default:
      return (
        <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" r="12" fill="currentColor" />
          <path d="M32 8v8M32 48v8M8 32h8M48 32h8M14 14l6 6M44 44l6 6M14 50l6-6M44 20l6-6" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
  }
}
