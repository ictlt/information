const fs = require('fs');

const path = 'C:\\Users\\PMCoding\\Documents\\Antigravity\\ictschool\\index.html';
let content = fs.readFileSync(path, 'utf8');

const startMarker = "let currentReportKey = '';";
// The end marker is the end of viewReportDetail function
const endMarker = "document.getElementById('btn-export-excel').onclick = () => exportReport(reportKey, 'excel');\r\n    }";
const endMarkerLF = "document.getElementById('btn-export-excel').onclick = () => exportReport(reportKey, 'excel');\n    }";

const startIdx = content.indexOf(startMarker);
let endIdx = content.indexOf(endMarker);
if (endIdx === -1) {
  endIdx = content.indexOf(endMarkerLF);
}

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = `let currentReportKey = '';

    function getUserDepartment(person) {
      if (!person) return 'ทั่วไป';
      const u = cacheUsers.find(user => user.name === person || user.username === person);
      return u ? u.department : 'ทั่วไป';
    }

    function populateReportFilterDropdown() {
      const select = document.getElementById('report-filter-department');
      if (!select) return;
      
      const depts = new Set();
      cacheUsers.forEach(u => { if (u.department) depts.add(u.department); });
      cacheRequests.forEach(r => { if (r.department) depts.add(r.department); });
      
      const currentVal = select.value || 'all';
      select.innerHTML = '<option value="all">ทั้งหมดทุกฝ่ายงาน</option>';
      depts.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d;
        opt.innerText = d;
        select.appendChild(opt);
      });
      select.value = currentVal;
    }

    async function onReportFilterChange() {
      if (currentReportKey) {
        await viewReportDetail(currentReportKey);
      }
    }

    async function viewReportDetail(reportKey) {
      currentReportKey = reportKey;
      const titleEl = document.getElementById('report-title');
      const descEl = document.getElementById('report-desc');
      const header = document.getElementById('report-result-header');
      const body = document.getElementById('report-result-body');
      
      document.getElementById('report-details-panel').classList.remove('hidden');

      // Populate department list
      populateReportFilterDropdown();
      const selectedDept = document.getElementById('report-filter-department')?.value || 'all';

      if (reportKey === 'low_stock') {
        titleEl.innerText = 'รายงานพัสดุสิ้นเปลืองใกล้หมดคลัง';
        descEl.innerText = 'แสดงรายการพัสดุที่มีจำนวนยอดคงเหลือต่ำกว่าจุดสั่งซื้อต่ำสุดที่กำหนดไว้';
        
        header.innerHTML = \`
          <tr>
            <th class="py-3 px-4">รหัสพัสดุ</th>
            <th class="py-3 px-4">ชื่อพัสดุ</th>
            <th class="py-3 px-4">คงเหลือ</th>
            <th class="py-3 px-4">จุดสั่งซื้อต่ำสุด</th>
            <th class="py-3 px-4">สถานที่จัดเก็บ</th>
          </tr>
        \`;
        
        let lowItems = cacheInventory.filter(item => item.stock_remain < item.min_threshold);
        if (selectedDept !== 'all') {
          // Show low stock items requested by the selected department
          const deptInvIds = new Set(cacheRequests.filter(r => r.department === selectedDept).map(r => r.inventory_id));
          lowItems = lowItems.filter(item => deptInvIds.has(item.id));
        }

        if (lowItems.length === 0) {
          body.innerHTML = \`<tr><td colspan="5" class="py-8 text-center text-slate-400">ไม่มีพัสดุใกล้หมดคลังสำหรับฝ่ายงานนี้</td></tr>\`;
        } else {
          // Group by category for nicer representation
          const grouped = {};
          lowItems.forEach(item => {
            const cat = item.category || 'เครื่องเขียน';
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(item);
          });

          let bodyHtml = '';
          for (const [cat, list] of Object.entries(grouped)) {
            bodyHtml += \`
              <tr class="bg-indigo-50/40 font-bold text-indigo-900">
                <td colspan="5" class="py-2 px-4 text-xs">หมวดหมู่: \${cat}</td>
              </tr>
            \`;
            bodyHtml += list.map(item => \`
              <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                <td class="py-3 px-4 font-semibold text-slate-900">\${item.code}</td>
                <td class="py-3 px-4 font-bold text-slate-800">\${item.name}</td>
                <td class="py-3 px-4 text-red-650 font-bold">\${item.stock_remain} \${item.unit}</td>
                <td class="py-3 px-4 font-semibold text-slate-500">\${item.min_threshold}</td>
                <td class="py-3 px-4 text-xs text-slate-550">\${item.location}</td>
              </tr>
            \`).join('');
          }
          body.innerHTML = bodyHtml;
        }
      } else if (reportKey === 'borrow_logs') {
        titleEl.innerText = 'รายงานประวัติการเบิกจ่ายพัสดุสะสม';
        descEl.innerText = 'แสดงข้อมูลประวัติสะสมทั้งหมดที่มีการขอเบิกวัสดุสิ้นเปลืองพร้อมสถานะการคืน';

        header.innerHTML = \`
          <tr>
            <th class="py-3 px-4">วันที่เบิก</th>
            <th class="py-3 px-4">ชื่อพัสดุ</th>
            <th class="py-3 px-4">ผู้ขอเบิก</th>
            <th class="py-3 px-4">ฝ่าย/กลุ่มสาระ</th>
            <th class="py-3 px-4">จำนวนเบิก</th>
            <th class="py-3 px-4">สถานะการทำรายการ</th>
          </tr>
        \`;

        let filteredRequests = cacheRequests;
        if (selectedDept !== 'all') {
          filteredRequests = cacheRequests.filter(r => r.department === selectedDept);
        }

        if (filteredRequests.length === 0) {
          body.innerHTML = \`<tr><td colspan="6" class="py-8 text-center text-slate-400">ไม่มีประวัติการเบิกจ่ายใดๆ</td></tr>\`;
        } else {
          // Group by department
          const grouped = {};
          filteredRequests.forEach(r => {
            const dept = r.department || 'ไม่ระบุ';
            if (!grouped[dept]) grouped[dept] = [];
            grouped[dept].push(r);
          });

          let bodyHtml = '';
          for (const [dept, list] of Object.entries(grouped)) {
            bodyHtml += \`
              <tr class="bg-indigo-50/40 font-bold text-indigo-900">
                <td colspan="6" class="py-2 px-4 text-xs">ฝ่ายงาน: \${dept} (\${list.length} รายการ)</td>
              </tr>
            \`;
            bodyHtml += list.map(r => \`
              <tr class="hover:bg-slate-50 transition border-b border-slate-100 text-xs">
                <td class="py-3 px-4 font-semibold text-slate-500">\${new Date(r.request_date).toLocaleDateString('th-TH')}</td>
                <td class="py-3 px-4 font-bold text-slate-800 text-sm">\${r.inventory?.name || '-'}</td>
                <td class="py-3 px-4 font-semibold text-slate-700">\${r.borrower}</td>
                <td class="py-3 px-4 text-slate-500">\${r.department}</td>
                <td class="py-3 px-4 text-slate-700 font-bold">\${r.quantity} \dots\${r.inventory?.unit || ''}</td>
                <td class="py-3 px-4">
                  <span class="px-2 py-0.5 rounded-full font-bold \${
                    r.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    r.status === 'returned' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                    r.status === 'rejected' ? 'bg-red-50 text-red-600 border border-red-100' :
                    'bg-amber-50 text-amber-600 border border-amber-100'
                  }">\${r.status === 'approved' ? 'อนุมัติแล้ว' : r.status === 'returned' ? 'คืนพัสดุแล้ว' : r.status === 'rejected' ? 'ปฏิเสธ' : 'รออนุมัติ'}</span>
                </td>
              </tr>
            \`).join('');
          }
          body.innerHTML = bodyHtml;
        }
      } else if (reportKey === 'assets_group') {
        titleEl.innerText = 'รายงานมูลค่าทรัพย์สินตามปีงบประมาณและห้อง';
        descEl.innerText = 'สรุปรายชื่อและมูลค่ารวมทรัพย์สินทั้งหมดที่ติดตั้งในสถานศึกษา';

        header.innerHTML = \`
          <tr>
            <th class="py-3 px-4">เลขครุภัณฑ์</th>
            <th class="py-3 px-4">ชื่อครุภัณฑ์</th>
            <th class="py-3 px-4">ห้อง/สถานที่</th>
            <th class="py-3 px-4">ผู้ดูแล</th>
            <th class="py-3 px-4">ปีงบประมาณ</th>
            <th class="py-3 px-4">มูลค่าราคาประเมิน</th>
          </tr>
        \`;

        let filteredAssets = cacheAssets;
        if (selectedDept !== 'all') {
          filteredAssets = cacheAssets.filter(a => getUserDepartment(a.responsible_person) === selectedDept);
        }

        if (filteredAssets.length === 0) {
          body.innerHTML = \`<tr><td colspan="6" class="py-8 text-center text-slate-400">ไม่มีข้อมูลครุภัณฑ์</td></tr>\`;
        } else {
          // Group by department
          const groupedAssets = {};
          filteredAssets.forEach(a => {
            const dept = getUserDepartment(a.responsible_person);
            if (!groupedAssets[dept]) groupedAssets[dept] = [];
            groupedAssets[dept].push(a);
          });

          let rowsHtml = '';
          let grandTotal = 0;
          
          for (const [dept, list] of Object.entries(groupedAssets)) {
            rowsHtml += \`
              <tr class="bg-indigo-50/40 font-bold text-indigo-900">
                <td colspan="6" class="py-2 px-4 text-xs">ฝ่ายงาน: \thิ\${dept} (\${list.length} รายการ)</td>
              </tr>
            \`;
            rowsHtml += list.map(a => \`
              <tr class="hover:bg-slate-50 transition border-b border-slate-100 text-xs">
                <td class="py-3 px-4 font-semibold text-slate-500">\${a.code}</td>
                <td class="py-3 px-4 font-bold text-slate-800 text-sm">\${a.name}</td>
                <td class="py-3 px-4 text-slate-650">\${a.room}</td>
                <td class="py-3 px-4 text-slate-500">\${a.responsible_person}</td>
                <td class="py-3 px-4 text-slate-500 font-bold">\${a.fiscal_year}</td>
                <td class="py-3 px-4 text-slate-800 font-bold">\${Number(a.price).toLocaleString()} ฿</td>
              </tr>
            \`).join('');

            const deptTotal = list.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
            grandTotal += deptTotal;

            rowsHtml += \`
              <tr class="bg-slate-50/50 font-semibold text-slate-700 border-b border-slate-150">
                <td colspan="5" class="py-2 px-4 text-right text-xs">มูลค่ารวมฝ่าย \${dept}:</td>
                <td class="py-2 px-4 text-indigo-650 text-xs font-bold">\${deptTotal.toLocaleString()} ฿</td>
              </tr>
            \`;
          }

          rowsHtml += \`
            <tr class="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
              <td colspan="5" class="py-4 px-4 text-right text-sm">มูลค่าครุภัณฑ์สะสมรวมทั้งหมด:</td>
              <td class="py-4 px-4 text-indigo-600 text-sm">\${grandTotal.toLocaleString()} ฿</td>
            </tr>
          \`;
          body.innerHTML = rowsHtml;
        }
      }
      
      // Bind exports dynamically
      document.getElementById('btn-export-pdf').onclick = () => exportReport(reportKey, 'pdf');
      document.getElementById('btn-export-excel').onclick = () => exportReport(reportKey, 'excel');
    }`;

  const endLength = endIdx === content.indexOf(endMarker) ? endMarker.length : endMarkerLF.length;
  content = content.substring(0, startIdx) + replacement + content.substring(endIdx + endLength);
  
  fs.writeFileSync(path, content, 'utf8');
  console.log("REPLACED REPORTS LOGIC SUCCESSFULLY!");
} else {
  console.log("MARKERS NOT FOUND: start =", startIdx, "end =", endIdx);
}
