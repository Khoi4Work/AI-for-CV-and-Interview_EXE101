# Kế hoạch triển khai: CV–JD, điểm đánh giá và minh chứng

**Ngày:** 09/10/2026

**Trạng thái:** Mã nguồn chính đã triển khai. Unit test và frontend build/lint đã kiểm tra; schema PostgreSQL và nghiệm thu tích hợp do người dùng tự thực hiện. G6/G7 chưa đóng vì còn calibration, DB và provider thật.

**Spec nguồn:** [CV–JD evaluation, scoring, and evidence](../specs/2026-10-09-cv-evaluation-trust-and-evidence-design.md).

**Điểm bắt đầu:** Working tree hiện tại, bao gồm các thay đổi CV/JD chưa commit. Không reset hoặc làm lại những cải thiện đã có.

Kế hoạch này chuyển spec được người dùng đồng ý thành tác vụ triển khai, phụ thuộc, tệp dự kiến, kiểm thử và điều kiện nghiệm thu. Không tự chạy SQL lên database hiện có, thêm seed, thay đổi gói dịch vụ hoặc commit trong yêu cầu viết kế hoạch.

### Tiến độ mã nguồn ngày 09/10/2026

| Phạm vi | Đã triển khai | Phần nghiệm thu còn lại |
|---|---|---|
| T00–T02 | Contract phiên bản; snapshot/charge/request/job/JD metadata; SQL thủ công và readiness flag | Áp dụng/chạy lại SQL, constraint/concurrency PostgreSQL |
| T03–T05 | Role explicit từ CV; taxonomy theo title/nội dung; lọc cùng nghề trước rerank, tối đa hai JD | CV/JD thật có nhiều cách trình bày và OCR |
| T06–T10 | Trích yêu cầu JD một lần theo hash; kiểm chứng quote; rubric 40/35/10/15; cache/idempotency/quota; queue/lease và API analysis | Tải đồng thời, restart/timeout với provider và DB thật |
| T11–T12 | Request guard; chọn theo JD ID; polling thật; result theo analysisId; một viewer CV/JD/minh chứng | Đường chính với tài khoản và DB đích |
| T13–T16 | Job tối đa năm candidate; hai nghề khác có điểm cao hơn; nguồn và snapshot; mở editor lưu CV thật | Cache/quota/history và sửa/ẩn JD trên DB đích |
| T17 | Bộ tình huống calibration, phép tính tay, checklist DB và fixture giao diện | Người kiểm thử gắn nhãn đủ cặp CV/JD, đánh giá sai lệch, demo tích hợp |
| T18–T19 | Fingerprint và bỏ reuse sai cấu hình; prompt theo HR/STAR/Technical; company context có nguồn; câu riêng/audio theo session | Matrix provider thật, bank hiện có và câu follow-up STAR; chưa bật adaptive mode |

Chi tiết kiểm tra thủ công: [Checklist DB và nghiệm thu](2026-10-09-cv-analysis-db-checklist.md). Các checkbox dưới đây tiếp tục dùng để nghiệm thu từng yêu cầu, không tự đánh dấu một gate đạt chỉ vì mã nguồn đã có. Người dùng yêu cầu tự chạy các test DB; từ thời điểm đó không chạy thêm repository/integration DB test hay áp dụng SQL.

## 1. Các điều kiện giữ nguyên trong mọi tác vụ

- Tải CV/tìm/chọn JD không tạo điểm đánh giá. Chỉ “Bắt đầu đánh giá” tạo hoặc lấy một kết quả chấm chính thức.
- Cohere chỉ xếp hạng tìm kiếm; không đưa điểm liên quan ra UI hoặc dùng nó so điểm đánh giá.
- Tối đa hai JD trước đánh giá; có vị trí explicit thì buộc cùng nghề. Không ngưỡng 85%, không form nhập vị trí, không xác nhận vị trí trước khi tìm được JD.
- Sau đánh giá, tối đa hai JD nghề khác có điểm đánh giá thực sự lớn hơn baseline lưu ở server.
- Một kết quả chính thức gồm điểm, minh chứng và giải thích của cùng CV/JD snapshot; không ghép feedback cũ với điểm mới.
- Các gói dùng cùng core rubric; chỉ phần giải thích/tính năng được phân quyền theo gói.
- Giữ chỉnh sửa đầy đủ JD, nền đục, một modal xem JD, scroll kỹ năng và gợi ý “Tên mục: nội dung”.
- Service mới có interface tại `service/` và implementation tại `service/impl/`. Controller không trực tiếp tính điểm/gọi AI.

## 2. Thứ tự và phụ thuộc

| Pha | Tác vụ | Phụ thuộc | Mốc nghiệm thu |
|---|---|---|---|
| Nền tảng | T00–T02 | Working tree hiện tại | G0: hợp đồng, fixture, schema/repository kiểm tra được |
| P0.1 — Tìm JD | T03–T05 | T00–T02 | G1: import vị trí đúng, cùng nghề, tối đa hai JD |
| P0.2 — Analysis | T06–T10 | T00–T04 | G2: snapshot, evidence, scoring, cache/quota và API hoạt động |
| P0.3 — UI | T11–T12 | G1 + G2 | G3: luồng nhập → đánh giá → mở lại minh chứng |
| P0.4 — Nghề khác | T13–T14 | G2 + G3 | G4: so điểm server, hai nghề khác, job không chạy lặp |
| P1 — JD/minh chứng | T15–T16 | G2 + G3; T15 cần T04 | G5: nguồn và lịch sử đúng, sửa CV thực sự |
| Nghiệm thu CV | T17 | G1–G5 | G6: regression, calibration và demo thực đạt |
| P2 — Interview | T18–T19 | G6 | G7: config đúng, câu hỏi đúng loại và ngữ cảnh có nguồn |

Mỗi gate cần kết quả kiểm thử và ví dụ thực để đánh dấu hoàn thành. Một file được tạo hoặc `test-compile` qua chưa đủ đóng gate. P0.2 có thể phát triển sau khi dữ liệu nền tảng sẵn sàng, nhưng nghiệm thu luồng tích hợp phải theo thứ tự bảng trên. Không cần tạo task/agent khác để thực hiện kế hoạch.

## 3. Tác vụ nền tảng

### T00 — Chốt contract triển khai và chuẩn bị kiểm thử

**Tệp sửa/chuẩn bị:**

- `backend/pom.xml`, `backend/tests/resources/application-test.properties` nếu cần sửa cấu hình runner.
- `backend/tests/java/.../modules/cv/` và `backend/tests/resources/cv-analysis/`.
- `frontend/tests/`, spec hiện hành và checklist nghiệm thu.

**Công việc:**

- [ ] Ghi baseline Git và các thay đổi có sẵn; phân biệt phần đã sửa với phần chưa triển khai trong spec.
- [ ] Cố định JSON examples cho import, JD recommendation, analysis/status, evidence và alternatives; xác nhận enum, ID, trường optional và lỗi.
- [ ] Chốt tên/phiên bản `rubric-v1`, `extraction-v1`, `taxonomy-v1`, config đánh giá; dùng trọng số baseline 40/35/10/15 để calibration theo spec, không tự gắn là chuẩn thị trường.
- [ ] Tạo fixture đối chiếu có kết quả mong đợi: BA explicit, missing target, JD title chung, JD chỉ nhắc BA là nhóm phối hợp, malformed evidence, JD thiếu nội dung.
- [ ] Chạy lại backend test hiện có để phân biệt lỗi ứng dụng với lỗi môi trường; xử lý vấn đề Mockito/Byte Buddy tự attach nếu tái hiện, bằng cấu hình test runner phù hợp JDK đang dùng.
- [ ] Test service dùng fake/mock AI, không gọi provider thật hoặc dùng database đang chạy. Repository/DDL test dùng schema riêng.

**Kiểm thử:** Test hiện có liên quan CV/gallery chạy được; fixture đọc được; frontend runner `node --test` giữ nguyên. Không thêm bộ test UI nặng chỉ để xác nhận CSS.

**Hoàn thành khi:** Có contract và fixture cụ thể để các tác vụ sau dùng; test runner trả kết quả pass/fail thực sự thay vì chỉ biên dịch hoặc treo.

### T01 — Domain model, snapshot và metadata

**Tệp dự kiến:**

- Sửa `backend/src/main/java/.../modules/cv/entity/CV.java`, `dto/CVContent.java`, import DTO; `modules/gallery/entity/JobDescription.java` và JD DTO.
- Tạo trong `modules/cv/entity/`: `CVAnalysis` (kèm `quotaStatus`), `CVAnalysisRequest`, `CVAlternativeRecommendationJob`.
- Đặt enum nghiệp vụ trong `modules/cv/entity/enums`; DTO chỉ giữ request/response contract, snapshot, evidence, breakdown và alternatives.

**Công việc:**

- [ ] Tách `professionalTitle` hiển thị khỏi metadata `targetRoleCode`, `targetRoleOrigin`, `targetRoleEvidence`; giữ origin explicit/inferred/none đúng ý nghĩa.
- [ ] JD có role codes, metadata version/hash, requirement extraction state, source URL/reference date, source verification state và `derivedFromJdId` khi cần.
- [ ] `CVAnalysis` lưu owner/CV/JD IDs, cache key, snapshot/hash input, phiên bản rubric/extraction/taxonomy/config, trạng thái, điểm, evidence/result và runtime metadata.
- [ ] Snapshot gồm tên CV/JD, công ty, nguồn và nội dung tại thời điểm đánh giá; sau hoàn tất không lấy nội dung entity hiện tại để thay snapshot.
- [ ] Lưu phần CV đọc được từ parser hoặc snapshot có section anchors để kiểm tra trích dẫn; CV tự tạo có evidence anchors từ nội dung structured thực lưu. Thêm cờ dữ liệu bị cắt/đọc không đầy đủ.
- [ ] Charge có unique analysis ID và trạng thái reserved/consumed/refunded. Alternatives lưu parent analysis, danh sách candidate, analysis ứng viên, budget và trạng thái job.
- [ ] Chọn JSONB cho snapshot/result/evidence; các ID, owner, status, versions/cache key phục vụ truy vấn là column rõ ràng.

**Kiểm thử:** DTO serialization; snapshot copy độc lập với entity đang sửa; enum/nullable score cho trạng thái chưa đủ cơ sở; legacy JSON CV không có metadata vẫn đọc được.

**Hoàn thành khi:** Cấu trúc domain biểu diễn được toàn bộ contract mà không cần UI hoặc điểm Cohere để dựng baseline.

### T02 — Migration thủ công, repository và ràng buộc

**Tệp dự kiến:**

- `backend/src/main/resources/db/migrations/20261009_cv_analysis_snapshots_and_jd_metadata.sql`.
- `modules/cv/repository/CVAnalysisRepository.java`, `CVAnalysisRequestRepository.java`, `CVAlternativeRecommendationJobRepository.java`.
- Sửa `CVRepository.java`, `JobDescriptionRepository.java`; thêm repository integration tests trong `backend/tests/java/...`.

**Công việc:**

- [ ] Viết migration thêm bảng/column/index trước, không xóa dữ liệu CVFeedback cũ hoặc ép legacy score thành điểm mới.
- [ ] Cache key unique theo owner + hashes + versions; idempotency key được bind với owner và digest request. Một idempotency key dùng cho payload khác trả conflict.
- [ ] Unique job alternatives theo analysis/version; trạng thái charge nằm trên một dòng analysis; index cho owner/status/createdAt và nghề JD.
- [ ] Thêm queries khóa ngắn để reserve/refund quota, claim job và kiểm tra quyền; không dùng lazy entity sau khi transaction đóng.
- [ ] Thiết kế retry: không ghi đè analysis đã completed; failed attempt được lưu/truy vết khi retry, tối đa một attempt đang chạy trên cùng cache key.
- [ ] Chuẩn bị backfill metadata theo batch và kiểm tra trước/sau; không gọi AI để dựng minh chứng cho feedback cũ.
- [ ] Ghi hướng dẫn prerequisite, cách kiểm tra schema, backup và rollback ứng dụng. Rollback chỉ tắt luồng mới; không drop bảng phân tích đã có dữ liệu trong rollback thông thường.
- [ ] Kiểm tra migration trên database/schema test tách biệt, bao gồm lần chạy lặp. Không chạy migration lên database hệ thống trong quá trình viết/kiểm thử code.

**Kiểm thử:** Unique/cache và charge race, ownership queries, snapshot JSONB, khóa quota, backfill lặp. H2 phục vụ test nhanh; semantics JSONB/unique/concurrency phải được kiểm tra trên PostgreSQL test riêng trước G6.

**Hoàn thành khi:** Migration và entity khớp, constraint có test; có hướng dẫn áp dụng thủ công. Không bật code dùng schema mới trên database chưa có migration; không dựa vào `ddl-auto=update` để tự áp dụng database hiện có.

**Gate G0:** Contract/fixture đã cố định, test runner hoạt động và schema/repository được kiểm tra trên môi trường test tách biệt; database hệ thống chưa bị thay đổi tự động.

## 4. P0.1 — Import vị trí và tìm đúng JD

### T03 — Đồng bộ import CV và xác định nghề có minh chứng

**Tệp sửa/tạo:**

- `base/persistence/Prompt.java`, `modules/cv/service/AIProviderService.java`, `service/impl/AIProviderServiceImpl.java`.
- `CVImportModelResponseDTO.java`, `CVImportResponseDTO.java`, `CVPipelineServiceImpl.java`.
- `frontend/src/features/cv/mapper/cv-data-mapper.js`, import service và context nếu contract đổi.
- Tạo `RoleTaxonomyService` interface/implementation, alias taxonomy có phiên bản trong resources.

**Công việc:**

- [ ] Thêm `professionalTitle` vào schema import/tối ưu; hướng dẫn rõ chỉ lấy vị trí ứng tuyển có căn cứ, không tự lấy job gần nhất.
- [ ] Thu thập raw text/structured anchors, vị trí và quote căn cứ trong cùng bước import; kiểm tra quote có trong input.
- [ ] Chuẩn hóa alias BA/Business Analyst/Phân tích nghiệp vụ và các nhóm IT cần cho fixture; tách seniority khỏi nghề.
- [ ] CV chỉ có chức danh ở lịch sử công việc không được tự gán target explicit. CV không rõ target giữ NONE; các nghề suy luận do search đề xuất, không sửa khai báo CV.
- [ ] Mapping frontend không làm mất professionalTitle/role origin; CV cũ không đủ provenance được xử lý bảo thủ.

**Kiểm thử:** Prompt/contract import qua fake AI; round trip mapping; explicit heading có quote; missing target có job cũ; truncated input; non-CV.

**Hoàn thành khi:** Import một CV BA thật giữ đúng vị trí và căn cứ; CV không khai báo vị trí vẫn không có target explicit sau import.

### T04 — Chuẩn hóa nghề, yêu cầu và chất lượng JD

**Tệp sửa/tạo:**

- `GalleryServiceImpl.java`, `JobDescriptionTitleExtractor.java`/`JobDescriptionTitleExtractorImpl.java`, JD repository/DTO.
- Thêm `JobDescriptionNormalizationService` interface/implementation, DTO yêu cầu và trạng thái chất lượng; `Prompt.java`.
- Backfill runner/instructions dưới module gallery hoặc tooling, migration hướng dẫn liên quan.

**Công việc:**

- [ ] Chuẩn hóa JD khi create/update: title fallback, công ty nếu có căn cứ, nghề, seniority, source metadata, yêu cầu và hash/version tương ứng.
- [ ] Trích nghề từ phần tuyển dụng/trách nhiệm chính; không lấy nghề chỉ xuất hiện ở nhóm cộng tác. Title chung không ngăn nhận diện nghề trong content.
- [ ] JD đa nghề lưu tập role codes; nghề chưa chắc giữ trạng thái unresolved, không tùy tiện gán nghề để làm đủ hai kết quả.
- [ ] Kiểm tra nội dung có trách nhiệm/yêu cầu đủ nghĩa. JD custom giả lập hợp lệ được phép dùng với nhãn; văn bản rác, thiếu nội dung trả lỗi bổ sung.
- [ ] Tái sử dụng extraction theo hash/version; backfill theo batch có resume, không trích mọi JD ở mỗi request tìm kiếm.
- [ ] Sửa JD làm mất hiệu lực metadata extraction cũ. Backfill không cập nhật snapshot analysis cũ hoặc verified state không có nguồn.

**Kiểm thử:** JSON-backed JD, BA generic title, Backend JD nhắc phối hợp BA, JD đa nghề, JD rác, JD không ghi công ty, sửa content và backfill chạy lại.

**Hoàn thành khi:** JD có metadata đáng tin cậy để lọc; không có company/role giả và không coi trích title là xác minh nguồn.

### T05 — Tìm tối đa hai JD đúng nghề trước khi xếp hạng

**Tệp sửa:** `JDRecommendationService.java`, `JDRecommendationServiceImpl.java`, `JDRecommendationResponseDTO.java`, `CVPipelineController.java` và test recommendation hiện có.

**Công việc:**

- [ ] Explicit target: lọc active/access/quality và role codes cùng nghề trước Cohere; query xếp hạng dùng CV + yêu cầu JD trong tập đã lọc.
- [ ] Missing target: xếp hạng từ kỹ năng/kinh nghiệm/dự án; trả search basis và reason ngắn đủ để frontend giải thích.
- [ ] Fallback khi Cohere lỗi vẫn giữ đúng tập nghề; không bù nghề khác. Không đòi đủ hai JD hoặc ngưỡng 85%.
- [ ] DTO public bỏ mọi relevance score; role/source/selection metadata được trả đúng.
- [ ] Chuẩn hóa và loại bản trùng nội dung khi phù hợp; JD inactive/USER khác account không vào kết quả.

**Kiểm thử:** Cả provider path và fallback path; một/không có JD đúng nghề, alias, unrelated job có nhiều keyword chung, USER ownership và hidden JD.

**Gate G1:** Hai kết quả tối đa, đúng nghề khi explicit, không score; missing target tìm được từ CV mà không ép nhập/xác nhận vị trí.

## 5. P0.2 — Một kết quả đánh giá có minh chứng

### T06 — Extraction đối chiếu và kiểm tra evidence

**Tệp sửa/tạo:** `Prompt.java`, AI provider contract/implementation; thêm `CVEvidenceService`, `CVEvidenceValidationService` và implementations, DTO requirements/evidence.

**Công việc:**

- [ ] Từ CV/JD snapshot, yêu cầu AI trả từng requirement và evidence/assessment; không trả overall score tùy ý.
- [ ] Reuse JD requirement extraction từ T04 khi version/hash khớp.
- [ ] Kiểm tra quote và anchors tồn tại; giới hạn normalization khoảng trắng khi so quote, không dùng fuzzy match để hợp thức hóa câu bịa.
- [ ] Kiểm tra ID, trạng thái, yêu cầu có trong JD, evidence liên quan kết luận và dữ liệu đầy đủ. Chuẩn hóa thuật ngữ skills có căn cứ.
- [ ] `NOT_EVIDENCED` không thành khẳng định thiếu năng lực; yêu cầu absent trong JD không được tự thêm để trừ điểm.
- [ ] Cho tối đa một repair call với lỗi kiểm tra cụ thể; vẫn sai trả thất bại/chưa đủ cơ sở, không dựng điểm.
- [ ] Ghi provider/model thực tế và bước xử lý; không ghi toàn bộ dữ liệu CV vào log thông thường.

**Kiểm thử:** Minh chứng thật, quote bịa, requirement ngoài JD, anchors invalid, đầu ra sai JSON/enum, dữ liệu cắt, repair success/fail, provider fallback.

**Hoàn thành khi:** Bộ evidence đã kiểm tra dùng được để tính điểm và sinh giải thích; không cần tin điểm tự do do AI sinh.

### T07 — Scoring backend theo rubric version

**Tệp tạo:** `CVScoringService`/`CVScoringServiceImpl`, rubric config/resources và DTO breakdown. Sửa provider feedback prompt để nhận kết quả/scoring evidence.

**Công việc:**

- [ ] Tính theo baseline spec: nhóm 40/35/10/15; MET/partial/not-evidenced là 1/0.5/0; bắt buộc/ưu tiên là 2/1; N/A loại khỏi mẫu số.
- [ ] Xây checklist rõ ràng cho nhóm độ rõ ràng CV, có mục và minh chứng kiểm tra được. Không dùng tiêu chí “mọi bullet phải có số” để khuyến khích bịa thành tích.
- [ ] UNCERTAIN không tự đổi thành 0/1; xử lý lại hoặc trả insufficient evidence theo spec.
- [ ] Dùng số chính xác cho tổng/trọng số, chỉ round điểm cuối cùng; trả đóng góp đủ để UI tái hiện cách tính.
- [ ] Skill gap, feedback và SWOT lấy từ cùng evidence đã chấm. Feedback chỉ diễn giải score truyền vào, không chấm overallScore mới.
- [ ] Không đưa plan vào core scoring; nếu cần detail theo gói, tạo/read detail overlay riêng trên cùng analysis.
- [ ] Nếu giữ gap −4…+4, chỉ biểu diễn tiêu chí có mức đã xác định; không dùng công thức tổng chưa định nghĩa ngoài rubric v1.
- [ ] Không claim ATS thực hoặc probability tuyển dụng từ rubric này.

**Kiểm thử:** Vectors tính tay 0/partial/full, group N/A, trọng số, round, uncertain, mọi gói cùng core score; feedback không sửa điểm; dữ liệu cũ không được import thành score mới.

**Hoàn thành khi:** Một scorer thuần backend trả số và breakdown ổn định từ cùng evidence/config, không cần gọi AI để cộng tổng.

### T08 — Snapshot, cache, idempotency và quota

**Tệp sửa/tạo:** `CVAnalysisService`/implementation, `CVAnalysisQuotaService`/implementation, repositories từ T02, hash/snapshot helpers và charge logic.

**Công việc:**

- [ ] Resolve và kiểm tra CV/JD theo owner/source; snapshot lấy dữ liệu thực, không tin snapshot/score/source verified từ client.
- [ ] Với `jdId` SYSTEM giữ JD gốc; USER phải cùng gallery. Chỉnh SYSTEM tạo USER derived copy. Custom text dùng find/create có metadata hợp lệ.
- [ ] Canonical hash bỏ tên tệp/template/photo khi không được chấm, giữ nội dung có ý nghĩa; key không chứa plan. Cố định version/hash rules bằng test vectors.
- [ ] Tìm completed/cache hoặc ongoing job trước khi reserve quota; double click trả cùng ID, không gọi AI hay charge hai lần.
- [ ] Trong transaction ngắn: tạo/claim analysis và reserve một lượt và cập nhật `quotaStatus=RESERVED` trên analysis đã khóa. AI chạy ngoài transaction/khóa quota.
- [ ] Complete/consume hoặc fail/refund bằng update có điều kiện; retry lỗi không refund hai lần, không vượt limit.
- [ ] Analysis nội bộ cho alternatives dùng cùng snapshot/cache/scorer nhưng tính vào budget parent; không trừ thêm lượt người dùng. Người dùng mở analysis cached của ứng viên không chấm lại.
- [ ] Sửa CV/JD tạo key mới; cache và lịch sử cũ vẫn đọc đúng snapshot. Insufficient evidence không có điểm dùng được thì hoàn reservation theo chính sách failure.

**Kiểm thử:** Concurrency hai POST, cùng idempotency key khác payload, cache hit khi hết quota, failed retry/refund duplicate, version đổi, plan đổi, edit JD/CV, ownership.

**Hoàn thành khi:** Một input/version chỉ có một analysis đang chạy/completed và một charge hợp lệ; đọc cache không mất lượt.

### T09 — Worker bền vững và pipeline thống nhất

**Tệp sửa/tạo:** `CVAnalysisWorker` contract/implementation, executor config, analysis job claim/recovery; sửa `CVPipelineServiceImpl.java`, provider và telemetry.

**Công việc:**

- [ ] Pipeline: claim → chuẩn hóa input → evidence extraction/validation → scoring → feedback từ evidence/score → validate consistency → ghi completed.
- [ ] Dùng executor giới hạn thread/queue, timeout và job DB. Không dùng common pool không giới hạn, không gọi `@Async` bằng self-invocation cùng bean.
- [ ] Dispatch sau transaction reservation commit; process chết giữa commit/dispatch vẫn có recovery cho PENDING.
- [ ] Lease/heartbeat và retry budget phục hồi stale job; update result theo attempt/version để worker cũ không ghi đè attempt mới.
- [ ] Hai AI bước có thể khác provider nhưng ghi metadata đúng; completed result immutable. Không refresh điểm vì provider thay đổi khi mở lại.
- [ ] Ghi phase đang thực hiện; không tạo numeric progress giả. Nếu đã completed core analysis, lỗi detail không được làm score mất hoặc refund sai.
- [ ] Đảm bảo mô hình feedback/skill gap cũ không tạo chấm riêng song song hoặc reuse `CVFeedback` cũ theo ID đơn thuần.

**Kiểm thử:** Fake worker success/failure, crash recovery, timeout, queued overload, stale attempt, cùng job dispatch đôi, core complete/detail failed.

**Hoàn thành khi:** Có job được truy vấn/truy vết, không giữ DB transaction xuyên cuộc gọi mạng và không mất lượt khi tác vụ không thể hoàn tất.

### T10 — API analysis và chuyển tiếp endpoint cũ

**Tệp sửa/tạo:** `CVPipelineController.java`, analysis request/response DTO, API mapper/adapters, exception mappings và controller tests.

**Công việc:**

- [ ] `POST /api/cv/{cvId}/analysis`: đúng một `jdId`/`jdText`, idempotency key; trả analysisId/status/reused và 202 cho job đang chạy.
- [ ] `GET /api/cv/analyses/{analysisId}` và `/evidence`: đọc status/result của owner; không gọi AI/charge.
- [ ] Responses completed có một score, versions, JD/CV snapshot metadata, evidence/breakdown và skill gap/feedback nhất quán.
- [ ] Legacy adapters đọc kết quả chính thức; field `overallScore` nếu cần compatibility chỉ sao chép score chính thức. Không lấy legacy feedback cũ làm evidence.
- [ ] GET evaluation/skill gap cũ không còn gây chấm mới hoặc trừ lượt; client còn dùng hành vi cũ nhận thông báo/API migration rõ ràng thay vì âm thầm charge.
- [ ] Lỗi invalid selection, quota, unsupported/insufficient evidence, pending/failed và unauthorized có contract rõ ràng cho frontend.
- [ ] Tách analysis flags/schema readiness, không bật luồng mới vào database chưa áp dụng migration. Auth hiện tại vẫn áp dụng với mọi endpoint mới.

**Kiểm thử:** HTTP contract, exact-one JD fields, idempotency, poll/read không gọi provider, account khác denied, legacy compatibility và zero score hợp lệ.

**Gate G2:** Từ request thực đến kết quả persist: một score, evidence hợp lệ, cùng input/version cache, quota đúng và mọi GET chỉ đọc.

## 6. P0.3 — Frontend nhập, đánh giá và đọc kết quả

### T11 — Luồng input và trạng thái lựa chọn JD

**Tệp sửa/tạo:** `CVEvaluation.jsx`, `cvImportService.js`, `cvPipelineService.js`, CV mapper/context; tách hook/controller nhỏ cho import/find/start khi cần test race.

**Công việc:**

- [ ] Sau chọn tệp hợp lệ: import → tự tìm JD. Có retry/tìm lại; không đánh giá ở bước này hoặc dùng timer để giả hoàn thành.
- [ ] Dùng request ID/cancellation để bỏ phản hồi CV cũ; không overwrite JD custom đang nhập bằng request tìm kiếm đến muộn.
- [ ] Selection model duy nhất CATALOG/SAVED_USER/CUSTOM_TEXT, explicit chosen JD, source badge và preview riêng; dùng ID gửi server cho JD đã lưu.
- [ ] CV explicit/missing target dùng thông báo đúng spec; không thêm form vị trí và không câu giải thích điểm người dùng đã bỏ.
- [ ] Disable bắt đầu khi chưa đủ CV/JD, khi import/find cần thiết đang chạy; bảo vệ bấm đôi bằng idempotency của request.
- [ ] Khi start trả ongoing: hiển thị phase thực từ status, poll có backoff và dừng khi terminal/unmount. Khi complete chuyển `/optimizer?analysisId=...`.
- [ ] Cache hit hoàn tất dùng luôn; failed/insufficient evidence hiển thị lỗi và đường sửa/retry, không chuyển sang mock results.
- [ ] CV đã tạo/continue flow hoạt động như uploaded CV; không mất selection chỉ vì tải lại quota.

**Kiểm thử:** Test flow controller/service trên Node runner cho request race, custom draft, selection vs preview, start guard/idempotency, cache/pending/failure; chạy thực bằng tệp mẫu trên giao diện.

**Hoàn thành khi:** Người dùng thực hiện đúng nhập → xem/chọn JD → bắt đầu → kết quả, chưa thấy số điểm ở bước lựa chọn.

### T12 — Trang kết quả, minh chứng và dữ liệu snapshot

**Tệp sửa/tạo:** `CVResult.jsx`, `cvPipelineService.js`, `AppLayout.jsx` nếu route cần điều chỉnh; tạo component evidence table/score breakdown và snapshot preview.

**Công việc:**

- [ ] Load bằng query analysisId, hỗ trợ refresh/direct URL/back navigation; status/error/ownership được thể hiện rõ.
- [ ] Score hiển thị `n/100`, nhãn/ring dùng cùng trường. Grey remainder không gọi là % không phù hợp.
- [ ] “Xem cách tính và minh chứng” mở bảng requirement → quote CV/JD → assessment → reason → contribution; request đọc không charge.
- [ ] CV và JD preview lấy snapshot đúng analysis; CV tạo bằng template hiển thị read-only, CV upload hiển thị bản snapshot/đoạn trích đọc được; không yêu cầu tải tệp gốc nếu hệ thống chưa lưu tệp đó.
- [ ] Giữ scroll kỹ năng, thông báo chưa có minh chứng và gợi ý một mục một đoạn kiểu `Tên mục: nội dung`.
- [ ] Bỏ fallback `cvEvaluations.default` trong route thật; nếu còn mẫu thì chỉ dùng fixture/demo route được gắn nhãn rõ.
- [ ] Detail theo gói được áp dụng server-side; hiển thị khác detail không làm đổi core score.
- [ ] Không mặc định request alternatives như side effect chấm nhiều lần khi mount; UI dùng job contract ở T14.

**Kiểm thử:** State mapping zero/undefined/pending, refresh không state, 404/403, snapshot đúng sau JD edit, cùng score ở mọi nơi, không mock fallback, evidence read không charge.

**Gate G3:** Có demo đầu-cuối CV/JD cụ thể, đọc lại analysis sau refresh được và truy được căn cứ số điểm.

## 7. P0.4 — Gợi ý nghề khác bằng điểm đánh giá

### T13 — Job alternatives, baseline server và cache

**Tệp sửa/tạo:** `JDRecommendationService.java`/implementation, analysis scorer/services, alternatives job service/repository, controller/DTO.

**Công việc:**

- [ ] API lấy analysisId completed thuộc owner; đọc baseline score/CV snapshot/JD snapshot/versions trên server. Deprecate query currentScore.
- [ ] Lấy baseline nghề từ JD đã chọn; missing professionalTitle vẫn hoạt động. Cùng nghề khác seniority/alias hoặc multi-role chứa baseline không được gọi là nghề khác.
- [ ] Pre-filter source/access/active/quality/duplicates, xếp hạng ứng viên; giới hạn tối đa năm JD riêng cho một job, không quét chấm cả thư viện.
- [ ] Reuse candidate analysis cache theo cùng snapshot/config; còn thiếu thì chạy nội bộ qua pipeline T06–T09, không qua prompt score riêng.
- [ ] Chỉ lấy score > baseline, sort giảm dần, tối đa hai, tránh hai bản trùng/cùng nghề khi có lựa chọn tốt hơn.
- [ ] Persist candidate analysis links, reason từ evidence và job status; failure từng candidate không được gắn là điểm thấp/không phù hợp nếu chưa chấm được.
- [ ] Giữ provider/model của baseline làm ưu tiên để so sánh; nếu kết quả khác provider vẫn phải chung scorer/evidence contract, ghi provenance và không claim ổn định giữa các evaluator version khác nhau.
- [ ] Unique job/resume/retry không vượt năm candidate và không trừ thêm lượt người dùng; completed job đọc lại không gọi AI.

**Kiểm thử:** Client score giả, unowned baseline, missing target, same-role generic title, high Cohere/low evaluated score, equal score, inactive/duplicate, max-budget, partial failure, repeat job và cache reuse.

**Hoàn thành khi:** Mỗi thẻ kết quả có analysis chứng minh score cao hơn baseline server và đúng nghề khác.

### T14 — Thẻ nghề khác và dùng lại kết quả ứng viên

**Tệp sửa:** `CVResult.jsx`, `cvPipelineService.js`, continuation routing/selection state.

**Công việc:**

- [ ] Sau completed analysis: khởi tạo job một lần qua POST idempotent, GET đọc status; mount/refresh không tạo thêm job/candidate calls.
- [ ] Không chặn score/evidence chính khi alternatives đang chạy; hiển thị loading/error/no-results phân biệt.
- [ ] Tối đa hai thẻ cuối trang, ngang desktop/dọc mobile, title/company/source/reason và xem JD dễ đọc.
- [ ] Không đưa số Cohere hoặc ngưỡng 85% lên thẻ. Reason “cao hơn” phải tương ứng candidate analysis thật.
- [ ] “Xem đánh giá với JD này” mở candidate analysis cached; nếu người dùng muốn sửa CV/JD thì chuyển input flow và tạo analysis mới khi bắt đầu.
- [ ] Không báo chung “không có JD điểm cao hơn” khi job thất bại hoàn toàn; dùng trạng thái lỗi đúng.

**Kiểm thử:** API calls sau mount/refresh, repeated POST reuse, completed/failed/empty, candidate navigation không charge/AI, sửa input tạo analysis mới.

**Gate G4:** Hai gợi ý có căn cứ, baseline không do client quyết định, không chấm lại khi xem, không quota bất ngờ.

## 8. P1 — JD dễ đọc, nguồn và bổ sung minh chứng thật

### T15 — Renderer JD dùng chung và metadata nguồn/lịch sử

**Tệp sửa/tạo:** Formatter/component JD chung trong frontend shared components/utils; `MyJDsPage.jsx`, `CVEvaluation.jsx`, `CVResult.jsx`, `galleryService.js`; Gallery service/DTO/mapper.

**Công việc:**

- [ ] Tách formatter JSON-backed JD khỏi MyJDsPage để tất cả preview/editor dùng chung; các trường không biết vẫn có cách đọc, không mất source/requirements/benefits.
- [ ] Phân biệt raw và normalized content; mở preview không save/đổi hash. Save editor mới cập nhật bản cá nhân và metadata nghề/yêu cầu theo T04.
- [ ] Show nguồn/ngày tham khảo và “JD do bạn cung cấp · Chưa xác minh nguồn” ở mọi nơi thích hợp, không chỉ thư viện.
- [ ] Active catalog khác tuyển dụng đang mở; chỉ ghi đang tuyển nếu source status đã xác minh, không lấy active=true làm bằng chứng.
- [ ] Giữ title/company/content edit và soft hide; history luôn dùng snapshot. Sửa SYSTEM tạo derived USER copy, không gắn verified state bản gốc cho bản sửa.
- [ ] Một viewer modal, editor nền đục, nút hủy đủ tương phản; giữ source ID và metadata selection đúng.
- [ ] Backfill chỉ vào dữ liệu chuẩn hóa/metadata được hỗ trợ, không chỉnh analysis/feedback lịch sử để giả nhất quán.

**Kiểm thử:** Formatter JSON lồng/plaintext/invalidJSON/unknown fields, source preserved, view không save, derived copy/hidden JD, sửa sau completed analysis và snapshot không đổi.

**Hoàn thành khi:** Cùng một JD đọc được nhất quán ở mọi màn hình và history/nhãn nguồn phản ánh dữ liệu thật.

### T16 — Bổ sung minh chứng vào CV thực

**Tệp sửa:** `CVResult.jsx`, CV context/mapper, CV editor update service và backend CV update nếu cần DTO điều chỉnh.

**Công việc:**

- [ ] Thay “Thêm” chỉ cập nhật addedSkills state bằng “Bổ sung minh chứng”: người dùng sửa kinh nghiệm/dự án/kỹ năng thật và lưu vào CV của mình.
- [ ] Người chưa có kỹ năng được xem gợi ý học/luyện tập, không tự đánh dấu đã có skill hoặc thêm thành tích.
- [ ] Sau save, thông báo kết quả đang xem thuộc bản CV trước; chưa đánh giá lại thì không đổi skill gap/score của analysis cũ.
- [ ] Bấm đánh giá CV mới tạo snapshot/key mới, giải thích lượt sẽ dùng; save CV đơn thuần không tiêu thụ lượt chấm.
- [ ] Không tự sinh con số thành tích hoặc cấp độ skill từ một câu gợi ý của AI.

**Kiểm thử:** CV update thật, cancel giữ nguyên, nonexistent skill không added, hash đổi khi bằng chứng đổi, old score immutable, mới evaluation charge đúng.

**Gate G5:** Sửa input thay đổi CV/JD thật và không làm sai lịch sử hoặc tạo “năng lực đã có” chỉ trên UI.

## 9. Nghiệm thu CV trước Interview

### T17 — Calibration, regression, migration rehearsal và demo

**Tệp chuẩn bị:** Fixture/evaluation manifest trong `backend/tests/resources/cv-analysis/`, UI/service tests trong `frontend/tests/`, checklist/demo report dưới `docs/` và SESSIONS.

**Công việc:**

- [ ] Bộ tối thiểu 12 cặp IT: BA/backend/frontend/QA, explicit/missing target, generic title, khác seniority, JD yếu và CV thiếu evidence. Expected result do người kiểm thử rà soát yêu cầu/minh chứng, không lấy câu trả lời AI khác làm ground truth.
- [ ] Kiểm tra rubric baseline: tính tay đóng góp, N/A, mức partial, critical requirements; điều chỉnh có version và lý do nếu thứ tự phù hợp không hợp lý.
- [ ] Replay cùng input/version kiểm tra cache; edit input/version tạo mới; mọi plan core score không đổi.
- [ ] Chạy regression tương tác CV create/editor/optimize, My JDs/history, auth và quota; không gộp lỗi ngoài scope vào báo cáo pass giả.
- [ ] Test DB PostgreSQL riêng chạy migration/backfill và chạy lại, ownership/concurrency; ghi rõ DB thật chưa được sửa nếu người dùng chưa áp dụng migration thủ công.
- [ ] Demo đường chính và đường lỗi: CV không hợp lệ, không JD đúng nghề, JD custom, insufficient evidence, provider failure, hết quota, refresh results, sửa/ẩn JD, alternatives.
- [ ] Ghi model-call count, cache hits, thời gian từng stage/job và quota trước/sau. Không mở nhiều analysis khi demo chỉ để lấp kết quả.
- [ ] Chụp/rà giao diện desktop/mobile: selected JD rõ, một viewer, plaintext không JSON thô, n/100, bảng evidence đọc được, hai thẻ ngang và scroll dài.

**Gate G6:** T00–T16 đã nghiệm thu, các kiểm thử thực chạy qua, vấn đề còn lại được ghi rõ. Chỉ sau gate này mới mở rộng Interview P2. Database hiện có chỉ được sử dụng luồng mới sau khi migration đã được người dùng áp dụng và kiểm tra.

## 10. P2 — Interview đúng cấu hình và ngữ cảnh

### T18 — Audit HR/STAR/Technical và session reuse

**Tệp sửa/kiểm tra:** `frontend/.../useInterviewSession.js`, `InterviewSetup.jsx`, `VideoSetup.jsx`; `InterviewServiceImpl.java`, repositories và `InterviewServiceImplTest.java`.

**Công việc:**

- [ ] Truy vết UI values → request enums → bank query/AI prompt → session snapshots, bao gồm level/language/duration/CV/JD/company.
- [ ] Tái hiện hai phiên khác loại với cùng input; kiểm tra reset/backendSessionId/question reuse; không kết luận UI bị bỏ qua chỉ dựa trên câu mở đầu giống nhau.
- [ ] Audit bank câu giống nhau gán nhiều loại và metadata; xác định phần overlap hợp lệ, loại/generation sai thì sửa rõ.
- [ ] Lưu question provenance BANK/GENERATED, type, source/context và query/generation metadata đủ debug.
- [ ] Test assertion vào chủ đề/nội dung và nguồn câu hỏi, không chỉ type enum trong response.

**Hoàn thành khi:** Có kết luận bằng request/session/question records về nguyên nhân giống câu và cấu hình mới không bị dùng lại bộ câu cũ.

### T19 — JD và văn hóa công ty có nguồn trong câu hỏi

**Tệp sửa:** Interview request/DTO/entity snapshot, `InterviewServiceImpl.java`, `InterviewAIProvider.java`/implementation, relevance service, `Prompt.java`, `CompanyInfo`/repository nếu cần; setup/result/persona frontend.

**Công việc:**

- [ ] Resolve company từ JD/nguồn/context người dùng, không cố định FPT Software cho FPT Telecom/FPT Play; không nhãn “Đã xác nhận” khi chỉ có preset frontend.
- [ ] Tách câu hỏi mục tiêu: HR động lực/hợp tác/kỳ vọng; STAR ví dụ cụ thể/vai trò/hành động/kết quả; Technical yêu cầu JD đúng level.
- [ ] Generation/retrieval nhận JD cùng verified company-context nếu có; thiếu nguồn dùng môi trường làm việc chung và ghi người phỏng vấn là mô phỏng.
- [ ] Câu hỏi cá nhân hóa chỉ lưu session snapshot; shared bank không chứa dữ liệu định danh CV. Reusable questions sinh theo competency/context đã loại thông tin riêng.
- [ ] STAR cần câu làm rõ phần thiếu; ưu tiên cơ chế follow-up đã có. Nếu chưa có runtime hỗ trợ, lập tác vụ riêng kiểm soát phiên trước khi bật follow-up động; không âm thầm bật adaptive mode đang chưa hỗ trợ.
- [ ] Giữ quyền lợi/quota/gói hiện tại; không mở rộng feature billing trong tác vụ này.

**Kiểm thử:** Matrix HR/STAR/Technical × level × language, CV/JD/no-CV, known/unknown company, type-change session, shared-bank không định danh và provenance đúng.

**Gate G7:** Các phiên thực khác biệt đúng mục tiêu, không bịa văn hóa công ty và config được dùng ở cả lựa chọn lẫn generation.

## 11. Lệnh kiểm tra và quy tắc đánh dấu hoàn thành

Các lệnh dưới đây chạy tại thư mục tương ứng sau tác vụ có thay đổi code; không chạy build/test chỉ vì sửa tài liệu.

**Backend (`backend/`, PowerShell):**

```powershell
.\mvnw.cmd -q -DskipTests test-compile
# Chỉ định suite thực sự có sau khi triển khai; ví dụ gate G1:
.\mvnw.cmd -q '-Dtest=JDRecommendationServiceImplTest' test
# G2 trở đi: chạy scorer/evidence/analysis/quota/controller tests liên quan đã tạo.
.\mvnw.cmd -q test
```

Các suite mới dự kiến: `CVImportRoleTest`, `JobDescriptionNormalizationTest`, `CVEvidenceValidationTest`, `CVScoringServiceTest`, `CVAnalysisRepositoryTest`, `CVAnalysisQuotaTest`, `CVAnalysisWorkerTest`, `CVAnalysisControllerTest`, `CVAlternativeRecommendationTest`. Tên có thể điều chỉnh để theo convention repo; không ghi command pass khi lớp chưa tồn tại hoặc test chưa chạy.

**Frontend (`frontend/`):**

```powershell
npm test
npm run build
npm exec eslint -- src/features/cv/pages/CVEvaluation.jsx src/features/cv/pages/CVResult.jsx src/features/cv/services/cvPipelineService.js
```

Bổ sung file mới vào lệnh targeted ESLint theo từng tác vụ. Full-project lint còn lỗi cũ phải ghi riêng, không dùng lỗi cũ để bỏ kiểm tra file mới. Node tests kiểm tra service/flow mapping; chức năng UI đọc/sửa/poll phải chạy thêm trên browser thực, không coi render/build là đủ.

**Repository:**

```powershell
git diff --check
git status --short
```

Mỗi gate ghi: tác vụ đã hoàn thành, file/migration, command và kết quả, demo input → output, hạn chế còn lại, runtime model-call/quota khi có. Chỉ tick checkbox tương ứng sau khi điều kiện đã đạt. Không tự tick task migration áp dụng lên hệ thống khi mới viết SQL hoặc mới chạy schema test.

## 12. Triển khai tuần tự và rollback

1. Hoàn thành và kiểm tra contract/migration/model trước; code mới được đặt sau readiness/feature flag cho đến khi database đích có schema phù hợp.
2. Backend hỗ trợ contract mới và adapter trước khi frontend chuyển đường gọi; không cho một phiên UI lấy score từ hai luồng.
3. Nghiệm thu G1/G2 trong môi trường test; đưa UI G3 và alternatives G4 vào cùng dữ liệu snapshot đã kiểm chứng.
4. Hoàn thành G5/G6, cung cấp migration và checklist áp dụng thủ công. Người dùng thực hiện/ủy quyền áp dụng database ở bước riêng; không tự chạy vì kế hoạch được đồng ý.
5. Nếu rollout lỗi, tắt tạo analysis/job mới qua flag; vẫn cho đọc completed analyses và snapshot. Không chuyển sang dữ liệu mock hoặc tự chấm bằng legacy GET để che lỗi.
6. Job đang chạy được giữ/đóng có kiểm soát để quota không mất; không drop các bảng lịch sử hoặc rewrite score completed trong rollback.
7. P2 chỉ bắt đầu sau CV đạt G6. Việc commit/publish/deploy tuân theo yêu cầu riêng của người dùng, không suy ra từ việc đồng ý bản kế hoạch.

### Điều chỉnh schema 2026-10-10

Không tạo bảng riêng cho quota charge, JD normalization hay xác minh company context. Trạng thái charge nằm trong `cv_analyses.quota_status`; metadata, hash/version và lease/token trích yêu cầu nằm trên `job_descriptions`; URL/ngày tham khảo/cờ xác minh văn hóa nằm trên `company_info`. Giữ `cv_alternative_jobs` để lưu tiến độ và kết quả các đánh giá nghề khác theo cùng rubric. SQL chuyển dữ liệu bản cũ khi thêm cột lần đầu, giữ nguyên các bảng cũ để đối chiếu.
