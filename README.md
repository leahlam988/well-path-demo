# HTTPS 憑證產生與安裝教學

## 建立自簽 CA 與伺服器憑證

以下腳本會產生一組自簽 CA 與一組包含 SAN 的本地伺服器憑證：

```sh
mkdir -p secret && cd secret

# 產生 CA 私鑰
openssl genrsa -out dev.ca.key 2048

# 產生 CA 憑證（建議有效期10年）
openssl req -x509 -new -nodes -key dev.ca.key -sha256 -days 3650 -out dev.ca.pem -subj "/C=TW/O=DevCA/CN=dev.ca"

# 產生伺服器私鑰
openssl genrsa -out dev.server.key 2048

# 產生伺服器 CSR
openssl req -new -key dev.server.key -out dev.server.csr -subj "/C=TW/O=DevServer/CN=localhost"

# 建立 SAN 設定檔
cat > dev.server.ext <<EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
IP.1 = 127.0.0.1
IP.2 = 192.168.1.4
EOF

# 以 CA 簽發伺服器憑證（有效期 365 天，建議不要超過398天）
openssl x509 -req -in dev.server.csr -CA dev.ca.pem -CAkey dev.ca.key -CAcreateserial -out dev.server.crt -days 365 -sha256 -extfile dev.server.ext

# 建立完整憑證鏈（server cert + CA cert）
cat dev.server.crt dev.ca.pem > dev.server.chain.crt
```

## 安裝 CA 憑證到系統信任區

### macOS

1. 開啟「鑰匙圈存取」，拖曳 `dev.ca.pem` 到「系統」鑰匙圈
2. 找到 `dev.ca`，**右鍵**→「取得資訊」→「信任」→「使用此憑證時」選「始終信任」
3. 輸入密碼確認，**重啟瀏覽器或重開機**

### iOS

1. 用 AirDrop、Email 或其他方式將 `dev.ca.pem` 傳到 iPhone
2. 點擊安裝，進入「設定」→「一般」→「關於本機」→「憑證信任設定」
3. 打開你的 `dev.ca` 信任開關
4. **建議重開機**

### Android

1. 將 `dev.ca.pem` 複製到手機並重新命名為 `dev.ca.crt`
2. 「設定」→「安全性」→「安裝憑證」→「用於 VPN 和應用程式」
3. 選擇剛剛的 `dev.ca.crt`，安裝
