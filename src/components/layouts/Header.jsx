// components/layouts/Header.jsx - Header without usage stats
import React from 'react';
import HeaderBanner from './HeaderBanner';

const Header = ({ darkMode, setDarkMode }) => {
  return (
    <>
      {/* Banner Section */}
      <HeaderBanner darkMode={darkMode} setDarkMode={setDarkMode} />
    </>
  );
};

export default Header;