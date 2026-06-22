-- Supabase SQL Schema for School Inventory & Asset Management System

-- Drop existing tables if they exist (for clean installation)
DROP TABLE IF EXISTS asset_checks CASCADE;
DROP TABLE IF EXISTS asset_repairs CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS inventory_requests CASCADE;
DROP TABLE IF EXISTS inventory_logs CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS procurements CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table (Custom Authentication)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'officer', 'asset_officer', 'procure_officer', 'reporter', 'teacher', 'executive')),
    department TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Inventory Table (วัสดุสิ้นเปลือง / พัสดุ)
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    unit TEXT NOT NULL,
    price_per_unit NUMERIC DEFAULT 0 NOT NULL,
    stock_in INTEGER DEFAULT 0 NOT NULL,
    stock_out INTEGER DEFAULT 0 NOT NULL,
    stock_remain INTEGER DEFAULT 0 NOT NULL,
    min_threshold INTEGER DEFAULT 10 NOT NULL,
    location TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Inventory Logs Table (บันทึกรับเข้าพัสดุ)
CREATE TABLE inventory_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('purchase', 'donation', 'transfer')),
    po_number TEXT,
    seller TEXT,
    receive_date DATE DEFAULT CURRENT_DATE NOT NULL,
    quantity INTEGER NOT NULL,
    price NUMERIC DEFAULT 0 NOT NULL,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Inventory Requests Table (การเบิก-คืนพัสดุ)
CREATE TABLE inventory_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE NOT NULL,
    borrower TEXT NOT NULL,
    department TEXT NOT NULL,
    request_date DATE DEFAULT CURRENT_DATE NOT NULL,
    quantity INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'returned')),
    approved_by TEXT,
    approved_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Assets Table (ครุภัณฑ์)
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    serial_number TEXT,
    price NUMERIC DEFAULT 0 NOT NULL,
    fiscal_year TEXT NOT NULL,
    funding_source TEXT NOT NULL,
    room TEXT NOT NULL,
    responsible_person TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('ปกติ', 'ชำรุด', 'ส่งซ่อม', 'จำหน่าย', 'สูญหาย')) DEFAULT 'ปกติ',
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Asset Checks Table (การตรวจสอบครุภัณฑ์ประจำปี)
CREATE TABLE asset_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE NOT NULL,
    check_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    checker TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('พบครบ', 'สูญหาย', 'ชำรุด', 'รอซ่อม')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Asset Repairs Table (การแจ้งซ่อมครุภัณฑ์)
CREATE TABLE asset_repairs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE NOT NULL,
    reporter TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    status TEXT NOT NULL CHECK (status IN ('แจ้งแล้ว', 'กำลังดำเนินการ', 'ซ่อมเสร็จ', 'จำหน่าย')) DEFAULT 'แจ้งแล้ว',
    report_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    resolved_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Procurements Table (ระบบจัดซื้อจัดจ้าง)
CREATE TABLE procurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_name TEXT NOT NULL,
    fiscal_year TEXT NOT NULL,
    seller TEXT,
    quotation_url TEXT,
    po_url TEXT,
    receive_url TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    items JSONB NOT NULL, -- Array of items: [{ name, category, unit, price_per_unit, quantity, location }]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_repairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurements ENABLE ROW LEVEL SECURITY;

-- Create Policies allowing all access for testing (USING (true) and WITH CHECK (true))
-- users Policies
CREATE POLICY users_select ON users FOR SELECT USING (true);
CREATE POLICY users_insert ON users FOR INSERT WITH CHECK (true);
CREATE POLICY users_update ON users FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY users_delete ON users FOR DELETE USING (true);

-- inventory Policies
CREATE POLICY inventory_select ON inventory FOR SELECT USING (true);
CREATE POLICY inventory_insert ON inventory FOR INSERT WITH CHECK (true);
CREATE POLICY inventory_update ON inventory FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY inventory_delete ON inventory FOR DELETE USING (true);

-- inventory_logs Policies
CREATE POLICY inventory_logs_select ON inventory_logs FOR SELECT USING (true);
CREATE POLICY inventory_logs_insert ON inventory_logs FOR INSERT WITH CHECK (true);
CREATE POLICY inventory_logs_update ON inventory_logs FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY inventory_logs_delete ON inventory_logs FOR DELETE USING (true);

-- inventory_requests Policies
CREATE POLICY inventory_requests_select ON inventory_requests FOR SELECT USING (true);
CREATE POLICY inventory_requests_insert ON inventory_requests FOR INSERT WITH CHECK (true);
CREATE POLICY inventory_requests_update ON inventory_requests FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY inventory_requests_delete ON inventory_requests FOR DELETE USING (true);

-- assets Policies
CREATE POLICY assets_select ON assets FOR SELECT USING (true);
CREATE POLICY assets_insert ON assets FOR INSERT WITH CHECK (true);
CREATE POLICY assets_update ON assets FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY assets_delete ON assets FOR DELETE USING (true);

-- asset_checks Policies
CREATE POLICY asset_checks_select ON asset_checks FOR SELECT USING (true);
CREATE POLICY asset_checks_insert ON asset_checks FOR INSERT WITH CHECK (true);
CREATE POLICY asset_checks_update ON asset_checks FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY asset_checks_delete ON asset_checks FOR DELETE USING (true);

-- asset_repairs Policies
CREATE POLICY asset_repairs_select ON asset_repairs FOR SELECT USING (true);
CREATE POLICY asset_repairs_insert ON asset_repairs FOR INSERT WITH CHECK (true);
CREATE POLICY asset_repairs_update ON asset_repairs FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY asset_repairs_delete ON asset_repairs FOR DELETE USING (true);

-- procurements Policies
CREATE POLICY procurements_select ON procurements FOR SELECT USING (true);
CREATE POLICY procurements_insert ON procurements FOR INSERT WITH CHECK (true);
CREATE POLICY procurements_update ON procurements FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY procurements_delete ON procurements FOR DELETE USING (true);

-- 9. Storage Setup for bucket named "file"
-- Insert bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('file', 'file', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for storage.objects in bucket 'file'
DROP POLICY IF EXISTS "Allow public select for file bucket" ON storage.objects;
CREATE POLICY "Allow public select for file bucket" ON storage.objects
    FOR SELECT USING (bucket_id = 'file');

DROP POLICY IF EXISTS "Allow authenticated insert for file bucket" ON storage.objects;
CREATE POLICY "Allow authenticated insert for file bucket" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'file');

DROP POLICY IF EXISTS "Allow public insert for file bucket" ON storage.objects;
CREATE POLICY "Allow public insert for file bucket" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'file');

DROP POLICY IF EXISTS "Allow authenticated update for file bucket" ON storage.objects;
CREATE POLICY "Allow authenticated update for file bucket" ON storage.objects
    FOR UPDATE USING (bucket_id = 'file') WITH CHECK (bucket_id = 'file');

DROP POLICY IF EXISTS "Allow authenticated delete for file bucket" ON storage.objects;
CREATE POLICY "Allow authenticated delete for file bucket" ON storage.objects
    FOR DELETE USING (bucket_id = 'file');

-- 10. Sample Data Seeding
-- Insert Default Users: admin, officer, teacher, executive
-- Note: Password in production should be hashed, but for simplicity of this custom login we store plain text or simple hashes.
-- The custom login in the frontend will check username and password. We will store simple strings.
INSERT INTO users (username, password, name, role, department) VALUES
('admin', 'admin123', 'ผู้ดูแลระบบ ไอซีที', 'admin', 'กลุ่มงานเทคโนโลยี'),
('officer', 'officer123', 'เจ้าหน้าที่ พัสดุดี', 'officer', 'กลุ่มงานบริหารทั่วไป'),
('teacher', 'teacher123', 'คุณครู สอนดี', 'teacher', 'กลุ่มสาระการเรียนรู้คณิตศาสตร์'),
('exec', 'exec123', 'ผู้อำนวยการ โรงเรียน', 'executive', 'ผู้บริหาร')
ON CONFLICT (username) DO NOTHING;

-- Insert Sample Inventory Items
INSERT INTO inventory (code, name, category, unit, price_per_unit, stock_in, stock_out, stock_remain, min_threshold, location) VALUES
('INV001', 'กระดาษ A4 80 แกรม', 'เครื่องเขียน', 'รีม', 120.00, 100, 30, 70, 10, 'ห้องพัสดุ อาคาร 1'),
('INV002', 'หมึกพิมพ์ HP Laser', 'อุปกรณ์คอมพิวเตอร์', 'กล่อง', 1850.00, 20, 5, 15, 3, 'ห้องพัสดุ อาคาร 1'),
('INV003', 'ปากกาเคมี สีน้ำเงิน', 'เครื่องเขียน', 'ด้าม', 15.00, 200, 195, 5, 20, 'ห้องพัสดุ อาคาร 1'),
('INV004', 'แฟ้มตราช้าง 2 นิ้ว', 'เครื่องเขียน', 'เล่ม', 85.00, 50, 10, 40, 8, 'ห้องพัสดุ อาคาร 1'),
('INV005', 'กาวสองหน้า 3M', 'เครื่องเขียน', 'ม้วน', 45.00, 30, 28, 2, 5, 'ห้องพัสดุ อาคาร 1')
ON CONFLICT (code) DO NOTHING;

-- Insert Sample Assets Items
INSERT INTO assets (code, name, brand, model, serial_number, price, fiscal_year, funding_source, room, responsible_person, status) VALUES
('ASSET-2569-0001', 'Computer Lab 01', 'Dell', 'OptiPlex 3080', 'MXL1234567', 25000.00, '2569', 'งบประมาณแผ่นดิน', 'ห้องคอมพิวเตอร์ 1', 'ครู ICT', 'ปกติ'),
('ASSET-2569-0002', 'Projector Epson EH-TW740', 'Epson', 'EH-TW740', 'EPS9876543', 18900.00, '2569', 'งบประมาณแผ่นดิน', 'ห้องเรียน 301', 'ครูคณิตศาสตร์', 'ชำรุด'),
('ASSET-2568-0001', 'เครื่องปรับอากาศ Daikin 24000 BTU', 'Daikin', 'FTKF24YV2S', 'DK998877', 32000.00, '2568', 'เงินบริจาค', 'ห้องสมุด', 'บรรณารักษ์', 'ปกติ'),
('ASSET-2568-0002', 'โต๊ะทำงานครู ไม้สัก', 'ไม้สักไทย', 'รุ่นคลาสสิก', 'WOOD-01', 7500.00, '2568', 'งบประมาณแผ่นดิน', 'ห้องพักครูวิทย์', 'หัวหน้ากลุ่มสาระวิทย์', 'ปกติ'),
('ASSET-2568-0003', 'เก้าอี้สำนักงาน ล้อเลื่อน', 'Modernform', 'Office-Plus', 'MF-889', 2400.00, '2568', 'งบประมาณแผ่นดิน', 'ห้องพักครูวิทย์', 'หัวหน้ากลุ่มสาระวิทย์', 'ปกติ')
ON CONFLICT (code) DO NOTHING;

-- Insert Sample Inventory Logs
INSERT INTO inventory_logs (inventory_id, type, po_number, seller, receive_date, quantity, price, created_by)
SELECT id, 'purchase', 'PO-2569/001', 'บริษัท สเตชั่นเนอรี่ จำกัด', '2026-05-10', 100, 120.00, 'เจ้าหน้าที่ พัสดุดี'
FROM inventory WHERE code = 'INV001';

INSERT INTO inventory_logs (inventory_id, type, po_number, seller, receive_date, quantity, price, created_by)
SELECT id, 'purchase', 'PO-2569/002', 'บริษัท ไอที ซัพพลาย จำกัด', '2026-05-15', 20, 1850.00, 'เจ้าหน้าที่ พัสดุดี'
FROM inventory WHERE code = 'INV002';

-- Insert Sample Inventory Requests
INSERT INTO inventory_requests (inventory_id, borrower, department, request_date, quantity, status, approved_by, approved_date)
SELECT id, 'ครู สมชาย', 'กลุ่มสาระการเรียนรู้คณิตศาสตร์', '2026-06-01', 10, 'approved', 'เจ้าหน้าที่ พัสดุดี', NOW()
FROM inventory WHERE code = 'INV001';

INSERT INTO inventory_requests (inventory_id, borrower, department, request_date, quantity, status, approved_by, approved_date)
SELECT id, 'ครู สมหญิง', 'กลุ่มสาระการเรียนรู้วิทยาศาสตร์', '2026-06-05', 20, 'approved', 'เจ้าหน้าที่ พัสดุดี', NOW()
FROM inventory WHERE code = 'INV001';

INSERT INTO inventory_requests (inventory_id, borrower, department, request_date, quantity, status)
SELECT id, 'ครู วิชัย', 'กลุ่มสาระการเรียนรู้ภาษาไทย', '2026-06-12', 5, 'pending'
FROM inventory WHERE code = 'INV002';

-- Insert Sample Asset Checks
INSERT INTO asset_checks (asset_id, checker, status, notes)
SELECT id, 'เจ้าหน้าที่ พัสดุดี', 'พบครบ', 'สภาพดี ใช้งานได้ปกติ'
FROM assets WHERE code = 'ASSET-2569-0001';

INSERT INTO asset_checks (asset_id, checker, status, notes)
SELECT id, 'เจ้าหน้าที่ พัสดุดี', 'ชำรุด', 'ภาพไม่ติด หลอดภาพเสีย'
FROM assets WHERE code = 'ASSET-2569-0002';

-- Insert Sample Asset Repairs
INSERT INTO asset_repairs (asset_id, reporter, description, status, notes)
SELECT id, 'ครูคณิตศาสตร์', 'เปิดไม่ติด ภาพไม่ชัดเจน', 'แจ้งแล้ว', 'รอช่างเข้าตรวจสอบหน้างาน'
FROM assets WHERE code = 'ASSET-2569-0002';

-- Insert Sample Procurements
INSERT INTO procurements (project_name, fiscal_year, seller, status, items) VALUES
('โครงการจัดซื้อวัสดุสำนักงานประจำภาคเรียนที่ 1/2569', '2569', 'ร้านสมใจเครื่องเขียน', 'pending', '[{"name": "กระดาษ A4 80 แกรม", "category": "เครื่องเขียน", "unit": "รีม", "price_per_unit": 120.00, "quantity": 50, "location": "ห้องพัสดุ อาคาร 1"}, {"name": "หมึกพิมพ์ HP Laser", "category": "อุปกรณ์คอมพิวเตอร์", "unit": "กล่อง", "price_per_unit": 1850.00, "quantity": 10, "location": "ห้องพัสดุ อาคาร 1"}]'::jsonb);

-- 11. Enable Realtime Publications for Real-time System Notifications
-- These commands enable real-time message broadcasting for any updates, requests, repairs, assets, checks, and procurements.
-- First remove them if they already exist inside a safe transaction block to prevent duplicate errors on re-run.
do $$
begin
  begin
    alter publication supabase_realtime drop table inventory, inventory_requests, asset_repairs, assets, asset_checks, procurements;
  exception
    when others then null;
  end;
end $$;

alter publication supabase_realtime add table inventory, inventory_requests, asset_repairs, assets, asset_checks, procurements;

-- 12. PWA Web Push Subscriptions Table
-- Stores user browser push manager endpoints for background notifications
CREATE TABLE IF NOT EXISTS pwa_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL,
    subscription JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(username, subscription)
);

ALTER TABLE pwa_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow all operations for subscriptions to make client registration simple
DROP POLICY IF EXISTS pwa_subscriptions_all ON pwa_subscriptions;
CREATE POLICY pwa_subscriptions_all ON pwa_subscriptions FOR ALL USING (true) WITH CHECK (true);


-- 13. PWA Web Push Notification triggers via pg_net HTTP Request
-- Create trigger function
CREATE OR REPLACE FUNCTION public.send_push_notification_trigger()
RETURNS TRIGGER AS $$
DECLARE
    payload jsonb;
    request_id bigint;
    url text := 'https://iberaugjjhjgbwkzxswk.supabase.co/functions/v1/send-push';
    -- Pass API key and Authorization header to pass Supabase API Gateway JWT verification
    headers jsonb := '{
        "Content-Type": "application/json",
        "apikey": "sb_publishable_Cnit-KuO8o1NtlOoRAyMQg_BegSURgQ",
        "Authorization": "Bearer sb_publishable_Cnit-KuO8o1NtlOoRAyMQg_BegSURgQ"
    }'::jsonb;
BEGIN
    payload := jsonb_build_object(
        'table', TG_TABLE_NAME,
        'type', TG_OP,
        'record', CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE row_to_json(NEW)::jsonb END,
        'old_record', CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE row_to_json(OLD)::jsonb END
    );

    BEGIN
        SELECT net.http_post(url := url, body := payload, headers := headers) INTO request_id;
    EXCEPTION WHEN OTHERS THEN
        SELECT public.http_post(url := url, body := payload, headers := headers) INTO request_id;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate triggers for each table with DELETE event support
DROP TRIGGER IF EXISTS trg_send_push_inventory ON inventory;
CREATE TRIGGER trg_send_push_inventory
AFTER INSERT OR UPDATE OR DELETE ON inventory
FOR EACH ROW EXECUTE FUNCTION public.send_push_notification_trigger();

DROP TRIGGER IF EXISTS trg_send_push_assets ON assets;
CREATE TRIGGER trg_send_push_assets
AFTER INSERT OR UPDATE OR DELETE ON assets
FOR EACH ROW EXECUTE FUNCTION public.send_push_notification_trigger();

DROP TRIGGER IF EXISTS trg_send_push_inventory_requests ON inventory_requests;
CREATE TRIGGER trg_send_push_inventory_requests
AFTER INSERT OR UPDATE OR DELETE ON inventory_requests
FOR EACH ROW EXECUTE FUNCTION public.send_push_notification_trigger();

DROP TRIGGER IF EXISTS trg_send_push_asset_repairs ON asset_repairs;
CREATE TRIGGER trg_send_push_asset_repairs
AFTER INSERT OR UPDATE OR DELETE ON asset_repairs
FOR EACH ROW EXECUTE FUNCTION public.send_push_notification_trigger();

DROP TRIGGER IF EXISTS trg_send_push_asset_checks ON asset_checks;
CREATE TRIGGER trg_send_push_asset_checks
AFTER INSERT OR DELETE ON asset_checks
FOR EACH ROW EXECUTE FUNCTION public.send_push_notification_trigger();

DROP TRIGGER IF EXISTS trg_send_push_procurements ON procurements;
CREATE TRIGGER trg_send_push_procurements
AFTER INSERT OR UPDATE OR DELETE ON procurements
FOR EACH ROW EXECUTE FUNCTION public.send_push_notification_trigger();


