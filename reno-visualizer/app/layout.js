import React from 'react';
import './globals.css';

export const metadata = {
  title: 'Reno Visualizer - AR Furniture Placement',
  description: 'Visualize furniture in your room using augmented reality technology',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app">
          {/* Navigation */}
          <nav className="navbar">
            <div className="navContainer">
              <div className="navBrand">
                <h1>Reno Visualizer</h1>
              </div>

              <div className="navLinks">
                <a href="/" className="navLink">Home</a>
                <a href="/upload" className="navLink">Upload Room</a>
                <a href="/ar" className="navLink">AR View</a>
                <a href="/products" className="navLink">Products</a>
                <a href="/recommend" className="navLink">AI Recommendations</a>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="mainContent">
            {children}
          </main>

          {/* Global Notification Container */}
          <div id="global-notifications" />
        </div>
      </body>
    </html>
  );
}
