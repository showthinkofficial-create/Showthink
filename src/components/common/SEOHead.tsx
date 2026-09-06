import { useEffect } from 'react';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  noindex?: boolean;
  ogType?: 'website' | 'article';
  ogImage?: string;
  structuredData?: Record<string, any>;
}

// Canonical route SEO mappings based on strict specifications
export const ROUTE_SEO_MAP: Record<string, { title: string; description: string; noindex?: boolean }> = {
  '/': {
    title: 'GP Academy | School in Bhangel, Salarpur Khadar, Noida',
    description: 'GP Academy in Bhangel, Salarpur Khadar, Noida offers education from Nursery to Class 12, with CBSE and CBSE/UP Board options for applicable classes and coaching support.'
  },
  '/about': {
    title: 'About GP Academy | School in Bhangel, Noida',
    description: 'Learn about GP Academy, a school in Bhangel, Salarpur Khadar, Noida offering education from Nursery to Class 12.'
  },
  '/academics': {
    title: 'GP Academy Academics | CBSE & UP Board | Noida',
    description: 'Explore GP Academy\'s academic structure from Nursery to Class 12, including CBSE and CBSE/UP Board options for applicable classes.'
  },
  '/admissions': {
    title: 'GP Academy Admissions | Nursery to Class 12 | Noida',
    description: 'Explore GP Academy admission information for Nursery to Class 12 in Bhangel, Noida, including the June-August admission period and available offers.'
  },
  '/gallery': {
    title: 'GP Academy Gallery | School Events & Activities',
    description: 'View school events, activities and published gallery content from GP Academy in Bhangel, Salarpur Khadar, Noida.'
  },
  '/notices': {
    title: 'GP Academy Notices | School Updates',
    description: 'Read the latest published school notices and updates from GP Academy, Bhangel, Noida.'
  },
  '/facilities': {
    title: 'GP Academy Facilities | Modern Learning Infrastructure in Noida',
    description: 'Discover modern facilities at GP Academy Noida, including smart classrooms, labs, library, and sports areas for comprehensive development.'
  },
  '/contact': {
    title: 'Contact GP Academy | Bhangel, Salarpur Khadar, Noida',
    description: 'Contact GP Academy in Bhangel, Goyal Colony, Salarpur Khadar, Noida. View the school address, phone number and opening hours.'
  },
  '/admin/login': {
    title: 'Admin Access | GP Academy',
    description: 'Administrative sign in portal for authorized school administration.',
    noindex: true
  },
  '/teacher/login': {
    title: 'Faculty Portal Login | GP Academy',
    description: 'Teacher and faculty login portal.',
    noindex: true
  },
  '/portal/login': {
    title: 'Student & Parent Portal Login | GP Academy',
    description: 'Student and Parent portal login access for GP Academy.',
    noindex: true
  }
};

const DEFAULT_OG_IMAGE = 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=1200';

export function updatePageSEO(path: string, customProps?: SEOHeadProps) {
  if (typeof document === 'undefined') return;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://gpacademy.edu.in';
  const cleanPath = path.split('?')[0].split('#')[0] || '/';
  
  // Is this route protected/private?
  const isPrivate = 
    cleanPath.startsWith('/admin') ||
    cleanPath.startsWith('/teacher') ||
    cleanPath.startsWith('/portal') ||
    customProps?.noindex === true;

  const routeDefaults = ROUTE_SEO_MAP[cleanPath] || {
    title: isPrivate 
      ? 'Secure Portal | GP Academy' 
      : 'GP Academy | School in Bhangel, Salarpur Khadar, Noida',
    description: isPrivate 
      ? 'Secure authorized portal for GP Academy.' 
      : 'GP Academy in Bhangel, Salarpur Khadar, Noida offers education from Nursery to Class 12, with CBSE and CBSE/UP Board options for applicable classes and coaching support.',
    noindex: isPrivate
  };

  const title = customProps?.title || routeDefaults.title;
  const description = customProps?.description || routeDefaults.description;
  const noindex = customProps?.noindex ?? routeDefaults.noindex ?? isPrivate;
  const canonicalUrl = `${currentOrigin}${customProps?.canonicalPath || cleanPath}`;
  const ogImage = customProps?.ogImage || DEFAULT_OG_IMAGE;
  const ogType = customProps?.ogType || 'website';

  // 1. Title
  document.title = title;

  // Helper to set or create meta tag
  const setMetaTag = (selector: string, attrName: string, attrVal: string, content: string) => {
    let el = document.querySelector(selector);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrVal);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // 2. Meta description & title
  setMetaTag('meta[name="description"]', 'name', 'description', description);
  setMetaTag('meta[name="title"]', 'name', 'title', title);

  // 3. Robots
  const robotsDirective = noindex ? 'noindex, nofollow' : 'index, follow';
  setMetaTag('meta[name="robots"]', 'name', 'robots', robotsDirective);

  // 4. Open Graph
  setMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
  setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
  setMetaTag('meta[property="og:type"]', 'property', 'og:type', ogType);
  setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
  setMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImage);
  setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'GP Academy');

  // 5. Twitter Meta
  setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
  setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
  setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage);

  // 6. Canonical Link
  let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', canonicalUrl);

  // 7. Schema.org Structured Data
  let ldJsonEl = document.getElementById('dynamic-schema-org') as HTMLScriptElement | null;
  if (!noindex) {
    if (!ldJsonEl) {
      ldJsonEl = document.createElement('script');
      ldJsonEl.id = 'dynamic-schema-org';
      ldJsonEl.type = 'application/ld+json';
      document.head.appendChild(ldJsonEl);
    }

    const schemaData = customProps?.structuredData || {
      '@context': 'https://schema.org',
      '@type': 'School',
      'name': 'GP Academy',
      'slogan': 'Knowledge Is the biggest money',
      'url': currentOrigin,
      'logo': 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=500',
      'description': 'GP Academy in Bhangel, Salarpur Khadar, Noida offers education from Nursery to Class 12, with CBSE and CBSE/UP Board options for applicable classes and coaching support.',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': 'Bhangel, Goyal Colony, Salarpur Khadar',
        'addressLocality': 'Noida',
        'addressRegion': 'Uttar Pradesh',
        'postalCode': '201304',
        'addressCountry': 'IN'
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': '28.535518',
        'longitude': '77.391026'
      },
      'telephone': '9818776563',
      'email': 'admissions@gpacademy.edu.in',
      'openingHoursSpecification': [
        {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          'opens': '08:00',
          'closes': '15:00'
        },
        {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': ['Sunday'],
          'opens': '09:00',
          'closes': '14:00'
        }
      ]
    };

    ldJsonEl.textContent = JSON.stringify(schemaData);
  } else if (ldJsonEl) {
    ldJsonEl.remove();
  }
}

export default function SEOHead(props: SEOHeadProps) {
  useEffect(() => {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
    updatePageSEO(currentPath, props);
  }, [props.title, props.description, props.canonicalPath, props.noindex, props.ogImage, props.ogType]);

  return null;
}
