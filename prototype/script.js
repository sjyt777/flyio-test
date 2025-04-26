// script.js

// 簡易データ（本来はサーバーとやり取りする想定）
let events = [
    {
      id: 1,
      date: '2025-04-01',
      place: '東京会議室A',
      content: 'JavaScript勉強会',
      status: 'planned',
      participants: [
        { userId: 1, userName: 'Alice', paidAmount: 1000 },
        { userId: 2, userName: 'Bob', paidAmount: 1200 }
      ]
    },
    {
      id: 2,
      date: '2025-04-08',
      place: '大阪カフェ',
      content: 'React入門',
      status: 'done',
      participants: [
        { userId: 2, userName: 'Bob', paidAmount: 500 },
        { userId: 3, userName: 'Charlie', paidAmount: 1500 }
      ]
    }
  ];
  
  // イベントを一覧表示する( index.html 用 )
  function renderEventList() {
    const tableBody = document.getElementById('eventTableBody');
    if (!tableBody) return;
  
    tableBody.innerHTML = '';
  
    events.forEach(ev => {
      const row = document.createElement('tr');
  
      const dateTd = document.createElement('td');
      dateTd.textContent = ev.date;
  
      const placeTd = document.createElement('td');
      placeTd.textContent = ev.place;
  
      const statusTd = document.createElement('td');
      statusTd.textContent = ev.status;
  
      const detailTd = document.createElement('td');
      const detailBtn = document.createElement('a');
      detailBtn.textContent = '詳細';
      detailBtn.className = 'btn';
      detailBtn.href = `event_detail.html?eventId=${ev.id}`;
      detailTd.appendChild(detailBtn);
  
      row.appendChild(dateTd);
      row.appendChild(placeTd);
      row.appendChild(statusTd);
      row.appendChild(detailTd);
  
      tableBody.appendChild(row);
    });
  }
  
  // URLパラメータからeventIdを取得
  function getEventIdFromUrl() {
    const params = new URLSearchParams(location.search);
    return parseInt(params.get('eventId'), 10);
  }
  
  // イベント詳細を表示 ( event_detail.html 用 )
  function renderEventDetail() {
    const eventId = getEventIdFromUrl();
    const eventData = events.find(ev => ev.id === eventId);
    if (!eventData) return;
  
    document.getElementById('eventDate').textContent = eventData.date;
    document.getElementById('eventPlace').textContent = eventData.place;
    document.getElementById('eventContent').textContent = eventData.content;
    document.getElementById('eventStatus').textContent = eventData.status;
  
    const participantTableBody = document.getElementById('participantTableBody');
    participantTableBody.innerHTML = '';
  
    eventData.participants.forEach(p => {
      const row = document.createElement('tr');
  
      const nameTd = document.createElement('td');
      nameTd.textContent = p.userName;
  
      const amountTd = document.createElement('td');
      amountTd.textContent = p.paidAmount;
  
      const actionTd = document.createElement('td');
      const editBtn = document.createElement('button');
      editBtn.textContent = '編集';
      editBtn.className = 'btn';
      // 実際の編集処理は未実装（モーダル表示など想定）
  
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '削除';
      deleteBtn.className = 'btn delete';
      // 実際の削除処理は未実装
  
      actionTd.appendChild(editBtn);
      actionTd.appendChild(deleteBtn);
  
      row.appendChild(nameTd);
      row.appendChild(amountTd);
      row.appendChild(actionTd);
  
      participantTableBody.appendChild(row);
    });
  }
  
  // イベント削除(デモ用・実際はサーバー側で処理)
  function deleteEvent() {
    const eventId = getEventIdFromUrl();
    // 配列から削除
    const idx = events.findIndex(ev => ev.id === eventId);
    if (idx !== -1) {
      events.splice(idx, 1);
      alert('イベントを削除しました。');
      location.href = 'index.html'; // 一覧に戻る
    }
  }
  
  // イベント登録 ( create_event.html 用 )
  // ここでは最低限の処理（フォーム入力を受け取って events に追加）
  // 実際はAPI経由でサーバーに送信する想定
  function createEvent() {
    const date = document.getElementById('dateInput').value;
    const place = document.getElementById('placeInput').value;
    const content = document.getElementById('contentInput').value;
    const status = document.getElementById('statusSelect').value;
  
    const newId = events.length ? Math.max(...events.map(e => e.id)) + 1 : 1;
    const newEvent = {
      id: newId,
      date,
      place,
      content,
      status,
      participants: []
    };
    events.push(newEvent);
  
    alert('イベントを登録しました！');
    location.href = 'index.html';
  }
  