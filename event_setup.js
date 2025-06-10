<<<<<<< HEAD
// event_setup.js (完全版)

document.addEventListener('DOMContentLoaded', () => {
    // ★★★ ここをあなたのFlaskサーバーのURLに置き換えてください ★★★
    // 例: const SCRIPT_URL = 'http://127.0.0.1:5000/api/'; 
    const SCRIPT_URL = 'http://127.0.0.1:5000/api'; 

    const masterPrizeListSelectionUl = document.getElementById('master-prize-list-selection');
    const eventPrizeListUl = document.getElementById('event-prize-list');
    const clearEventPrizesButton = document.getElementById('clear-event-prizes-button');
    const customPrizeNameInput = document.getElementById('custom-prize-name-input');
    const customPrizeImageInput = document.getElementById('custom-prize-image-input');
    const addCustomPrizeButton = document.getElementById('add-custom-prize-button');

    // Flaskサーバーから景品データを読み込む汎用関数 (fetch API方式)
    const loadPrizesFromSheet = async (sheetName) => {
        try {
            const response = await fetch(`${SCRIPT_URL}?sheet=${sheetName}&action=get`); // GETリクエスト
            const data = await response.json();
            if (response.ok) { // HTTPステータスが200番台なら成功
                return data.data; // Flaskの応答は {success: true, data: [...]} 形式
            } else {
                console.error(`Failed to load prizes from ${sheetName}:`, data.message);
                alert(`景品（${sheetName}）の読み込みに失敗しました: ` + data.message);
                return [];
            }
        } catch (error) {
            console.error(`Error fetching prizes from ${sheetName}:`, error);
            alert(`サーバーへの接続に失敗しました。サーバーが起動しているか確認してください。`);
            return [];
        }
    };

    // Flaskサーバーに景品データを保存/操作する汎用関数 (POST)
    const savePrizeToSheet = async (sheetName, prizeData, actionType) => {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', 
            },
        };

        if (actionType !== 'clear') { // 'clear'アクション以外の場合のみbodyを追加
            options.body = JSON.stringify(prizeData);
        }
        
        try {
            const response = await fetch(`${SCRIPT_URL}?sheet=${sheetName}&action=${actionType}`, options);
            const data = await response.json(); // FlaskはJSON応答を返す
            if (response.ok) {
                return data.success;
            } else {
                console.error(`Failed to save prize to ${sheetName}:`, data.message);
                alert(`景品（${sheetName}）の保存に失敗しました: ` + data.message);
                return false;
            }
        } catch (error) {
            console.error(`Network or parsing error saving prize to ${sheetName}:`, error);
            alert(`サーバーへの接続に失敗しました。サーバーが起動しているか確認してください。`);
            return false;
        }
    };

    // マスター景品リストを画面に表示する関数 (選択用)
    const renderMasterPrizeSelectionList = async () => {
        masterPrizeListSelectionUl.innerHTML = '';
        const masterPrizes = await loadPrizesFromSheet('MasterPrizes'); 

        if (masterPrizes.length === 0) {
            const li = document.createElement('li');
            li.textContent = '管理者画面で景品が登録されていません。';
            li.classList.add('no-prizes');
            masterPrizeListSelectionUl.appendChild(li);
            return;
        }

        masterPrizes.forEach((prize) => { 
            const li = document.createElement('li');
            
            const prizeInfoDiv = document.createElement('div');
            prizeInfoDiv.classList.add('prize-info');

            const nameSpan = document.createElement('span');
            nameSpan.textContent = prize.name;
            prizeInfoDiv.appendChild(nameSpan);

            if (prize.imageUrl) {
                const img = document.createElement('img');
                img.src = prize.imageUrl;
                img.alt = prize.name;
                img.classList.add('prize-thumbnail');
                prizeInfoDiv.appendChild(img);
            }

            li.appendChild(prizeInfoDiv);

            // 「追加」ボタンを作成
            const addButton = document.createElement('button');
            addButton.textContent = '今回の抽選会に追加';
            addButton.classList.add('add-to-event-button');
            addButton.addEventListener('click', async () => {
                await addPrizeToEvent(prize); 
            });

            li.appendChild(addButton);
            masterPrizeListSelectionUl.appendChild(li);
        });
    };

    // 今回の抽選会で使用する景品リストを画面に表示する関数
    const renderEventPrizeList = async () => {
        eventPrizeListUl.innerHTML = '';
        const eventPrizes = await loadPrizesFromSheet('EventPrizes'); 

        if (eventPrizes.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'まだ今回の抽選会景品が設定されていません。';
            li.classList.add('no-prizes');
            eventPrizeListUl.appendChild(li);
            return;
        }

        eventPrizes.forEach((prize) => { 
            const li = document.createElement('li');
            
            const prizeInfoDiv = document.createElement('div');
            prizeInfoDiv.classList.add('prize-info');

            const nameSpan = document.createElement('span');
            nameSpan.textContent = prize.name;
            prizeInfoDiv.appendChild(nameSpan);

            if (prize.imageUrl) {
                const img = document.createElement('img');
                img.src = prize.imageUrl;
                img.alt = prize.name;
                img.classList.add('prize-thumbnail');
                prizeInfoDiv.appendChild(img);
            }

            li.appendChild(prizeInfoDiv);

            // 削除ボタンを作成
            const deleteButton = document.createElement('button');
            deleteButton.textContent = '削除';
            deleteButton.classList.add('delete-button');
            deleteButton.addEventListener('click', async () => {
                await deletePrizeFromEvent(prize.name); 
            });

            li.appendChild(deleteButton);
            eventPrizeListUl.appendChild(li);
        });
    };

    // マスター景品を抽選会リストに追加する処理
    const addPrizeToEvent = async (prizeToAdd) => {
        const eventPrizes = await loadPrizesFromSheet('EventPrizes');
        if (eventPrizes.some(p => p.name === prizeToAdd.name)) {
            alert(`「${prizeToAdd.name}」は既に追加されています。`);
            return;
        }
        const success = await savePrizeToSheet('EventPrizes', prizeToAdd, 'add');
        if (success) {
            alert(`「${prizeToAdd.name}」を今回の抽選会景品に追加しました。`);
            renderEventPrizeList();
        } else {
            alert('景品の追加に失敗しました。');
        }
    };

    // カスタム景品を抽選会リストに追加する処理
    const addCustomPrizeToEvent = async () => {
        const prizeName = customPrizeNameInput.value.trim();
        const prizeImageUrl = customPrizeImageInput.value.trim();

        if (prizeName) {
            const eventPrizes = await loadPrizesFromSheet('EventPrizes');
            if (eventPrizes.some(p => p.name === prizeName)) {
                alert(`「${prizeName}」は既に追加されています。`);
                return;
            }
            const success = await savePrizeToSheet('EventPrizes', { name: prizeName, imageUrl: prizeImageUrl }, 'add');
            if (success) {
                alert(`「${prizeName}」をカスタム景品として追加しました。`);
                customPrizeNameInput.value = '';
                customPrizeImageInput.value = '';
                renderEventPrizeList();
            } else {
                alert('カスタム景品の追加に失敗しました。');
            }
        } else {
            alert('カスタム景品名を入力してください。');
        }
    };

    // 抽選会リストから景品を削除する処理
    const deletePrizeFromEvent = async (prizeNameToDelete) => {
        if (confirm(`「${prizeNameToDelete}」を今回の抽選会景品から削除してもよろしいですか？`)) {
            const success = await savePrizeToSheet('EventPrizes', { name: prizeNameToDelete }, 'delete'); 
            if (success) {
                alert('景品を削除しました。');
                renderEventPrizeList();
            } else {
                alert('景品の削除に失敗しました。');
            }
        }
    };

    // 今回の抽選会景品を全てクリアする処理
    const clearAllEventPrizes = async () => {
        if (confirm('今回の抽選会に設定された全ての景品を削除してもよろしいですか？\n（これはGoogleスプレッドシートからデータを削除します）')) {
            const success = await savePrizeToSheet('EventPrizes', {}, 'clear'); 
            if (success) {
                alert('今回の抽選会景品がクリアされました。');
                await savePrizeToSheet('DrawnPrizes', {}, 'clear'); 
                renderEventPrizeList();
            } else {
                alert('今回の抽選会景品のクリアに失敗しました。');
            }
        }
    };

    // イベントリスナーの設定
    addCustomPrizeButton.addEventListener('click', addCustomPrizeToEvent);
    customPrizeNameInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addCustomPrizeToEvent();
        }
    });
    customPrizeImageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addCustomPrizeToEvent();
        }
    });
    clearEventPrizesButton.addEventListener('click', clearAllEventPrizes);

    // ページロード時にリストを初期表示
    renderMasterPrizeSelectionList(); 
    renderEventPrizeList();           
=======
// event_setup.js (完全版)

document.addEventListener('DOMContentLoaded', () => {
    // ★★★ ここをあなたのFlaskサーバーのURLに置き換えてください ★★★
    // 例: const SCRIPT_URL = 'http://127.0.0.1:5000/api/'; 
    const SCRIPT_URL = 'http://127.0.0.1:5000/api'; 

    const masterPrizeListSelectionUl = document.getElementById('master-prize-list-selection');
    const eventPrizeListUl = document.getElementById('event-prize-list');
    const clearEventPrizesButton = document.getElementById('clear-event-prizes-button');
    const customPrizeNameInput = document.getElementById('custom-prize-name-input');
    const customPrizeImageInput = document.getElementById('custom-prize-image-input');
    const addCustomPrizeButton = document.getElementById('add-custom-prize-button');

    // Flaskサーバーから景品データを読み込む汎用関数 (fetch API方式)
    const loadPrizesFromSheet = async (sheetName) => {
        try {
            const response = await fetch(`${SCRIPT_URL}?sheet=${sheetName}&action=get`); // GETリクエスト
            const data = await response.json();
            if (response.ok) { // HTTPステータスが200番台なら成功
                return data.data; // Flaskの応答は {success: true, data: [...]} 形式
            } else {
                console.error(`Failed to load prizes from ${sheetName}:`, data.message);
                alert(`景品（${sheetName}）の読み込みに失敗しました: ` + data.message);
                return [];
            }
        } catch (error) {
            console.error(`Error fetching prizes from ${sheetName}:`, error);
            alert(`サーバーへの接続に失敗しました。サーバーが起動しているか確認してください。`);
            return [];
        }
    };

    // Flaskサーバーに景品データを保存/操作する汎用関数 (POST)
    const savePrizeToSheet = async (sheetName, prizeData, actionType) => {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', 
            },
        };

        if (actionType !== 'clear') { // 'clear'アクション以外の場合のみbodyを追加
            options.body = JSON.stringify(prizeData);
        }
        
        try {
            const response = await fetch(`${SCRIPT_URL}?sheet=${sheetName}&action=${actionType}`, options);
            const data = await response.json(); // FlaskはJSON応答を返す
            if (response.ok) {
                return data.success;
            } else {
                console.error(`Failed to save prize to ${sheetName}:`, data.message);
                alert(`景品（${sheetName}）の保存に失敗しました: ` + data.message);
                return false;
            }
        } catch (error) {
            console.error(`Network or parsing error saving prize to ${sheetName}:`, error);
            alert(`サーバーへの接続に失敗しました。サーバーが起動しているか確認してください。`);
            return false;
        }
    };

    // マスター景品リストを画面に表示する関数 (選択用)
    const renderMasterPrizeSelectionList = async () => {
        masterPrizeListSelectionUl.innerHTML = '';
        const masterPrizes = await loadPrizesFromSheet('MasterPrizes'); 

        if (masterPrizes.length === 0) {
            const li = document.createElement('li');
            li.textContent = '管理者画面で景品が登録されていません。';
            li.classList.add('no-prizes');
            masterPrizeListSelectionUl.appendChild(li);
            return;
        }

        masterPrizes.forEach((prize) => { 
            const li = document.createElement('li');
            
            const prizeInfoDiv = document.createElement('div');
            prizeInfoDiv.classList.add('prize-info');

            const nameSpan = document.createElement('span');
            nameSpan.textContent = prize.name;
            prizeInfoDiv.appendChild(nameSpan);

            if (prize.imageUrl) {
                const img = document.createElement('img');
                img.src = prize.imageUrl;
                img.alt = prize.name;
                img.classList.add('prize-thumbnail');
                prizeInfoDiv.appendChild(img);
            }

            li.appendChild(prizeInfoDiv);

            // 「追加」ボタンを作成
            const addButton = document.createElement('button');
            addButton.textContent = '今回の抽選会に追加';
            addButton.classList.add('add-to-event-button');
            addButton.addEventListener('click', async () => {
                await addPrizeToEvent(prize); 
            });

            li.appendChild(addButton);
            masterPrizeListSelectionUl.appendChild(li);
        });
    };

    // 今回の抽選会で使用する景品リストを画面に表示する関数
    const renderEventPrizeList = async () => {
        eventPrizeListUl.innerHTML = '';
        const eventPrizes = await loadPrizesFromSheet('EventPrizes'); 

        if (eventPrizes.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'まだ今回の抽選会景品が設定されていません。';
            li.classList.add('no-prizes');
            eventPrizeListUl.appendChild(li);
            return;
        }

        eventPrizes.forEach((prize) => { 
            const li = document.createElement('li');
            
            const prizeInfoDiv = document.createElement('div');
            prizeInfoDiv.classList.add('prize-info');

            const nameSpan = document.createElement('span');
            nameSpan.textContent = prize.name;
            prizeInfoDiv.appendChild(nameSpan);

            if (prize.imageUrl) {
                const img = document.createElement('img');
                img.src = prize.imageUrl;
                img.alt = prize.name;
                img.classList.add('prize-thumbnail');
                prizeInfoDiv.appendChild(img);
            }

            li.appendChild(prizeInfoDiv);

            // 削除ボタンを作成
            const deleteButton = document.createElement('button');
            deleteButton.textContent = '削除';
            deleteButton.classList.add('delete-button');
            deleteButton.addEventListener('click', async () => {
                await deletePrizeFromEvent(prize.name); 
            });

            li.appendChild(deleteButton);
            eventPrizeListUl.appendChild(li);
        });
    };

    // マスター景品を抽選会リストに追加する処理
    const addPrizeToEvent = async (prizeToAdd) => {
        const eventPrizes = await loadPrizesFromSheet('EventPrizes');
        if (eventPrizes.some(p => p.name === prizeToAdd.name)) {
            alert(`「${prizeToAdd.name}」は既に追加されています。`);
            return;
        }
        const success = await savePrizeToSheet('EventPrizes', prizeToAdd, 'add');
        if (success) {
            alert(`「${prizeToAdd.name}」を今回の抽選会景品に追加しました。`);
            renderEventPrizeList();
        } else {
            alert('景品の追加に失敗しました。');
        }
    };

    // カスタム景品を抽選会リストに追加する処理
    const addCustomPrizeToEvent = async () => {
        const prizeName = customPrizeNameInput.value.trim();
        const prizeImageUrl = customPrizeImageInput.value.trim();

        if (prizeName) {
            const eventPrizes = await loadPrizesFromSheet('EventPrizes');
            if (eventPrizes.some(p => p.name === prizeName)) {
                alert(`「${prizeName}」は既に追加されています。`);
                return;
            }
            const success = await savePrizeToSheet('EventPrizes', { name: prizeName, imageUrl: prizeImageUrl }, 'add');
            if (success) {
                alert(`「${prizeName}」をカスタム景品として追加しました。`);
                customPrizeNameInput.value = '';
                customPrizeImageInput.value = '';
                renderEventPrizeList();
            } else {
                alert('カスタム景品の追加に失敗しました。');
            }
        } else {
            alert('カスタム景品名を入力してください。');
        }
    };

    // 抽選会リストから景品を削除する処理
    const deletePrizeFromEvent = async (prizeNameToDelete) => {
        if (confirm(`「${prizeNameToDelete}」を今回の抽選会景品から削除してもよろしいですか？`)) {
            const success = await savePrizeToSheet('EventPrizes', { name: prizeNameToDelete }, 'delete'); 
            if (success) {
                alert('景品を削除しました。');
                renderEventPrizeList();
            } else {
                alert('景品の削除に失敗しました。');
            }
        }
    };

    // 今回の抽選会景品を全てクリアする処理
    const clearAllEventPrizes = async () => {
        if (confirm('今回の抽選会に設定された全ての景品を削除してもよろしいですか？\n（これはGoogleスプレッドシートからデータを削除します）')) {
            const success = await savePrizeToSheet('EventPrizes', {}, 'clear'); 
            if (success) {
                alert('今回の抽選会景品がクリアされました。');
                await savePrizeToSheet('DrawnPrizes', {}, 'clear'); 
                renderEventPrizeList();
            } else {
                alert('今回の抽選会景品のクリアに失敗しました。');
            }
        }
    };

    // イベントリスナーの設定
    addCustomPrizeButton.addEventListener('click', addCustomPrizeToEvent);
    customPrizeNameInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addCustomPrizeToEvent();
        }
    });
    customPrizeImageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addCustomPrizeToEvent();
        }
    });
    clearEventPrizesButton.addEventListener('click', clearAllEventPrizes);

    // ページロード時にリストを初期表示
    renderMasterPrizeSelectionList(); 
    renderEventPrizeList();           
>>>>>>> 5ef1904e5a422401ac240c7374456967753effc4
});