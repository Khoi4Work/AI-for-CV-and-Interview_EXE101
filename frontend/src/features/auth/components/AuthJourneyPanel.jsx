import { BriefcaseBusiness, FileText, MessageSquareText } from 'lucide-react';

const stages = [
  { label: 'Đọc JD', detail: 'Hiểu yêu cầu vị trí', icon: BriefcaseBusiness },
  { label: 'Chuẩn bị CV', detail: 'Chọn điều cần làm nổi bật', icon: FileText },
  { label: 'Luyện phỏng vấn', detail: 'Tập nói về trải nghiệm', icon: MessageSquareText },
];

export default function AuthJourneyPanel({ mode = 'login' }) {
  return (
    <section className="auth-story" aria-labelledby="auth-story-title">
      <div className="auth-story__orbit auth-story__orbit--one" aria-hidden="true" />
      <div className="auth-story__orbit auth-story__orbit--two" aria-hidden="true" />
      <p className="auth-story__eyebrow">Smartfolio · Hành trình ứng tuyển</p>
      <h1 id="auth-story-title">
        {mode === 'register' ? 'Bắt đầu tìm hiểu con đường nghề nghiệp.' : 'Tiếp tục hành trình ứng tuyển của bạn.'}
      </h1>
      <p className="auth-story__description">
        Từng bước làm quen với yêu cầu công việc, chuẩn bị hồ sơ và trình bày kinh nghiệm của mình.
      </p>

      <div className="auth-story__route" aria-label="Các bước chuẩn bị ứng tuyển">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          return (
            <div className="auth-story__step" key={stage.label} style={{ '--auth-step': index }}>
              <span className="auth-story__step-icon"><Icon size={17} aria-hidden="true" /></span>
              <span className="auth-story__step-copy">
                <strong>{stage.label}</strong>
                <small>{stage.detail}</small>
              </span>
            </div>
          );
        })}
      </div>
      <span className="auth-story__note">Không cần biết hết ngay từ đầu.</span>
    </section>
  );
}
