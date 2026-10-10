# Kiểm tra thủ công luồng CV–JD và Interview

Tài liệu dùng để bạn kiểm thử DB và nghiệm thu sau triển khai. Các SQL dưới đây chưa được chạy lên DB cấu hình của ứng dụng. Không cần thêm seed JD để bật luồng mới.

## Chuẩn bị schema

1. Dừng backend/worker trước khi áp dụng schema. Phải thêm các cột mới trước khi chạy phiên bản ứng dụng này, kể cả khi `CV_ANALYSIS_ENABLED=false`, vì entity JD/company dùng các cột đó.
2. Áp dụng thủ công `backend/src/main/resources/db/migrations/20261009_cv_analysis_snapshots_and_jd_metadata.sql` lên DB thử nghiệm trước. Script chỉ thêm ba bảng (`cv_analyses`, `cv_analysis_requests`, `cv_alternative_jobs`), thêm cột vào JD/company và trigger bảo vệ kết quả hoàn tất; không chuyển feedback cũ thành kết quả có minh chứng.
3. Áp dụng thủ công `backend/src/main/resources/db/migrations/20261009_interview_session_question_snapshots.sql` nếu DB có FK từ `interview_answers.question_id` tới `questions`. Script chỉ bỏ FK này để hỗ trợ ID câu hỏi riêng trong snapshot của phiên; giữ dữ liệu và FK tới phiên phỏng vấn.
4. Chạy lại hai script trên DB thử nghiệm và kiểm tra không lỗi. `CREATE TABLE IF NOT EXISTS` không sửa một bảng cùng tên có schema khác; nếu đã có bản migration cũ, đối chiếu đầy đủ các cột trước khi bật.
5. Bật `CV_ANALYSIS_ENABLED=true`, khởi động backend. Readiness kiểm tra tồn tại các bảng và các cột mới. Sau đó kiểm tra cột, JSON và constraint bằng các trường hợp bên dưới.
6. Có thể bật **một lần** `CV_JD_METADATA_BACKFILL_ENABLED=true` để chuẩn hóa metadata JD có sẵn theo từng trang 200 bản ghi. Backfill không gọi AI, không thêm JD và không gắn nguồn “đã xác minh”. Sau lần chạy này đặt lại `false`; JD mới/chỉnh sửa và JD dùng đánh giá vẫn được chuẩn hóa khi cần.

```sql
SELECT to_regclass('cv_analyses'), to_regclass('cv_analysis_requests'), to_regclass('cv_alternative_jobs');
SELECT id, status, phase, attempt, score, model_calls, internal_analysis, quota_status
FROM cv_analyses ORDER BY created_at DESC LIMIT 20;
SELECT id, normalization_hash, normalization_version, extraction_status, normalization_metadata FROM job_descriptions LIMIT 20;
SELECT id, culture_source_url, culture_reference_date, culture_verified FROM company_info LIMIT 20;
SELECT analysis_id, status, candidate_ids, analysis_ids, failed_count FROM cv_alternative_jobs;
```

Nếu đã chạy bản SQL sáu bảng trước đó: script chuyển dữ liệu từ ba bảng phụ khi lần đầu thêm cột tương ứng vào bảng chủ. Chạy lại không phục hồi metadata/xác minh cũ đã bị sửa sau lần chuyển. Ba bảng phụ cũ được giữ để đối chiếu, ứng dụng không dùng nữa; script không tự xóa chúng.

Quota vẫn do module quota hiện có quản lý. `cv_analyses.quota_status` chỉ ghi trạng thái giữ/trừ/hoàn lượt của một lần đánh giá để xử lý retry đúng một lần.

## CV, cache và quota

- Import CV không tiêu hao lượt phân tích, không có điểm. Có vị trí ứng tuyển thì chỉ gợi ý tối đa hai JD cùng nghề; title chung như “User provided JD” phải tìm nghề từ nội dung. Không có JD đúng nghề thì hiển thị “Không có JD phù hợp”.
- Chọn JD A rồi xem JD B: chỉ JD A được đánh giá. Saved JD gửi `jdId`; bản sao sửa riêng gửi `jdText` và `derivedFromJdId`. Không sửa nội dung SYSTEM JD qua luồng này.
- Hai request cùng `Idempotency-Key` và payload phải cùng `analysisId`, một charge. Dùng lại key với payload khác trả conflict. Hai key khác nhau đồng thời cho cùng input/version vẫn chỉ một analysis và một charge.
- Refresh kết quả, GET kết quả/minh chứng và đánh giá lại cùng input hoàn tất không gọi AI hoặc trừ lượt thêm. Lỗi provider/insufficient evidence hoàn lượt một lần. Retry bằng key mới không vượt ba attempt cho cùng analysis.
- Sửa nội dung CV/JD tạo snapshot/hash mới. Đổi ảnh/template CV không làm mất parser text hoặc đổi nội dung đã chấm. Kết quả cũ giữ nguyên sau khi sửa/ẩn JD hoặc sửa CV.
- Tài khoản khác không đọc được analysis, evidence, job gợi ý, CV hay JD USER. Kiểm thử với cả UUID đúng nhưng không thuộc chủ sở hữu.
- Dừng worker giữa chừng, chờ lease hết: tác vụ chuyển FAILED và hoàn lượt; worker cũ trả muộn không ghi đè terminal hoặc kết quả của attempt mới.
- Thử cập nhật snapshot/result/score/version của analysis COMPLETED bằng SQL trên DB thử nghiệm: trigger phải chặn. Không chạy thao tác này trên lịch sử đang dùng.

## JD nghề khác

- Chỉ bắt đầu sau analysis COMPLETED. Baseline lấy từ analysis của server; API không nhận `currentScore` từ client.
- Tối đa năm candidate và hai gợi ý nghề khác. Mỗi candidate có analysis/evidence/rubric giống baseline, chỉ xuất hiện khi điểm đánh giá cao hơn. Không dùng Cohere để so điểm.
- Refresh/POST job lặp không tạo thêm child analysis ngoài các ID đã lưu. Child analysis nội bộ không trừ thêm quota CV của người dùng.
- JD cùng nghề, không rõ nghề, trùng nội dung, bị ẩn hoặc thuộc người khác không được lấp vào danh sách. Thất bại một phần phải hiện giới hạn của kết quả thay vì khẳng định đã kiểm tra mọi JD.

## Interview

- Đổi HR → STAR → Technical cùng CV/JD: request enum, prompt và snapshot loại/cấp độ/ngôn ngữ/thời lượng phải khớp UI; không dùng lại `backendSessionId` hay questions của cấu hình cũ.
- Câu sinh có CV/JD chỉ ở session snapshot, không ghi vào shared bank. Kiểm tra submitAnswer, evaluate và session-question audio dùng đúng ID snapshot và ownership.
- FPT Telecom không tự đổi thành FPT Software. Không có company context kèm URL nguồn HTTPS, ngày tham khảo và verified=true thì dùng ngữ cảnh môi trường làm việc chung. Không tự đặt verified khi upload JD.
- HR hỏi động lực/hợp tác/kỳ vọng; STAR yêu cầu tình huống cụ thể và vai trò/hành động/kết quả; Technical gắn chuyên môn và cấp độ. Nội dung do provider thật sinh vẫn cần rà soát thủ công; unit test mock không thay nghiệm thu này.

## Rollback và phần còn cần nghiệm thu

Tắt `CV_ANALYSIS_ENABLED` để ngừng tạo analysis/job mới. Giữ bảng lịch sử; các GET kết quả đã lưu vẫn đọc được. Không bật lại legacy chấm điểm bằng GET hoặc dùng dữ liệu mock.

Rubric-v1 là baseline cần calibration với bộ cặp CV/JD trong `backend/tests/resources/cv-analysis/calibration-cases.json`. Chỉ đóng gate G6/G7 sau khi bạn kiểm tra DB, provider thật và kết quả minh chứng; không coi build/unit test là nghiệm thu tích hợp hoàn tất.
