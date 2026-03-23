-- ============================================================
-- Joy Life Event Tracker — Supabase Schema
-- Paste this entire file into Supabase SQL Editor and run it
-- ============================================================

create table if not exists clients (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  contact text default '',
  service_rate numeric default 10,
  gcio_style boolean default false,
  created_at timestamptz default now()
);

create table if not exists events (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references clients(id) on delete cascade,
  name text not null,
  date date,
  city text default '',
  location text default '',
  commission_waived boolean default false,
  created_at timestamptz default now()
);

create table if not exists expenses (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references events(id) on delete cascade,
  client_id uuid references clients(id) on delete cascade,
  description text default '',
  amount numeric default 0,
  date date,
  category text default 'Misc',
  vendor text default '',
  added_by text default '',
  created_at timestamptz default now()
);

create table if not exists invoices (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references events(id) on delete cascade,
  client_id uuid references clients(id) on delete cascade,
  amount numeric default 0,
  date date,
  status text default 'Pending',
  notes text default '',
  added_by text default '',
  created_at timestamptz default now()
);

create table if not exists sponsors (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references events(id) on delete cascade,
  client_id uuid references clients(id) on delete cascade,
  sponsor_name text default '',
  amount numeric default 0,
  date date,
  status text default 'Pending',
  joy_contribution boolean default false,
  notes text default '',
  added_by text default '',
  created_at timestamptz default now()
);

-- Row Level Security — allow all (add auth later if needed)
alter table clients enable row level security;
alter table events enable row level security;
alter table expenses enable row level security;
alter table invoices enable row level security;
alter table sponsors enable row level security;

drop policy if exists "Allow all" on clients;
drop policy if exists "Allow all" on events;
drop policy if exists "Allow all" on expenses;
drop policy if exists "Allow all" on invoices;
drop policy if exists "Allow all" on sponsors;

create policy "Allow all" on clients for all using (true) with check (true);
create policy "Allow all" on events for all using (true) with check (true);
create policy "Allow all" on expenses for all using (true) with check (true);
create policy "Allow all" on invoices for all using (true) with check (true);
create policy "Allow all" on sponsors for all using (true) with check (true);

-- Seed: Clients
insert into clients (id, name, service_rate, gcio_style) values
  ('c1000000-0000-0000-0000-000000000001','DevRev',7,false),
  ('c1000000-0000-0000-0000-000000000002','Atomicwork',10,false),
  ('c1000000-0000-0000-0000-000000000003','Global CIO Circle',10,true),
  ('c1000000-0000-0000-0000-000000000004','Veery',5,false),
  ('c1000000-0000-0000-0000-000000000005','Tessell',10,false),
  ('c1000000-0000-0000-0000-000000000006','Smallest AI',10,false),
  ('c1000000-0000-0000-0000-000000000007','MVP Ventures',10,false),
  ('c1000000-0000-0000-0000-000000000008','CloudPhysician',10,false);

-- Seed: Events
insert into events (id, client_id, name, date, city, location, commission_waived) values
  ('e1000000-0000-0000-0000-000000000001','c1000000-0000-0000-0000-000000000001','January Business Dinner','2025-01-29','Austin, TX','Eddie Vs Prime Seafood',false),
  ('e1000000-0000-0000-0000-000000000002','c1000000-0000-0000-0000-000000000001','February Business Dinners','2025-02-12','Boston/Menlo Park','Ostra + Park James Hotel',false),
  ('e1000000-0000-0000-0000-000000000003','c1000000-0000-0000-0000-000000000001','February Shuttle Trips','2025-02-03','Palo Alto, CA','Palo Alto to Santa Cruz',false),
  ('e1000000-0000-0000-0000-000000000004','c1000000-0000-0000-0000-000000000001','October Hotel Block and CAB Events','2024-10-01','Sunnyvale, CA','Larkspur Landing',false),
  ('e1000000-0000-0000-0000-000000000005','c1000000-0000-0000-0000-000000000001','Warriors Game Suite','2025-03-10','Santa Clara, CA','Chase Center',false),
  ('e1000000-0000-0000-0000-000000000006','c1000000-0000-0000-0000-000000000001','Mavericks Game Suite','2025-03-10','Dallas, TX','American Airlines Center',false),
  ('e1000000-0000-0000-0000-000000000007','c1000000-0000-0000-0000-000000000001','May NYC Workshop and Dinners','2025-05-21','New York, NY','1166 Ave of Americas',true),
  ('e1000000-0000-0000-0000-000000000008','c1000000-0000-0000-0000-000000000001','May Print Order','2025-05-21','New York, NY','Alphagraphics NYC',true),
  ('e1000000-0000-0000-0000-000000000009','c1000000-0000-0000-0000-000000000001','June Offsite Swag','2025-06-02','Yosemite, CA','Tenaya Lodge',false),
  ('e1000000-0000-0000-0000-000000000010','c1000000-0000-0000-0000-000000000001','July Dinner','2025-07-29','New York, NY','Blackbarn',false),
  ('e1000000-0000-0000-0000-000000000011','c1000000-0000-0000-0000-000000000001','Support Driven Expo Dinner','2025-08-11','Las Vegas, NV','LAGO Bellagio',false),
  ('e1000000-0000-0000-0000-000000000012','c1000000-0000-0000-0000-000000000001','Americas Q2 QBR','2025-08-20','Minneapolis, MN','The Westin Minneapolis',false),
  ('e1000000-0000-0000-0000-000000000013','c1000000-0000-0000-0000-000000000001','AWS Expo LA','2025-09-17','Los Angeles, CA','Los Angeles',false),
  ('e1000000-0000-0000-0000-000000000014','c1000000-0000-0000-0000-000000000001','Austin Offsite','2025-09-15','Austin, TX','Omni Austin Downtown',false),
  ('e1000000-0000-0000-0000-000000000015','c1000000-0000-0000-0000-000000000001','October Flights and Hotels NYC','2025-10-01','New York, NY','Various NYC Hotels',false),
  ('e1000000-0000-0000-0000-000000000016','c1000000-0000-0000-0000-000000000001','Steve Januario Orlando Flight','2025-10-01','Orlando, FL','Orlando FL',false),
  ('e1000000-0000-0000-0000-000000000017','c1000000-0000-0000-0000-000000000001','London Week','2025-11-08','London, UK','DoubleTree Angel Kings Cross',false),
  ('e1000000-0000-0000-0000-000000000018','c1000000-0000-0000-0000-000000000001','Computer History Museum','2026-05-14','Palo Alto, CA','Computer History Museum',false),
  ('e1000000-0000-0000-0000-000000000019','c1000000-0000-0000-0000-000000000002','December SF Event','2024-12-06','San Francisco, CA','San Francisco',false),
  ('e1000000-0000-0000-0000-000000000020','c1000000-0000-0000-0000-000000000002','Podcast Filming','2024-12-06','Redwood, CA','Beverly Boy Productions',false),
  ('e1000000-0000-0000-0000-000000000021','c1000000-0000-0000-0000-000000000002','February CIO Dinner','2025-02-20','San Diego, CA','San Diego',false),
  ('e1000000-0000-0000-0000-000000000022','c1000000-0000-0000-0000-000000000002','Board Meeting at Wente','2025-03-09','Livermore, CA','Wente Vineyards',false),
  ('e1000000-0000-0000-0000-000000000023','c1000000-0000-0000-0000-000000000002','April CIO Dinners','2025-04-02','Dallas/Seattle','Trulucks + Wildginger',false),
  ('e1000000-0000-0000-0000-000000000024','c1000000-0000-0000-0000-000000000002','May London Dinner','2025-05-15','London, UK','Windjammer',false),
  ('e1000000-0000-0000-0000-000000000025','c1000000-0000-0000-0000-000000000002','Q2 Board Meeting','2025-06-21','Los Gatos, CA','Testarossa',false),
  ('e1000000-0000-0000-0000-000000000026','c1000000-0000-0000-0000-000000000002','November Dallas Dinner','2025-11-11','Dallas, TX','Del Friscos',true),
  ('e1000000-0000-0000-0000-000000000027','c1000000-0000-0000-0000-000000000002','February Sydney Dinner','2026-02-17','Sydney, AU','Watersedge Campbells Stores',false),
  ('e1000000-0000-0000-0000-000000000028','c1000000-0000-0000-0000-000000000002','May London Private Dinner','2026-05-12','London, UK','Novotel',false),
  ('e1000000-0000-0000-0000-000000000029','c1000000-0000-0000-0000-000000000003','Global CIO Innovation Summit Sri Lanka','2025-09-02','Colombo, Sri Lanka','Taj Samudra + Cinnamon Life',false),
  ('e1000000-0000-0000-0000-000000000030','c1000000-0000-0000-0000-000000000003','Silicon Valley AI Thought Leadership Summit','2025-12-08','Palo Alto, CA','Palo Alto Art Center',false),
  ('e1000000-0000-0000-0000-000000000031','c1000000-0000-0000-0000-000000000003','Dubai Global Innovation Summit 2026','2026-01-09','Dubai, UAE','InterContinental Dubai Festival City',false),
  ('e1000000-0000-0000-0000-000000000032','c1000000-0000-0000-0000-000000000003','Palo Alto Event GCIO x Relyance','2026-04-28','Palo Alto, CA','Palo Alto Art Center',false),
  ('e1000000-0000-0000-0000-000000000033','c1000000-0000-0000-0000-000000000004','January Las Vegas Events','2026-01-05','Las Vegas, NV','Las Vegas',false),
  ('e1000000-0000-0000-0000-000000000034','c1000000-0000-0000-0000-000000000005','Year End Gifts','2025-12-23','Remote','Delightly Brandville',false),
  ('e1000000-0000-0000-0000-000000000035','c1000000-0000-0000-0000-000000000006','December Happy Hour','2025-12-11','San Francisco, CA','Executive Order Bar and Lounge',false),
  ('e1000000-0000-0000-0000-000000000036','c1000000-0000-0000-0000-000000000007','October Las Vegas Retreat','2025-10-28','Las Vegas, NV','Encore Wynn Las Vegas',true),
  ('e1000000-0000-0000-0000-000000000037','c1000000-0000-0000-0000-000000000008','October Chicago Happy Hour','2025-10-21','Chicago, IL','Fatpour',false);

-- Seed: Expenses (DevRev)
insert into expenses (client_id, event_id, description, amount, date, category, vendor, added_by) values
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000001','January Business Dinner',3926.8,'2025-01-29','Food','Eddie Vs Prime Seafood','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000002','Ostra Business Dinner',4559.13,'2025-02-12','Food','Ostra','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000002','Park James Business Dinner',4482.73,'2025-02-19','Food','Park James Hotel','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000002','Print Materials',438.34,'2025-02-12','Print','Alphagraphics Boston','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000003','PA to Santa Cruz',1817.1,'2025-02-03','Travel','Shuttle Co','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000003','Santa Cruz to Museum',2768.64,'2025-02-05','Travel','Shuttle Co','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000003','Santa Cruz to PA',4490.24,'2025-02-06','Travel','Shuttle Co','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000004','Hotel Employees 38',47778.25,'2024-10-01','Travel','Larkspur Landing','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000004','Hotel Attendees 19',8020.11,'2024-10-01','Travel','Larkspur Landing','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000004','Flights Attendees 19',20901.77,'2024-10-01','Travel','Various Airlines','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000004','Transport Shuttles',7752.97,'2024-10-01','Travel','Various','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000004','Badges Lanyards USB',3855.74,'2024-10-01','Misc','Various','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000004','Event Management Fee',5000,'2024-10-01','Misc','Joy Life','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000004','SLC Customer Event',3254.45,'2024-09-18','Food','Bombara','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000004','NYC CS Customer Event',7041.85,'2024-09-18','Food','Manhatta','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000004','NYC Business Dinner',3395,'2024-10-02','Food','Ai Fiori','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000005','Warriors Game Suite',12000,'2025-03-10','Venue','Chase Center','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000005','Extra Tickets',8964.09,'2025-03-10','Misc','Chase Center','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000005','Warriors Print',122.44,'2025-03-10','Print','Alphagraphics','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000005','March Print Materials',1146.02,'2025-03-14','Print','Alphagraphics','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000006','Mavericks Game Suite',8100,'2025-03-10','Venue','American Airlines Center','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000006','Mavericks FB',2238.77,'2025-03-10','Food','American Airlines Center','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000006','Mavericks Print',166.32,'2025-03-10','Print','Alphagraphics','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000007','NYC Workshop',26901.49,'2025-05-21','Venue','1166 Ave of Americas','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000007','Lambs Club Dinner',7523.79,'2025-05-21','Food','The Lambs Club','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000007','Shipping',420.58,'2025-05-23','Misc','UPS TaskRabbit','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000007','Room Block',11898.66,'2025-05-21','Travel','Embassy Suites','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000008','Print Order',6511.05,'2025-05-21','Print','Alphagraphics NYC','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000009','Flannels',2359.83,'2025-06-02','Swag','Tenaya Lodge','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000009','Hats and Bags',6977.03,'2025-06-03','Swag','Tenaya Lodge','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000010','July Dinner',3793.15,'2025-07-29','Food','Blackbarn','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000010','Print Materials',274.13,'2025-07-29','Print','Alphagraphics','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000010','Gift Bags',36.98,'2025-07-30','Misc','Amazon','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000011','Dinner',5878.18,'2025-08-11','Food','LAGO Bellagio','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000011','Print',1142.34,'2025-08-11','Print','Alphagraphics','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000012','Hotel and Venue',11746.95,'2025-08-20','Venue','The Westin Minneapolis','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000012','Boat Cruise',4797.63,'2025-08-21','Travel','Twin City Tours','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000012','Boat Cruise Shuttles',2016.96,'2025-08-21','Travel','Various','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000013','AWS Expo LA',516.91,'2025-09-17','Misc','Various','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000014','Venue',32785.09,'2025-09-15','Venue','Omni Austin Downtown','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000014','Thursday Dinner',3205.02,'2025-09-18','Food','Wu Chow','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000014','Kayaking',1183.2,'2025-09-19','Misc','Live Love Paddle','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000015','Flights and Hotels NYC',129160.11,'2025-10-01','Travel','Various','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000016','Orlando Flight',5186.37,'2025-10-01','Travel','United Airlines','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000017','Room block and meeting room',60937.79,'2025-11-08','Venue','DoubleTree London','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000017','Hilton Booking',777.49,'2025-11-11','Travel','Hilton London','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000017','Sunday Dinner',1879.17,'2025-11-09','Food','The Lighterman','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000017','Museum Tickets',1014.25,'2025-11-10','Misc','Churchill War Rooms','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000017','Tuesday Dinner',5737.5,'2025-11-11','Food','German Gymnasium','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000017','Wednesday Dinner',4425.44,'2025-11-12','Food','Coal Office','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000017','Thursday Dinner',2163.71,'2025-11-13','Food','El Pastor','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000017','Friday Dinner',2951.9,'2025-11-14','Food','OXO Tower','imported'),
-- Atomicwork
  ('c1000000-0000-0000-0000-000000000002','e1000000-0000-0000-0000-000000000019','Badges and Lanyards',273.61,'2024-12-06','Misc','Various','imported'),
  ('c1000000-0000-0000-0000-000000000002','e1000000-0000-0000-0000-000000000019','Photographer',620,'2024-12-06','Misc','Photographer','imported'),
  ('c1000000-0000-0000-0000-000000000002','e1000000-0000-0000-0000-000000000020','Podcast Filming',5175,'2024-12-06','Misc','Beverly Boy Productions','imported'),
  ('c1000000-0000-0000-0000-000000000002','e1000000-0000-0000-0000-000000000021','Print Materials',380.87,'2025-02-20','Print','Various','imported'),
  ('c1000000-0000-0000-0000-000000000002','e1000000-0000-0000-0000-000000000022','Board Meeting',2501.3,'2025-03-09','Venue','Wente Vineyards','imported'),
  ('c1000000-0000-0000-0000-000000000002','e1000000-0000-0000-0000-000000000023','April 2 CIO Dinner',4219.93,'2025-04-02','Food','Trulucks Dallas','imported'),
  ('c1000000-0000-0000-0000-000000000002','e1000000-0000-0000-0000-000000000023','April 2 Print',399.89,'2025-04-02','Print','Alphagraphics','imported'),
  ('c1000000-0000-0000-0000-000000000002','e1000000-0000-0000-0000-000000000023','April 17 CIO Dinner',2319.87,'2025-04-17','Food','Wildginger Seattle','imported'),
  ('c1000000-0000-0000-0000-000000000002','e1000000-0000-0000-0000-000000000023','April 17 Print',350,'2025-04-17','Print','Alphagraphics','imported'),
  ('c1000000-0000-0000-0000-000000000002','e1000000-0000-0000-0000-000000000024','Dinner Deposit',284,'2025-05-15','Food','Windjammer','imported'),
  ('c1000000-0000-0000-0000-000000000002','e1000000-0000-0000-0000-000000000024','Print Materials',300,'2025-05-15','Print','Alphagraphics','imported'),
  ('c1000000-0000-0000-0000-000000000002','e1000000-0000-0000-0000-000000000025','Q2 Board Meeting',2572.31,'2025-06-21','Venue','Testarossa','imported'),
  ('c1000000-0000-0000-0000-000000000002','e1000000-0000-0000-0000-000000000025','Print',159.53,'2025-06-21','Print','Alphagraphics','imported'),
  ('c1000000-0000-0000-0000-000000000002','e1000000-0000-0000-0000-000000000025','Flowers',213.33,'2025-06-21','Misc','Gaetas Flowers','imported'),
  ('c1000000-0000-0000-0000-000000000002','e1000000-0000-0000-0000-000000000025','Backcharges Apr May',356.38,'2025-06-21','Print','Alphagraphics','imported'),
  ('c1000000-0000-0000-0000-000000000002','e1000000-0000-0000-0000-000000000026','Dallas Dinner',2742.18,'2025-11-11','Food','Del Friscos','imported'),
  ('c1000000-0000-0000-0000-000000000002','e1000000-0000-0000-0000-000000000026','Dinner Print',258.25,'2025-11-11','Print','Alphagraphics','imported'),
  ('c1000000-0000-0000-0000-000000000002','e1000000-0000-0000-0000-000000000026','Oct cancellation deposit',500,'2025-10-14','Misc','101 Steakhouse','imported'),
  ('c1000000-0000-0000-0000-000000000002','e1000000-0000-0000-0000-000000000027','Sydney Dinner',3994.04,'2026-02-17','Food','Watersedge Campbells Stores','imported'),
  ('c1000000-0000-0000-0000-000000000002','e1000000-0000-0000-0000-000000000027','Photo and Video',2507.15,'2026-02-17','Misc','Digital Video Experts','imported'),
  ('c1000000-0000-0000-0000-000000000002','e1000000-0000-0000-0000-000000000027','Print',115.91,'2026-02-17','Print','Kwik Print','imported'),
-- GCIO Sri Lanka
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000029','Hotel and Additional Rooms',117436.21,'2025-09-02','Venue','Taj Samudra','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000029','Original Invoice',24272.1,'2025-09-02','Misc','AJ Events','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000029','Atomicwork Podcast',3650,'2025-09-03','Misc','AJ Events','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000029','Trupeer Videos',1132,'2025-09-04','Misc','AJ Events','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000029','Additional Print',2686,'2025-09-02','Print','AJ Events','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000029','Additional Transport',5814,'2025-09-02','Travel','AJ Events','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000029','Welcome Dinner Entertainment',3385,'2025-09-02','Misc','Cinnamon Life','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000029','Finale Dinner Entertainment',3900,'2025-09-05','Misc','Cinnamon Life','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000029','September Dinners',16702.35,'2025-09-02','Food','Cinnamon Life','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000029','Additional Hotel Rooms',2083.1,'2025-10-03','Travel','Cinnamon Life','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000029','ITC Hotel',4383.12,'2025-09-02','Travel','ITC Hotel','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000029','Swag and Gifts',11338.46,'2025-09-02','Swag','Various','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000029','Sponsored Flights',18700.97,'2025-09-02','Travel','Various Airlines','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000029','Misc',2405,'2025-09-02','Misc','Various','imported'),
-- GCIO SV
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000030','Venue',5985,'2025-12-08','Venue','Palo Alto Art Center','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000030','Fire Permit',1972,'2025-12-08','Misc','City of Palo Alto','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000030','Green Waste',90,'2025-12-08','Misc','City of Palo Alto','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000030','Catering',14226.6,'2025-12-08','Food','Sapaanduu Catering','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000030','Print Materials',1343.6,'2025-12-08','Print','Alphagraphics','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000030','Swag and Gifts',255.89,'2025-12-08','Swag','Various','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000030','Travel',1576.87,'2025-12-08','Travel','Various','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000030','Misc',6481.6,'2025-12-08','Misc','Various','imported'),
-- GCIO Dubai
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000031','Hotel and Venue',114443.01,'2026-01-09','Venue','InterContinental Dubai','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000031','Tourism activities',12448.09,'2026-01-10','Travel','Dubai Travel Tourism','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000031','Permitting',2205.52,'2026-01-10','Misc','Dubai Travel Tourism','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000031','AV Tech',9830.44,'2026-01-09','AV','Maestro','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000031','Photographer',1327.7,'2026-01-09','Misc','Photographer','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000031','Maagulf TV',967.42,'2026-01-09','Misc','Maagulf TV','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000031','Print Materials',800,'2026-01-09','Print','Various','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000031','Travel',3137.11,'2026-01-09','Travel','Various','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000031','Misc',2060,'2026-01-09','Misc','Various','imported'),
-- GCIO Palo Alto
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000032','Venue',1700,'2026-04-28','Venue','Palo Alto Art Center','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000032','Misc',181,'2026-04-28','Misc','Sapaanduu','imported'),
-- Veery
  ('c1000000-0000-0000-0000-000000000004','e1000000-0000-0000-0000-000000000033','Jan 5 Event',2301.61,'2026-01-05','Misc','Various','imported'),
  ('c1000000-0000-0000-0000-000000000004','e1000000-0000-0000-0000-000000000033','Jan 6 Event',1841.02,'2026-01-06','Misc','Various','imported'),
  ('c1000000-0000-0000-0000-000000000004','e1000000-0000-0000-0000-000000000033','Jan 8 Event',7087.95,'2026-01-08','Misc','Various','imported'),
-- Tessell
  ('c1000000-0000-0000-0000-000000000005','e1000000-0000-0000-0000-000000000034','25 Gift Boxes',2580.01,'2025-12-23','Swag','Delightly Brandville','imported'),
  ('c1000000-0000-0000-0000-000000000005','e1000000-0000-0000-0000-000000000034','5 Additional Gift Boxes',466.01,'2026-01-06','Swag','Delightly','imported'),
-- Smallest AI
  ('c1000000-0000-0000-0000-000000000006','e1000000-0000-0000-0000-000000000035','Happy Hour Venue',2933.01,'2025-12-11','Venue','Executive Order Bar','imported'),
  ('c1000000-0000-0000-0000-000000000006','e1000000-0000-0000-0000-000000000035','Swag Cookies',385,'2025-12-05','Swag','Sweet Es','imported'),
  ('c1000000-0000-0000-0000-000000000006','e1000000-0000-0000-0000-000000000035','Print Materials',405.675,'2025-12-11','Print','Alphagraphics','imported'),
  ('c1000000-0000-0000-0000-000000000006','e1000000-0000-0000-0000-000000000035','T-Shirts',448.165,'2025-12-09','Swag','Studio208 Print Shop','imported'),
-- MVP Ventures
  ('c1000000-0000-0000-0000-000000000007','e1000000-0000-0000-0000-000000000036','Accommodations and Breakfast',31363.25,'2025-10-28','Travel','Encore Las Vegas','imported'),
  ('c1000000-0000-0000-0000-000000000007','e1000000-0000-0000-0000-000000000036','Night One Dinner',7224.86,'2025-10-28','Food','Casa Playa Wynn','imported'),
  ('c1000000-0000-0000-0000-000000000007','e1000000-0000-0000-0000-000000000036','Night Two Dinner',7329.9,'2025-10-29','Food','SW Steakhouse Wynn','imported'),
  ('c1000000-0000-0000-0000-000000000007','e1000000-0000-0000-0000-000000000036','DigThis Experience',4398.92,'2025-10-29','Misc','DIG','imported'),
-- CloudPhysician
  ('c1000000-0000-0000-0000-000000000008','e1000000-0000-0000-0000-000000000037','Happy Hour',2484.77,'2025-10-21','Food','Fatpour','imported'),
  ('c1000000-0000-0000-0000-000000000008','e1000000-0000-0000-0000-000000000037','Print Materials',188.04,'2025-10-21','Print','Alphagraphics','imported');

-- Seed: Invoices
insert into invoices (client_id, event_id, amount, date, status, notes, added_by) values
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000001',4201.68,'2025-01-29','Paid','incl. 7%','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000002',10143.81,'2025-02-28','Paid','incl. 7%','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000003',9711.30,'2025-02-28','Paid','incl. 7%','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000004',93308.84,'2024-10-31','Paid','Invoice 1','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000004',13991.30,'2024-10-31','Paid','Invoice 2 CAB events','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000005',23788.83,'2025-03-31','Paid','incl. 7%','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000006',11240.45,'2025-04-30','Paid','incl. 7%','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000007',46744.52,'2025-05-31','Paid','7% waived','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000008',6511.05,'2025-05-31','Paid','7% waived','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000009',9990.44,'2025-06-30','Paid','incl. 7%','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000010',4391.56,'2025-07-31','Paid','incl. 7%','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000011',7511.96,'2025-08-31','Paid','incl. 7%','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000012',19860.85,'2025-08-31','Paid','incl. 7%','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000013',553.09,'2025-09-30','Paid','incl. 7%','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000014',39775.44,'2025-09-30','Paid','incl. 7%','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000015',138201.32,'2025-10-31','Paid','Invoice 1','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000016',5549.42,'2025-10-31','Paid','incl. 7%','imported'),
  ('c1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000017',85479.36,'2025-11-30','Paid','incl. 7%','imported'),
  ('c1000000-0000-0000-0000-000000000002','e1000000-0000-0000-0000-000000000019',982.97,'2024-12-31','Paid','incl. 10%','imported'),
  ('c1000000-0000-0000-0000-000000000002','e1000000-0000-0000-0000-000000000020',5692.50,'2025-01-31','Paid','incl. 10%','imported'),
  ('c1000000-0000-0000-0000-000000000002','e1000000-0000-0000-0000-000000000021',418.96,'2025-02-28','Paid','incl. 10%','imported'),
  ('c1000000-0000-0000-0000-000000000002','e1000000-0000-0000-0000-000000000022',2751.43,'2025-03-31','Paid','incl. 10%','imported'),
  ('c1000000-0000-0000-0000-000000000002','e1000000-0000-0000-0000-000000000023',7963.66,'2025-04-30','Paid','incl. 10%','imported'),
  ('c1000000-0000-0000-0000-000000000002','e1000000-0000-0000-0000-000000000024',642.40,'2025-05-31','Paid','incl. 10%','imported'),
  ('c1000000-0000-0000-0000-000000000002','e1000000-0000-0000-0000-000000000025',3531.71,'2025-06-30','Paid','incl. 10%','imported'),
  ('c1000000-0000-0000-0000-000000000002','e1000000-0000-0000-0000-000000000026',3500.43,'2025-11-30','Pending','commission waived','imported'),
  ('c1000000-0000-0000-0000-000000000002','e1000000-0000-0000-0000-000000000027',7278.81,'2026-02-28','Pending','incl. 10%','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000029',239677.58,'2025-09-30','Paid','Grand Total incl. 10%','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000030',35124.72,'2025-12-31','Paid','incl. 10%','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000031',151941.22,'2026-01-31','Paid','incl. 10% net of 10k Joy contribution','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000032',2069.10,'2026-04-28','Pending','incl. 10%','imported'),
  ('c1000000-0000-0000-0000-000000000004','e1000000-0000-0000-0000-000000000033',11792.11,'2026-01-31','Paid','incl. 5%','imported'),
  ('c1000000-0000-0000-0000-000000000005','e1000000-0000-0000-0000-000000000034',3350.62,'2026-01-15','Paid','incl. 10%','imported'),
  ('c1000000-0000-0000-0000-000000000006','e1000000-0000-0000-0000-000000000035',4589.04,'2025-12-31','Paid','incl. 10%','imported'),
  ('c1000000-0000-0000-0000-000000000007','e1000000-0000-0000-0000-000000000036',50316.93,'2025-10-31','Paid','commission waived','imported'),
  ('c1000000-0000-0000-0000-000000000008','e1000000-0000-0000-0000-000000000037',2940.09,'2025-10-31','Paid','incl. 10%','imported');

-- Seed: Sponsors
insert into sponsors (client_id, event_id, sponsor_name, amount, date, status, joy_contribution, notes, added_by) values
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000029','Trupeer.ai',20000,'2025-08-13','Paid',false,'','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000029','Zuora',30000,'2025-07-23','Paid',false,'','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000029','Linen.cloud',10000,'2025-08-04','Paid',false,'','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000029','Featurely AI',10000,'2025-08-01','Paid',false,'','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000029','Aluru Intelligence',10000,'2025-07-25','Paid',false,'','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000029','Lumif.ai LMF Digital',5000,'2025-07-28','Paid',false,'','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000029','Clientell AI Tower 22',10000,'2025-07-25','Paid',false,'','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000029','Alteryx',15000,'2025-08-01','Paid',false,'','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000029','Potpie AI Momenta',11000,'2025-08-13','Paid',false,'','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000029','Atomicwork',15000,'2025-08-29','Paid',false,'','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000029','Smallest.ai',5000,'2025-08-13','Paid',false,'','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000029','NopalCyber',7500,'2025-08-18','Paid',false,'','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000029','AWS',75000,'2025-09-05','Paid',false,'','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000029','Cloudsek Research',10000,'2025-08-21','Paid',false,'','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000029','Thunai Inc',4000,'2025-08-26','Paid',false,'','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000029','Zluri',10000,'2025-09-09','Paid',false,'','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000030','Viven AI',7500,'2025-12-08','Paid',false,'','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000030','Singulr AI',7500,'2025-12-08','Paid',false,'','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000030','Hivel AI',3000,'2025-12-08','Paid',false,'','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000030','Tray.ai',10000,'2025-12-08','Paid',false,'','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000030','Atomicwork',17000,'2025-12-08','Paid',false,'','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000030','Featurely AI',3000,'2025-12-08','Paid',false,'','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000030','LINEN Software',3000,'2025-12-08','Paid',false,'','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000030','Thunai Inc.',1000,'2025-12-08','Paid',false,'','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000030','Altios AI',1000,'2025-12-08','Paid',false,'','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000030','Stealth Startup',1000,'2025-12-08','Pending',false,'Followed up 2/19','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000030','Trupeer Inc.',3000,'2025-12-08','Paid',false,'','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000031','Mondee',2000,'2026-01-20','Paid',false,'','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000031','Anju Family',4000,'2026-01-20','Pending',false,'Followed up 3/2','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000031','International Startup Foundation',60000,'2026-01-09','Pending',false,'Followed up 3/2','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000031','Thunai Technologies',5000,'2026-01-09','Paid',false,'','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000031','Potpie AI',30000,'2026-01-09','Paid',false,'','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000031','Joy Life Inc.',10000,'2026-01-09','Paid',true,'Deducted from Joy commission','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000031','Atomicwork',10000,'2026-01-09','Paid',false,'','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000031','Nopalcyber LLC',7500,'2026-01-09','Paid',false,'','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000031','HAI',10000,'2026-01-09','Paid',false,'','imported'),
  ('c1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000031','Stripe Payouts via Luma',9700,'2026-01-09','Paid',false,'','imported');
