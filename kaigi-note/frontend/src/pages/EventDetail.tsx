// pages/EventDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getEvent,
  deleteEvent,
  getEventParticipants,
  addParticipant,
  removeParticipant,
} from '../services/events';
import { getCurrentUser } from '../services/auth';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  Event,
  ParticipantWithUser,
  ParticipantCreate,
  User,
  ApiError,
} from '../types';

const EventDetail: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<ParticipantWithUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Form state for adding a participant
  const [userId, setUserId] = useState<string>('');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [addingParticipant, setAddingParticipant] = useState<boolean>(false);

  useEffect(() => {
    fetchEventData();
    fetchCurrentUser();
  }, [eventId]);

  const fetchEventData = async (): Promise<void> => {
    setLoading(true);
    try {
      const eventData = await getEvent(eventId!);
      setEvent(eventData);
      const participantsData = await getEventParticipants(eventId!);
      setParticipants(participantsData);
      setError('');
    } catch (err: any) {
      console.error('Error fetching event data:', err);
      setError((err as ApiError).detail || 'イベント情報の取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async (): Promise<void> => {
    try {
      const userData = await getCurrentUser();
      setCurrentUser(userData);
      if (userData) {
        setUserId(userData.id.toString());
      }
    } catch (err) {
      console.error('Error fetching current user:', err);
    }
  };

  const handleDeleteEvent = async (): Promise<void> => {
    if (!window.confirm('このイベントを削除してもよろしいですか？')) return;
    try {
      await deleteEvent(eventId!);
      navigate('/');
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('イベントの削除に失敗しました。');
    }
  };

  const handleAddParticipant = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setAddingParticipant(true);
    const participantData: ParticipantCreate = {
      user_id: parseInt(userId, 10),
      paid_amount: paidAmount,
    };
    try {
      await addParticipant(eventId!, participantData);
      const participantsData = await getEventParticipants(eventId!);
      setParticipants(participantsData);
      setPaidAmount(0);
      setError('');
    } catch (err: any) {
      console.error('Error adding participant:', err);
      setError((err as ApiError).detail || '参加者の追加に失敗しました。');
    } finally {
      setAddingParticipant(false);
    }
  };

  const handleRemoveParticipant = async (participantId: number): Promise<void> => {
    if (!window.confirm('この参加者を削除してもよろしいですか？')) return;
    try {
      await removeParticipant(eventId!, participantId);
      const participantsData = await getEventParticipants(eventId!);
      setParticipants(participantsData);
    } catch (err) {
      console.error('Error removing participant:', err);
      setError('参加者の削除に失敗しました。');
    }
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

  if (loading) return <div className="container">読み込み中...</div>;

  if (error)
    return (
      <div className="container">
        <div className="form-error">{error}</div>
        <button onClick={() => navigate('/')}>イベント一覧に戻る</button>
      </div>
    );

  if (!event)
    return (
      <div className="container">
        <div>イベントが見つかりません。</div>
        <button onClick={() => navigate('/')}>イベント一覧に戻る</button>
      </div>
    );

  return (
    <div className="container">
      <h2>イベント詳細</h2>
      <div style={{ marginBottom: '20px' }}>
        <p><strong>開始日時:</strong> {formatDate(event.start_time)}</p>
        <p><strong>終了日時:</strong> {formatDate(event.end_time)}</p>
        <p><strong>場所:</strong> {event.place}</p>
        <p><strong>内容:</strong> {event.content}</p>
        <p><strong>ステータス:</strong> {getStatusLabel(event.status)}</p>
        <p><strong>合計費用:</strong> {event.total_cost}円</p>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate(`/events/${eventId}/edit`)} className="btn">
          編集
        </button>
        <button onClick={handleDeleteEvent} className="btn delete">
          削除
        </button>
      </div>
      <h3>参加者リスト</h3>
      <table>
        <thead>
          <tr>
            <th>名前</th>
            <th>支払金額</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {participants.length > 0 ? (
            participants.map((participant) => (
              <tr key={participant.id}>
                <td>{participant.user_name}</td>
                <td>{participant.paid_amount}円</td>
                <td>
                  <button
                    onClick={() => handleRemoveParticipant(participant.id)}
                    className="btn delete"
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} style={{ textAlign: 'center' }}>
                参加者がいません
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <h3>参加者追加</h3>
      <form onSubmit={handleAddParticipant}>
        <label htmlFor="userId">ユーザーID</label>
        <input
          type="number"
          id="userId"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
          min={1}
        />
        <label htmlFor="paidAmount">支払金額</label>
        <input
          type="number"
          id="paidAmount"
          value={paidAmount}
          onChange={(e) => setPaidAmount(Number(e.target.value))}
          required
          min={0}
        />
        <button type="submit" disabled={addingParticipant}>
          {addingParticipant ? '追加中...' : '追加'}
        </button>
      </form>
    </div>
  );
};

export default EventDetail;
