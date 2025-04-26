import React from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated, onLogout }) => {
  return (
    <div className="header">
      <div className="title">KaigiNote</div>
      <div className="nav-links">
        <Link to="/">イベント一覧</Link>
        {isAuthenticated ? (
          <>
            <Link to="/events/create">新規イベント</Link>
            <a 
              href="#" 
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => { 
                e.preventDefault(); 
                onLogout(); 
              }}
            >
              ログアウト
            </a>
          </>
        ) : (
          <>
            <Link to="/login">ログイン</Link>
            <Link to="/register">ユーザー登録</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;
