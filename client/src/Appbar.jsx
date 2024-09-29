import React from 'react';
import MenuIcon from '@mui/icons-material/Menu'; 
import './Appbar.css'; 

const FullWidthAppBar = () => {
  return (
    <div className="app-bar"> 
      <MenuIcon className="menu-icon" />
      <h2>Transaction Dashboard</h2>
    </div>
  );
};

export default FullWidthAppBar;
