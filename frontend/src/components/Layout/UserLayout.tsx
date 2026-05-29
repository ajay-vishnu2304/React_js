import UserNavBar from "../UserNavBar/UserNavBar";
import Footer from "../Footer/Footer";
import "./UserLayout.css";

interface UserLayoutProps {
  readonly children: React.ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  return (
    <div className="user-layout">
      <UserNavBar />
      <main className="user-layout-content">{children}</main>
      <Footer />
    </div>
  );
}
