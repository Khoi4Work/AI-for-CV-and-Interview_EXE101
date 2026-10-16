# Các điểm cần sửa trước khi merge feature/rework-cv

Ngày kiểm tra: 16/10/2026. Code được kiểm tra: `7fc6df0`, trên nhánh `test/test-rework-cv` (đổi tên từ `codex/test-rework-cv`). Nhánh gốc so sánh: `origin/dev` tại `50e5c07`.

**Kết luận:** xuất PDF đã hoạt động trên service Render với cả sáu mẫu và dữ liệu giả lập. Tuy nhiên, chưa nên xác nhận nhánh đã đạt để merge: bộ test chưa sạch, có lỗi lint mới và phân trang cần cải thiện. Đây là báo cáo kiểm tra, chưa phải bản sửa các vấn đề dưới đây.

## Cập nhật xử lý — 16/10/2026

Các mục 1–6 bên dưới đã được sửa: test catalog/preview, fixture và cấu hình 5 test class backend, regex validation ngày cùng test, cổng Docker 8081, khoảng cách phân trang hai mẫu một cột và truyền `key` trực tiếp cho `CvSection`. Sau sửa, frontend đạt 73/73 test, ESLint các file liên quan và production build đều qua; 27 test backend thuộc 5 class nêu trong mục 2 cũng qua. Full backend suite chạy 173 test, không có assertion failure nhưng vẫn có 17 lỗi khởi tạo do Java/Spring không thiết lập được loopback (`Permission denied: connect`) trong môi trường này; lỗi tương tự vẫn xuất hiện cả khi chạy với quyền nâng cao. PDF service startup test cũng không khởi động được vì Playwright browser installation thất bại trong môi trường chạy hiện tại. Bản PDF mới chưa được xuất để xác minh trực quan phân trang.

## Kết quả đã chạy

| Kiểm tra | Kết quả |
| --- | --- |
| Frontend production build | Qua |
| Frontend tests | 69 test: 67 qua, 2 lỗi |
| Backend tests, Java 21 | 173 test: 149 qua, 24 lỗi khởi tạo/fixture, 0 assertion failure |
| PDF service context test, Java 21; module target Java 17 | 1 test qua, Chromium khởi động thành công |
| Health của PDF service Render | HTTP 200 |
| Xuất HTML của 6 mẫu qua PDF service Render | 6/6 HTTP 200, file có chữ ký PDF hợp lệ |
| Đọc chữ trong PDF | Trích xuất được chữ và tên tiếng Việt ở cả 6 mẫu |
| Lint các file editor/renderer mới được kiểm tra | 2 lỗi trong `inputValidation.js` |

Render được kiểm tra tại `https://ai-for-cv-and-interview-exe101-rpfr.onrender.com`. Chỉ gửi dữ liệu giả lập, không gửi CV thật. Health thành công không được dùng thay cho kiểm thử PDF: các yêu cầu xuất PDF thực tế đã được thực hiện riêng.

Các lỗi test được ghi nhận trên nhánh thử nghiệm. Chưa chạy lại toàn bộ suite trên một checkout baseline riêng, nên không quy toàn bộ lỗi cho feature/rework-cv. Ví dụ, triển khai `galleryService.getTemplates` gây lệch kỳ vọng test đã có trên `origin/dev`.

## 1. P1 — Cập nhật hai test frontend không còn khớp luồng hiện tại

### Catalog công khai và phiên đăng nhập

- Vị trí: `frontend/tests/apiClient.test.js`, test `public catalog supports guests and preserves existing user credentials`, khoảng dòng 149.
- Hiện tượng: adapter giả lập yêu cầu mọi request có `publicRequest === true`, nhưng `galleryService.getTemplates()` có thể gọi `/auth/me` trước khi gọi `/templates`. Request xác minh phiên không có cờ đó, làm test thất bại.
- Code liên quan: `frontend/src/service/galleryService.js`, khoảng dòng 49–57. Phần triển khai này không thay đổi so với `origin/dev` trong feature branch.
- Cách sửa đề xuất: mock từng endpoint theo đúng hợp đồng. Tách tình huống khách không có token, token hợp lệ, access token hết hạn có thể refresh, và refresh bị từ chối. Không bỏ bước xác minh chỉ để test xanh vì nó liên quan trạng thái khóa template.
- Điều kiện đạt: test phản ánh đúng request thực tế và chứng minh khách vẫn xem được catalog; tài khoản đăng nhập nhận đúng quyền template.

### Saved CV preview

- Vị trí: `frontend/tests/savedCVPreview.test.js:26`.
- Hiện tượng: test vẫn tìm chuỗi `Đang tạo bản xem trước PDF`, trong khi preview mới render HTML trực tiếp và không còn placeholder của renderer cũ.
- Cách sửa đề xuất: kiểm tra tên ứng viên và nội dung đã lưu, class/template tương ứng, và không có điều khiển chỉnh sửa trong bản xem chỉ đọc. Kiểm tra đủ 6 template, không chỉ thay assertion bằng một điều kiện luôn đúng.
- Điều kiện đạt: đủ 6 mẫu render đúng dữ liệu lưu, giữ các test cách ly dữ liệu và fallback hiện tại.

## 2. P1 — Sửa fixture/cấu hình của 24 test backend đang lỗi

| Test class | Số lỗi | Nguyên nhân quan sát được | Hướng sửa |
| --- | --- | --- | --- |
| `AuthRepositoryIntegrationTest` | 5 | Fixture `Account` thiếu `provider` không được null | Gán provider phù hợp, ví dụ `LOCAL`, trong fixture tạo tài khoản |
| `EmailVerificationIntegrationTest` | 7 | `@Import` đưa interface `EmailVerificationService` vào context như một class cụ thể | Import implementation và bổ sung dependency/mock cần thiết |
| `PendingAccountCleanupIntegrationTest` | 6 | `@Import` interface `PendingAccountCleanupService` | Import implementation và cấu hình dependency đúng |
| `CVRepositoryIntegrationTest` | 2 | Tạo `CVTemplate` thiếu ID phải gán thủ công | Gán ID template rõ ràng trong fixture |
| `GalleryAssetsSerializationTest` | 4 | Import `CVPipelineServiceImpl` nhưng thiếu bean `RoleTaxonomyService` | Import implementation taxonomy hoặc mock đúng phạm vi kiểm thử |

Các file nằm dưới `backend/tests/java/fpt/su26/exe101/backend/modules/`, tương ứng các package auth, cv và gallery. Đây là lỗi setup/fixture quan sát được trong báo cáo Surefire, chưa phải bằng chứng rằng tính năng production bị hỏng ở cả 24 trường hợp.

Điều kiện đạt: chạy lại toàn bộ backend suite thành công sau khi sửa setup; không vô hiệu hóa test chỉ để bỏ lỗi. `BackendApplicationTests` không nằm trong năm class lỗi trên.

## 3. P2 — Sửa hai lỗi ESLint ở validation ngày

- Vị trí: `frontend/src/utils/inputValidation.js:80`.
- Lỗi: `no-useless-escape`, hai dấu `\-` trong character class của regex ngày.
- Cách sửa đề xuất: dùng `[/.-]` với dấu `-` ở cuối, giữ nguyên các định dạng ngày được hỗ trợ.
- Điều kiện đạt: lint file qua, đồng thời thêm/giữ kiểm thử ngày hợp lệ, ngày không tồn tại và ngày sinh ở tương lai.

## 4. P2 — Thống nhất cổng Docker với cổng ứng dụng

- `pdf-service/src/main/resources/application.properties`: `server.port=8081`.
- `pdf-service/Dockerfile`: `EXPOSE 8080`.
- `pdf-service/README.md`: ví dụ `docker run --rm -p 8080:8080 pdf-service`.
- Với cấu hình mặc định trong repository, ví dụ Docker ánh xạ cổng không đúng cổng ứng dụng đang nghe.
- Chọn một phương án và cập nhật đồng bộ README/Dockerfile:
  - Giữ ứng dụng ở 8081, chạy `-p 8081:8081` và đổi EXPOSE tương ứng; hoặc
  - Đặt `SERVER_PORT=8080` cho container và giữ `-p 8080:8080`.
- Render đang trả PDF thành công tại thời điểm kiểm tra; lệch trong ví dụ local không có nghĩa endpoint deploy hiện đã hỏng.

Backend chính nhận `PDF_SERVICE_URL`; mặc định là `http://localhost:8081`. Nếu dùng URL Render trên thì backend local gọi service remote, không bắt buộc chạy thêm Chromium local. Không đặt biến này ở frontend.

## 5. P2 — Tối ưu phân trang của hai mẫu một cột

- Mẫu: `data-scientist`, `boardroom-ready`.
- Với bộ dữ liệu giả lập ngắn gồm một kinh nghiệm, một dự án, một học vấn, hai kỹ năng, một chứng chỉ và một ngoại ngữ: PDF có 2 trang; trang hai chỉ còn phần ngôn ngữ, khoảng 27 ký tự trích xuất.
- Các mẫu `the-standard`, `security-analyst`, `cloud-expert`, `portfolio-hybrid` ra 1 trang với cùng bộ dữ liệu.
- Code cần xem: `frontend/src/features/cv/pdf-renderer/templates/EditableCvHtmlTemplate.css` và bố cục từng template.
- Hướng sửa đề xuất: giảm khoảng cách và padding ở mẫu một cột; kiểm tra quy tắc ngắt trang, tránh đẩy một mục rất ngắn sang trang mới. Không ép mọi CV dài vào một trang.
- Điều kiện đạt: CV ngắn có bố cục gọn; CV dài vẫn đủ nội dung, không cắt chữ, chồng mục hoặc phát sinh trang trắng.

## 6. P3 — Dọn cảnh báo React về key

- Vị trí: `frontend/src/features/cv/pdf-renderer/templates/EditableCvHtmlTemplate.jsx`, khoảng dòng 401 và các chỗ `<CvSection {...sectionProps}>`.
- `sectionProps` chứa `key` rồi được spread vào JSX. React cảnh báo phải truyền `key` trực tiếp.
- Cách sửa đề xuất: bỏ `key` khỏi object props, truyền `<CvSection key={key} {...sectionProps}>` cho từng nhánh render.
- Điều kiện đạt: render đủ 6 mẫu không còn cảnh báo key và vẫn giữ đúng danh tính các section khi sắp xếp.

## Kiểm thử bổ sung trước khi chốt merge

1. Thử trên trình duyệt: sửa trực tiếp, thêm/xóa, kéo thứ tự các mục, đổi mẫu và lưu/mở lại CV từ DB. Những thao tác này chưa được kiểm thử tương tác đầy đủ trong lần đánh giá này.
2. Thử luồng có đăng nhập `frontend → backend /api/cv/pdf → pdf-service → download`, thay vì chỉ gọi trực tiếp PDF service. Kiểm tra xử lý khi service chậm hoặc tạm ngừng.
3. Bổ sung test hợp đồng proxy: HTML trống/quá giới hạn, tên file không hợp lệ, PDF rỗng, service trả lỗi và timeout. Module PDF hiện mới có test context startup.
4. Áp dụng migration `backend/src/main/resources/db/migrations/20261014_cv_optimization_result_snapshot.sql` nếu DB chưa có `cv_optimization_jobs.result_snapshot`. File này đến từ cập nhật dev, không phải migration tự chạy bởi PDF service. Lần kiểm tra này không chạy migration trên DB thật.

## Lệnh tái hiện

```powershell
# frontend
npm test -- --test-concurrency=1
npm run build
npx eslint src/features/cv/pages/CVEditor.jsx src/features/cv/components/CvPdfPreview.jsx src/features/cv/pdf-renderer/templates/EditableCvHtmlTemplate.jsx src/features/cv/pdf-renderer/editableCvHtmlRenderer.js src/features/cv/pdf-renderer/templateSectionLayout.js src/utils/inputValidation.js

# backend: dùng Java 21 và Maven đã cấu hình trên máy
mvn test

# pdf-service: dùng Java 17+; cần browser đúng phiên bản Playwright
mvn test
```

Trong môi trường kiểm tra này, backend và PDF service được chạy bằng Java 21 cùng Maven 3.9.16 trong cache; không dùng Maven wrapper hỏng của backend.

Ảnh và PDF giả lập nằm trong `pdf-service/target/rework-review/` trên máy kiểm tra, là artifact được Git ignore. Chúng không được đưa vào commit báo cáo. Không có thay đổi code chức năng hoặc xác nhận merge trong báo cáo này.
