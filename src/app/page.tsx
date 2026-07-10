const properties = [
  {
    title: 'Đất nền Quảng Xương',
    location: 'Quảng Xương, Thanh Hóa',
    area: '120 m²',
    price: '1,35 tỷ',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=85',
    tag: 'Nổi bật',
  },
  {
    title: 'Nhà phố trung tâm',
    location: 'TP. Thanh Hóa',
    area: '86 m²',
    price: '3,2 tỷ',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=85',
    tag: 'Mới đăng',
  },
  {
    title: 'Đất đầu tư ven biển',
    location: 'Sầm Sơn, Thanh Hóa',
    area: '150 m²',
    price: '2,1 tỷ',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85',
    tag: 'Tiềm năng',
  },
];

const phone = '0912345678';

export default function Home() {
  return (
    <main>
      <header className="header container">
        <a className="brand" href="#top" aria-label="Thanh Hóa Land">
          <span className="brandMark">TH</span>
          <span>Thanh Hóa <b>Land</b></span>
        </a>
        <nav>
          <a href="#san-pham">Sản phẩm</a>
          <a href="#gioi-thieu">Giới thiệu</a>
          <a href="#lien-he">Liên hệ</a>
        </nav>
        <a className="button small" href={`tel:${phone}`}>Gọi tư vấn</a>
      </header>

      <section id="top" className="hero">
        <div className="heroOverlay" />
        <div className="container heroContent">
          <span className="eyebrow">Bất động sản Thanh Hóa</span>
          <h1>Tìm đúng vị trí.<br />Nắm trọn cơ hội.</h1>
          <p>Nhà đất chọn lọc, thông tin rõ ràng và đồng hành xuyên suốt quá trình giao dịch.</p>
          <div className="heroActions">
            <a className="button" href="#san-pham">Xem bất động sản</a>
            <a className="button secondary" href={`https://zalo.me/${phone}`}>Nhắn Zalo</a>
          </div>
          <div className="stats">
            <div><strong>100+</strong><span>Sản phẩm chọn lọc</span></div>
            <div><strong>5 năm</strong><span>Kinh nghiệm địa phương</span></div>
            <div><strong>1–1</strong><span>Tư vấn tận tâm</span></div>
          </div>
        </div>
      </section>

      <section id="san-pham" className="section container">
        <div className="sectionHeading">
          <div><span className="eyebrow dark">Danh mục nổi bật</span><h2>Bất động sản mới nhất</h2></div>
          <p>Các sản phẩm có pháp lý và thông tin được kiểm tra trước khi giới thiệu.</p>
        </div>
        <div className="grid">
          {properties.map((item) => (
            <article className="card" key={item.title}>
              <div className="cardImage" style={{ backgroundImage: `url(${item.image})` }}>
                <span>{item.tag}</span>
              </div>
              <div className="cardBody">
                <p className="location">⌖ {item.location}</p>
                <h3>{item.title}</h3>
                <div className="propertyMeta"><span>Diện tích: <b>{item.area}</b></span><span className="price">{item.price}</span></div>
                <a href={`tel:${phone}`}>Nhận thông tin chi tiết →</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="gioi-thieu" className="about">
        <div className="container aboutGrid">
          <div className="aboutImage" />
          <div className="aboutContent">
            <span className="eyebrow dark">Về Thanh Hóa Land</span>
            <h2>Hiểu địa phương, tư vấn đúng nhu cầu</h2>
            <p>Chúng tôi tập trung vào các sản phẩm nhà đất tại Thanh Hóa, ưu tiên tính minh bạch và giá trị thực tế cho người mua.</p>
            <div className="benefits">
              <div><b>01</b><span><strong>Sản phẩm chọn lọc</strong>Kiểm tra thông tin trước khi giới thiệu.</span></div>
              <div><b>02</b><span><strong>Tư vấn rõ ràng</strong>Không gây áp lực, không thông tin mập mờ.</span></div>
              <div><b>03</b><span><strong>Hỗ trợ giao dịch</strong>Đồng hành từ xem đất đến hoàn tất thủ tục.</span></div>
            </div>
          </div>
        </div>
      </section>

      <section id="lien-he" className="contact section">
        <div className="container contactBox">
          <div>
            <span className="eyebrow">Tư vấn miễn phí</span>
            <h2>Bạn đang tìm nhà đất tại Thanh Hóa?</h2>
            <p>Liên hệ để nhận danh sách sản phẩm phù hợp với khu vực và ngân sách của bạn.</p>
          </div>
          <div className="contactActions">
            <a className="button light" href={`tel:${phone}`}>☎ {phone}</a>
            <a className="button outline" href={`https://zalo.me/${phone}`}>Chat Zalo</a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footerGrid">
          <div><div className="brand lightBrand"><span className="brandMark">TH</span><span>Thanh Hóa <b>Land</b></span></div><p>Nhà đất minh bạch. Đầu tư vững vàng.</p></div>
          <div><b>Liên hệ</b><p>Hotline: {phone}<br />Thanh Hóa, Việt Nam</p></div>
          <div><b>Điều hướng</b><p><a href="#san-pham">Sản phẩm</a><br /><a href="#gioi-thieu">Giới thiệu</a></p></div>
        </div>
        <div className="container copyright">© 2026 Thanh Hóa Land. All rights reserved.</div>
      </footer>
      <a className="floatingCall" href={`tel:${phone}`} aria-label="Gọi tư vấn">☎</a>
    </main>
  );
}
