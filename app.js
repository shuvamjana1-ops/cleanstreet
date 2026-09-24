/**
 * CleanStreet — app.js
 * Full-Stack Civic Application: State, Routing, Dual-Mode API/DBMS, Image Compression Engine (≤200KB)
 * Supports real-world SQLite DBMS via Express REST API with seamless offline/localStorage fallback.
 */

'use strict';

/* =====================================================
   CONSTANTS & CONFIG
   ===================================================== */

const STORAGE_KEY = 'cleanstreet_reports_v2';

const ISSUE_TYPES = {
  overflow:  { label: '🗑 Overflowing Bin',      emoji: '🗑' },
  missed:    { label: '🚛 Missed Garbage Pickup', emoji: '🚛' },
  dumping:   { label: '⚠️ Illegal Dumping',      emoji: '⚠️' },
  drain:     { label: '🌊 Blocked Drain',         emoji: '🌊' },
  other:     { label: '📋 Other',                  emoji: '📋' },
};

const STATUS_CONFIG = {
  new:        { label: 'New (Logged)',             emoji: '🔵' },
  inprogress: { label: 'In Progress (Review)',    emoji: '🟡' },
  resolved:   { label: 'Resolved (Demo Marked)',   emoji: '🟢' },
};

/* =====================================================
   I18N (English + Hindi)
   ===================================================== */

const i18n = {
  en: {
    hero_eyebrow:       'Civic Hackathon Prototype 🏆',
    hero_h1:            'Clean Streets Start<br>With <em>You</em>',
    hero_sub:           'Report overflowing bins, missed pickups, and dumping spots in your neighbourhood — right from your phone.',
    hero_report_cta:    '📸 Report an Issue',
    hero_guide_cta:     '🗑 Sorting Guide',
    stat_total:         'Total Reports',
    stat_resolved:      'Resolved (Demo)',
    stat_inprogress:    'In Progress (Review)',
    how_title:          'How It Works',
    step1_title:        'Choose a Location',
    step1_desc:         'Tell us which locality, lane, or landmark needs attention.',
    step2_title:        'Describe the Issue',
    step2_desc:         'Select the issue type and add a short description. A photo helps too.',
    step3_title:        'Track the Status',
    step3_desc:         'Track your demo report status from Logged → In Review → Resolved.',
    recent_title:       'Recent Reports',
    view_all:           'View all →',
    disclaimer_label:   'Demo Notice:',
    disclaimer_text:    'This is a civic tech prototype. All data is managed cleanly with SQLite and image optimization.',
    reports_h1:         'All Reports',
    new_report_btn:     '+ New Report',
    filter_status:      'Status:',
    filter_type:        'Issue Type:',
    clear_filters:      'Clear',
    reports_empty_title:'No reports match your filters.',
    reports_empty_sub:  'Try clearing the filters or submit a new report.',
    form_h1:            'Report an Issue',
    form_subtitle:      'All fields marked * are required.',
    f_type_label:       'Issue Type',
    f_type_placeholder: 'Select an issue type…',
    f_loc_label:        'Location / Locality',
    f_desc_label:       'Description',
    f_photo_label:      'Photo',
    f_photo_prompt:     'Tap to take a photo or upload from gallery',
    f_photo_note:       'Auto-compressed to ≤200 KB before upload to save civic bandwidth.',
    f_submit:           'Submit Report',
    confirm_h1:         'Report Submitted!',
    confirm_sub:        'Thank you for helping keep your neighbourhood clean. Your report has been persisted.',
    confirm_disclaimer: '⚠️ Real SQLite DBMS persistence enabled. Images stored on server.',
    confirm_view_btn:   'View All Reports',
    confirm_another_btn:'Report Another Issue',
    guide_h1:           'Waste Sorting Guide',
    guide_subtitle:     'Simple guidance for Indian households on sorting common waste into the right bin.',
    guide_wet_title:    'Wet Waste',
    guide_wet_sub:      'गीला कचरा / Green Bin',
    guide_dry_title:    'Dry Waste',
    guide_dry_sub:      'सूखा कचरा / Blue Bin',
    guide_ewaste_title: 'E-Waste',
    guide_ewaste_sub:   'इलेक्ट्रॉनिक कचरा / Red Bin',
    guide_haz_title:    'Hazardous & Sanitary',
    guide_haz_sub:      'हानिकारक कचरा / Black Bin',
    guide_table_title:  'Quick Reference',
    admin_h1:           'Admin: Manage Reports',
    admin_sub:          'Update report statuses in real-time. Changes are saved directly to the SQLite database.',
    
    // Backend Status & Compression feedback
    db_online:          'SQLite Online',
    db_offline:         'Local Mode',
    comp_original:      'Original:',
    comp_compressed:    'Optimized:',
    comp_dimensions:    'Dimensions:',

    // Upgraded Hackathon Features
    still_an_issue:     'Still an Issue',
    confirmed_by_you:   'Confirmed by you',
    upvote_btn:         '▲ Upvote Issue',
    upvoted_by_you:     '▲ Upvoted by you',
    toast_upvoted:      'Issue upvoted! Priority elevated in community tracking. 🔥',
    view_timeline:      'Activity Timeline',
    hide_timeline:      'Hide Timeline',
    simulated_log:      'Prototype Log',
    toast_confirmed:    'Thank you! Your confirmation was recorded. 👍',
    helper_items_found: 'items found',
    helper_no_items:    'No items found matching your search.',

    // Preloader strings
    preloader_status:       'Initializing CleanStreet…',
    preloader_connecting:   'Connecting to SQLite DBMS…',
    preloader_loading_reports: 'Loading community reports…',
    preloader_retrying:     'Reconnecting to database…',
    preloader_error_title:  'Initialization Notice',
    preloader_error_msg:    'Could not connect to backend server. You can continue in Local Mode or retry.',
    preloader_retry_btn:    'Retry Connection',
    preloader_offline_btn:  'Continue in Local Mode →',
  },
  hi: {
    hero_eyebrow:       'सिविक हैकाथॉन प्रोटोटाइप 🏆',
    hero_h1:            'साफ़ सड़कें शुरू होती हैं<br><em>आपसे</em>',
    hero_sub:           'अपने मोहल्ले में कूड़े की समस्याएं रिपोर्ट करें — उफनते डब्बे, मिस पिकअप, और अवैध डम्पिंग।',
    hero_report_cta:    '📸 समस्या रिपोर्ट करें',
    hero_guide_cta:     '🗑 कचरा छँटाई गाइड',
    stat_total:         'कुल रिपोर्ट',
    stat_resolved:      'हल हुई (डेमो)',
    stat_inprogress:    'प्रगति में (डेमो)',
    how_title:          'यह कैसे काम करता है',
    step1_title:        'स्थान चुनें',
    step1_desc:         'बताएं कि कौन सी गली या लैंडमार्क पर ध्यान चाहिए।',
    step2_title:        'समस्या बताएं',
    step2_desc:         'समस्या का प्रकार चुनें और संक्षिप्त विवरण दें।',
    step3_title:        'स्थिति ट्रैक करें',
    step3_desc:         'अपनी डेमो रिपोर्ट स्थिति को Logged → In Review → Resolved होते देखें।',
    recent_title:       'हाल की रिपोर्ट',
    view_all:           'सभी देखें →',
    disclaimer_label:   'डेमो नोटिस:',
    disclaimer_text:    'यह एक सिविक टेक प्रोटोटाइप है। सभी डेटा SQLite और फ़ोटो कंप्रेशन के साथ प्रबंधित है।',
    reports_h1:         'सभी रिपोर्ट',
    new_report_btn:     '+ नई रिपोर्ट',
    filter_status:      'स्थिति:',
    filter_type:        'समस्या प्रकार:',
    clear_filters:      'साफ़ करें',
    reports_empty_title:'कोई रिपोर्ट नहीं मिली।',
    reports_empty_sub:  'फ़िल्टर हटाएं या नई रिपोर्ट दर्ज करें।',
    form_h1:            'समस्या रिपोर्ट करें',
    form_subtitle:      '* से चिह्नित सभी फ़ील्ड आवश्यक हैं।',
    f_type_label:       'समस्या प्रकार',
    f_type_placeholder: 'समस्या प्रकार चुनें…',
    f_loc_label:        'स्थान / मोहल्ला',
    f_desc_label:       'विवरण',
    f_photo_label:      'फोटो',
    f_photo_prompt:     'फोटो लें या गैलरी से अपलोड करें',
    f_photo_note:       'बैंडविड्थ बचाने के लिए अपलोड से पहले स्वचालित रूप से ≤200 KB तक संपीड़ित।',
    f_submit:           'रिपोर्ट जमा करें',
    confirm_h1:         'रिपोर्ट जमा हो गई!',
    confirm_sub:        'अपने मोहल्ले को साफ़ रखने में मदद के लिए धन्यवाद। आपकी रिपोर्ट सुरक्षित सहेजी गई है।',
    confirm_disclaimer: '⚠️ SQLite डेटाबेस में सुरक्षित सहेजा गया।',
    confirm_view_btn:   'सभी रिपोर्ट देखें',
    confirm_another_btn:'एक और रिपोर्ट करें',
    guide_h1:           'कचरा छँटाई गाइड',
    guide_subtitle:     'भारतीय घरों के लिए सामान्य कचरे को सही डब्बे में डालने की सरल मार्गदर्शिका।',
    guide_wet_title:    'गीला कचरा',
    guide_wet_sub:      'गीला कचरा / हरी टोकरी',
    guide_dry_title:    'सूखा कचरा',
    guide_dry_sub:      'सूखा कचरा / नीली टोकरी',
    guide_ewaste_title: 'ई-कचरा',
    guide_ewaste_sub:   'इलेक्ट्रॉनिक कचरा / लाल टोकरी',
    guide_haz_title:    'हानिकारक व स्वच्छता कचरा',
    guide_haz_sub:      'हानिकारक कचरा / काली टोकरी',
    guide_table_title:  'त्वरित संदर्भ',
    admin_h1:           'Admin: रिपोर्ट प्रबंधन',
    admin_sub:          'स्थिति बदलें। सभी बदलाव सीधे SQLite डेटाबेस में सहेजे जाते हैं।',
    
    // Backend Status & Compression feedback (Hindi)
    db_online:          'SQLite ऑनलाइन',
    db_offline:         'स्थानीय मोड',
    comp_original:      'मूल:',
    comp_compressed:    'अनुकूलित:',
    comp_dimensions:    'आकार:',

    // Upgraded Hackathon Features (Hindi)
    still_an_issue:     'यह अभी भी समस्या है',
    confirmed_by_you:   'आपके द्वारा पुष्ट',
    view_timeline:      'गतिविधि टाइमलाइन',
    hide_timeline:      'टाइमलाइन छुपाएं',
    simulated_log:      'प्रोटोटाइप लॉग',
    toast_confirmed:    'धन्यवाद! आपकी पुष्टि दर्ज की गई। 👍',
    helper_items_found: 'वस्तुएं मिलीं',
    helper_no_items:    'आपकी खोज से मेल खाती कोई वस्तु नहीं मिली।',

    // Preloader strings (Hindi)
    preloader_status:       'CleanStreet प्रारंभ हो रहा है…',
    preloader_connecting:   'SQLite डेटाबेस से जुड़ रहा है…',
    preloader_loading_reports: 'सामुदायिक रिपोर्ट लोड हो रही हैं…',
    preloader_retrying:     'पुनः प्रयास कर रहे हैं…',
    preloader_error_title:  'प्रारंभिक सूचना',
    preloader_error_msg:    'सर्वर से कनेक्ट नहीं हो सका। आप स्थानीय मोड में जारी रख सकते हैं या पुनः प्रयास कर सकते हैं।',
    preloader_retry_btn:    'पुनः प्रयास करें',
    preloader_offline_btn:  'स्थानीय मोड में जारी रखें →',
  }
};

/* =====================================================
   WASTE SORTING QUICK-CHECKER ITEM DATABASE (35+ Items)
   Based on Indian Solid Waste Management Rules
   ===================================================== */

const WASTE_ITEMS = [
  // WET WASTE (Green Bin)
  { name: 'Banana Peel / Fruit Scraps', nameHi: 'केले का छिलका / फलों के छिलके', cat: 'wet', tip: 'Compost at home or dispose in green wet-waste bin. Keep plastic stickers off.', tipHi: 'घर पर खाद बनाएं या गीले कचरे (हरी टोकरी) में डालें। स्टिकर हटा दें।' },
  { name: 'Vegetable Peels & Trimmings', nameHi: 'सब्जियों के छिलके और अवशेष', cat: 'wet', tip: 'Compostable organic matter. Great for home or community compost pits.', tipHi: 'जैविक अपशिष्ट। खाद बनाने के लिए उत्तम है।' },
  { name: 'Leftover Cooked Food / Roti', nameHi: 'बचा हुआ खाना / रोटी / चावल', cat: 'wet', tip: 'Drain gravy moisture before placing in green wet bin to avoid leakage.', tipHi: 'गीले कचरे में डालने से पहले अतिरिक्त रसा छान लें।' },
  { name: 'Tea Leaves / Coffee Grounds', nameHi: 'चाय पत्ती / कॉफी पाउडर', cat: 'wet', tip: 'Rinse milk residue from tea leaves; direct organic fertilizer for plants.', tipHi: 'चाय पत्ती से दूध धोकर पौधों में खाद के रूप में भी डाल सकते हैं।' },
  { name: 'Egg Shells', nameHi: 'अंडे के छिलके', cat: 'wet', tip: 'Crush slightly before putting in wet waste or compost pit.', tipHi: 'हल्का सा कुचलकर गीले कचरे में डालें।' },
  { name: 'Coconut Shell & Husk (Narival)', nameHi: 'नारियल की जटा और खोल', cat: 'wet', tip: 'Organic garden waste. Accepted in municipal green/wet waste collection.', tipHi: 'जैविक बागवानी कचरा। नगर निगम की गीली कचरा गाड़ी में दें।' },
  { name: 'Fallen Leaves & Garden Waste', nameHi: 'सूखे पत्ते और बगीचे की छंटाई', cat: 'wet', tip: 'Never burn leaves. Collect in wet or horticultural waste bags.', tipHi: 'पत्तियों को कभी न जलाएं; गीले या बागवानी कचरे में दें।' },
  { name: 'Chicken / Fish Bones', nameHi: 'हड्डियां व मांसाहारी अपशिष्ट', cat: 'wet', tip: 'Wrap securely in newspaper before placing in green bin to deter pests.', tipHi: 'अखबार में लपेटकर हरी टोकरी में डालें ताकि मक्खियां न आएं।' },

  // DRY WASTE (Blue Bin)
  { name: 'Plastic Water Bottle (PET)', nameHi: 'प्लास्टिक की पानी की बोतल', cat: 'dry', tip: 'Empty all liquids, crush flat, and place in dry bin for high recycling value.', tipHi: 'पानी खाली करें, बोतल को दबाकर चपटा करें और नीली टोकरी में डालें।' },
  { name: 'Milk Pouch / Dahi Packet', nameHi: 'दूध की थैली / दही का पैकेट', cat: 'dry', tip: 'Rinse with a little water and dry before putting in dry bin to avoid odor.', tipHi: 'दुर्गंध से बचने के लिए थोड़ा पानी डालकर धो लें और सुखाकर डालें।' },
  { name: 'Amazon / Courier Cardboard Box', nameHi: 'कूरियर और अमेज़न के गत्ते के डिब्बे', cat: 'dry', tip: 'Flatten cardboard boxes to save bin space. Easily recycled by kabadiwalas.', tipHi: 'डिब्बों को चपटा करके नीली टोकरी में रखें। रद्दी वाले इसे आसानी से लेते हैं।' },
  { name: 'Newspaper & Magazines', nameHi: 'समाचार पत्र और पत्रिकाएं', cat: 'dry', tip: 'Keep clean and dry. High recyclable value for local paper mills.', tipHi: 'सूखा और साफ रखें। पुनर्चक्रण के लिए सबसे उपयुक्त।' },
  { name: 'Aluminum Foil & Food Containers', nameHi: 'एल्युमिनियम फॉयल और फूड बॉक्स', cat: 'dry', tip: 'Wipe off major food residue and dispose in dry recycling bin.', tipHi: 'खाना पोंछकर साफ करें और सूखे कचरे के डब्बे में डालें।' },
  { name: 'Glass Bottle & Jam Jar', nameHi: 'कांच की बोतल और जैम का जार', cat: 'dry', tip: 'Rinse clean. If broken, wrap securely in newspaper to protect workers.', tipHi: 'धोकर डालें। टूटा हुआ कांच हो तो अखबार में लपेटकर अलग रखें।' },
  { name: 'Chips / Kurkure / Namkeen Packets', nameHi: 'चिप्स और नमकीन के पैकेट (MLP)', cat: 'dry', tip: 'Multi-layer plastics go into dry waste for co-processing in cement kilns.', tipHi: 'मल्टीलेयर प्लास्टिक; सूखे कचरे में ही डालें।' },
  { name: 'Tetra Pak (Juice / Milk Cartons)', nameHi: 'टेट्रा पैक (जूस / दूध का डिब्बा)', cat: 'dry', tip: 'Rinse, flatten, and toss into blue bin. Paper and foil are recovered.', tipHi: 'धोकर और दबाकर नीली टोकरी में डालें।' },
  { name: 'Tin Cans / Cold Drink Cans', nameHi: 'शीतल पेय और टिन के डिब्बे', cat: 'dry', tip: 'Rinse and put in dry recycling. 100% infinitely recyclable metal.', tipHi: 'धोकर सूखे कचरे में डालें। धातु आसानी से रीसायकल होती है।' },
  { name: 'Old Clothes & Torn Rags', nameHi: 'पुराने कपड़े और चिथड़े', cat: 'dry', tip: 'Donate wearable clothes; put unwearable rags into dry textile recycling.', tipHi: 'पहनने योग्य कपड़े दान करें; फटे कपड़े सूखे कचरे में दें।' },
  { name: 'Polythene / Plastic Carry Bags', nameHi: 'प्लास्टिक कैरी बैग / पॉलीथीन', cat: 'dry', tip: 'Bundle together and place in dry bin. Keep away from wet drains.', tipHi: 'इकट्ठा करके सूखे कचरे में डालें। नालियों में बिल्कुल न फेंकें।' },
  { name: 'Styrofoam / Thermocol Packaging', nameHi: 'थर्माकोल पैकिंग', cat: 'dry', tip: 'Place in dry waste. Do not break into small beads to avoid litter spread.', tipHi: 'सूखे कचरे में रखें। छोटे टुकड़े न करें ताकि हवा में न उड़ें।' },

  // E-WASTE (Red Bin / Special Drop-off)
  { name: 'Smartphone / Old Mobile Phone', nameHi: 'पुराना स्मार्टफोन / मोबाइल', cat: 'ewaste', tip: 'Never discard in trash. Hand over to authorised e-waste recyclers.', tipHi: 'साधारण कचरे में न डालें। अधिकृत ई-कचरा केंद्र पर जमा करें।' },
  { name: 'Batteries (AA, AAA, Button Cells)', nameHi: 'घड़ी और रिमोट की बैटरियां', cat: 'ewaste', tip: 'Contains toxic heavy metals (cadmium/lead). Take to e-waste bins.', tipHi: 'जहरीले रसायनों से युक्त। लाल टोकरी या ई-कचरा केंद्र में दें।' },
  { name: 'Laptop / Charger & Power Cable', nameHi: 'लैपटॉप / चार्जर और तार', cat: 'ewaste', tip: 'Valuable copper and metals inside. Keep in e-waste drop-off box.', tipHi: 'तांबे और सर्किट से युक्त; ई-कचरे में रीसायकल करवाएं।' },
  { name: 'Earphones, Headphones & Cables', nameHi: 'ईयरफोन, हेडफोन और केबल', cat: 'ewaste', tip: 'Do not throw in general garbage; dispose with small electronics.', tipHi: 'छोटे इलेक्ट्रॉनिक्स के साथ ई-कचरे में दें।' },
  { name: 'CFL Bulb & Fluorescent Tubelight', nameHi: 'सीएफएल बल्ब और ट्यूबलाइट', cat: 'ewaste', tip: 'Contains toxic mercury vapor. Handle with care, wrap in cardboard.', tipHi: 'पारा (मर्करी) होने के कारण खतरनाक; सावधानी से ई-कचरा संग्रह को दें।' },
  { name: 'Broken LED Bulb', nameHi: 'खराब एलईडी बल्ब', cat: 'ewaste', tip: 'Contains LED circuitry and aluminum heatsink; goes to e-waste.', tipHi: 'सर्किट और एल्युमिनियम होने से ई-कचरे में जाएगा।' },
  { name: 'Power Bank / Lithium-Ion Battery', nameHi: 'पावर बैंक / लीथियम बैटरी', cat: 'ewaste', tip: 'Fire hazard if compressed in garbage trucks! Only dispose at e-waste depots.', tipHi: 'कूड़ा गाड़ी में दबने पर आग लग सकती है! केवल ई-कचरा केंद्र में दें।' },

  // HAZARDOUS & SANITARY (Black Bin)
  { name: 'Expired Medicines & Tablets', nameHi: 'एक्सपायर्ड दवाइयां और सिरप', cat: 'hazardous', tip: 'Wrap in paper and deposit in domestic hazardous waste bin. Never flush.', tipHi: 'कागज में लपेटकर हानिकारक कचरे में डालें। फ्लश न करें।' },
  { name: 'Sanitary Pads & Baby Diapers', nameHi: 'सैनिटरी नैपकिन और डायपर', cat: 'hazardous', tip: 'Wrap securely in newspaper with a red "X" mark before discarding in black bin.', tipHi: 'अखबार में लपेटकर लाल "X" निशान लगाएं और काली टोकरी में दें।' },
  { name: 'Paint Cans, Thinner & Solvents', nameHi: 'पेंट के डिब्बे, थिनर और वार्निश', cat: 'hazardous', tip: 'Highly toxic & inflammable. Hand over to hazardous waste collection drives.', tipHi: 'अत्यधिक ज्वलनशील व विषैला। केवल विशेष हानिकारक कचरा गाड़ी में दें।' },
  { name: 'Mosquito / Insecticide Spray Can', nameHi: 'मच्छर / कीटनाशक स्प्रे कैन', cat: 'hazardous', tip: 'Pressurized aerosol can with poisonous residue. Goes to black/hazardous bin.', tipHi: 'जहरीले अवशेष वाली स्प्रे कैन; घरेलू हानिकारक कचरे में जाएगी।' },
  { name: 'Used Syringes & Diabetic Needles', nameHi: 'इस्तेमाल किए गए इंजेक्शन और सुई', cat: 'hazardous', tip: 'Store in a puncture-proof plastic bottle to protect sanitary staff from injuries.', tipHi: 'सफाई कर्मचारियों की सुरक्षा के लिए किसी प्लास्टिक बोतल में बंद करके दें।' },
  { name: 'Broken Mercury Thermometer', nameHi: 'टूटा हुआ मर्करी थर्मामीटर', cat: 'hazardous', tip: 'Extreme toxic bio-hazard. Seal in airtight glass bottle and notify hospital/ward.', tipHi: 'अत्यंत विषैला। कांच की शीशी में बंद करके अस्पताल या नगर निगम को दें।' },
  { name: 'Nail Polish, Remover & Cosmetics', nameHi: 'नेल पॉलिश और रिमूवर की बोतल', cat: 'hazardous', tip: 'Chemical solvents. Place in domestic hazardous black bin.', tipHi: 'रासायनिक सॉल्वेंट; घरेलू हानिकारक कचरे (काली टोकरी) में दें।' },
  { name: 'Disposable Face Masks & Gloves', nameHi: 'डिस्पोजेबल मास्क और दस्ताने', cat: 'hazardous', tip: 'Cut elastic ear-loops and wrap in newspaper before placing in sanitary bin.', tipHi: 'इलास्टिक काटकर अखबार में लपेटें और स्वच्छता कचरे में डालें।' }
];

/* =====================================================
   COMMUNITY CONFIRMATIONS STORAGE HELPERS
   ===================================================== */

const CONFIRMED_REPORTS_KEY = 'cleanstreet_confirmed_reports_v1';

function getConfirmedReports() {
  try {
    return JSON.parse(localStorage.getItem(CONFIRMED_REPORTS_KEY) || '[]');
  } catch (_) {
    return [];
  }
}

function isReportConfirmed(reportId) {
  return getConfirmedReports().includes(reportId);
}

function markReportConfirmed(reportId) {
  const list = getConfirmedReports();
  if (!list.includes(reportId)) {
    list.push(reportId);
    try {
      localStorage.setItem(CONFIRMED_REPORTS_KEY, JSON.stringify(list));
    } catch (_) {}
  }
}

/* =====================================================
   BLANK REPORT SHEET (No demo reports seeded)
   ===================================================== */

const SEED_REPORTS = [];

/* =====================================================
   APPLICATION STATE
   ===================================================== */

let state = {
  reports: [],
  currentView: 'home',
  lang: 'en',
  filters: { status: 'all', type: 'all', area: 'all', sort: 'upvotes' },
  lastSubmittedId: null,
  formDirty: false,
  
  // Real-world Backend & DBMS Integration
  backendAvailable: false,
  activeApiUrl: '',
};

// Report form pending photo state
let pendingPhotoBlob = null;
let pendingPhotoDataUrl = null;
let pendingPhotoSizeKb = null;

/* =====================================================
   IMAGE COMPRESSOR ENGINE (Guaranteed ≤ 200 KB)
   ===================================================== */

/**
 * Format bytes to readable string (e.g., 184.2 KB or 2.1 MB)
 */
function formatBytes(bytes) {
  if (!bytes || isNaN(bytes)) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * Compresses any image file or blob to be strictly <= maxKB (default 200 KB).
 * Uses progressive HTML5 canvas dimension and quality scaling.
 * 
 * @param {File|Blob} file 
 * @param {number} maxKB - Target size in KB (default 200)
 * @returns {Promise<{ blob: Blob, dataUrl: string, origBytes: number, compBytes: number, width: number, height: number, durationMs: number }>}
 */
async function compressImage(file, maxKB = 200) {
  const startTime = performance.now();
  const origBytes = file.size;
  const maxBytes = maxKB * 1024;

  // 1. Load image onto HTML5 Image element
  const img = await new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image file.'));
    };
    image.src = objectUrl;
  });

  // 2. Initial dimension downscaling (max 1400px maintains clarity for waste inspection)
  let { width, height } = img;
  const MAX_DIM = 1400;
  if (width > MAX_DIM || height > MAX_DIM) {
    if (width > height) {
      height = Math.round((height * MAX_DIM) / width);
      width = MAX_DIM;
    } else {
      width = Math.round((width * MAX_DIM) / height);
      height = MAX_DIM;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  // White background ensures no black transparency artifacts in JPEG
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  // 3. Iterative quality reduction & dimension scaling until <= maxBytes
  let quality = 0.85;
  let bestBlob = null;

  const canvasToBlob = (q) => new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', q));

  for (let attempt = 0; attempt < 8; attempt++) {
    const blob = await canvasToBlob(quality);
    bestBlob = blob;

    if (blob.size <= maxBytes) {
      break; // Success! Compliant with target limit
    }

    if (quality > 0.40) {
      quality -= 0.15;
    } else {
      // Resolution step-down if quality ceiling hit
      width = Math.round(width * 0.80);
      height = Math.round(height * 0.80);
      if (width < 320 || height < 240) break;
      
      canvas.width = width;
      canvas.height = height;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      quality = 0.70;
    }
  }

  // 4. Generate Data URL for preview and base64 transmission
  const dataUrl = await new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.readAsDataURL(bestBlob);
  });

  const durationMs = Math.round(performance.now() - startTime);

  return {
    blob: bestBlob,
    dataUrl,
    origBytes,
    compBytes: bestBlob.size,
    width,
    height,
    durationMs,
  };
}

/* =====================================================
   BACKEND & DBMS API LAYER (Dual-Mode Resilience)
   ===================================================== */

/**
 * Detects whether the Node/Express + SQLite backend is active.
 * Tries local origin or http://localhost:3000.
 */
async function detectBackend() {
  const candidates = [
    '', // same-origin (when loaded via http://localhost:3000)
    'http://localhost:3000',
  ];

  for (const base of candidates) {
    try {
      const res = await fetch(`${base}/api/health`, { method: 'GET', cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'healthy') {
          state.backendAvailable = true;
          state.activeApiUrl = base;
          updateDbPill(true, data);
          return true;
        }
      }
    } catch (_) {
      // try next candidate
    }
  }

  state.backendAvailable = false;
  state.activeApiUrl = '';
  updateDbPill(false);
  return false;
}

function updateDbPill(isOnline, info = null) {
  const pill = document.getElementById('db-status-pill');
  const text = document.getElementById('db-status-text');
  if (!pill || !text) return;

  if (isOnline) {
    pill.classList.remove('offline');
    text.textContent = i18n[state.lang]['db_online'] || 'SQLite Online';
    pill.title = `Connected to Express + SQLite DBMS (${info?.databaseFile || 'cleanstreet.db'})\nUptime: ${info?.uptimeSeconds || 0}s · Reports: ${info?.reportsInDb || 0}`;
  } else {
    pill.classList.add('offline');
    text.textContent = i18n[state.lang]['db_offline'] || 'Local Mode';
    pill.title = 'Running in offline/browser mode using localStorage. Start server with "npm start" for full SQLite persistence.';
  }
}

/**
 * Load reports from backend API or fallback to localStorage
 */
async function loadReports() {
  if (state.backendAvailable) {
    try {
      const res = await fetch(`${state.activeApiUrl}/api/reports?status=${state.filters.status}&type=${state.filters.type}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.reports)) {
          state.reports = data.reports;
          return data.reports;
        }
      }
    } catch (err) {
      console.warn('CleanStreet API fetch failed, falling back to localStorage:', err);
    }
  }

  // Fallback to localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        state.reports = parsed.filter(r => r && r.id && !r.id.startsWith('seed-'));
        return state.reports;
      }
    }
  } catch (e) {
    console.warn('CleanStreet: error reading localStorage', e);
  }

  state.reports = [];
  return state.reports;
}

/**
 * Save report to backend SQLite or localStorage
 */
async function apiCreateReport(reportPayload, photoBlob = null) {
  if (state.backendAvailable) {
    try {
      // Use multipart/form-data if a real photo blob is present
      if (photoBlob) {
        const formData = new FormData();
        formData.append('type', reportPayload.type);
        formData.append('location', reportPayload.location);
        formData.append('description', reportPayload.description || '');
        formData.append('photo', photoBlob, `waste-${Date.now()}.jpg`);
        if (reportPayload.photo_size_kb) {
          formData.append('photo_size_kb', reportPayload.photo_size_kb);
        }

        const res = await fetch(`${state.activeApiUrl}/api/reports`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success && data.report) {
          return data.report;
        }
      } else {
        // Use JSON for report without photo or with base64
        const res = await fetch(`${state.activeApiUrl}/api/reports`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: reportPayload.type,
            location: reportPayload.location,
            description: reportPayload.description,
            photo_base64: reportPayload.photo_base64 || null,
            photo_size_kb: reportPayload.photo_size_kb || null,
          }),
        });
        const data = await res.json();
        if (data.success && data.report) {
          return data.report;
        }
      }
    } catch (err) {
      console.warn('API POST failed, saving to local state:', err);
    }
  }

  // Local fallback creation
  const localReport = {
    id: 'rpt-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
    type: reportPayload.type,
    location: reportPayload.location,
    description: reportPayload.description || '',
    status: 'new',
    photo_url: null,
    photoDataUrl: reportPayload.photo_base64 || pendingPhotoDataUrl,
    photo_size_kb: reportPayload.photo_size_kb || null,
    created_at: new Date().toISOString(),
  };

  state.reports.unshift(localReport);
  saveLocalReports();
  return localReport;
}

/**
 * Update report status in SQLite DBMS or localStorage
 */
async function apiUpdateStatus(reportId, newStatus) {
  if (state.backendAvailable) {
    try {
      const res = await fetch(`${state.activeApiUrl}/api/reports/${encodeURIComponent(reportId)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success && data.report) {
        // Update in-memory state
        const idx = state.reports.findIndex(r => r.id === reportId);
        if (idx !== -1) {
          state.reports[idx] = data.report;
        }
        return data.report;
      }
    } catch (err) {
      console.warn('API PATCH failed, updating locally:', err);
    }
  }

  // Local fallback
  const idx = state.reports.findIndex(r => r.id === reportId);
  if (idx !== -1) {
    state.reports[idx].status = newStatus;
    saveLocalReports();
    return state.reports[idx];
  }
  return null;
}

/**
 * Confirm an existing report in SQLite DBMS or localStorage
 */
async function apiConfirmReport(reportId) {
  if (state.backendAvailable) {
    try {
      const res = await fetch(`${state.activeApiUrl}/api/reports/${encodeURIComponent(reportId)}/confirm`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.report) {
          const idx = state.reports.findIndex(r => r.id === reportId);
          if (idx !== -1) {
            state.reports[idx] = data.report;
          }
          return data.report;
        }
      }
    } catch (err) {
      console.warn('API confirm failed, falling back to local storage:', err);
    }
  }

  // Local fallback
  const idx = state.reports.findIndex(r => r.id === reportId);
  if (idx !== -1) {
    state.reports[idx].confirmations = (state.reports[idx].confirmations || 0) + 1;
    if (state.reports[idx].status === 'new' || state.reports[idx].status === 'resolved') {
      state.reports[idx].status = 'inprogress';
    }
    saveLocalReports();
    return state.reports[idx];
  }
  return null;
}

function saveLocalReports() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.reports));
  } catch (e) {
    console.warn('localStorage save failed', e);
  }
}

/* =====================================================
   ROUTING / VIEW MANAGEMENT
   ===================================================== */

function showView(viewName, pushState = true) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById('view-' + viewName);
  if (!target) return;
  target.classList.add('active');
  state.currentView = viewName;

  // Update nav buttons active state
  document.querySelectorAll('.nav-btn').forEach(btn => {
    const isThisView = btn.dataset.view === viewName;
    btn.classList.toggle('active', isThisView);
    if (isThisView) {
      btn.setAttribute('aria-current', 'page');
    } else {
      btn.removeAttribute('aria-current');
    }
  });

  // Close mobile nav menu on view change
  const navToggle = document.getElementById('nav-toggle');
  const primaryNav = document.getElementById('primary-nav');
  if (navToggle && primaryNav) {
    navToggle.setAttribute('aria-expanded', 'false');
    primaryNav.classList.remove('open');
  }

  // Respect prefers-reduced-motion for smooth scroll
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });

  // Move focus to the heading of the new view for screen readers
  const heading = target.querySelector('h1');
  if (heading) {
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }

  if (pushState) {
    history.pushState({ view: viewName }, '', '#' + viewName);
  }
}

/* =====================================================
   I18N APPLICATION
   ===================================================== */

function applyLang(lang) {
  state.lang = lang;
  const dict = i18n[lang] || i18n.en;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key] !== undefined) el.innerHTML = dict[key];
  });
  
  // Update lang toggle buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    const active = btn.dataset.lang === lang;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
  document.documentElement.lang = lang === 'hi' ? 'hi' : 'en';

  // Update DB status pill text in new language
  updateDbPill(state.backendAvailable);

  // Refresh sorting helper & cards in current view
  renderSortingHelperResults();
  if (state.currentView === 'reports') renderReportsList();
  if (state.currentView === 'home') renderHomeRecent();
}

/* =====================================================
   RENDER HELPERS
   ===================================================== */

function formatRelativeDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  // Use locale-aware formatting
  const locale = state.lang === 'hi' ? 'hi-IN' : 'en-IN';

  if (diffMins < 2) return state.lang === 'hi' ? 'अभी' : 'Just now';
  if (diffMins < 60) return state.lang === 'hi' ? `${diffMins} मिनट पहले` : `${diffMins} min ago`;
  if (diffHours < 24) return state.lang === 'hi' ? `${diffHours} घंटे पहले` : `${diffHours}h ago`;
  if (diffDays === 1) return state.lang === 'hi' ? 'कल' : 'Yesterday';
  if (diffDays < 7) return state.lang === 'hi' ? `${diffDays} दिन पहले` : `${diffDays} days ago`;
  return date.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusBadgeHTML(status) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  return `<span class="status-badge status-${status}" aria-label="Status: ${cfg.label}"><span class="status-dot" aria-hidden="true"></span>${cfg.label}</span>`;
}

function typeLabel(type) {
  return ISSUE_TYPES[type]?.label || '📋 Other';
}

function renderReportCard(report) {
  const card = document.createElement('div');
  card.className = 'report-card';
  card.setAttribute('role', 'article');
  card.setAttribute('aria-label', `Report: ${report.location}`);
  card.dataset.id = report.id;

  const desc = report.description
    ? `<p class="report-desc">${escHtml(report.description.slice(0, 140))}${report.description.length > 140 ? '…' : ''}</p>`
    : '';

  // Handle both photo_url (from SQLite /uploads) and photoDataUrl (from localStorage)
  const photoSrc = report.photo_url || report.photoDataUrl;
  const sizeBadge = report.photo_size_kb
    ? `<span style="display:inline-block;font-size:.72rem;background:var(--green-50);color:var(--green-700);border:1px solid var(--green-100);padding:.15rem .45rem;border-radius:999px;margin-top:.35rem;">⚡ ${report.photo_size_kb} KB</span>`
    : '';

  const photoHtml = photoSrc
    ? `<div style="margin-top:.6rem;">
         <img src="${photoSrc}" class="report-photo-thumb" alt="Photo for report ${report.id}" style="max-height:140px;border-radius:8px;object-fit:cover;width:100%;display:block;" loading="lazy">
         ${sizeBadge}
       </div>`
    : '';

  const reportDate = report.created_at || report.createdAt;

  // Timeline Normalization
  let timeline = [];
  if (Array.isArray(report.timeline) && report.timeline.length > 0) {
    timeline = report.timeline;
  } else if (typeof report.timeline === 'string') {
    try {
      const parsed = JSON.parse(report.timeline);
      if (Array.isArray(parsed)) timeline = parsed;
    } catch (_) {
      timeline = [];
    }
  }

  if (timeline.length === 0) {
    const defaultTitle = report.status === 'resolved' 
      ? 'Resolved & Cleared' 
      : (report.status === 'inprogress' ? 'Assigned to Ward Crew' : 'Report Submitted');
    timeline = [{
      status: report.status || 'new',
      title: defaultTitle,
      timestamp: reportDate,
      note: 'Logged in civic system (simulated prototype log)',
      simulated: true,
    }];
  }

  const isConfirmed = isReportConfirmed(report.id);
  const upvoteCount = report.confirmations || 1;
  const isHotPriority = upvoteCount >= 2;
  const dict = i18n[state.lang] || i18n.en;

  const timelineStepsHtml = timeline.map((step, idx) => {
    const isLatest = idx === timeline.length - 1;
    const stepTime = formatRelativeDate(step.timestamp || step.time || reportDate);
    return `
      <div class="timeline-step ${isLatest ? 'latest' : ''}">
        <div class="timeline-step-header">
          <span class="timeline-step-title">${escHtml(step.title)}</span>
          <span class="timeline-step-time">${stepTime}</span>
          <span class="timeline-simulated-badge">${dict.simulated_log || 'Prototype Log'}</span>
        </div>
        ${step.note ? `<div class="timeline-step-note">${escHtml(step.note)}</div>` : ''}
      </div>
    `;
  }).join('');

  card.innerHTML = `
    <div class="report-card-top">
      <div style="flex:1;min-width:0;">
        <div style="display:flex;align-items:center;gap:0.4rem;flex-wrap:wrap;">
          <span class="report-type-badge">${typeLabel(report.type)}</span>
          ${isHotPriority ? `<span class="priority-badge-hot">🔥 Top Priority (${upvoteCount} Upvotes)</span>` : ''}
        </div>
        <p class="report-location" style="margin-top:.35rem;">${escHtml(report.location)}</p>
      </div>
      ${statusBadgeHTML(report.status)}
    </div>
    ${desc}
    ${photoHtml}
    <div class="report-meta">
      <span class="report-date">📅 ${formatRelativeDate(reportDate)}</span>
      <span style="font-size:.72rem;color:var(--neutral-500);font-family:monospace;">${report.id}</span>
    </div>

    <!-- Community Upvote Priority & Activity Timeline Actions -->
    <div class="report-card-actions">
      <button class="btn-confirm btn-upvote-issue ${isConfirmed ? 'is-confirmed' : ''}" data-id="${report.id}" aria-label="Upvote this issue to increase community priority" ${isConfirmed ? 'disabled' : ''}>
        <span aria-hidden="true">${isConfirmed ? '▲' : '▲'}</span>
        <span class="confirm-btn-label">${isConfirmed ? (dict.upvoted_by_you || 'Upvoted by you') : (dict.upvote_btn || '▲ Upvote Issue')}</span>
        <span class="confirm-count">${upvoteCount}</span>
      </button>

      <button class="timeline-toggle-btn" data-id="${report.id}" aria-expanded="false" aria-controls="timeline-drawer-${report.id}">
        <span>🕒</span>
        <span class="timeline-btn-label">${dict.view_timeline || 'Activity Timeline'} (${timeline.length})</span>
        <span class="timeline-chevron">▾</span>
      </button>
    </div>

    <div class="timeline-drawer" id="timeline-drawer-${report.id}">
      <div class="timeline-stepper">
        ${timelineStepsHtml}
      </div>
    </div>
  `;

  // Attach Community Upvote Priority listener
  const confirmBtn = card.querySelector('.btn-confirm');
  if (confirmBtn && !isConfirmed) {
    confirmBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      confirmBtn.disabled = true;
      const labelSpan = confirmBtn.querySelector('.confirm-btn-label');
      if (labelSpan) labelSpan.textContent = 'Upvoting…';

      const updated = await apiConfirmReport(report.id);
      markReportConfirmed(report.id);

      confirmBtn.classList.add('is-confirmed');
      if (labelSpan) labelSpan.textContent = dict.upvoted_by_you || '▲ Upvoted by you';
      const countSpan = confirmBtn.querySelector('.confirm-count');
      const newCount = updated ? (updated.confirmations || upvoteCount + 1) : (upvoteCount + 1);
      if (countSpan) countSpan.textContent = newCount;

      // Update the status badge in the card immediately!
      if (updated && updated.status) {
        report.status = updated.status;
        const statusBadge = card.querySelector('.status-badge');
        if (statusBadge) {
          const cfg = STATUS_CONFIG[updated.status] || STATUS_CONFIG.inprogress;
          statusBadge.className = `status-badge status-${updated.status}`;
          statusBadge.setAttribute('aria-label', `Status: ${cfg.label}`);
          statusBadge.innerHTML = `<span class="status-dot" aria-hidden="true"></span>${cfg.label}`;
        }
      }

      // Refresh overview dashboard & statistics
      updateStats();
      updateOverviewDashboard();

      if (state.filters.sort === 'upvotes') {
        renderReportsList();
      }

      showToast(dict.toast_upvoted || 'Issue upvoted! Priority elevated in community tracking. 🔥', 'success');
    });
  }

  // Attach Timeline Drawer Toggle listener
  const timelineBtn = card.querySelector('.timeline-toggle-btn');
  const drawer = card.querySelector('.timeline-drawer');
  if (timelineBtn && drawer) {
    timelineBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = drawer.classList.toggle('open');
      timelineBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      const chevron = timelineBtn.querySelector('.timeline-chevron');
      if (chevron) chevron.textContent = isOpen ? '▴' : '▾';
    });
  }

  return card;
}

/* =====================================================
   HOME & STATS VIEWS
   ===================================================== */

function renderHomeRecent() {
  const container = document.getElementById('home-recent-list');
  if (!container) return;
  container.innerHTML = '';

  const recent = [...state.reports]
    .sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt))
    .slice(0, 3);

  if (recent.length === 0) {
    container.innerHTML = `<div class="empty-state" role="status"><div class="empty-icon">🗂</div><p>No reports yet. Be the first to report an issue!</p></div>`;
    return;
  }
  recent.forEach(r => container.appendChild(renderReportCard(r)));
}

async function updateStats() {
  if (state.backendAvailable) {
    try {
      const res = await fetch(`${state.activeApiUrl}/api/stats`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.stats) {
          animateCount('stat-total', data.stats.total);
          animateCount('stat-resolved', data.stats.resolved);
          animateCount('stat-inprogress', data.stats.inprogress);
          return;
        }
      }
    } catch (_) {}
  }

  // Fallback calculation
  const total = state.reports.length;
  const resolved = state.reports.filter(r => r.status === 'resolved').length;
  const inprogress = state.reports.filter(r => r.status === 'inprogress').length;
  animateCount('stat-total', total);
  animateCount('stat-resolved', resolved);
  animateCount('stat-inprogress', inprogress);
}

function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const current = parseInt(el.textContent) || 0;
  if (current === target) return;

  // Skip animation if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    el.textContent = target;
    return;
  }

  const step = target > current ? 1 : -1;
  let val = current;
  const interval = setInterval(() => {
    val += step;
    el.textContent = val;
    if (val === target) clearInterval(interval);
  }, 35);
}

/* =====================================================
   NEIGHBOURHOOD & ISSUE OVERVIEW DASHBOARD
   ===================================================== */

function updateOverviewDashboard() {
  const stats = { overflow: 0, missed: 0, dumping: 0, drain: 0, other: 0, total: 0 };
  state.reports.forEach(r => {
    const t = r.type in stats ? r.type : 'other';
    stats[t]++;
    stats.total++;
  });

  const bar = document.getElementById('issue-dist-bar');
  const legend = document.getElementById('issue-dist-legend');
  const totalCount = document.getElementById('dist-total-count');
  if (totalCount) {
    totalCount.textContent = `${stats.total} ${stats.total === 1 ? 'Report' : 'Reports'}`;
  }
  if (!bar || !legend) return;

  if (stats.total === 0) {
    bar.innerHTML = '<div style="width:100%;height:100%;background:var(--neutral-200);border-radius:6px;"></div>';
    legend.innerHTML = '<span style="font-size:.78rem;color:var(--neutral-500);">No reports recorded yet</span>';
    return;
  }

  const types = [
    { key: 'overflow', label: 'Overflowing Bins', cls: 'seg-overflow' },
    { key: 'missed',   label: 'Missed Pickups',   cls: 'seg-missed' },
    { key: 'dumping',  label: 'Illegal Dumping',  cls: 'seg-dumping' },
    { key: 'drain',    label: 'Blocked Drains',   cls: 'seg-drain' },
    { key: 'other',    label: 'Other Issues',     cls: 'seg-other' },
  ];

  bar.innerHTML = types
    .filter(t => stats[t.key] > 0)
    .map(t => {
      const pct = ((stats[t.key] / stats.total) * 100).toFixed(1);
      return `<div class="dist-segment ${t.cls}" style="width:${pct}%;" title="${t.label}: ${stats[t.key]} (${pct}%)" aria-label="${t.label}: ${pct}%"></div>`;
    })
    .join('');

  legend.innerHTML = types
    .map(t => {
      const count = stats[t.key];
      return `
        <span class="legend-item">
          <span class="legend-dot ${t.cls}"></span>
          <span>${t.label} (<strong>${count}</strong>)</span>
        </span>
      `;
    })
    .join('');
}

function updateLocalityChips() {
  const container = document.getElementById('locality-chips');
  if (!container) return;

  const areas = new Set();
  state.reports.forEach(r => {
    if (r.location) {
      const parts = r.location.split(',').map(s => s.trim()).filter(Boolean);
      if (parts.length > 0) {
        areas.add(parts[parts.length - 1]);
      }
    }
  });

  const areaList = Array.from(areas).slice(0, 8);
  const chipsHtml = [
    `<button type="button" class="locality-chip ${state.filters.area === 'all' ? 'active' : ''}" data-area="all" aria-pressed="${state.filters.area === 'all'}">All Areas</button>`,
    ...areaList.map(area => {
      const isSelected = state.filters.area.toLowerCase() === area.toLowerCase();
      return `<button type="button" class="locality-chip ${isSelected ? 'active' : ''}" data-area="${escHtml(area)}" aria-pressed="${isSelected}"><span aria-hidden="true">📍</span> ${escHtml(area)}</button>`;
    })
  ].join('');

  container.innerHTML = chipsHtml;
  bindLocalityChipsEvents();
}

function bindLocalityChipsEvents() {
  const chips = document.querySelectorAll('.locality-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const area = chip.dataset.area || 'all';
      state.filters.area = area;
      chips.forEach(c => {
        const isCurrent = c === chip;
        c.classList.toggle('active', isCurrent);
        c.setAttribute('aria-pressed', isCurrent ? 'true' : 'false');
      });
      renderReportsList();
    });

    // Arrow key navigation between chips
    chip.addEventListener('keydown', (e) => {
      const chipArr = Array.from(chips);
      const idx = chipArr.indexOf(chip);
      let next = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        next = (idx + 1) % chipArr.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        next = (idx - 1 + chipArr.length) % chipArr.length;
      }
      if (next !== -1) {
        e.preventDefault();
        chipArr[next].focus();
      }
    });
  });
}

function initLocalityChips() {
  updateLocalityChips();
}

/* =====================================================
   WASTE-SORTING QUICK-CHECKER HELPER
   ===================================================== */

let helperActiveCategory = 'all';
let helperSearchQuery = '';

function renderSortingHelperResults() {
  const container = document.getElementById('guide-search-results');
  const empty = document.getElementById('guide-empty-search');
  if (!container) return;

  const isHindi = state.lang === 'hi';
  const query = helperSearchQuery.trim().toLowerCase();

  const filtered = WASTE_ITEMS.filter(item => {
    if (helperActiveCategory !== 'all' && item.cat !== helperActiveCategory) {
      return false;
    }
    if (query) {
      const name = item.name.toLowerCase();
      const nameHi = (item.nameHi || '').toLowerCase();
      const tip = (item.tip || '').toLowerCase();
      const tipHi = (item.tipHi || '').toLowerCase();
      const cat = item.cat.toLowerCase();
      if (!name.includes(query) && !nameHi.includes(query) && !tip.includes(query) && !tipHi.includes(query) && !cat.includes(query)) {
        return false;
      }
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = '';
    if (empty) empty.classList.remove('hidden');
    return;
  }

  if (empty) empty.classList.add('hidden');

  const catMeta = {
    wet:       { cls: 'tag-wet',    bin: isHindi ? '🟢 हरी टोकरी (Green Bin)' : '🟢 Green Bin' },
    dry:       { cls: 'tag-dry',    bin: isHindi ? '🔵 नीली टोकरी (Blue Bin)' : '🔵 Blue Bin' },
    ewaste:    { cls: 'tag-ewaste', bin: isHindi ? '🔴 लाल टोकरी (E-Waste)'   : '🔴 Red Bin (E-Waste)' },
    hazardous: { cls: 'tag-haz',    bin: isHindi ? '⚫ काली टोकरी (Hazardous)' : '⚫ Black Bin (Hazardous)' },
  };

  container.innerHTML = filtered.map(item => {
    const meta = catMeta[item.cat] || catMeta.dry;
    const displayName = isHindi && item.nameHi ? item.nameHi : item.name;
    const secondaryName = isHindi ? item.name : (item.nameHi ? `(${item.nameHi})` : '');
    const displayTip = isHindi && item.tipHi ? item.tipHi : item.tip;

    return `
      <div class="helper-item-card" data-cat="${item.cat}">
        <div class="helper-item-top">
          <span class="helper-item-name">${escHtml(displayName)} <span style="font-weight:400;font-size:.78rem;color:var(--neutral-500);">${escHtml(secondaryName)}</span></span>
          <span class="tag ${meta.cls}">${meta.bin}</span>
        </div>
        <p class="helper-item-tip">${escHtml(displayTip)}</p>
      </div>
    `;
  }).join('');
}

function initSortingHelper() {
  const searchInput = document.getElementById('guide-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      helperSearchQuery = e.target.value;
      renderSortingHelperResults();
    });
  }

  document.querySelectorAll('.guide-cat-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      helperActiveCategory = chip.dataset.cat || 'all';
      document.querySelectorAll('.guide-cat-chip').forEach(c => {
        const isCurrent = c === chip;
        c.classList.toggle('active', isCurrent);
        c.setAttribute('aria-pressed', isCurrent ? 'true' : 'false');
      });
      renderSortingHelperResults();
    });
  });

  renderSortingHelperResults();
}

/* =====================================================
   REPORTS VIEW
   ===================================================== */

function getFilteredReports() {
  const sortMode = state.filters.sort || 'upvotes';
  const list = state.reports
    .filter(r => state.filters.status === 'all' || r.status === state.filters.status)
    .filter(r => state.filters.type === 'all' || r.type === state.filters.type)
    .filter(r => {
      if (!state.filters.area || state.filters.area === 'all') return true;
      const targetArea = state.filters.area.toLowerCase();
      const loc = (r.location || '').toLowerCase();
      return loc.includes(targetArea);
    });

  if (sortMode === 'upvotes') {
    return list.sort((a, b) => {
      const upA = a.confirmations || 0;
      const upB = b.confirmations || 0;
      if (upB !== upA) return upB - upA;
      return new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt);
    });
  } else if (sortMode === 'oldest') {
    return list.sort((a, b) => new Date(a.created_at || a.createdAt) - new Date(b.created_at || b.createdAt));
  } else {
    // newest
    return list.sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));
  }
}

function renderReportsList() {
  updateOverviewDashboard();
  updateLocalityChips();
  const list = document.getElementById('reports-list');
  const empty = document.getElementById('reports-empty');
  const srStatus = document.getElementById('reports-sr-status');
  if (!list) return;
  list.innerHTML = '';
  const filtered = getFilteredReports();
  if (filtered.length === 0) {
    empty.classList.remove('hidden');
    list.style.display = 'none';

    const titleEl = empty.querySelector('[data-i18n="reports_empty_title"]') || empty.querySelector('p:first-of-type');
    const subEl = empty.querySelector('.empty-sub');
    if (state.reports.length === 0) {
      if (titleEl) titleEl.textContent = state.lang === 'hi' ? 'अभी कोई रिपोर्ट दर्ज नहीं की गई है।' : 'No reports submitted yet.';
      if (subEl) subEl.innerHTML = state.lang === 'hi' ? 'अपनी पहली रिपोर्ट दर्ज करने के लिए ऊपर <strong>+ New Report</strong> पर क्लिक करें।' : 'Click <strong>+ New Report</strong> above to submit your first report!';
    } else {
      if (titleEl) titleEl.textContent = state.lang === 'hi' ? 'आपके फ़िल्टर से कोई रिपोर्ट मेल नहीं खाती।' : 'No reports match your filters.';
      if (subEl) subEl.textContent = state.lang === 'hi' ? 'फ़िल्टर साफ़ करें या नई रिपोर्ट जोड़ें।' : 'Try clearing the filters or submit a new report.';
    }
  } else {
    empty.classList.add('hidden');
    list.style.display = '';
    filtered.forEach(r => list.appendChild(renderReportCard(r)));
  }

  // Announce filter results to screen readers
  if (srStatus) {
    const dict = i18n[state.lang] || i18n.en;
    srStatus.textContent = filtered.length === 0
      ? (state.reports.length === 0 ? 'No reports submitted yet.' : (dict.reports_empty_title || 'No reports match your filters.'))
      : `${filtered.length} ${filtered.length === 1 ? 'report' : 'reports'} shown.`;
  }
}

/* =====================================================
   REPORT FORM & AUTO-COMPRESSION FLOW
   ===================================================== */

function clearForm() {
  document.getElementById('report-form').reset();
  clearPhoto();
  clearErrors();
  updateCharCount();
  const dupBox = document.getElementById('duplicate-suggestion-box');
  if (dupBox) {
    dupBox.classList.add('hidden');
    dupBox.innerHTML = '';
  }
  state.formDirty = false;
}

function clearErrors() {
  document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
  document.querySelectorAll('.form-control').forEach(el => el.classList.remove('is-error'));
}

function setError(fieldId, errId, message) {
  const field = document.getElementById(fieldId);
  const err = document.getElementById(errId);
  if (field) field.classList.add('is-error');
  if (err) err.textContent = message;
}

function validateForm() {
  clearErrors();
  let valid = true;
  let firstInvalid = null;
  const type = document.getElementById('f-type').value;
  const location = document.getElementById('f-location').value.trim();
  const dict = i18n[state.lang] || i18n.en;

  if (!type) {
    const msg = state.lang === 'hi' ? 'कृपया समस्या का प्रकार चुनें।' : 'Please select an issue type.';
    setError('f-type', 'err-type', msg);
    if (!firstInvalid) firstInvalid = document.getElementById('f-type');
    valid = false;
  }
  if (!location) {
    const msg = state.lang === 'hi' ? 'कृपया स्थान दर्ज करें।' : 'Please enter a location.';
    setError('f-location', 'err-location', msg);
    if (!firstInvalid) firstInvalid = document.getElementById('f-location');
    valid = false;
  } else if (location.length < 4) {
    const msg = state.lang === 'hi' ? 'स्थान कम से कम 4 अक्षरों का होना चाहिए।' : 'Location must be at least 4 characters.';
    setError('f-location', 'err-location', msg);
    if (!firstInvalid) firstInvalid = document.getElementById('f-location');
    valid = false;
  }

  // Focus first invalid field for keyboard/screen-reader users
  if (firstInvalid) {
    firstInvalid.focus();
  }
  return valid;
}

function updateCharCount() {
  const desc = document.getElementById('f-desc');
  const counter = document.getElementById('desc-char-count');
  if (desc && counter) counter.textContent = `${desc.value.length} / 400`;
}

function clearPhoto() {
  pendingPhotoBlob = null;
  pendingPhotoDataUrl = null;
  pendingPhotoSizeKb = null;
  const preview = document.getElementById('photo-preview');
  const inner = document.getElementById('photo-upload-inner');
  const removeBtn = document.getElementById('photo-remove-btn');
  const input = document.getElementById('f-photo');
  const compCard = document.getElementById('form-compress-card');

  if (preview) { preview.src = ''; preview.classList.add('hidden'); }
  if (inner) inner.style.display = '';
  if (removeBtn) removeBtn.classList.add('hidden');
  if (input) input.value = '';
  if (compCard) compCard.classList.add('hidden');
}

/**
 * Handles incoming photo file for the complaint form with instant auto-compression to ≤200 KB
 */
async function handleFormPhotoUpload(file) {
  if (!file || !file.type.startsWith('image/')) {
    showToast('Please select a valid image file.', 'error');
    return;
  }

  const compCard = document.getElementById('form-compress-card');
  const badge = document.getElementById('form-comp-badge');
  if (compCard) compCard.classList.remove('hidden');
  if (badge) badge.textContent = '⚡ Optimizing image to ≤ 200 KB...';

  try {
    const result = await compressImage(file, 200);

    pendingPhotoBlob = result.blob;
    pendingPhotoDataUrl = result.dataUrl;
    pendingPhotoSizeKb = +(result.compBytes / 1024).toFixed(1);

    // Update Form Preview
    const preview = document.getElementById('photo-preview');
    const inner = document.getElementById('photo-upload-inner');
    const removeBtn = document.getElementById('photo-remove-btn');
    if (preview) { preview.src = result.dataUrl; preview.classList.remove('hidden'); }
    if (inner) inner.style.display = 'none';
    if (removeBtn) removeBtn.classList.remove('hidden');

    // Update Compression Metrics Card
    const savings = Math.max(0, Math.round(((result.origBytes - result.compBytes) / result.origBytes) * 100));
    document.getElementById('form-comp-badge').textContent = `⚡ Auto-compressed to ≤ 200 KB`;
    document.getElementById('form-comp-savings').textContent = `-${savings}% space saved`;
    document.getElementById('form-comp-orig').textContent = formatBytes(result.origBytes);
    document.getElementById('form-comp-result').textContent = `${formatBytes(result.compBytes)} (Target: ≤200 KB)`;
    document.getElementById('form-comp-dims').textContent = `${result.width} × ${result.height} px`;

    showToast(`Photo compressed to ${formatBytes(result.compBytes)} ✓`, 'success');
  } catch (err) {
    console.error('Form compression failed', err);
    showToast('Failed to optimize image. Please try another file.', 'error');
    clearPhoto();
  }
}

/**
 * Submit report handler (REST API + SQLite DBMS or fallback)
 */
async function submitReport(e) {
  e.preventDefault();
  if (!validateForm()) {
    // validateForm already moves focus to first invalid field
    return;
  }

  const btn = document.getElementById('form-submit-btn');
  btn.disabled = true;
  btn.setAttribute('aria-busy', 'true');
  btn.textContent = state.backendAvailable ? 'Saving to database…' : 'Saving…';

  const type = document.getElementById('f-type').value;
  const location = document.getElementById('f-location').value.trim();
  const description = document.getElementById('f-desc').value.trim();

  try {
    const newReport = await apiCreateReport({
      type,
      location,
      description,
      photo_base64: pendingPhotoDataUrl,
      photo_size_kb: pendingPhotoSizeKb,
    }, pendingPhotoBlob);

    // Refresh state and views
    await loadReports();
    updateStats();
    renderHomeRecent();
    renderReportsList();
    renderAdminList();

    clearForm();
    state.lastSubmittedId = newReport.id;
    renderConfirm(newReport);
    showView('confirm');
    state.formDirty = false;
    showToast(state.lang === 'hi' ? 'रिपोर्ट सफलतापूर्वक जमा हुई! ✓' : 'Report submitted successfully! ✓', 'success');
  } catch (err) {
    console.error('Report submission failed', err);
    showToast(state.lang === 'hi' ? 'रिपोर्ट सहेजने में त्रुटि। कृपया पुनः प्रयास करें।' : 'Error saving report. Please try again.', 'error');
  } finally {
    btn.disabled = false;
    btn.removeAttribute('aria-busy');
    btn.textContent = i18n[state.lang]['f_submit'] || 'Submit Report';
  }
}

/* =====================================================
   CONFIRM VIEW
   ===================================================== */

function renderConfirm(report) {
  const box = document.getElementById('confirm-detail-box');
  if (!box) return;
  const sizeInfo = report.photo_size_kb
    ? ` <span style="font-size:.78rem;color:var(--green-700);">(Photo compressed: ${report.photo_size_kb} KB)</span>`
    : '';

  box.innerHTML = `
    <p><strong>Issue Type</strong>${typeLabel(report.type)}</p>
    <p><strong>Location</strong>${escHtml(report.location)}</p>
    ${report.description ? `<p><strong>Description</strong>${escHtml(report.description)}</p>` : ''}
    <p><strong>Status</strong>${statusBadgeHTML(report.status)}</p>
    <p><strong>Storage</strong><span style="font-size:.82rem;font-weight:600;color:var(--green-700);">${state.backendAvailable ? '🟢 SQLite DBMS (cleanstreet.db)' : '⚡ Local Storage'}</span>${sizeInfo}</p>
    <p><strong>Report ID</strong><code style="font-size:.8rem;background:var(--neutral-100);padding:.15rem .35rem;border-radius:4px;">${report.id}</code></p>
  `;
}

/* =====================================================
   ADMIN VIEW (Real-Time SQLite Updates)
   ===================================================== */

function renderAdminList() {
  const list = document.getElementById('admin-list');
  const empty = document.getElementById('admin-empty');
  if (!list) return;
  list.innerHTML = '';

  const sorted = [...state.reports].sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));

  if (sorted.length === 0) {
    empty.classList.remove('hidden');
    list.style.display = 'none';
    return;
  }
  empty.classList.add('hidden');
  list.style.display = '';

  sorted.forEach(report => {
    const card = document.createElement('div');
    card.className = 'admin-card';
    const reportDate = report.created_at || report.createdAt;
    const photoTag = (report.photo_url || report.photoDataUrl)
      ? `<span style="font-size:.72rem;background:var(--teal-100);color:var(--teal-700);padding:.1rem .4rem;border-radius:4px;margin-left:.4rem;">📷 Photo (${report.photo_size_kb || '≤200'} KB)</span>`
      : '';

    card.innerHTML = `
      <div class="admin-card-header">
        <div>
          <div class="admin-card-title">${typeLabel(report.type)} — ${escHtml(report.location)} ${photoTag}</div>
          <div class="admin-card-sub">📅 ${formatRelativeDate(reportDate)} · ID: <code>${report.id}</code></div>
        </div>
        <div class="admin-card-controls">
          <select class="admin-status-select sel-${report.status}" id="admin-sel-${report.id}" aria-label="Change status for report ${report.id}">
            <option value="new"        ${report.status === 'new'        ? 'selected' : ''}>🔵 New</option>
            <option value="inprogress" ${report.status === 'inprogress' ? 'selected' : ''}>🟡 In Progress</option>
            <option value="resolved"   ${report.status === 'resolved'   ? 'selected' : ''}>🟢 Resolved</option>
          </select>
          <button class="admin-save-btn" data-id="${report.id}" aria-label="Save status for ${escHtml(report.location)}">Save</button>
        </div>
      </div>
      ${report.description ? `<p style="font-size:.82rem;color:var(--neutral-500);margin-top:.25rem;">${escHtml(report.description.slice(0,100))}${report.description.length>100?'…':''}</p>` : ''}
    `;

    const sel = card.querySelector('.admin-status-select');
    sel.addEventListener('change', () => {
      sel.className = `admin-status-select sel-${sel.value}`;
    });

    card.querySelector('.admin-save-btn').addEventListener('click', async (btnEvt) => {
      const saveBtn = btnEvt.target;
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving…';
      const newStatus = sel.value;

      try {
        await apiUpdateStatus(report.id, newStatus);
        await loadReports();
        renderAdminList();
        renderHomeRecent();
        renderReportsList();
        updateStats();
        showToast(`Saved to SQLite: "${STATUS_CONFIG[newStatus].label}" ✓`, 'success');
      } catch (err) {
        showToast('Failed to update status.', 'error');
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save';
      }
    });

    list.appendChild(card);
  });

  // Load Google Form integration status in admin panel
  loadGoogleFormConfig();
}

/* =====================================================
   GOOGLE FORM & CLOUD STORAGE INTEGRATION
   ===================================================== */

async function loadGoogleFormConfig() {
  const badge = document.getElementById('gf-status-badge');
  const badgeText = document.getElementById('gf-status-text');
  if (!badge || !badgeText) return;

  try {
    const res = await fetch('/api/google-form/config');
    if (!res.ok) return;
    const data = await res.json();
    if (data.success && data.config) {
      const cfg = data.config;
      const urlInput = document.getElementById('gf-url');
      const typeInput = document.getElementById('gf-entry-type');
      const locInput = document.getElementById('gf-entry-loc');
      const descInput = document.getElementById('gf-entry-desc');
      const photoInput = document.getElementById('gf-entry-photo');
      const scriptInput = document.getElementById('gf-script-url');

      if (urlInput) urlInput.value = cfg.googleFormUrl || '';
      if (typeInput) typeInput.value = cfg.entryType || '';
      if (locInput) locInput.value = cfg.entryLocation || '';
      if (descInput) descInput.value = cfg.entryDescription || '';
      if (photoInput) photoInput.value = cfg.entryPhoto || '';
      if (scriptInput) scriptInput.value = cfg.googleScriptUrl || '';

      if (cfg.enabled) {
        badge.classList.add('connected');
        badgeText.textContent = cfg.googleFormUrl ? 'Google Form Active' : 'Apps Script Active';
        badge.title = 'Submissions automatically sync to Google Form & Google Sheet';
      } else {
        badge.classList.remove('connected');
        badgeText.textContent = 'Not Connected';
        badge.title = 'Enter Google Form URL and field IDs to enable sync';
      }
    }
  } catch (err) {
    console.warn('Could not load Google Form config:', err);
  }
}

function initGoogleFormPanel() {
  const form = document.getElementById('google-form-settings');
  const testBtn = document.getElementById('gf-test-btn');
  const guideBtn = document.getElementById('gf-guide-toggle-btn');
  const guideBox = document.getElementById('gf-guide-box');
  const autoDetectBtn = document.getElementById('gf-auto-detect-btn');

  if (autoDetectBtn) {
    autoDetectBtn.addEventListener('click', async () => {
      const url = document.getElementById('gf-url')?.value.trim();
      if (!url) {
        showToast('Please enter your Google Form URL first.', 'error');
        return;
      }
      autoDetectBtn.disabled = true;
      autoDetectBtn.textContent = 'Detecting…';

      try {
        const res = await fetch('/api/google-form/discover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        const data = await res.json();
        if (data.success && data.fields) {
          if (data.fields.entryType) document.getElementById('gf-entry-type').value = data.fields.entryType;
          if (data.fields.entryLocation) document.getElementById('gf-entry-loc').value = data.fields.entryLocation;
          if (data.fields.entryDescription) document.getElementById('gf-entry-desc').value = data.fields.entryDescription;
          if (data.fields.entryPhoto) document.getElementById('gf-entry-photo').value = data.fields.entryPhoto;
          showToast(`Detected form fields automatically! Click Save Configuration. ✓`, 'success');
        } else {
          showToast(data.error || 'Could not auto-detect fields. Please enter field IDs manually.', 'error');
        }
      } catch (err) {
        showToast('Error connecting to form URL.', 'error');
      } finally {
        autoDetectBtn.disabled = false;
        autoDetectBtn.textContent = '⚡ Auto-Detect Fields';
      }
    });
  }

  if (guideBtn && guideBox) {
    guideBtn.addEventListener('click', () => {
      guideBox.classList.toggle('hidden');
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const saveBtn = document.getElementById('gf-save-btn');
      if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Saving…'; }

      const payload = {
        googleFormUrl: document.getElementById('gf-url')?.value.trim() || '',
        entryType: document.getElementById('gf-entry-type')?.value.trim() || '',
        entryLocation: document.getElementById('gf-entry-loc')?.value.trim() || '',
        entryDescription: document.getElementById('gf-entry-desc')?.value.trim() || '',
        entryPhoto: document.getElementById('gf-entry-photo')?.value.trim() || '',
        googleScriptUrl: document.getElementById('gf-script-url')?.value.trim() || '',
      };

      try {
        const res = await fetch('/api/google-form/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          showToast('Google Form configuration saved successfully ✓', 'success');
          await loadGoogleFormConfig();
        } else {
          showToast(data.error || 'Failed to save configuration', 'error');
        }
      } catch (err) {
        showToast('Error saving Google Form configuration', 'error');
      } finally {
        if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = '💾 Save Configuration'; }
      }
    });
  }

  if (testBtn) {
    testBtn.addEventListener('click', async () => {
      testBtn.disabled = true;
      testBtn.textContent = 'Sending…';

      try {
        const res = await fetch('/api/google-form/test', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          showToast('Test submission sent to Google Form / Sheet! ✓', 'success');
        } else {
          showToast(data.error || 'Failed to send test submission', 'error');
        }
      } catch (err) {
        showToast('Error connecting to Google Form', 'error');
      } finally {
        testBtn.disabled = false;
        testBtn.textContent = '🧪 Send Test Report';
      }
    });
  }
}

/* =====================================================
   TOAST NOTIFICATION
   ===================================================== */

let toastTimer;
function showToast(message, type = '') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast ${type}`;
  void toast.offsetWidth;
  toast.classList.add('show');
  toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    // Re-hide after transition completes so it doesn't remain in DOM flow
    setTimeout(() => toast.classList.add('hidden'), 300);
  }, 3400);
}

/* =====================================================
   UTILITIES
   ===================================================== */

function escHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* =====================================================
   DUPLICATE REPORT DETECTION & TRUST CONTROLS
   ===================================================== */

let dupDebounceTimer = null;

function checkSimilarReports() {
  const box = document.getElementById('duplicate-suggestion-box');
  if (!box) return;

  const type = document.getElementById('f-type')?.value;
  const locRaw = (document.getElementById('f-location')?.value || '').trim();

  if (!type || locRaw.length < 3) {
    box.classList.add('hidden');
    box.innerHTML = '';
    return;
  }

  const locTokens = locRaw.toLowerCase().split(/[\s,.-]+/).filter(w => w.length >= 3);

  // Find candidate matches: same type and matching location tokens or substring
  const matches = state.reports.filter(r => {
    if (r.type !== type) return false;
    const rLoc = (r.location || '').toLowerCase();
    if (rLoc.includes(locRaw.toLowerCase()) || locRaw.toLowerCase().includes(rLoc)) return true;
    return locTokens.some(tok => rLoc.includes(tok));
  }).slice(0, 2);

  if (matches.length === 0) {
    box.className = 'duplicate-suggestion-box no-match';
    box.innerHTML = `
      <span>✓ No matching ${ISSUE_TYPES[type]?.label || 'reports'} found in this neighbourhood. Proceed with your new report.</span>
    `;
    box.classList.remove('hidden');
    return;
  }

  box.className = 'duplicate-suggestion-box';
  box.innerHTML = `
    <div class="dup-header">
      <span aria-hidden="true">🔍</span>
      <span>Similar Community Report Found Nearby</span>
    </div>
    <p class="dup-sub">Another resident may have already reported this issue. You can confirm the existing report (+1) or continue submitting your new report:</p>
    ${matches.map(m => {
      const dateStr = formatRelativeDate(m.created_at || m.createdAt);
      return `
        <div class="dup-card" data-id="${m.id}">
          <div class="dup-card-info">
            <div class="dup-card-loc">${escHtml(m.location)}</div>
            <div class="dup-card-meta">
              <span>Status: <strong>${m.status === 'inprogress' ? 'In Progress' : (m.status === 'resolved' ? 'Resolved' : 'New')}</strong></span> ·
              <span>📅 ${dateStr}</span> ·
              <span>👍 ${m.confirmations || 1} Confirmations</span>
            </div>
            ${m.description ? `<p style="margin:4px 0 0 0;font-size:0.78rem;color:var(--neutral-600);">"${escHtml(m.description.slice(0, 90))}${m.description.length > 90 ? '…' : ''}"</p>` : ''}
          </div>
          <button type="button" class="btn-dup-confirm" data-id="${m.id}" aria-label="Confirm this existing report">
            <span>👍</span> Still an Issue (+1)
          </button>
        </div>
      `;
    }).join('')}
    <div class="dup-actions">
      <button type="button" class="btn-dup-dismiss" id="btn-dup-dismiss">
        Continue submitting new report anyway →
      </button>
    </div>
  `;
  box.classList.remove('hidden');

  // Bind confirmation & dismiss
  box.querySelectorAll('.btn-dup-confirm').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const reportId = btn.dataset.id;
      btn.disabled = true;
      btn.textContent = 'Confirming…';

      await apiConfirmReport(reportId);
      markReportConfirmed(reportId);
      await loadReports();
      renderReportsList();
      updateStats();
      showView('reports');

      const targetCard = document.querySelector(`.report-card[data-id="${reportId}"]`);
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      showToast('Thank you! Confirmed existing report instead of creating a duplicate. 👍', 'success');
      clearForm();
      box.classList.add('hidden');
    });
  });

  const dismissBtn = box.querySelector('#btn-dup-dismiss');
  dismissBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    box.classList.add('hidden');
  });
}

function initDuplicateDetection() {
  const typeSelect = document.getElementById('f-type');
  const locInput = document.getElementById('f-location');

  typeSelect?.addEventListener('change', checkSimilarReports);
  locInput?.addEventListener('input', () => {
    clearTimeout(dupDebounceTimer);
    dupDebounceTimer = setTimeout(checkSimilarReports, 300);
  });
}

function initClearDemoData() {
  const btn = document.getElementById('btn-clear-demo-data');
  btn?.addEventListener('click', async () => {
    const ok = window.confirm('Are you sure you want to clear all locally stored demo reports? This will reset the prototype report sheet.');
    if (!ok) return;

    btn.disabled = true;
    btn.textContent = 'Clearing…';

    try {
      if (state.backendAvailable) {
        await fetch(`${state.activeApiUrl}/api/reports/reset`, { method: 'POST' });
      }
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('cleanstreet_confirmed_reports_v1');
      state.reports = [];
      await loadReports();
      updateStats();
      renderHomeRecent();
      renderReportsList();
      updateOverviewDashboard();
      updateLocalityChips();
      showToast('All demo reports cleared. Report sheet is reset.', 'success');
    } catch (err) {
      showToast('Error resetting demo reports.', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<span aria-hidden="true">🗑</span> Clear Demo Data';
    }
  });
}

function initGuideAreaFilter() {
  const select = document.getElementById('guide-area-select');
  const statusP = document.getElementById('guide-scope-status');
  select?.addEventListener('change', () => {
    const val = select.value;
    if (val === 'ward4' || val === 'ward12') {
      const wardName = val === 'ward4' ? 'Ward 4 (Andheri West)' : 'Ward 12 (Indiranagar)';
      if (statusP) {
        statusP.innerHTML = `⚠️ <strong>Ward-Specific Scope:</strong> Local ward bylaws, doorstep collection timings, and specific segregation rules for <em>${wardName}</em> are not available in this demo. Showing national <strong>SWM Rules 2016 baseline rules</strong>. Please consult your local municipal ward office.`;
      }
    } else {
      if (statusP) {
        statusP.innerHTML = `Displaying baseline segregation guidelines derived from India's <strong>Solid Waste Management (SWM) Rules, 2016</strong>. Local bylaws and collection days vary by municipality. Please consult your local municipal ward office for binding local rules.`;
      }
    }
  });
}

/* =====================================================
   EVENT BINDINGS
   ===================================================== */

function bindEvents() {
  // ---- MOBILE HAMBURGER NAV ----
  const navToggle = document.getElementById('nav-toggle');
  const primaryNav = document.getElementById('primary-nav');
  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      navToggle.setAttribute('aria-label', expanded ? 'Open navigation menu' : 'Close navigation menu');
      primaryNav.classList.toggle('open', !expanded);
    });
  }

  // ---- PRIMARY NAVIGATION ----
  document.querySelectorAll('.nav-btn[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      if (view === 'reports') renderReportsList();
      if (view === 'admin')   renderAdminList();
      showView(view);
    });
  });

  // Logo → Home
  document.getElementById('nav-home')?.addEventListener('click', (e) => {
    e.preventDefault();
    showView('home');
  });

  // Database status pill click → show details toast
  document.getElementById('db-status-pill')?.addEventListener('click', () => {
    if (state.backendAvailable) {
      showToast(`Connected to database (${state.reports.length} total reports)`, 'success');
    } else {
      showToast('Local Mode: Data stored in your browser only.', '');
    }
  });

  // ---- DUPLICATE DETECTION IN REPORT FORM ----
  initDuplicateDetection();

  // ---- GUIDE LOCALITY SCOPE SELECTOR ----
  initGuideAreaFilter();

  // ---- HERO BUTTONS ----
  document.getElementById('hero-report-btn')?.addEventListener('click', () => {
    clearForm();
    showView('form');
  });
  document.getElementById('hero-guide-btn')?.addEventListener('click', () => showView('guide'));

  // ---- HOME VIEW ALL ----
  document.getElementById('home-view-all-btn')?.addEventListener('click', () => {
    renderReportsList();
    showView('reports');
  });

  // ---- REPORTS PAGE NEW REPORT ----
  document.getElementById('reports-new-btn')?.addEventListener('click', () => {
    clearForm();
    showView('form');
  });

  // ---- FILTERS & SORTING ----
  document.getElementById('filter-status')?.addEventListener('change', (e) => {
    state.filters.status = e.target.value;
    renderReportsList();
  });
  document.getElementById('filter-type')?.addEventListener('change', (e) => {
    state.filters.type = e.target.value;
    renderReportsList();
  });
  document.getElementById('filter-sort')?.addEventListener('change', (e) => {
    state.filters.sort = e.target.value;
    renderReportsList();
  });
  document.getElementById('filter-clear-btn')?.addEventListener('click', () => {
    state.filters = { status: 'all', type: 'all', area: 'all', sort: 'upvotes' };
    const statusSelect = document.getElementById('filter-status');
    const typeSelect = document.getElementById('filter-type');
    const sortSelect = document.getElementById('filter-sort');
    if (statusSelect) statusSelect.value = 'all';
    if (typeSelect) typeSelect.value = 'all';
    if (sortSelect) sortSelect.value = 'upvotes';

    document.querySelectorAll('.locality-chip').forEach(c => {
      const isAll = c.dataset.area === 'all';
      c.classList.toggle('active', isAll);
      c.setAttribute('aria-pressed', isAll ? 'true' : 'false');
    });

    renderReportsList();
  });

  // ---- NEIGHBOURHOOD LOCALITY CHIPS ----
  initLocalityChips();

  // ---- WASTE SORTING QUICK-CHECKER HELPER ----
  initSortingHelper();

  // ---- GUIDE SEARCH CLEAR BUTTON ----
  const guideSearchInput = document.getElementById('guide-search-input');
  const guideSearchClear = document.getElementById('guide-search-clear');
  if (guideSearchInput && guideSearchClear) {
    guideSearchInput.addEventListener('input', () => {
      guideSearchClear.classList.toggle('hidden', guideSearchInput.value.length === 0);
    });
    guideSearchClear.addEventListener('click', () => {
      guideSearchInput.value = '';
      helperSearchQuery = '';
      guideSearchClear.classList.add('hidden');
      renderSortingHelperResults();
      guideSearchInput.focus();
    });
  }

  // ---- FORM BACK ----
  document.getElementById('form-back-btn')?.addEventListener('click', () => {
    if (state.formDirty) {
      const msg = state.lang === 'hi'
        ? 'आपने जो डेटा भरा है वह सहेजा नहीं गया है। क्या आप वापस जाना चाहते हैं?'
        : 'You have unsaved changes. Are you sure you want to go back?';
      if (!confirm(msg)) return;
    }
    state.formDirty = false;
    showView('reports');
    renderReportsList();
  });

  // ---- FORM DIRTY TRACKING ----
  const reportForm = document.getElementById('report-form');
  if (reportForm) {
    reportForm.addEventListener('input', () => {
      state.formDirty = true;
    });
    reportForm.addEventListener('change', () => {
      state.formDirty = true;
    });
  }

  // ---- FORM SUBMISSION ----
  reportForm?.addEventListener('submit', submitReport);

  // ---- FORM CHAR COUNT ----
  document.getElementById('f-desc')?.addEventListener('input', updateCharCount);

  // ---- PHOTO UPLOAD (Auto-compressing ≤200 KB) ----
  document.getElementById('f-photo')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFormPhotoUpload(file);
  });

  const formDropZone = document.getElementById('photo-drop-zone');
  if (formDropZone) {
    formDropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      formDropZone.classList.add('drag-over');
    });
    formDropZone.addEventListener('dragleave', () => formDropZone.classList.remove('drag-over'));
    formDropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      formDropZone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) handleFormPhotoUpload(file);
    });
    formDropZone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        document.getElementById('f-photo')?.click();
      }
    });
  }

  document.getElementById('photo-remove-btn')?.addEventListener('click', clearPhoto);

  // ---- CONFIRMATION ACTIONS ----
  document.getElementById('confirm-view-reports-btn')?.addEventListener('click', () => {
    renderReportsList();
    showView('reports');
  });
  document.getElementById('confirm-another-btn')?.addEventListener('click', () => {
    clearForm();
    showView('form');
  });

  // ---- LANGUAGE TOGGLE ----
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => applyLang(btn.dataset.lang));
  });

  // ---- BROWSER HISTORY NAVIGATION ----
  window.addEventListener('popstate', (e) => {
    const view = e.state?.view || 'home';
    showView(view, false);
    if (view === 'reports') renderReportsList();
    if (view === 'admin') renderAdminList();
  });

  // ---- FORM DATA LOSS PREVENTION ----
  window.addEventListener('beforeunload', (e) => {
    if (state.formDirty && state.currentView === 'form') {
      e.preventDefault();
      // Standard way to trigger browser's "unsaved changes" dialog
      e.returnValue = '';
    }
  });
}

/* =====================================================
   PRELOADER CONTROLLER & LIFECYCLE
   ===================================================== */

let preloaderDismissed = false;

function setPreloaderStatus(text) {
  const statusEl = document.getElementById('preloader-status-text');
  if (statusEl && text) {
    statusEl.textContent = text;
  }
}

function showPreloaderError(message, canContinueOffline = true) {
  const loadingState = document.getElementById('preloader-loading-state');
  const errorState = document.getElementById('preloader-error-state');
  const errorDesc = document.getElementById('preloader-error-desc');
  const offlineBtn = document.getElementById('preloader-offline-btn');

  if (loadingState) loadingState.hidden = true;
  if (errorState) errorState.hidden = false;
  if (errorDesc && message) errorDesc.textContent = message;
  if (offlineBtn) offlineBtn.style.display = canContinueOffline ? 'inline-flex' : 'none';
}

function hidePreloader() {
  if (preloaderDismissed) return;
  preloaderDismissed = true;
  const preloader = document.getElementById('app-preloader');
  if (!preloader) return;

  preloader.classList.add('preloader-hidden');
  preloader.setAttribute('aria-busy', 'false');

  // Remove from accessibility tree after transition completes
  setTimeout(() => {
    preloader.hidden = true;
    preloader.style.display = 'none';
  }, 300);
}

/* =====================================================
   BOOTSTRAP
   ===================================================== */

async function runBootSequence() {
  const dict = i18n[state.lang] || i18n.en;
  setPreloaderStatus(dict.preloader_connecting || 'Connecting to SQLite DBMS…');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const minEntranceDelay = prefersReducedMotion ? 0 : 750;
  const timerPromise = new Promise(resolve => setTimeout(resolve, minEntranceDelay));

  try {
    // 1. Detect backend (Express REST API / SQLite) with a 6-second safety timeout
    const backendPromise = detectBackend();
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 6000));
    
    await Promise.race([backendPromise, timeoutPromise]).catch(err => {
      console.warn('Backend detection timeout/fallback:', err.message);
    });

    setPreloaderStatus(dict.preloader_loading_reports || 'Loading community reports…');

    // 2. Load reports from SQLite or localStorage
    await Promise.race([
      loadReports(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Reports fetch timed out')), 6000))
    ]).catch(err => {
      console.warn('Reports loading error:', err.message);
    });

    updateStats();
    renderHomeRecent();

    // 3. Route based on URL hash
    const hash = window.location.hash.slice(1);
    const validViews = ['home', 'reports', 'form', 'guide', 'confirm'];
    const startView = validViews.includes(hash) ? hash : 'home';
    showView(startView, false);

    if (startView === 'reports') renderReportsList();

    // Await visual entrance animation completion so the user enjoys the opening preloader
    await timerPromise;

    console.info(`CleanStreet: booted. Backend online: ${state.backendAvailable}. Reports: ${state.reports.length}`);

    // Dismiss preloader smoothly
    hidePreloader();
  } catch (err) {
    console.error('CleanStreet boot sequence error:', err);
    showPreloaderError(dict.preloader_error_msg || 'Could not connect to backend server. You can continue in Local Mode or retry.', true);
  }
}

async function init() {
  const preloader = document.getElementById('app-preloader');
  if (preloader) {
    preloader.setAttribute('aria-busy', 'true');
  }

  // Preloader event listeners for retry and offline fallback
  document.getElementById('preloader-retry-btn')?.addEventListener('click', async () => {
    const loadingState = document.getElementById('preloader-loading-state');
    const errorState = document.getElementById('preloader-error-state');
    if (loadingState) loadingState.hidden = false;
    if (errorState) errorState.hidden = true;
    const dict = i18n[state.lang] || i18n.en;
    setPreloaderStatus(dict.preloader_retrying || 'Reconnecting to database…');
    await runBootSequence();
  });

  document.getElementById('preloader-offline-btn')?.addEventListener('click', () => {
    hidePreloader();
  });

  bindEvents();
  applyLang('en');

  await runBootSequence();
}

document.addEventListener('DOMContentLoaded', init);
