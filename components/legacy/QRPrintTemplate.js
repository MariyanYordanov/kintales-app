/**
 * Build an HTML string for printing a legacy key QR code page.
 * Uses warm, heritage-inspired design with bilingual instructions (BG + EN).
 */
export function buildQRPrintHTML(keyCode, familyName) {
  return `<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    @page { margin: 2.5cm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Georgia, 'Times New Roman', serif;
      background: #FFF8F0;
      color: #44403C;
      text-align: center;
      padding: 40px 20px;
    }
    .header {
      font-size: 14px;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #A8A29E;
      margin-bottom: 8px;
    }
    .app-name {
      font-size: 12px;
      color: #A8A29E;
      margin-bottom: 32px;
    }
    .title-bg {
      font-size: 22px;
      font-weight: bold;
      color: #44403C;
      margin-bottom: 4px;
    }
    .title-en {
      font-size: 16px;
      color: #78716C;
      font-style: italic;
      margin-bottom: 24px;
    }
    .family-name {
      font-size: 28px;
      font-weight: bold;
      color: #8B5CF6;
      margin-bottom: 32px;
    }
    .qr-container {
      display: inline-block;
      padding: 20px;
      border: 2px solid #E7E5E4;
      border-radius: 16px;
      background: #FFFFFF;
      margin-bottom: 24px;
    }
    .qr-placeholder {
      width: 200px;
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .key-code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 2px;
      color: #44403C;
      background: #F5F5F4;
      padding: 12px 24px;
      border-radius: 8px;
      display: inline-block;
      margin-bottom: 32px;
    }
    .divider {
      width: 60px;
      height: 1px;
      background: #D6D3D1;
      margin: 0 auto 24px;
    }
    .instructions {
      max-width: 400px;
      margin: 0 auto 24px;
      text-align: left;
    }
    .instructions h3 {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 8px;
    }
    .instructions ol {
      font-size: 13px;
      line-height: 1.8;
      padding-left: 20px;
      color: #57534E;
    }
    .instructions-en {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #E7E5E4;
    }
    .footer {
      margin-top: 32px;
      font-size: 13px;
      color: #A8A29E;
      font-style: italic;
    }
    .url {
      font-size: 11px;
      color: #A8A29E;
      margin-top: 8px;
    }
  </style>
</head>
<body>
  <div class="header">KinTales</div>
  <div class="app-name">kintales.net</div>

  <div class="title-bg">Ключ за достъп до семейно наследство</div>
  <div class="title-en">Family Heritage Access Key</div>

  <div class="family-name">${escapeHTML(familyName)}</div>

  <div class="qr-container">
    <div class="qr-placeholder" id="qr-area">
      <!-- QR code will be injected as an image -->
      <img id="qr-img" width="200" height="200" />
    </div>
  </div>

  <br />
  <div class="key-code">${escapeHTML(keyCode)}</div>

  <div class="divider"></div>

  <div class="instructions">
    <h3>Инструкции за използване:</h3>
    <ol>
      <li>Свалете приложението КинТейлс</li>
      <li>Изберете „Наследствен ключ"</li>
      <li>Сканирайте QR кода или въведете кода</li>
      <li>Създайте профил или влезте</li>
      <li>Получавате достъп до семейното дърво</li>
    </ol>

    <div class="instructions-en">
      <h3>Instructions:</h3>
      <ol>
        <li>Download the KinTales app</li>
        <li>Select "Legacy Key"</li>
        <li>Scan the QR code or enter the code</li>
        <li>Create an account or sign in</li>
        <li>You will gain access to the family tree</li>
      </ol>
    </div>
  </div>

  <div class="footer">
    Съхранете този документ на сигурно място.<br />
    Keep this document in a safe place.
  </div>
  <div class="url">kintales.net</div>
</body>
</html>`;
}

function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
