import React, { useEffect, useState } from 'react';
import './LoaderStyles.css';

const RestaurantLoader = () => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (progress < 100) {
        setProgress(prevProgress => prevProgress + 1);
      }
    }, 30);
    
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className="loader-container">
      <div className="loader-content">
        <div className="plate">
          <div className="plate-base"></div>
          <div className="plate-food">
            <div className="food-item-jig food-item-1"></div>
            <div className="food-item-jig food-item-2"></div>
            <div className="food-item-jig food-item-3"></div>
            <div className="steam steam-1"></div>
            <div className="steam steam-2"></div>
            <div className="steam steam-3"></div>
          </div>
          <div className="utensils">
            <div className="fork"></div>
            <div className="knife"></div>
          </div>
        </div>
        
        <h1 className="loader-title">Loading...</h1>
        
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          <div className="progress-text">{progress}%</div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantLoader;