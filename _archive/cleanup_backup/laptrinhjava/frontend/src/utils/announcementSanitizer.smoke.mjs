import { sanitizeAnnouncementHtml } from '../utils/announcementSanitizer.js'

// minimal smoke test helper
const dirty = '<p onclick="alert(1)"><script>alert(1)</script><a href="javascript:alert(1)" target="_blank">x</a><img src=x onerror=alert(1) /></p>'
const clean = sanitizeAnnouncementHtml(dirty)
if (clean.includes('script') || clean.includes('onclick') || clean.includes('javascript:') || clean.includes('onerror')) {
  throw new Error(`Sanitizer failed: ${clean}`)
}
console.log(clean)
