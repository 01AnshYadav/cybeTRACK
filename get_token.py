import urllib.request
import json
import sys

url = "https://ouceojtrgihnuaetmrcb.supabase.co/auth/v1/token?grant_type=password"
body = json.dumps({"email": "cantsharethis01@gmail.com", "password": "ansh#2006"}).encode('utf-8')
req = urllib.request.Request(url, data=body, method='POST')
req.add_header('apikey', 'sb_publishable_xi2Fl6tfK_uRL3bN8E_1Cw_gwaU47HZ')
req.add_header('Content-Type', 'application/json')
try:
    resp = urllib.request.urlopen(req)
    print(f"Status: {resp.status}")
    data = json.loads(resp.read().decode('utf-8'))
    print(json.dumps(data, indent=2))
except urllib.error.HTTPError as e:
    print(f"Error status: {e.code}")
    print(e.read().decode('utf-8'))
PYEOF