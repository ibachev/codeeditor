import React from "react";
import Header from "../Header";

interface LayoutProps {
  children: React.ReactNode;
}

const PrivateLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div>
      <Header privateLayout={true} />
      <main>{children}</main>
    </div>
  );
};

export default PrivateLayout;
