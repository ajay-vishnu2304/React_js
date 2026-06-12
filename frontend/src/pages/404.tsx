import React from "react";
import { Link } from "react-router-dom";

const NotFound: React.FC = () => {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking does not exist !!!</p>
      <Link to="/" style={{ color: "blue", textDecoration: "underline" }}>
        Home
      </Link>
    </div>
  );
};

export default NotFound;
