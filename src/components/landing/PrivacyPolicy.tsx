import type { ReactNode } from "react";
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  Database,
  FileLock2,
  Handshake,
  Mail,
  PhoneCall,
  ShieldCheck,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";

type PrivacyPolicyProps = {
  brandName: string;
  email: string;
  phone: string;
  analyticsEnabled: boolean;
};

const rights = [
  "Biết và được thông báo về việc xử lý dữ liệu",
  "Yêu cầu xem, cập nhật hoặc sửa thông tin chưa chính xác",
  "Rút lại sự đồng ý hoặc phản đối việc tiếp tục liên hệ",
  "Yêu cầu hạn chế hoặc xóa dữ liệu khi phù hợp với quy định",
  "Khiếu nại và yêu cầu giải thích về cách dữ liệu được sử dụng",
  "Nhận phản hồi về yêu cầu liên quan đến dữ liệu cá nhân",
];

export function PrivacyPolicy({
  brandName,
  email,
  phone,
  analyticsEnabled,
}: PrivacyPolicyProps) {
  const policyNav: Array<readonly [string, string]> = [
    ["data", "Dữ liệu chúng tôi nhận"],
    ["purpose", "Mục đích xử lý"],
    ["sharing", "Chia sẻ dữ liệu"],
    ["retention", "Thời gian lưu trữ"],
    ["rights", "Quyền của bạn"],
  ];

  if (analyticsEnabled) {
    policyNav.push(["analytics", "Phân tích truy cập"]);
  }
  policyNav.push(["security", "Bảo vệ thông tin"]);

  return (
    <main className="privacyPage">
      <section className="privacyHero">
        <div className="container privacyHeroInner">
          <div className="privacyHeroCopy">
            <p className="eyebrow dark">Thông tin minh bạch</p>
            <h1>Chính sách bảo mật &amp; dữ liệu cá nhân</h1>
            <p className="privacyLead">
              {brandName} tôn trọng quyền riêng tư và chỉ xử lý thông tin cần
              thiết để phản hồi nhu cầu tư vấn bất động sản của bạn.
            </p>
            <div className="privacyMeta" aria-label="Thông tin chính sách">
              <span><ShieldCheck size={15} aria-hidden="true" /> Áp dụng cho website và biểu mẫu tư vấn</span>
            </div>
          </div>

          <div className="privacyTrustGrid" aria-label="Cam kết quyền riêng tư">
            <article>
              <span><FileLock2 size={20} aria-hidden="true" /></span>
              <strong>Đúng mục đích</strong>
              <p>Chỉ dùng dữ liệu để tư vấn, vận hành và bảo vệ website.</p>
            </article>
            <article>
              <span><Handshake size={20} aria-hidden="true" /></span>
              <strong>Không bán dữ liệu</strong>
              <p>Không kinh doanh thông tin cá nhân bạn đã cung cấp.</p>
            </article>
            <article>
              <span><UserRoundCheck size={20} aria-hidden="true" /></span>
              <strong>Bạn kiểm soát</strong>
              <p>Có thể yêu cầu xem, sửa, hạn chế hoặc xóa thông tin.</p>
            </article>
          </div>
        </div>
      </section>

      <div className="container privacyLayout">
        <aside className="privacyToc" aria-label="Mục lục chính sách">
          <span>Trong chính sách này</span>
          <nav>
            {policyNav.map(([href, label], index) => (
              <a href={`#${href}`} key={href}>
                <small>{String(index + 1).padStart(2, "0")}</small>
                {label}
              </a>
            ))}
          </nav>
          <p>
            Cần hỗ trợ nhanh? Liên hệ trực tiếp với đội ngũ phụ trách website.
          </p>
          <a className="privacyTocContact" href={`tel:${phone}`}>
            <PhoneCall size={16} aria-hidden="true" /> {phone}
          </a>
        </aside>

        <article className="privacyArticle">
          <section className="privacyIntro" aria-label="Tóm tắt chính sách">
            <ShieldCheck size={22} aria-hidden="true" />
            <p>
              Chính sách này mô tả cách website đang thu thập và sử dụng dữ
              liệu. Trong trường hợp pháp luật yêu cầu một thông báo hoặc sự
              đồng ý riêng, {brandName} sẽ thực hiện tại thời điểm phù hợp.
            </p>
          </section>

          <PolicySection
            id="data"
            number="01"
            icon={<Database size={21} aria-hidden="true" />}
            title="Dữ liệu chúng tôi nhận"
            summary="Thông tin chủ yếu do bạn chủ động cung cấp khi gửi yêu cầu tư vấn."
          >
            <ul className="privacyList">
              <li>Họ tên và số điện thoại liên hệ.</li>
              <li>Khu vực quan tâm, khoảng ngân sách và nội dung nhu cầu.</li>
              <li>Tin bất động sản mà bạn gửi yêu cầu tư vấn, nếu có.</li>
              <li>
                Trạng thái chăm sóc, ghi chú tư vấn và thời điểm gửi được đội
                ngũ quản trị cập nhật để theo dõi yêu cầu.
              </li>
            </ul>
          </PolicySection>

          <PolicySection
            id="purpose"
            number="02"
            icon={<CheckCircle2 size={21} aria-hidden="true" />}
            title="Mục đích và cơ sở xử lý"
            summary="Dữ liệu được xử lý trong phạm vi cần thiết cho yêu cầu của bạn."
          >
            <ul className="privacyList">
              <li>Liên hệ, xác minh nhu cầu và sắp xếp lịch tư vấn.</li>
              <li>Đề xuất sản phẩm phù hợp với khu vực và ngân sách.</li>
              <li>Quản lý lịch sử chăm sóc, phản hồi và chất lượng dịch vụ.</li>
              <li>Phòng chống spam, gian lận và bảo vệ an toàn website.</li>
            </ul>
            <p>
              Việc liên hệ tư vấn dựa trên sự đồng ý bạn thể hiện khi gửi biểu
              mẫu. Bạn có thể rút lại sự đồng ý bất cứ lúc nào qua thông tin
              liên hệ ở cuối trang.
            </p>
          </PolicySection>

          <PolicySection
            id="sharing"
            number="03"
            icon={<UsersRound size={21} aria-hidden="true" />}
            title="Bên có thể nhận dữ liệu"
            summary="Chúng tôi không bán dữ liệu cá nhân cho mục đích thương mại."
          >
            <p>
              Thông tin chỉ được truy cập bởi nhân sự phụ trách tư vấn, quản trị
              website và nhà cung cấp hạ tầng cần thiết để vận hành dịch vụ. Dữ
              liệu cũng có thể được cung cấp cho cơ quan có thẩm quyền khi có
              yêu cầu hợp pháp. Các bên liên quan chỉ được tiếp cận trong phạm
              vi công việc cần thiết.
            </p>
          </PolicySection>

          <PolicySection
            id="retention"
            number="04"
            icon={<Clock3 size={21} aria-hidden="true" />}
            title="Thời gian lưu trữ"
            summary="Dữ liệu không được lưu lâu hơn mức cần thiết cho mục đích đã nêu."
          >
            <p>
              Hồ sơ tư vấn được lưu trong thời gian xử lý yêu cầu, chăm sóc sau
              tư vấn và đáp ứng nghĩa vụ pháp lý liên quan. Chúng tôi định kỳ rà
              soát để xóa hoặc ẩn danh dữ liệu không còn cần thiết, trừ trường
              hợp phải tiếp tục lưu theo quy định hoặc để giải quyết tranh chấp.
            </p>
          </PolicySection>

          <PolicySection
            id="rights"
            number="05"
            icon={<UserRoundCheck size={21} aria-hidden="true" />}
            title="Quyền của bạn"
            summary="Bạn có quyền kiểm soát thông tin cá nhân đã cung cấp."
          >
            <div className="privacyRightsGrid">
              {rights.map((right) => (
                <p key={right}>
                  <CheckCircle2 size={16} aria-hidden="true" /> {right}
                </p>
              ))}
            </div>
            <p className="privacyNote">
              Chúng tôi có thể cần xác minh danh tính trước khi thực hiện yêu
              cầu nhằm tránh chỉnh sửa hoặc tiết lộ dữ liệu cho sai người.
            </p>
          </PolicySection>

          {analyticsEnabled && (
            <PolicySection
              id="analytics"
              number="06"
              icon={<BarChart3 size={21} aria-hidden="true" />}
              title="Phân tích truy cập"
              summary="Website sử dụng công cụ đo lường để hiểu hiệu quả nội dung."
            >
              <p>
                Google Analytics 4 có thể ghi nhận dữ liệu kỹ thuật và tương
                tác truy cập theo cấu hình hiện tại. Bạn có thể hạn chế cookie
                hoặc công cụ phân tích trong phần cài đặt trình duyệt.
              </p>
            </PolicySection>
          )}

          <PolicySection
            id="security"
            number={analyticsEnabled ? "07" : "06"}
            icon={<FileLock2 size={21} aria-hidden="true" />}
            title="Bảo vệ thông tin"
            summary="Chúng tôi áp dụng biện pháp kỹ thuật và quản trị phù hợp với quy mô dịch vụ."
          >
            <p>
              Quyền truy cập khu vực quản trị được giới hạn, dữ liệu truyền qua
              website được bảo vệ bằng kết nối mã hóa khi triển khai HTTPS và
              hệ thống được theo dõi để xử lý sự cố. Không phương thức nào an
              toàn tuyệt đối; nếu phát hiện rủi ro đáng kể, chúng tôi sẽ đánh
              giá và thông báo theo nghĩa vụ áp dụng.
            </p>
          </PolicySection>

          <section className="privacyContactCard" id="contact">
            <div>
              <p className="eyebrow dark">Yêu cầu về dữ liệu</p>
              <h2>Bạn muốn xem, sửa hoặc xóa thông tin?</h2>
              <p>
                Hãy cung cấp số điện thoại đã dùng khi gửi biểu mẫu để chúng
                tôi có thể xác minh và hỗ trợ chính xác.
              </p>
            </div>
            <div className="privacyContactActions">
              <a className="button" href={`tel:${phone}`}>
                <PhoneCall size={17} aria-hidden="true" /> Gọi {phone}
              </a>
              <a className="button secondary darkButton" href={`mailto:${email}`}>
                <Mail size={17} aria-hidden="true" /> {email}
              </a>
            </div>
            <small>
              Chính sách có thể được cập nhật khi dịch vụ hoặc quy định thay đổi.
            </small>
          </section>
        </article>
      </div>
    </main>
  );
}

function PolicySection({
  id,
  number,
  icon,
  title,
  summary,
  children,
}: {
  id: string;
  number: string;
  icon: ReactNode;
  title: string;
  summary: string;
  children: ReactNode;
}) {
  return (
    <section className="privacySection" id={id}>
      <header>
        <span className="privacySectionNumber">{number}</span>
        <span className="privacySectionIcon">{icon}</span>
        <div>
          <h2>{title}</h2>
          <p>{summary}</p>
        </div>
      </header>
      <div className="privacySectionBody">{children}</div>
    </section>
  );
}
