# PDF Service

Backend stateless để các service khác gửi HTML và nhận lại PDF. Service render bằng Chromium qua Playwright; không dùng database và không lưu file đầu ra.

## Cấu trúc theo module

- `com.ndnk.exe.pdfservice.base.exception`: `ApiException`, `ErrorCode`, và global exception handler dùng chung.
- `com.ndnk.exe.pdfservice.base.response`: response envelope dùng cho health/error JSON; endpoint PDF thành công vẫn trả binary PDF.
- Mỗi module chia thành `controller`, `dto/request`, `dto/response`, `service`, và `service/impl`.
- `modules.pdf`: REST controller, request/response DTO, service contract, cùng các implementation nghiệp vụ và Chromium trong `service/impl`.
- `modules.health`: health endpoint, response DTO, service contract và các implementation trong `service/impl`. Health không cần request DTO vì endpoint là GET không có request body.
- `PdfServiceApplication`: entrypoint Spring Boot ở package gốc; Maven chỉ có một module ứng dụng.

```text
com.ndnk.exe.pdfservice
├── base
│   ├── exception
│   └── response
└── modules
    ├── health
    │   ├── controller
    │   ├── dto
    │   │   └── response
    │   ├── service
    │   │   └── impl
    └── pdf
        ├── controller
        ├── dto
        │   ├── request
        │   └── response
        ├── service
        │   └── impl
```

## Chạy local

Cần Java 17. Project pin Maven Wrapper 3.9.16 để tránh lỗi Maven importer của IDE với Maven 3.10.0. Playwright đã được khai báo trong `pom.xml`; Chromium binary cần cài riêng một lần bằng CLI:

```powershell
.\mvnw.cmd -U exec:java "-Dexec.mainClass=com.microsoft.playwright.CLI" "-Dexec.args=install chromium"
.\mvnw.cmd -U -DskipTests package
java -jar target/pdf-service-0.0.1-SNAPSHOT.jar
```

Nếu IntelliJ vẫn dùng Maven khác, đặt **Maven home path** thành **Use Maven Wrapper** rồi reload Maven project. Playwright cần browser binary tương ứng với phiên bản dependency; chạy lại lệnh cài Chromium sau khi nâng phiên bản Playwright. [Playwright Java browser installation](https://playwright.dev/java/docs/browsers)

Hoặc chạy bằng Docker, image runtime đã kèm Chromium và thư viện hệ thống cần thiết:

```bash
docker build -t pdf-service .
docker run --rm -p 8080:8080 pdf-service
```

## API

### `POST /api/v1/pdf`

Nhận JSON và trả `application/pdf` trực tiếp. Tối đa 2,000,000 ký tự HTML.

```json
{
  "html": "<!doctype html><html><body><h1>Hello</h1></body></html>",
  "filename": "report.pdf",
  "options": {
    "format": "A4",
    "landscape": false,
    "printBackground": true,
    "preferCssPageSize": true,
    "marginTop": "12mm",
    "marginRight": "12mm",
    "marginBottom": "12mm",
    "marginLeft": "12mm"
  }
}
```

`html` là trường bắt buộc. `filename` và `options` đều không bắt buộc. `format` hỗ trợ `A0`–`A6`, `Letter`, `Legal`, `Tabloid`, `Ledger`. Margin nhận đơn vị Chromium hỗ trợ như `mm`, `cm`, `in` hoặc `px`. CSS/ảnh/font nhúng bằng `data:` được hỗ trợ; request mạng từ HTML bị chặn để tránh SSRF.

Ví dụ gọi từ service khác:

```bash
curl -X POST http://pdf-service:8080/api/v1/pdf \
  -H 'Content-Type: application/json' \
  --data '{"html":"<h1>Invoice 42</h1>"}' \
  --output invoice.pdf
```

Lỗi trả theo `application/problem+json`: `400` cho request không hợp lệ, `413` nếu vượt giới hạn payload cấu hình ở tầng gateway, `422` nếu Chromium không render được. `GET /api/v1/health` trả trạng thái service.

## Ghi chú vận hành

- Mặc định dùng cổng `8080`; có thể đổi bằng `SERVER_PORT`.
- `PDF_CHROMIUM_HEADLESS` điều khiển headless mode (mặc định `true`).
- Browser dùng chung trong tiến trình; thao tác render được tuần tự hóa vì Playwright Java không thread-safe. Ngang tải bằng cách chạy thêm replica sau load balancer.
- Service nhận HTML từ caller tin cậy. Hạn chế quyền gọi ở network/gateway nội bộ và đặt giới hạn body request ở gateway.
