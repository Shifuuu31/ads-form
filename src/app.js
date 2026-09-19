(function(){
'use strict';

/* ---------- helpers ---------- */
var LS_KEY='cle-bien-espoir-meta-ads-v1';
var THEME_KEY='cle-bien-espoir-theme-v1';
var arr=function(x){return Array.isArray(x)?x:[]};
var has=function(a,x){return arr(a).indexOf(x)>=0};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var num=function(x){
  var s=String(x==null?'':x).replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d)}).replace(/[۰-۹]/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)}).replace(',','.').replace(/\s/g,'');
  var n=parseFloat(s); return isFinite(n)?n:NaN;
};
var H=function(fr,ar){return {fr:fr,ar:ar}};
var O=function(v,fr,ar,x){return Object.assign({v:v,fr:fr,ar:ar},x||{})};
var M=function(tone,fr,ar){return {tone:tone,fr:fr,ar:ar}};

/* ---------- interface texts ---------- */
var UI={
  title:H('Formulaire de campagne Ads','استمارة معلومات حملة Ads'),
  org:H('Association Clé du Bien et d’Espoir','جمعية مفتاح الخير والأمل'),
  skip:H('Aller au formulaire','الانتقال إلى الاستمارة'),
  nav:H('Sections du formulaire','أقسام الاستمارة'),
  progress:H('Progression du formulaire','تقدم تعبئة الاستمارة'),
  intro:H('Répondez simplement, à votre rythme. Tout est enregistré automatiquement : vous pouvez fermer la page et revenir plus tard. Aucune question n’est obligatoire — si vous ne savez pas, passez à la suivante.',
          'أجيبوا ببساطة وعلى مهلكم. كل شيء يُحفظ تلقائيا: يمكنكم إغلاق الصفحة والعودة لاحقا. لا يوجد سؤال إجباري — إذا لم تعرفوا الجواب، انتقلوا إلى السؤال الموالي.'),
  summary:H('Résumé','الملخص'),
  pdf:H('Exporter en PDF','تصدير PDF'),
  pdfBusy:H('Préparation du PDF…','جارٍ تجهيز PDF…'),
  pdfEmpty:H('Aucune réponse à exporter pour le moment.','لا توجد إجابات للتصدير حاليا.'),
  pdfReady:H('Choisissez « Enregistrer au format PDF » dans la fenêtre d’impression.','اختاروا «حفظ كملف PDF» في نافذة الطباعة.'),
  pdfMetaDate:H('Date d’export','تاريخ التصدير'),
  pdfMetaSaved:H('Dernier enregistrement','آخر حفظ'),
  pdfMetaLang:H('Langue','اللغة'),
  pdfMetaFill:H('Progression','نسبة التعبئة'),
  pdfFoot:H('Document généré depuis le formulaire de campagne Ads.','وثيقة مُنشأة من استمارة حملة Ads.'),
  clear:H('Effacer','مسح'),
  na:H('N/A','بدون جواب'),
  themeLight:H('Mode clair','الوضع الفاتح'),
  themeDark:H('Mode sombre','الوضع الداكن'),
  sumTitle:H('Résumé à envoyer','ملخص للإرسال'),
  copy:H('Copier','نسخ'), copied:H('Copié ✓','تم النسخ ✓'), close:H('Fermer','إغلاق'),
  other:H('Autre','أخرى'), specify:H('Précisez…','حدّدوا…'),
  rec:H('Conseillé','مقترح'),
  dbOn:H('Base de données connectée','قاعدة البيانات متصلة'),
  dbOff:H('Sur cet appareil seulement','على هذا الجهاز فقط'),
  dbErr:H('Accès MongoDB impossible','تعذر الوصول إلى MongoDB'),
  dbWait:H('Connexion en cours','جارٍ الاتصال'),
  last:H('Dernier enregistrement : ','آخر حفظ: '),
  st:{
    ready:H('Enregistrement automatique activé','الحفظ التلقائي مفعّل'),
    restored:H('Brouillon retrouvé — vous pouvez continuer','تم استرجاع المسودة — يمكنكم المتابعة'),
    typing:H('Enregistrement du brouillon…','جارٍ حفظ المسودة…'),
    saved:H('✓ Enregistré automatiquement','✓ تم الحفظ تلقائيا'),
    local:H('✓ Enregistré localement','✓ تم الحفظ محليا'),
    db_err:H('⚠ Échec de la synchronisation','⚠ فشل المزامنة')
  }
};
var answersTxt=function(n,m,L){return L==='fr'?(n+' réponses sur '+m):(n+' إجابة من '+m)};

/* ---------- defaults (pre-filled from the original form) ---------- */
var DEFAULTS={
  assoc_name:'Association Clé du Bien et d’Espoir — جمعية مفتاح الخير والأمل',
  city:'Marrakech',
  address:'quartier daoudiate, Marrakesh, Morocco, 40000',
  facebook:'facebook.com/profile.php?id=100082365777043',
  phone:'0626739660',
  contact_person:'Mr. Badr'
};

/* ---------- option lists ---------- */
var YN=[O('yes','Oui','نعم'),O('no','Non','لا')];
var TRAININGS=[
  O('women_hair','Coiffure femmes et beauté','حلاقة النساء والتجميل'),
  O('men_hair','Coiffure hommes (barbier)','حلاقة الرجال'),
  O('sewing','Couture et confection','الخياطة والتفصيل'),
  O('cooking','Cuisine et pâtisserie','الطبخ والحلويات')
];
var INTERESTS={
  women_hair:[O('i_beauty','Beauté','التجميل'),O('i_hair','Coiffure','تصفيف الشعر'),O('i_makeup','Maquillage','المكياج'),O('i_skin','Soins de la peau','العناية بالبشرة')],
  men_hair:[O('i_barber','Barbier','حلاقة الرجال'),O('i_menstyle','Coiffures homme','تسريحات الرجال'),O('i_beard','Soin de la barbe','العناية باللحية')],
  sewing:[O('i_sewing','Couture','الخياطة'),O('i_fashion','Mode','الموضة'),O('i_caftan','Caftan et broderie','القفطان والتطريز')],
  cooking:[O('i_cooking','Cuisine','الطبخ'),O('i_pastry','Pâtisserie','الحلويات'),O('i_recipes','Recettes','وصفات'),O('i_moroccan','Cuisine marocaine','المطبخ المغربي')]
};
var GENERAL_INT=[
  O('i_training','Formation professionnelle','التكوين المهني'),
  O('i_jobs','Emploi','الشغل'),
  O('i_entre','Entrepreneuriat / créer un projet','ريادة الأعمال / مشروع خاص')
];
var CTA_BY_GOAL={registrations:'register',leads:'register',whatsapp:'whatsapp',messenger:'contact',calls:'call',awareness:'learn'};
var CH_BY_GOAL={whatsapp:'whatsapp',messenger:'messenger',calls:'phone',leads:'leadform'};

function selTrain(v){
  return arr(v.trainings).map(function(t){
    if(t==='__other') return O('__other',v.trainings_other||'Autre formation',v.trainings_other||'تكوين آخر');
    return TRAININGS.filter(function(o){return o.v===t})[0];
  }).filter(Boolean);
}
function suggestGender(v){
  var t=arr(v.trainings); if(!t.length) return '';
  if(t.every(function(x){return x==='women_hair'})) return 'women';
  if(t.every(function(x){return x==='men_hair'})) return 'men';
  if(t.every(function(x){return x==='women_hair'||x==='men_hair'})) return 'all';
  return '';
}
function campDays(v){
  if(!v.camp_start||!v.camp_end||v.camp_end<v.camp_start) return 0;
  return Math.round((new Date(v.camp_end)-new Date(v.camp_start))/864e5)+1;
}
var fmt=function(n){return String(Math.round(n*100)/100)};

/* ---------- the questions, in a logical order ---------- */
var SECTIONS=[],ALL=[],FIELD={};
var SECTION_HELP={
  association:H('Identify the association, its contacts, and the information used to prepare the campaign.','تحديد الجمعية وبيانات الاتصال والمعلومات المستعملة لإعداد الحملة.'),
  training:H('Describe the training offer so the campaign message reflects what is actually provided.','وصف التكوين حتى تعكس الرسالة الإعلانية العرض الحقيقي.'),
  audience:H('Define the people and locations the campaign should reach.','تحديد الأشخاص والمناطق التي يجب أن تصل إليها الحملة.'),
  message:H('Capture the strongest benefits and wording for the advertising message.','جمع أهم الفوائد والعبارات المناسبة للرسالة الإعلانية.'),
  objective:H('Set the campaign goal and the action people should take.','تحديد هدف الحملة والإجراء المطلوب من المهتمين.'),
  requests:H('Choose where enquiries arrive and how the association will respond.','اختيار مكان وصول الطلبات وكيفية الرد عليها.'),
  budget:H('Use dates and budget details to plan campaign delivery.','استعمال الميزانية والتواريخ لتخطيط الحملة.'),
  content:H('List the media and permissions available for the advertisements.','حصر المحتوى والتراخيص المتاحة للإعلانات.'),
  additional:H('Record legal, partner, and operational notes before publishing.','تسجيل الملاحظات القانونية والتنظيمية قبل النشر.')
};
var SECTION_KEY={'fi-rr-home':'association','fi-rr-graduation-cap':'training','fi-rr-target':'audience','fi-rr-comment-alt':'message','fi-rr-rocket-lunch':'objective','fi-rr-inbox':'requests','fi-rr-coins':'budget','fi-rr-picture':'content','fi-rr-check-circle':'additional'};
function sec(icon,fr,ar,fields){var key=SECTION_KEY[icon]||icon;SECTIONS.push({key:key,icon:icon,title:H(fr,ar),description:SECTION_HELP[key],fields:fields});fields.forEach(function(f){ALL.push(f);FIELD[f.id]=f})}
function Q(id,type,fr,ar,x){return Object.assign({id:id,type:type,label:H(fr,ar)},x||{})}

sec('fi-rr-home','L’association','الجمعية',[
  Q('assoc_name','text','Nom de l’association','اسم الجمعية'),
  Q('assoc_description','area','Description de l’association','وصف الجمعية',{hint:H('Describe the mission, beneficiaries, and activities. This is used to write accurate campaign messages.','صفوا مهمة الجمعية والمستفيدين وأنشطتها. تستعمل هذه المعلومات لكتابة رسائل إعلانية دقيقة.')}),
  Q('city','text','Ville','المدينة'),
  Q('address','text','Adresse complète','العنوان الكامل'),
  Q('facebook','text','Lien de la page Facebook','رابط صفحة Facebook',{ltr:true,ph:H('facebook.com/…','facebook.com/…')}),
  Q('fb_admin','radio','Avons-nous un accès administrateur à la page Facebook ?','هل لدينا صلاحية مسؤول (Admin) على صفحة Facebook؟',
    {hint:H('Il est nécessaire pour lancer la publicité.','هي ضرورية لإطلاق الإعلان.'),
     opts:[O('yes','Oui, nous sommes administrateurs','نعم، نحن مسؤولون عن الصفحة'),O('no','Non','لا'),O('unsure','Je ne sais pas','لا أعرف')]}),
  {id:'fb_info',type:'info',sub:true,text:function(v){
    return (v.fb_admin==='no'||v.fb_admin==='unsure')?M('warn','Demandez à la personne qui a créé la page de vous ajouter comme administrateur avant le lancement.','اطلبوا من الشخص الذي أنشأ الصفحة أن يضيفكم كمسؤولين قبل إطلاق الحملة.'):null}},
  Q('has_instagram','radio','Avez-vous un compte Instagram ?','هل لديكم حساب Instagram؟',{opts:YN}),
  Q('instagram','text','Lien du compte Instagram','رابط حساب Instagram',{sub:true,ltr:true,ph:H('instagram.com/…','instagram.com/…'),show:function(v){return v.has_instagram==='yes'}}),
  Q('phone','text','Numéro de téléphone','رقم الهاتف',{ltr:true,mode:'tel'}),
  Q('phone_whatsapp','radio','Ce numéro est-il aussi sur WhatsApp ?','هل هذا الرقم متوفر أيضا على WhatsApp؟',{opts:YN}),
  Q('whatsapp_number','text','Numéro WhatsApp','رقم WhatsApp',{sub:true,ltr:true,mode:'tel',show:function(v){return v.phone_whatsapp==='no'}}),
  Q('contact_person','text','Responsable du suivi de la campagne','الشخص المسؤول عن متابعة الحملة'),
  Q('platform','checks','Plateformes publicitaires souhaitées','منصات الإعلانات المطلوبة',{other:true,opts:[O('google','Google Ads','Google Ads'),O('meta','Meta / Facebook','Meta / Facebook'),O('instagram','Instagram','Instagram'),O('tiktok','TikTok','TikTok')]})
]);

sec('fi-rr-graduation-cap','La formation','التكوين',[
  Q('trainings','checks','Quelle formation voulez-vous promouvoir ?','ما هو التكوين الذي تريدون الترويج له؟',
    {hint:H('Vous pouvez en choisir plusieurs.','يمكنكم اختيار أكثر من تكوين.'),opts:TRAININGS,other:true}),
  Q('priority','radio','Quelle formation est la priorité ?','ما هو التكوين ذو الأولوية؟',
    {sub:true,hint:H('Celle qu’on met le plus en avant dans la campagne.','التكوين الذي سيتم إبرازه أكثر في الحملة.'),
     show:function(v){return arr(v.trainings).length>=2},
     opts:function(v){return selTrain(v).concat([O('equal','Toutes de la même façon','جميعها بنفس الدرجة')])}}),
  Q('details_scope','radio','Les informations ci-dessous (date, durée, prix) concernent…','المعلومات الموالية (التاريخ، المدة، السعر) تخص…',
    {sub:true,show:function(v){return arr(v.trainings).length>=2},
     opts:[O('all','Toutes les formations','جميع التكوينات'),O('priority','Seulement la formation prioritaire','التكوين ذو الأولوية فقط')]}),
  Q('details_other','area','Date, durée et prix des autres formations','التاريخ والمدة والسعر بالنسبة للتكوينات الأخرى',
    {sub:true,show:function(v){return arr(v.trainings).length>=2&&v.details_scope==='priority'}}),
  Q('start_mode','radio','Quand commence la formation ?','متى يبدأ التكوين؟',
    {opts:[O('fixed','À une date précise','في تاريخ محدد'),O('notyet','Pas encore fixé','لم يُحدد بعد'),O('rolling','Inscription ouverte toute l’année','التسجيل مفتوح طوال السنة')]}),
  Q('start_date','date','Date de début','تاريخ بداية التكوين',{sub:true,show:function(v){return v.start_mode==='fixed'}}),
  Q('reg_deadline','date','Date limite d’inscription (si elle existe)','آخر أجل للتسجيل (إن وجد)',{sub:true,show:function(v){return v.start_mode==='fixed'}}),
  Q('duration','radio','Durée de la formation','مدة التكوين',
    {other:true,opts:[O('1w','1 semaine','أسبوع واحد'),O('2w','2 semaines','أسبوعان'),O('1m','1 mois','شهر واحد'),O('2m','2 mois','شهران'),O('3m','3 mois','3 أشهر'),O('6m','6 mois','6 أشهر'),O('1y','1 an','سنة واحدة')]}),
  Q('price_type','radio','Quel est le prix ?','ما هو السعر؟',
    {opts:[O('free','Gratuit','مجاني'),O('symbolic','Frais symboliques','رسوم رمزية'),O('paid','Payant','مؤدى عنه')]}),
  Q('price','num','Montant','المبلغ',{sub:true,unit:H('MAD','درهم'),show:function(v){return v.price_type==='symbolic'||v.price_type==='paid'}}),
  Q('price_period','radio','Ce montant est…','هذا المبلغ هو…',{sub:true,show:function(v){return v.price_type==='symbolic'||v.price_type==='paid'},
    opts:[O('total','Pour toute la formation','للتكوين كاملا'),O('monthly','Par mois','شهريا')]}),
  Q('installments','check','Paiement en plusieurs fois possible','إمكانية الأداء على دفعات',{sub:true,show:function(v){return v.price_type==='symbolic'||v.price_type==='paid'}})
]);

sec('fi-rr-target','Le public visé','الجمهور المستهدف',[
  Q('audience','checks','Qui voulez-vous toucher ?','من هو الجمهور المستهدف؟',
    {hint:H('Cochez tout ce qui convient.','اختاروا كل ما يناسب.'),other:true,
     opts:[O('youth','Jeunes','شباب'),O('jobseekers','Personnes en recherche d’emploi','باحثون/باحثات عن عمل'),O('women_fragile','Femmes en situation de précarité','نساء في وضعية هشة'),
           O('dropouts','Jeunes ayant quitté l’école','شباب غادروا الدراسة'),O('housewives','Femmes au foyer','ربات البيوت'),O('students','Étudiants','طلبة'),
           O('small_biz','Porteurs de petits projets','أصحاب مشاريع صغيرة'),O('career_change','Personnes voulant changer de métier','أشخاص يرغبون في تغيير المهنة')]}),
  Q('gender','radio','Cette formation s’adresse à…','هذا التكوين موجه إلى…',
    {hint:function(v){return S.auto.gender?H('Choisi selon la formation — vous pouvez le changer.','تم اختياره حسب التكوين — يمكنكم تغييره.'):null},
     opts:[O('all','Tout le monde','الجميع'),O('women','Femmes','نساء'),O('men','Hommes','رجال')]}),
  Q('age','agerange','Tranche d’âge','الفئة العمرية'),
  {id:'age_info',type:'info',sub:true,text:function(v){
    var a=num(v.age_min),b=num(v.age_max);
    return a>b?M('warn','L’âge minimum est plus grand que l’âge maximum.','الحد الأدنى للسن أكبر من الحد الأقصى.'):null}},
  Q('zone','radio','Où habitent les personnes visées ?','أين يقطن الأشخاص المستهدفون؟',
    {opts:[O('marrakech','Marrakech uniquement','مراكش فقط'),O('around','Marrakech et ses environs','مراكش ونواحيها'),O('other','Autres villes','مدن أخرى'),O('all','Tout le Maroc','كل المغرب')]}),
  Q('radius','radio','Jusqu’à quelle distance autour de Marrakech ?','إلى أي مسافة حول مراكش؟',
    {sub:true,show:function(v){return v.zone==='around'},opts:[O('10','10 km','10 كلم'),O('20','20 km','20 كلم'),O('30','30 km','30 كلم'),O('50','50 km','50 كلم')]}),
  Q('zone_other','text','Quelles villes ou régions ?','أي مدن أو جهات؟',{sub:true,show:function(v){return v.zone==='other'}}),
  Q('accept_outside','radio','Acceptez-vous des inscriptions de personnes qui habitent hors de la zone visée ?','هل يمكن قبول تسجيلات من خارج المنطقة المستهدفة؟',
    {sub:true,show:function(v){return !!v.zone&&v.zone!=='all'},
     opts:[O('yes','Oui','نعم'),O('no','Non','لا'),O('depends','Selon la formation','حسب نوع التكوين')]}),
  Q('outside_notes','text','Pour quelles formations ?','بالنسبة لأي تكوينات؟',{sub:true,show:function(v){return !!v.zone&&v.zone!=='all'&&v.accept_outside==='depends'}}),
  Q('exclusions','area','Zones ou groupes à exclure (si besoin)','مناطق أو فئات يجب استبعادها (إن وجدت)'),
]);

sec('fi-rr-comment-alt','L’offre et le message','العرض والرسالة الإعلانية',[
  Q('benefits','checks','Qu’est-ce que la personne gagne avec cette formation ?','ما الذي سيستفيده المتدرب من هذا التكوين؟',
    {hint:H('Choisissez les 1 à 3 plus importants.','اختاروا من 1 إلى 3 أهم الفوائد.'),other:true,
     opts:[O('job','Apprendre un vrai métier','تعلّم مهنة حقيقية'),O('employ','Trouver un emploi','إيجاد عمل'),O('own','Créer son propre projet','إنشاء مشروع خاص'),
           O('income','Gagner un revenu','تحقيق دخل'),O('practice','Beaucoup de pratique en atelier','تكوين تطبيقي في الورشة')]}),
  Q('certificate','radio','Un certificat est-il remis à la fin ?','هل تُسلَّم شهادة في نهاية التكوين؟',
    {opts:[O('assoc','Oui, une attestation de l’association','نعم، شهادة تسلّمها الجمعية'),O('official','Oui, un diplôme officiel','نعم، دبلوم رسمي'),O('no','Non','لا')]}),
  {id:'cert_info',type:'info',sub:true,text:function(v){
    return v.certificate==='official'?M('warn','Vérifiez que ce diplôme est bien reconnu avant de l’écrire dans l’annonce (voir section 9).','تأكدوا من أن هذا الدبلوم معترف به قبل ذكره في الإعلان (انظروا القسم 9).'):null}},
  Q('differentiators','checks','Qu’est-ce qui vous distingue des autres centres ?','ما الذي يميز هذا التكوين أو المركز عن غيره؟',
    {other:true,opts:[O('trainers','Formateurs expérimentés','مدربون ذوو خبرة'),O('practice','Beaucoup de pratique','تطبيق عملي كثير'),O('small','Petits groupes','مجموعات صغيرة'),
       O('equipment','Matériel fourni','توفير العتاد'),O('followup','Accompagnement après la formation','مواكبة بعد التكوين'),O('near','Centre proche et facile d’accès','مركز قريب وسهل الولوج'),O('hours','Horaires adaptés','توقيت مناسب')]}),
  Q('special_offer','checks','Y a-t-il une offre spéciale à mettre en avant ?','هل يوجد عرض خاص يمكن إبرازه في الإعلان؟',
    {opts:function(v){
       var o=[];
       if(v.price_type==='paid'||v.price_type==='symbolic') o.push(O('discount','Réduction / promotion','تخفيض / عرض خاص'));
       o.push(O('limited_seats','Nombre de places limité','عدد محدود من المقاعد'));
       o.push(O('early','Offre valable jusqu’à une date','عرض صالح إلى تاريخ معين'));
       o.push(O('none','Pas d’offre spéciale','لا يوجد عرض خاص',{excl:true}));
       return o;}}),
  Q('discount_text','text','Détail de la réduction','تفاصيل التخفيض',{sub:true,ph:H('Ex : -20 %, 1er mois offert','مثال: تخفيض 20٪، الشهر الأول مجانا'),show:function(v){return has(v.special_offer,'discount')&&(v.price_type==='paid'||v.price_type==='symbolic')}}),
  Q('seats','num','Nombre de places disponibles','عدد المقاعد المتوفرة',{sub:true,show:function(v){return has(v.special_offer,'limited_seats')}}),
  Q('offer_date','date','Offre valable jusqu’au','العرض صالح إلى غاية',{sub:true,show:function(v){return has(v.special_offer,'early')}}),
  Q('message','area','Le message principal en une phrase','الرسالة الأساسية في جملة واحدة',
    {ph:H('Ex : Apprenez un métier et construisez votre avenir à Marrakech','مثال: تعلّم مهنة وابنِ مستقبلك في مراكش')})
]);

sec('fi-rr-rocket-lunch','L’objectif de la campagne','هدف الحملة',[
  Q('goal','radio','Quel est le résultat le plus important pour vous ?','ما هي النتيجة الأهم بالنسبة لكم؟',
    {other:true,opts:[
      O('registrations','Inscriptions à la formation','التسجيلات في التكوين',{dfr:'Le but final : des personnes inscrites',dar:'الهدف النهائي: أشخاص مسجلون'}),
      O('leads','Demandes de contact (Leads)','طلبات تواصل (Leads)',{dfr:'Les personnes laissent leur nom et leur téléphone',dar:'يترك الأشخاص اسمهم ورقم هاتفهم'}),
      O('whatsapp','Messages WhatsApp','رسائل عبر WhatsApp',{dfr:'Les personnes vous écrivent sur WhatsApp',dar:'يراسلكم الأشخاص على WhatsApp'}),
      O('messenger','Messages Messenger','رسائل عبر Messenger'),
      O('calls','Appels téléphoniques','مكالمات هاتفية'),
      O('awareness','Faire connaître la formation','التعريف بالتكوين',{dfr:'Plus de gens voient l’annonce et connaissent l’association',dar:'أن يشاهد أكبر عدد من الناس الإعلان ويتعرفوا على الجمعية'})]}),
  Q('success','checks','À quoi verrez-vous que la campagne a réussi ?','بماذا ستقيسون نجاح الحملة؟',
    {other:true,opts:[O('reg_count','Nombre d’inscriptions','عدد التسجيلات'),O('contacts','Nombre de contacts / messages','عدد التواصلات / الرسائل'),O('cost','Un coût raisonnable par contact','تكلفة معقولة لكل تواصل'),
       O('reach','Nombre de personnes touchées','عدد الأشخاص الذين وصلهم الإعلان'),O('full','Groupe complet avant le début','اكتمال المجموعة قبل بداية التكوين')]}),
  Q('target_number','num','','',{label:function(v){
    if(v.goal==='registrations') return H('Nombre d’inscriptions visé','عدد التسجيلات المستهدف');
    if(v.goal==='awareness') return H('Nombre de personnes à toucher','عدد الأشخاص المراد الوصول إليهم');
    return H('Nombre de contacts visé','عدد التواصلات المستهدف');}}),
]);

sec('fi-rr-inbox','Recevoir les demandes','استقبال الطلبات والمتابعة',[
  Q('channel','radio','Où les personnes doivent-elles vous contacter ?','كيف تفضلون أن يتواصل معكم المهتمون؟',
    {other:true,
     hint:function(v){return S.auto.channel?H('Choisi selon votre objectif — vous pouvez le changer.','تم اختياره حسب هدفكم — يمكنكم تغييره.'):null},
     opts:function(v){
       var r=CH_BY_GOAL[v.goal],o=[];
       o.push(O('whatsapp','WhatsApp','WhatsApp',{rec:r==='whatsapp'}));
       o.push(O('messenger','Messenger','Messenger',{rec:r==='messenger'}));
       if(v.has_instagram==='yes') o.push(O('instagram','Instagram','Instagram'));
       o.push(O('phone','Appel téléphonique','مكالمة هاتفية',{rec:r==='phone'}));
       o.push(O('leadform','Formulaire Facebook (Lead Form)','نموذج Meta (Lead Form)',{rec:r==='leadform',dfr:'Un petit formulaire s’ouvre dans Facebook, sans quitter l’application',dar:'استمارة صغيرة تُفتح داخل Facebook دون مغادرة التطبيق'}));
       o.push(O('visit','Visite directe au centre','زيارة مباشرة للمركز'));
       return o;}}),
  {id:'channel_info',type:'info',sub:true,text:function(v){
    var c=v.channel;
    if(c==='whatsapp'){
      var n=v.phone_whatsapp==='yes'?v.phone:(v.phone_whatsapp==='no'?v.whatsapp_number:'');
      return n?M('ok','Numéro WhatsApp utilisé : '+n,'رقم WhatsApp المستعمل: '+n)
              :M('warn','Indiquez le numéro WhatsApp dans la section 1.','حدّدوا رقم WhatsApp في القسم 1.');}
    if(c==='phone') return v.phone?M('ok','Numéro d’appel : '+v.phone,'رقم الاتصال: '+v.phone):M('warn','Indiquez le numéro de téléphone dans la section 1.','حدّدوا رقم الهاتف في القسم 1.');
    if(c==='messenger') return v.facebook?M('ok','Les messages arriveront sur votre page Facebook.','ستصلكم الرسائل على صفحة Facebook الخاصة بكم.'):M('warn','Indiquez le lien de la page Facebook dans la section 1.','حدّدوا رابط صفحة Facebook في القسم 1.');
    if(c==='instagram') return v.instagram?M('ok','Compte utilisé : '+v.instagram,'الحساب المستعمل: '+v.instagram):M('warn','Indiquez le lien Instagram dans la section 1.','حدّدوا رابط Instagram في القسم 1.');
    return null;}},
  Q('visit_hours','text','Jours et horaires pour venir au centre','أيام وأوقات استقبال الزوار بالمركز',{sub:true,show:function(v){return v.channel==='visit'}}),
  Q('handler_same','check','C’est le responsable de la campagne qui répond aux demandes','المسؤول عن الحملة هو من سيرد على الطلبات'),
  Q('handler','text','Nom de la personne ou de l’équipe qui répond','اسم الشخص أو الفريق الذي سيرد',{sub:true,show:function(v){return !v.handler_same}}),
  Q('response_time','radio','En combien de temps répondez-vous ?','خلال كم من الوقت ستردون؟',
    {hint:H('Plus la réponse est rapide, plus les personnes s’inscrivent.','كلما كان الرد أسرع زاد عدد المسجلين.'),
     opts:[O('hour','Dans l’heure','خلال ساعة'),O('day','Dans la journée','في نفس اليوم'),O('24h','Sous 24 h','خلال 24 ساعة')]}),
  Q('availability','text','Jours et heures où vous répondez','الأيام والساعات التي ستردون فيها',{sub:true,ph:H('Ex : du lundi au samedi, 9h–18h','مثال: من الإثنين إلى السبت، من 9 صباحا إلى 6 مساء')}),
  Q('next_steps','checks','Que se passe-t-il après le premier contact ?','ما هي الخطوات بعد أول تواصل مع الشخص المهتم؟',
    {other:true,opts:function(v){
       var o=[O('callback','Rappeler la personne','الاتصال بالشخص'),O('wa_info','Envoyer les détails par WhatsApp','إرسال التفاصيل عبر WhatsApp'),O('visit','Inviter à visiter le centre','دعوة لزيارة المركز'),
              O('interview','Petit entretien d’orientation','مقابلة توجيه قصيرة'),O('file','Remplir un dossier d’inscription','ملء ملف التسجيل')];
       if(v.price_type==='paid'||v.price_type==='symbolic') o.push(O('payment','Confirmer avec un versement','تأكيد التسجيل بدفعة مالية'));
       return o;}}),
  Q('reg_info','checks','Quelles informations demander à la personne intéressée ?','ما هي المعلومات المطلوبة عند التسجيل؟',
    {other:true,
     hint:function(v){return v.channel==='leadform'?H('Ce seront les champs du formulaire Facebook. Moins il y en a, plus les gens le remplissent.','ستكون هذه هي خانات استمارة Facebook. كلما قلّت الخانات زاد عدد من يملؤونها.'):null},
     opts:function(v){
       var o=[O('name','Nom et prénom','الاسم الكامل'),O('phone','Téléphone','رقم الهاتف'),O('city','Ville / quartier','المدينة / الحي'),O('age','Âge','السن'),O('email','Email','البريد الإلكتروني'),O('level','Niveau d’études','المستوى الدراسي')];
       if(arr(v.trainings).length>=2) o.push(O('training','Formation choisie','التكوين المختار'));
       o.push(O('avail','Disponibilités','أوقات التفرغ'));
       return o;}})
]);

sec('fi-rr-coins','Budget et calendrier','الميزانية والتواريخ',[
  Q('budget_type','radio','Comment voulez-vous fixer le budget ?','كيف تريدون تحديد الميزانية؟',
    {opts:[O('daily','Un montant par jour','مبلغ يومي'),O('total','Un budget total pour toute la campagne','ميزانية إجمالية لكل الحملة')]}),
  Q('budget','num','Budget','الميزانية المخصصة للحملة',{unit:H('MAD','درهم'),sub:true,show:function(v){return !!v.budget_type},
    hint:function(v){return v.budget_type==='daily'?H('Montant par jour, en dirhams.','المبلغ في اليوم، بالدرهم.'):H('Montant total, en dirhams.','المبلغ الإجمالي، بالدرهم.')},
    quick:function(v){return v.budget_type==='daily'?[50,100,200,500]:(v.budget_type==='total'?[3000,5000,10000,20000]:[])}}),
  Q('camp_start','date','Début de la campagne','تاريخ بداية الحملة'),
  Q('camp_end','date','Fin de la campagne','تاريخ نهاية الحملة'),
  {id:'budget_info',type:'info',sub:true,text:function(v){
    var b=num(v.budget),d=campDays(v);
    if(!(b>0)||!d||!v.budget_type) return null;
    return v.budget_type==='daily'
      ?M('ok','Environ '+fmt(b*d)+' MAD au total pour '+d+' jour(s).','حوالي '+fmt(b*d)+' درهم في المجموع خلال '+d+' يوما.')
      :M('ok','Environ '+fmt(b/d)+' MAD par jour pendant '+d+' jour(s).','حوالي '+fmt(b/d)+' درهم في اليوم خلال '+d+' يوما.');}},
  {id:'date_info',type:'info',sub:true,text:function(v){
    var fr=[],ar=[];
    if(v.camp_start&&v.camp_end&&v.camp_end<v.camp_start){fr.push('La fin de la campagne est avant son début.');ar.push('تاريخ نهاية الحملة قبل تاريخ بدايتها.')}
    if(v.start_mode==='fixed'&&v.start_date&&v.camp_end&&v.camp_end>v.start_date){fr.push('La campagne continue après le début de la formation. Est-ce voulu ?');ar.push('الحملة تستمر بعد بداية التكوين. هل هذا مقصود؟')}
    if(v.start_mode==='fixed'&&v.reg_deadline&&v.camp_end&&v.camp_end>v.reg_deadline){fr.push('La campagne dépasse la date limite d’inscription.');ar.push('الحملة تتجاوز آخر أجل للتسجيل.')}
    return fr.length?M('warn',fr.join(' '),ar.join(' ')):null;}},
  Q('past_ads','radio','Avez-vous déjà lancé des publicités sur Meta ?','هل سبق تشغيل إعلانات على Meta من قبل؟',{opts:YN}),
  Q('past_results','area','Résultats précédents (coût par inscription, nombre de contacts, remarques…)','النتائج السابقة (تكلفة التسجيل، عدد Leads، ملاحظات…)',{sub:true,show:function(v){return v.past_ads==='yes'}})
]);

sec('fi-rr-picture','Contenu disponible','المحتوى المتوفر',[
  Q('assets','checks','Qu’avez-vous déjà comme contenu ?','ما هو المحتوى المتوفر حاليا؟',
    {opts:[O('logo','Logo de l’association','شعار الجمعية'),O('center','Photos du centre','صور المركز'),O('trainings','Photos des formations','صور التكوينات'),O('trainees','Photos des stagiaires','صور المتدربين'),
           O('trainers','Photos des formateurs','صور المدربين'),O('videos','Vidéos','فيديوهات'),O('testimonials','Témoignages d’anciens stagiaires','شهادات/آراء متدربين سابقين'),O('posters','Affiches','ملصقات إعلانية'),
           O('none','Rien pour le moment','لا شيء حاليا',{excl:true})]}),
  Q('drive_link','text','Lien du dossier (Drive ou autre)','رابط مجلد الملفات (Drive أو غيره)',
    {sub:true,ltr:true,hint:H('Mettez-y tous les fichiers puis collez le lien ici.','ضعوا فيه كل الملفات ثم الصقوا الرابط هنا.'),
     show:function(v){var a=arr(v.assets);return a.length>0&&!has(a,'none')}}),
  Q('photo_permission','radio','Peut-on utiliser les photos des stagiaires (et leurs témoignages) dans les annonces ?','هل يمكن استخدام صور المتدربين (وشهاداتهم) في الإعلانات؟',
    {sub:true,show:function(v){return has(v.assets,'trainees')||has(v.assets,'testimonials')},
     opts:[O('yes','Oui','نعم'),O('no','Non','لا'),O('confirm','À confirmer avant','يحتاج إلى تأكيد مسبق')]})
]);

sec('fi-rr-check-circle','Informations complémentaires','معلومات إضافية',[
  Q('partners','checks','Partenaires ou organismes officiels que l’on peut citer','شراكات أو جهات رسمية يمكن ذكرها في الحملة',
    {hint:H('Cochez seulement ceux dont vous avez l’autorisation.','اختاروا فقط الجهات التي لديكم إذن بذكرها.'),other:true,
     opts:[O('en','Entraide Nationale','التعاون الوطني'),O('indh','INDH','المبادرة الوطنية للتنمية البشرية'),O('ofppt','OFPPT','مكتب التكوين المهني وإنعاش الشغل'),O('commune','Commune / Conseil de la ville','الجماعة / مجلس المدينة'),
           O('none','Aucun partenaire à citer','لا توجد جهة لذكرها',{excl:true})]}),
  Q('legal_checks','area','Autorisations, agréments ou conditions légales à vérifier avant de publier','شروط قانونية أو اعتمادات/شهادات يجب التأكد منها قبل النشر'),
  Q('avoid','area','Mots ou informations à éviter dans l’annonce','عبارات أو معلومات يجب تجنّب استخدامها في الإعلان'),
  Q('notes','area','Autres remarques importantes','أي ملاحظات أو معلومات إضافية مهمة')
]);

/* ---------- state ---------- */
var S={lang:'ar',v:Object.assign({},DEFAULTS),auto:{},savedAt:null};
var dirty=false,db=null,restored=false,qEl={},sigs={},force={},curStatus='ready',dbMode='wait';
var $=function(id){return document.getElementById(id)};

/* ---------- generic rendering ---------- */
function optsOf(f){
  var o=typeof f.opts==='function'?f.opts(S.v):(f.opts||[]);
  if(f.type==='radio') o=o.concat([O('__na',UI.na.fr,UI.na.ar)]);
  if(f.other) o=o.concat([O('__other',UI.other.fr,UI.other.ar)]);
  return o;
}
function labelOf(f,lang){var l=typeof f.label==='function'?f.label(S.v):f.label;return l[lang||S.lang]}
function hintOf(f){var h=typeof f.hint==='function'?f.hint(S.v):f.hint;return h?h[S.lang]:''}
function otherSelected(f){return f.type==='radio'?S.v[f.id]==='__other':has(S.v[f.id],'__other')}

function groupHTML(f){
  var t=f.type==='radio'?'radio':'checkbox',L=S.lang,cur=S.v[f.id];
  var html='<div class="opts" role="'+(t==='radio'?'radiogroup':'group')+'" aria-labelledby="label_'+f.id+'">';
  optsOf(f).forEach(function(o){
    var on=t==='radio'?cur===o.v:has(cur,o.v);
    html+='<label class="opt'+(on?' on':'')+'"><input type="'+t+'"'+(t==='radio'?' name="n_'+f.id+'"':'')+' data-f="'+f.id+'" value="'+esc(o.v)+'"'+(on?' checked':'')+'>'+
      '<span class="dot'+(t==='checkbox'?' sq':'')+'"></span><span class="otxt">'+esc(o[L])+(o.rec?'<em class="rec">'+esc(UI.rec[L])+'</em>':'')+(o['d'+L]?'<small>'+esc(o['d'+L])+'</small>':'')+'</span></label>';
  });
  html+='</div>';
  if(f.other) html+='<input class="inp other" type="text" dir="auto" data-f="'+f.id+'_other" value="'+esc(S.v[f.id+'_other'])+'" placeholder="'+esc(UI.specify[L])+'"'+(otherSelected(f)?'':' hidden')+'>';
  return html;
}
function ageSelect(id,L){
  var cur=S.v[id]||'',h='<select class="inp" data-f="'+id+'" dir="ltr"><option value="">—</option>';
  for(var i=15;i<=65;i++) h+='<option value="'+i+'"'+(String(i)===String(cur)?' selected':'')+'>'+i+'</option>';
  return h+'</select>';
}
function bodyHTML(f,res){
  var v=S.v,id=f.id,L=S.lang,ph=f.ph?f.ph[L]:'';
  switch(f.type){
    case 'info': return '<div class="note '+res.tone+'">'+esc(res[L])+'</div>';
    case 'text': return '<input class="inp" type="text" data-f="'+id+'" dir="'+(f.ltr?'ltr':'auto')+'"'+(f.mode?' inputmode="'+f.mode+'"':'')+' autocomplete="off" value="'+esc(v[id])+'" placeholder="'+esc(ph)+'">';
    case 'area': return '<textarea class="inp" rows="3" dir="auto" data-f="'+id+'" placeholder="'+esc(ph)+'">'+esc(v[id])+'</textarea>';
    case 'date': return '<input class="inp" type="date" dir="ltr" data-f="'+id+'" value="'+esc(v[id])+'">';
    case 'num':
      var h='<div class="unitrow"><input class="inp" type="text" inputmode="decimal" dir="ltr" data-f="'+id+'" value="'+esc(v[id])+'" placeholder="'+esc(ph)+'">'+(f.unit?'<span>'+esc(f.unit[L])+'</span>':'')+'</div>';
      if(f.quick){var qk=f.quick(v);if(qk.length) h+='<div class="quick">'+qk.map(function(n){return '<button type="button" class="chip" data-quick="'+n+'" data-for="'+id+'">'+n+'</button>'}).join('')+'</div>'}
      return h;
    case 'agerange':
      return '<div class="agerow"><span>'+(L==='fr'?'De':'من')+'</span>'+ageSelect('age_min',L)+'<span>'+(L==='fr'?'à':'إلى')+'</span>'+ageSelect('age_max',L)+'<span>'+(L==='fr'?'ans':'سنة')+'</span></div>';
    case 'radio': case 'checks': return groupHTML(f);
    case 'check':
      var on=!!v[id];
      return '<label class="opt single'+(on?' on':'')+'"><input type="checkbox" data-f="'+id+'"'+(on?' checked':'')+'><span class="dot sq"></span><span class="otxt">'+esc(labelOf(f))+'</span></label>';
  }
  return '';
}
function shell(f){
  var head=(f.type==='check'||f.type==='info')?'':'<label class="qlabel"></label><p class="qhint"></p>';
  var tools=f.type==='info'?'':'<div class="qtools"><button type="button" class="clear" data-clear="'+f.id+'">'+UI.clear[S.lang]+'</button></div>';
  return '<div class="q'+(f.sub?' sub':'')+(f.type==='info'?' qinfo':'')+'" data-q="'+f.id+'">'+head+'<div class="body"></div>'+tools+'</div>';
}
function fieldInvalid(f){
  var v=S.v;
  if(f.id==='age'){var a=num(v.age_min),b=num(v.age_max);return a>b}
  if(f.id==='camp_start'||f.id==='camp_end') return !!(v.camp_start&&v.camp_end&&v.camp_end<v.camp_start);
  if(f.type==='num'&&String(v[f.id]==null?'':v[f.id]).trim()!=='') return !isFinite(num(v[f.id]));
  return false;
}
function sigOf(f,res){
  if(f.type==='info') return S.lang+JSON.stringify(res);
  if(typeof f.opts==='function') return JSON.stringify(optsOf(f).map(function(o){return [o.v,o.fr,o.ar,!!o.rec]}));
  if(f.quick) return JSON.stringify(f.quick(S.v));
  return '';
}

/* ---------- automatic suggestions & clean-up ---------- */
function autoApply(){
  var v=S.v,A=S.auto;
  // remove answers whose option no longer exists
  ALL.forEach(function(f){
    if((f.type==='radio'||f.type==='checks')&&typeof f.opts==='function'){
      var ok=optsOf(f).map(function(o){return o.v});
      if(f.type==='radio'){ if(v[f.id]&&ok.indexOf(v[f.id])<0){v[f.id]='';force[f.id]=1} }
      else if(arr(v[f.id]).some(function(x){return ok.indexOf(x)<0})){v[f.id]=arr(v[f.id]).filter(function(x){return ok.indexOf(x)>=0});force[f.id]=1}
    }
  });
  function setAuto(id,val){
    if(v[id]&&!A[id]) return;            // the user chose by hand: never touch
    if(val){ if(v[id]!==val){v[id]=val;force[id]=1} A[id]=true }
    else if(A[id]){ v[id]='';delete A[id];force[id]=1 }
  }
  setAuto('gender',suggestGender(v));
  setAuto('cta',CTA_BY_GOAL[v.goal]||'');
  setAuto('channel',CH_BY_GOAL[v.goal]||'');
}

/* ---------- update loop ---------- */
function update(){
  autoApply();
  ALL.forEach(function(f){
    var q=qEl[f.id]; if(!q) return;
    var res=null,vis=true;
    if(f.type==='info'){res=f.text(S.v);vis=!!res}
    else if(f.show) vis=!!f.show(S.v);
    var was=q.hidden; q.hidden=!vis;
    if(!vis) return;
    if(was||force[f.id]) delete sigs[f.id];
    if(f.type!=='info'&&f.type!=='check'){
      var lb=q.querySelector('.qlabel'),t=labelOf(f); if(lb&&lb.textContent!==t) lb.textContent=t;
      if(lb) lb.id='label_'+f.id;
      var he=q.querySelector('.qhint'),h=hintOf(f);
      if(he){
        if(he.textContent!==h) he.textContent=h;
        he.id='hint_'+f.id;
      }
    }
    var sg=sigOf(f,res);
    if(sigs[f.id]!==sg){sigs[f.id]=sg;q.querySelector('.body').innerHTML=bodyHTML(f,res)}
    var invalid=fieldInvalid(f);
    q.classList.toggle('is-invalid',invalid);
    q.querySelectorAll('input,textarea,select').forEach(function(control){
      if(f.type!=='info'&&f.type!=='check'){
        control.setAttribute('aria-labelledby','label_'+f.id);
        var described=[];
        if(hintOf(f)) described.push('hint_'+f.id);
        if(f.other&&control.classList.contains('other')) described.push('label_'+f.id);
        if(described.length) control.setAttribute('aria-describedby',described.join(' '));
        else control.removeAttribute('aria-describedby');
      }
      control.classList.toggle('is-invalid',invalid);
      control.setAttribute('aria-invalid',invalid?'true':'false');
    });
    if(f.other){var oi=q.querySelector('input.other'); if(oi) oi.hidden=!otherSelected(f)}
  });
  force={};
  progress();
}
function progress(){
  var tot=0,ans=0,v=S.v;
  ALL.forEach(function(f){
    if(f.type==='info') return;
    var q=qEl[f.id]; if(!q||q.hidden) return;
    tot++;
    var a;
    if(f.type==='checks') a=arr(v[f.id]).length>0;
    else if(f.type==='check') a=!!v[f.id];
    else if(f.type==='agerange') a=!!(v.age_min||v.age_max);
    else a=String(v[f.id]==null?'':v[f.id]).trim()!=='';
    if(a) ans++;
  });
  var pct=tot?Math.round(ans/tot*100):0;
  $('bar').style.width=pct+'%';
  $('ptxt').textContent=answersTxt(ans,tot,S.lang);
  var pbar=$('pbar');
  if(pbar){
    pbar.setAttribute('aria-valuenow',String(pct));
    pbar.setAttribute('aria-valuetext',answersTxt(ans,tot,S.lang));
    pbar.setAttribute('aria-label',UI.progress[S.lang]);
  }
}

function renderAll(){
  var L=S.lang;
  document.documentElement.lang=L; document.documentElement.dir=L==='ar'?'rtl':'ltr';
  document.title=UI.title[L]+' — '+UI.org[L];
  $('t-title').textContent=UI.title[L];
  if($('t-org')) $('t-org').textContent=UI.org[L];
  if($('skipLink')) $('skipLink').textContent=UI.skip[L];
  $('intro').textContent=UI.intro[L];
  setAction('btnSummary','fi-rr-list',UI.summary[L]);
  setAction('btnPdf','fi-rr-file-pdf',UI.pdf[L]);
  setThemeLabel();
  $('langLabel').textContent=L==='ar'?'العربية':'Français';
  $('btnLang').setAttribute('aria-label',L==='ar'?'اللغة: العربية':'Langue : Français');
  $('sumTitle').textContent=UI.sumTitle[L]; setAction('btnCopy','fi-rr-copy',UI.copy[L]); setAction('btnClose','fi-rr-cross',UI.close[L]);
  document.querySelectorAll('.lang-menu button[data-lang]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.lang===L))});
  var nav=$('secnav');
  if(nav){
    nav.setAttribute('aria-label',UI.nav[L]);
    nav.innerHTML=SECTIONS.map(function(s,i){
      return '<a href="#sec-'+(i+1)+'" title="'+esc(s.title[L])+'" aria-label="'+(i+1)+'. '+esc(s.title[L])+'">'+(i+1)+'</a>';
    }).join('');
  }
  $('form').innerHTML=SECTIONS.map(function(s,i){
    var help=s.description&&s.description[L]?'<p class="section-help" id="help-sec-'+(i+1)+'">'+esc(s.description[L])+'</p>':'';
    return '<section class="card" id="sec-'+(i+1)+'" aria-labelledby="h-sec-'+(i+1)+'"><div class="card-head"><h2 id="h-sec-'+(i+1)+'"><span class="num">'+(i+1)+'</span><i class="fi '+s.icon+' section-icon" aria-hidden="true"></i><span>'+esc(s.title[L])+'</span></h2>'+help+'</div>'+s.fields.map(shell).join('')+'</section>';
  }).join('');
  qEl={}; sigs={};
  $('form').querySelectorAll('[data-q]').forEach(function(q){qEl[q.dataset.q]=q});
  update(); setStatus(curStatus); renderDb();
}

function setAction(id,icon,text){
  var button=$(id); if(button) button.innerHTML='<i class="fi '+icon+'" aria-hidden="true"></i><span>'+esc(text)+'</span>';
}
function setThemeLabel(){
  var button=$('btnTheme'),label=$('themeLabel'); if(!button||!label) return;
  var dark=document.documentElement.getAttribute('data-theme')==='dark';
  var nextLabel=dark?UI.themeLight[S.lang]:UI.themeDark[S.lang];
  label.textContent=nextLabel;
  button.querySelector('i').className='fi '+(dark?'fi-rr-sun':'fi-rr-moon');
  button.setAttribute('aria-pressed',String(dark));
  button.setAttribute('aria-label',nextLabel);
  button.title=nextLabel;
}

function applyTheme(theme){
  var next=theme==='dark'||theme==='light'?theme:(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
  document.documentElement.setAttribute('data-theme',next);
  document.documentElement.style.colorScheme=next;
  try{localStorage.setItem(THEME_KEY,next)}catch(e){}
  var button=$('btnTheme');
  if(button) setThemeLabel();
}

/* ---------- status ---------- */
function fmtDate(iso){
  try{return new Date(iso).toLocaleString(S.lang==='ar'?'ar-MA-u-nu-latn':'fr-FR',{dateStyle:'short',timeStyle:'short'})}catch(e){return iso}
}
function setStatus(k){
  curStatus=k; $('status').textContent=UI.st[k][S.lang];
  $('last').textContent=S.savedAt?UI.last[S.lang]+fmtDate(S.savedAt):'';
  var box=$('statbox');
  if(box) box.className='stat is-'+k;
}
function renderDb(){
  var el=$('dbstate');
  el.textContent=dbMode==='on'?UI.dbOn[S.lang]:(dbMode==='error'?UI.dbErr[S.lang]:(dbMode==='off'?UI.dbOff[S.lang]:UI.dbWait[S.lang]));
  el.className='pill db-'+dbMode;
}
var toastT;
function toast(msg,err){
  var t=$('toast'); t.textContent=msg; t.className='toast'+(err?' err':''); t.hidden=false;
  clearTimeout(toastT); toastT=setTimeout(function(){t.hidden=true},3500);
}

/* ---------- local + database storage ---------- */
function snapshot(){
  return JSON.parse(JSON.stringify({v:S.v,auto:S.auto,lang:S.lang,savedAt:S.savedAt,updatedAt:new Date().toISOString()}));
}
function readLocal(){try{var s=localStorage.getItem(LS_KEY);return s?JSON.parse(s):null}catch(e){return null}}
function writeLocal(p){try{localStorage.setItem(LS_KEY,JSON.stringify(p))}catch(e){}}
function applyData(d){
  d=JSON.parse(JSON.stringify(d));
  S.v=Object.assign({},DEFAULTS,d.v||{}); S.auto=d.auto||{}; S.lang=d.lang==='fr'?'fr':'ar'; S.savedAt=d.savedAt||null;
}
var queue=Promise.resolve();
function enqueue(fn){var r=queue.then(fn);queue=r.catch(function(){});return r}
var tmr;
function scheduleSave(){
  clearTimeout(tmr); setStatus('typing');
  tmr=setTimeout(function(){
    var p=snapshot(); p.summary_fr=buildSummary('fr'); p.summary_ar=buildSummary('ar'); writeLocal(p);
    enqueue(function(){
      if(!db){setStatus('local');return}
      return db.doc('form').set(p).then(function(){setStatus('saved')},function(){setStatus('db_err')});
    });
  },900);
}
function touched(id){delete S.auto[id];dirty=true;update();scheduleSave()}

async function initDb(){
  try{
    db=window.location.protocol!=='file:'?createApiDb():null;
  }catch(e){db=null}
  if(!db){dbMode='off';renderDb();return}
  dbMode='on';renderDb();
  try{
    var result=await db.doc('form').get();
    var best=result.exists?result.data:null;
    if(!best){
      var seed=await fetch('/src/data/form-data.json').then(function(response){return response.ok?response.json():null});
      best=seed&&(seed.form||seed.saved||seed.draft);
      if(best) await db.doc('form').set(best);
    }
    var loc=readLocal();
    if(loc&&(!best||String(loc.updatedAt||'')>String(best.updatedAt||''))) best=loc;
    if(best&&!dirty&&best!==loc){applyData(best);restored=true;renderAll();setStatus('restored')}
    else if(best&&loc&&best===loc&&!dirty){scheduleSave()}
  }catch(e){dbMode='error';renderDb();toast(UI.dbErr[S.lang],true)}
}

function createApiDb(){
  function ref(path){
    return {
      get:function(){return fetch('/api/forms/'+encodeURIComponent(path)).then(function(r){return r.json().then(function(body){if(!r.ok) throw new Error(body.error||'MongoDB request failed');return body})})},
      set:function(data){return fetch('/api/forms/'+encodeURIComponent(path),{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}).then(function(r){if(!r.ok)throw new Error('Database request failed');return r.json()})}
    };
  }
  return {doc:ref};
}

/* ---------- summary ---------- */
function answerText(f,lang){
  var v=S.v,os=optsOf(f),sep=lang==='ar'?'، ':', ';
  function lab(x){
    var o=os.filter(function(y){return y.v===x})[0]; if(!o) return '';
    return x==='__other'?(v[f.id+'_other']||UI.other[lang]):o[lang];
  }
  switch(f.type){
    case 'radio': return v[f.id]?lab(v[f.id]):'';
    case 'checks': return arr(v[f.id]).map(lab).filter(Boolean).join(sep);
    case 'check': return v[f.id]?(lang==='ar'?'نعم':'Oui'):'';
    case 'agerange': return (v.age_min||v.age_max)?((lang==='fr'?'de ':'من ')+(v.age_min||'?')+(lang==='fr'?' à ':' إلى ')+(v.age_max||'?')+(lang==='fr'?' ans':' سنة')):'';
    case 'num': return v[f.id]?(String(v[f.id])+(f.unit?' '+f.unit[lang]:'')):'';
    default: return String(v[f.id]==null?'':v[f.id]).trim();
  }
}
function buildSummary(lang){
  var out=[UI.title[lang]+' — '+UI.org[lang]];
  SECTIONS.forEach(function(s,i){
    var lines=[];
    s.fields.forEach(function(f){
      if(f.type==='info') return;
      if(f.show&&!f.show(S.v)) return;
      var a=answerText(f,lang); if(!a) return;
      lines.push('• '+labelOf(f,lang)+' : '+a);
    });
    if(lines.length){out.push('','— '+(i+1)+'. '+s.title[lang]+' —');Array.prototype.push.apply(out,lines)}
  });
  return out.join('\n');
}

/* ---------- events ---------- */
var root=$('form');
root.addEventListener('input',function(e){
  var t=e.target,id=t.dataset&&t.dataset.f; if(!id||t.type==='radio'||t.type==='checkbox') return;
  S.v[id]=t.value; touched(id);
});
root.addEventListener('change',function(e){
  var t=e.target,id=t.dataset&&t.dataset.f; if(!id) return;
  var f=FIELD[id]; if(!f||(t.type!=='radio'&&t.type!=='checkbox')) return;
  var q=qEl[id];
  if(f.type==='check'){ S.v[id]=t.checked; t.closest('.opt').classList.toggle('on',t.checked) }
  else if(f.type==='radio'){ S.v[id]=t.value }
  else{
    var os=optsOf(f),a=arr(S.v[id]).slice(),isEx=function(x){var o=os.filter(function(y){return y.v===x})[0];return !!(o&&o.excl)};
    if(t.checked){ a=isEx(t.value)?[t.value]:a.filter(function(x){return !isEx(x)}); if(a.indexOf(t.value)<0) a.push(t.value) }
    else a=a.filter(function(x){return x!==t.value});
    S.v[id]=a;
  }
  if(f.type!=='check') q.querySelectorAll('.opt input').forEach(function(i){
    var c=f.type==='radio'?S.v[id]===i.value:has(S.v[id],i.value); i.checked=c; i.closest('.opt').classList.toggle('on',c);
  });
  touched(id);
  if(t.value==='__other'&&t.checked){var oi=q.querySelector('input.other');if(oi) oi.focus()}
});
root.addEventListener('click',function(e){
  var clear=e.target.closest&&e.target.closest('[data-clear]');
  if(clear){
    var clearId=clear.dataset.clear,clearField=FIELD[clearId];
    if(clearId==='age'){delete S.v.age_min;delete S.v.age_max}
    else if(clearField){S.v[clearId]=clearField.type==='checks'?[]:clearField.type==='check'?false:'';delete S.v[clearId+'_other']}
    delete S.auto[clearId]; force[clearId]=1; touched(clearId); return;
  }
  var b=e.target.closest&&e.target.closest('[data-quick]'); if(!b) return;
  var id=b.dataset.for; S.v[id]=b.dataset.quick; force[id]=1; touched(id);
});
document.querySelectorAll('.lang-menu button[data-lang]').forEach(function(b){
  b.addEventListener('click',function(){S.lang=b.dataset.lang;dirty=true;$('langMenu').hidden=true;$('btnLang').setAttribute('aria-expanded','false');renderAll();scheduleSave()});
});
$('btnLang').addEventListener('click',function(e){e.stopPropagation();var menu=$('langMenu');menu.hidden=!menu.hidden;$('btnLang').setAttribute('aria-expanded',String(!menu.hidden))});
document.addEventListener('click',function(e){if(!e.target.closest('.lang-control')){$('langMenu').hidden=true;$('btnLang').setAttribute('aria-expanded','false')}});
$('btnTheme').addEventListener('click',function(){
  applyTheme(document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark');
  renderAll();
});
function countAnswers(){
  var tot=0,ans=0,v=S.v;
  ALL.forEach(function(f){
    if(f.type==='info') return;
    if(f.show&&!f.show(v)) return;
    tot++;
    if(answerText(f,S.lang)) ans++;
  });
  return {tot:tot,ans:ans};
}
function slugName(s){
  return String(s||'campagne').replace(/[^a-zA-Z0-9\u0600-\u06FF]+/g,'-').replace(/^-|-$/g,'').slice(0,48)||'campagne';
}
function buildPrintDocument(lang){
  var L=lang||S.lang,v=S.v,counts=countAnswers();
  var exported=new Date().toLocaleString(L==='ar'?'ar-MA-u-nu-latn':'fr-FR',{dateStyle:'long',timeStyle:'short'});
  var meta=[
    [UI.pdfMetaDate[L],exported],
    [UI.pdfMetaSaved[L],S.savedAt?fmtDate(S.savedAt):'—'],
    [UI.pdfMetaLang[L],L==='ar'?'العربية':'Français'],
    [UI.pdfMetaFill[L],answersTxt(counts.ans,counts.tot,L)]
  ];
  var sections=SECTIONS.map(function(s,i){
    var rows=s.fields.map(function(f){
      if(f.type==='info') return '';
      if(f.show&&!f.show(v)) return '';
      var a=answerText(f,L);
      return '<div class="print-row"><div class="print-q">'+esc(labelOf(f,L))+'</div><div class="print-a'+(a?'':' empty')+'">'+(a?esc(a):'—')+'</div></div>';
    }).join('');
    if(!rows) return '';
    return '<section class="print-sec"><h2><em>'+(i+1)+'</em><span>'+esc(s.title[L])+'</span></h2>'+rows+'</section>';
  }).join('');
  return '<article class="print-doc" dir="'+(L==='ar'?'rtl':'ltr')+'">'+
    '<header class="print-banner"><span class="print-mark" aria-hidden="true">م</span><div>'+
    '<h1>'+esc(UI.title[L])+'</h1><p>'+esc(UI.org[L])+'</p>'+
    (v.assoc_name?'<p>'+esc(v.assoc_name)+'</p>':'')+
    '</div></header>'+
    '<div class="print-meta">'+meta.map(function(m){return '<div><span>'+esc(m[0])+'</span><b>'+esc(m[1])+'</b></div>'}).join('')+'</div>'+
    sections+
    '<footer class="print-foot"><span>'+esc(UI.pdfFoot[L])+'</span><span>'+esc((v.city||'')+(v.contact_person?(' · '+v.contact_person):''))+'</span></footer>'+
    '</article>';
}
function finishPrint(){
  document.body.classList.remove('printing');
  var root=$('printRoot');
  if(root){root.hidden=true;root.innerHTML=''}
  renderAll();
  setAction('btnPdf','fi-rr-file-pdf',UI.pdf[S.lang]);
  var btn=$('btnPdf'); if(btn) btn.disabled=false;
}
function exportPdf(){
  var L=S.lang,counts=countAnswers();
  if(!counts.ans){toast(UI.pdfEmpty[L],true);return}
  var btn=$('btnPdf');
  if(btn) btn.disabled=true;
  setAction('btnPdf','fi-rr-file-pdf',UI.pdfBusy[L]);
  var root=$('printRoot');
  root.hidden=false;
  root.innerHTML=buildPrintDocument(L);
  var day=new Date().toISOString().slice(0,10);
  document.title=slugName(S.v.assoc_name||UI.org[L])+'-campagne-ads-'+day;
  document.body.classList.add('printing');
  var restored=false;
  function done(){
    if(restored) return;
    restored=true;
    window.removeEventListener('afterprint',done);
    finishPrint();
  }
  window.addEventListener('afterprint',done);
  toast(UI.pdfReady[L]);
  setTimeout(function(){
    window.print();
    setTimeout(done,1200);
  },80);
}
$('btnPdf').addEventListener('click',exportPdf);
function closeModal(){$('modal').hidden=true;$('btnSummary').focus()}
function openModal(){$('sumtxt').value=buildSummary(S.lang);$('modal').hidden=false;$('btnClose').focus()}
$('btnSummary').addEventListener('click',openModal);
$('btnClose').addEventListener('click',closeModal);
$('modal').addEventListener('click',function(e){if(e.target===$('modal')) closeModal()});
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){
    if(!$('modal').hidden){e.preventDefault();closeModal();return}
    if(!$('langMenu').hidden){$('langMenu').hidden=true;$('btnLang').setAttribute('aria-expanded','false')}
  }
});
$('btnCopy').addEventListener('click',function(){
  var ta=$('sumtxt'),txt=ta.value,done=function(){setAction('btnCopy','fi-rr-check',UI.copied[S.lang]);setTimeout(function(){setAction('btnCopy','fi-rr-copy',UI.copy[S.lang])},1800)};
  function fallback(){ta.focus();ta.select();try{document.execCommand('copy');done()}catch(e){}}
  if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done,fallback); else fallback();
});

/* ---------- start ---------- */
var savedTheme=null;
try{savedTheme=localStorage.getItem(THEME_KEY)}catch(e){}
applyTheme(savedTheme);
document.addEventListener('DOMContentLoaded',renderAll);
var loc=readLocal();
if(loc){applyData(loc);restored=true;curStatus='restored'}
renderAll();
initDb();
})();
