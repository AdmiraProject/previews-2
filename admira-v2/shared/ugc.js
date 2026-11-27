
window.AdmUGC = function (base = '../') {
  const A = base + 'assets/ugc/';
  const audit = [
    ['Tracking', 95, '#16A34A', ['Admira pixel fires on all 14 landing pages.', 'Form submits matched to CRM contacts.']],
    ['Attribution', 91, '#16A34A', ['W-shaped model credits upper-funnel clicks.', 'Offline deals synced from HubSpot.']],
    ['Lead source', 68, '#DC2626', ['32% of deals have no source in the CRM.', 'Map the "Origen" field to channels.']],
    ['Budget', 74, '#D97706', ['Display spend has no attributed revenue.', 'Move 15% to Search – Brand.']],
    ['Channels', 89, '#16A34A', ['WhatsApp leads grouped under Paid Social.', 'Organic and referral split correctly.']],
    ['Goals', 63, '#DC2626', ['No monthly sales goal set yet.', 'Add a goal to forecast pacing.']],
  ];
  const auditHtml = audit.map(([k, n, c, d]) => `<div class="it"><div><div class="k">${k}</div><div class="n" style="color:${c}">${n}<small>%</small></div></div><ul class="d">${d.map(x => `<li>${x}</li>`).join('')}</ul></div>`).join('');
  const rows = [
    ['Search – Brand', 48, '$21', 'SCALE', '#0F7A45', 'rgba(95,214,160,.22)'],
    ['Meta – Retargeting', 0, '$148', 'PAUSE', '#B91C1C', 'rgba(248,113,113,.18)'],
    ['Meta – Lookalike 1%', 31, '$34', 'SCALE', '#0F7A45', 'rgba(95,214,160,.22)'],
    ['Display – Remarketing', 1, '$96', 'PAUSE', '#B91C1C', 'rgba(248,113,113,.18)'],
    ['LinkedIn – Directors', 12, '$58', 'KEEP', '#124AFF', 'rgba(18,74,255,.1)'],
    ['TikTok – UGC Hook', 0, '$0', 'SCANNING', '#124AFF', 'rgba(18,74,255,.06)'],
    ['Search – Competitors', 9, '$61', 'Pending', '#9CA3AF', '#F3F4F6'],
    ['Meta – Advantage+', 22, '$39', 'Pending', '#9CA3AF', '#F3F4F6'],
    ['Google PMax', 0, '$84', 'Pending', '#9CA3AF', '#F3F4F6'],
    ['WhatsApp CTWA', 17, '$27', 'Pending', '#9CA3AF', '#F3F4F6'],
  ];
  const optHtml = rows.map(([n, l, c, b, fc, bg]) => `<div class="or"><span class="on">${n}</span><span class="ol" style="color:${l ? '#16A34A' : '#9CA3AF'}">${l}</span><span class="oc" style="color:${parseInt(c.slice(1)) > 80 ? '#DC2626' : '#15191D'}">${c}</span><span class="ob" style="color:${fc};background:${bg}">${b === 'SCANNING' ? '<i></i>Scanning' : b}</span></div>`).join('');
  return `
<section class="sec ugc" id="inside"><div class="in">
  <h2 class="h2 hd rv">See what Admira does inside your account</h2>
  <div class="row rv">
    <div class="card"><video data-auto loop muted playsinline preload="metadata" poster="https://cdn.prod.website-files.com/660b7c74d20e45c2022e472a/6b08cbaddb7afa655b92a71d_nh-inside-analyst.jpg" src="https://cdn.prod.website-files.com/660b7c74d20e45c2022e472a/6b08cbbbdb7afa655b92aa82_nh-inside-analyst.mp4"></video>
      <div class="pill">Analyze account</div>
      <div class="ov" style="right:6%;top:9%"><div class="t"><span>ROAS</span><span>2.91×</span></div><div class="bar"><i style="--w:72%"></i></div><ul><li>Search – Brand drives 41% of revenue</li><li>Display has no attributed deals</li></ul></div>
      <div class="ov" style="left:6%;top:56%"><div class="t"><span>Pipeline</span><span>+27%</span></div><div class="bar"><i style="--w:84%"></i></div><ul><li>930 qualified leads this quarter</li><li>WhatsApp closes fastest</li></ul></div>
      <span class="lab">AI analyst</span></div>
    <div class="card"><video data-auto loop muted playsinline preload="metadata" poster="https://cdn.prod.website-files.com/660b7c74d20e45c2022e472a/6b08cbab5962d4a17bfcf52a_nh-inside-ai.jpg" src="https://cdn.prod.website-files.com/660b7c74d20e45c2022e472a/6b08cbb574b94a03ab0f84ad_nh-inside-ai.mp4"></video><span class="lab">Ask Admira AI</span></div>
    <div class="card"><div class="scroll"><div class="tk">${auditHtml}${auditHtml}</div></div><span class="lab" style="color:#fff">Tracking audit</span></div>
    <div class="card"><video data-auto loop muted playsinline preload="metadata" poster="https://cdn.prod.website-files.com/660b7c74d20e45c2022e472a/6b08cbab74b94a03ab0f819b_nh-inside-channels.jpg" src="https://cdn.prod.website-files.com/660b7c74d20e45c2022e472a/6b08cbb50bef7669cb4a283b_nh-inside-channels.mp4" style="object-position:0 50%"></video><span class="lab">Channel overview</span></div>
    <div class="card"><div class="scroll opt"><div class="oh"><span>Campaign</span><span>Deals</span><span>CPL</span><span>Action</span></div>${optHtml}</div><span class="lab">Budget optimization</span></div>
  </div>
</div></section>`;
};
