import Link from "next/link";

export const Header = () => {
  return (
    <header style={{
      backgroundColor: "var(--background, #f0f0f0)",
      color: "var(--foreground, #000)",
      padding: "1rem",
      borderBottom: "1px solid var(--border, #ccc)"
    }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>ペット管理システム</h2>
        <div>
          <Link href="/auth/signin">
            <button style={{
              marginRight: "0.5rem",
              backgroundColor: "var(--primary, #007bff)",
              color: "#fff",
              border: "none",
              padding: "0.5rem 1rem",
              cursor: "pointer"
            }}>ログイン</button>
          </Link>
          <Link href="/auth/signup">
            <button style={{
              backgroundColor: "var(--secondary, #6c757d)",
              color: "#fff",
              border: "none",
              padding: "0.5rem 1rem",
              cursor: "pointer"
            }}>新規登録</button>
          </Link>
        </div>
      </nav>
    </header>
  );
};
