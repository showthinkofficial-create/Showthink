import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = '', size = 56 }: LogoProps) {
  return (
    <img
      src="https://lh3.googleusercontent.com/d/10krMfSQ2qGwieYaCnjGoSIO6HStlK16a"
      alt="GP Academy Logo"
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`object-contain select-none border-2 border-[#fffefe] rounded-full ${className}`}
      referrerPolicy="no-referrer"
    />
  );
}
