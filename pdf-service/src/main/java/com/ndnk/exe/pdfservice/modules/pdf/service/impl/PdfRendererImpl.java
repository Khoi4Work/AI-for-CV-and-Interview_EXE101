package com.ndnk.exe.pdfservice.modules.pdf.service.impl;

import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserContext;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;
import com.microsoft.playwright.options.Margin;
import com.ndnk.exe.pdfservice.base.exception.ApiException;
import com.ndnk.exe.pdfservice.base.exception.ErrorCode;
import com.ndnk.exe.pdfservice.modules.pdf.dto.request.PdfRenderOptions;
import com.ndnk.exe.pdfservice.modules.pdf.service.PdfRenderer;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class PdfRendererImpl implements PdfRenderer {
    private static final Logger log = LoggerFactory.getLogger(PdfRendererImpl.class);
    private final boolean headless;
    private Playwright playwright;
    private Browser browser;

    public PdfRendererImpl(@Value("${pdf.chromium.headless:true}") boolean headless) {
        this.headless = headless;
    }

    @PostConstruct
    void start() {
        log.info("Starting Playwright Chromium (headless={})", headless);
        try {
            playwright = Playwright.create();
            browser = playwright.chromium().launch(new BrowserTypeOptions(headless).toLaunchOptions());
            log.info("Playwright Chromium started successfully");
        } catch (RuntimeException exception) {
            log.error("Failed to start Playwright Chromium", exception);
            throw exception;
        }
    }

    /** Playwright's Java objects are not thread-safe; serialize access to the shared browser. */
    @Override
    public synchronized byte[] render(String html, PdfRenderOptions options) {
        long startedAt = System.nanoTime();
        String format = value(options == null ? null : options.format(), "A4");
        log.debug("Starting PDF render (htmlChars={}, format={})", html.length(), format);
        try (BrowserContext context = browser.newContext(); Page page = context.newPage()) {
            page.setDefaultTimeout(15_000);
            // Prevent user supplied markup from making the renderer a network/metadata proxy.
            page.route("**/*", route -> {
                String url = route.request().url();
                if (url.startsWith("data:") || url.startsWith("blob:") || url.startsWith("about:")) {
                    route.resume();
                } else {
                    route.abort();
                }
            });
            page.setContent(html, new Page.SetContentOptions().setWaitUntil(
                    com.microsoft.playwright.options.WaitUntilState.NETWORKIDLE));

            Page.PdfOptions pdfOptions = new Page.PdfOptions()
                    .setFormat(format)
                    .setLandscape(value(options == null ? null : options.landscape(), false))
                    .setPrintBackground(value(options == null ? null : options.printBackground(), true))
                    .setPreferCSSPageSize(value(options == null ? null : options.preferCssPageSize(), true));
            if (options != null) {
                pdfOptions.setMargin(new Margin()
                        .setTop(options.marginTop())
                        .setRight(options.marginRight())
                        .setBottom(options.marginBottom())
                        .setLeft(options.marginLeft()));
            }
            byte[] pdf = page.pdf(pdfOptions);
            long durationMs = (System.nanoTime() - startedAt) / 1_000_000;
            log.info("PDF rendered successfully (htmlChars={}, pdfBytes={}, durationMs={})",
                    html.length(), pdf.length, durationMs);
            return pdf;
        } catch (com.microsoft.playwright.PlaywrightException exception) {
            long durationMs = (System.nanoTime() - startedAt) / 1_000_000;
            log.error("PDF rendering failed (htmlChars={}, format={}, durationMs={})",
                    html.length(), format, durationMs, exception);
            throw new ApiException(ErrorCode.PDF_RENDER_FAILED,
                    ErrorCode.PDF_RENDER_FAILED.getDefaultMessage(), exception);
        }
    }

    @PreDestroy
    void stop() {
        log.info("Stopping Playwright Chromium");
        if (browser != null) browser.close();
        if (playwright != null) playwright.close();
        log.info("Playwright Chromium stopped");
    }

    private static <T> T value(T value, T defaultValue) {
        return Optional.ofNullable(value).orElse(defaultValue);
    }

    private record BrowserTypeOptions(boolean headless) {
        com.microsoft.playwright.BrowserType.LaunchOptions toLaunchOptions() {
            return new com.microsoft.playwright.BrowserType.LaunchOptions().setHeadless(headless);
        }
    }
}
