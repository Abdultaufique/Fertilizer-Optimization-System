import sqlite3
import hashlib
import os

AUTH_DB_PATH = "auth.db"

def init_auth_db():
    conn = sqlite3.connect(AUTH_DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        )
    ''')
    conn.commit()
    conn.close()

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def create_user(username: str, email: str, password: str):
    conn = sqlite3.connect(AUTH_DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
            (username, email, hash_password(password))
        )
        conn.commit()
        return {"success": True}
    except sqlite3.IntegrityError as e:
        if "username" in str(e):
            return {"success": False, "error": "Username already exists"}
        return {"success": False, "error": "Email already exists"}
    finally:
        conn.close()

def verify_user(username: str, password: str):
    conn = sqlite3.connect(AUTH_DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, username, email FROM users WHERE username = ? AND password_hash = ?",
        (username, hash_password(password))
    )
    user = cursor.fetchone()
    conn.close()
    if user:
        return {"success": True, "user": {"id": user[0], "username": user[1], "email": user[2]}}
    return {"success": False, "error": "Invalid username or password"}
