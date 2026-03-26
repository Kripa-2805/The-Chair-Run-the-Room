from flask import Flask, render_template, request, jsonify
import sqlite3
import os

app = Flask(__name__)
DB_PATH = 'mun.db'

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        conn.execute('''CREATE TABLE IF NOT EXISTS gsl (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            country TEXT NOT NULL,
            position INTEGER NOT NULL,
            status TEXT DEFAULT 'waiting',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )''')
        conn.execute('''CREATE TABLE IF NOT EXISTS session_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event TEXT NOT NULL,
            country TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )''')
        conn.commit()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/gsl', methods=['GET'])
def get_gsl():
    with get_db() as conn:
        rows = conn.execute('SELECT * FROM gsl ORDER BY position ASC').fetchall()
    return jsonify([dict(r) for r in rows])

@app.route('/api/gsl/add', methods=['POST'])
def add_country():
    data = request.json
    country = data.get('country', '').strip()
    if not country:
        return jsonify({'error': 'Country name required'}), 400
    with get_db() as conn:
        max_pos = conn.execute('SELECT MAX(position) FROM gsl').fetchone()[0] or 0
        conn.execute('INSERT INTO gsl (country, position) VALUES (?, ?)', (country, max_pos + 1))
        conn.execute('INSERT INTO session_log (event, country) VALUES (?, ?)', ('ADDED', country))
        conn.commit()
    return jsonify({'success': True})

@app.route('/api/gsl/remove/<int:gsl_id>', methods=['DELETE'])
def remove_country(gsl_id):
    with get_db() as conn:
        row = conn.execute('SELECT country FROM gsl WHERE id=?', (gsl_id,)).fetchone()
        if row:
            conn.execute('DELETE FROM gsl WHERE id=?', (gsl_id,))
            conn.execute('INSERT INTO session_log (event, country) VALUES (?, ?)', ('REMOVED', row['country']))
            conn.execute('''UPDATE gsl SET position = position - 1 WHERE position > (
                SELECT position FROM gsl WHERE id=?
            )''', (gsl_id,))
            conn.commit()
    return jsonify({'success': True})

@app.route('/api/gsl/move-bottom/<int:gsl_id>', methods=['POST'])
def move_to_bottom(gsl_id):
    with get_db() as conn:
        row = conn.execute('SELECT * FROM gsl WHERE id=?', (gsl_id,)).fetchone()
        if row:
            max_pos = conn.execute('SELECT MAX(position) FROM gsl').fetchone()[0] or 0
            old_pos = row['position']
            conn.execute('UPDATE gsl SET position = position - 1 WHERE position > ?', (old_pos,))
            conn.execute('UPDATE gsl SET position = ? WHERE id=?', (max_pos, gsl_id))
            conn.execute('INSERT INTO session_log (event, country) VALUES (?, ?)', ('MOVED_BOTTOM', row['country']))
            conn.commit()
    return jsonify({'success': True})

@app.route('/api/gsl/yield', methods=['POST'])
def handle_yield():
    data = request.json
    yield_type = data.get('type')
    target = data.get('target', '')
    with get_db() as conn:
        if yield_type == 'chair':
            # Remove current speaker, advance queue
            first = conn.execute('SELECT * FROM gsl WHERE position=1').fetchone()
            if first:
                conn.execute('DELETE FROM gsl WHERE id=?', (first['id'],))
                conn.execute('UPDATE gsl SET position = position - 1')
                conn.execute('INSERT INTO session_log (event, country) VALUES (?, ?)', ('YIELD_CHAIR', first['country']))
        elif yield_type == 'delegate':
            # Change current speaker to target, keep time
            first = conn.execute('SELECT * FROM gsl WHERE position=1').fetchone()
            if first and target:
                conn.execute('UPDATE gsl SET country=? WHERE id=?', (target, first['id']))
                conn.execute('INSERT INTO session_log (event, country) VALUES (?, ?)', (f'YIELD_DELEGATE:{target}', first['country']))
        elif yield_type == 'questions':
            first = conn.execute('SELECT * FROM gsl WHERE position=1').fetchone()
            if first:
                conn.execute('INSERT INTO session_log (event, country) VALUES (?, ?)', ('YIELD_QUESTIONS', first['country']))
        conn.commit()
    return jsonify({'success': True})

@app.route('/api/log', methods=['GET'])
def get_log():
    with get_db() as conn:
        rows = conn.execute('SELECT * FROM session_log ORDER BY id DESC LIMIT 50').fetchall()
    return jsonify([dict(r) for r in rows])

@app.route('/api/clear', methods=['POST'])
def clear_gsl():
    with get_db() as conn:
        conn.execute('DELETE FROM gsl')
        conn.execute('INSERT INTO session_log (event) VALUES (?)', ('GSL_CLEARED',))
        conn.commit()
    return jsonify({'success': True})

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)
