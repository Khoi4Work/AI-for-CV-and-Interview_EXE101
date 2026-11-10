import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  FileText,
  MessageSquareText,
  ScanSearch,
  BriefcaseBusiness,
  GraduationCap,
  ListChecks,
} from 'lucide-react';
import GuestHeader from '../components/layout/GuestHeader.jsx';
import { Header } from '../components/layout/PublicHeader.jsx';
import galleryService from '../features/cv/services/templateService.js';
import './home-experience.css';

const tools = [
  {
    title: 'Tạo CV',
    description: 'Chọn mẫu, thêm kinh nghiệm và chỉnh sửa nội dung trong một trình tạo.',
    href: '/builder',
    icon: FileText,
    number: '01',
  },
  {
    title: 'So khớp CV với JD',
    description: 'Đối chiếu hồ sơ với mô tả công việc để thấy phần đã khớp và còn thiếu.',
    href: '/cv-evaluation',
    icon: ScanSearch,
    number: '02',
  },
  {
    title: 'Luyện phỏng vấn',
    description: 'Chuẩn bị câu hỏi theo vị trí và thực hành trả lời với AI.',
    href: '/interview/job-selection',
    icon: MessageSquareText,
    number: '03',
  },
];

export default function HomeExperience({ isAuthenticated = false }) {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesError, setTemplatesError] = useState(false);
  const [marketGuideRef, marketGuideEntered] = useEnterOnce();
  const startPath = isAuthenticated ? '/builder' : '/register';

  useEffect(() => {
    let active = true;
    galleryService.getTemplates()
      .then((items) => {
        if (active) setTemplates(Array.isArray(items) ? items : []);
      })
      .catch((error) => {
        console.error('[HomeExperience] Error loading templates:', error);
        if (active) setTemplatesError(true);
      })
      .finally(() => {
        if (active) setTemplatesLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <div className="home-experience">
      {isAuthenticated ? <Header /> : <GuestHeader />}
      <main>
        <section className={`home-hero ${isAuthenticated ? 'home-hero--dashboard' : ''}`} aria-labelledby="home-title">
          <div className="home-hero__inner home-wrap">
            <div className="home-hero__copy">
              <p className="home-eyebrow"><span aria-hidden="true" />Từ giảng đường đến công việc đầu tiên</p>
              <h1 id="home-title">Lần đầu ứng tuyển? Bắt đầu từ JD.</h1>
              <p className="home-hero__lead">
                Dành cho sinh viên năm 3, năm 4 và người mới ra trường. Làm quen với yêu cầu công việc, chuẩn bị CV và tập phỏng vấn từng bước.
              </p>
              <div className="home-hero__actions">
                {isAuthenticated ? (
                  <>
                    <Link className="home-button home-button--light" to="/cv-evaluation">
                      Đọc JD & đối chiếu CV <ArrowRight size={17} aria-hidden="true" />
                    </Link>
                    <button className="home-button home-button--outline" onClick={() => navigate('/builder')}>Tạo CV</button>
                  </>
                ) : (
                  <>
                    <a className="home-button home-button--light" href="#hiring-journey">
                      Xem hành trình <ArrowRight size={17} aria-hidden="true" />
                    </a>
                    <button className="home-button home-button--outline" onClick={() => navigate(startPath)}>Tạo CV</button>
                  </>
                )}
              </div>
            </div>
            <div className="home-hero__visual">
              <HiringJourneyVisual />
            </div>
          </div>
        </section>

        <section className="home-tools-section home-wrap" aria-labelledby="tools-title">
          <div className="home-section-heading">
            <div>
              <p className="home-eyebrow">Bộ công cụ ứng tuyển</p>
              <h2 id="tools-title">Từ hồ sơ đến buổi phỏng vấn</h2>
            </div>
            <p>Đi thẳng đến việc bạn cần làm. Có thể bắt đầu từ bất kỳ công cụ nào.</p>
          </div>
          <div className="home-tool-grid">
            {tools.map((tool) => <ToolCard key={tool.href} tool={tool} />)}
          </div>
        </section>

        <section
          ref={marketGuideRef}
          className={`home-market-guide ${marketGuideEntered ? 'is-in-view' : ''}`}
          id="hiring-journey"
          aria-labelledby="market-guide-title"
        >
          <div className="home-wrap home-market-guide__inner">
            <div className="home-market-guide__copy">
              <p className="home-eyebrow">Đọc thị trường qua JD thật</p>
              <h2 id="market-guide-title">Hiểu nhà tuyển dụng đang tìm gì</h2>
              <p>Chọn một vị trí bạn quan tâm và xem yêu cầu trong tin tuyển dụng. So sánh chúng với CV của mình để biết nên làm nổi bật gì và cần học thêm điều gì.</p>
              <Link className="home-button home-button--dark" to="/cv-evaluation">
                Đối chiếu CV với JD <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
            <div className="home-market-guide__notes" aria-label="Ba điều cần xem trong một mô tả công việc">
              <div><span><BriefcaseBusiness size={19} aria-hidden="true" /></span><p><strong>Công việc hằng ngày</strong><small>Vị trí này giải quyết những việc gì?</small></p></div>
              <div><span><ListChecks size={19} aria-hidden="true" /></span><p><strong>Kỹ năng được yêu cầu</strong><small>Điều gì là cần thiết, điều gì là lợi thế?</small></p></div>
              <div><span><GraduationCap size={19} aria-hidden="true" /></span><p><strong>Kinh nghiệm có thể chứng minh</strong><small>Dự án, môn học hay hoạt động nào liên quan?</small></p></div>
            </div>
          </div>
        </section>

        <section className="home-templates" aria-labelledby="templates-title">
          <div className="home-wrap">
            <div className="home-section-heading home-section-heading--templates">
              <div>
                <p className="home-eyebrow">Thư viện mẫu</p>
                <h2 id="templates-title">Bắt đầu từ một mẫu CV</h2>
              </div>
              <Link className="home-text-link" to="/templates">Xem tất cả mẫu <ArrowUpRight size={17} /></Link>
            </div>

            {templatesLoading ? (
              <div className="home-template-grid" aria-label="Đang tải mẫu CV" aria-busy="true">
                {[0, 1, 2, 3].map((item) => <div className="home-template-skeleton" key={item} />)}
              </div>
            ) : templatesError ? (
              <div className="home-template-message" role="status">
                <p>Chưa tải được các mẫu CV.</p>
                <Link className="home-text-link" to="/templates">Mở thư viện mẫu <ArrowRight size={16} /></Link>
              </div>
            ) : templates.length ? (
              <div className="home-template-grid">
                {templates.slice(0, 4).map((template) => (
                  <Link className="home-template" key={template.id} to={`/template/${template.id}`}>
                    <span className="home-template__image">
                      <img src={template.previewImage} alt={`Mẫu CV ${template.name}`} loading="lazy" />
                    </span>
                    <span className="home-template__name">{template.name}</span>
                    <span className="home-template__action">Xem mẫu <ArrowUpRight size={15} /></span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="home-template-message" role="status">
                <p>Thư viện mẫu đang được cập nhật.</p>
                <Link className="home-text-link" to="/templates">Mở thư viện mẫu <ArrowRight size={16} /></Link>
              </div>
            )}
          </div>
        </section>

        {!isAuthenticated && (
          <section className="home-closing home-wrap" aria-labelledby="closing-title">
            <div className="home-closing__content">
              <div>
                <p className="home-eyebrow">Bước tiếp theo</p>
                <h2 id="closing-title">Bắt đầu chuẩn bị hồ sơ của bạn</h2>
                <p>Tạo CV mới hoặc chọn mẫu phù hợp với vị trí bạn đang nhắm đến.</p>
              </div>
              <button className="home-button home-button--dark" onClick={() => navigate(startPath)}>
                Tạo CV <ArrowRight size={17} aria-hidden="true" />
              </button>
            </div>
          </section>
        )}
      </main>
      <footer className="home-footer">
        <div className="home-wrap home-footer__inner">
          <Link className="home-footer__brand" to={isAuthenticated ? '/home' : '/'}>Smartfolio</Link>
          <span>CV, JD và luyện phỏng vấn.</span>
          <Link to="/templates">Mẫu CV</Link>
        </div>
      </footer>
    </div>
  );
}

function ToolCard({ tool }) {
  const Icon = tool.icon;
  return (
    <Link className="home-tool" to={tool.href}>
      <span className="home-tool__top">
        <span className="home-tool__icon"><Icon size={21} strokeWidth={1.8} aria-hidden="true" /></span>
        <span className="home-tool__number">{tool.number}</span>
      </span>
      <span className="home-tool__title">{tool.title}</span>
      <span className="home-tool__description">{tool.description}</span>
      <span className="home-tool__link">Mở công cụ <ArrowRight size={16} aria-hidden="true" /></span>
    </Link>
  );
}

function HiringJourneyVisual() {
  const [mapRef, mapEntered] = useEnterOnce();
  const stages = [
    { label: 'Chọn vị trí', detail: 'Bạn muốn làm công việc gì?', icon: BriefcaseBusiness, href: '/interview/job-selection' },
    { label: 'Đọc JD', detail: 'Tách yêu cầu và kỹ năng', icon: ListChecks, href: '/cv-evaluation' },
    { label: 'Chuẩn bị CV', detail: 'Đưa trải nghiệm vào hồ sơ', icon: FileText, href: '/builder' },
    { label: 'Luyện phỏng vấn', detail: 'Tập trả lời có dẫn chứng', icon: MessageSquareText, href: '/interview/job-selection' },
  ];

  return (
    <div ref={mapRef} className={`home-journey-map ${mapEntered ? 'is-in-view' : ''}`} aria-label="Sơ đồ làm quen với quy trình tuyển dụng">
      <div className="home-journey-map__head">
        <span className="home-journey-map__mark" aria-hidden="true"><span /><span /><span /></span>
        <span>Hành trình ứng tuyển</span>
        <span className="home-journey-map__live">Có thể bắt đầu ở nhiều chặng</span>
      </div>
      <div className="home-journey-map__body">
        <div className="home-journey-map__title">
          <span>Không cần biết hết ngay từ đầu</span>
          <h2>Mỗi bước giúp bước sau rõ hơn.</h2>
        </div>
        <div className="home-journey-map__route">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            return (
              <Link
                className={`home-journey-stage ${index === 1 ? 'is-highlighted' : ''}`}
                key={stage.label}
                to={stage.href}
                style={{ '--stage-index': index }}
              >
                <span className="home-journey-stage__node"><Icon size={18} strokeWidth={1.8} aria-hidden="true" /></span>
                <span className="home-journey-stage__step">0{index + 1}</span>
                <strong>{stage.label}</strong>
                <small>{stage.detail}</small>
              </Link>
            );
          })}
        </div>
        <div className="home-journey-map__foot">
          <span>CV</span><span>JD</span><span>PHỎNG VẤN</span>
          <span className="home-journey-map__foot-note">Một quy trình mới có thể học từng chặng.</span>
        </div>
      </div>
    </div>
  );
}

function useEnterOnce() {
  const ref = useRef(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    if (!('IntersectionObserver' in window)) {
      setEntered(true);
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setEntered(true);
      observer.disconnect();
    }, { threshold: 0.22 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, entered];
}
