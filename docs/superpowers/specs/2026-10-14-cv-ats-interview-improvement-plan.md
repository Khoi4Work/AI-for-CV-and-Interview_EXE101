# Spec: Kế hoạch nâng độ tin cậy CV/ATS và chất lượng Interview

**Ngày:** 14/10/2026
**Trạng thái:** Kế hoạch đề xuất để triển khai; chưa xác nhận hạng mục nào trong tài liệu này đã được thực hiện.
**Spec nghiệp vụ nền:** [Hoàn thiện luồng CV–JD, điểm đánh giá và minh chứng](2026-10-09-cv-evaluation-trust-and-evidence-design.md).
**Nguồn đầu vào:** `exe.pdf`, `Smartfolio_Competitor_User_ATS_Research_2026.docx`, phản hồi demo và rà soát workflow hiện tại.

## 1. Mục tiêu

Hoàn thiện các điểm còn yếu của hệ thống CV–JD và phỏng vấn thử dựa trên workflow đang có, không sao chép nguyên xi danh sách tính năng từ tài liệu tham khảo.

Kết quả cần đạt:

- Người dùng biết hệ thống đã đọc được gì từ CV trước khi dựa vào kết quả.
- Điểm đánh giá CV–JD có một nguồn duy nhất, giải thích bằng yêu cầu JD và bằng chứng trong CV.
- PDF do sản phẩm xuất có thể được parser của chính sản phẩm đọc lại với nội dung nhất quán.
- HR/Behavioral, Technical và STAR tạo trải nghiệm khác nhau theo đúng mục tiêu và cấp độ ứng viên.
- Không phát sinh điểm ATS gây nhầm lẫn, quota mới, migration hoặc cam kết “qua mọi ATS” không có căn cứ.

## 2. Đánh giá khả thi và tính phù hợp nghiệp vụ

| Hiện trạng cần xác nhận trong code | Bổ sung đề xuất | Tính khả thi | Giới hạn nghiệp vụ |
|---|---|---|---|
| CV được import rồi dùng cho tìm JD/đánh giá; người dùng khó biết phần nào bị parser bỏ sót | Hiển thị trạng thái đọc file và preview dữ liệu đã nhận diện trước đánh giá | Cao nếu parser đã trả extracted text/structured CV; trung bình nếu chỉ trả CV đã map và không giữ trạng thái lỗi | Đây là kiểm tra parser của sản phẩm, không phải điểm ATS hay chứng nhận khả năng qua ATS khác |
| Mapping có thể làm trường có dữ liệu thành rỗng hoặc hiển thị sai | Phân biệt không có dữ liệu nguồn với lỗi mapping; ẩn trường thực sự rỗng | Cao; cần lần theo raw extraction → DTO → mapper → template | Không điền placeholder hoặc dữ liệu mẫu vào CV người dùng |
| Có điểm đánh giá và bảng minh chứng; alias hoặc phản hồi có thể khiến kết quả khó kiểm chứng | Version hóa alias/rubric, giữ nguyên câu chữ nguồn và chỉ coi dữ liệu chưa thấy là `NOT_EVIDENCED` | Cao nếu analysis đã lưu snapshot/version; cần kiểm tra cache và lịch sử | Không biến “không thấy trong CV” thành “ứng viên không có năng lực”; không thêm điểm phụ |
| Đã có nhiều template và PDF renderer nhưng tính tương thích cần kiểm chứng | Thử một mẫu một cột qua editor → renderer → import lại bằng parser thật | Trung bình; phụ thuộc mức dùng chung model/template renderer | Mẫu dễ parse vẫn không thể bảo đảm tương thích mọi ATS |
| Hai lựa chọn Interview từng trả câu hỏi giống nhau; loại/cấp độ/context có thể chưa tác động đủ | Audit enum, session, question bank, prompt; bổ sung ma trận câu hỏi theo loại và Intern/Fresher | Cao cho audit và prompt/routing; trung bình cho cá nhân hóa/follow-up động | Chỉ dùng văn hóa công ty khi có nguồn; không gán cứng trọng số câu trả lời chưa calibration |

### Các hướng không đề xuất

- Không thêm một con số “ATS score” cạnh Điểm đánh giá CV–JD: người dùng đã từng nhầm điểm liên quan với điểm đánh giá, nên một điểm tổng mới sẽ làm vấn đề khó hiểu hơn.
- Không tuyên bố “CV đạt ATS” chỉ từ JSON hoặc nội dung đã parse; đánh giá đó không phản ánh đầy đủ parser của từng nhà tuyển dụng.
- Không thay toàn bộ template JSX bằng một PDF renderer khác trong kế hoạch này. Tái sử dụng model, field editor và renderer hiện có; chỉ làm pilot một template trước.
- Không tạo bảng DB mới chỉ để chứa một số alias hoặc cảnh báo parse khi có thể dùng cấu hình có version/metadata hiện hữu.
- Không bật câu hỏi văn hóa riêng của công ty bằng dữ liệu suy đoán hoặc preset chưa xác minh.

## 3. Quy tắc sản phẩm cần giữ

1. Người dùng import CV → xác minh dữ liệu đã đọc → tìm/chọn JD → bấm bắt đầu đánh giá → xem một điểm đánh giá cùng minh chứng. Import không tự chấm.
2. Kết quả history đọc lại đúng analysis/snapshot đã lưu; không gọi AI để chấm lại khi mở feedback.
3. CV/JD sửa đổi tạo input/version mới; không sửa ngược kết quả lịch sử.
4. Yêu cầu bắt buộc/ưu tiên lấy từ JD và metadata chuẩn hóa có thật; không áp một ngưỡng lọc tùy ý.
5. Quota hiện tại giữ nguyên nghiệp vụ; import, lưu CV, xem minh chứng hoặc tối ưu CV không bị tính nhầm sang quota phân tích.
6. Loại Interview phải thống nhất đúng ba lựa chọn ở UI: `HR/BEHAVIORAL`, `TECHNICAL`, `STAR`.

## 4. Kế hoạch triển khai theo pha

### Pha A — Audit hiện trạng và tạo baseline

**Mục tiêu:** xác định đúng lỗi nằm ở parser, mapping, presentation, scoring hay question/session routing.

**Công việc:**

1. Truy vết import CV từ file gốc qua parser, schema extraction, mapper, DTO, snapshot, FE editor/template, PDF renderer và API history.
2. Ghi nhận parser đang dùng cho PDF/DOC/DOCX, trạng thái không đọc được/đọc một phần, giới hạn nội dung và cơ chế bỏ field.
3. Đối chiếu điểm liên quan tìm JD, Điểm đánh giá CV–JD, bảng minh chứng, quota và lịch sử; xác nhận chỉ analysis chính thức cấp điểm đánh giá.
4. Truy vết loại Interview/cấp độ/ngôn ngữ/CV/JD từ UI đến request, session, question bank, prompt và feedback. Reproduce trường hợp HR/STAR giống câu hỏi.
5. Chuẩn bị fixture ẩn danh: CV 1 cột, nhiều cột, PDF renderer, DOCX, Intern/Fresher, các trường rỗng và các kỹ năng dễ nhầm alias.

**Đầu ra:** sơ đồ data flow, danh sách mapping lỗi, kết quả tái hiện Interview, baseline test. Không bắt đầu sửa UX trước khi xác định dữ liệu nguồn nào thực sự tồn tại.

**Gate A:** phân loại được từng lỗi là nguồn không có dữ liệu, parser bỏ sót, mapper sai, UI ẩn/hiện sai hay model generation.

### Pha B — Minh bạch import và kiểm tra dữ liệu CV

**Mục tiêu:** giúp người dùng thấy nội dung thực tế sẽ đi vào tìm JD/đánh giá.

**Công việc:**

1. Chuẩn hóa kết quả parse: `READABLE`, `PARTIAL`, `NO_TEXT`, `UNSUPPORTED` hoặc trạng thái tương đương convention hiện có; UI dùng thông báo thân thiện, log giữ mã lỗi kỹ thuật.
2. Thêm bước preview các thông tin CV đã nhận diện trước khi đánh giá; nhóm theo section và ẩn trường null/rỗng.
3. Giữ distinction giữa “CV không có thông tin này” và “raw extraction có nhưng mapper không đưa vào editor”. Nếu có dữ liệu nguồn mà FE không nhận, sửa mapping; không chữa bằng hardcode theo một response.
4. Khi nội dung không đủ đọc, cho phép đổi file/thử lại và không cho chạy đánh giá với đầu vào rỗng hoặc lỗi nghiêm trọng.
5. Cho người dùng điều chỉnh dữ liệu import bằng editor hiện tại; lưu thành CV/snapshot thật theo workflow hiện có. Không sửa analysis lịch sử.
6. Ưu tiên field/response đã có. Chỉ bổ sung parse status/warnings vào DTO nếu audit xác nhận FE chưa nhận được thông tin tương đương; không tạo bảng mới.

**Nghiệm thu:** người dùng xem được đúng nội dung sẽ dùng để chấm; dữ liệu rỗng bị ẩn; parser lỗi không sinh điểm giả; mapping có test cho các shape JSON hợp lệ chứ không phụ thuộc một response mẫu.

### Pha C — Đối chiếu CV–JD và giải thích điểm

**Mục tiêu:** kết quả nhất quán, dễ kiểm chứng, không khiến người dùng nhầm liên quan với đánh giá.

**Công việc:**

1. Xác nhận kết quả màn hình chính, chi tiết minh chứng và history lấy cùng analysis ID, score, snapshot và rubric version.
2. Hiển thị riêng mức bắt buộc/ưu tiên của từng yêu cầu JD dựa trên metadata đã chuẩn hóa; ưu tiên thiếu minh chứng không bị trình bày như tiêu chí bắt buộc.
3. Chốt trạng thái cho từng yêu cầu: `MET`, `PARTIAL`, `NOT_EVIDENCED`, `NOT_APPLICABLE`, `UNCERTAIN`; không diễn giải thiếu trích đoạn thành thiếu năng lực.
4. Rà soát alias kỹ năng bằng dữ liệu có version. Kiểm thử alias đúng và cặp dễ nhầm; alias chỉ mở rộng khả năng tìm evidence, không thay câu trích CV/JD hoặc tự tạo kỹ năng.
5. Kiểm tra tính toán đóng góp độc lập, rubric/version trong snapshot và cache key. Đổi rubric/taxonomy ảnh hưởng kết quả phải tạo analysis mới, giữ nguyên lịch sử cũ.
6. Giữ một Điểm đánh giá CV–JD; không thêm điểm ATS, điểm tin cậy hay score parser.

**Nghiệm thu:** score và breakdown khớp; evidence có thật trong snapshot; mở lại không chấm AI lại; cùng analysis không đổi; CV/JD mới không dùng nhầm cache.

### Pha D — Pilot template và PDF round-trip

**Mục tiêu:** kiểm tra xuất PDF và khả năng đọc lại trên parser của chính hệ thống mà không thay kiến trúc editor.

**Công việc:**

1. Chọn một template hiện tại, rà mapping tất cả section và field trước khi đổi bố cục.
2. Làm biến thể một cột với thứ tự section rõ, tiêu đề phổ biến, thông tin cốt lõi trong phần nội dung chính, tránh bảng/text box/hình ảnh cho dữ liệu cần parser đọc.
3. Tái sử dụng CV model, quyền `minimum_plan`, editor hiện tại và PDF renderer dùng chung. Không duy trì hai bộ mapping độc lập nếu có thể dùng adapter chung.
4. Round-trip test: tạo/sửa CV → preview → xuất PDF → import lại bằng parser sản phẩm → so sánh section, email, link, dấu tiếng Việt và thứ tự đọc.
5. So sánh PDF với preview ở nhiều độ dài nội dung và dữ liệu trống; không để trường rỗng tạo khoảng trắng lớn hoặc trường dài bị cắt mà không nhận ra.
6. Ghi chú trung tính cho người dùng rằng bố cục đơn giản có thể thuận lợi cho một số parser, không cam kết tương thích toàn bộ hệ thống ATS.

**Nghiệm thu:** PDF có thể đọc lại khi có text; nội dung và thứ tự không mất; editor/export không lệch; template khác và quota không bị ảnh hưởng.

### Pha E — Phân biệt loại Interview và phù hợp Intern/Fresher

**Mục tiêu:** câu hỏi, đánh giá và phản hồi bám theo loại/cấp độ thực sự người dùng chọn.

**Công việc:**

1. Đối chiếu chính xác enum UI/API/backend/question bank/prompt là `HR/BEHAVIORAL`, `TECHNICAL`, `STAR`; loại trừ session/question reuse do state cũ hoặc khóa cache thiếu type.
2. Định nghĩa ma trận mục tiêu:
   - `HR/BEHAVIORAL`: động lực, giao tiếp, hợp tác, xử lý tình huống và kỳ vọng.
   - `TECHNICAL`: kỹ năng/yêu cầu thực tế từ JD, độ sâu tăng theo cấp độ.
   - `STAR`: một tình huống cụ thể, vai trò cá nhân, hành động và kết quả; follow-up làm rõ phần thiếu.
3. Với Intern/Fresher, cho phép minh họa bằng dự án môn học, dự án cá nhân, hoạt động nhóm và cách tự học; không mặc định kinh nghiệm full-time.
4. Rà câu hỏi trùng và fallback của ngân hàng. Câu chào/mở đầu có thể chung; câu hỏi đánh giá cốt lõi phải phù hợp loại. Lưu provenance bank/generated và type/context ở session để có thể truy nguyên.
5. Đưa thông tin JD và company context vào generation/retrieval khi có. Chỉ dùng văn hóa/quy trình công ty có nguồn xác minh; nếu không, hỏi môi trường làm việc chung và ghi rõ mô phỏng.
6. Mô tả rubric feedback bằng hành vi quan sát được, mức đạt và ví dụ. Không đặt trọng số cụ thể như Action 60% nếu chưa có hiệu chỉnh bằng dữ liệu.
7. Giữ follow-up động ngoài scope phát hành đầu nếu session state, giới hạn lượt và độ trễ chưa được chứng minh.

**Nghiệm thu:** đổi type đổi nội dung cốt lõi; đổi level thay độ sâu; không reuse nhầm phiên; không bịa văn hóa công ty; feedback có căn cứ thay vì chỉ nhận xét chung.

### Pha F — Pilot người dùng và quyết định phát hành

**Mục tiêu:** xác nhận thay đổi giải quyết vấn đề thật trước khi mở rộng dữ liệu hoặc cá nhân hóa.

**Công việc:**

1. Đánh giá tối thiểu 12 cặp CV/JD IT ẩn danh (BA, Backend, Frontend, QA), có ca role explicit/missing, CV thiếu evidence, JD ít yêu cầu và PDF round-trip.
2. Người rà soát nghiệp vụ kiểm tra role match, mức bắt buộc, evidence và giải thích. Không dùng output của một LLM khác làm ground truth duy nhất.
3. Usability test các tác vụ: import/xem trước, chọn JD, hiểu điểm, đọc minh chứng, chỉnh CV, xuất/nhập lại PDF và làm thử cả ba loại Interview.
4. Theo dõi baseline và thay đổi của: tỷ lệ người phải sửa thông tin import, lỗi mapping, false missing skill do alias, PDF không parse được, người nhầm điểm liên quan/điểm đánh giá, feedback hữu ích và mức phân biệt câu hỏi theo type.
5. Chốt go/no-go sau khi có baseline và review. Không tự đặt phần trăm mục tiêu không có dữ liệu; sai dữ liệu, sai score, đánh giá nhầm role hoặc sai type Interview là blocker phát hành.
6. Ghi model/provider, rubric/taxonomy version, latency, model-call count và quota trong báo cáo nội bộ; không đưa số kỹ thuật thành điểm người dùng.

**Gate F:** lỗi nghiêm trọng về mapping/evidence/score/type đã xử lý; có báo cáo pilot với baseline và quyết định phát hành; quota hiện tại không bị đổi.

## 5. Phụ thuộc, DB và rollback

- Thứ tự chính: `A → B → C → D → F`; audit Interview bắt đầu trong A, triển khai Interview ở E sau khi enum/session contract đã rõ; F kiểm tra cả hai nhánh.
- Không chạy SQL/migration hoặc ghi production trong khi thực hiện kế hoạch. Người dùng tự quyết định và áp dụng SQL DB.
- Không tạo bảng mới nếu DTO, JSONB hoặc metadata version hiện hữu đáp ứng; nếu thật sự thiếu schema, trình bày migration nhỏ, mục đích và cách rollback trước khi áp dụng.
- Tách seed data khỏi migration; không gộp dữ liệu mẫu vào schema migration.
- Sau mỗi pha, chạy tests liên quan, build/lint FE nếu có thay đổi FE và kiểm thử browser cho luồng tương tác; ghi kết quả thật, không đánh dấu pass chỉ dựa trên compile.
- Nếu parser, renderer, scoring hay session mới gây regression, tắt đường mới qua feature/readiness flag phù hợp, giữ khả năng đọc analysis/session đã hoàn tất và khôi phục đường trước đó. Không xóa/rewrite lịch sử để rollback.

## 6. Nguồn tham khảo và giới hạn áp dụng

- [Greenhouse — Unsuccessful resume parse](https://support.greenhouse.io/hc/en-us/articles/200989175-Unsuccessful-resume-parse): một số bố cục như cột/bảng/header-footer/text box/hình ảnh có thể khiến parser bỏ sót nội dung. Dùng để xây fixture kiểm tra, không coi là quy tắc đúng cho mọi ATS.
- [Indeed — ATS resume guidance](https://www.indeed.com/career-advice/resumes-cover-letters/ats-resume): định dạng dễ đọc có thể giúp một số hệ thống; không phải bảo đảm tương thích phổ quát.
- [OPM — Structured Interviews](https://www.opm.gov/policy-data-oversight/assessment-and-selection/other-assessment-methods/structured-interviews/): câu hỏi gắn năng lực công việc và thang đánh giá nhất quán là cơ sở tham khảo cho cấu trúc câu hỏi/rubric; không suy ra trọng số cố định cho sản phẩm.
