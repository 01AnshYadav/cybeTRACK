import re
with open('dump_output.txt', 'r') as f:
    content = f.read()
# Find all CREATE TABLE lines for public schema
tables = re.findall(r'CREATE TABLE IF NOT EXISTS "public"."(\w+)"', content)
for t in sorted(set(tables)):
    print(t)