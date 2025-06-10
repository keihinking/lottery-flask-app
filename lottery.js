// lottery.js (完全版)

document.addEventListener('DOMContentLoaded', () => {
    // ★★★ ここをあなたのFlaskサーバーのURLに置き換えてください ★★★
    // 例: const SCRIPT_URL = 'https://lottery-app-online.onrender.com/api/'; 
    const SCRIPT_URL = 'http://127.0.0.1:5000/api/'; 

    const rouletteItemsTrack = document.getElementById('roulette-items-track'); 
    const drawButton = document.getElementById('draw-button');
    const resetDrawingButton = document.getElementById('reset-drawing-button');
    const drawnPrizesListUl = document.getElementById('drawn-prizes-list');

    let allRegisteredPrizes = []; // EventPrizesシートから読み込む全景品
    let availablePrizes = [];     // 抽選可能な景品 (抽選前に毎回更新)
    let drawnPrizes = [];         // 抽選済みの景品

    // アニメーション用の変数
    let animationFrameId; 
    let animationStartTime;
    const ANIMATION_DURATION_MS = 6000; 
    const ITEM_WIDTH_PX = 160; // 各景品アイテムの横幅（CSSの.roulette-itemのwidth + margin-left/rightの合計）

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

    // ゲーム（抽選）の初期化
    const initializeLottery = async () => { 
        allRegisteredPrizes = await loadPrizesFromSheet('EventPrizes'); // EventPrizesシートから読み込む
        drawnPrizes = await loadPrizesFromSheet('DrawnPrizes');       // DrawnPrizesシートから読み込む

        // まだ抽選されていない景品を特定 (オブジェクトを比較するためnameで比較)
        availablePrizes = allRegisteredPrizes.filter(prize =>
            !drawnPrizes.some(drawn => drawn.name === prize.name)
        );

        // 表示をリセット
        drawButton.disabled = false;
        drawButton.textContent = '抽選！';
        
        // アニメーションが残っていたら停止
        cancelAnimationFrame(animationFrameId); 
        rouletteItemsTrack.innerHTML = ''; 
        rouletteItemsTrack.style.left = '0px'; 

        // ルーレットアイテムの生成と配置
        renderRouletteItems(availablePrizes);

        renderDrawnPrizesList(); 

        // 抽選可能な景品がない場合のメッセージ
        if (availablePrizes.length === 0 && allRegisteredPrizes.length > 0) {
            drawButton.disabled = true;
            drawButton.textContent = '全ての景品が抽選されました！';
            rouletteItemsTrack.innerHTML = '<span class="message">終了！</span>'; 
        } else if (allRegisteredPrizes.length === 0) {
            drawButton.disabled = true;
            drawButton.textContent = '景品が登録されていません';
            rouletteItemsTrack.innerHTML = '<span class="message">景品を登録してください</span>';
        }
    };

    // ルーレットアイテムを生成し、トラックに配置する関数
    const renderRouletteItems = (prizesToDisplay) => {
        rouletteItemsTrack.innerHTML = ''; 

        if (prizesToDisplay.length === 0) {
             rouletteItemsTrack.innerHTML = '<span class="message">抽選可能な景品がありません</span>';
             return;
        }
        
        const numCopies = Math.max(20, Math.ceil(10000 / (prizesToDisplay.length * ITEM_WIDTH_PX))); 
        
        for(let i = 0; i < numCopies; i++) {
            prizesToDisplay.forEach((prize, index) => {
                const item = document.createElement('div');
                item.classList.add('roulette-item');
                item.dataset.prizeName = prize.name; 
                item.dataset.originalIndex = index; 

                if (prize.imageUrl) {
                    const img = document.createElement('img');
                    img.src = prize.imageUrl;
                    img.alt = prize.name;
                    item.appendChild(img);
                } else {
                    const nameSpan = document.createElement('span');
                    nameSpan.textContent = prize.name;
                    item.appendChild(nameSpan);
                }
                rouletteItemsTrack.appendChild(item);
            });
        }
    };

    // 抽選済み景品リストを画面に表示する関数
    const renderDrawnPrizesList = () => {
        drawnPrizesListUl.innerHTML = '';
        if (drawnPrizes.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'まだ抽選された景品はありません。';
            li.classList.add('no-prizes-drawn');
            drawnPrizesListUl.appendChild(li);
            return;
        }
        drawnPrizes.forEach(prize => {
            const li = document.createElement('li');
            li.textContent = prize.name;
            drawnPrizesListUl.appendChild(li);
        });
    };

    // 景品を抽選し、ルーレットアニメーションを開始する関数
    const drawPrize = async () => { 
        if (availablePrizes.length === 0) {
            drawButton.disabled = true;
            drawButton.textContent = '全ての景品が抽選されました！';
            rouletteItemsTrack.innerHTML = '<span class="message">終了！</span>';
            alert('全ての景品が抽選されました！抽選をリセットしてください。');
            return;
        }

        drawButton.disabled = true;
        drawButton.textContent = '抽選中...';

        // 最終的に表示する景品を決定
        const randomIndex = Math.floor(Math.random() * availablePrizes.length);
        const finalDrawnPrize = availablePrizes[randomIndex]; 

        // 抽選済みに景品を追加
        drawnPrizes.push(finalDrawnPrize);
        const saveSuccess = await savePrizeToSheet('DrawnPrizes', finalDrawnPrize, 'add'); 
        if (!saveSuccess) {
            alert('抽選結果の保存に失敗しました。');
        }

        availablePrizes = availablePrizes.filter(p => p.name !== finalDrawnPrize.name);

        // ルーレットの最終的な停止位置を計算
        const rouletteContainerWidth = rouletteItemsTrack.parentElement.clientWidth; 
        const indicatorFrameWidth = 160; 
        const ITEM_MARGIN_PX = 5; 
        
        const currentItems = Array.from(rouletteItemsTrack.children).filter(el => el.classList.contains('roulette-item'));
        
        const finalPrizeOriginalIndex = allRegisteredPrizes.findIndex(p => p.name === finalDrawnPrize.name);

        if (finalPrizeOriginalIndex === -1) {
            console.error('Final prize original index not found. This should not happen. Re-initializing.');
            drawButton.disabled = false;
            drawButton.textContent = '抽選失敗！再度お試しください';
            // 抽選失敗の場合、DrawnPrizesへの追加を取り消す
            drawnPrizes.pop(); 
            await savePrizeToSheet('DrawnPrizes', finalDrawnPrize, 'delete'); 
            initializeLottery(); 
            return;
        }
        
        const centerOffsetForPrizeLeftEdge = (rouletteContainerWidth / 2) - (ITEM_WIDTH_PX / 2);

        const numRotations = Math.floor(Math.random() * 6) + 5; 
        
        const targetItemIndexInTrack = (numRotations * allRegisteredPrizes.length) + finalPrizeOriginalIndex;
        
        const targetScrollLeft = targetItemIndexInTrack * ITEM_WIDTH_PX;

        // ★この行が、以前の調整で修正した最終停止位置の計算式です。
        // これで正しいはずですが、もしずれる場合はここを再調整します。
        let targetPosition = -(targetScrollLeft - centerOffsetForPrizeLeftEdge); 

        animationStartTime = Date.now();
        let currentPosition = 0; 

        const animateRoulette = () => {
            const elapsedTime = Date.now() - animationStartTime;
            
            if (elapsedTime < ANIMATION_DURATION_MS) {
                const progress = elapsedTime / ANIMATION_DURATION_MS;
                const easing = 1 - Math.pow(1 - progress, 3); 

                currentPosition = easing * targetPosition; 

                rouletteItemsTrack.style.left = `${currentPosition}px`;
                animationFrameId = requestAnimationFrame(animateRoulette);
            } else {
                cancelAnimationFrame(animationFrameId);
                rouletteItemsTrack.style.left = `${targetPosition}px`; 

                renderDrawnPrizesList();

                drawButton.disabled = false;
                drawButton.textContent = '抽選！';

                displayPrizeAnimation(finalDrawnPrize);
            }
        };

        animationFrameId = requestAnimationFrame(animateRoulette); 
    };

    // 景品が表示されたときのアニメーション（ハイライト）
    const displayPrizeAnimation = (prize) => {
        const winningItems = document.querySelectorAll(`.roulette-item[data-prize-name="${prize.name}"]`);
        winningItems.forEach(item => {
            item.classList.add('winner-highlight');
        });
        
        setTimeout(() => {
            winningItems.forEach(item => {
                item.classList.remove('winner-highlight');
            });
        }, 2000); 
    };

    // 抽選リセットボタンの処理
    const resetDrawing = async () => { 
        if (confirm('抽選状況を全てリセットし、景品を初期状態に戻しますか？\n（登録された景品自体は削除されません）')) {
            const success = await savePrizeToSheet('DrawnPrizes', {}, 'clear'); 
            if (success) {
                initializeLottery(); 
                alert('抽選状況がリセットされました。');
            } else {
                alert('抽選状況のリセットに失敗しました。');
            }
        }
    };

    // イベントリスナーの設定
    drawButton.addEventListener('click', drawPrize);
    resetDrawingButton.addEventListener('click', resetDrawing);

    // ページロード時に抽選を初期化
    initializeLottery();
});