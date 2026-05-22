import { Link } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <h1>
          404
        </h1>
        <h2>
          Page Not Found
        </h2>
        <p>
          The page you are looking for does not exist.
        </p>
        <Link
          to="/"
          className="notfound-link"
        >
          Go back to Home
        </Link>
      </div>
    </div>
  );
}
