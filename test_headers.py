import urllib.request
import json

url = "https://ouceojtrgihnuaetmrcb.supabase.co/rest/v1/profiles?id=eq.66286683-f6bb-4370-b0dd-35dc35269250&select=*"
access_token = "eyJhbGciOiJFUzI1NiIsImtpZCI6ImU1ZWQyNDhmLTFjYzgtNDk2NC1iMGYwLWMzNWQzNjk3NTIzNCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL291Y2VvanRyZ2lobnVhZXRtcmNiLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI2NjI8NjY4My1mNmJiLTQzNzAtYjBkZC0zNWRjMzUyNjkyNTAiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzg3MjY2ODg2LCJpYXQiOjE3ODcyNjMyODYsImVtYWlsIjoiY2FudHNoYXJldGhpczAxQGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWxfdmVyaWZpZWQiOnRydWV9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzg3MjYzMjg2fV0sInNlc3Npb25faWQiOiI2NDZiYmRlMS0zNGM4LTQ4YTYtYjdiNi00ZDVlMjMxZWEwNzEiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.GsoTPVB7bAsiiFh8c7ztqYscCp-NwEOIBmBa6koZOiYhJX1xt14KHnfTttEIbm5_v5Xv3WmGylQzyJK-krSwSQ"

# Try 1: Only Authorization header
req = urllib.request.Request(url, method='GET')
req.add_header('Authorization', f'Bearer {access_token}')
try:
    resp = urllib.request.urlopen(req)
    print(f"Try 1 (Auth only): Status {resp.status}")
    print(resp.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(f"Try 1 (Auth only): Error {e.code}")
    print(e.read().decode('utf-8'))

# Try 2: Only apikey header
print("\n---\n")
req2 = urllib.request.Request(url, method='GET')
req2.add_header('apikey', 'sb_publishable_xi2Fl6tfK_uRL3bN8E_1Cw_gwaU47HZ')
try:
    resp2 = urllib.request.urlopen(req2)
    print(f"Try 2 (apikey only): Status {resp2.status}")
    print(resp2.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(f"Try 2 (apikey only): Error {e.code}")
    print(e.read().decode('utf-8'))

# Try 3: Both headers
print("\n---\n")
req3 = urllib.request.Request(url, method='GET')
req3.add_header('apikey', 'sb_publishable_xi2Fl6tfK_uRL3bN8E_1Cw_gwaU47HZ')
req3.add_header('Authorization', f'Bearer {access_token}')
try:
    resp3 = urllib.request.urlopen(req3)
    print(f"Try 3 (both): Status {resp3.status}")
    print(resp3.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(f"Try 3 (both): Error {e.code}")
    print(e.read().decode('utf-8'))