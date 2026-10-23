/**
 * A highly capable, regex-based URL parser for extracting product metadata and unique IDs
 * from various e-commerce platform links.
 */

export interface ParsedProductUrl {
  platform: string;       // Normalized store name (e.g. "Amazon.in", "Flipkart", "Myntra")
  productId: string | null; // Unique item ID/ASIN/Code
  slug: string | null;     // Extracted URL slug
  cleanName: string | null; // Human-friendly product name guessed from slug
  sanitizedUrl: string;   // Clean URL lacking tracking, affiliate, or session codes
}

/**
 * Checks if a search query matches a standard e-commerce URL.
 */
export function isProductUrl(input: string): boolean {
  if (!input) return false;
  const trimmed = input.trim();
  // Match absolute http/https links or common www/domain structures
  return /^(https?:\/\/|www\.)[a-zA-Z0-9-.]+\.[a-zA-Z]{2,}(\/.*)?$/i.test(trimmed);
}

/**
 * Sanitizes URLs by stripping known tracking / analytics / affiliate query parameters.
 */
export function sanitizeQueryParameters(urlObj: URL): string {
  const trackingParams = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id',
    'ref', 'ref_', 'pf_rd_r', 'pf_rd_p', 'pf_rd_m', 'pf_rd_s', 'pf_rd_t', 'pf_rd_i',
    'qid', 'sr', 'sprefix', 'keywords', 'asins', 'node', 'pd_rd_w', 'pf_rd_w',
    'pd_rd_wg', 'pd_rd_r', 'clickid', 'affId', 'aff_id', 'tag', 'extid', 'tracker_id',
    'gclid', 'fbclid', 'al_applink_data'
  ];

  const searchParams = new URLSearchParams(urlObj.search);
  for (const param of trackingParams) {
    searchParams.delete(param);
  }

  // Generate sanitized string representation
  const cleanSearch = searchParams.toString();
  return `${urlObj.origin}${urlObj.pathname}${cleanSearch ? '?' + cleanSearch : ''}${urlObj.hash}`;
}

/**
 * Normalizes a URL slug into a friendly, capitalized, space-separated title.
 */
export function cleanSlugToName(slug: string): string {
  if (!slug) return '';
  
  // Replace hyphens, underscores, percent-encodes, and excess punctuation with spaces
  let name = slug
    .replace(/%20/g, ' ')
    .replace(/[-_]+/g, ' ')
    .replace(/\b(dp|gp|product|products|p|itm|item)\b/gi, '') // strip system tokens
    .replace(/\b[a-z0-9]{10}\b/gi, '') // strip potential hash identifiers like ASINs
    .replace(/\s+/g, ' ')
    .trim();

  // Highlight specific units cleanly (storage, variant details etc.)
  name = name.replace(/\b(\d+)(gb|tb|mb|ghz|mah|in|inch|cm)\b/gi, '$1 $2');

  // Capitalize word sequences
  return name
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Parses e-commerce URLs to extract vital metadata and IDs.
 */
export function parseProductUrl(urlStr: string): ParsedProductUrl | null {
  if (!urlStr) return null;
  
  // Auto-prepend http schema if missing to leverage native URL parsing
  let formattedUrl = urlStr.trim();
  if (!/^(https?:\/\/)/i.test(formattedUrl)) {
    formattedUrl = 'https://' + formattedUrl;
  }

  try {
    const url = new URL(formattedUrl);
    const host = url.hostname.toLowerCase();
    const pathname = url.pathname;
    
    let platform = "E-Commerce Store";
    let productId: string | null = null;
    let slug: string | null = null;
    
    // 1. Amazon Parser
    if (host.includes('amazon.')) {
      platform = host.includes('.in') ? "Amazon.in" : "Amazon";
      
      // Amazon IDs are usually 10-char ASINs starting with B or digits (e.g. B0CPL6T6T6)
      const asinMatch = pathname.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
      if (asinMatch) {
        productId = asinMatch[1];
      }
      
      // Fallback matching for shorter URLs
      if (!productId) {
        const altMatch = pathname.match(/\/([A-Z0-9]{10})(?:\/|\?|$)/i);
        if (altMatch) productId = altMatch[1];
      }

      // Extract title slug
      const slugMatch = pathname.match(/^\/([a-zA-Z0-9%-]+)\/(?:dp|gp\/product)/);
      if (slugMatch) {
        slug = slugMatch[1];
      }
    }
    
    // 2. Flipkart Parser
    else if (host.includes('flipkart.')) {
      platform = "Flipkart";
      
      // Try extracting PID from URL params
      const pidParam = url.searchParams.get('pid');
      if (pidParam) {
        productId = pidParam;
      }
      
      // If PID wasn't in parameters, scrape path pattern
      if (!productId) {
        const fsnMatch = pathname.match(/\/p\/(itm[a-zA-Z0-9]{13})/i);
        if (fsnMatch) {
          productId = fsnMatch[1];
        }
      }

      // Flipkart slugs are the segment before "/p/"
      const slugMatch = pathname.match(/^\/([a-zA-Z0-9%-]+)\/p\//);
      if (slugMatch) {
        slug = slugMatch[1];
      }
    }
    
    // 3. Myntra Parser
    else if (host.includes('myntra.com')) {
      platform = "Myntra";
      
      // Look for digital pattern indicating item identifier: .../buy or series of digits
      const myntraMatch = pathname.match(/\/([0-9]+)\/buy/i) || pathname.match(/\/([0-9]+)$/);
      if (myntraMatch) {
        productId = myntraMatch[1];
      }

      // Extract general slug
      const segments = pathname.split('/').filter(Boolean);
      if (segments.length > 0 && segments[0] !== productId) {
        slug = segments[0];
      }
    }
    
    // 4. Ajio Parser
    else if (host.includes('ajio.com')) {
      platform = "Ajio";
      const ajioMatch = pathname.match(/\/p\/([0-9_a-zA-Z]+)$/) || pathname.match(/\/p\/([0-9]+)/);
      if (ajioMatch) {
        productId = ajioMatch[1];
      }

      const segments = pathname.split('/').filter(Boolean);
      if (segments.length > 0 && segments[0] !== 'p') {
        slug = segments[0];
      }
    }
    
    // 5. Nykaa Parser
    else if (host.includes('nykaa.com')) {
      platform = "Nykaa";
      const nykaaMatch = pathname.match(/\/p\/([0-9]+)/i) || pathname.match(/\/product\/([0-9a-zA-Z_-]+)/i);
      if (nykaaMatch) {
        productId = nykaaMatch[1];
      }

      const segments = pathname.split('/').filter(Boolean);
      if (segments.length > 0 && segments[0] !== 'p' && segments[0] !== 'product') {
        slug = segments[0];
      }
    }
    
    // 6. Meesho Parser
    else if (host.includes('meesho.com')) {
      platform = "Meesho";
      const meeshoMatch = pathname.match(/\/p\/([a-zA-Z0-9]+)$/) || pathname.match(/\/([a-zA-Z0-9]+)\/p/);
      if (meeshoMatch) {
        productId = meeshoMatch[1];
      }

      const segments = pathname.split('/').filter(Boolean);
      if (segments.length > 0 && segments[0] !== 'p') {
        slug = segments[0];
      }
    }
    
    // 7. Croma Parser
    else if (host.includes('croma.com')) {
      platform = "Croma";
      const cromaMatch = pathname.match(/\/p\/([0-9]+)$/) || pathname.match(/-([0-9]+)$/);
      if (cromaMatch) {
        productId = cromaMatch[1];
      }

      const segments = pathname.split('/').filter(Boolean);
      if (segments.length > 0 && segments[0] !== 'p') {
        slug = segments[0];
      }
    }
    
    // 8. Reliance Digital Parser
    else if (host.includes('reliancedigital.')) {
      platform = "Reliance Digital";
      const rdMatch = pathname.match(/\/p\/([0-9]+)$/) || pathname.match(/-([0-9]+)$/);
      if (rdMatch) {
        productId = rdMatch[1];
      }

      const segments = pathname.split('/').filter(Boolean);
      if (segments.length > 0 && segments[0] !== 'p') {
        slug = segments[0];
      }
    }
    
    // 9. Tata Cliq Parser
    else if (host.includes('tatacliq.com')) {
      platform = "Tata Cliq";
      const cliqMatch = pathname.match(/\/p-(mp[0-9]+)/i) || pathname.match(/\/p-([a-zA-Z0-9]+)/i);
      if (cliqMatch) {
        productId = cliqMatch[1];
      }

      const segments = pathname.split('/').filter(Boolean);
      if (segments.length > 0 && segments[0] !== 'p') {
        slug = segments[0];
      }
    }
    
    // 10. Swiggy Instamart, Zepto, Blinkit & grocery apps
    else if (host.includes('blinkit.com')) {
      platform = "Blinkit";
      const blinkitMatch = pathname.match(/\/pr\/([a-zA-Z0-9-]+)\/id\/([0-9]+)/i) || pathname.match(/\/id\/([0-9]+)/i);
      if (blinkitMatch) {
        productId = blinkitMatch[2] || blinkitMatch[1];
        slug = blinkitMatch[1];
      }
    }
    else if (host.includes('zepto') || host.includes('zeptonow.')) {
      platform = "Zepto";
      const zeptoMatch = pathname.match(/\/p\/([a-zA-Z0-9-]+)\/cid/i) || pathname.match(/\/product\/([a-zA-Z0-9-]+)/i);
      if (zeptoMatch) {
        productId = zeptoMatch[1];
        slug = zeptoMatch[1];
      }
    }
    else if (host.includes('bigbasket.com')) {
      platform = "BigBasket";
      const bbMatch = pathname.match(/\/pd\/([0-9]+)/i) || pathname.match(/\/pc\/([0-9a-zA-Z_-]+)/i);
      if (bbMatch) {
        productId = bbMatch[1];
      }
      const segments = pathname.split('/').filter(Boolean);
      if (segments.length > 0) slug = segments[segments.length - 1];
    }
    else if (host.includes('swiggy.com')) {
      platform = "Swiggy Instamart";
      const swiggyMatch = pathname.match(/\/instamart\/item\/([a-zA-Z0-9-]+)$/i) || pathname.match(/\/item\/([a-zA-Z0-9-]+)/i);
      if (swiggyMatch) {
        productId = swiggyMatch[1];
        slug = swiggyMatch[1];
      }
    }
    else if (host.includes('jiomart.com')) {
      platform = "JioMart";
      const jioMatch = pathname.match(/\/p\/([0-9]+)/i) || pathname.match(/\/prod\/([0-9]+)/i);
      if (jioMatch) {
        productId = jioMatch[1];
      }
      const segments = pathname.split('/').filter(Boolean);
      if (segments.length > 0) slug = segments[segments.length - 1];
    }
    else {
      // Subsystem catch-all for any generic domain
      const cleanHost = host.replace('www.', '');
      platform = cleanHost.charAt(0).toUpperCase() + cleanHost.slice(1);
    }
    
    // Fallback slug detection if not set specifically
    if (!slug) {
      const segments = pathname.split('/').filter(Boolean);
      if (segments.length > 0) {
        // Find first segment containing alphanumeric slug, avoid purely numeric ID segments
        const viableSegment = segments.find(seg => /^[a-zA-Z]{3,}/.test(seg) && !/^\d+$/.test(seg) && seg.length > 4);
        slug = viableSegment || segments[0];
      }
    }

    const sanitizedUrl = sanitizeQueryParameters(url);
    const cleanName = slug ? cleanSlugToName(slug) : null;

    return {
      platform,
      productId: productId || null,
      slug: slug || null,
      cleanName: cleanName && cleanName.length > 2 ? cleanName : null,
      sanitizedUrl
    };

  } catch (error) {
    console.warn("[URL Parser] Failed parsing constructed URL", formattedUrl, error);
    return null;
  }
}
