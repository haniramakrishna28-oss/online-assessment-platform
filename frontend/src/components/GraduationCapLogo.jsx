import React from 'react';

export default function GraduationCapLogo({ size = 48, className = '', color = '#1e293b' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block' }}
    >
      {/* Cap Skull Underneath */}
      <path
        d="M52 104V142C52 142 54 162 100 162C146 162 148 142 148 142V104L100 124L52 104Z"
        fill={color}
      />
      
      {/* Inner Highlight on Cap Skull */}
      <path
        d="M52 104L100 124L148 104"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Mortarboard Diamond Top */}
      <path
        d="M100 42L190 82L100 122L10 82L100 42Z"
        fill={color}
      />

      {/* Mortarboard Top Trim / Bevel Highlight */}
      <path
        d="M100 45L186 82L100 119L14 82L100 45Z"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Button on Top */}
      <circle cx="100" cy="80" r="4.5" fill={color} stroke="#ffffff" strokeWidth="1.5" />

      {/* Tassel Cord to Left */}
      <path
        d="M100 80C60 76 22 84 19 88V134"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Tassel Ring / Knot */}
      <circle cx="19" cy="140" r="5" fill={color} />

      {/* Tassel Hanging Fringe */}
      <path
        d="M15 146L11 176C11 178 27 178 27 176L23 146Z"
        fill={color}
      />
    </svg>
  );
}
