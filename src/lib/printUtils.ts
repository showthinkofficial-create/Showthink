/**
 * Universal Printing Utility
 * Provides robust printing support across all browsers, mobile devices, and iframe environments.
 */

export interface PrintOptions {
  title?: string;
  landscape?: boolean;
  pageHeader?: string;
  hideSelectors?: string[];
  customStyles?: string;
}

/**
 * Robustly prints a specific DOM element by ID using an isolated printable iframe,
 * preserving all Tailwind styles, custom fonts, tables, and borders.
 */
export function printElementById(elementId: string, options: PrintOptions = {}): boolean {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(`Print target element with ID "${elementId}" not found. Falling back to window.print()`);
      window.print();
      return true;
    }

    // Clone element to sanitize for printing
    const clone = element.cloneNode(true) as HTMLElement;

    // Remove any print:hidden or interactive action controls from the clone
    const hiddenElements = clone.querySelectorAll('.print\\:hidden, [data-print-hide="true"]');
    hiddenElements.forEach((el) => el.remove());

    // Make sure elements with hidden print:block are displayed in the print clone
    const printOnlyElements = clone.querySelectorAll('.hidden.print\\:block, .hidden.print\\:inline, .hidden.print\\:flex');
    printOnlyElements.forEach((el) => {
      (el as HTMLElement).style.display = 'block';
      el.classList.remove('hidden');
    });

    // Make sure tables and desktop containers are not hidden by responsive classes in print
    const responsiveTables = clone.querySelectorAll('.hidden.lg\\:block, .hidden.sm\\:block, .hidden.md\\:block');
    responsiveTables.forEach((el) => {
      (el as HTMLElement).style.display = 'block';
      el.classList.remove('hidden');
    });

    // Extract all page stylesheets and style tags
    const styleTags: string[] = [];
    const linkTags: string[] = [];

    document.querySelectorAll('style').forEach((st) => {
      styleTags.push(st.outerHTML);
    });

    document.querySelectorAll('link[rel="stylesheet"]').forEach((lk) => {
      linkTags.push(lk.outerHTML);
    });

    const isLandscape = options.landscape ?? false;
    const documentTitle = options.title || document.title || 'Print Document';

    // Build the isolated printable HTML payload
    const printHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${documentTitle}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Raleway:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
          ${linkTags.join('\n')}
          ${styleTags.join('\n')}
          <style>
            @page {
              size: ${isLandscape ? 'landscape' : 'portrait'};
              margin: 10mm 10mm 10mm 10mm;
            }
            *, *::before, *::after {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            body {
              font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background-color: #ffffff !important;
              color: #111827 !important;
              margin: 0;
              padding: 12px;
              width: 100% !important;
            }
            .print\\:hidden, [data-print-hide="true"] {
              display: none !important;
            }
            .hidden.print\\:block {
              display: block !important;
            }
            .hidden.lg\\:block, .hidden.sm\\:block, .hidden.md\\:block {
              display: block !important;
            }
            table {
              width: 100% !important;
              border-collapse: collapse !important;
              page-break-inside: auto;
            }
            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
            thead {
              display: table-header-group;
            }
            tfoot {
              display: table-footer-group;
            }
            ${options.customStyles || ''}
          </style>
        </head>
        <body>
          <div class="printable-root-container">
            ${clone.outerHTML}
          </div>
        </body>
      </html>
    `;

    // Try iframe printing first for clean seamless print dialog
    const iframe = document.createElement('iframe');
    iframe.name = 'app-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.zIndex = '-9999';
    iframe.setAttribute('aria-hidden', 'true');

    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!iframeDoc) {
      throw new Error('Could not access iframe document');
    }

    iframeDoc.open();
    iframeDoc.write(printHtml);
    iframeDoc.close();

    const triggerPrint = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print failed, falling back to window.print():', err);
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 2000);
      }
    };

    // Wait for styles/images in iframe to load
    if (iframe.contentWindow) {
      iframe.onload = () => {
        setTimeout(triggerPrint, 300);
      };
      // In case onload doesn't fire (already loaded)
      setTimeout(triggerPrint, 500);
    } else {
      setTimeout(triggerPrint, 500);
    }

    return true;
  } catch (error) {
    console.error('Error during print execution:', error);
    // Direct window.print fallback
    window.print();
    return false;
  }
}
