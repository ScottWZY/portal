# OAuth2 与 JWT

## ⭐ 面试重点速览

| 知识模块 | 重点内容 | 面试频率 |
|----------|----------|----------|
| OAuth2 四种授权模式 | 授权码模式、密码模式、客户端凭证模式、隐式模式 | 极高 |
| OAuth2.1 新变化 | PKCE 必选、隐式模式废弃、设备授权码 | 中高 |
| JWT 结构 | Header / Payload / Signature 三段式结构 | 极高 |
| JWT 签发与验证 | HMAC 签名、RSA 签名、验签流程 | 极高 |
| Token 刷新机制 | Refresh Token + Access Token 双 Token | 高 |
| Spring Authorization Server | 授权服务器搭建、核心配置 | 中高 |
| 前后端分离 JWT 实战 | JWT 工具类、过滤器、Security 配置 | 极高 |

---

## 一、⭐ OAuth2 四种授权模式

### 1.1 OAuth2 是什么？

OAuth2 是一个**授权协议**（不是认证协议），允许第三方应用在**不获取用户密码**的情况下，获得用户授权访问其资源。核心角色：

```mermaid
graph TB
    RO[Resource Owner<br/>资源所有者<br/>用户] -->|授权| Client[Client<br/>第三方应用]
    Client -->|出示令牌| AS[Authorization Server<br/>授权服务器]
    Client -->|访问资源| RS[Resource Server<br/>资源服务器]
    AS -->|颁发令牌| Client
    AS -->|验证令牌| RS
```

| 角色 | 说明 | 示例 |
|------|------|------|
| **Resource Owner** | 资源所有者（用户） | 使用微信登录的用户 |
| **Client** | 第三方应用 | 你的网站/App |
| **Authorization Server** | 授权服务器（颁发 Token） | 微信开放平台认证服务器 |
| **Resource Server** | 资源服务器（存储用户数据） | 微信用户信息 API |

### 1.2 授权码模式（Authorization Code）------ 最安全、最推荐

**适用场景**：有后端服务的 Web 应用，需要用户登录。

```mermaid
sequenceDiagram
    participant User as 用户浏览器
    participant Client as 第三方应用
    participant Auth as 授权服务器
    participant RS as 资源服务器

    User->>Client: 1. 点击"微信登录"
    Client->>User: 2. 302 重定向到授权页面
    User->>Auth: 3. 用户授权确认
    Auth->>User: 4. 302 重定向 + Authorization Code
    User->>Client: 5. 携带 Authorization Code 回调
    Client->>Auth: 6. Code + Client Secret 换取 Access Token
    Auth-->>Client: 7. Access Token + Refresh Token
    Client->>RS: 8. 使用 Access Token 获取用户信息
    RS-->>Client: 9. 返回用户信息
```

**为什么授权码模式最安全？**
- Access Token **不经过浏览器**，只在服务端交换
- 即使用户截获了 Authorization Code，没有 Client Secret 也无法换取 Token
- Authorization Code 一次性使用，用完即失效

### 1.3 密码模式（Password）------ 已废弃（OAuth2.1）

**适用场景**：自家应用的前后端分离架构（历史方案）。

```java
// 密码模式流程（仅用于理解，已废弃）
// 1. 用户直接提供用户名密码给第三方应用
// 2. 第三方应用携带用户名密码去授权服务器换取 Token
// POST /oauth/token?grant_type=password&username=xxx&password=xxx
```

::: danger 密码模式已废弃
OAuth2.1 中密码模式已被正式移除，原因：
1. 用户密码直接暴露给第三方应用，安全风险极高
2. 无法区分是用户本人操作还是第三方应用的操作
3. 替代方案：使用授权码模式 + PKCE
:::

### 1.4 客户端凭证模式（Client Credentials）

**适用场景**：服务间通信、机器对机器通信（无用户参与）。

```java
// 微服务 A 调用微服务 B 的 API
// POST /oauth/token?grant_type=client_credentials
// Header: Authorization: Basic base64(client_id:client_secret)

// 典型场景：定时任务、数据同步、内部 API 调用
```

```mermaid
sequenceDiagram
    participant ServiceA as 微服务 A
    participant Auth as 授权服务器
    participant ServiceB as 微服务 B

    ServiceA->>Auth: 1. Client ID + Secret 请求 Token
    Auth-->>ServiceA: 2. 返回 Access Token
    ServiceA->>ServiceB: 3. 携带 Token 调用 API
    ServiceB->>Auth: 4. 验证 Token
    Auth-->>ServiceB: 5. Token 有效
    ServiceB-->>ServiceA: 6. 返回数据
```

### 1.5 隐式模式（Implicit）------ 已废弃（OAuth2.1）

**适用场景**：纯前端 SPA（历史方案，已废弃）。

```java
// 隐式模式流程（已废弃）
// Token 直接通过 URL Fragment 返回给浏览器
// 存在 Token 泄露风险（URL 可能被日志记录、Referer 头泄露等）
```

### 1.6 ⭐ 四种模式对比

| 授权模式 | 适用场景 | 安全性 | Token 经浏览器 | OAuth2.1 状态 |
|----------|----------|--------|---------------|---------------|
| **授权码模式** | 有后端的 Web 应用 | 最高 | 否（Code 经过，Token 不经过） | **推荐** |
| **密码模式** | 自家应用（历史） | 低（密码暴露） | 否 | **已移除** |
| **客户端凭证** | 服务间通信 | 高 | 否 | **保留** |
| **隐式模式** | 纯前端 SPA（历史） | 低（Token 泄露） | 是 | **已移除** |
| **授权码 + PKCE** | 移动端/SPA | 高 | 否 | **新增推荐** |

---

## 二、OAuth2.1 新变化

### 2.1 核心变化一览

| 变化 | 说明 |
|------|------|
| **PKCE 必选** | 所有使用授权码模式的客户端，**必须**使用 PKCE（Proof Key for Code Exchange） |
| **隐式模式废弃** | 直接废弃，使用授权码模式 + PKCE 替代 |
| **密码模式废弃** | 直接废弃，不再允许直接使用用户密码换取 Token |
| **Refresh Token 安全性增强** | 推荐使用发送者约束（Sender-Constrained）Token 或一次性 Refresh Token |
| **设备授权码** | 新增 Device Authorization Grant，用于 IoT、电视等无浏览器设备 |

### 2.2 PKCE（Proof Key for Code Exchange）详解

PKCE 是授权码模式的增强，防止**授权码拦截攻击**：

```java
/**
 * PKCE 流程
 * 1. 客户端生成 code_verifier（随机字符串，43-128 字符）
 * 2. 客户端计算 code_challenge = SHA256(code_verifier)，Base64URL 编码
 * 3. 授权请求时发送 code_challenge
 * 4. 换取 Token 时发送 code_verifier
 * 5. 授权服务器验证：SHA256(code_verifier) == code_challenge
 */
public class PKCEDemo {

    public static void main(String[] args) throws Exception {
        // 1. 生成 code_verifier
        String codeVerifier = generateCodeVerifier();
        System.out.println("code_verifier: " + codeVerifier);

        // 2. 计算 code_challenge
        String codeChallenge = generateCodeChallenge(codeVerifier);
        System.out.println("code_challenge: " + codeChallenge);

        // 3. 授权请求（携带 code_challenge）
        // GET /oauth2/authorize?
        //   response_type=code&
        //   client_id=myapp&
        //   code_challenge={codeChallenge}&
        //   code_challenge_method=S256

        // 4. 换取 Token（携带 code_verifier）
        // POST /oauth2/token
        //   grant_type=authorization_code&
        //   code={authorizationCode}&
        //   code_verifier={codeVerifier}
    }

    private static String generateCodeVerifier() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String generateCodeChallenge(String codeVerifier) throws Exception {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        byte[] digest = md.digest(codeVerifier.getBytes(StandardCharsets.US_ASCII));
        return Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
    }
}
```

::: tip PKCE 为什么能防止授权码拦截攻击？
攻击者即使截获了 Authorization Code，但没有 `code_verifier`（只有客户端自己知道），无法通过授权服务器的验证，因此无法换取 Token。PKCE 的本质是：**在授权码和 Token 之间增加了一道仅客户端知道的验证**。
:::

---

## 三、⭐ JWT 结构与签发验证流程

### 3.1 JWT 是什么？

**JWT（JSON Web Token）** 是一种紧凑、URL 安全的令牌格式，用于在各方之间传递声明（Claims）。它由三部分组成，用 `.` 分隔：

```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ6aGFuZ3NhbiIsImlhdCI6MTcwMDAwMDAwMH0.abc123def456
|______ Header ______|_________ Payload __________|_____ Signature ____|
```

### 3.2 JWT 三段式结构详解

```java
// ====== 1. Header（头部） ======
// Base64URL 编码的 JSON，包含算法和令牌类型
{
  "alg": "HS256",   // 签名算法（HMAC-SHA256）
  "typ": "JWT"      // 令牌类型
}

// ====== 2. Payload（载荷） ======
// Base64URL 编码的 JSON，包含声明（Claims）
{
  "sub": "zhangsan",           // 主题（Subject，通常是用户ID）
  "iat": 1700000000,           // 签发时间（Issued At）
  "exp": 1700086400,           // 过期时间（Expiration）
  "iss": "my-auth-server",     // 签发者（Issuer）
  "aud": "my-resource-server", // 受众（Audience）
  "roles": ["ROLE_USER"],      // 自定义声明：角色
  "perms": ["user:read"]       // 自定义声明：权限
}
// ⚠️ JWT 的 Payload 只是 Base64URL 编码，不是加密！
// 任何人都可以解码看到内容，所以不要放敏感信息（如密码）

// ====== 3. Signature（签名） ======
// 用于验证 JWT 的完整性和来源
// HMAC 方式：HMAC-SHA256(base64Url(header) + "." + base64Url(payload), secret)
// RSA 方式：RSA-SHA256(base64Url(header) + "." + base64Url(payload), privateKey)
```

### 3.3 ⭐ JWT 签发与验证流程（Mermaid 图）

```mermaid
sequenceDiagram
    participant Client as 客户端
    participant AuthSrv as 认证服务器
    participant RS as 资源服务器

    Note over Client,RS: === JWT 签发流程 ===
    Client->>AuthSrv: 1. POST /login (username + password)
    AuthSrv->>AuthSrv: 2. 验证用户名密码
    AuthSrv->>AuthSrv: 3. 构建 JWT Payload<br/>(sub, iat, exp, roles, perms)
    AuthSrv->>AuthSrv: 4. 签名：HMAC-SHA256(header.payload, secret)
    AuthSrv-->>Client: 5. 返回 Access Token + Refresh Token

    Note over Client,RS: === JWT 验证流程 ===
    Client->>RS: 6. GET /api/users (Authorization: Bearer xxx)
    RS->>RS: 7. 解析 JWT：Header.Payload.Signature
    RS->>RS: 8. 验证签名：HMAC-SHA256(header.payload, secret) == Signature
    RS->>RS: 9. 验证有效期：exp > now
    RS->>RS: 10. 提取用户信息、权限
    RS-->>Client: 11. 返回数据
```

### 3.4 JWT 完整工具类

```java
/**
 * JWT 工具类 ------ 支持 HMAC-SHA256 签名
 * 核心功能：生成 Token、验证 Token、解析 Token、刷新 Token
 */
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret:MySecretKeyForJWTWithAtLeast256BitsLengthForHS256!!}")
    private String secretKey;

    @Value("${jwt.access-token-expiration:3600000}")  // 1 小时
    private long accessTokenExpiration;

    @Value("${jwt.refresh-token-expiration:604800000}") // 7 天
    private long refreshTokenExpiration;

    // ====== 生成 Access Token ======
    public String generateAccessToken(Authentication authentication) {
        SecurityUser user = (SecurityUser) authentication.getPrincipal();
        return Jwts.builder()
                .subject(user.getUserId().toString())        // sub：用户ID
                .claim("username", user.getUsername())       // 自定义：用户名
                .claim("roles", user.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .filter(a -> a.startsWith("ROLE_"))
                        .toList())                           // 自定义：角色列表
                .issuedAt(new Date())                        // iat：签发时间
                .expiration(new Date(System.currentTimeMillis()
                        + accessTokenExpiration))            // exp：过期时间
                .signWith(getSigningKey())                   // 签名
                .compact();
    }

    // ====== 生成 Refresh Token ======
    public String generateRefreshToken(Authentication authentication) {
        SecurityUser user = (SecurityUser) authentication.getPrincipal();
        return Jwts.builder()
                .subject(user.getUserId().toString())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis()
                        + refreshTokenExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    // ====== 从 Token 中提取用户ID ======
    public Long getUserIdFromToken(String token) {
        Claims claims = parseClaims(token);
        return Long.parseLong(claims.getSubject());
    }

    // ====== 验证 Token 是否有效 ======
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // JwtException：签名错误、过期、格式错误等
            // IllegalArgumentException：token 为空
            return false;
        }
    }

    // ====== 刷新 Access Token ======
    public String refreshAccessToken(String refreshToken) {
        if (!validateToken(refreshToken)) {
            throw new JwtException("Refresh Token 无效或已过期");
        }
        Claims claims = parseClaims(refreshToken);
        return Jwts.builder()
                .subject(claims.getSubject())
                .claim("username", claims.get("username"))
                .claim("roles", claims.get("roles"))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis()
                        + accessTokenExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    // ====== 解析 Token 获取 Claims ======
    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // ====== 获取签名密钥 ======
    private SecretKey getSigningKey() {
        byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
```

### 3.5 JWT 的优缺点

| 优点 | 缺点 |
|------|------|
| **无状态**：服务端无需存储 Session | **无法主动失效**：签发后服务端无法主动撤销 |
| **跨域友好**：不依赖 Cookie | **Payload 不加密**：敏感信息不能放 JWT 中 |
| **适合分布式**：各服务独立验证 | **Token 体积大**：比 Session ID 大很多 |
| **自包含**：Token 自带用户信息 | **续期复杂**：需要 Refresh Token 机制 |

::: danger JWT 不能主动失效的问题
JWT 一旦签发，在过期之前无法主动撤销。解决方案：
1. **短有效期 Access Token + 长有效期 Refresh Token**：Access Token 过期后用 Refresh Token 换取新的
2. **Token 黑名单**：在 Redis 中维护已撤销 Token 的列表
3. **版本号机制**：在用户表中维护 token_version，签发 JWT 时携带，修改密码时递增版本号
:::

---

## 四、Token 刷新机制

### 4.1 双 Token 机制

```mermaid
sequenceDiagram
    participant Client as 客户端
    participant Server as 后端服务
    participant Redis as Redis

    Note over Client,Redis: === 正常请求 ===
    Client->>Server: 请求 + Access Token
    Server->>Server: 验证 Access Token（有效）
    Server-->>Client: 返回数据

    Note over Client,Redis: === Access Token 过期 ===
    Client->>Server: 请求 + 过期 Access Token
    Server-->>Client: 401 Unauthorized
    Client->>Server: POST /refresh + Refresh Token
    Server->>Server: 验证 Refresh Token
    Server->>Redis: 检查 Refresh Token 是否在黑名单
    Redis-->>Server: 未被撤销
    Server-->>Client: 新的 Access Token + 新的 Refresh Token

    Note over Client,Redis: === 旧 Refresh Token 失效（防止重放攻击） ===
    Server->>Redis: 将旧 Refresh Token 加入黑名单
```

### 4.2 刷新 Token 的 Controller

```java
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final StringRedisTemplate redisTemplate;

    // ====== 登录 ======
    @PostMapping("/login")
    public Result<LoginResponse> login(@RequestBody @Valid LoginRequest request) {
        // 1. 认证
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(), request.getPassword()));

        // 2. 生成双 Token
        String accessToken = jwtTokenProvider.generateAccessToken(authentication);
        String refreshToken = jwtTokenProvider.generateRefreshToken(authentication);

        // 3. Refresh Token 存入 Redis（用于后续失效管理）
        SecurityUser user = (SecurityUser) authentication.getPrincipal();
        redisTemplate.opsForValue().set(
                "refresh_token:" + user.getUserId(),
                refreshToken,
                Duration.ofDays(7));

        return Result.ok(new LoginResponse(accessToken, refreshToken));
    }

    // ====== 刷新 Token ======
    @PostMapping("/refresh")
    public Result<LoginResponse> refresh(@RequestBody @Valid RefreshRequest request) {
        // 1. 验证 Refresh Token
        if (!jwtTokenProvider.validateToken(request.getRefreshToken())) {
            return Result.fail(401, "Refresh Token 无效或已过期");
        }

        Long userId = jwtTokenProvider.getUserIdFromToken(request.getRefreshToken());

        // 2. 检查 Refresh Token 是否与 Redis 中一致（防重放）
        String storedToken = redisTemplate.opsForValue()
                .get("refresh_token:" + userId);
        if (!request.getRefreshToken().equals(storedToken)) {
            // ⚠️ Refresh Token 被重复使用，可能是攻击行为
            // 立即清除该用户的所有 Refresh Token，强制重新登录
            redisTemplate.delete("refresh_token:" + userId);
            return Result.fail(401, "Refresh Token 已被使用，请重新登录");
        }

        // 3. 生成新的双 Token（旧的 Refresh Token 被替换）
        String newAccessToken = jwtTokenProvider.refreshAccessToken(
                request.getRefreshToken());
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(
                SecurityContextHolder.getContext().getAuthentication());

        // 4. 更新 Redis 中的 Refresh Token
        redisTemplate.opsForValue().set(
                "refresh_token:" + userId,
                newRefreshToken,
                Duration.ofDays(7));

        return Result.ok(new LoginResponse(newAccessToken, newRefreshToken));
    }
}
```

---

## 五、Spring Authorization Server 搭建

### 5.1 核心依赖

```xml
<!-- Spring Authorization Server（OAuth2 授权服务器） -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-authorization-server</artifactId>
</dependency>
```

### 5.2 授权服务器核心配置

```java
@Configuration
@RequiredArgsConstructor
public class AuthorizationServerConfig {

    private final RegisteredClientRepository registeredClientRepository;

    // ====== 安全过滤器链（授权服务器端点） ======
    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public SecurityFilterChain authServerFilterChain(HttpSecurity http) throws Exception {
        // 应用 OAuth2 授权服务器默认配置
        OAuth2AuthorizationServerConfiguration.applyDefaultSecurity(http);
        return http
            .formLogin(Customizer.withDefaults())
            .build();
    }

    // ====== 注册客户端（内存存储，生产环境建议用数据库） ======
    @Bean
    public RegisteredClientRepository registeredClientRepository() {
        // 注册一个客户端
        RegisteredClient client = RegisteredClient
            .withId(UUID.randomUUID().toString())
            .clientId("my-client")                          // 客户端ID
            .clientSecret("{bcrypt}$2a$10$xxx")             // 客户端密钥（加密）
            .clientAuthenticationMethod(
                    ClientAuthenticationMethod.CLIENT_SECRET_BASIC) // 客户端认证方式
            .authorizationGrantType(
                    AuthorizationGrantType.AUTHORIZATION_CODE)      // 授权码模式
            .authorizationGrantType(
                    AuthorizationGrantType.REFRESH_TOKEN)           // 支持刷新 Token
            .authorizationGrantType(
                    AuthorizationGrantType.CLIENT_CREDENTIALS)      // 客户端凭证模式
            .redirectUri("http://127.0.0.1:8080/login/oauth2/code/my-client")
            .redirectUri("http://127.0.0.1:8080/authorized")
            .scope("openid")                             // OpenID Connect 作用域
            .scope("profile")
            .scope("read")
            .scope("write")
            .clientSettings(
                ClientSettings.builder()
                    .requireAuthorizationConsent(true)   // 需要用户授权确认
                    .build()
            )
            .tokenSettings(
                TokenSettings.builder()
                    .accessTokenTimeToLive(Duration.ofHours(1))   // Access Token 1小时
                    .refreshTokenTimeToLive(Duration.ofDays(30))  // Refresh Token 30天
                    .reuseRefreshTokens(false)                     // 不重复使用 Refresh Token
                    .build()
            )
            .build();

        return new InMemoryRegisteredClientRepository(client);
    }

    // ====== JWT 编码器 ======
    @Bean
    public JWKSource<SecurityContext> jwkSource() {
        // 生成 RSA 密钥对
        KeyPair keyPair = generateRsaKey();
        RSAPublicKey publicKey = (RSAPublicKey) keyPair.getPublic();
        RSAPrivateKey privateKey = (RSAPrivateKey) keyPair.getPrivate();

        // 构造 JWK
        RSAKey rsaKey = new RSAKey.Builder(publicKey)
                .privateKey(privateKey)
                .keyID(UUID.randomUUID().toString())
                .build();

        JWKSet jwkSet = new JWKSet(rsaKey);
        return new ImmutableJWKSet<>(jwkSet);
    }

    private static KeyPair generateRsaKey() {
        try {
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
            keyPairGenerator.initialize(2048);
            return keyPairGenerator.generateKeyPair();
        } catch (Exception ex) {
            throw new IllegalStateException(ex);
        }
    }

    // ====== JWT 解码器（供资源服务器使用） ======
    @Bean
    public JwtDecoder jwtDecoder(JWKSource<SecurityContext> jwkSource) {
        return OAuth2AuthorizationServerConfiguration.jwtDecoder(jwkSource);
    }
}
```

### 5.3 OAuth2 授权端点

| 端点 | 路径 | 说明 |
|------|------|------|
| 授权端点 | `/oauth2/authorize` | 用户授权确认页面 |
| Token 端点 | `/oauth2/token` | 换取 Token |
| Token 内省端点 | `/oauth2/introspect` | 验证 Token 是否有效 |
| Token 撤销端点 | `/oauth2/revoke` | 撤销 Token |
| JWK Set 端点 | `/oauth2/jwks` | 公钥信息（供资源服务器验证 JWT 签名） |
| OIDC 用户信息 | `/userinfo` | OpenID Connect 用户信息端点 |

---

## 六、前后端分离 JWT 认证最佳实践

### 6.1 JWT 认证过滤器

```java
/**
 * JWT 认证过滤器
 * 每次请求时从 Authorization 头提取 Token，验证并设置 SecurityContext
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        // 1. 从请求头提取 Token
        String token = extractToken(request);

        if (token != null && jwtTokenProvider.validateToken(token)) {
            // 2. 从 Token 中获取用户ID
            Long userId = jwtTokenProvider.getUserIdFromToken(token);

            // 3. 加载用户信息
            UserDetails userDetails = userDetailsService
                    .loadUserByUsername(userId.toString());

            // 4. 构造 Authentication 对象
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());

            // 5. 设置到 SecurityContext
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        // 6. 继续过滤器链
        filterChain.doFilter(request, response);

        // 7. ⚠️ 请求结束后清除 SecurityContext（防止 ThreadLocal 泄漏）
        SecurityContextHolder.clearContext();
    }

    /**
     * 从 Authorization 头提取 Bearer Token
     */
    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
```

### 6.2 SecurityConfig 完整配置

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 前后端分离：关闭 CSRF
            .csrf(csrf -> csrf.disable())

            // 前后端分离：无状态会话
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // 白名单 + 权限控制
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/login", "/api/auth/register").permitAll()
                .requestMatchers("/api/auth/refresh").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .anyRequest().authenticated()
            )

            // 添加 JWT 过滤器
            .addFilterBefore(jwtAuthFilter,
                    UsernamePasswordAuthenticationFilter.class)

            // 异常处理
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((req, res, e) -> {
                    res.setContentType("application/json;charset=UTF-8");
                    res.setStatus(401);
                    res.getWriter().write("{\"code\":401,\"msg\":\"请先登录\"}");
                })
                .accessDeniedHandler((req, res, e) -> {
                    res.setContentType("application/json;charset=UTF-8");
                    res.setStatus(403);
                    res.getWriter().write("{\"code\":403,\"msg\":\"权限不足\"}");
                })
            );

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }
}
```

### 6.3 前端存储 Token 的最佳实践

| 存储方式 | 安全性 | XSS 风险 | CSRF 风险 | 推荐度 |
|----------|--------|----------|-----------|--------|
| **localStorage** | 低 | 高（JS 可直接读取） | 无 | ❌ 不推荐 |
| **sessionStorage** | 低 | 高 | 无 | ❌ 不推荐 |
| **Cookie（HttpOnly + Secure）** | 中 | 低（JS 不可读） | 高（需配合 CSRF Token） | ⭐⭐ |
| **内存变量 + Refresh Token Cookie** | 高 | 低 | 低 | ⭐⭐⭐ 推荐 |

```javascript
// 推荐方案：Access Token 存内存，Refresh Token 存 HttpOnly Cookie
// 1. 登录后，Access Token 存在 JS 内存变量中（页面刷新后需要重新获取）
let accessToken = null;

// 2. Refresh Token 由后端通过 Set-Cookie 设置 HttpOnly Cookie
// 3. 页面刷新后，前端自动请求 /api/auth/refresh 获取新的 Access Token
```

---

## ⭐ 面试高频问题汇总

### Q1：OAuth2 的四种授权模式分别适用于什么场景？

| 模式 | 适用场景 | 安全性 |
|------|----------|--------|
| **授权码模式** | 有后端的 Web 应用 | 最高 |
| **客户端凭证** | 服务间通信、机器对机器 | 高 |
| **密码模式** | 自家应用（已废弃） | 低 |
| **隐式模式** | 纯前端 SPA（已废弃） | 低 |

OAuth2.1 推荐：授权码模式 + PKCE 用于所有场景。

### Q2：JWT 的三段式结构是什么？每段包含什么？

```
Header.Payload.Signature
```

- **Header**：算法类型（alg）和令牌类型（typ），如 `{"alg":"HS256","typ":"JWT"}`
- **Payload**：声明（Claims），包含标准声明（sub、iat、exp、iss）和自定义声明（roles、perms）
- **Signature**：签名，用于验证完整性。HMAC 方式：`HMAC-SHA256(header.payload, secret)`；RSA 方式：`RSA-SHA256(header.payload, privateKey)`

### Q3：JWT 如何防止被篡改？

JWT 的第三部分 **Signature（签名）** 保证了完整性。验证过程：
1. 服务端收到 JWT 后，取 Header + Payload 部分
2. 使用相同算法和密钥（或公钥）重新计算签名
3. 比较计算的签名与 JWT 中的签名是否一致
4. 任何对 Header 或 Payload 的篡改都会导致签名不匹配

### Q4：Access Token 和 Refresh Token 的区别是什么？为什么需要两个 Token？

| 维度 | Access Token | Refresh Token |
|------|-------------|---------------|
| 有效期 | 短（通常 15 分钟 ~ 2 小时） | 长（通常 7 天 ~ 30 天） |
| 使用频率 | 每次请求都携带 | 仅在 Access Token 过期时使用 |
| 暴露风险 | 高（频繁传输） | 低（偶尔使用） |
| 存储位置 | 内存 | HttpOnly Cookie |

双 Token 机制的核心价值：**用短生命周期的 Access Token 降低泄露风险，用长生命周期的 Refresh Token 减少用户重复登录**。

### Q5：JWT 登陆后，如何实现"踢人下线"功能？

JWT 天然不支持主动失效，需要额外机制：
1. **Token 黑名单**（Redis）：将需要踢下线的用户的 Token 加入黑名单，每次请求校验
2. **Token 版本号**：用户表中维护 `token_version`，签发 JWT 时携带，踢人时递增版本号
3. **短有效期 Access Token**：Access Token 设为 5-15 分钟，踢人后最多 15 分钟内生效

### Q6：Spring Authorization Server 和传统的 Spring Security OAuth2 有什么区别？

| 维度 | Spring Security OAuth2（旧） | Spring Authorization Server（新） |
|------|---------------------------|----------------------------------|
| 状态 | 已停止维护 | Spring 官方维护 |
| 协议支持 | OAuth2 | OAuth2 + OAuth2.1 + OpenID Connect 1.0 |
| 配置方式 | `@EnableAuthorizationServer` | `OAuth2AuthorizationServerConfiguration` |
| Spring Boot 版本 | 2.x | 3.x |

### Q7：为什么说"JWT 不是加密的"？

JWT 的三段式结构使用的是 **Base64URL 编码**，不是加密。任何人都可以解码 Header 和 Payload 看到内容。**切勿在 JWT 的 Payload 中存放密码、身份证号等敏感信息**。如果需要加密，应该使用 **JWE（JSON Web Encryption）**，而非普通的 JWT（JWS - JSON Web Signature）。

---

## 面试追问环节

**Q：如果让你设计一个单点登录（SSO）系统，你会怎么做？**

核心设计：
1. **统一认证中心**（CAS 服务器）：处理所有登录请求，发放全局 Token
2. **JWT + 公钥验证**：认证中心用私钥签名，各子系统用公钥验证
3. **登录流程**：用户访问子系统 → 302 跳转到认证中心 → 登录成功 → 发放 JWT → 回调子系统
4. **登出流程**：子系统通知认证中心 → 认证中心通过 Token 黑名单实现全局登出

**Q：PKCE 和 state 参数分别是干什么的？容易混淆吗？**

| 参数 | 作用 | 防护目标 |
|------|------|----------|
| **PKCE** | 防止授权码拦截攻击 | 攻击者截获授权码后无法换取 Token |
| **state** | 防止 CSRF 攻击 | 验证回调请求是否由客户端自己发起 |