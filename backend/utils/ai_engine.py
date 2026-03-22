import os, json, re
from groq import Groq

def get_groq():
    return Groq(api_key=os.environ["GROQ_API_KEY"])

def extract_json_list(text):
    try:
        d = json.loads(text.strip())
        if isinstance(d, list): return d
    except: pass
    m = re.search(r'\[.*?\]', text, re.DOTALL)
    if m:
        try:
            d = json.loads(m.group())
            if isinstance(d, list): return d
        except: pass
    lines = re.split(r'\n\s*\d+[\.\ )]\s*', text)
    return [l.strip().strip('"\'').strip("'") for l in lines if l.strip() and len(l.strip()) > 10] or [text]

def gen(prompt, system="", max_tokens=4000):
    client = get_groq()
    msgs = []
    if system: msgs.append({"role":"system","content":system})
    msgs.append({"role":"user","content":prompt})
    r = client.chat.completions.create(model="llama-3.3-70b-versatile", messages=msgs, max_tokens=max_tokens, temperature=0.85)
    return r.choices[0].message.content

SYS = """You are a world-class content strategist and viral social media expert.
Create highly engaging, platform-native content that drives real engagement.
Write in an authentic human voice. Never use generic AI filler phrases."""

def repurpose_content(text):
    c = text[:3000]; results = {}

    raw = gen(f"Write exactly 10 Twitter/X posts. Each max 280 chars. Mix hooks, hot takes, questions, stats. 1-2 hashtags each. Return ONLY JSON array of 10 strings.\nContent: {c}", SYS)
    results["twitter"] = extract_json_list(raw)[:10]
    while len(results["twitter"]) < 10: results["twitter"].append(f"Key insight #{len(results['twitter'])+1} worth sharing 🔥 #insights")

    raw = gen(f"Write exactly 5 LinkedIn posts. 200-350 words each. Powerful hook, storytelling, end with question. Return ONLY JSON array of 5 strings.\nContent: {c}", SYS)
    results["linkedin"] = extract_json_list(raw)[:5]
    while len(results["linkedin"]) < 5: results["linkedin"].append("Most people overlook this...\n\n#growth #insights")

    raw = gen(f"Write exactly 5 Instagram captions. 80-180 words. Magnetic first line, CTA, 10-15 hashtags. Return ONLY JSON array of 5 strings.\nContent: {c}", SYS)
    results["instagram"] = extract_json_list(raw)[:5]
    while len(results["instagram"]) < 5: results["instagram"].append("This hit different 💡\n\nSave this!\n\n#mindset #growth")

    raw = gen(f"Write exactly 3 TikTok scripts. 150-250 words each. Start with hook like POV: or Nobody talks about:. Include [VISUAL NOTE] cues. Return ONLY JSON array of 3 strings.\nContent: {c}", SYS)
    results["tiktok"] = extract_json_list(raw)[:3]
    while len(results["tiktok"]) < 3: results["tiktok"].append("POV: You just learned something that changes everything.\n\n#learnontiktok #viral")

    raw = gen(f"Write exactly 5 Threads posts. 100-200 chars each. Casual, witty, opinionated. No hashtags. Return ONLY JSON array of 5 strings.\nContent: {c}", SYS)
    results["threads"] = extract_json_list(raw)[:5]
    while len(results["threads"]) < 5: results["threads"].append("The more I learn about this, the more I realize how much I was missing.")

    raw = gen(f"Write exactly 3 email newsletters. Each with Subject:, Preview:, body 300-450 words, CTA. Return ONLY JSON array of 3 strings.\nContent: {c}", SYS)
    results["email"] = extract_json_list(raw)[:3]
    while len(results["email"]) < 3: results["email"].append("Subject: This changed how I think\n\nHey [First Name],\n\n...")

    raw = gen(f"Write 1 YouTube description. First 2 lines compelling. Timestamps, resources, CTA, 15-20 hashtags. 250-400 words. Return ONLY a string.\nContent: {c}", SYS)
    results["youtube_desc"] = raw.strip().strip('"\'') if raw else ""

    results["blog_summary"] = gen(f"Write SEO-optimized blog post. H1 title, meta description, intro, 4-5 H2 sections, key takeaways, conclusion. 800-1100 words. Markdown format.\nContent: {c}", SYS, max_tokens=2500)

    return results

def fetch_youtube_transcript(url):
    import re as _re
    m = _re.search(r'(?:v=|youtu\.be/|embed/|shorts/)([A-Za-z0-9_-]{11})', url)
    if not m: raise ValueError("Could not extract YouTube video ID")
    video_id = m.group(1)
    from youtube_transcript_api import YouTubeTranscriptApi
    try:
        ytt = YouTubeTranscriptApi()
        fetched = ytt.fetch(video_id)
        snippets = list(fetched)
        text = " ".join([s.text if hasattr(s,'text') else s["text"] for s in snippets])
        return text, video_id
    except (TypeError, AttributeError): pass
    tlist = YouTubeTranscriptApi.get_transcript(video_id)
    return " ".join([t["text"] for t in tlist]), video_id
