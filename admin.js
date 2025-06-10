<<<<<<< HEAD
// admin.js (Flaskサーバー対応版)

document.addEventListener('DOMContentLoaded', () => {
    const prizeNameInput = document.getElementById('prize-name-input');
    const prizeImageInput = document.getElementById('prize-image-input');
    const addPrizeButton = document.getElementById('add-prize-button');
    const masterPrizeList = document.getElementById('master-prize-list');
    const clearMasterPrizesButton = document.getElementById('clear-master-prizes-button');

    const SCRIPT_URL = 'http://127.0.0.1:5000/api/'; // ★重要！末尾に 'api/' とスラッシュまで含める★

    // 景品データを取得して表示する関数
    const fetchPrizes = async () => {
        try {
            const response = await fetch(`${SCRIPT_URL}?sheet=MasterPrizes`); // GETリクエスト
            const data = await response.json();
            if (response.ok) {
                renderPrizes(data.data);
            } else {
                console.error('Failed to load prizes:', data.message);
                alert('景品の読み込みに失敗しました: ' + data.message);
            }
        } catch (error) {
            console.error('Error fetching prizes:', error);
            alert('サーバーへの接続に失敗しました。サーバーが起動しているか確認してください。');
        }
    };

    // 景品リストを画面に表示する関数
    const renderPrizes = (prizes) => {
        masterPrizeList.innerHTML = '';
        if (prizes.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'まだ景品が登録されていません。';
            masterPrizeList.appendChild(li);
        } else {
            prizes.forEach(prize => {
                const li = document.createElement('li');
                li.textContent = `${prize.name} ${prize.imageUrl ? `(${prize.imageUrl})` : ''}`;
                masterPrizeList.appendChild(li);
            });
        }
    };

    // 景品を追加する関数
    const addPrize = async () => {
        const prizeName = prizeNameInput.value.trim();
        const prizeImageUrl = prizeImageInput.value.trim();

        if (prizeName) {
            try {
                const response = await fetch(`${SCRIPT_URL}?sheet=MasterPrizes&action=add`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: prizeName, imageUrl: prizeImageUrl })
                });
                const data = await response.json();

                if (response.ok) {
                     alert('景品を追加しました。');
                     prizeNameInput.value = '';
                     prizeImageInput.value = '';
                     fetchPrizes(); // リストを更新
                } else {
                    console.error('Failed to add prize:', data.message);
                    alert('景品の追加に失敗しました: ' + data.message);
                }
            } catch (error) {
                console.error('Error adding prize:', error);
                 alert('サーバーへの接続に失敗しました。サーバーが起動しているか確認してください。');
            }
        }
    };

    // 全ての景品をクリアする関数
    const clearAllPrizes = async () => {
         if (confirm('全ての景品を削除してもよろしいですか？')) {
            try {
                const response = await fetch(`${SCRIPT_URL}?sheet=MasterPrizes&action=clear`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                const data = await response.json();

                if (response.ok) {
                    alert('全ての景品をクリアしました。');
                     fetchPrizes(); // リストを更新
                } else {
                    console.error('Failed to clear prizes:', data.message);
                    alert('景品のクリアに失敗しました: ' + data.message);
                }
            } catch (error) {
                console.error('Error clearing prizes:', error);
                 alert('サーバーへの接続に失敗しました。サーバーが起動しているか確認してください。');
            }
        }
    };

    // イベントリスナーの設定
    addPrizeButton.addEventListener('click', addPrize);
    clearMasterPrizesButton.addEventListener('click', clearAllPrizes);

    // 初期表示
    fetchPrizes();
=======
// admin.js (Flaskサーバー対応版)

document.addEventListener('DOMContentLoaded', () => {
    const prizeNameInput = document.getElementById('prize-name-input');
    const prizeImageInput = document.getElementById('prize-image-input');
    const addPrizeButton = document.getElementById('add-prize-button');
    const masterPrizeList = document.getElementById('master-prize-list');
    const clearMasterPrizesButton = document.getElementById('clear-master-prizes-button');

    const SCRIPT_URL = 'http://127.0.0.1:5000/api/'; // ★重要！末尾に 'api/' とスラッシュまで含める★

    // 景品データを取得して表示する関数
    const fetchPrizes = async () => {
        try {
            const response = await fetch(`${SCRIPT_URL}?sheet=MasterPrizes`); // GETリクエスト
            const data = await response.json();
            if (response.ok) {
                renderPrizes(data.data);
            } else {
                console.error('Failed to load prizes:', data.message);
                alert('景品の読み込みに失敗しました: ' + data.message);
            }
        } catch (error) {
            console.error('Error fetching prizes:', error);
            alert('サーバーへの接続に失敗しました。サーバーが起動しているか確認してください。');
        }
    };

    // 景品リストを画面に表示する関数
    const renderPrizes = (prizes) => {
        masterPrizeList.innerHTML = '';
        if (prizes.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'まだ景品が登録されていません。';
            masterPrizeList.appendChild(li);
        } else {
            prizes.forEach(prize => {
                const li = document.createElement('li');
                li.textContent = `${prize.name} ${prize.imageUrl ? `(${prize.imageUrl})` : ''}`;
                masterPrizeList.appendChild(li);
            });
        }
    };

    // 景品を追加する関数
    const addPrize = async () => {
        const prizeName = prizeNameInput.value.trim();
        const prizeImageUrl = prizeImageInput.value.trim();

        if (prizeName) {
            try {
                const response = await fetch(`${SCRIPT_URL}?sheet=MasterPrizes&action=add`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: prizeName, imageUrl: prizeImageUrl })
                });
                const data = await response.json();

                if (response.ok) {
                     alert('景品を追加しました。');
                     prizeNameInput.value = '';
                     prizeImageInput.value = '';
                     fetchPrizes(); // リストを更新
                } else {
                    console.error('Failed to add prize:', data.message);
                    alert('景品の追加に失敗しました: ' + data.message);
                }
            } catch (error) {
                console.error('Error adding prize:', error);
                 alert('サーバーへの接続に失敗しました。サーバーが起動しているか確認してください。');
            }
        }
    };

    // 全ての景品をクリアする関数
    const clearAllPrizes = async () => {
         if (confirm('全ての景品を削除してもよろしいですか？')) {
            try {
                const response = await fetch(`${SCRIPT_URL}?sheet=MasterPrizes&action=clear`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                const data = await response.json();

                if (response.ok) {
                    alert('全ての景品をクリアしました。');
                     fetchPrizes(); // リストを更新
                } else {
                    console.error('Failed to clear prizes:', data.message);
                    alert('景品のクリアに失敗しました: ' + data.message);
                }
            } catch (error) {
                console.error('Error clearing prizes:', error);
                 alert('サーバーへの接続に失敗しました。サーバーが起動しているか確認してください。');
            }
        }
    };

    // イベントリスナーの設定
    addPrizeButton.addEventListener('click', addPrize);
    clearMasterPrizesButton.addEventListener('click', clearAllPrizes);

    // 初期表示
    fetchPrizes();
>>>>>>> 5ef1904e5a422401ac240c7374456967753effc4
});