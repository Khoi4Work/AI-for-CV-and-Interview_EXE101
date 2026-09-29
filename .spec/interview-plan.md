# Kế hoạch hoàn thiện luồng Interview (BE)

## 1. Mục tiêu và phạm vi

- Hoàn thiện luồng Interview ở BE; FE chỉ dùng để đối chiếu các lựa chọn và luồng mock hiện có.
- Giữ Interview là module độc lập với CV, Gallery và Payment. Module Interview gọi service module khác qua service/API nội bộ theo kiến trúc hiện tại; không truy cập thẳng repository của module khác.
- Payment, thanh toán và thay đổi cách cấp subscription nằm ngoài phạm vi. Tuy nhiên, luồng Interview phải đọc quyền lợi gói hiện có để áp dụng giới hạn.
- Không triển khai ngay phỏng vấn thích ứng. Trước tiên cần một luồng nền ổn định, hoàn thiện/test được; khả năng thích ứng phải có cờ bật/tắt do FE điều khiển và chỉ bật sau khi kiểm chứng.

## 2. Quyết định nghiệp vụ đã thống nhất

### Quyền lợi gói

- Thời lượng là giới hạn tối đa của **mỗi buổi**, không phải số phút quota tiêu hao. Mốc dự kiến: Free 5 phút, Middle 10 phút, Enhance 15 phút.
- Không trừ `UserUsageQuota.remainingIntMin` theo thời lượng phiên.
- Theo phương án B, chỉ gói Middle và Enhance được nhận feedback sau buổi; Free không có feedback.
- Độ chi tiết feedback tăng theo bậc gói: Middle nhận đánh giá mức cơ bản/tiêu chuẩn; Enhance nhận đánh giá chi tiết hơn. Nội dung khác biệt cụ thể phải được định nghĩa trong DTO/prompt và response, không chỉ khác câu mô tả trên UI.
- Đối chiếu entitlement với `InterviewBenefit` (hiện có `maxDurationMin`, `allowDeepFeedbk`, `allowCompCulture`, `allowRecording`). Xác định mapping gói thực tế sang Free/Middle/Enhance từ dữ liệu Payment đang có; không hard-code theo tên hiển thị nếu service ID là nguồn quyền lợi.

### Loại interview

FE hiện cho chọn ba loại và BE có enum tương ứng:

- `HR`: văn hóa, kỹ năng mềm, mục tiêu nghề nghiệp.
- `TECHNICAL`: kiến thức chuyên môn, giải thuật, system design.
- `BEHAVIORAL`: tình huống hành vi, ví dụ theo STAR.

Loại interview là tiêu chí bắt buộc khi lọc câu hỏi, tạo session và tạo feedback. Không gộp ba loại thành một bộ câu hỏi chung. Bổ sung/đối chiếu loại này trong metadata câu hỏi và DB spec.

## 3. Metadata câu hỏi trong DB

Metadata là cột/trường phân loại câu hỏi đã lưu trong DB, không phải cờ xác nhận câu hỏi có tồn tại trong DB.

Đề xuất trường cần có để hỗ trợ đúng loại interview, follow-up và cá nhân hóa:

- `interview_type`: `HR`, `TECHNICAL`, `BEHAVIORAL`.
- `experience_level`: cấp độ ứng viên; thống nhất enum với FE/API/DB (FE hiện có Intern/Fresher/Junior; API spec có tập khác).
- `category` hoặc `competency`: chủ đề/năng lực như Java, giao tiếp, giải quyết vấn đề.
- `question_role`: câu hỏi chính hay câu hỏi follow-up.
- `parent_question_id` (nullable): liên kết follow-up với câu hỏi chính/nhóm câu hỏi mà nó đào sâu; dùng nếu quan hệ này phù hợp với mô hình ngân hàng câu hỏi.
- `context_type`: câu hỏi chung, theo JD, theo CV hoặc kết hợp.
- `difficulty` chỉ thêm nếu cần độc lập với `experience_level`; không mặc định hai khái niệm là một.

Trước khi chốt schema, kiểm tra xem metadata có thể lựa chọn follow-up theo câu hỏi vừa hỏi, loại interview, cấp độ, competency và ngữ cảnh CV/JD hay không. Nếu chưa, bổ sung quan hệ/tag phù hợp. Mục tiêu là chọn được câu hỏi follow-up có sẵn và cá nhân hóa bộ câu hỏi; không tạo cột kiểu “có trong DB”. Confidence ratio để giai đoạn sau.

Ngân hàng câu hỏi DB là nguồn chuẩn. RAG (nếu triển khai) chỉ hỗ trợ tìm các câu hỏi phù hợp. Nếu thiếu câu hỏi, AI có thể tạo câu hỏi để bổ sung vào ngân hàng sau bước kiểm tra/lưu; không để model tự do sinh câu hỏi mới không lưu trữ cho từng lượt trong luồng nền.

## 4. Luồng nền trước khi bật adaptive

1. FE gửi cấu hình session: loại interview, cấp độ, ngôn ngữ, JD/CV nếu có, thời lượng được phép và cờ `adaptiveMode`.
2. BE xác thực quyền lợi từ nguồn entitlement hiện có; không tin duration/tier do FE tự quyết định. `adaptiveMode` chỉ cho phép chọn luồng đã triển khai, không bỏ qua quyền lợi.
3. Nếu thiếu JD hoặc CV, dùng nội dung có sẵn; nếu thiếu cả hai, lọc câu hỏi chung. Luôn áp dụng `interview_type` và cấp độ.
4. Luồng mặc định (adaptive tắt) chọn một bộ câu hỏi hữu hạn đã có trong DB, lưu snapshot/thứ tự câu hỏi vào session để kết quả không đổi khi ngân hàng được cập nhật.
5. BE nhận câu trả lời và transcript/voice theo API đã thống nhất; xử lý voice ở BE, không để FE gọi trực tiếp nhà cung cấp voice.
6. Kết thúc session khi hết giới hạn thời lượng hoặc người dùng kết thúc. Không tính thời lượng buổi vào quota phút.
7. Áp dụng quyền feedback: Free không được tạo/lấy feedback; Middle nhận mức tiêu chuẩn; Enhance nhận mức chi tiết. Kiểm tra quyền ở BE cho cả endpoint tạo và đọc feedback.

## 5. Adaptive mode: thiết kế, cờ và điều kiện bật

- FE có thể gửi `adaptiveMode=true/false`; mặc định `false` cho tới khi BE hoàn thiện và các kiểm thử đạt.
- Khi `false`, dùng luồng nền cố định ở mục 4.
- Khi `true`, BE đánh giá câu trả lời để chọn một follow-up đã lưu trong DB dựa trên tính liên quan, bằng chứng/chi tiết, loại interview, cấp độ và competency. Chưa dùng confidence ratio hoặc suy luận trạng thái tâm lý.
- Follow-up thay thế một câu hỏi chính trong số lượt dự kiến, không làm số câu tăng không giới hạn. Không mở lượt hỏi mới khi gần/hết thời lượng; cho người dùng hoàn thành câu trả lời hiện tại rồi kết thúc.
- Nếu không tìm được follow-up phù hợp, tiếp tục câu hỏi chính kế tiếp. Có fallback để adaptive lỗi không làm mất session.
- Tách đánh giá phục vụ điều hướng câu hỏi khỏi feedback cuối buổi theo gói; việc adaptive không tự cấp quyền feedback cho Free.
- Chỉ bật trải nghiệm adaptive sau khi hoàn tất test cho chọn câu hỏi, timeout, fallback, từng loại interview, các mức gói và dữ liệu thiếu JD/CV.

## 6. API, persistence và module cần hoàn thiện

Đối chiếu `.spec/Api_Specification.md` mục 9 với BE hiện tại và cập nhật contract trước khi code:

- Tạo session và trả cấu hình/câu hỏi ban đầu.
- Lấy audio câu hỏi nếu tính năng audio được entitlement cho phép.
- Nộp câu trả lời (transcript hoặc audio theo thiết kế voice BE).
- Kết thúc session và yêu cầu đánh giá.
- Đọc session, câu trả lời và feedback theo quyền gói.

Đối chiếu `.spec/database_spec_blueprint.md` với entity/repository BE. Hoàn thiện Question Bank/Question persistence và metadata, session status/thời điểm bắt đầu-kết thúc, thứ tự/snapshot câu hỏi và câu trả lời cần để khôi phục session và tạo feedback. Làm rõ quan hệ `question_id` với bảng câu hỏi thật.

## 7. Trình tự triển khai cho phiên sau

1. Kiểm tra trạng thái code/spec mới nhất và `git status`; không ghi đè thay đổi người dùng.
2. Chốt mapping gói thực tế sang Free/Middle/Enhance và nội dung feedback từng bậc từ dữ liệu entitlement hiện hữu.
3. Cập nhật API spec và DB spec: ba loại interview, cấp độ thống nhất, metadata/quan hệ follow-up, session lifecycle, quyền lợi feedback, `adaptiveMode`.
4. Hoàn thiện entity/repository/service của Question Bank trong module Interview; không truy cập repository module khác trực tiếp.
5. Triển khai và kiểm thử luồng nền `adaptiveMode=false` cho HR/Technical/Behavioral, có/không có CV/JD, thời lượng từng gói và quyền feedback.
6. Triển khai voice/transcript ở BE theo contract; kiểm thử lỗi provider và lưu/tiếp tục session.
7. Triển khai adaptive mode sau luồng nền: lựa chọn follow-up từ DB, fallback, giới hạn lượt/thời gian và quyền feedback độc lập.
8. Chỉ bật adaptive trên FE sau khi kiểm thử BE và xác nhận tương thích API.

## 8. Tiêu chí hoàn tất

- Loại interview và cấp độ lọc đúng ngân hàng câu hỏi; không lẫn HR, Technical và Behavioral.
- Duration được BE giới hạn theo entitlement; không trừ quota phút.
- Free không thể gọi API để nhận feedback; Middle/Enhance nhận đúng mức chi tiết đã định nghĩa.
- Thiếu CV/JD vẫn chạy được bằng câu hỏi chung phù hợp.
- Adaptive mặc định tắt, có fallback về luồng cố định và không vượt giới hạn phiên.
- Voice được xử lý qua BE; session, câu trả lời, câu hỏi đã chọn và feedback được lưu/đọc nhất quán.
- API spec, DB spec và DTO/entity BE thống nhất.

## 9. Tiến độ thực hiện

### API 1 — Tạo interview session (`POST /api/interview/sessions`)

- **Trạng thái:** Đã triển khai BE; Maven compile thành công với `-DskipTests`.
- Nhận loại interview HR/Technical/Behavioral, cấp độ Intern/Fresher/Junior, ngôn ngữ, thời lượng, CV/JD tùy chọn và `adaptiveMode`.
- CV/JD được kiểm tra thuộc gallery hiện tại; JD text được lưu/tìm trùng qua Gallery service. Khi thiếu CV/JD, snapshot giữ phần ngữ cảnh khả dụng; câu hỏi lấy từ ngân hàng theo loại interview và cấp độ.
- Thời lượng hợp lệ là 5/10/15 và bị giới hạn theo gói hiện tại (FREE 5, MIDDLE 10, ENHANCE 15); không trừ quota phút.
- Adaptive chưa triển khai; API từ chối `adaptiveMode=true`, và response hiện trả `false`.
- Session lưu snapshot câu hỏi và ngữ cảnh để câu trả lời/feedback sau này dùng đúng dữ liệu ban đầu.
- **Điều kiện dữ liệu:** cần có đủ câu hỏi `PRIMARY`, active cho từng loại/cấp độ trong DB. Hiện chưa có endpoint quản trị/seed câu hỏi; nếu ngân hàng chưa được nạp đủ, API trả lỗi thiếu câu hỏi thay vì tạo session rỗng.
- **Chưa làm:** runtime test với DB có seed câu hỏi và kiểm thử quyền theo từng gói.
- **Tiếp theo:** đã nối sang API Submit Answer ở mục dưới.

### API 2 — Submit Answer (`POST /api/interview/sessions/{sessionId}/answers`)

- **Trạng thái:** Đã triển khai BE; Maven compile thành công với `-DskipTests`.
- Xác thực session thuộc gallery hiện tại; không cho gửi question ID không nằm trong snapshot của session.
- Lưu transcript, audio URL hoặc câu trả lời bị bỏ qua; yêu cầu nội dung hoặc audio URL khi không skip và từ chối nội dung/audio khi skip.
- Chặn gửi trùng câu trả lời cho cùng một câu hỏi trong cùng session.
- Endpoint nhận `audioUrl` theo contract hiện tại; upload/transcription giọng nói do BE vẫn là phần riêng chưa triển khai.
- **Chưa làm:** runtime test, kiểm tra URL audio thuộc user/ứng dụng, giới hạn thời gian/trạng thái session. Cần bổ sung session lifecycle trước hoặc trong API Evaluate để khóa session đã kết thúc.
- **Bước tiếp theo:** API Evaluate Session (`POST /api/interview/sessions/{sessionId}/evaluate`): chốt số câu trả lời tối thiểu, quyền feedback theo gói (Free không có; Middle/Enhance có độ chi tiết theo bậc), lưu điểm/feedback và trạng thái hoàn tất.
