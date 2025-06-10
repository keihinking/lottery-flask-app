// admin.js (完全版)

document.addEventListener('DOMContentLoaded', () => {
    // ★★★ ここをあなたのFlaskサーバーのURLに置き換えてください ★★★
    const SCRIPT_URL = 'https://lottery-app-online.onrender.com/api/'; 
    // 例: http://127.0.0.1:5000/api/

    const prizeNameInput = document.getElementById('prize-name-input');
    const prizeImageInput = document.getElementById('prize-image-input');
    const addPrizeButton = document.getElementById('add-prize-button');
    const masterPrizeListUl = document.getElementById('master-prize-list');
    const clearMasterPrizesButton = document.getElementById('clear-master-prizes-button');

    // Flaskサーバーから景品データを読み込む関数
    const loadMasterPrizes = async () => {
        try {
            const response = await fetch(`${SCRIPT_URL}?sheet=MasterPrizes`); // GETリクエスト
            const data = await response.json();
            if (response.ok) { // HTTPステータスが200番台なら成功
                return data.data; // Flaskの応答は {success: true, data: [...]} 形式
            } else {
                console.error('Failed to load master prizes:', data.message);
                alert('マスター景品の読み込みに失敗しました: ' + data.message);
                return [];
            }
        } catch (error) {
            console.error('Error fetching master prizes:', error);
            alert('サーバーへの接続に失敗しました。サーバーが起動しているか確認してください。');
            return [];
        }
    };

    // Flaskサーバーに景品データを保存する関数
    const saveMasterPrize = async (prizeData, actionType) => {
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
            const response = await fetch(`${SCRIPT_URL}?sheet=MasterPrizes&action=${actionType}`, options);
            const data = await response.json(); // FlaskはJSON応答を返す
            if (response.ok) {
                return data.success;
            } else {
                console.error('Failed to save master prize:', data.message);
                alert('マスター景品の保存に失敗しました: ' + data.message);
                return false;
            }
        } catch (error) {
            console.error('Error saving master prize:', error);
            alert('サーバーへの接続に失敗しました。サーバーが起動しているか確認してください。');
            return false;
        }
    };

    // 景品リストを画面に表示する関数
    const renderMasterPrizeList = async () => {
        masterPrizeListUl.innerHTML = ''; // リストをクリア
        const prizes = await loadMasterPrizes(); // マスター景品を読み込む

        if (prizes.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'まだ景品が登録されていません。';
            li.classList.add('no-prizes');
            masterPrizeListUl.appendChild(li);
            return;
        }

        prizes.forEach((prize, index) => {
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
                if (confirm(`「${prize.name}」をマスター景品リストから削除してもよろしいですか？`)) {
                    const success = await saveMasterPrize({ name: prize.name }, 'delete');
                    if (success) {
                        alert('景品を削除しました。');
                        renderMasterPrizeList(); 
                    } else {
                        alert('景品の削除に失敗しました。');
                    }
                }
            });

            li.appendChild(deleteButton);
            masterPrizeListUl.appendChild(li);
        });
    };

    // 景品を追加する処理
    const addPrize = async () => {
        const prizeName = prizeNameInput.value.trim();
        const prizeImageUrl = prizeImageInput.value.trim();

        if (prizeName) {
            const prizes = await loadMasterPrizes();
            if (prizes.some(p => p.name === prizeName)) {
                alert(`「${prizeName}」は既に登録されています。`);
                return;
            }
            const success = await saveMasterPrize({ name: prizeName, imageUrl: prizeImageUrl }, 'add');
            if (success) {
                alert('景品を追加しました。');
                prizeNameInput.value = '';
                prizeImageInput.value = '';
                renderMasterPrizeList();
            } else {
                alert('景品の追加に失敗しました。');
            }
        } else {
            alert('景品名を入力してください。');
        }
    };

    // 全ての景品をクリアする処理
    const clearAllMasterPrizes = async () => {
        if (confirm('全てのマスター景品を削除してもよろしいですか？\n（これはサーバー上のデータを削除します）')) {
            const success = await saveMasterPrize({}, 'clear'); 
            if (success) {
                alert('全てのマスター景品をクリアしました。');
                renderMasterPrizeList(); 
            } else {
                alert('マスター景品のクリアに失敗しました。');
            }
        }
    };

    // イベントリスナーの設定
    addPrizeButton.addEventListener('click', addPrize);
    prizeNameInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addPrize();
        }
    });
    prizeImageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addPrize();
        }
    });
    clearMasterPrizesButton.addEventListener('click', clearAllMasterPrizes);

    // ページロード時に景品リストを初期表示
    renderMasterPrizeList();
});