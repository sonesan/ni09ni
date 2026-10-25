// アプリの状態管理
let selectedMinutes = 25;
let selectedFlavor = { id: 'vanilla', name: 'バニラ', color: '#fff5e6', icon: '🍦' };
let timerInterval = null;
let timeLeft = 0;
let totalTime = 0;

// DOM要素
const screens = document.querySelectorAll('.screen');
const appContainer = document.querySelector('.app-container');

// 画面切り替え関数
function switchScreen(screenId) {
    screens.forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// 1. プリセット時間の選択
document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        selectedMinutes = parseInt(btn.dataset.time);
        goToFlavorScreen();
    });
});

document.getElementById('btn-custom-start').addEventListener('click', () => {
    const val = parseInt(document.getElementById('custom-minutes').value);
    if (!val || val <= 0) {
        alert('正しい分数を入力してね！');
        return;
    }
    selectedMinutes = val;
    goToFlavorScreen();
});

function goToFlavorScreen() {
    switchScreen('screen-flavor');
}

// 2. フレーバーの選択
document.querySelectorAll('.flavor-card').forEach(card => {
    card.addEventListener('click', () => {
        selectedFlavor = {
            id: card.dataset.flavor,
            name: card.dataset.name,
            color: card.dataset.color,
            icon: card.querySelector('.flavor-icon').textContent
        };
        updateConfirmScreen();
        switchScreen('screen-confirm');
    });
});

function updateConfirmScreen() {
    const scoop = document.getElementById('preview-scoop');
    scoop.textContent = selectedFlavor.icon;
    scoop.style.backgroundColor = selectedFlavor.color;
    document.getElementById('confirm-text').textContent = `${selectedMinutes}分間 集中するよ！`;
}

// 戻るボタンの処理
document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        switchScreen(btn.dataset.target);
    });
});

// 3. タイマー開始
document.getElementById('btn-start-timer').addEventListener('click', () => {
    totalTime = selectedMinutes * 60;
    timeLeft = totalTime;
    
    const timerScoop = document.getElementById('timer-scoop');
    timerScoop.textContent = selectedFlavor.icon;
    timerScoop.style.backgroundColor = selectedFlavor.color;

    updateCountdownDisplay();
    switchScreen('screen-timer');
    startTimer();
});

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        updateCountdownDisplay();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            finishTimer();
        }
    }, 1000);
}

function updateCountdownDisplay() {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    document.getElementById('countdown').textContent = 
        `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// タイマーキャンセル
document.getElementById('btn-cancel-timer').addEventListener('click', () => {
    if (confirm('タイマーをやめますか？（進捗は破棄されます）')) {
        clearInterval(timerInterval);
        switchScreen('screen-home');
    }
});

// タイマー終了処理
// タイマー終了処理
function finishTimer() {
    document.getElementById('result-minutes').textContent = selectedMinutes;
    const resultScoop = document.getElementById('result-scoop');
    resultScoop.textContent = selectedFlavor.icon;
    resultScoop.style.backgroundColor = selectedFlavor.color;

    // 1. 今回の分数を「これまでの合計（累計）」に足して保存する
    let totalMinutes = addTotalMinutes(selectedMinutes);

    // 2. クーポンの判定ロジック
    let ticketName = "";
    let ticketDesc = "";
    let hasEarnedTicket = false; // クーポンがもらえたかどうか

    // ★【発表・デモ用】「1分以上」ならすぐに無料クーポンが出る特別ルール！
    // 発表が終わったら const isDemoMode = false;
    const isDemoMode = true; 

    if (isDemoMode && selectedMinutes >= 1) {
        ticketName = "🎉 【デモ用】アイス1個無料クーポン 🍦";
        ticketDesc = `集中達成！(合計: ${totalMinutes}分)`;
        hasEarnedTicket = true;
    } 
    // === 【本番用ルール】 ===
    // 31時間（1,860分）以上達成で無料クーポン
    else if (totalMinutes >= 1860) {
        ticketName = "🎉 アイス1個無料クーポン 🍦";
        ticketDesc = `累計31時間達成！おめでとうございます！ (合計: ${totalMinutes}分)`;
        hasEarnedTicket = true;
    } 
    // 310分達成ごとに「10%OFFクーポン」を1枚GET！
    else if (totalMinutes >= 310) {
        ticketName = "✨ 10%OFFクーポン ✨";
        ticketDesc = `310分達成！おめでとうございます！ (合計: ${totalMinutes}分)`;
        hasEarnedTicket = true;
    } 
    // 条件（310分）に達していなかった場合
    else {
        ticketName = "おつかれさま！";
        ticketDesc = `あと ${310 - totalMinutes}分で10%OFFクーポンGET！ (現在累計: ${totalMinutes}分)`;
        hasEarnedTicket = false;
    }

    // 画面への反映
    document.getElementById('ticket-title').textContent = ticketName;
    document.getElementById('ticket-desc').textContent = ticketDesc;

    // 条件を達成している場合のみ、チケットを保存してリストに追加する
    if (hasEarnedTicket) {
        saveTicket(ticketName, totalMinutes);
    }

    switchScreen('screen-result');
}

// 合計集中時間を計算・保存する関数
function addTotalMinutes(mins) {
    let currentTotal = parseInt(localStorage.getItem('ice_total_minutes') || '0');
    currentTotal += mins;
    localStorage.setItem('ice_total_minutes', currentTotal);
    return currentTotal;
}

document.getElementById('btn-go-home').addEventListener('click', () => {
    switchScreen('screen-home');
});

// 背景テーマ切り替え (昼・夕方・夜)
document.querySelectorAll('.bg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.bg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const bgType = btn.dataset.bg;
        appContainer.className = 'app-container'; // リセット
        if (bgType === 'sunset') appContainer.classList.add('sunset');
        if (bgType === 'night') appContainer.classList.add('night');
    });
});

// 現在時刻表示の更新
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const clockEl = document.getElementById('current-time-clock');
    if (clockEl) {
        clockEl.textContent = `${hours}:${minutes}`;
    }
}
setInterval(updateClock, 1000);
updateClock();

// チケット保存・表示機能
function saveTicket(title, mins) {
    let tickets = JSON.parse(localStorage.getItem('ice_tickets') || '[]');
    tickets.push({ title, minutes: mins, date: new Date().toLocaleDateString() });
    localStorage.setItem('ice_tickets', JSON.stringify(tickets));
}

document.getElementById('btn-tickets').addEventListener('click', () => {
    renderTickets();
    document.getElementById('modal-tickets').style.display = 'flex';
});

document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('modal-tickets').style.display = 'none';
});

function renderTickets() {
    const container = document.getElementById('ticket-list-container');
    const tickets = JSON.parse(localStorage.getItem('ice_tickets') || '[]');
    
    if (tickets.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#888;">まだチケットはありません。<br>タイマーを完了してゲットしよう！</p>';
        return;
    }

    container.innerHTML = tickets.map(t => `
        <div class="ticket-item">
            <strong>${t.title}</strong>
            <p style="font-size: 0.85rem; color: #64748b;">集中時間: ${t.minutes}分 (${t.date})</p>
        </div>
    `).join('');
}

// サイトを起動した時間に合わせて背景を自動設定する関数
function setAutoBackground() {
    const now = new Date();
    const hour = now.getHours(); // 今何時かを取得 (0〜23)

    const appContainer = document.querySelector('.app-container');
    
    // 一旦クラスをリセット
    appContainer.className = 'app-container';

    // 時間帯による切り替え条件
    if (hour >= 17 && hour < 19) {
        // 夕方 (17時〜18時台)
        appContainer.classList.add('sunset');
        updateBgButtonActive('sunset');
    } else if (hour >= 19 || hour < 5) {
        // 夜 (19時〜翌朝4時台)
        appContainer.classList.add('night');
        updateBgButtonActive('night');
    } else {
        // 朝・昼 (5時〜16時台) -> デフォルトのままでOK
        updateBgButtonActive('day');
    }
}

// 画面下の「☀️🌇🌙」ボタンの見た目（アクティブ状態）を同期させるおまけ機能
function updateBgButtonActive(bgType) {
    document.querySelectorAll('.bg-btn').forEach(b => {
        if (b.dataset.bg === bgType) {
            b.classList.add('active');
        } else {
            b.classList.remove('active');
        }
    });
}

// ページを開いたときに実行！
window.addEventListener('DOMContentLoaded', () => {
    setAutoBackground();
});