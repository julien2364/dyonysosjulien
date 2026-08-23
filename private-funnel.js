(()=>{
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const format=value=>new Intl.NumberFormat('fr-FR').format(Number(value)||0);
  const renderFunnel=(title,steps)=>{
    const total=Math.max(1,Number(steps?.[0]?.visitors)||0);
    return `<section class="dy-funnel"><div class="dy-funnel-title"><h3>${esc(title)}</h3><span>30 jours</span></div><div class="dy-funnel-steps">${(steps||[]).map((step,index)=>{
      const value=Number(step.visitors)||0,share=Math.min(100,Math.round(value/total*100)),previous=index?Number(steps[index-1].visitors)||0:0,transition=index?(previous?Math.round(value/previous*100):0):100;
      const transitionLabel=!index?'Audience de référence':previous?`${transition}% depuis l’étape précédente${transition>100?' · accès directs inclus':''}`:value?'Accès direct ou donnée antérieure':'Aucun passage mesuré';
      return `<div class="dy-funnel-step"><div class="dy-funnel-label"><strong>${index+1}. ${esc(step.label)}</strong><span>${format(value)} visiteur${value>1?'s':''}</span></div><div class="dy-funnel-track"><i style="width:${Math.max(value?4:0,share)}%"></i></div><div class="dy-funnel-rate"><span>${share}% des visiteurs du site</span><b>${transitionLabel}</b></div></div>`;
    }).join('')}</div></section>`;
  };
  const load=async()=>{
    const body=document.querySelector('#dyAnalyticsBody');if(!body||document.querySelector('#dashboard.hidden'))return;
    try{
      const response=await fetch('/api/analytics',{credentials:'same-origin'});if(!response.ok)return;
      const data=await response.json();if(!data.funnels)return;
      let container=document.querySelector('.dy-funnels');if(!container){container=document.createElement('section');container.className='dy-funnels';body.prepend(container)}
      container.innerHTML=`<div class="dy-funnels-head"><div><h3>Entonnoirs de conversion</h3><p>Parcours des visiteurs sur les 30 derniers jours.</p></div><span class="dy-private-badge">Visible uniquement dans votre espace privé</span></div><div class="dy-funnels-grid">${renderFunnel('Découverte des produits',data.funnels.products)}${renderFunnel('Formation & Conseil',data.funnels.services)}</div><p class="dy-funnel-note">Les taux reposent sur des visiteurs agrégés et anonymisés. Les accès directs par Google peuvent contourner une étape. Le suivi des formulaires envoyés commence à partir de cette mise à jour et n’est pas rétroactif.</p>`;
    }catch{}
  };
  setTimeout(load,900);document.querySelector('#loginForm')?.addEventListener('submit',()=>setTimeout(load,1300));document.addEventListener('click',event=>{if(event.target?.id==='dyAnalyticsRefresh')setTimeout(load,800)});
})();
