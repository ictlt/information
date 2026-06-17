import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import webpush from "npm:web-push"

// Configure Web Push with VAPID details
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") || "BJZ-4BptHGkK2iThFeGyNxTOYGvXygSpCHDoutZ-lLDKzlAackOQPwiRg5WPtf5nTWvp2TyGnBKRsGYFxlcikeI";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") || "g5wQOOTcuWj4gH9iZ73J-XVo5SEHNCHHHQMydsvIhQA";
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:admin@laemthong.ac.th";

webpush.setVapidDetails(
  VAPID_SUBJECT,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// Initialize Supabase client
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json();
    console.log("Push trigger event received:", payload);

    const { table, type, record, old_record } = payload;
    let title = "อัปเดตระบบพัสดุ";
    let body = "มีการบันทึกข้อมูลใหม่ในระบบ";

    if (table === 'inventory_requests') {
      const borrower = record?.borrower || "ผู้ใช้งาน";
      const qty = record?.quantity || 1;
      const itemId = record?.inventory_id;
      const itemName = itemId ? await getInventoryName(itemId) : "พัสดุ";

      if (type === 'INSERT') {
        title = "ขอเบิกพัสดุใหม่";
        body = `คุณ ${borrower} ได้ยื่นขอเบิก ${itemName} จำนวน ${qty}`;
      } else if (type === 'UPDATE' && record?.status !== old_record?.status) {
        let statusText = record?.status;
        if (record?.status === 'approved') statusText = "อนุมัติแล้ว";
        else if (record?.status === 'rejected') statusText = "ปฏิเสธคำขอ";
        else if (record?.status === 'returned') statusText = "คืนพัสดุแล้ว";
        else if (record?.status === 'pending') statusText = "รอการอนุมัติ";

        title = "อัปเดตสถานะการเบิกพัสดุ";
        body = `รายการเบิก ${itemName} (โดยคุณ ${borrower}) ปรับสถานะเป็น "${statusText}"`;
      }
    } else if (table === 'asset_repairs') {
      const reporter = record?.reporter || "ผู้แจ้ง";
      const desc = record?.description || "ไม่ระบุอาการ";
      const assetId = record?.asset_id;
      const assetName = assetId ? await getAssetName(assetId) : "ครุภัณฑ์";

      if (type === 'INSERT') {
        title = "แจ้งซ่อมครุภัณฑ์ใหม่";
        body = `ครุภัณฑ์: ${assetName} อาการ: ${desc} โดยคุณ ${reporter}`;
      } else if (type === 'UPDATE' && record?.status !== old_record?.status) {
        title = "อัปเดตสถานะการซ่อม";
        body = `รายการแจ้งซ่อม ${assetName} (โดยคุณ ${reporter}) อัปเดตสถานะเป็น "${record?.status}"`;
      }
    } else if (table === 'inventory') {
      const name = record?.name || "พัสดุ";
      const unit = record?.unit || "หน่วย";
      const stock = record?.stock_remain || 0;
      const min = record?.min_threshold || 10;
      
      if (type === 'UPDATE' && old_record) {
        const oldStock = old_record.stock_remain || 0;
        if (stock > oldStock) {
          title = "รับพัสดุเข้าคลัง";
          body = `รับเข้า ${name} จำนวน +${stock - oldStock} ${unit} (คงเหลือทั้งหมด: ${stock} ${unit})`;
        } else if (stock < oldStock && stock < min) {
          title = "แจ้งเตือนพัสดุใกล้หมดคลัง!";
          body = `${name} เหลือในคลังเพียง ${stock} ${unit} (จุดสั่งซื้อขั้นต่ำ: ${min})`;
        }
      } else if (type === 'INSERT') {
        title = "เพิ่มพัสดุใหม่ในคลัง";
        body = `พัสดุ: ${name} ได้รับการขึ้นทะเบียนใหม่ ยอดตั้งต้น: ${stock} ${unit}`;
      }
    } else if (table === 'assets') {
      const name = record?.name || "ครุภัณฑ์";
      const code = record?.code || "";
      const room = record?.room || "ไม่ระบุห้อง";

      if (type === 'INSERT') {
        title = "ขึ้นทะเบียนครุภัณฑ์ใหม่";
        body = `ครุภัณฑ์: ${name} (รหัส: ${code}) ติดตั้งที่ห้อง ${room}`;
      } else if (type === 'UPDATE') {
        title = "ปรับปรุงข้อมูลครุภัณฑ์";
        body = `ครุภัณฑ์: ${name} (${code}) อัปเดตสถานะเป็น "${record?.status || "ปกติ"}"`;
      }
    } else if (table === 'asset_checks') {
      const assetId = record?.asset_id;
      const assetName = assetId ? await getAssetName(assetId) : "ครุภัณฑ์";
      const status = record?.status || "พบครบ";
      const checker = record?.checker || "ผู้ตรวจ";

      if (type === 'INSERT') {
        title = "ตรวจสภาพครุภัณฑ์ประจำปี";
        body = `ครุภัณฑ์: ${assetName} ผลตรวจ: "${status}" โดย ${checker}`;
      }
    } else if (table === 'procurements') {
      const name = record?.project_name || "โครงการ";
      const year = record?.fiscal_year || "";

      if (type === 'INSERT') {
        title = "เปิดโครงการจัดซื้อจัดจ้างใหม่";
        body = `โครงการ: ${name} (ปีงบประมาณ: ${year})`;
      } else if (type === 'UPDATE' && record?.status !== old_record?.status) {
        let statusText = record?.status;
        if (record?.status === 'approved') statusText = "อนุมัติแล้ว";
        else if (record?.status === 'rejected') statusText = "ปฏิเสธ/ยกเลิก";
        else if (record?.status === 'pending') statusText = "รออนุมัติ";

        title = "อัปเดตโครงการจัดซื้อ";
        body = `โครงการ: ${name} ปรับสถานะเป็น "${statusText}"`;
      }
    }

    // Fetch active subscriptions from database
    const { data: subs, error: err } = await supabase
      .from('pwa_subscriptions')
      .select('subscription');

    if (err) throw err;

    if (!subs || subs.length === 0) {
      console.log("No active push subscriptions found.");
      return new Response(JSON.stringify({ status: "no_subscribers" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log(`Broadcasting to ${subs.length} active subscription endpoints...`);

    const message = JSON.stringify({ title, body });
    const sendPromises = subs.map((s: any) => {
      return webpush.sendNotification(s.subscription, message)
        .catch(async (e: any) => {
          console.error("Failed to send notification to endpoint, status code:", e.statusCode);
          // If subscription has expired or is invalid (404/410), delete it from DB
          if (e.statusCode === 404 || e.statusCode === 410) {
            console.log("Removing invalid/expired subscription from database...");
            await supabase
              .from('pwa_subscriptions')
              .delete()
              .eq('subscription', s.subscription);
          }
        });
    });

    await Promise.all(sendPromises);

    return new Response(JSON.stringify({ status: "success", dispatched: subs.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error sending push notifications:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

// Helper resolvers
async function getInventoryName(id: string): Promise<string> {
  try {
    const { data } = await supabase.from('inventory').select('name').eq('id', id).single();
    return data ? data.name : "พัสดุ";
  } catch {
    return "พัสดุ";
  }
}

async function getAssetName(id: string): Promise<string> {
  try {
    const { data } = await supabase.from('assets').select('name').eq('id', id).single();
    return data ? data.name : "ครุภัณฑ์";
  } catch {
    return "ครุภัณฑ์";
  }
}
