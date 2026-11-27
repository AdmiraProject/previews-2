
window.ADM = (function () {
  const L = (n) => `https://admiraproject.github.io/previews-2/admira-v2/assets/logos/${n}.svg`;
  const ICONS = ['meta', 'googleads', 'tiktok', 'linkedin', 'x', 'amazon', 'microsoft', 'openai', 'snapchat', 'pinterest', 'youtube', 'googleanalytics', 'hubspot', 'salesforce', 'whatsapp', 'instagram', 'shopify', 'stripe', 'slack', 'googlesheets', 'webflow', 'reddit'];
  const SKILL = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 1.5h5l3.5 3.5v9.5h-8.5z"/><path d="M9 1.5V5h3.5M6 8.5h4M6 11h4"/></svg>';
  const TOOL = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2.5 8a5.5 5.5 0 1011 0 5.5 5.5 0 00-11 0zM8 2.5v11M2.5 8h11"/></svg>';
  const CHIPS = [
    ['meta', 'Meta Ads'], ['googleads', 'Google Ads'], ['tiktok', 'TikTok Ads'], ['linkedin', 'LinkedIn Ads'], ['x', 'X Ads'],
    ['amazon', 'Amazon Ads'], ['microsoft', 'Microsoft Ads'], ['openai', 'OpenAI Ads'], ['snapchat', 'Snapchat Ads'], ['pinterest', 'Pinterest Ads'],
    ['hubspot', 'HubSpot'], ['salesforce', 'Salesforce'], ['zoho-crm-icon', 'Zoho CRM'], ['odoo-icon', 'Odoo'], ['calendly', 'Calendly'],
    ['whatsapp', 'WhatsApp'], ['instagram', 'Instagram'], ['facebook', 'Messenger'], ['telegram', 'Telegram'], ['gmail', 'Gmail'],
    ['googleanalytics', 'Google Analytics'], ['google', 'Search Console'], ['youtube', 'YouTube'], ['reddit', 'Reddit Ads'], ['webflow', 'Webflow'],
    ['shopify', 'Shopify'], ['stripe', 'Stripe'], ['mercadopago', 'Mercado Pago'], ['klarna', 'Klarna'], ['googlesheets', 'Google Sheets'],
    ['slack', 'Slack'], ['notion', 'Notion'], ['zapier', 'Zapier'], ['chatgpt', 'ChatGPT'], ['claude', 'Claude'],
    ['t:Admira pixel', 'Admira pixel'], ['t:UTM builder', 'UTM builder'], ['t:Lead scoring', 'Lead scoring'], ['t:Cohorts', 'Cohorts'], ['t:Funnel builder', 'Funnel builder'],
    ['t:Journeys', 'Journeys'], ['t:Sankey flows', 'Sankey flows'], ['t:Geo maps', 'Geo maps'], ['t:Debugger', 'Event debugger'], ['t:Your own system', 'Own system API'],
    ['s', 'Weekly report'], ['s', 'Budget pacing'], ['s', 'Lead source audit'], ['s', 'Channel mapping'], ['s', 'Goal forecast'],
    ['s', 'W-shaped model'], ['s', 'Time decay'], ['s', 'First touch'], ['s', 'Last touch'], ['s', 'Linear'],
  ];
  const chipHtml = ([k, n]) => k === 's' ? `<div class="chip s">${SKILL}${n}</div>` : k.startsWith('t:') ? `<div class="chip t">${TOOL}${n}</div>` : `<div class="chip"><img src="https://admiraproject.github.io/previews-2/admira-v2/assets/logos/${k}.${k === 'zoho-crm-icon' ? 'png' : 'svg'}" alt="">${n}</div>`;
  const FAQ = [
    ['What is Admira?', 'Admira is one AI platform for ads, attribution and ROI. It connects your ad accounts, CRM and website, traces every touch to revenue with multi-touch attribution, and lets you ask Admira AI what is working and what to change.'],
    ['How long do setup and onboarding take?', 'Our technical setup is a quick process, taking only minutes. The full onboarding experience, including dashboard setup and team training, is completed within two weeks.'],
    ['Can I customize the dashboards?', 'Admira offers fully customizable dashboards. Tailor every element from columns to metrics through our user-friendly interface.'],
    ['What is cookieless tracking?', 'Admira uses cookieless tracking by default, respecting user privacy and complying with legislation. However, you have the choice to enable cookie-based tracking if needed.'],
    ['How do you match contacts across platforms?', 'With fingerprinting. Admira recognizes each visitor from their first click, then links them to a real contact the moment they share an email or phone, by form, WhatsApp or your CRM. Every ad, visit and sale lands on one profile.'],
    ['How does Admira AI keep its numbers right?', 'Admira AI answers from your connected ad accounts, CRM and pixel data, and shows the sources behind every number. Changes to campaigns wait for your approval.'],
    ['What if an integration is missing?', "If Admira doesn't currently support a tool you use, reach out to us, and we'll develop an integration tailored to your needs."],
    ['Where is my data stored?', 'Your data is securely stored on AWS in Austin, adhering to the strictest privacy standards. Admira is GDPR and CCPA compliant and does not collect personal data by default.'],
  ];
  const faqHtml = () => FAQ.map(([q, a]) => `<div class="q"><button>${q}<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 6l4 4 4-4"/></svg></button><div class="a"><div><p>${a}</p></div></div></div>`).join('');
  const TASKS = [['ga', 'Which campaign drove the most revenue?'], ['hubspot', 'Map lead sources to channels'], ['meta', 'Pause ads with no deals'], ['slack', 'Send the weekly report'], ['googleads', 'Move $300/day to Search'], ['whatsapp', 'Score WhatsApp leads'], ['ad', 'Forecast this month’s goal'], ['linkedin', 'Find our best audience']];
  const TOOLS = [['meta', 'Meta Ads'], ['googleads', 'Google Ads'], ['hubspot', 'HubSpot'], ['slack', 'Slack'], ['whatsapp', 'WhatsApp'], ['salesforce', 'Salesforce'], ['linkedin', 'LinkedIn Ads'], ['googleanalytics', 'Analytics']];
  const ico = (k) => k === 'ad' ? 'https://admiraproject.github.io/previews-2/admira-v2/assets/brand/admira-icon-gradient.svg' : k === 'ga' ? L('googleanalytics') : L(k);
  return { L, ICONS, CHIPS, chipHtml, FAQ, faqHtml, TASKS, TOOLS, ico };
})();
