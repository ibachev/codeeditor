import React from "react";
import Header from "../Header";

interface LayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div>
      <Header privateLayout={false} />
      <main>{children}</main>
    </div>
  );
};

export default PublicLayout;
