package fpt.su26.exe101.backend.modules.cv.service;

import fpt.su26.exe101.backend.modules.cv.dto.request.CVPdfExportRequestDTO;
import fpt.su26.exe101.backend.modules.gallery.entity.Gallery;

public interface CVPdfExportService {
    byte[] export(CVPdfExportRequestDTO request, Gallery gallery);
}
