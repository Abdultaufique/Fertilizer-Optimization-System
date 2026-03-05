import sqlite3
from datetime import datetime

DB_PATH = "farmer_history.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            crop TEXT,
            area REAL,
            soil_n REAL,
            soil_p REAL,
            soil_k REAL,
            urea_kg REAL,
            dap_kg REAL,
            mop_kg REAL,
            n_deficit REAL,
            p_deficit REAL,
            k_deficit REAL,
            soil_health_score INTEGER,
            estimated_cost_inr REAL,
            recommended_fertilizer TEXT,
            created_at TEXT
        )
    ''')
    conn.commit()
    conn.close()

def save_prediction(data: dict, inputs: dict):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    crop = inputs.get('crop_type') or inputs.get('crop', 'unknown')
    fert = data.get('fertilizer_required', {})
    deficit = data.get('nutrient_deficit', {})
    ml = data.get('ml_prediction', {})
    cursor.execute('''
        INSERT INTO history (
            crop, area, soil_n, soil_p, soil_k,
            urea_kg, dap_kg, mop_kg,
            n_deficit, p_deficit, k_deficit,
            soil_health_score, estimated_cost_inr,
            recommended_fertilizer, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        crop,
        inputs.get('area', 0),
        inputs.get('soil_n', 0),
        inputs.get('soil_p', 0),
        inputs.get('soil_k', 0),
        fert.get('urea_kg', 0),
        fert.get('dap_kg', 0),
        fert.get('mop_kg', 0),
        deficit.get('N', 0),
        deficit.get('P', 0),
        deficit.get('K', 0),
        data.get('soil_health_score', 0),
        data.get('estimated_cost_inr', 0),
        ml.get('recommended_fertilizer', 'N/A'),
        datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ))
    conn.commit()
    conn.close()

def get_all_history():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM history ORDER BY created_at DESC')
    rows = cursor.fetchall()
    conn.close()
    return [
        {
            "id": row[0],
            "crop": row[1],
            "area": row[2],
            "soil_n": row[3],
            "soil_p": row[4],
            "soil_k": row[5],
            "urea_kg": row[6],
            "dap_kg": row[7],
            "mop_kg": row[8],
            "n_deficit": row[9],
            "p_deficit": row[10],
            "k_deficit": row[11],
            "soil_health_score": row[12],
            "estimated_cost_inr": row[13],
            "recommended_fertilizer": row[14],
            "created_at": row[15],
        }
        for row in rows
    ]