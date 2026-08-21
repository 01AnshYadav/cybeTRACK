import urllib.request
import json

access_token = "eyJhbGciOiJFUzI1NiIsImtpZCI6ImU1ZWQyNDhmLTFjYzgtNDk2NC1iMGYwLWMzNWQzNjk3NTIzNCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL291Y2VvanRyZ2lobnVhZXRtcmNiLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI2NjI8NjY4My1mNmJiLTQzNzAtYjBkZC0zNWRjMzUyNjkyNTAiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzg3MjY2ODg2LCJpYXQiOjE3ODcyNjMyODYsImVtYWlsIjoiY2FudHNoYXJldGhpczAxQGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWxfdmVyaWZpZWQiOnRydWV9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzg3MjYzMjg2fV0sInNlc3Npb25faWQiOiI2NDZiYmRlMS0zNGM4LTQ4YTYtYjdiNi00ZDVlMjMxZWEwNzEiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.GsoTPVB7bAsiiFh8c7ztqYscCp-NwEOIBmBa6koZOiYhJX1xt14KHnfTttEIbm5_v5Xv3WmGylQzyJK-krSwSQ"

# Try just selecting all profiles (no id filter) with apikey only
url = "https://ouceojtrgihnuaetmrcb.supabase.co/rest/v1/profiles?select=*"
req = urllib.request.Request(url, method='GET')
req.add_header('apikey', 'sb_publishable_xi2Fl6tfK_uRL3bN8E_1Cw_gwaU47HZ')
try:
    resp = urllib.request.urlopen(req)
    print(f"Status: {resp.status}")
    data = resp.read().decode('utf-8')
    print(data[:500])
except urllib.error.HTTPError as e:
    print(f"Error status: {e.code}")
    print(e.read().decode('utf-8')[:500])

print("\n---\n")

# Try with both headers
url2 = "https://ouceojtrgihnuaetmrcb.supabase.co/rest/v1/profiles?select=*"
req2 = urllib.request.Request(url2, method='GET')
req2.add_header('apikey', 'sb_publishable_xi2Fl6tfK_uRL3bN8E_1Cw_gwaU47HZ')
req2.add_header('Authorization', f'Bearer {access_token}')
try:
    resp2 = urllib.request.urlopen(req2)
    print(f"Status both: {resp2.status}")
    data2 = resp2.read().decode('utf-8')
    print(data2[:500])
except urllib.error.HTTPError as e:
    print(f"Error status both: {e.code}")
    print(e.read().decode('utf-8')[:500])