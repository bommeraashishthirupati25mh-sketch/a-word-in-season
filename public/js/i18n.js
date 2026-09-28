// Interface text. Verse text comes from verses.json; the speaker kit
// (prayers and talking points) is in English only for now.

export const LANGS = {
  en: { label: "English", short: "EN", version: "KJV" },
  hi: { label: "हिंदी", short: "हि", version: "IRV" },
  te: { label: "తెలుగు", short: "తె", version: "IRV" },
};

const T = {
  title: { en: "A Word in Season", hi: "समय पर कहा गया वचन", te: "సమయోచిత వాక్యం" },
  tagline: { en: "Scripture for every occasion", hi: "हर अवसर के लिए परमेश्वर का वचन", te: "ప్రతి సందర్భానికి దేవుని వాక్యం" },
  search: { en: "Search occasions or verses…", hi: "अवसर या वचन खोजें…", te: "సందర్భం లేదా వచనం వెతకండి…" },
  verseOfDay: { en: "Verse of the day", hi: "आज का वचन", te: "నేటి వచనం" },
  occasions: { en: "Occasions", hi: "अवसर", te: "సందర్భాలు" },
  allOccasions: { en: "All occasions", hi: "सभी अवसर", te: "అన్ని సందర్భాలు" },
  verses: { en: "Verses", hi: "वचन", te: "వచనాలు" },
  versesCount: { en: "verses", hi: "वचन", te: "వచనాలు" },
  kit: { en: "Speaker's kit", hi: "संदेश सहायता", te: "సందేశ సహాయం" },
  prayer: { en: "Opening prayer", hi: "आरंभिक प्रार्थना", te: "ప్రారంభ ప్రార్థన" },
  points: { en: "Talking points", hi: "संदेश के मुख्य बिंदु", te: "సందేశ ముఖ్యాంశాలు" },
  blessing: { en: "Closing blessing", hi: "आशीर्वचन", te: "ముగింపు ఆశీర్వాదం" },
  kitNote: {
    en: "",
    hi: "प्रार्थना और बिंदु अभी अंग्रेज़ी में हैं — अपनी भाषा में ढाल लें।",
    te: "ప్రార్థన మరియు అంశాలు ప్రస్తుతం ఇంగ్లీషులో ఉన్నాయి — మీ భాషలో మార్చుకోండి.",
  },
  present: { en: "Present", hi: "प्रस्तुत करें", te: "ప్రదర్శించు" },
  presentAll: { en: "Present all", hi: "सब प्रस्तुत करें", te: "అన్నీ ప్రదర్శించు" },
  copy: { en: "Copy", hi: "कॉपी", te: "కాపీ" },
  copied: { en: "Copied", hi: "कॉपी हो गया", te: "కాపీ అయింది" },
  share: { en: "Share", hi: "साझा करें", te: "పంచుకోండి" },
  save: { en: "Save", hi: "सहेजें", te: "సేవ్" },
  unsave: { en: "Saved", hi: "सहेजा गया", te: "సేవ్ అయింది" },
  saved: { en: "Saved", hi: "सहेजे गए", te: "సేవ్ చేసినవి" },
  savedTitle: { en: "Saved verses", hi: "सहेजे गए वचन", te: "సేవ్ చేసిన వచనాలు" },
  savedEmpty: {
    en: "Nothing saved yet. Tap the star on any verse to keep it here on this device.",
    hi: "अभी कुछ सहेजा नहीं गया। किसी भी वचन पर तारा दबाएँ, वह इस डिवाइस पर यहाँ रहेगा।",
    te: "ఇంకా ఏదీ సేవ్ చేయలేదు. ఏ వచనంపైనైనా నక్షత్రం నొక్కండి, అది ఈ పరికరంలో ఇక్కడ ఉంటుంది.",
  },
  showIn: { en: "Verses in", hi: "वचन की भाषा", te: "వచనాల భాష" },
  siteLang: { en: "Site language", hi: "साइट की भाषा", te: "సైట్ భాష" },
  about: { en: "About", hi: "परिचय", te: "గురించి" },
  noResults: { en: "Nothing found. Try another word.", hi: "कुछ नहीं मिला। कोई और शब्द आज़माएँ।", te: "ఏమీ దొరకలేదు. మరో పదం ప్రయత్నించండి." },
  matchingVerses: { en: "Matching verses", hi: "मिलते-जुलते वचन", te: "సరిపోయే వచనాలు" },
  prev: { en: "Previous", hi: "पिछला", te: "మునుపటి" },
  next: { en: "Next", hi: "अगला", te: "తదుపరి" },
  close: { en: "Close", hi: "बंद करें", te: "మూసివేయి" },
  bigger: { en: "Larger text", hi: "बड़ा अक्षर", te: "పెద్ద అక్షరాలు" },
  smaller: { en: "Smaller text", hi: "छोटा अक्षर", te: "చిన్న అక్షరాలు" },
  theme: { en: "Light / dark", hi: "हल्का / गहरा", te: "లేత / ముదురు" },
  podiumHelp: {
    en: "Tap the sides or use arrow keys · B blanks the screen · Esc to close",
    hi: "किनारों पर टैप करें या तीर कुंजियाँ · B से स्क्रीन खाली · Esc से बंद",
    te: "అంచులపై నొక్కండి లేదా బాణం కీలు · B తో స్క్రీన్ ఖాళీ · Esc తో మూసివేయి",
  },
  notFound: { en: "Page not found.", hi: "पेज नहीं मिला।", te: "పేజీ కనబడలేదు." },
  install: { en: "Install", hi: "इंस्टॉल", te: "ఇన్‌స్టాల్" },
  iosInstall: {
    en: "Install this app: tap Share, then “Add to Home Screen”.",
    hi: "ऐप इंस्टॉल करें: Share दबाएँ, फिर “Add to Home Screen” चुनें।",
    te: "యాప్ ఇన్‌స్టాల్ చేయండి: Share నొక్కి, “Add to Home Screen” ఎంచుకోండి.",
  },
  updateReady: { en: "A new version is ready.", hi: "नया संस्करण तैयार है।", te: "కొత్త వెర్షన్ సిద్ధంగా ఉంది." },
  reload: { en: "Update", hi: "अपडेट करें", te: "అప్‌డేట్" },
  dismiss: { en: "Dismiss", hi: "हटाएँ", te: "తీసివేయి" },
  offline: {
    en: "You're offline — everything still works.",
    hi: "आप ऑफ़लाइन हैं — सब कुछ फिर भी चलेगा।",
    te: "మీరు ఆఫ్‌లైన్‌లో ఉన్నారు — అన్నీ పని చేస్తాయి.",
  },
  textSize: { en: "Text size", hi: "अक्षर का आकार", te: "అక్షర పరిమాణం" },
};

export function t(key, lang) {
  const entry = T[key];
  if (!entry) return key;
  return entry[lang] ?? entry.en;
}
