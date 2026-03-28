export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL lipsă' });

    // Validate URL
    let parsed;
    try { parsed = new URL(url); } catch (_) {
      return res.status(400).json({ error: 'URL invalid' });
    }
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return res.status(400).json({ error: 'Doar HTTP/HTTPS' });
    }

    // Fetch the page
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ScriptStudio/1.0)',
        'Accept': 'text/html,application/xhtml+xml,*/*',
        'Accept-Language': 'ro-RO,ro;q=0.9,en;q=0.8',
      },
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(502).json({ error: `Pagina a returnat ${response.status}` });
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      return res.status(400).json({ error: 'Pagina nu e HTML (poate e PDF sau imagine)' });
    }

    const html = await response.text();

    // Extract text from HTML - remove scripts, styles, nav, footer, then strip tags
    let text = html
      // Remove scripts, styles, svg, nav, header, footer
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<svg[\s\S]*?<\/svg>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[\s\S]*?<\/header>/gi, '')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
      // Replace common block elements with newlines
      .replace(/<\/(p|div|h[1-6]|li|tr|br|section|article)>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<li[^>]*>/gi, '• ')
      // Strip remaining tags
      .replace(/<[^>]+>/g, ' ')
      // Decode HTML entities
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&#\d+;/g, ' ')
      .replace(/&\w+;/g, ' ')
      // Clean whitespace
      .replace(/[ \t]+/g, ' ')
      .replace(/\n[ \t]+/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    // Limit to ~4000 chars (enough for analysis, fits in prompt)
    if (text.length > 4000) {
      text = text.slice(0, 4000) + '\n\n[... textul a fost trunchiat la 4000 caractere]';
    }

    if (text.length < 50) {
      return res.status(400).json({ error: 'Nu am găsit suficient text pe pagină (poate e o aplicație SPA sau necesită JavaScript)' });
    }

    return res.status(200).json({ text, url, chars: text.length });

  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'Timeout — pagina a durat prea mult (>15s)' });
    }
    return res.status(500).json({ error: err.message });
  }
}
