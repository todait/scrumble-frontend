import { onCLS, onFCP, onFID, onLCP, onTTFB } from 'web-vitals';

const vitalsUrl = 'https://vitals.vercel-analytics.com/v1/vitals';

function getConnectionSpeed() {
  const nav = navigator as any;
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
  return conn ? conn.effectiveType : '';
}

export function sendToAnalytics(metric: any) {
  const analyticsId = process.env.NEXT_PUBLIC_ANALYTICS_ID;
  
  if (!analyticsId) {
    return;
  }

  const body = {
    dsn: analyticsId,
    id: metric.id,
    page: window.location.pathname,
    href: window.location.href,
    event_name: metric.name,
    value: metric.value.toString(),
    speed: getConnectionSpeed(),
  };

  const blob = new Blob([new URLSearchParams(body).toString()], {
    type: 'application/x-www-form-urlencoded',
  });
  
  if (navigator.sendBeacon) {
    navigator.sendBeacon(vitalsUrl, blob);
  } else {
    fetch(vitalsUrl, {
      body: blob,
      method: 'POST',
      credentials: 'omit',
      keepalive: true,
    });
  }
}

export function reportWebVitals() {
  try {
    onCLS((metric) => sendToAnalytics(metric));
    onFCP((metric) => sendToAnalytics(metric));
    onFID((metric) => sendToAnalytics(metric));
    onLCP((metric) => sendToAnalytics(metric));
    onTTFB((metric) => sendToAnalytics(metric));
  } catch (err) {
    console.error('[Web Vitals]', err);
  }
}