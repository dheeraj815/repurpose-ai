import sqlite3, os, json
from datetime import date

DB_PATH = os.environ.get("DATABASE_URL", "repurpose.db")

def get_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn(); c = conn.cursor()
    c.execute("""CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL, name TEXT NOT NULL, plan TEXT DEFAULT 'free',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)""")
    c.execute("""CREATE TABLE IF NOT EXISTS generations (
        id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL,
        source_type TEXT NOT NULL, source_content TEXT NOT NULL, source_url TEXT,
        twitter_posts TEXT, linkedin_posts TEXT, instagram_captions TEXT,
        email_newsletters TEXT, tiktok_scripts TEXT, threads_posts TEXT,
        youtube_desc TEXT, blog_summary TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id))""")
    c.execute("""CREATE TABLE IF NOT EXISTS saved_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL,
        generation_id INTEGER, platform TEXT NOT NULL, content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id))""")
    c.execute("""CREATE TABLE IF NOT EXISTS usage_tracking (
        id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL,
        usage_date DATE NOT NULL, count INTEGER DEFAULT 0,
        UNIQUE(user_id, usage_date), FOREIGN KEY (user_id) REFERENCES users(id))""")
    c.execute("""CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL,
        razorpay_order_id TEXT, razorpay_payment_id TEXT, amount INTEGER,
        currency TEXT DEFAULT 'INR', status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id))""")
    conn.commit(); conn.close()

def get_user_by_email(email):
    conn = get_conn(); c = conn.cursor()
    c.execute("SELECT * FROM users WHERE email=?", (email.lower().strip(),))
    row = c.fetchone(); conn.close()
    return dict(row) if row else None

def get_user_by_id(uid):
    conn = get_conn(); c = conn.cursor()
    c.execute("SELECT * FROM users WHERE id=?", (uid,))
    row = c.fetchone(); conn.close()
    return dict(row) if row else None

def create_user(email, pw_hash, name):
    conn = get_conn(); c = conn.cursor()
    try:
        c.execute("INSERT INTO users (email,password_hash,name) VALUES (?,?,?)",
                  (email.lower().strip(), pw_hash, name))
        conn.commit(); uid = c.lastrowid
        return {"success": True, "user_id": uid}
    except sqlite3.IntegrityError:
        return {"success": False, "error": "Email already registered"}
    finally: conn.close()

def upgrade_user_plan(uid, plan):
    conn = get_conn(); c = conn.cursor()
    c.execute("UPDATE users SET plan=? WHERE id=?", (plan, uid))
    conn.commit(); conn.close()

def get_today_usage(uid):
    conn = get_conn(); c = conn.cursor()
    today = date.today().isoformat()
    c.execute("SELECT count FROM usage_tracking WHERE user_id=? AND usage_date=?", (uid, today))
    row = c.fetchone(); conn.close()
    return row["count"] if row else 0

def increment_usage(uid):
    conn = get_conn(); c = conn.cursor()
    today = date.today().isoformat()
    c.execute("""INSERT INTO usage_tracking (user_id,usage_date,count) VALUES (?,?,1)
        ON CONFLICT(user_id,usage_date) DO UPDATE SET count=count+1""", (uid, today))
    conn.commit(); conn.close()

def save_generation(uid, source_type, source_content, results, source_url=None):
    conn = get_conn(); c = conn.cursor()
    c.execute("""INSERT INTO generations
        (user_id,source_type,source_content,source_url,twitter_posts,linkedin_posts,
         instagram_captions,email_newsletters,tiktok_scripts,threads_posts,youtube_desc,blog_summary)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)""", (
        uid, source_type, source_content[:2000], source_url,
        json.dumps(results.get("twitter",[])), json.dumps(results.get("linkedin",[])),
        json.dumps(results.get("instagram",[])), json.dumps(results.get("email",[])),
        json.dumps(results.get("tiktok",[])), json.dumps(results.get("threads",[])),
        results.get("youtube_desc",""), results.get("blog_summary","")))
    conn.commit(); gid = c.lastrowid; conn.close()
    return gid

def get_user_generations(uid, limit=30):
    conn = get_conn(); c = conn.cursor()
    c.execute("SELECT * FROM generations WHERE user_id=? ORDER BY created_at DESC LIMIT ?", (uid, limit))
    rows = c.fetchall(); conn.close()
    result = []
    for row in rows:
        r = dict(row)
        for f in ["twitter_posts","linkedin_posts","instagram_captions","email_newsletters","tiktok_scripts","threads_posts"]:
            try: r[f] = json.loads(r[f]) if r[f] else []
            except: r[f] = []
        result.append(r)
    return result

def get_generation_by_id(gid, uid):
    conn = get_conn(); c = conn.cursor()
    c.execute("SELECT * FROM generations WHERE id=? AND user_id=?", (gid, uid))
    row = c.fetchone(); conn.close()
    if not row: return None
    r = dict(row)
    for f in ["twitter_posts","linkedin_posts","instagram_captions","email_newsletters","tiktok_scripts","threads_posts"]:
        try: r[f] = json.loads(r[f]) if r[f] else []
        except: r[f] = []
    return r

def save_post(uid, platform, content, generation_id=None):
    conn = get_conn(); c = conn.cursor()
    c.execute("INSERT INTO saved_posts (user_id,generation_id,platform,content) VALUES (?,?,?,?)",
              (uid, generation_id, platform, content))
    conn.commit(); conn.close()

def get_saved_posts(uid):
    conn = get_conn(); c = conn.cursor()
    c.execute("SELECT * FROM saved_posts WHERE user_id=? ORDER BY created_at DESC", (uid,))
    rows = c.fetchall(); conn.close()
    return [dict(r) for r in rows]

def delete_saved_post(pid, uid):
    conn = get_conn(); c = conn.cursor()
    c.execute("DELETE FROM saved_posts WHERE id=? AND user_id=?", (pid, uid))
    conn.commit(); conn.close()

def get_dashboard_stats(uid):
    conn = get_conn(); c = conn.cursor()
    c.execute("SELECT COUNT(*) as total FROM generations WHERE user_id=?", (uid,))
    total = c.fetchone()["total"]
    c.execute("SELECT COUNT(*) as total FROM saved_posts WHERE user_id=?", (uid,))
    saved = c.fetchone()["total"]
    c.execute("SELECT source_type,created_at FROM generations WHERE user_id=? ORDER BY created_at DESC LIMIT 5", (uid,))
    recent = [dict(r) for r in c.fetchall()]
    today = date.today().isoformat()
    c.execute("SELECT count FROM usage_tracking WHERE user_id=? AND usage_date=?", (uid, today))
    row = c.fetchone(); conn.close()
    return {"total_generations": total, "saved_posts": saved, "recent_activity": recent, "today_usage": row["count"] if row else 0}

def save_payment(uid, order_id, amount):
    conn = get_conn(); c = conn.cursor()
    c.execute("INSERT INTO payments (user_id,razorpay_order_id,amount) VALUES (?,?,?)", (uid, order_id, amount))
    conn.commit(); conn.close()

def update_payment(order_id, payment_id, status):
    conn = get_conn(); c = conn.cursor()
    c.execute("UPDATE payments SET razorpay_payment_id=?,status=? WHERE razorpay_order_id=?", (payment_id, status, order_id))
    conn.commit(); conn.close()
