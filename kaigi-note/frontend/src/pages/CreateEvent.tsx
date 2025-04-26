// pages/CreateEvent.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent } from '../services/events';
import { EventCreate } from '../types';

const CreateEvent: React.FC = () => {
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [place, setPlace] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [status, setStatus] = useState<'planned' | 'done' | 'canceled'>('planned');
  const [totalCost, setTotalCost] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const eventData: EventCreate = {
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
      place,
      content,
      status,
      total_cost: totalCost,
    };

    try {
      const createdEvent = await createEvent(eventData);
      navigate(`/events/${createdEvent.id}`);
    } catch (err: any) {
      console.error('Error creating event:', err);
      setError(err.detail || err.message || 'イベントの作成に失敗しました。入力内容を確認してください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>新規イベント</h2>
      {error && <div className="form-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="startTime">開始日時</label>
        <input
          type="datetime-local"
          id="startTime"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />

        <label htmlFor="endTime">終了日時</label>
        <input
          type="datetime-local"
          id="endTime"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />

        <label htmlFor="place">場所</label>
        <input
          type="text"
          id="place"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          required
        />

        <label htmlFor="content">内容</label>
        <textarea
          id="content"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        <label htmlFor="status">ステータス</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as 'planned' | 'done' | 'canceled')}
        >
          <option value="planned">予定</option>
          <option value="done">完了</option>
          <option value="canceled">キャンセル</option>
        </select>

        <label htmlFor="totalCost">合計費用</label>
        <input
          type="number"
          id="totalCost"
          value={totalCost}
          onChange={(e) => setTotalCost(Number(e.target.value))}
          min={0}
        />

        <button type="submit" disabled={loading}>
          {loading ? '登録中...' : '登録'}
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
