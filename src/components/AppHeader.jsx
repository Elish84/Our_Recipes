import React, { useEffect, useState } from "react";

const AppHeader = ({ title, subtitle, backgroundImage }) => {
  const [offsetY, setOffsetY] = useState(0);

  const handleScroll = () => {
    setOffsetY(window.pageYOffset);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="app-header">
      <div 
        className="header-bg" 
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
          transform: `translateY(${offsetY * 0.4}px)` // Subtle parallax effect
        }} 
      />
      <div className="header-overlay" />
      <div className="header-content fade-up">
        <h1 className="header-title">{title}</h1>
        {subtitle && <p className="header-subtitle">{subtitle}</p>}
      </div>
    </header>
  );
};

export default AppHeader;
