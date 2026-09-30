
let state = {
    wallet: 0, 
    safe: 0,
    card: 0,
    logs: []
};

function initApp() {
    const savedData = localStorage.getItem('bank_app_state');
    if (savedData) {
        try {
            state = JSON.parse(savedData);
        } catch (e) {
            console.error("Veri yüklenirken hata oluştu:", e);
        }
    }
    updateUI();
}

function saveState() {
    localStorage.setItem('bank_app_state', JSON.stringify(state));
}

function formatMoney(kurus) {
    const lira = kurus / 100;
    return lira.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + ' TL';
}

function parseInput(inputText) {
    if (!inputText) return { amount: 0, description: 'Açıklama yok' };

    const cleaned = inputText.trim().replace(',', '.');
    const parts = cleaned.split(' ');
    
    let rawAmount = parseFloat(parts[0]);
    
    if (isNaN(rawAmount) || rawAmount <= 0) {
        return { amount: 0, description: 'Açıklama yok' };
    }

    const amount = Math.round(rawAmount * 100);
    
    const descParts = parts.slice(1);
    const description = descParts.length > 0 ? descParts.join(' ') : 'Açıklama yok';

    return { amount, description };
}
function addLog(type, amount, from, to, description) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    const newLog = {
        id: Date.now(),
        date: `${dateStr} • ${timeStr}`,
        type, // 'plus', 'minus', 'transfer'
        amount: formatMoney(amount),
        from,
        to,
        description
    };

    state.logs.unshift(asyncAddLogData(newLog)); 
    saveState();
}

function asyncAddLogData(log) {
    return log;
}

function updateUI() {
    document.getElementById('wallet-balance').textContent = formatMoney(state.wallet);
    document.getElementById('safe-balance').textContent = formatMoney(state.safe);
    document.getElementById('card-balance').textContent = formatMoney(state.card);

    renderLogs();
}

function renderLogs() {
    const logListEl = document.getElementById('log-list');
    const logCountEl = document.getElementById('log-count');
    
    logCountEl.textContent = `${state.logs.length} işlem`;

    if (state.logs.length === 0) {
        logListEl.innerHTML = `<div class="empty-log">Henüz işlem geçmişi yok.</div>`;
        return;
    }

    logListEl.innerHTML = state.logs.map(log => {
        let titleHtml = '';
        let amountClass = 'log-amount';
        
        if (log.type === 'plus') {
            titleHtml = `${log.from} (Ekleme)`;
            amountClass += ' text-success';
        } else if (log.type === 'minus') {
            titleHtml = `${log.from} (Çıkış)`;
            amountClass += ' text-danger';
        } else {
            titleHtml = `${log.from} → ${log.to}`;
        }

        return `
            <div class="log-item">
                <div class="log-header-row">
                    <span class="log-date">${log.date}</span>
                    <span class="${amountClass}">${log.type === 'minus' ? '-' : (log.type === 'plus' ? '+' : '')}${log.amount}</span>
                </div>
                <div class="log-details">
                    <strong>${titleHtml}</strong>
                    <span class="log-desc">"${log.description}"</span>
                </div>
            </div>
        `;
    }).join('');
}

function showAlert(message) {
    alert(message); 
}


document.getElementById('btn-wallet-plus').addEventListener('click', () => {
    const inputVal = document.getElementById('transaction-input').value;
    const { amount, description } = parseInput(inputVal);

    if (amount <= 0) {
        showAlert("Lütfen geçerli bir miktar girin!");
        return;
    }

    state.wallet += amount;
    addLog('plus', amount, 'Cüzdan', null, description);
    
    document.getElementById('transaction-input').value = '';
    updateUI();
});

document.getElementById('btn-wallet-minus').addEventListener('click', () => {
    const inputVal = document.getElementById('transaction-input').value;
    const { amount, description } = parseInput(inputVal);

    if (amount <= 0) {
        showAlert("Lütfen geçerli bir miktar girin!");
        return;
    }

    if (state.wallet < amount) {
        showAlert("Cüzdan bakiyesi yetersiz!");
        return;
    }

    state.wallet -= amount;
    addLog('minus', amount, 'Cüzdan', null, description);

    document.getElementById('transaction-input').value = '';
    updateUI();
});

document.getElementById('btn-safe-transfer').addEventListener('click', () => {
    const inputVal = document.getElementById('transaction-input').value;
    const { amount, description } = parseInput(inputVal);

    if (amount <= 0) {
        showAlert("Lütfen geçerli bir miktar girin!");
        return;
    }

    if (state.wallet < amount) {
        showAlert("Cüzdan bakiyesi yetersiz!");
        return;
    }

    state.wallet -= amount;
    state.safe += amount;
    addLog('transfer', amount, 'Cüzdan', 'Kasa', description);

    document.getElementById('transaction-input').value = '';
    updateUI();
});

document.getElementById('btn-safe-minus').addEventListener('click', () => {
    const inputVal = document.getElementById('transaction-input').value;
    const { amount, description } = parseInput(inputVal);

    if (amount <= 0) {
        showAlert("Lütfen geçerli bir miktar girin!");
        return;
    }

    if (state.safe < amount) {
        showAlert("Kasa bakiyesi yetersiz!");
        return;
    }

    state.safe -= amount;
    addLog('minus', amount, 'Kasa', null, description);

    document.getElementById('transaction-input').value = '';
    updateUI();
});

document.getElementById('btn-card-transfer').addEventListener('click', () => {
    const inputVal = document.getElementById('transaction-input').value;
    const { amount, description } = parseInput(inputVal);

    if (amount <= 0) {
        showAlert("Lütfen geçerli bir miktar girin!");
        return;
    }

    if (state.wallet < amount) {
        showAlert("Cüzdan bakiyesi yetersiz!");
        return;
    }

    state.wallet -= amount;
    state.card += amount;
    addLog('transfer', amount, 'Cüzdan', 'Kart', description);

    document.getElementById('transaction-input').value = '';
    updateUI();
});

document.getElementById('btn-card-minus').addEventListener('click', () => {
    const inputVal = document.getElementById('transaction-input').value;
    const { amount, description } = parseInput(inputVal);

    if (amount <= 0) {
        showAlert("Lütfen geçerli bir miktar girin!");
        return;
    }

    if (state.card < amount) {
        showAlert("Kart bakiyesi yetersiz!");
        return;
    }

    state.card -= amount;
    addLog('minus', amount, 'Kart', null, description);

    document.getElementById('transaction-input').value = '';
    updateUI();
});

initApp();