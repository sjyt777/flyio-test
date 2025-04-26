// pages/EventList.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { getEvents } from '../services/events';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Event } from '../types';

const EventList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async (params: Record<string, any> = {}): Promise<void> => {
    setLoading(true);
    try {
      const data = await getEvents(params);
      setEvents(data);
      setError('');
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError(err.detail || 'イベントの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    fetchEvents({ keyword, status });
  };

  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'yyyy年MM月dd日 HH:mm', { locale: ja });
    } catch {
      return dateString;
    }
  };

  const getStatusLabel = (status: Event['status']): string => {
    switch (status) {
      case 'planned':
        return '予定';
      case 'done':
        return '完了';
      case 'canceled':
        return 'キャンセル';
      default:
        return status;
    }
  };

  return (
    <div className="container">
      <h2>イベント一覧</h2>
      {/* 検索フォーム */}
      <form onSubmit={handleSearch}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="keyword">検索キーワード（場所/内容）</label>
            <input
              type="text"
              id="keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <div style={{ width: '200px' }}>
            <label htmlFor="status">ステータス</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">すべて</option>
              <option value="planned">予定</option>
              <option value="done">完了</option>
              <option value="canceled">キャンセル</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit">検索</button>
          </div>
        </div>
      </form>

      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <div>読み込み中...</div>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>日時</th>
                <th>場所</th>
                <th>ステータス</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {events.length > 0 ? (
                events.map((event) => (
                  <tr key={event.id}>
                    <td>{formatDate(event.start_time)}</td>
                    <td>{event.place}</td>
                    <td>{getStatusLabel(event.status)}</td>
                    <td>
                      <Link to={`/events/${event.id}`} className="btn">
                        詳細
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center' }}>
                    イベントがありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div style={{ marginTop: '20px' }}>
            <Link to="/events/create" className="btn">
              + 新規イベント
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default EventList;
