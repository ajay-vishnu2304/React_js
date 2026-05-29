import "./Footer.css";

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="container">
        <p>&copy; {currentYear} AJVX. All Rights Reserved.</p>
      </div>
    </footer>
  );
}