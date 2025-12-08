import React from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const navItems = [
    { path: '/', label: 'HOME' },
    { path: '/recipes', label: 'CÔNG THỨC' },
    { path: '/contact', label: 'LIÊN HỆ' }
  ];

  return (
    <div className="blog-navigation">
      {navItems.map((item, index) => (
        <React.Fragment key={item.path}>
          <Link className="dieu-huong" to={item.path}>
            {item.label}
          </Link>
          {index < navItems.length - 1 && (
            <i className="bx bx-chevron-right" aria-hidden="true"></i>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Navigation; 