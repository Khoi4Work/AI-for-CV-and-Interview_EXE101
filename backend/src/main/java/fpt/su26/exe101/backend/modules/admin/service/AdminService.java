package fpt.su26.exe101.backend.modules.admin.service;

import fpt.su26.exe101.backend.base.exception.*;
import fpt.su26.exe101.backend.modules.admin.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly=true)
public class AdminService {
    private final AdminRepository repository;
    public record DateRange(LocalDate from, LocalDate to) {}
    public DateRange range(LocalDate from, LocalDate to) {
        LocalDate end = to == null ? LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")) : to;
        LocalDate start = from == null ? end.minusDays(29) : from;
        if (start.isAfter(end) || ChronoUnit.DAYS.between(start,end)>365) throw new ApiException(ErrorCode.INVALID_INPUT,"Khoảng ngày phải hợp lệ và không vượt quá 366 ngày.");
        return new DateRange(start,end);
    }
    private void page(int page,int size) {
        if(page<0 || size<1 || size>100) throw new ApiException(ErrorCode.INVALID_INPUT,"Phân trang không hợp lệ.");
    }
    public AdminRepository.Page users(String search,String status,int page,int size) {
        return users(search,status,"","","",null,null,page,size);
    }
    public AdminRepository.Page users(String search,String status,String role,String provider,String plan,LocalDate from,LocalDate to,int page,int size) {
        page(page,size);
        if(!status.isEmpty() && !Set.of("ACTIVE","PENDING_VERIFICATION","SUSPENDED").contains(status)) throw new ApiException(ErrorCode.INVALID_INPUT,"Trạng thái tài khoản không hợp lệ.");
        if(!role.isEmpty() && !Set.of("ATTENDANCE","PARTNER","ADMIN").contains(role)) throw new ApiException(ErrorCode.INVALID_INPUT,"Vai trò không hợp lệ.");
        if(!provider.isEmpty() && !Set.of("LOCAL","GOOGLE").contains(provider)) throw new ApiException(ErrorCode.INVALID_INPUT,"Phương thức đăng ký không hợp lệ.");
        if(!plan.isEmpty() && !Set.of("FREE","PAID").contains(plan)) throw new ApiException(ErrorCode.INVALID_INPUT,"Nhóm gói không hợp lệ.");
        if(from!=null && to!=null && (from.isAfter(to) || ChronoUnit.DAYS.between(from,to)>365)) throw new ApiException(ErrorCode.INVALID_INPUT,"Khoảng ngày tạo không hợp lệ hoặc vượt quá 366 ngày.");
        return repository.users(search,status,role,provider,plan,from==null?null:from.atStartOfDay(),to==null?null:to.plusDays(1).atStartOfDay(),page,size);
    }
    public Map<String,Object> user(UUID id) { return repository.user(id).orElseThrow(()->new ApiException(ErrorCode.RESOURCE_NOT_FOUND)); }
    public AdminRepository.Page payments(String search,String status,String category,boolean includeTest,LocalDate from,LocalDate to,int page,int size) {
        page(page,size); DateRange range=range(from,to);
        if(!status.isEmpty() && !Set.of("PAID","PENDING","FAILED","REFUNDED").contains(status)) throw new ApiException(ErrorCode.INVALID_INPUT,"Trạng thái thanh toán không hợp lệ.");
        if(!category.isEmpty() && !Set.of("CV","INTERVIEW").contains(category)) throw new ApiException(ErrorCode.INVALID_INPUT,"Loại dịch vụ không hợp lệ.");
        return repository.payments(search,status,category,includeTest,range.from.atStartOfDay(),range.to.plusDays(1).atStartOfDay(),page,size);
    }
    public Map<String,Object> payment(UUID id) { return repository.payment(id).orElseThrow(()->new ApiException(ErrorCode.RESOURCE_NOT_FOUND)); }
    public Map<String,Object> statistics(LocalDate from,LocalDate to) {
        DateRange range=range(from,to);
        LocalDateTime start=range.from.atStartOfDay(),end=range.to.plusDays(1).atStartOfDay();
        return Map.of("from",range.from,"to",range.to,"timezone","Asia/Ho_Chi_Minh",
            "overview",repository.overview(start,end),"daily",repository.daily(start,end),"services",repository.services(start,end));
    }
}
