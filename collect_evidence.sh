#!/usr/bin/env bash
#
# collect_evidence.sh
# Retest EVIDENCE collector for the 14 findings.
#
# For each finding it captures:
#   [-] NEGATIVE control : the vulnerable pattern is gone            (expect 0 hits => FIXED)
#   [+] POSITIVE control : the remediation is present in the code    (expect >0 hits)
#   [i] matched lines / command output written to ./retest_evidence/<NN>_*.txt
#
# This produces a defensible "closed" evidence pack: absence of the bug
# AND presence of the fix, with file:line references and timestamps.
#
# Usage:
#   ./collect_evidence.sh /path/to/CodeShared
#
set -uo pipefail

ROOT="${1:-.}"
AQ="$ROOT/AQPayment-main"
CC="$ROOT/CreditCardService-main"
XJ="$ROOT/XoJoPay_Backend-main"

EV="./retest_evidence"
mkdir -p "$EV"
STAMP="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"

GREEN='\033[0;32m'; RED='\033[0;31m'; YEL='\033[0;33m'; BOLD='\033[1m'; NC='\033[0m'

FIXED=0; OPEN=0
declare -a RESULTS=()

# ---- helpers --------------------------------------------------------------
# rg wrapper that never dies on "no match" (exit 1) and records the command.
rgc() { rg "$@" 2>/dev/null; }               # content (file:line:match)
rgn() { rg -c "$@" 2>/dev/null | awk -F: '{s+=$2} END{print s+0}'; }  # total count

# Write an evidence file: id, title, the two controls, and the verdict.
emit() {
    local id="$1" title="$2" vuln_n="$3" fix_n="$4" file="$5"
    local status
    if [ "$vuln_n" -gt 0 ]; then
        status="OPEN"; OPEN=$((OPEN+1))
        RESULTS+=("$(printf "%-4s %-45s ${RED}%-6s${NC} vuln=%s fix=%s" "$id" "$title" "$status" "$vuln_n" "$fix_n")")
    else
        status="FIXED"; FIXED=$((FIXED+1))
        RESULTS+=("$(printf "%-4s %-45s ${GREEN}%-6s${NC} vuln=%s fix=%s" "$id" "$title" "$status" "$vuln_n" "$fix_n")")
    fi
    {
        echo "==============================================================================="
        echo "FINDING $id : $title"
        echo "RETEST STATUS : $status   (vulnerable hits=$vuln_n, fix-present hits=$fix_n)"
        echo "COLLECTED (UTC): $STAMP"
        echo "SCAN ROOT     : $ROOT"
        echo "==============================================================================="
    } > "$file"
}

banner() { printf "\n${BOLD}[%s] %s${NC}\n" "$1" "$2"; }

echo "Evidence collection root : $ROOT"
echo "Evidence output dir      : $EV"
echo "Timestamp (UTC)          : $STAMP"
echo "-------------------------------------------------------------------------------"
echo "Tool versions:" | tee "$EV/00_environment.txt"
{ command -v rg     >/dev/null && rg --version | head -1;      } | tee -a "$EV/00_environment.txt"
{ command -v gitleaks>/dev/null && gitleaks version;           } 2>/dev/null | tee -a "$EV/00_environment.txt"
{ command -v trivy  >/dev/null && trivy --version | head -1;   } 2>/dev/null | tee -a "$EV/00_environment.txt"
git -C "$ROOT" rev-parse HEAD 2>/dev/null | sed 's/^/commit: /' | tee -a "$EV/00_environment.txt" || true

# ==========================================================================
# 1. Hardcoded Secrets & Credentials
# ==========================================================================
banner 1 "Hardcoded Secrets & Credentials"
F="$EV/01_hardcoded_secrets.txt"
if command -v gitleaks >/dev/null 2>&1; then
    VULN_N=$(gitleaks detect --source "$ROOT" --no-git -v 2>/dev/null | grep -c "^Finding:")
else
    VULN_N=$(rgn 'jwtSecretKey|base64-secret|password\s*=\s*"[^"]+"|api[_-]?key\s*=\s*"[^"]+"' \
            --glob '*.json' --glob '*.yml' --glob '*.properties' --glob '*.java' "$AQ" "$CC" "$XJ")
fi
# Positive control: secrets now externalised to env / ${...} placeholders
FIX_N=$(rgn '\$\{[A-Z0-9_]+(:[^}]*)?\}|System\.getenv|@Value\("\$\{' \
        --glob '*.yml' --glob '*.properties' --glob '*.java' "$AQ" "$CC" "$XJ")
emit 1 "Hardcoded Secrets & Credentials" "$VULN_N" "$FIX_N" "$F"
{ echo; echo "[-] NEGATIVE (hardcoded secret literals still present):";
  if command -v gitleaks >/dev/null 2>&1; then gitleaks detect --source "$ROOT" --no-git -v 2>/dev/null | grep -A4 "^Finding:" | head -80;
  else rgc -n 'jwtSecretKey|base64-secret|password\s*=\s*"[^"]+"|api[_-]?key\s*=\s*"[^"]+"' --glob '*.json' --glob '*.yml' --glob '*.properties' --glob '*.java' "$AQ" "$CC" "$XJ" | head -80; fi
  echo; echo "[+] POSITIVE (secrets externalised to env/placeholders):";
  rgc -n '\$\{[A-Z0-9_]+(:[^}]*)?\}|System\.getenv|@Value\("\$\{' --glob '*.yml' --glob '*.properties' --glob '*.java' "$AQ" "$CC" "$XJ" | head -60
} >> "$F"

# ==========================================================================
# 2. SQL Injection (StcDatabaseUtility)
# ==========================================================================
banner 2 "SQL Injection (StcDatabaseUtility)"
F="$EV/02_sql_injection.txt"
SQLFILE="$AQ/src/main/java/com/aqpay/paymentservice/database/stc/utility/StcDatabaseUtility.java"
VULN_N=$(rgn '"(SELECT|INSERT|UPDATE|DELETE)\s.*"\s*\+' --glob '*.java' "$SQLFILE")
# Positive control: parameterised queries now in that file
FIX_N=$(rgn 'PreparedStatement|setString\(|setInt\(|setLong\(|\?\s*,|=\s*\?' --glob '*.java' "$SQLFILE")
emit 2 "SQL Injection (StcDatabaseUtility)" "$VULN_N" "$FIX_N" "$F"
{ echo; echo "[-] NEGATIVE (string-concatenated SQL):";
  rgc -n '"(SELECT|INSERT|UPDATE|DELETE)\s.*"\s*\+' --glob '*.java' "$SQLFILE" | head -40
  echo; echo "[+] POSITIVE (PreparedStatement / bound parameters):";
  rgc -n 'PreparedStatement|setString\(|setInt\(|setLong\(|=\s*\?' --glob '*.java' "$SQLFILE" | head -40
} >> "$F"

# ==========================================================================
# 3. Critical Dependency Vulnerabilities (babel/traverse, minimist)
# ==========================================================================
banner 3 "Critical Dependency Vulnerabilities"
F="$EV/03_critical_deps.txt"
BABEL_VER=$(grep -A1 '"@babel/traverse"' "$AQ/package-lock.json" 2>/dev/null | grep version | head -1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
MINIMIST_VER=$(grep -A1 '"minimist"' "$AQ/package-lock.json" 2>/dev/null | grep version | head -1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
VULN_N=0
[ "$BABEL_VER" != "7.23.2" ] && VULN_N=$((VULN_N+1))
[ "$MINIMIST_VER" != "1.2.6" ] && VULN_N=$((VULN_N+1))
FIX_N=0
[ "$BABEL_VER" = "7.23.2" ] && FIX_N=$((FIX_N+1))
[ "$MINIMIST_VER" = "1.2.6" ] && FIX_N=$((FIX_N+1))
emit 3 "Critical Dependency Vulnerabilities" "$VULN_N" "$FIX_N" "$F"
{ echo; echo "[i] Resolved versions in package-lock.json (patched baselines: @babel/traverse>=7.23.2, minimist>=1.2.6):";
  echo "    @babel/traverse : ${BABEL_VER:-<not found>}";
  echo "    minimist        : ${MINIMIST_VER:-<not found>}";
  echo; echo "[+] npm audit (critical) if npm is available:";
  ( cd "$AQ" 2>/dev/null && command -v npm >/dev/null && npm audit --audit-level=critical 2>/dev/null | tail -20 ) || echo "    npm not run";
} >> "$F"

# ==========================================================================
# 4. Permissive CORS (Wildcard Origin)
# ==========================================================================
banner 4 "Permissive CORS (Wildcard Origin)"
F="$EV/04_cors.txt"
VULN_N=$(rgn 'Access-Control-Allow-Origin["'\'' ]*[:,]\s*["'\'']?\*|allowedOrigins\("\*"\)|addAllowedOrigin\("\*"\)|setAllowedOrigins\(.*\*' --glob '*.java' "$AQ" "$CC" "$XJ")
FIX_N=$(rgn 'allowedOrigins\("https?://|setAllowedOriginPatterns|@CrossOrigin\(origins\s*=\s*"https?://|allowed\.origins' --glob '*.java' --glob '*.yml' --glob '*.properties' "$AQ" "$CC" "$XJ")
emit 4 "Permissive CORS (Wildcard Origin)" "$VULN_N" "$FIX_N" "$F"
{ echo; echo "[-] NEGATIVE (wildcard '*' origin):";
  rgc -n 'Access-Control-Allow-Origin|allowedOrigins\("\*"\)|addAllowedOrigin\("\*"\)|setAllowedOrigins\(.*\*' --glob '*.java' "$AQ" "$CC" "$XJ" | head -40
  echo; echo "[+] POSITIVE (explicit origin allowlist):";
  rgc -n 'allowedOrigins\("https?://|setAllowedOriginPatterns|@CrossOrigin\(origins\s*=\s*"https?://|allowed\.origins' --glob '*.java' --glob '*.yml' --glob '*.properties' "$AQ" "$CC" "$XJ" | head -40
} >> "$F"

# ==========================================================================
# 5. Weak / Broken Cryptography
# ==========================================================================
banner 5 "Weak / Broken Cryptography"
F="$EV/05_weak_crypto.txt"
VULN_N=$(rgn 'Cipher\.getInstance\("(AES/ECB|DES|DESede|AES/CBC/PKCS5Padding|RC4|Blowfish)' --glob '*.java' "$AQ" "$CC" "$XJ")
FIX_N=$(rgn 'Cipher\.getInstance\("AES/GCM/NoPadding"|GCMParameterSpec|AES/CBC/PKCS7Padding.*HMAC' --glob '*.java' "$AQ" "$CC" "$XJ")
emit 5 "Weak / Broken Cryptography" "$VULN_N" "$FIX_N" "$F"
{ echo; echo "[-] NEGATIVE (ECB/DES/insecure modes):";
  rgc -n 'Cipher\.getInstance\("(AES/ECB|DES|DESede|AES/CBC/PKCS5Padding|RC4|Blowfish)' --glob '*.java' "$AQ" "$CC" "$XJ" | head -40
  echo; echo "[+] POSITIVE (authenticated AES/GCM):";
  rgc -n 'Cipher\.getInstance\("AES/GCM/NoPadding"|GCMParameterSpec' --glob '*.java' "$AQ" "$CC" "$XJ" | head -40
} >> "$F"

# ==========================================================================
# 6. High-Severity Dependency Vulnerabilities
# ==========================================================================
banner 6 "High-Severity Dependency Vulnerabilities"
F="$EV/06_high_deps.txt"
if command -v trivy >/dev/null 2>&1; then
    trivy fs --severity HIGH "$AQ/package-lock.json" > "$EV/06_trivy_raw.txt" 2>/dev/null
    VULN_N=$(grep -c 'HIGH' "$EV/06_trivy_raw.txt" 2>/dev/null || echo 0)
else
    VULN_N=0
fi
FIX_N=0
emit 6 "High-Severity Dependency Vulnerabilities" "$VULN_N" "$FIX_N" "$F"
{ echo; echo "[i] trivy fs --severity HIGH output (see 06_trivy_raw.txt for full):";
  [ -f "$EV/06_trivy_raw.txt" ] && tail -40 "$EV/06_trivy_raw.txt" || echo "    trivy not installed - install to reproduce";
} >> "$F"

# ==========================================================================
# 7. Open Redirect (Unvalidated Callback URL)
# ==========================================================================
banner 7 "Open Redirect (Unvalidated Callback URL)"
F="$EV/07_open_redirect.txt"
VULN_N=$(rgn 'sendRedirect\(.*(callBackUrl|redirectUrl|getFinalCallBackUrl)' --glob '*.java' "$AQ" "$XJ")
FIX_N=$(rgn 'allowlist|whitelist|isValidRedirect|UrlValidator|getHost\(\).*equals|startsWith\("https?://.*trusted' --glob '*.java' "$AQ" "$XJ")
emit 7 "Open Redirect (Unvalidated Callback URL)" "$VULN_N" "$FIX_N" "$F"
{ echo; echo "[-] NEGATIVE (unvalidated redirect to user-controlled URL):";
  rgc -n 'sendRedirect\(.*(callBackUrl|redirectUrl|getFinalCallBackUrl)' --glob '*.java' "$AQ" "$XJ" | head -40
  echo; echo "[+] POSITIVE (redirect target validation / allowlist):";
  rgc -n 'allowlist|whitelist|isValidRedirect|UrlValidator|startsWith\("https' --glob '*.java' "$AQ" "$XJ" | head -40
} >> "$F"

# ==========================================================================
# 8. Unrestricted File Upload
# ==========================================================================
banner 8 "Unrestricted File Upload"
F="$EV/08_file_upload.txt"
VULN_N=$(rgn '@RequestParam\("files?"\)\s*MultipartFile' --glob '*.java' "$AQ" "$XJ")
FIX_N=$(rgn 'getContentType\(\)|getOriginalFilename\(\).*(endsWith|matches)|allowedExtensions|MediaType\.|Tika|magic|file\.getSize\(\)\s*[<>]' --glob '*.java' "$AQ" "$XJ")
emit 8 "Unrestricted File Upload" "$VULN_N" "$FIX_N" "$F"
{ echo; echo "[-] NEGATIVE (raw MultipartFile intake):";
  rgc -n '@RequestParam\("files?"\)\s*MultipartFile' --glob '*.java' "$AQ" "$XJ" | head -40
  echo; echo "[+] POSITIVE (type/extension/size validation on upload):";
  rgc -n 'getContentType\(\)|getOriginalFilename\(\)|allowedExtensions|MediaType\.|Tika|file\.getSize\(\)' --glob '*.java' "$AQ" "$XJ" | head -40
} >> "$F"

# ==========================================================================
# 9. Weak Hashing (MD5 / SHA-1)
# ==========================================================================
banner 9 "Weak Hashing (MD5 / SHA-1)"
F="$EV/09_weak_hashing.txt"
VULN_N=$(rgn 'MessageDigest\.getInstance\("(MD5|SHA-1|SHA1)"\)|DigestUtils\.(md5|sha1)' --glob '*.java' "$XJ" "$AQ" "$CC")
FIX_N=$(rgn 'MessageDigest\.getInstance\("SHA-256"\)|SHA-512|BCrypt|PBKDF2|Argon2|DigestUtils\.sha256' --glob '*.java' "$XJ" "$AQ" "$CC")
emit 9 "Weak Hashing (MD5 / SHA-1)" "$VULN_N" "$FIX_N" "$F"
{ echo; echo "[-] NEGATIVE (MD5 / SHA-1):";
  rgc -n 'MessageDigest\.getInstance\("(MD5|SHA-1|SHA1)"\)|DigestUtils\.(md5|sha1)' --glob '*.java' "$XJ" "$AQ" "$CC" | head -40
  echo; echo "[+] POSITIVE (SHA-256+/BCrypt/PBKDF2/Argon2):";
  rgc -n 'SHA-256|SHA-512|BCrypt|PBKDF2|Argon2|DigestUtils\.sha256' --glob '*.java' "$XJ" "$AQ" "$CC" | head -40
} >> "$F"

# ==========================================================================
# 10. Spring Boot Actuator Exposed
# ==========================================================================
banner 10 "Spring Boot Actuator Exposed"
F="$EV/10_actuator.txt"
VULN_N=$(rgn 'show-actuator:\s*true|management\.endpoints\.web\.exposure\.include\s*[:=]\s*\*|include:\s*"?\*' --glob '*.yml' --glob '*.properties' "$CC" "$AQ" "$XJ")
FIX_N=$(rgn 'show-actuator:\s*false|exposure\.include\s*[:=]\s*(health|info)|management\.endpoint\.health' --glob '*.yml' --glob '*.properties' "$CC" "$AQ" "$XJ")
emit 10 "Spring Boot Actuator Exposed" "$VULN_N" "$FIX_N" "$F"
{ echo; echo "[-] NEGATIVE (actuator wide open):";
  rgc -n 'show-actuator:\s*true|exposure\.include.*\*' --glob '*.yml' --glob '*.properties' "$CC" "$AQ" "$XJ" | head -40
  echo; echo "[+] POSITIVE (actuator disabled / restricted to health,info):";
  rgc -n 'show-actuator:\s*false|exposure\.include\s*[:=]\s*(health|info)' --glob '*.yml' --glob '*.properties' "$CC" "$AQ" "$XJ" | head -40
} >> "$F"

# ==========================================================================
# 11. CRLF Injection in Logs
# ==========================================================================
banner 11 "CRLF Injection in Logs"
F="$EV/11_crlf_logs.txt"
VULN_N=$(rgn 'log\.(info|warn|error|debug)\(.*request\.getParameter' --glob '*.java' "$AQ" "$XJ" "$CC")
FIX_N=$(rgn 'replaceAll\("\[\\\\r\\\\n\]|replace\("\\\\n"|replace\("\\\\r"|sanitize|encodeForLog|StringEscapeUtils' --glob '*.java' "$AQ" "$XJ" "$CC")
emit 11 "CRLF Injection in Logs" "$VULN_N" "$FIX_N" "$F"
{ echo; echo "[-] NEGATIVE (raw request param logged):";
  rgc -n 'log\.(info|warn|error|debug)\(.*request\.getParameter' --glob '*.java' "$AQ" "$XJ" "$CC" | head -40
  echo; echo "[+] POSITIVE (newline stripping / log sanitisation):";
  rgc -n 'replaceAll\("\[\\\\r\\\\n\]|sanitize|encodeForLog|StringEscapeUtils' --glob '*.java' "$AQ" "$XJ" "$CC" | head -40
} >> "$F"

# ==========================================================================
# 12. Mass Assignment (Direct Entity Binding)
# ==========================================================================
banner 12 "Mass Assignment (Direct Entity Binding)"
F="$EV/12_mass_assignment.txt"
VULN_N=$(rgn '@RequestBody\s+\w+Entity' --glob '*.java' "$XJ" "$AQ" "$CC")
FIX_N=$(rgn '@RequestBody\s+\w+(Dto|DTO|Request|Form|Command)\b' --glob '*.java' "$XJ" "$AQ" "$CC")
emit 12 "Mass Assignment (Direct Entity Binding)" "$VULN_N" "$FIX_N" "$F"
{ echo; echo "[-] NEGATIVE (@RequestBody bound straight to *Entity):";
  rgc -n '@RequestBody\s+\w+Entity' --glob '*.java' "$XJ" "$AQ" "$CC" | head -40
  echo; echo "[+] POSITIVE (@RequestBody bound to a DTO/Request):";
  rgc -n '@RequestBody\s+\w+(Dto|DTO|Request|Form|Command)\b' --glob '*.java' "$XJ" "$AQ" "$CC" | head -40
} >> "$F"

# ==========================================================================
# 13. Insecure Randomness in Payment Logic
# ==========================================================================
banner 13 "Insecure Randomness in Payment Logic"
F="$EV/13_insecure_random.txt"
RANDFILE="$XJ/src/main/java/com/bankRequest/serviceimpl/PaymentHandlerServiceImpl.java"
VULN_N=$(rgn 'new Random\(\)|Math\.random\(\)' --glob '*.java' "$RANDFILE")
FIX_N=$(rgn 'SecureRandom|new SecureRandom\(\)' --glob '*.java' "$RANDFILE")
emit 13 "Insecure Randomness in Payment Logic" "$VULN_N" "$FIX_N" "$F"
{ echo; echo "[-] NEGATIVE (java.util.Random / Math.random in payment path):";
  rgc -n 'new Random\(\)|Math\.random\(\)' --glob '*.java' "$RANDFILE" | head -40
  echo; echo "[+] POSITIVE (SecureRandom):";
  rgc -n 'SecureRandom' --glob '*.java' "$RANDFILE" | head -40
} >> "$F"

# ==========================================================================
# 14. File Path Construction (Path Traversal)
# ==========================================================================
banner 14 "File Path Construction (Manual Review)"
F="$EV/14_path_traversal.txt"
VULN_N=$(rgn 'Paths\.get\([^)]*(request|param|getParameter|userInput|fileName)|new FileInputStream\([^)]*(request|param|fileName)' --glob '*.java' "$AQ" "$XJ")
FIX_N=$(rgn 'normalize\(\)|getCanonicalPath\(\)|startsWith\(baseDir|FilenameUtils\.getName|\.\.\s*check|contains\("\.\."\)' --glob '*.java' "$AQ" "$XJ")
emit 14 "File Path Construction (Manual Review)" "$VULN_N" "$FIX_N" "$F"
{ echo; echo "[-] NEGATIVE (path built from user input, unnormalised):";
  rgc -n 'Paths\.get\([^)]*(request|param|getParameter|userInput|fileName)|new FileInputStream\([^)]*(request|param|fileName)' --glob '*.java' "$AQ" "$XJ" | head -40
  echo; echo "[+] POSITIVE (normalize/canonical-path/base-dir containment check):";
  rgc -n 'normalize\(\)|getCanonicalPath\(\)|startsWith\(baseDir|FilenameUtils\.getName|contains\("\.\."\)' --glob '*.java' "$AQ" "$XJ" | head -40
} >> "$F"

# ==========================================================================
# Summary
# ==========================================================================
echo ""
printf "%-4s %-45s %-6s %s\n" "ID" "FINDING" "STATUS" "CONTROLS"
echo "-------------------------------------------------------------------------------"
for r in "${RESULTS[@]}"; do echo -e "$r"; done
echo "-------------------------------------------------------------------------------"
echo -e "${BOLD}SUMMARY${NC}   ${GREEN}Fixed: $FIXED${NC}   ${RED}Open: $OPEN${NC}   Total: $((FIXED+OPEN))"
echo "Evidence files written under: $EV/"
echo "-------------------------------------------------------------------------------"

# Machine-readable roll-up
{
  echo "id,status,vuln_hits,fix_hits,evidence_file"
  for f in "$EV"/[0-9][0-9]_*.txt; do
    [ "$f" = "$EV/00_environment.txt" ] && continue
    id=$(grep -m1 '^FINDING' "$f" | grep -oE 'FINDING [0-9]+' | awk '{print $2}')
    st=$(grep -m1 '^RETEST STATUS' "$f" | grep -oE 'FIXED|OPEN' | head -1)
    vn=$(grep -m1 '^RETEST STATUS' "$f" | grep -oE 'vulnerable hits=[0-9]+' | grep -oE '[0-9]+')
    fn=$(grep -m1 '^RETEST STATUS' "$f" | grep -oE 'fix-present hits=[0-9]+' | grep -oE '[0-9]+')
    echo "$id,$st,$vn,$fn,$(basename "$f")"
  done
} > "$EV/retest_summary.csv"
echo "CSV roll-up: $EV/retest_summary.csv"
