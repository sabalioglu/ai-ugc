# 📧 n8n Mail Özetleme Otomasyonu

AI destekli otomatik mail okuma ve özet çıkarma sistemi.

## 🎯 Özellikler

- **Otomatik Mail İzleme**: Gmail'den gelen yeni mailleri otomatik algılar
- **AI Özet**: OpenAI GPT-4 ile Türkçe mail özetleri oluşturur
- **Supabase Entegrasyonu**: Özetleri Supabase veritabanında saklar
- **Slack Bildirimleri**: Yeni mail özetlerini Slack'e gönderir
- **Tam Metin Arama**: PostgreSQL full-text search desteği

## 🏗️ Mimari

```
Gmail → n8n Trigger → OpenAI GPT-4 → Supabase Edge Function → Slack
```

### Bileşenler:

1. **Gmail Trigger**: Her dakika yeni mailleri kontrol eder
2. **OpenAI Chat GPT-4**: Mailleri Türkçe özetler (max 3-4 cümle)
3. **Supabase Edge Function**: Özetleri veritabanına kaydeder
4. **Slack Notification**: Ekibe bildirim gönderir

## 📦 Kurulum

### 1. Supabase Setup

**Migration çalıştır:**
```bash
cd supabase
supabase db reset
# veya
psql -U postgres -d your_db -f migrations/20260121_create_mail_summaries.sql
```

**Edge Function deploy et:**
```bash
supabase functions deploy save-mail-summary

# Environment variables set et
supabase secrets set SUPABASE_URL=your-project-url
supabase secrets set SUPABASE_ANON_KEY=your-anon-key
```

### 2. n8n Workflow Import

1. n8n'i aç
2. Yeni workflow oluştur
3. `n8n-mail-summarizer.json` dosyasını import et
4. Credentials yapılandır:
   - Gmail API
   - OpenAI API
   - Supabase API
   - Slack API

### 3. Credentials Yapılandırması

#### Gmail Trigger:
```
OAuth2 credentials gerektirir:
1. Google Cloud Console'da proje oluştur
2. Gmail API'yi aktifleştir
3. OAuth 2.0 Client ID oluştur
4. n8n'de Gmail OAuth2 credential ekle
```

#### OpenAI:
```
API Key: sk-...
Organization ID: (opsiyonel)
```

#### Supabase:
```
URL: https://your-project.supabase.co
Anon Key: eyJ...
Service Role Key: eyJ... (Edge Functions için)
```

#### Slack:
```
OAuth2 credentials veya Bot Token:
- Bot Token Scopes: chat:write, chat:write.public
- Channel: #mail-summaries
```

## 🗄️ Veritabanı Şeması

```sql
CREATE TABLE mail_summaries (
  id UUID PRIMARY KEY,
  mail_id TEXT UNIQUE NOT NULL,
  from_address TEXT NOT NULL,
  subject TEXT NOT NULL,
  summary TEXT NOT NULL,
  original_text TEXT,
  received_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**İndeksler:**
- `mail_id` (unique)
- `from_address`
- `received_at DESC`
- Full-text search (GIN index)

## 🔒 Güvenlik

### Row Level Security (RLS)

```sql
-- Authenticated kullanıcılar okuyabilir
CREATE POLICY "Allow authenticated users to read"
ON mail_summaries FOR SELECT TO authenticated USING (true);

-- Service role tam erişim (Edge Functions)
CREATE POLICY "Allow service role full access"
ON mail_summaries FOR ALL TO service_role USING (true);
```

### Environment Variables

**Supabase Edge Function:**
```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
```

**n8n Workflow:**
```bash
# .env dosyasında:
SUPABASE_URL=https://xxx.supabase.co
OPENAI_API_KEY=sk-...
SLACK_TOKEN=xoxb-...
```

## 🚀 Kullanım

### Workflow'u Aktifleştir

1. n8n'de workflow'u aç
2. Sağ üstten "Active" toggle'ını aç
3. Her dakika yeni mailler kontrol edilecek

### Manuel Test

1. Workflow'u aç
2. "Execute Workflow" butonuna tıkla
3. Test maili gönder
4. Sonuçları kontrol et

### Edge Function Test

```bash
curl -X POST https://your-project.supabase.co/functions/v1/save-mail-summary \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "mail_id": "test-123",
    "from": "test@example.com",
    "subject": "Test Mail",
    "summary": "Bu bir test özetidir.",
    "received_at": "2026-01-21T10:00:00Z"
  }'
```

## 📊 Monitoring

### Supabase Dashboard

```sql
-- Son 24 saatteki özetler
SELECT
  from_address,
  subject,
  summary,
  received_at
FROM mail_summaries
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Gönderen bazlı istatistik
SELECT
  from_address,
  COUNT(*) as mail_count,
  MIN(received_at) as first_mail,
  MAX(received_at) as last_mail
FROM mail_summaries
GROUP BY from_address
ORDER BY mail_count DESC;
```

### n8n Execution History

- Workflow sayfasında "Executions" tab'ını kontrol et
- Başarısız execution'ları incele
- Error log'larını oku

## 🔧 Özelleştirme

### AI Prompt'u Değiştir

`OpenAI Chat GPT-4` node'unda system message'ı düzenle:

```javascript
Sen profesyonel bir mail özet asistanısın.
Gelen mailleri kısa, öz ve anlaşılır şekilde Türkçe özetle.
Maksimum 3-4 cümle kullan.
```

### Özet Uzunluğu

```javascript
"maxTokens": 300  // Daha uzun özetler için artır
"temperature": 0.3  // Daha yaratıcı özetler için artır (0.7-0.9)
```

### Mail Filtreleri

Gmail Trigger node'unda filtreleri değiştir:

```javascript
"filters": {
  "labelIds": ["INBOX", "UNREAD"],
  "q": "from:important@company.com"  // Sadece belirli gönderici
}
```

## 🐛 Troubleshooting

### Gmail Trigger Çalışmıyor

1. Gmail API enabled mi kontrol et
2. OAuth2 credentials doğru mu?
3. Poll interval çok kısa olabilir (en az 1 dakika)

### OpenAI Hatası

```
Error: Rate limit exceeded
Çözüm: OpenAI plan'ınızı yükseltin veya rate limit ayarlarını değiştirin
```

### Supabase Edge Function Timeout

```
Error: Function timeout
Çözüm: Edge Function timeout'unu artır (default 10s)
```

### RLS Policy Hatası

```
Error: new row violates row-level security policy
Çözüm: Service role key kullanıldığından emin ol
```

## 📈 Gelecek Geliştirmeler

- [ ] IMAP Email desteği (Gmail dışı mail sistemleri)
- [ ] Multi-language özet desteği
- [ ] Sentiment analysis (mail duygu analizi)
- [ ] Kategori tagging (otomatik etiketleme)
- [ ] Web dashboard (özetleri görüntüle)
- [ ] Email otomatik yanıt önerileri

## 📚 Kaynaklar

- [n8n Documentation](https://docs.n8n.io)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [OpenAI API](https://platform.openai.com/docs)
- [n8n-MCP Repository](https://github.com/czlonkowski/n8n-mcp)

## 🙏 Credits

**n8n Skills & Workflow Template:** Part of KEMIK toolkit
**Author:** Built with Claude Code + n8n-skills + GSD methodology

---

**Built with**:
- n8n workflow automation
- OpenAI GPT-4 Turbo
- Supabase Edge Functions & PostgreSQL
- Slack API
