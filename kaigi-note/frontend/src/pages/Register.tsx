// pages/Register.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, login } from '../services/auth';
import { AxiosError } from 'axios';
import { ApiError } from '../types';

interface RegisterProps {
  onRegisterSuccess: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegisterSuccess }) => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    if (password.length < 8) {
      setError('パスワードは8文字以上である必要があります');
      return;
    }

    setLoading(true);

    try {
      await register({ name, email, password });
      await login({ email, password });
      onRegisterSuccess();
      navigate('/');
    } catch (err: unknown) {
      console.error('Registration error:', err);
      const axiosErr = err as AxiosError<ApiError>;
      setError(
        axiosErr.response?.data.detail ||
          'ユーザー登録に失敗しました。入力内容を確認してください。'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>ユーザー登録</h2>
      {error && <div className="form-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">ユーザー名</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label htmlFor="email">メールアドレス</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">パスワード</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />

        <label htmlFor="confirmPassword">パスワード（確認）</label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
        />

        <button type="submit" disabled={loading}>
          {loading ? '登録中...' : '登録'}
        </button>
      </form>
    </div>
  );
};

export default Register;
