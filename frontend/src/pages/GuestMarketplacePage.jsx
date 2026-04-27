import { NavLink } from 'react-router-dom'

const navItems = [
  { module: 'overview', to: '/dashboard/guest', icon: 'dashboard', label: 'Bảng điều khiển' },
  { module: 'search', to: '/guest/search', icon: 'search', label: 'Tìm kiếm' },
  { module: 'announcements', to: '/guest/announcements', icon: 'campaign', label: 'Thông báo' },
  { module: 'education', to: '/guest/education', icon: 'school', label: 'Kiến thức' },
]

const img = {
  farm: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=80',
  greenhouse: 'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=900&q=80',
  soil: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80',
  tomatoes: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=700&q=80',
  cocoa: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=700&q=80',
  avocado: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=700&q=80',
  spices: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=600&q=80',
  honey: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
  coffee: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=700&q=80',
  terrace: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80',
  vegetables: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=700&q=80',
  turmeric: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=700&q=80',
  wheat: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=700&q=80',
  advisor: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=700&q=80',
  scan: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=900&q=80',
}

function Icon({ children, fill = false }) {
  return <span className={`material-symbols-outlined${fill ? ' fill' : ''}`}>{children}</span>
}

function GuestShell({ module, searchPlaceholder, children, compact = false }) {
  return (
    <div className={`guest-prototype-shell ${compact ? 'guest-shell-compact' : ''}`}>
      <aside className="guest-side">
        <div className="guest-brand">Agro-Tech Synergy</div>
        <div className="guest-profile-card">
          <div className="guest-profile-row">
            <div className="guest-avatar"><Icon>account_circle</Icon></div>
            <div><strong>{module === 'announcements' ? 'Hồ sơ khách' : 'Không gian khách'}</strong><small>Đã xác thực blockchain</small></div>
          </div>
          {module !== 'education' ? <button className="guest-wallet">Kết nối ví</button> : null}
        </div>
        <nav className="guest-nav">
          {navItems.map((item) => (
            <NavLink key={item.module} to={item.to} className={item.module === module ? 'active' : ''}>
              <Icon fill={item.module === module}>{item.icon}</Icon><span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        {module === 'education' ? <button className="guest-wallet guest-wallet-bottom"><Icon>wallet</Icon>Kết nối ví</button> : null}
        {module === 'search' ? <div className="guest-secure-card"><strong>Truy cập bảo mật</strong><p>Kết nối ví để dùng các tính năng giao dịch nâng cao.</p><button>Kết nối ví</button></div> : null}
      </aside>
      <div className="guest-wrap">
        <header className="guest-top">
          <div className="guest-top-brand">{module === 'overview' ? 'Agro-Tech Synergy' : ''}</div>
          <label className="guest-top-search"><Icon>search</Icon><input placeholder={searchPlaceholder} /></label>
          <div className="guest-top-actions"><button><Icon>notifications</Icon></button><button><Icon>account_circle</Icon></button></div>
        </header>
        {children}
      </div>
      <nav className="guest-mobile-nav">{navItems.map((item) => <NavLink key={item.module} to={item.to} className={item.module === module ? 'active' : ''}><Icon>{item.icon}</Icon><span>{item.label}</span></NavLink>)}</nav>
    </div>
  )
}

function DashboardPage() {
  const products = [
    ['Heirloom Tomato Batch #04', '$1.20/kg', img.tomatoes, 'TOP RATED', '85%'],
    ['Ecuadorian Cocoa Nibs', '$4.85/kg', img.cocoa, 'BLOCKCHAIN TRACKED', '92%'],
    ['Premium Hass Avocados', '$3.50/kg', img.avocado, 'DIRECT FARM', '60%'],
  ]
  return <GuestShell module="overview" searchPlaceholder="Tìm kiếm marketplace, producers, or crops...">
    <main className="guest-main wide">
      <section className="guest-hero-grid">
        <article className="guest-hero-card image"><img src={img.farm} alt="Sustainable farm" /><div><span>Thị trường Highlight</span><h1>Secure Sustainable Produce Directly from Origin.</h1><p>Explore blockchain-verified agricultural assets with full traceability from soil to shelf.</p><button>Start Exploring</button></div></article>
        <aside className="guest-card news"><h3>Latest Insights</h3>{[['Blockchain', 'How Layer 2 Scaling is Revolutionizing Crop Insurance', img.greenhouse], ['Sustainability', '5 Farmers Adopting Regenerative Soil Protocols', img.soil]].map((n) => <div className="mini-news" key={n[1]}><img src={n[2]} alt="" /><div><small>{n[0]}</small><strong>{n[1]}</strong></div></div>)}<a>View Tất cả tin <Icon>arrow_forward</Icon></a></aside>
      </section>
      <section className="guest-market-grid"><aside className="guest-stack"><div className="guest-card"><div className="guest-card-head"><h3>Tìm kiếm History</h3><button>Clear</button></div>{['Arabica Coffee Beans', 'Organic Saffron Punjab', 'Non-GMO Soybeans', 'Himalayan Honey'].map((s) => <p className="history-row" key={s}><Icon>history</Icon>{s}</p>)}</div><div className="guest-gradient-card"><h4>Verify Your Supply Chain</h4><p>Use our decentralized ledger to check the authenticity of any BICAP product.</p><button>Audit Product ID</button><Icon>verified_user</Icon></div></aside><section><div className="guest-section-title"><div><h2>Featured Opportunities</h2><p>Hand-picked contracts with verified traceability scores.</p></div><button>Browse Global Thị trường <Icon>chevron_right</Icon></button></div><div className="product-grid">{products.map((p) => <article className="guest-product" key={p[0]}><div className="product-img"><img src={p[2]} alt="" /><span>{p[3]}</span></div><div><h5>{p[0]} <b>{p[1]}</b></h5><p><em>Organic</em><em>Verified Origin</em></p><div className="meter"><i style={{ width: p[4] }} /></div><button>View Details</button></div></article>)}</div></section></section>
      <section className="guest-two"><div className="guest-card soft"><h3>Recommended for You</h3>{[['Artisan Spice Collection', 'Based on your interest in Organic Punjab Saffron', img.spices], ['Raw Eucalyptus Honey', 'High-traceability score alternative to Himalayan', img.honey]].map((r) => <div className="recommend" key={r[0]}><img src={r[2]} alt="" /><div><strong>{r[0]}</strong><p>{r[1]}</p></div><Icon>add_circle</Icon></div>)}</div><div className="guest-card education-mini"><h3><Icon>school</Icon>Kiến thức Center</h3><p>Learn how we use Decentralized Identifiers and Verifiable Credentials to ensure produce integrity.</p>{['Seed Origin Verification', 'Growth Lifecycle Logging', 'Harvest & Logistics'].map((s, i) => <div className="timeline-row" key={s}><i className={`dot d${i}`} /><strong>{s}</strong><p>{i === 0 ? 'Digital fingerprinting of crop DNA and soil quality tests.' : i === 1 ? 'Real-time IoT data on water usage and pesticide levels.' : 'QR-code tagged batches tracked via cold-chain GPS.'}</p></div>)}<button>Explore the Truy xuất nguồn gốc Map</button></div></section>
    </main>
  </GuestShell>
}

function SearchPage() {
  return <GuestShell module="search" searchPlaceholder="Tìm nhanh..." compact><main className="guest-main narrow"><section className="search-hero"><h1>Khám phá chợ nông sản</h1><p>Truy xuất sản phẩm từ đất trồng đến kệ hàng bằng xác thực blockchain.</p><div className="search-panel"><label><Icon>search</Icon><input placeholder="Tìm theo mã lô, tên nông trại hoặc sản phẩm..." /></label><button>Tìm kết quả</button><div className="select-grid">{['Khu vực', 'Danh mục', 'Chứng nhận'].map((s) => <div key={s}><span>{s}</span><select><option>{s === 'Khu vực' ? 'Tất cả khu vực' : s === 'Danh mục' ? 'Tất cả danh mục' : 'Mọi chứng nhận'}</option></select></div>)}</div></div></section><div className="trend-row"><span>Xu hướng:</span>{['#PremiumArabica', '#Truy xuấtableSoy', '#Batch-00452X'].map((t) => <button key={t}>{t}</button>)}</div><div className="results-head"><h3>Kết quả tìm kiếm <span>48 kết quả</span></h3><div><Icon>grid_view</Icon><Icon>view_list</Icon></div></div><section className="search-results"><ProductResult title="Hạt Arabica cao nguyên" img={img.coffee} price="$12.50/kg" /><article className="farm-spotlight"><img src={img.terrace} alt="" /><div><span>Nhà sản xuất nổi bật</span><h4>Trang trại Thung Lũng Xanh</h4><p>Tiên phong nông nghiệp tái sinh tại Đồng bằng Mekong. Chuyên ngũ cốc không biến đổi gen với truy xuất on-chain 100%.</p><div className="stat-grid"><b>Cây trồng chính<br /><strong>Gạo thơm Jasmine</strong></b><b>Lô hàng<br /><strong>14 đang hoạt động</strong></b></div><button>Xem hồ sơ nông trại</button></div></article><article className="batch-lookup"><Icon>barcode_scanner</Icon><h4>Tra cứu lô tức thì</h4><p>Có mã truy xuất trên sản phẩm? Nhập vào đây để xem toàn bộ vòng đời sản phẩm.</p><label><input placeholder="e.g. BTC-9941-X" /><button><Icon>arrow_forward</Icon></button></label><span><Icon>verified_user</Icon>Nhật ký kiểm toán bất biến</span><span><Icon>local_shipping</Icon>Mốc vận chuyển</span></article><ProductResult title="Thùng cà chua giống bản địa" img={img.vegetables} price="$4.20/lb" /><ProductResult title="Củ nghệ hữu cơ" img={img.turmeric} price="$18.00/kg" /></section><div className="pager"><button disabled><Icon>chevron_left</Icon></button><b>1</b><button>2</button><button>3</button><span>...</span><button>12</button><button><Icon>chevron_right</Icon></button></div></main></GuestShell>
}
function ProductResult({ title, img: src, price }) { return <article className="result-card"><img src={src} alt="" /><div><small>Đã xác thực blockchain</small><h4>{title}<b>{price}</b></h4><p><Icon>location_on</Icon>Cao nguyên Đà Lạt, Việt Nam</p><button>Theo dõi lô <Icon>arrow_forward</Icon></button></div></article> }

function AnnouncementsPage() {
  const cards = ['Smart Contract Logic V2.4', 'Node Maintenance Schedule', 'New Cooperative Onboarding']
  return <GuestShell module="announcements" searchPlaceholder="Tìm tin tức, cập nhật hoặc báo cáo..." compact><main className="guest-main announcements"><header className="page-title"><div><h1>Thông báo mới nhất</h1><p>Cập nhật biến động thị trường, nâng cấp hệ thống và thông tin mùa vụ đã xác thực trên blockchain BICAP.</p></div><div><button><Icon>filter_list</Icon>Bộ lọc</button><button className="primary"><Icon>rss_feed</Icon>Đăng ký nhận tin</button></div></header><div className="topic-row">{['Tất cả tin', 'Hệ thống', 'Thị trường', 'Mùa vụ', 'Quy định'].map((t, i) => <button className={i === 0 ? 'active' : ''} key={t}>{t}</button>)}</div><section className="ann-grid-pro"><article className="ann-feature"><img src={img.greenhouse} alt="" /><div><span><Icon fill>verified</Icon> BLOCKCHAIN VERIFIED EVENT</span><h2>Q3 Grain Forecast: Sustainable Yield Projections</h2><p>Initial data from decentralized soil sensors indicate a 12% increase in nutrient retention across the Northern Corridor...</p><footer><small>Oct 24, 2023</small><a>Đọc báo cáo đầy đủ <Icon>arrow_forward</Icon></a></footer></div></article><article className="market-card"><Icon>trending_up</Icon><span>Cập nhật thị trường</span><h3>Chỉ số hàng hóa tăng</h3><p>Hợp đồng lúa mì hữu cơ tăng 4,2% sau chu kỳ xác minh thu hoạch mới nhất.</p><div className="meter"><i style={{ width: '75%' }} /></div></article>{cards.map((c) => <article className="ann-small" key={c}><span>Cập nhật</span><h4>{c}</h4><p>Ghi chú triển khai kỹ thuật và xác minh nền tảng cho hệ sinh thái BICAP.</p><small>2 giờ trước</small></article>)}<article className="trace-spotlight"><div><span><Icon>hub</Icon> Truy xuất nguồn gốc Tech Spotlight</span><h3>Transparent Supply Chains: How we use NFC tagging</h3><p>Every crate of organic produce is now fitted with NFC-enabled smart labels with a complete blockchain record.</p><button>Tìm hiểu thêm về truy xuất <Icon>open_in_new</Icon></button></div><img src={img.scan} alt="" /></article>{['Drought-Resistant Strains Released', 'Community Governance Vote Results'].map((n, i) => <article className="ann-row" key={n}><img src={i ? img.advisor : img.wheat} alt="" /><div><span>{i ? 'Governance' : 'Khoa học giống'}</span><h4>{n}</h4><p>Báo cáo đã xác thực hiện có trên cổng BICAP.</p></div></article>)}</section><section className="newsletter"><h2>Đừng bỏ lỡ cập nhật mùa vụ.</h2><p>Tham gia cùng hơn 12.000 chuyên gia nhận bản tin thị trường đã xác thực blockchain hằng tuần.</p><form><input placeholder="Nhập email của bạn" /><button>Đăng ký ngay</button></form></section></main><Footer /></GuestShell>
}

function EducationPage() {
  return <GuestShell module="education" searchPlaceholder="Tìm trong kho kiến thức..." compact><main className="guest-main education-page"><section className="edu-hero"><div><span>Trao quyền minh bạch</span><h1>Làm chủ <b>nông nghiệp truy xuất được</b></h1><p>Tìm hiểu cách hệ sinh thái blockchain bảo đảm mỗi nông sản đều có câu chuyện. Từ đất trồng đến kệ hàng, hiểu dấu vết số của thực phẩm.</p><button>Thử truy xuất ngay <Icon>arrow_forward</Icon></button><button className="ghost">Xem video <Icon>play_circle</Icon></button></div><aside><img src={img.scan} alt="" /><div><Icon fill>verified</Icon><p><strong>Blockchain xác nhận</strong><small>Cần tây hữu cơ đã xác thực #BRC-902</small></p></div></aside></section><section className="journey"><h2>Hành trình thực phẩm của bạn</h2><p>Mỗi bước được ghi vĩnh viễn trên sổ cái bất biến</p><div>{[['agriculture', '1. Cultivation'], ['qr_code_2', '2. Hash Generation'], ['local_shipping', '3. Logistics']].map((s, i) => <article className={i === 1 ? 'active' : ''} key={s[1]}><Icon>{s[0]}</Icon><h3>{s[1]}</h3><p>{i === 0 ? 'Soil health, pesticide usage, and seeding dates are logged by certified farmers.' : i === 1 ? 'A unique digital identity is minted for the batch, generating a secure QR code for tracking.' : 'Real-time transit data and temperature logs are updated via IoT sensors.'}</p></article>)}</div></section><section className="verify-guide"><div><h2>Cách xác minh tính xác thực</h2>{['Quét mã QR', 'Xem hộ chiếu số', 'Xác minh blockchain'].map((s, i) => <div className="step" key={s}><b>{i + 1}</b><p><strong>{s}</strong><span>{i === 0 ? 'Use your device camera to scan the Agro-Tech sticker.' : i === 1 ? 'View the comprehensive timeline of the product.' : 'Confirm the cryptographic hash matches the public ledger.'}</span></p></div>)}</div><aside className="phone-mock"><div><h4>Truy xuất Details</h4><section><p><Icon>inventory_2</Icon><strong>Organic Arabica</strong><small>ID: 4x992..a1</small></p><div className="timeline-row"><i className="dot" /><strong>Arrived at Store</strong><p>Oct 24, 2023 • 10:20 AM</p></div><div className="timeline-row"><i className="dot d2" /><strong>Quality Inspection</strong><p>Oct 22, 2023 • 08:15 AM</p></div></section><footer><small>Blockchain Hash</small><code>f7e346b9a2c1d8e5f03421b6d24a3e7c89f012</code></footer></div></aside></section><section className="faq"><div><h2>Câu hỏi thường gặp</h2><p>Can't find what you're looking for? Reach out to our support team.</p><button>Liên hệ hỗ trợ <Icon>open_in_new</Icon></button></div><div>{['Is the data truly immutable?', 'Do I need a crypto wallet to view traces?', 'What happens if a QR code is damaged?'].map((q) => <details key={q}><summary>{q}<Icon>expand_more</Icon></summary><p>Yes. Basic traceability data is accessible to consumers, while advanced proofs remain wallet-enabled.</p></details>)}</div></section><section className="final-cta"><Icon>hub</Icon><h2>Sẵn sàng trải nghiệm tương lai thực phẩm?</h2><p>Tham gia cùng hàng nghìn người tiêu dùng đang dùng BICAP để bảo đảm tính toàn vẹn của thực phẩm.</p><button>Thử truy xuất ngay</button></section></main><Footer /></GuestShell>
}

function Footer() { return <footer className="guest-footer"><span>© 2024 Agro-Tech Synergy. Đã đăng ký bản quyền.</span><nav><a>Chính sách bảo mật</a><a>Điều khoản dịch vụ</a><a>Trạng thái node</a></nav></footer> }

export function GuestMarketplacePage({ module = 'overview' }) {
  if (module === 'search') return <SearchPage />
  if (module === 'announcements') return <AnnouncementsPage />
  if (module === 'education') return <EducationPage />
  return <Bảng điều khiểnPage />
}
