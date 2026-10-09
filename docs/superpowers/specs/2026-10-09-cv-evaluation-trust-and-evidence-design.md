# Spec: Hoàn thiện luồng CV–JD, điểm đánh giá và minh chứng

**Ngày:** 09/10/2026

**Trạng thái:** Đã được người dùng đồng ý làm cơ sở triển khai ngày 09/10/2026; các phần mới chưa được triển khai.

**Kế hoạch thực hiện:** [Tác vụ, phụ thuộc và nghiệm thu triển khai](../plans/2026-10-09-cv-evaluation-trust-and-evidence-plan.md).

**Cơ sở:** Record demo trước các thay đổi hiện tại, các quyết định gần nhất của người dùng, và rà soát working tree ngày 09/10/2026.

**Ưu tiên:** Hoàn thiện CV evaluation trước; Interview là pha tiếp theo.

Tài liệu này là spec hiện hành cho các thay đổi tiếp theo. Khi mâu thuẫn với bản thiết kế ngày 18/06/2026 hoặc record demo cũ, áp dụng quyết định trong tài liệu này. Các chi tiết API và rubric baseline dưới đây là thiết kế đề xuất để triển khai và kiểm chứng, không phải mô tả chức năng đã hoàn thành.

## 1. Các quyết định nghiệp vụ đã thống nhất

1. Điểm 60/100 ở giao diện cũ là **điểm liên quan của Cohere**, không phải điểm đánh giá CV. Không diễn giải lịch sử này thành hai kết quả chấm CV khác nhau.
2. Khi tải CV, tìm JD hoặc chọn JD, **không chấm và không hiển thị điểm đánh giá**. Cohere chỉ giúp xếp hạng kết quả tìm kiếm ở backend.
3. Chỉ sau khi người dùng bấm **“Bắt đầu đánh giá”**, hệ thống mới tạo hoặc truy xuất một kết quả đánh giá chính thức, có một điểm tổng và phần giải thích từ cùng bộ dữ liệu/minh chứng.
4. Trước đánh giá, trả về tối đa **hai JD**. Không có ngưỡng liên quan 80%, 85% hoặc ngưỡng điểm đánh giá để quyết định danh sách này. Có ít hơn hai JD đúng điều kiện thì trả ít hơn; không bù bằng JD sai nghề.
5. CV có nêu vị trí ứng tuyển: chỉ tìm JD đúng vị trí/nhóm nghề đó. CV không nêu vị trí: dùng kỹ năng, kinh nghiệm và dự án để gợi ý JD, giải thích cơ sở suy luận, rồi để người dùng chọn/xác nhận JD cụ thể.
6. Không yêu cầu nhập “Vị trí muốn tìm”; không yêu cầu xác nhận vị trí trước khi tìm được JD. Không khôi phục thông báo “Chưa có CV?” hoặc câu “Điểm đánh giá chỉ xuất hiện sau khi phân tích CV với JD bạn đã chọn.”
7. Sau đánh giá, tối đa hai JD **nghề khác so với JD đã đánh giá**, có **điểm đánh giá** cao hơn điểm chính thức của lần đánh giá hiện tại. Không dùng điểm Cohere để so sánh; không bổ sung ngưỡng 80–85%.
8. Người dùng có thể sử dụng JD riêng. Trích được tiêu đề không đồng nghĩa xác minh được nguồn tuyển dụng.
9. Các gói dùng cùng quy tắc tính điểm. Gói dịch vụ chỉ thay đổi quyền truy cập tính năng và độ chi tiết giải thích.
10. Giữ các cải thiện UX hiện tại: CV bên trái/JD bên phải, lựa chọn JD rõ ràng, xem một JD trong một cửa sổ, chỉnh đầy đủ JD, nền đục cho trình sửa, vùng cuộn kỹ năng và gợi ý dạng “Tên mục: nội dung”.

## 2. Hiện trạng và phần cần bổ sung

| Hạng mục | Đã có trong working tree | Phần cần triển khai theo spec này |
|---|---|---|
| CV/JD input | Hai cột, kiểm tra PDF/DOC/DOCX và 5 MB, xem/chọn JD | Tự tìm sau import, trạng thái nguồn JD và lựa chọn đáng tin cậy |
| Tìm JD | Tối đa hai kết quả, không hiện điểm liên quan, tìm cả `content` | Đồng bộ schema vị trí CV; lọc nghề bắt buộc trước xếp hạng |
| Điểm tổng | Giao diện dùng `evaluation.score` | Một kết quả được lưu, một công thức, một bộ minh chứng; feedback không chấm lại |
| Feedback | Nhận xét tiếng Việt, phân nhóm theo phần CV | Không ghép feedback cũ với điểm mới; giải thích bằng yêu cầu JD và bằng chứng CV |
| Nghề khác | Có gọi đánh giá CV cho các JD ứng viên | Baseline lấy từ server; lấy nghề của JD được chọn; cache và giới hạn chi phí |
| Quản lý JD | Trích tiêu đề, sửa đầy đủ, ẩn bằng `active` | Lưu snapshot lịch sử; chuẩn hóa cách đọc JD tại mọi màn hình |
| Interview | Gửi loại/cấp độ/ngôn ngữ/thời lượng, lọc ngân hàng theo loại | Kiểm chứng HR/STAR; bổ sung ngữ cảnh JD và văn hóa công ty có nguồn |

## 3. Luồng người dùng đích

### 3.1 Nhập CV và tìm JD

1. Người dùng chọn hoặc kéo thả CV trong khung bên trái. Kiểm tra tệp ngay khi chọn.
2. Sau khi đọc/import CV thành công, hệ thống tìm JD; không chạy CV evaluation ở bước này.
3. Nếu có vị trí ứng tuyển được ghi rõ, lọc đúng nghề và xếp hạng dựa trên CV cùng nội dung JD. Hiển thị tên vị trí, công ty, cấp độ và nguồn; không hiển thị số điểm.
4. Nếu không có vị trí ứng tuyển, tìm từ kỹ năng/kinh nghiệm/dự án; chỉ khi có JD mới giải thích ngắn: “CV chưa nêu vị trí ứng tuyển. Các JD dưới đây được gợi ý từ kỹ năng và kinh nghiệm của bạn.”
5. Người dùng xem JD, rồi bấm “Chọn JD này”. Xem nội dung không đồng nghĩa lựa chọn JD.
6. Không tìm thấy: hiển thị đúng câu “Không có JD phù hợp.” Người dùng vẫn có thể dán/chọn JD riêng.
7. Có “Tìm lại JD”/“Thử lại” để chạy lại tìm kiếm khi cần; không bắt người dùng tải lại CV.

Không ghi đè JD riêng người dùng đang nhập bằng kết quả tìm kiếm đến muộn. Khi đổi CV, hủy/bỏ qua kết quả tìm của CV trước và xóa lựa chọn đánh giá đã không còn hợp lệ.

### 3.2 Chọn JD và bắt đầu đánh giá

- Có một trạng thái lựa chọn duy nhất: `CATALOG`, `SAVED_USER` hoặc `CUSTOM_TEXT`.
- JD đã lưu/hệ thống được chọn bằng ID; không âm thầm chép JD hệ thống thành một JD `USER` chỉ vì frontend gửi nội dung text.
- Muốn chỉnh nội dung JD hệ thống: tạo bản JD cá nhân có `derivedFromJdId`; bản gốc và nhãn nguồn không bị thay đổi.
- Nút “Bắt đầu đánh giá” chỉ hoạt động khi CV đã sẵn sàng, JD đã chọn/nhập hợp lệ, không có tác vụ đang chạy.
- Khi bấm, chụp phiên bản CV và JD, kiểm tra quyền sở hữu/quota, rồi tạo hoặc lấy kết quả của đúng phiên bản đó.
- Chỉ hiển thị trạng thái tương ứng công việc thực: đọc dữ liệu, đối chiếu yêu cầu, kiểm tra minh chứng, tạo giải thích. Không dùng phần trăm giả hoặc chuyển trang theo timer mô phỏng.

### 3.3 Kết quả

- Hiển thị một **“Điểm đánh giá CV–JD”** theo dạng `60/100`.
- Vòng đo dùng một cung màu thể hiện điểm và phần còn lại màu trung tính. Không gọi `100 − điểm` là phần trăm “chưa phù hợp”, không diễn giải điểm là xác suất được tuyển.
- Nút/link “Xem cách tính và minh chứng” mở bảng tiêu chí cùng minh chứng. Đây là đọc kết quả đã lưu, không gọi AI chấm lại và không trừ lượt.
- Các gợi ý trình bày “Tóm tắt chuyên môn: …”, “Kinh nghiệm làm việc: …”; mỗi mục là một đoạn/dòng riêng, cho phép tự xuống dòng khi dài.
- Tên CV, tên JD, công ty, nguồn và ngày đánh giá phải đúng bản đã dùng. Người dùng xem được đầy đủ CV đã phân tích và JD đã chọn.
- Gợi ý nghề khác nằm cuối kết quả, hai thẻ theo hàng ngang trên desktop và một cột trên mobile.
- Không có kết quả thật: tải bằng `analysisId` hoặc báo chưa có kết quả; không rơi về dữ liệu mẫu `cvEvaluations.default`.

## 4. Nhận diện vị trí và lọc JD

### 4.1 Sửa hợp đồng import CV

`CVContent` đã có `professionalTitle`, nhưng `CV_CONTENT_SCHEMA` trong `Prompt` chưa có trường này. Phải đồng bộ import, mapping frontend và dữ liệu dùng cho tìm kiếm/tối ưu.

Thêm dữ liệu nhận diện vị trí bên cạnh nội dung CV:

| Trường | Ý nghĩa |
|---|---|
| `professionalTitle` | Vị trí ứng tuyển ghi trong CV; rỗng nếu không có |
| `targetRoleCode` | Mã nghề chuẩn hóa của vị trí được nêu; null nếu chưa xác định |
| `targetRoleOrigin` | `EXPLICIT`, `INFERRED` hoặc `NONE` |
| `targetRoleEvidence` | Trích đoạn CV làm căn cứ nếu origin là `EXPLICIT` |

`professionalTitle` không được tự lấy từ công việc gần nhất khi CV không ghi vị trí ứng tuyển. Nếu heading không rõ có phải vị trí mong muốn, giữ trạng thái chưa xác định và dùng luồng suy luận. Các nghề suy luận là metadata gợi ý, không ghi chúng thành thông tin ứng tuyển đã được người dùng khai báo.

### 4.2 Chuẩn hóa JD

- Giữ tiêu đề hiển thị người dùng có thể sửa; dùng `roleCode` riêng cho lọc nghề.
- Lấy nghề từ nội dung JD khi title chung/rỗng; hỗ trợ alias như BA, Business Analyst và Phân tích nghiệp vụ.
- Chuẩn hóa mức kinh nghiệm riêng với nghề; không coi “Senior BA” và “Junior BA” là hai nghề khác nhau.
- JD đa nghề có thể có tập `roleCodes`; không gán một nghề chỉ vì từ khóa xuất hiện trong phần kỹ năng, tên công ty hoặc các nhóm phối hợp.
- Giữ bộ alias/taxonomy có phiên bản; thay đổi taxonomy phải làm mất hiệu lực cache tìm kiếm liên quan.
- Chuẩn hóa nghề và yêu cầu khi JD được tạo/sửa; backfill JD cũ bằng công cụ có thể chạy lại an toàn. Không gọi AI trích toàn bộ thư viện ở mỗi lần tìm.

### 4.3 Quy tắc tìm kiếm

- Có nghề explicit: loại JD không cùng `roleCode` trước khi gọi Cohere. Trong tập đúng nghề, xếp hạng bằng CV và yêu cầu JD để chọn hai kết quả tốt nhất.
- Không có nghề explicit: xếp hạng JD từ bằng chứng kỹ năng/kinh nghiệm/dự án; trả tối đa hai và giải thích cơ sở suy luận.
- Cohere thiếu khóa/lỗi: fallback vẫn phải giữ bộ lọc nghề. Không mở rộng sang nghề khác để lấp đủ hai kết quả.
- Loại JD inactive, ngoài phạm vi tài khoản hoặc không đủ nội dung đánh giá.
- Điểm Cohere có thể lưu/log phục vụ kỹ thuật nhưng không nằm trong dữ liệu điểm đánh giá gửi cho UI.

## 5. Kết quả đánh giá, rubric và minh chứng

### 5.1 Một nguồn điểm duy nhất

- Một `CVAnalysis` chứa điểm chính thức và bộ dữ liệu phân tích của một cặp snapshot CV/JD.
- Backend tính điểm từ kết quả đối chiếu đã kiểm tra, không lấy điểm tự do từ hai prompt khác nhau.
- Feedback, SWOT, skill gap và giải thích lấy từ cùng yêu cầu JD/minh chứng CV. Có thể có nhiều bước AI, nhưng không có nhiều bộ chấm tổng độc lập.
- Bỏ `feedback.overallScore` độc lập trong contract mới; adapter cho contract cũ chỉ sao chép điểm chính thức, không sinh số mới.
- Gói dịch vụ không có mặt trong khóa tính điểm; khác gói chỉ ảnh hưởng phần giải thích/tính năng.
- Đặt cấu hình sampling phù hợp cho extraction. Giảm temperature giúp giảm dao động, nhưng không được coi là bảo đảm kết quả giống nhau; snapshot và cache mới bảo đảm mở lại kết quả ổn định.

### 5.2 Dữ liệu minh chứng

Mỗi yêu cầu được chuẩn hóa thành một mục có:

- `requirementId`, nhóm tiêu chí, mô tả và mức bắt buộc/ưu tiên theo JD.
- `jdEvidence`: trích đoạn yêu cầu trong JD snapshot và vị trí/section của đoạn đó.
- `cvEvidence[]`: trích đoạn CV, section hoặc mốc văn bản thực sự được parser lưu.
- `assessment`: `MET`, `PARTIAL`, `NOT_EVIDENCED`, `NOT_APPLICABLE` hoặc `UNCERTAIN`.
- `reason`, `suggestion`, trọng số áp dụng và phần điểm đóng góp.

Backend kiểm tra yêu cầu và trích đoạn tồn tại trong input snapshot. Không chấp nhận minh chứng do AI tự bịa; không tự gán số trang nếu parser chưa cung cấp số trang. `NOT_EVIDENCED` phải hiển thị “Chưa có minh chứng trong CV”, không khẳng định người dùng không có năng lực đó.

Ví dụ hiển thị:

| Yêu cầu JD | Minh chứng CV | Đối chiếu |
|---|---|---|
| Có kinh nghiệm Spring Boot | Trích đoạn dự án nêu Spring Boot | Có minh chứng; lý do và phần điểm đóng góp |
| Thiết lập pipeline CI/CD | Không tìm thấy thông tin tương ứng | Chưa có minh chứng; đề xuất bổ sung nếu người dùng thực sự có kinh nghiệm |

### 5.3 Rubric baseline đề xuất để kiểm chứng

Record chưa quy định trọng số cụ thể. Baseline dưới đây phải được kiểm chứng trên bộ CV/JD mẫu trước khi phát hành; không tuyên bố đây là công thức chuẩn của thị trường.

| Nhóm | Trọng số baseline | Căn cứ |
|---|---:|---|
| Kỹ năng theo yêu cầu JD | 40% | Yêu cầu kỹ thuật, công cụ và năng lực trong JD |
| Kinh nghiệm và dự án liên quan | 35% | Trách nhiệm, phạm vi công việc, trải nghiệm có minh chứng |
| Học vấn/chứng chỉ theo yêu cầu | 10% | Chỉ dùng yêu cầu thực sự được JD nêu |
| Độ rõ ràng của nội dung CV | 15% | Cấu trúc nội dung đọc được, mô tả cụ thể, thông tin cần thiết |

Trong mỗi nhóm, baseline quy đổi `MET = 1`, `PARTIAL = 0.5`, `NOT_EVIDENCED = 0`. Yêu cầu bắt buộc có trọng số nội nhóm 2; yêu cầu ưu tiên có trọng số 1. Đây là cấu hình rubric được version hóa, không để AI tự chọn các hệ số trên từng lần chạy.

```text
attainment(group) = Σ(requirementWeight × attainmentValue) / Σ(requirementWeight)
score = round(100 × Σ(groupWeight × attainment(group)) / Σ(applicableGroupWeight))
```

- `NOT_APPLICABLE` không vào mẫu số; nhóm không có yêu cầu được loại và chuẩn hóa lại trọng số còn lại. Không tự trừ điểm học vấn nếu JD không yêu cầu.
- `UNCERTAIN` không tự đổi thành 0 hoặc 1. Kiểm tra lại phần extraction/đối chiếu; nếu thiếu dữ liệu làm thay đổi đáng kể điểm thì trả trạng thái chưa đủ cơ sở, không dựng một điểm tổng.
- Độ rõ ràng CV được chấm bằng checklist có phiên bản, áp dụng cho nội dung đọc được; không suy luận thiết kế PDF/khả năng qua mọi ATS từ JSON CV.
- Yêu cầu bắt buộc chưa có minh chứng phải hiện rõ dù điểm tổng cao. Chưa áp dụng cap điểm/điều kiện loại tự động nếu chưa hiệu chỉnh rubric.
- Ý tưởng khoảng cách `−4…+4` đã thảo luận có thể được giữ cho tiêu chí có mức yêu cầu và mức minh chứng xác định; thiếu minh chứng phải ghi `UNKNOWN`. Không tự quy đổi khoảng cách 0 thành 50/100, vì cùng mức yêu cầu không đồng nghĩa chỉ đạt một nửa. Trọng số/quy tắc quy đổi khoảng cách chưa được định nghĩa đầy đủ thì không dùng nó làm công thức tổng ngầm.
- Các mức màu/nhãn kết quả chỉ diễn giải điểm sau đánh giá; không trở thành ngưỡng lọc JD trước đánh giá.

### 5.4 Kiểm soát đầu ra AI

- Trích yêu cầu từ JD, không bổ sung yêu cầu theo hiểu biết chung về nghề rồi trừ điểm người dùng.
- Không tạo kỹ năng, năm kinh nghiệm, chứng chỉ, thành tích hoặc con số ngoài CV.
- Kiểm tra kiểu dữ liệu, khoảng điểm, tham chiếu evidence, tổng đóng góp và mâu thuẫn giữa skill gap/feedback.
- Cho phép một lần sửa đầu ra dựa trên lỗi kiểm tra; vẫn sai thì báo không hoàn tất, không lưu kết quả `COMPLETED` và hoàn lượt đã giữ.
- Model/provider được lưu trong metadata phiên phân tích. Fallback không âm thầm thay kết quả đã hoàn tất; kết quả mới phải ghi provider thực dùng.
- JD không đủ yêu cầu rõ ràng: yêu cầu bổ sung nội dung, không mặc định cho điểm cao vì ít điều kiện.

## 6. Lưu trữ, phiên bản và chi phí

### 6.1 Mô hình dữ liệu đề xuất

| Thành phần | Dữ liệu cần có |
|---|---|
| `CVAnalysis` | ID, gallery/account, CV/JD IDs, trạng thái, điểm, rubricVersion, extractionVersion, taxonomyVersion, evaluationConfigVersion, thời gian |
| Input snapshot | Nội dung CV/JD bất biến, tiêu đề/công ty/nguồn tại thời điểm phân tích, hash từng input, cờ dữ liệu bị cắt/không đọc đầy đủ |
| Result | Yêu cầu, minh chứng, đóng góp điểm, skill gap, nhận xét và gợi ý, trạng thái độ tin cậy |
| Runtime metadata | Provider/model thực dùng, thời gian, số bước/số lần retry và thông tin quota cần thiết |
| Alternatives | Analysis gốc, analysis ứng viên, trạng thái job, tập JD đã xét, kết quả so sánh cùng rubric |

Khóa cache tối thiểu: chủ sở hữu + hash nội dung CV liên quan đánh giá + hash nội dung JD + các phiên bản extraction/rubric/config. Hash được chuẩn hóa nhưng không được làm mất dữ liệu có ý nghĩa. Đổi template/đổi tên tệp không tự gây chấm lại nếu nội dung chấm không đổi.

Đổi CV/JD hoặc phiên bản rubric tạo kết quả mới. Kết quả cũ vẫn đọc được, ghi rõ phiên bản cũ. Lịch sử không được lấy lại nội dung JD hiện tại để thay thế snapshot đã đánh giá.

### 6.2 Quota và tác vụ

- Mở lại kết quả và xem minh chứng không trừ lượt; gọi cùng input/version lấy kết quả cache.
- Một yêu cầu phân tích mới giữ/tiêu thụ một lượt; nhiều bước nội bộ không trừ thêm lượt riêng cho feedback và skill gap.
- Khóa/idempotency ngăn bấm đôi hoặc hai request đồng thời tạo hai analysis, hai lần trừ quota.
- Thất bại terminal hoàn quota đúng một lần; không hoàn vượt limit do retry.
- Tìm/xếp hạng JD không tiêu thụ lượt **đánh giá**. Import CV giữ chính sách tạo CV hiện có và phải được giải thích riêng nếu có giới hạn.
- Gợi ý nghề khác dùng cache và ngân sách riêng của job; không âm thầm trừ thêm năm lượt người dùng.
- Công việc AI dài chạy qua cơ chế job/worker có giới hạn concurrency và timeout; transaction DB chỉ giữ ngắn cho snapshot, reservation và ghi kết quả, không giữ khóa quota xuyên suốt cuộc gọi mạng.
- Công việc gợi ý không chặn hiển thị kết quả đánh giá chính. Theo dõi chi phí theo analysis, tránh chạy lại mỗi lần mount trang.

## 7. Gợi ý JD nghề khác

1. Chỉ khởi tạo sau khi analysis gốc `COMPLETED` và có điểm chính thức.
2. Nhận `analysisId`, kiểm tra quyền sở hữu, lấy CV snapshot, JD snapshot, nghề và điểm gốc ở server. Không nhận `currentScore` làm căn cứ từ frontend.
3. Baseline nghề là nghề của **JD đã đánh giá**, không mặc định là `CV.professionalTitle`. Luồng CV không nêu vị trí vẫn phải hoạt động.
4. Lọc đúng nguồn/quyền/inactive; loại cùng nghề và bản sao nội dung JD gốc. JD đa nghề còn chứa nghề baseline không được gọi là “nghề khác” chỉ vì khác tên.
5. Tìm ứng viên từ CV snapshot và xếp hạng; tối đa năm ứng viên cho một job để giới hạn chi phí. Số năm là ngân sách đánh giá nội bộ, không phải số kết quả hiển thị.
6. Đánh giá ứng viên bằng cùng bộ CV, evaluator và rubric/config version của analysis gốc, sử dụng cache trước. Không dùng điểm Cohere thay điểm đánh giá.
7. Chỉ đưa JD có điểm đánh giá lớn hơn điểm gốc vào kết quả, sắp giảm dần, tối đa hai; ưu tiên không lặp lại cùng một nghề trong hai thẻ.
8. Lưu analysis của ứng viên. Nếu người dùng chọn đánh giá/xem chi tiết JD đã được chấm trong job này, tái sử dụng đúng kết quả đó khi input/version không đổi.
9. Không tìm được: “Không có JD vị trí khác có điểm cao hơn.” Lỗi tải khác với không có kết quả. Nếu không đủ cơ sở để so sánh, không tuyên bố JD phù hợp hơn.
10. Không tuyên bố đây là nghề tốt nhất trong toàn bộ thị trường; kết quả chỉ thuộc tập JD được xét và bằng chứng CV đã cung cấp.

Trên thẻ: vị trí, công ty/nguồn, lý do chuyển đổi dựa trên kỹ năng, xem JD đầy đủ, thao tác tiếp tục. Không khôi phục phần trăm liên quan Cohere hoặc ngưỡng 85%.

## 8. JD cá nhân, nguồn và lịch sử

- Tiếp tục cho sửa tiêu đề, công ty và nội dung; giữ interface `JobDescriptionTitleExtractor` và implementation trong `service/impl`.
- Title hiển thị và nghề chuẩn hóa là hai khái niệm riêng. Sửa nội dung làm cập nhật hash/yêu cầu/metadata nghề; không dùng feedback cache của nội dung cũ.
- Lưu raw content cùng dạng đọc được/cấu trúc chuẩn hóa khi cần. Một bộ hiển thị JD dùng chung cho gợi ý, kết quả và thư viện; mọi nơi đều xử lý JSON cũ thành nội dung dễ đọc. Không sửa dữ liệu lưu chỉ vì người dùng mở preview.
- JD cá nhân ghi “JD do bạn cung cấp · Chưa xác minh nguồn” tại nơi lựa chọn và xem nội dung, không chỉ trong thư viện.
- Kiểm tra JD có trách nhiệm/yêu cầu đủ nghĩa. JD giả lập hợp lệ vẫn có thể dùng để luyện tập với nhãn tương ứng; văn bản rác/không phải JD thì yêu cầu bổ sung. Không dùng AI để xác nhận tin tuyển dụng có thật.
- JD hệ thống có `sourceUrl`, `referenceDate` và trạng thái tin nguồn riêng. `active` chỉ thể hiện được dùng trong thư viện, không chứng minh đang tuyển.
- Chỉ ghi “đang tuyển” khi có dữ liệu trạng thái nguồn được xác minh/cập nhật. Mặc định dùng “JD tham khảo”; không mở rộng sang công ty khác hoặc tự thêm seed khi chưa có dữ liệu được duyệt.
- Ẩn JD tiếp tục dùng `active=false`; lịch sử dùng snapshot. Gửi lại cùng nội dung có thể khôi phục theo quy tắc hiện tại, không sửa lịch sử cũ.
- Mọi thay đổi schema/backfill chuẩn bị thành SQL trong `backend/src/main/resources/db/manual`; không tự chạy lên database hiện có.

## 9. Chỉnh UI kết quả và bổ sung minh chứng

- Loại dữ liệu mock khỏi đường sử dụng thật. Dữ liệu mẫu chỉ có trong môi trường/demo route được ghi rõ là ví dụ.
- Route kết quả mang `analysisId` để tải được sau refresh/direct link và kiểm tra quyền trên server; không chỉ dựa vào `location.state`.
- Dùng nền đục cho vùng đọc/edit dài và màu chữ tương phản. Không đổi toàn bộ bảng màu chỉ để làm lại những phần đã ổn.
- Xem JD giữ một modal duy nhất; preview không đánh dấu đã chọn. Các phần khác không bung thêm cửa sổ khi chọn/xem một JD.
- Khi thiếu minh chứng, thay nút “Thêm” chỉ cập nhật state bằng “Bổ sung minh chứng”. Cho sửa đoạn kinh nghiệm/dự án liên quan hoặc thêm dữ liệu người dùng thực sự có và lưu vào CV.
- Nếu người dùng chưa có kỹ năng, cho xem hướng học/luyện tập; không đánh dấu đã có kỹ năng sau một click.
- Sau khi bổ sung, điểm cũ giữ nguyên và ghi đang xem kết quả của bản CV cũ. Người dùng bấm đánh giá bản CV mới; giải thích quota trước thao tác.
- Không coi `atsCompatibility` do prompt tự sinh là chứng nhận qua ATS. Nếu giữ trường này, tách rõ loại nhận xét và cơ sở kiểm tra khỏi điểm CV–JD.

## 10. Hợp đồng API đích

Tên endpoint dưới đây là hợp đồng đề xuất; triển khai adapter để các bước frontend/backend được đưa lên tuần tự.

| Endpoint | Ý nghĩa |
|---|---|
| `GET /api/cv/{cvId}/jd-recommendations` | Tìm tối đa hai JD; trả metadata/cơ sở tìm, không trả điểm đánh giá |
| `POST /api/cv/{cvId}/analysis` | Body dùng đúng một trong `jdId` hoặc `jdText`; nhận idempotency key, chụp input, lấy cache hoặc tạo analysis |
| `GET /api/cv/analyses/{analysisId}` | Trạng thái, điểm/kết quả đã lưu và quyền xem; không chấm lại |
| `GET /api/cv/analyses/{analysisId}/evidence` | Cách tính điểm và minh chứng của cùng analysis |
| `POST /api/cv/analyses/{analysisId}/alternatives` | Lấy job/kết quả có sẵn hoặc khởi tạo job giới hạn ngân sách |
| `GET /api/cv/analyses/{analysisId}/alternatives` | Đọc trạng thái/kết quả gợi ý, không tự tạo thêm cuộc gọi AI |

- Analysis có các trạng thái `PENDING`, `PROCESSING`, `COMPLETED`, `INSUFFICIENT_EVIDENCE`, `FAILED`.
- `POST analysis` trả ID, trạng thái và `reused`; tác vụ đang chạy trả 202, kết quả hoàn tất/cache trả 200/201 phù hợp.
- Kết quả gợi ý nghề khác tham chiếu analysis ứng viên đã lưu và không dùng query `currentScore`.
- Không dùng GET để tạo một lần chấm mới hoặc trừ quota. Endpoint evaluations/feedback/skill-gap cũ chuyển sang đọc/adapter kết quả thống nhất và được deprecated có kiểm soát.
- ID của CV/JD/analysis/job luôn kiểm tra gallery/account. Client không quyết định điểm gốc, chủ sở hữu, nguồn verified hay quota.
- Dữ liệu cũ chỉ có feedback/điểm liên quan không đủ tạo analysis mới: ghi legacy/thiếu cơ sở, không giả tạo evidence hoặc gắn điểm Cohere thành điểm đánh giá.

## 11. Interview — pha sau khi CV đã được kiểm chứng

### 11.1 Kiểm tra cấu hình thật

- Truy vết config UI → request → session → ngân hàng/AI: loại, cấp độ, ngôn ngữ, thời lượng, CV, JD và công ty.
- Xác nhận HR/Behavioral/Technical dùng đúng enum và không tái sử dụng session/câu hỏi của cấu hình khác.
- Đối chiếu ngân hàng xem câu hỏi giống nhau có được gán ở nhiều loại; phân biệt lỗi routing với câu mở đầu chung hợp lệ.
- Lưu nguồn câu hỏi `BANK`/`GENERATED`, loại và metadata để có thể giải thích được các buổi thử.

### 11.2 Khác biệt nội dung và ngữ cảnh

- HR: động lực, hợp tác, xử lý khác biệt, môi trường làm việc và kỳ vọng nghề nghiệp.
- Behavioral/STAR: một tình huống cụ thể, vai trò cá nhân, hành động và kết quả; câu hỏi follow-up làm rõ phần còn thiếu.
- Technical: yêu cầu kỹ thuật thật của JD và level người dùng chọn.
- Đưa JD cùng thông tin văn hóa công ty có nguồn vào lựa chọn/generation của phiên. Thiếu nguồn thì dùng câu hỏi môi trường làm việc chung, không bịa quy trình/văn hóa riêng của công ty.
- Không coi FPT Software là công ty đã xác nhận cho mọi JD FPT Telecom/FPT Play/JD cá nhân. Chỉ hiển thị công ty đúng ngữ cảnh; vai người phỏng vấn phải được ghi là mô phỏng.
- Câu hỏi cá nhân hóa sâu chỉ lưu trong snapshot phiên; không đưa tên/dữ liệu ứng viên vào shared question bank. Câu hỏi reusable được sinh riêng không chứa thông tin định danh.

Không mở rộng số tính năng Interview trong pha CV P0. Giữ module/phạm vi quota hiện tại và kiểm chứng chất lượng trước khi triển khai gói/nghiệp vụ mới.

## 12. Lộ trình triển khai và tệp dự kiến

| Pha | Công việc | Kết quả hoàn thành |
|---|---|---|
| P0.1 — Vị trí và JD | Đồng bộ import schema; chuẩn hóa nghề JD; lọc đúng nghề; tìm sau import; giữ JD được chọn theo ID | CV có nghề không nhận JD sai nghề; CV không có nghề vẫn chọn được JD có căn cứ |
| P0.2 — Analysis | Schema/snapshot/cache/job/quota; evidence extraction/validation; rubric tính ở backend; một score chính thức | Kết quả lặp ổn định, feedback đồng bộ, không chấm trước nút bắt đầu |
| P0.3 — Kết quả | Route analysisId, bảng minh chứng, xem CV/JD snapshot, bỏ mock, đọc kết quả không trừ lượt | Người dùng truy được căn cứ điểm và mở lại được kết quả |
| P0.4 — Nghề khác | Lấy baseline server; nghề từ JD gốc; job/cache/ngân sách; kết quả ứng viên đã đánh giá | Tối đa hai nghề khác có điểm thật cao hơn, kể cả CV không có target |
| P1 — JD/UX | Renderer JD chung; metadata nguồn; sửa/ẩn không đổi lịch sử; bổ sung minh chứng thực | Không JSON thô, không nguồn verified giả, không kỹ năng “đã thêm” chỉ ở UI |
| P2 — Interview | Audit config/bank; JD/company context; phân biệt HR/STAR/Technical | Câu hỏi đúng config và có ngữ cảnh được kiểm chứng |

Tệp/thành phần dự kiến:

- `backend/.../base/persistence/Prompt.java`: schema import, extraction yêu cầu/minh chứng và prompt feedback dựa trên kết quả.
- `backend/.../modules/cv/dto`, `entity`, `repository`: analysis, snapshot, evidence, rubric/result DTO và truy vấn cache theo owner/version.
- `backend/.../modules/cv/service` và `service/impl`: các interface/implementation cho analysis, scoring, validation, job và recommendations; không thêm service cụ thể thiếu interface.
- `CVPipelineController.java`, `CVPipelineServiceImpl.java`, `AIProviderServiceImpl.java`, `CVAnalysisQuotaServiceImpl.java`, `JDRecommendationServiceImpl.java`: luồng analysis thống nhất, quota và baseline server.
- `backend/.../modules/gallery`: metadata nghề/nguồn; cập nhật title extractor và JD update theo nội dung mới.
- `backend/src/main/resources/db/manual`: migration/backfill có kiểm tra và khả năng chạy lại, do người dùng thực hiện riêng.
- `frontend/.../features/cv/pages/CVEvaluation.jsx`, `CVResult.jsx`, `features/cv/services/cvPipelineService.js`: import/tìm/chọn, analysisId và chứng cứ.
- Một component/formatter JD dùng chung, `MyJDsPage.jsx`, `Modal.jsx`: đọc JD nhất quán và bề mặt hiển thị dễ đọc.
- P2: `useInterviewSession.js`, `InterviewSetup.jsx`, `InterviewServiceImpl.java`, `InterviewAIProviderImpl.java`, question repository và prompt tương ứng.

Mỗi pha cập nhật spec/session log và nghiệm thu trước pha phụ thuộc. Không tự commit, seed database hoặc mở rộng nguồn dữ liệu trong yêu cầu viết spec này.

## 13. Tiêu chí nghiệm thu và kiểm thử

### 13.1 CV và lựa chọn JD

- CV ghi Business Analyst: import giữ đúng vị trí; JD title “User provided JD” nhưng content BA được tìm; Backend/Data Analyst không được bù vào hai kết quả.
- Alias BA/Business Analyst/Phân tích nghiệp vụ hoạt động cả với Cohere lẫn fallback. JD chỉ nhắc BA là nhóm phối hợp không bị coi là tuyển BA.
- CV có việc cũ khác nghề nhưng không ghi vị trí: không lấy việc cũ làm nghề explicit; gợi ý từ kỹ năng/dự án và cho chọn JD.
- Không có JD đúng nghề: câu thông báo ngắn đúng yêu cầu, vẫn dùng được JD riêng.
- Đổi CV/nhập JD riêng trong lúc request đang chạy không nhận kết quả hoặc lựa chọn từ request cũ.
- Không có score tại bước tìm/chọn. Bắt đầu đánh giá disabled khi CV/JD chưa sẵn sàng.

### 13.2 Điểm và minh chứng

- Một analysis có một điểm tổng; điểm các màn hình giống nhau và bằng tổng đóng góp theo rubric.
- Cùng input/version: bấm đôi, refresh, mở lại hoặc retry trả cùng ID/kết quả; không gọi AI/trừ quota lại.
- Sửa CV/JD: tạo khóa mới; không ghép feedback cũ. Đổi tên tệp/template đơn thuần không tạo điểm mới.
- Các gói khác nhau nhận cùng core score khi dùng cùng input/version; thay đổi detail không chấm lại core score.
- Minh chứng không tồn tại trong snapshot hoặc requirement không có trong JD bị từ chối. Không chứng minh được năng lực ghi “chưa có minh chứng”.
- JD không yêu cầu chứng chỉ/học vấn không bị trừ điểm ở nhóm không áp dụng. JD quá ít thông tin không được mặc định điểm cao.
- Lỗi/malformed output/provider failure hoàn reservation đúng một lần; chưa có kết quả thì không hiển thị điểm mock.

### 13.3 Gợi ý và lịch sử

- Điểm Cohere cao nhưng điểm đánh giá thấp hơn/equal baseline: không được gợi ý là phù hợp hơn.
- Baseline server vẫn đúng dù client gửi `currentScore` giả hoặc không gửi; API mới chỉ dùng analysisId.
- CV không có target nhưng đã chọn JD vẫn nhận gợi ý nghề khác hợp lệ. Cùng nghề khác seniority không được coi là nghề khác.
- Mở lại kết quả không tạo lại job năm cuộc chấm; chỉ có tối đa hai thẻ và mỗi thẻ truy được analysis đã chấm.
- Sửa/ẩn JD không đổi score, evidence hoặc JD snapshot của lịch sử; tài khoản khác không đọc được analysis.
- JSON-backed JD hiển thị dễ đọc trong thư viện, editor, trang chọn và trang kết quả. Preview không âm thầm sửa nội dung lưu.
- Bổ sung minh chứng thật cập nhật CV; không tự chuyển skill thành đã có hoặc tăng điểm khi chưa đánh giá lại.

### 13.4 Interview và kiểm chứng trên dữ liệu thật

- Với cùng CV/JD/level, test HR/Behavioral/Technical xác nhận đúng request, loại ngân hàng, prompt và session; đánh giá nội dung câu hỏi phù hợp mục tiêu của từng loại, không chỉ assert enum.
- Công ty/văn hóa không có nguồn không được hiển thị là đã xác nhận. JD FPT Telecom không tự gán FPT Software.
- Tạo bộ đối chiếu đề xuất tối thiểu 12 cặp CV/JD IT: BA, backend, frontend, QA; explicit/missing target, generic title, thiếu minh chứng, JD yếu và khác seniority.
- Người kiểm thử xác nhận nghề, requirement/evidence và thứ tự phù hợp mong đợi. Kiểm tra rubric bằng ví dụ có/không có minh chứng; không chỉ so sánh số AI tự sinh với số AI khác.
- Ghi lại số request/model call, thời gian và quota trước/sau cho đường demo. Dùng tài khoản/dữ liệu demo riêng; lỗi và hết quota phải có đường quay lại/retry rõ ràng.
- Trước demo: backend tests chức năng mới chạy được, frontend tests/build/lint phần thay đổi qua và chạy end-to-end thực. `test-compile` hoặc build qua không thay thế kiểm thử nghiệp vụ.
