import { Outlet } from 'react-router-dom'
import { AnnouncementBanner } from '../components/AnnouncementBanner.jsx'

export function AuthLayout() {

  return (
    <div className="uth-auth-layout">

      <main className="uth-auth-main">
        <div className="uth-auth-shell uth-auth-shell-reversed">
          <aside className="uth-auth-aside" aria-label="Giới thiệu hệ thống">
            <div className="uth-auth-aside-card uth-auth-aside-welcome">
              <div className="uth-auth-welcome">Chào mừng đến với <span className="uth-auth-welcome-strong">BICAP</span></div>
              <div className="uth-auth-benefits" aria-hidden="true">
                <div className="uth-auth-benefit" style={{ animationDelay: '0s' }}>
                  Truy xuất nguồn gốc nông sản sạch bằng <strong>Blockchain</strong>
                </div>
                <div className="uth-auth-benefit" style={{ animationDelay: '3s' }}>
                  Giám sát nhiệt độ, độ ẩm, pH với <strong>IoT</strong> và cảnh báo ngưỡng
                </div>
                <div className="uth-auth-benefit" style={{ animationDelay: '6s' }}>
                  Tạo <strong>QR Code</strong> cho từng lô hàng, minh bạch từ nông trại đến bàn ăn
                </div>
                <div className="uth-auth-benefit" style={{ animationDelay: '9s' }}>
                  Kết nối <strong>Farm</strong> với <strong>Retailer</strong> và theo dõi vận chuyển end to end
                </div>
              </div>
            </div>
          </aside>

          <section className="uth-auth-panel">
            <Outlet />
          </section>
        </div>
      </main>

      <AnnouncementBanner />
    </div>
  )
}
