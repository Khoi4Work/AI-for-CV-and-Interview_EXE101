package fpt.su26.exe101.backend.modules.cv.service;

import java.util.Set;

public interface RoleTaxonomyService {
    String VERSION = "taxonomy-v1";
    Set<String> roles(String title);
    Set<String> jobRoles(String title, String content);
}
