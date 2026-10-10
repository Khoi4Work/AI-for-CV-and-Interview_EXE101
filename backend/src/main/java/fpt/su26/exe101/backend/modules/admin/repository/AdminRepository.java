package fpt.su26.exe101.backend.modules.admin.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.*;

@Repository
@RequiredArgsConstructor
public class AdminRepository {
    private final NamedParameterJdbcTemplate jdbc;
    private static final String USER_FROM = """
        from account a left join attendance p on p.account_id=a.id
        left join partner c on c.account_id=a.id
        left join attendance_info i on i.attendance_id=p.id
        left join partner_info ci on ci.partner_id=c.id
        left join user_usage_quotas q on q.account_id=a.id
        """;
    private static final String USER_COLUMNS = """
        a.id, a.email, a.role, a.status, a.provider, a.created_at,
        coalesce(p.display_name,c.company_name,a.email) as display_name,
        coalesce(i.phone,ci.phone) as phone, coalesce(i.location,ci.location) as location,
        q.cv_plan, q.interview_plan,
        q.remaining_cv_free_credits, q.remaining_cv_middle_credits, q.remaining_cv_enhance_credits,
        q.remaining_cv_cnt as remaining_cv_count, q.remaining_int_min as remaining_interview_minutes
        """;
    private static final String PAYMENT_FROM = """
        from orders o left join account a on a.id=o.account_id
        left join payment_services s on s.id=o.service_id
        """;
    private static final String PAYMENT_COLUMNS = """
        o.id, o.account_id, a.email, o.amount, o.payment_status, o.payment_method,
        o.transaction_id, coalesce(o.ordered_at,o.created_at) as ordered_at,
        o.paid_at, o.refunded_at, o.is_test, s.name as service_name, s.category, s.package_code
        """;
    private static final RowMapper<Map<String,Object>> ROW = (rs, index) -> {
        Map<String,Object> result = new LinkedHashMap<>();
        for (int col=1; col<=rs.getMetaData().getColumnCount(); col++) {
            String label = rs.getMetaData().getColumnLabel(col).toLowerCase(Locale.ROOT);
            String[] parts = label.split("_");
            StringBuilder key = new StringBuilder(parts[0]);
            for (int j=1;j<parts.length;j++) key.append(Character.toUpperCase(parts[j].charAt(0))).append(parts[j].substring(1));
            Object value = rs.getObject(col);
            if (value instanceof java.sql.Timestamp stamp) value = stamp.toLocalDateTime();
            if (value instanceof java.sql.Date date) value = date.toLocalDate();
            result.put(key.toString(), value);
        }
        return result;
    };
    public record Page(List<Map<String,Object>> content, long totalElements, int page, int size) {}

    public Page users(String search, String status, int page, int size) {
        Map<String,Object> args = new HashMap<>();
        args.put("search", "%"+search.toLowerCase(Locale.ROOT)+"%"); args.put("status", status);
        String where = " where (lower(a.email) like :search or lower(coalesce(p.display_name,c.company_name,'')) like :search)"
                + (status.isEmpty() ? "" : " and a.status=:status");
        long total = jdbc.queryForObject("select count(*) "+USER_FROM+where, args, Long.class);
        args.put("size",size); args.put("offset",(long)page*size);
        return new Page(jdbc.query("select "+USER_COLUMNS+USER_FROM+where+" order by a.created_at desc,a.id limit :size offset :offset",args,ROW),total,page,size);
    }
    public Optional<Map<String,Object>> user(UUID id) {
        return jdbc.query("select "+USER_COLUMNS+USER_FROM+" where a.id=:id",Map.of("id",id),ROW).stream().findFirst();
    }
    public Page payments(String search, String status, String category, boolean includeTest, LocalDateTime from, LocalDateTime to, int page, int size) {
        Map<String,Object> args = range(from,to);
        args.put("search","%"+search.toLowerCase(Locale.ROOT)+"%"); args.put("status",status); args.put("category",category);
        String where = " where coalesce(o.ordered_at,o.created_at)>=:from and coalesce(o.ordered_at,o.created_at)<:to"
                + " and (lower(coalesce(a.email,'')) like :search or lower(cast(o.id as varchar)) like :search or lower(coalesce(o.transaction_id,'')) like :search)"
                + (includeTest ? "" : " and o.is_test=false")
                + (status.isEmpty() ? "" : " and o.payment_status=:status")
                + (category.isEmpty() ? "" : " and s.category=:category");
        long total = jdbc.queryForObject("select count(*) "+PAYMENT_FROM+where,args,Long.class);
        args.put("size",size);args.put("offset",(long)page*size);
        return new Page(jdbc.query("select "+PAYMENT_COLUMNS+PAYMENT_FROM+where+" order by coalesce(o.ordered_at,o.created_at) desc,o.id limit :size offset :offset",args,ROW),total,page,size);
    }
    public Optional<Map<String,Object>> payment(UUID id) {
        return jdbc.query("select "+PAYMENT_COLUMNS+PAYMENT_FROM+" where o.id=:id",Map.of("id",id),ROW).stream().findFirst();
    }
    public Map<String,Object> overview(LocalDateTime from, LocalDateTime to) {
        Map<String,Object> args = range(from,to);
        Map<String,Object> result = new LinkedHashMap<>();
        result.put("totalUsers",jdbc.queryForObject("select count(*) from account",Map.of(),Long.class));
        result.put("newUsers",jdbc.queryForObject("select count(*) from account where created_at>=:from and created_at<:to",args,Long.class));
        result.putAll(jdbc.query("""
            select count(*) as total_orders,
            coalesce(sum(case when payment_status='PAID' then 1 else 0 end),0) as paid_orders,
            coalesce(sum(case when payment_status='PENDING' then 1 else 0 end),0) as pending_orders,
            coalesce(sum(case when payment_status='FAILED' then 1 else 0 end),0) as failed_orders,
            coalesce(sum(case when payment_status='REFUNDED' then 1 else 0 end),0) as refunded_orders
            from orders where is_test=false and coalesce(ordered_at,created_at)>=:from and coalesce(ordered_at,created_at)<:to
            """,args,ROW).getFirst());
        result.put("grossRevenue",jdbc.queryForObject("select coalesce(sum(amount),0) from orders where is_test=false and payment_status in ('PAID','REFUNDED') and paid_at>=:from and paid_at<:to",args,java.math.BigDecimal.class));
        result.put("refundAmount",jdbc.queryForObject("select coalesce(sum(amount),0) from orders where is_test=false and payment_status='REFUNDED' and refunded_at>=:from and refunded_at<:to",args,java.math.BigDecimal.class));
        result.putAll(jdbc.query("select count(*) as undated_paid_orders,coalesce(sum(amount),0) as undated_paid_amount from orders where is_test=false and payment_status in ('PAID','REFUNDED') and paid_at is null",Map.of(),ROW).getFirst());
        result.putAll(jdbc.query("select count(*) as undated_refunded_orders,coalesce(sum(amount),0) as undated_refunded_amount from orders where is_test=false and payment_status='REFUNDED' and refunded_at is null",Map.of(),ROW).getFirst());
        return result;
    }
    public List<Map<String,Object>> daily(LocalDateTime from, LocalDateTime to) {
        return jdbc.query("""
            select cast(paid_at as date) as date, sum(amount) as revenue, count(*) as orders
            from orders where is_test=false and payment_status in ('PAID','REFUNDED') and paid_at>=:from and paid_at<:to
            group by cast(paid_at as date) order by cast(paid_at as date)
            """,range(from,to),ROW);
    }
    public List<Map<String,Object>> services(LocalDateTime from, LocalDateTime to) {
        return jdbc.query("""
            select coalesce(s.category,'UNKNOWN') as category,coalesce(s.package_code,'UNKNOWN') as package_code,
            sum(o.amount) as revenue,count(*) as orders from orders o left join payment_services s on s.id=o.service_id
            where o.is_test=false and o.payment_status in ('PAID','REFUNDED') and o.paid_at>=:from and o.paid_at<:to
            group by s.category,s.package_code order by sum(o.amount) desc
            """,range(from,to),ROW);
    }
    private Map<String,Object> range(LocalDateTime from, LocalDateTime to) {
        return new HashMap<>(Map.of("from",from,"to",to));
    }
}
