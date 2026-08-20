-- Add domain association to roadmap_skills table
-- This allows skills to optionally belong to a cybersecurity domain
alter table public.roadmap_skills add column if not exists domain text;

-- Create a small domains taxonomy table
create table public.domains (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  description text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.domains enable row level security;

-- Allow everyone to read domains (they're reference data)
create policy "Domains are viewable by everyone" on public.domains for select using (true);

-- Allow authenticated users to insert domains (for extensibility)
create policy "Authenticated users can insert domains" on public.domains for insert with check (auth.uid() is not null);

-- Allow authenticated users to update domains
create policy "Authenticated users can update domains" on public.domains for update using (auth.uid() is not null) with check (auth.uid() is not null);

-- Seed some core cybersecurity domains
insert into public.domains (name, description) values
  ('Networking', 'Network security, protocols, infrastructure'),
  ('Web Security', 'Web application security, OWASP, browser security'),
  ('Cryptography', 'Encryption, cryptographic protocols, algorithms'),
  ('Forensics', 'Digital forensics, evidence analysis, recovery'),
  ('SOC', 'Security Operations Center, incident management'),
  ('CTF', 'Capture The Flag challenges, security competitions'),
  ('Cloud Security', 'AWS, Azure, GCP security, cloud infrastructure'),
  ('Application Security', 'Secure coding, code review, vulnerability testing'),
  ('Penetration Testing', 'Pen testing methodology, reporting, tools'),
  ('OSINT', 'Open Source Intelligence, information gathering'),
  ('Reverse Engineering', 'Binary analysis, malware analysis, disassembly'),
  ('Incident Response', 'Incident management, containment, recovery'),
  ('Threat Intelligence', 'Threat feeds, attribution, analysis'),
  ('Security Engineering', 'Secure design, risk management, governance');