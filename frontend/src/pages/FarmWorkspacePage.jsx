import '../farm-workspace.css'

const navItems = [
  { module: 'overview', href: '/dashboard/farm', icon: 'dashboard', label: 'Bảng điều khiển' },
  { module: 'seasons', href: '/farm/seasons', icon: 'potted_plant', label: 'Mùa vụ' },
  { module: 'packages', href: '/farm/packages', icon: 'package_2', label: 'Lô hàng' },
  { module: 'marketplace', href: '/farm/marketplace', icon: 'storefront', label: 'Chợ nông sản' },
  { module: 'contracts', href: '/farm/contracts', icon: 'description', label: 'Contracts' },
  { module: 'shipping', href: '/farm/shipping', icon: 'local_shipping', label: 'Vận chuyển' },
  { module: 'iot', href: '/farm/iot', icon: 'sensors', label: 'IoT Monitoring' },
  { module: 'blockchain', href: '/farm/blockchain', icon: 'database', label: 'Blockchain Logs' },
  { module: 'profile', href: '/farm/profile', icon: 'agriculture', label: 'Farm Hồ sơ' },
]

function Icon({ children, fill = false }) {
  return <span className={`material-symbols-outlined${fill ? ' fill' : ''}`}>{children}</span>
}

function FarmShell({ module, title, subtitle, searchPlaceholder, children }) {
  return (
    <div className="farm-prototype-shell">
      <aside className="farm-proto-sidebar">
        <div className="farm-proto-brand">
          <div className="farm-proto-logo">GF</div>
          <div>
            <strong>GreenField Farm</strong>
            <span><Icon>verified</Icon> Đã xác thực blockchain</span>
          </div>
        </div>
        <nav className="farm-proto-nav" aria-label="Farm workspace navigation">
          {navItems.map((item) => (
            <a key={item.module} href={item.href} className={item.module === module ? 'active' : ''}>
              <Icon fill={item.module === module}>{item.icon}</Icon>
              {item.label}
            </a>
          ))}
        </nav>
        <button className="farm-proto-add"><Icon>add</Icon> Add New Batch</button>
      </aside>
      <main className="farm-proto-main">
        <header className="farm-proto-topbar">
          <div>
            <h1>{title}</h1>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          <div className="farm-proto-actions">
            <label className="farm-proto-search">
              <Icon>search</Icon>
              <input placeholder={searchPlaceholder || 'Tìm kiếm...'} />
            </label>
            <button><Icon>notifications</Icon></button>
            <button><Icon>help</Icon></button>
            <button><Icon>settings</Icon></button>
            <div className="farm-proto-avatar">GF</div>
          </div>
        </header>
        {children}
      </main>
    </div>
  )
}

function StatCard({ icon, label, value, tone = 'green' }) {
  return <article className={`farm-stat-card ${tone}`}><Icon>{icon}</Icon><span>{label}</span><strong>{value}</strong></article>
}

function OverviewPage() {
  return (
    <FarmShell module="overview" title="Tổng quan Nông trại" subtitle="Theo dõi sản xuất, IoT và chuỗi cung ứng theo thời gian thực." searchPlaceholder="Tìm kiếm...">
      <section className="farm-proto-content farm-overview">
        <div className="farm-page-head">
          <div><h2>Tổng quan Nông trại</h2><p>Theo dõi sản xuất, IoT và chuỗi cung ứng theo thời gian thực.</p></div>
          <div><button className="farm-btn ghost"><Icon>calendar_today</Icon> Hôm nay</button><button className="farm-btn primary"><Icon>download</Icon> Báo cáo</button></div>
        </div>
        <div className="farm-kpi-grid five">
          <StatCard icon="eco" label="Tổng Mùa Vụ" value="12" />
          <StatCard icon="inventory_2" label="Tổng Lô Hàng" value="145" tone="brown" />
          <StatCard icon="store" label="Bán Hàng đang hoạt động" value="28" tone="blue" />
          <StatCard icon="pending_actions" label="Đơn Chờ Xử Lý" value="7" tone="red" />
          <StatCard icon="local_shipping" label="Đang Giao Hàng" value="4" />
        </div>
        <div className="farm-bento-grid">
          <article className="farm-glass-card farm-chart-card">
            <div className="farm-card-head"><h3>Xu Hướng Năng Suất</h3><select><option>Năm nay</option><option>Năm ngoái</option></select></div>
            <div className="farm-chart-bars">{[40,65,55,80,95,30].map((v,i)=><div key={i} style={{height:`${v}%`}}><span>{i === 5 ? 'Dự kiến ' : ''}{v}T</span></div>)}</div>
          </article>
          <article className="farm-glass-card farm-alert-card">
            <div className="farm-card-head"><h3>Cảnh Báo IoT</h3><Icon>sensors</Icon></div>
            <div className="farm-alert danger"><Icon fill>warning</Icon><div><strong>Độ ẩm đất thấp</strong><p>Khu vực A (Lô #102) ghi nhận độ ẩm 32%.</p><button>Kích hoạt bơm nước</button></div></div>
            <div className="farm-alert"><Icon>thermostat</Icon><div><strong>Nhiệt độ ổn định</strong><p>Nhà màng B duy trì ở mức 24°C.</p></div></div>
            <div className="farm-alert"><Icon>science</Icon><div><strong>Lịch kiểm tra pH</strong><p>Cần lấy mẫu đất khu C vào chiều nay.</p></div></div>
          </article>
        </div>
      </section>
    </FarmShell>
  )
}

function SeasonsPage() {
  const seasons = [
    { name: 'Arabica Mùa Xuân 2024', status: 'Đang sinh trưởng', active: true, code: 'B-2401', yield: '4.5 Tấn' },
    { name: 'Arabica Thu Đông 2023', status: 'Đã thu hoạch', code: 'B-2309', yield: '4.2 Tấn' },
  ]
  return (
    <FarmShell module="seasons" title="Quản lý Mùa vụ" subtitle="Giám sát và theo dõi tiến trình trồng trọt Cà phê Arabica." searchPlaceholder="Tìm kiếm mùa vụ...">
      <section className="farm-proto-content farm-season-layout">
        <div className="farm-season-list"><div className="farm-section-title"><h2>Danh sách Mùa vụ</h2><Icon>filter_list</Icon></div>{seasons.map((s)=><article className={`farm-season-card ${s.active?'active':''}`} key={s.name}><div><h3>{s.name}</h3><span>Cà phê Arabica</span><span>• Lô: {s.code}</span></div><b>{s.status}</b><dl><div><dt>Ngày bắt đầu</dt><dd>15/02/2024</dd></div><div><dt>Dự kiến thu hoạch</dt><dd>10/11/2024</dd></div></dl><footer><span>Sản lượng ước tính</span><strong>{s.yield}</strong><Icon>arrow_forward</Icon></footer></article>)}</div>
        <div className="farm-season-detail"><article className="farm-glass-card farm-season-hero"><div><Icon>eco</Icon><div><h2>Arabica Mùa Xuân 2024</h2><p><Icon>location_on</Icon> Vùng trồng Nam Ban, Lâm Đồng</p></div></div><div><button className="farm-btn ghost"><Icon>link</Icon> Liên kết Lô mới</button><button className="farm-btn secondary"><Icon>edit_note</Icon> Cập nhật Nhật ký</button></div></article>
          <div className="farm-detail-grid"><aside><article className="farm-glass-card"><h3><Icon>cloud</Icon> Thời tiết hiện tại</h3><div className="farm-temp">24°C <span>Độ ẩm 68%</span></div><p>Lượng mưa <b>12mm (Tuần)</b></p><p>Độ pH Đất <b>6.2 (Tối ưu)</b></p><div className="farm-note"><Icon>info</Icon> Cảnh báo sương muối nhẹ vào rạng sáng ngày mai.</div></article><div className="farm-map-card"><span>Khu vực 3A</span><p><Icon>map</Icon> Lô đất B-2401</p></div></aside><article className="farm-glass-card farm-timeline"><h3>Nhật ký Nông nghiệp</h3>{['Gieo hạt & Trồng cây','Bón phân đợt 1','Tưới tiêu & Kiểm soát Sâu bệnh','Thu hoạch & Sơ chế'].map((t,i)=><div className={`timeline-item ${i===2?'current':''} ${i===3?'future':''}`} key={t}><span></span><div><h4>{t}</h4><small>{i===2?'Hiện tại':i===3?'Dự kiến: T11/2024':'15/02/2024'}</small><p>{i===0?'Sử dụng giống Arabica thuần chủng ghép gốc Robusta kháng tuyến trùng.':i===1?'Bón phân hữu cơ vi sinh kết hợp NPK 16-16-8.':i===2?'Duy trì độ ẩm đất ở mức 65-70%, theo dõi sâu bệnh.':'Chờ thực hiện. Tiêu chuẩn hái mọng > 95%.'}</p></div></div>)}</article></div>
        </div>
      </section>
    </FarmShell>
  )
}

function PackagesPage() {
  return (
    <FarmShell module="packages" title="Quản lý Lô hàng" searchPlaceholder="Tìm kiếm lô hàng...">
      <section className="farm-batch-page">
        <div className="farm-batch-list"><div className="farm-filter-row">{['Tất cả','Bản nháp','Đã đóng gói','Đang bán','Đã giao'].map((x,i)=><button className={i===0?'active':''} key={x}>{x}</button>)}</div><div className="farm-batch-cards"><BatchCard selected code="#BR-9021" status="Đã đóng gói" name="Cà phê Robusta Hữu cơ" qr="QR Đã tạo" /><BatchCard code="#BR-9022" status="Bản nháp" name="Cà phê Arabica Cầu Đất" qr="QR Chưa tạo" /></div></div>
        <aside className="farm-batch-detail"><header><span>Chi tiết Lô hàng</span><h2>#BR-9021</h2><p>Cà phê Robusta Hữu cơ - Thu hoạch vụ Mùa Thu 2023.</p></header><div className="farm-qr-box"><div className="fake-qr"></div><div><strong>Mã QR Đã Kích Hoạt</strong><button className="farm-btn ghost">In Nhãn dán</button><small>URL Truy xuất nguồn gốc công khai đã sẵn sàng</small></div></div><h3>Nhật ký Đóng gói (Truy xuất nguồn gốc)</h3><div className="farm-log-list">{['Đóng gói hoàn tất','Phân loại & Làm sạch','Tạo lô trên Blockchain'].map((x,i)=><div key={x}><span>{i===0?'':'✓'}</span><div><b>{x}</b><small>{i===0?'Hôm nay, 14:30':'Hôm qua, 09:15'}</small><p>{i===2?'TxHash: 0x8f2a...9b41':'Lô hàng được xử lý và ghi nhận theo chuẩn.'}</p></div></div>)}</div><button className="farm-btn primary full">Đăng bán lên Chợ nông sản</button></aside>
      </section>
    </FarmShell>
  )
}
function BatchCard({ selected, code, status, name, qr }) { return <article className={`farm-batch-card ${selected?'selected':''}`}><div><h3>{code}</h3><span>{status}</span><b><Icon>verified_user</Icon> Blockchain {selected?'Verified':'Pending'}</b></div><h4>{name}</h4><p><Icon>scale</Icon> 1,200 kg <Icon>calendar_today</Icon> 12/10/2023</p><footer><Icon>qr_code_2</Icon> {qr}<span>• Lô chứa 24 kiện nhỏ</span></footer></article> }

function BlockchainPage() {
  const rows = [['0x7f9a...8b2c','BATCH-2023-A1','Thu hoạch','Confirmed (Polygon)','ok'],['0x1a2b...3c4d','BATCH-2023-A1','Đóng gói','Failed','fail'],['Pending...','BATCH-2023-B2','Vận chuyển','Processing','pending']]
  return <FarmShell module="blockchain" title="Nhật ký Blockchain" subtitle="Lịch sử giao dịch và xác thực trên chuỗi khối."><section className="farm-proto-content"><article className="farm-table-card"><table><thead><tr>{['Transaction Hash','Mã Lô Hàng','Sự kiện','Thời gian','Trạng thái','Hành động'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={r[1]+i}><td><a>{r[0]} <Icon>open_in_new</Icon></a></td><td>{r[1]}</td><td>{r[2]}</td><td>20/10/2023 14:30</td><td><span className={`chain ${r[4]}`}>{r[3]}</span></td><td>{r[4]==='fail'?<button>Thử lại</button>:null}</td></tr>)}</tbody></table><footer>Hiển thị 1-3 trong số 128 giao dịch <span><button disabled>‹</button><button>›</button></span></footer></article></section></FarmShell>
}

function ExportPage() {
  return <FarmShell module="packages" title="Xuất mã QR & Tem nhãn"><section className="farm-proto-content farm-export-grid"><div><Card title="Chọn lô hàng" icon="package_2"><label>Lô hàng (Batch ID)<select><option>B-2023-11-ORG-001 (Cà phê Arabica)</option></select></label><div className="farm-info-strip"><span>Trạng thái Blockchain</span><b><Icon>verified</Icon> Đã xác thực</b><span>Ngày thu hoạch</span><b>15/11/2023</b></div></Card><Card title="Tùy chọn xuất" icon="settings_applications"><div className="farm-choice"><button className="active">PNG (Hình ảnh)</button><button>PDF (In ấn)</button></div><div className="farm-choice"><button>Tiêu chuẩn<br/><small>100x100 mm</small></button><button className="active">Nhỏ<br/><small>50x50 mm</small></button></div><button className="farm-btn primary full"><Icon>download</Icon> Tải xuống Tem nhãn QR</button><button className="farm-btn ghost full"><Icon>content_copy</Icon> Sao chép Liên kết Truy xuất</button></Card></div><Card title="Bản xem trước Tem nhãn" icon="visibility" className="preview"><div className="label-canvas"><div className="product-label"><header>Cà phê Arabica<small>Hữu cơ - Organic</small></header><div><div className="fake-qr large"></div><p>Quét để truy xuất nguồn gốc</p></div><footer><p><span>Mã lô:</span><b>B-2023-11-001</b></p><p><span>Nông trại:</span><b>GreenField Farm</b></p><p><span>Ngày thu hoạch:</span><b>15/11/2023</b></p></footer></div></div><p className="farm-help"><Icon>info</Icon> Nhãn thực tế có thể thay đổi tùy máy in.</p></Card></section></FarmShell>
}
function Card({ title, icon, children, className='' }) { return <article className={`farm-glass-card farm-form-card ${className}`}><h3><Icon>{icon}</Icon>{title}</h3>{children}</article> }

function MarketplacePage() {
  return <FarmShell module="marketplace" title="Quản lý Bán hàng" searchPlaceholder="Tìm kiếm sản phẩm..."><section className="farm-proto-content"><div className="farm-page-head"><div><h2>Quản lý Bán hàng</h2><p>Quản lý các sản phẩm đang niêm yết trên chợ giao dịch BICAP.</p></div><button className="farm-btn primary"><Icon>add_circle</Icon> Tạo Niêm Yết Mới</button></div><div className="farm-kpi-grid four"><StatCard icon="inventory_2" label="Tổng sản phẩm" value="124" tone="blue"/><StatCard icon="public" label="Đang Xuất Bản" value="98"/><StatCard icon="shopping_cart" label="Đơn hàng mới" value="12" tone="brown"/><StatCard icon="remove_shopping_cart" label="Hết Hàng" value="3" tone="red"/></div><div className="farm-filter-panel">{['Tất cả','Đã xuất bản','Bản nháp','Hết hàng'].map((x,i)=><button className={i===0?'active':''} key={x}>{x}</button>)}<select><option>Mới nhất</option></select></div><div className="farm-listing-grid">{['Bơ Sáp Hữu Cơ Đắk Lắk','Cà Chua Beef Hữu Cơ','Cà phê Robusta Rang Mộc'].map((x,i)=><article className={`farm-listing-card ${i===2?'sold':''}`} key={x}><div className="farm-product-art"><span>{i===0?'Đang Xuất Bản':i===1?'Bản Nháp':'Hết Hàng'}</span></div><div><h3>{x}</h3><p>Lô: BSL-2023-11A</p><dl><div><dt>Giá bán</dt><dd>{i===1?'Chưa đặt':'85,000 / kg'}</dd></div><div><dt>Tồn kho</dt><dd>{i===2?'0 kg':'500 kg'}</dd></div></dl><footer><label><input type="checkbox" defaultChecked={i===0}/> Hiển thị</label><button>{i===1?'Tiếp tục chỉnh sửa':'Chi tiết'}</button></footer></div></article>)}</div></section></FarmShell>
}

function FallbackFarmPage({ module }) { return <FarmShell module={module} title="Không gian nông trại" subtitle="Module này giữ chức năng hiện tại trong khi chờ prototype chi tiết."><section className="farm-proto-content"><article className="farm-glass-card"><h2>Module: {module}</h2><p>Trang này chưa có HTML prototype mới, nên được giữ làm placeholder an toàn trong workspace Farm.</p></article></section></FarmShell> }

export function FarmWorkspacePage({ module = 'overview' }) {
  if (module === 'overview') return <OverviewPage />
  if (module === 'seasons') return <SeasonsPage />
  if (module === 'packages') return <PackagesPage />
  if (module === 'blockchain') return <BlockchainPage />
  if (module === 'export') return <ExportPage />
  if (module === 'marketplace') return <MarketplacePage />
  return <FallbackFarmPage module={module} />
}
