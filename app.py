# app.py (Flask API サーバーのコード - 最新で完全に動作する最終版)

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os

app = Flask(__name__)
# CORS設定: 全てのオリジンからのアクセスを許可 (開発・テスト用)
CORS(app) 

# データファイルが保存されるディレクトリのパス
DATA_DIR = 'data'
# データファイル名 (JSON形式)
MASTER_PRIZES_FILE = os.path.join(DATA_DIR, 'master_prizes.json')
EVENT_PRIZES_FILE = os.path.join(DATA_DIR, 'event_prizes.json')
DRAWN_PRIZES_FILE = os.path.join(DATA_DIR, 'drawn_prizes.json')

# データディレクトリが存在しない場合は作成
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

# ヘルパー関数: JSONファイルを読み込む
def load_data(filepath):
    if not os.path.exists(filepath):
        # ファイルが存在しない場合は空のリストを返す
        return []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except json.JSONDecodeError:
        # JSON形式が不正な場合は空のリストを返す（またはエラーハンドリング）
        app.logger.error(f"JSONDecodeError: Invalid JSON in {filepath}. Returning empty list.")
        return []
    except Exception as e: # その他のファイル読み込みエラー
        app.logger.error(f"Error loading data from {filepath}: {e}")
        return []

# ヘルパー関数: JSONファイルを書き込む
def save_data(filepath, data):
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
    except Exception as e: # ファイル書き込みエラー
        app.logger.error(f"Error saving data to {filepath}: {e}")

# ヘルパー関数: シート名に対応するファイルパスを返す
def get_filepath_from_sheetname(sheet_name):
    if sheet_name == 'MasterPrizes':
        return MASTER_PRIZES_FILE
    elif sheet_name == 'EventPrizes':
        return EVENT_PRIZES_FILE
    elif sheet_name == 'DrawnPrizes':
        return DRAWN_PRIZES_FILE
    else:
        return None # 不正なシート名

# GETリクエストを処理（データの読み込み）
@app.route('/data/', methods=['GET']) # /api/data から /api/ に変更
def get_data():
    sheet_name = request.args.get('sheet')
    
    if not sheet_name:
        return jsonify({'success': False, 'message': 'Sheet name is required.'}), 400
    
    filepath = get_filepath_from_sheetname(sheet_name)
    if not filepath:
        return jsonify({'success': False, 'message': 'Invalid sheet name.'}), 400
    
    data = load_data(filepath)
    return jsonify({'success': True, 'data': data})

# POSTリクエストを処理（データの追加、更新、削除、クリア）
@app.route('/data/', methods=['POST']) # /api/data から /api/ に変更
def post_data():
    sheet_name = request.args.get('sheet')
    action = request.args.get('action')
    
    if not sheet_name or not action:
        return jsonify({'success': False, 'message': 'Sheet name and action are required.'}), 400

    filepath = get_filepath_from_sheetname(sheet_name)
    if not filepath:
        return jsonify({'success': False, 'message': 'Invalid sheet name.'}), 400

    data = load_data(filepath)
    
    # clearアクションを最初にチェックする (payloadが不要なため)
    if action == 'clear':
        save_data(filepath, []) # ファイルを空のリストで上書き
        return jsonify({'success': True, 'message': 'All data cleared.'}), 200
    
    # clear以外の add/update/delete は payload が必須
    # request.get_json(silent=True) でJSONデコードエラーをNoneで返す
    payload = request.get_json(silent=True) 
    if not payload: # payload がない場合、エラーを返す
        return jsonify({'success': False, 'message': 'Invalid JSON payload or empty body for this action.'}), 400

    if action == 'add':
        if not payload.get('name'): # nameがなければエラー
            return jsonify({'success': False, 'message': 'Invalid payload for add action (name is missing).'}), 400
        
        # 重複チェック (nameをキーとして)
        if any(item.get('name') == payload.get('name') for item in data):
            return jsonify({'success': False, 'message': f'Item with name "{payload.get("name")}" already exists.'}), 409 # Conflict
        data.append(payload)
        save_data(filepath, data)
        return jsonify({'success': True, 'message': 'Data added.'})
    
    elif action == 'update':
        if not payload.get('name'):
            return jsonify({'success': False, 'message': 'Invalid payload for update action (name is missing).'}), 400
        updated = False
        for i, item in enumerate(data):
            if item.get('name') == payload.get('name'):
                data[i].update(payload)
                updated = True
                break
        save_data(filepath, data)
        return jsonify({'success': updated, 'message': 'Data updated.' if updated else 'Data not found for update.'})

    elif action == 'delete':
        if not payload.get('name'):
            return jsonify({'success': False, 'message': 'Invalid payload for delete action (name is missing).'}), 400
        original_len = len(data)
        data = [item for item in data if item.get('name') != payload.get('name')]
        deleted = len(data) < original_len
        save_data(filepath, data)
        return jsonify({'success': deleted, 'message': 'Data deleted.' if deleted else 'Data not found for delete.'})
    
    else: # 未定義のアクション
        return jsonify({'success': False, 'message': 'Invalid action.'}), 400

# 静的ファイル (HTML, CSS, JS) を提供する (開発用)
# これにより、Flaskサーバー自体がadmin.html, index.htmlなどを提供できるようになる
@app.route('/')
def serve_index():
    return send_from_directory('.', 'admin.html') # デフォルトでadmin.htmlを開く

@app.route('/<path:filename>')
def serve_static(filename):
    # フォルダ内の全てのファイルを許可
    return send_from_directory('.', filename)

if __name__ == '__main__':
    # ローカル開発環境でのみapp.run()を使用し、Renderではgunicornがアプリを起動する
    # Renderは'gunicorn app:app'コマンドを実行するため、ここではapp.run()は不要
    # ただし、ローカルテストのために残す場合は以下のように条件分岐させる
    if os.environ.get("RENDER"): # Render環境の場合
        # Renderではgunicornがアプリを起動するため、app.run()は呼び出さない
        pass
    else: # ローカル環境の場合
        port = int(os.environ.get("PORT", 5000))
        app.run(host='0.0.0.0', port=port, debug=True) # debug=True を再度追加してローカルデバッグしやすく