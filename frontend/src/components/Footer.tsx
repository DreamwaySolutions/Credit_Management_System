import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full text-center py-4 px-4 text-xs font-semibold tracking-wide bg-[#FFFFFF] border-t border-[#BCCED7] text-[#64748B] transition-colors duration-200">
      © Copyright 2026 Designed and Developed by{' '}
      <a
        href="https://www.dreamwaysoft.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#2563EB] hover:underline font-extrabold"
      >
        Dreamway Solutions
      </a>
    </footer>
  );
};
