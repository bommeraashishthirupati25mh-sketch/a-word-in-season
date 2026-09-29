// Occasions, their verse references and the speaker kit for each.
// Verse text is never written here — it is pulled from the source Bibles by
// scripts/build-verses.mjs into public/data/verses.json, keyed by reference.
// References use USFM book codes: "JHN 3:16", "1CO 13:4-7".
// `id` is the page's URL slug (/occasions/<id>); `about` completes "Bible verses for …".
// `greet` opens a shared greeting card; `style` is the card's default design.

export const OCCASIONS = [
  {
    id: "birthday",
    icon: "🎂",
    about: "birthdays",
    related: ["wedding-anniversary","baby-dedication","thanksgiving-and-harvest"],
    name: { en: "Birthday", hi: "जन्मदिन", te: "పుట్టినరోజు" },
    greet: { en: "Wishing you a blessed birthday!", hi: "जन्मदिन की ढेरों शुभकामनाएँ!", te: "పుట్టినరోజు శుభాకాంక్షలు!" },
    style: "dawn",
    tags: ["birthday", "life", "years", "age", "blessing", "celebration"],
    verses: [
      "PSA 118:24", "PSA 139:13-14", "JER 29:11", "LAM 3:22-23", "PSA 90:12", "PRO 3:5-6", "ISA 46:4", "PSA 20:4",
      "PSA 91:16", "NUM 6:24-26", "PSA 139:16", "PSA 71:6", "PSA 16:11", "PSA 23:6", "PSA 103:5", "PRO 9:11",
      "PSA 92:12-14", "3JN 1:2", "EPH 2:10", "PHP 1:6", "PSA 37:4", "PSA 65:11", "ISA 40:31", "JAS 1:17",
      "ZEP 3:17", "PSA 121:8", "2CO 4:16",
    ],
    kit: {
      prayer:
        "Heavenly Father, we thank You for the gift of life and for another year You have given to our brother or sister. You knit them together in their mother's womb and You have carried them every day since. As we celebrate today, fill their heart with joy, their home with peace, and the year ahead with Your goodness. In Jesus' name, Amen.",
      points: [
        { title: "Every year is a gift", text: "Our days are not earned; they are given. A birthday is a day to count blessings, not candles.", ref: "PSA 118:24" },
        { title: "Made on purpose", text: "God formed this life with care and intention — fearfully and wonderfully made.", ref: "PSA 139:13-14" },
        { title: "The years ahead are in His hands", text: "The One who carried us from birth promises to carry us into old age.", ref: "ISA 46:4" },
      ],
      blessing: "NUM 6:24-26",
    },
  },
  {
    id: "wedding",
    icon: "💍",
    about: "weddings",
    related: ["engagement","wedding-anniversary","housewarming"],
    name: { en: "Wedding", hi: "विवाह", te: "వివాహం" },
    greet: { en: "Wishing you a blessed married life!", hi: "आपके वैवाहिक जीवन के लिए ढेरों शुभकामनाएँ!", te: "మీ వివాహ జీవితానికి శుభాకాంక్షలు!" },
    style: "garden",
    tags: ["wedding", "marriage", "love", "husband", "wife", "union", "couple"],
    verses: [
      "GEN 2:24", "1CO 13:4-7", "ECC 4:9-12", "MRK 10:9", "COL 3:14", "EPH 4:2-3", "EPH 5:25", "RUT 1:16",
      "SNG 8:7", "PRO 18:22", "PSA 127:1", "1JN 4:7", "GEN 2:18", "MAT 19:6", "EPH 5:33", "1PE 4:8", "ROM 12:10",
      "1CO 13:13", "SNG 2:16", "PRO 31:10", "COL 3:12-13", "1JN 4:18", "1JN 4:19", "PRO 3:3-4", "1CO 16:14",
      "PHP 2:2", "JHN 15:12", "PSA 34:3", 
    ],
    kit: {
      prayer:
        "Lord God, You are the author of love and the One who first joined man and woman together. We thank You for bringing this couple to this day. Be the foundation of their home and the third strand in their cord. Teach them to love patiently, forgive quickly and serve one another gladly all the days of their life. In Jesus' name, Amen.",
      points: [
        { title: "Two become one", text: "Marriage is God's design: leaving, cleaving and becoming one flesh.", ref: "GEN 2:24" },
        { title: "Love is a daily choice", text: "Patience, kindness and humility are what love looks like on an ordinary Tuesday.", ref: "1CO 13:4-7" },
        { title: "A cord of three strands", text: "A marriage with God at the centre is not easily broken.", ref: "ECC 4:9-12" },
      ],
      blessing: "NUM 6:24-26",
    },
  },
  {
    id: "engagement",
    icon: "🤝",
    about: "engagements",
    related: ["wedding","wedding-anniversary"],
    name: { en: "Engagement", hi: "सगाई", te: "నిశ్చితార్థం" },
    greet: { en: "Congratulations on your engagement!", hi: "सगाई की हार्दिक बधाई!", te: "నిశ్చితార్థ శుభాకాంక్షలు!" },
    style: "garden",
    tags: ["engagement", "betrothal", "promise", "future", "couple"],
    verses: [
      "PRO 19:14", "AMO 3:3", "SNG 8:6", "PSA 37:4-5", "PRO 3:5-6", "ROM 12:10", "1CO 16:14", "PHP 1:6",
      "GEN 24:50", "JER 29:11", "PRO 16:9", "PSA 20:4", "SNG 2:10", "SNG 4:7", "ECC 3:1", "1CO 13:4-7", "COL 3:14",
      "1JN 4:7", "PRO 18:22", "RUT 1:16", "ISA 62:5", "PSA 118:23", "MAT 6:33",
    ],
    kit: {
      prayer:
        "Father, we thank You for leading these two lives towards each other. As they make this promise today, guide their steps, guard their hearts and prepare them for the covenant of marriage. May their love be rooted in You and grow stronger in every season. In Jesus' name, Amen.",
      points: [
        { title: "A gift from the Lord", text: "A godly spouse is not found by chance; it is a gift God gives.", ref: "PRO 19:14" },
        { title: "Walking in agreement", text: "Before two can walk together through life, they must agree on the direction.", ref: "AMO 3:3" },
        { title: "Commit the way to Him", text: "Trust God with the plans, and He will bring them to pass.", ref: "PSA 37:4-5" },
      ],
      blessing: "PHP 1:6",
    },
  },
  {
    id: "wedding-anniversary",
    icon: "💞",
    about: "wedding anniversaries",
    related: ["wedding","birthday","thanksgiving-and-harvest"],
    name: { en: "Wedding Anniversary", hi: "विवाह वर्षगांठ", te: "వివాహ వార్షికోత్సవం" },
    greet: { en: "Wishing you a happy wedding anniversary!", hi: "विवाह वर्षगांठ की हार्दिक शुभकामनाएँ!", te: "వివాహ వార్షికోత్సవ శుభాకాంక్షలు!" },
    style: "garden",
    tags: ["anniversary", "marriage", "faithfulness", "years", "couple", "love"],
    verses: [
      "1SA 7:12", "LAM 3:22-23", "PSA 126:3", "ECC 9:9", "PRO 31:10-11", "COL 3:12-14", "1CO 13:7-8", "JOS 24:15",
      "PSA 90:17", "PSA 100:5", "PSA 136:1", "PRO 5:18", "PRO 31:28-29", "SNG 8:7", "ECC 4:9-10", "MRK 10:9",
      "EPH 5:25", "GEN 2:24", "PSA 118:1", "1CO 13:13", "PSA 115:14-15", "PSA 128:3-4", "1TH 5:18",
    ],
    kit: {
      prayer:
        "Faithful God, we give You thanks for every year You have kept this couple together — through joys and trials, plenty and want. Your mercies have been new every morning in their home. Renew their love today, and let their marriage continue to be a testimony of Your faithfulness. In Jesus' name, Amen.",
      points: [
        { title: "Hitherto the Lord has helped us", text: "Every anniversary is an Ebenezer — a stone of remembrance of God's help.", ref: "1SA 7:12" },
        { title: "New mercies every morning", text: "A long marriage is built on God's faithfulness more than our own.", ref: "LAM 3:22-23" },
        { title: "Love that endures", text: "Love bears, believes, hopes and endures all things — and never fails.", ref: "1CO 13:7-8" },
      ],
      blessing: "PSA 90:17",
    },
  },
  {
    id: "baptism",
    icon: "🕊️",
    about: "baptism services",
    related: ["baby-dedication","ordination-and-ministry","good-friday-and-easter"],
    name: { en: "Baptism", hi: "बपतिस्मा", te: "బాప్తిస్మం" },
    greet: { en: "Rejoicing with you on your baptism!", hi: "आपके बपतिस्मा पर हार्दिक बधाई!", te: "మీ బాప్తిస్మం సందర్భంగా శుభాకాంక్షలు!" },
    style: "royal",
    tags: ["baptism", "new life", "faith", "salvation", "water", "confession"],
    verses: [
      "MAT 28:19-20", "ROM 6:4", "ACT 2:38", "GAL 3:27", "2CO 5:17", "COL 2:12", "ACT 8:38", "ACT 22:16",
      "MAT 3:16-17", "1PE 3:21", "JHN 3:5", "ROM 6:3", "ROM 6:11", "EPH 4:5", "TIT 3:5", "ACT 2:41", "ACT 16:33",
      "ACT 10:47-48", "1CO 12:13", "GAL 2:20", "EZK 36:25-26", "PSA 51:10", "ISA 43:1", "1JN 1:7", "ROM 10:9",
      "LUK 15:10",
    ],
    kit: {
      prayer:
        "Lord Jesus, today we rejoice as Your child follows You in the waters of baptism. As they are buried with You and raised to walk in newness of life, fill them with Your Holy Spirit. Keep them faithful, make them fruitful, and let this day be remembered as a new beginning. In Your name we pray, Amen.",
      points: [
        { title: "Obedience to Christ", text: "Baptism is not our idea — it is the command of Jesus to all who follow Him.", ref: "MAT 28:19-20" },
        { title: "Buried and raised", text: "Going down into the water pictures death to the old life; coming up pictures new life in Christ.", ref: "ROM 6:4" },
        { title: "A new creation", text: "The old has gone; the new has come.", ref: "2CO 5:17" },
      ],
      blessing: "NUM 6:24-26",
    },
  },
  {
    id: "baby-dedication",
    icon: "👶",
    about: "baby dedications",
    related: ["baptism","birthday"],
    name: { en: "Baby Dedication", hi: "शिशु समर्पण", te: "శిశు సమర్పణ" },
    greet: { en: "Wishing God's blessings on your little one!", hi: "आपके नन्हे-मुन्ने पर परमेश्वर की आशीष बनी रहे!", te: "మీ చిన్నారికి దేవుని ఆశీర్వాదాలు!" },
    style: "garden",
    tags: ["baby", "child", "dedication", "newborn", "naming", "parents", "children"],
    verses: [
      "1SA 1:27-28", "PSA 127:3", "PSA 139:13-14", "MRK 10:14", "PRO 22:6", "JER 1:5", "LUK 2:52", "DEU 6:6-7",
      "ISA 54:13", "NUM 6:24-26", "1SA 2:26", "MAT 19:14", "MRK 10:16", "LUK 1:66", "LUK 18:16", "PSA 127:4",
      "PSA 22:10", "PSA 71:6", "ISA 44:3", "ISA 49:15-16", "EPH 6:4", "2TI 3:15", "PSA 78:4", "JAS 1:17",
      "3JN 1:4",
    ],
    kit: {
      prayer:
        "Father, we thank You for this precious child, a gift and a heritage from You. Like Hannah, these parents bring their little one back to You today. Give them wisdom to raise this child in Your ways, and may this little one grow in wisdom and stature, and in favour with God and man. In Jesus' name, Amen.",
      points: [
        { title: "Children are a gift", text: "Every child is a heritage from the Lord, entrusted to parents for a season.", ref: "PSA 127:3" },
        { title: "Given back to God", text: "Hannah prayed for Samuel and then gave him back to the Lord — that is what dedication means.", ref: "1SA 1:27-28" },
        { title: "Teach them the way", text: "Faith is passed on at home — when we sit, walk, lie down and rise up.", ref: "DEU 6:6-7" },
      ],
      blessing: "NUM 6:24-26",
    },
  },
  {
    id: "funeral-and-comfort",
    icon: "🕯️",
    about: "funerals and times of grief",
    related: ["healing-and-sickness","farewell-and-travel","good-friday-and-easter"],
    name: { en: "Funeral & Comfort", hi: "अंतिम संस्कार व सांत्वना", te: "అంత్యక్రియలు & ఓదార్పు" },
    greet: { en: "Sorry to hear of your loss. Praying for you.", hi: "आपके दुःख में हम आपके साथ हैं। आपके लिए प्रार्थना करते हैं।", te: "మీ దుఃఖంలో మేము మీతో ఉన్నాము. మీ కోసం ప్రార్థిస్తున్నాము." },
    style: "serene",
    tags: ["funeral", "death", "grief", "comfort", "condolence", "memorial", "loss", "heaven", "hope"],
    verses: [
      "JHN 11:25-26", "JHN 14:1-3", "PSA 23:1-4", "REV 21:4", "1TH 4:13-14", "MAT 5:4", "PSA 34:18", "ROM 8:38-39",
      "2CO 5:1", "2TI 4:7-8", "PSA 116:15", "ISA 41:10", "PSA 23:5-6", "2CO 1:3-4", "PSA 147:3", "ISA 25:8",
      "1CO 15:54-55", "REV 14:13", "PHP 1:21", "2CO 5:8", "JHN 16:22", "MAT 11:28", "PSA 73:26",
      "ISA 43:2", "ROM 14:8", "ECC 3:1-2", "PSA 30:5", "1PE 5:7", "NAM 1:7",
    ],
    kit: {
      prayer:
        "God of all comfort, we come to You with heavy hearts. We thank You for the life of our loved one and for every memory we hold. Draw near to this family in their sorrow. Remind us that in Christ death is not the end, and that we do not grieve as those who have no hope. Hold us until the day You wipe away every tear. In Jesus' name, Amen.",
      points: [
        { title: "Jesus is the resurrection", text: "Death does not have the last word for those who believe in Him.", ref: "JHN 11:25-26" },
        { title: "We grieve — but with hope", text: "Tears are not a lack of faith; but our sorrow is held by a sure hope.", ref: "1TH 4:13-14" },
        { title: "A place prepared", text: "Jesus has gone ahead to prepare a home for His people.", ref: "JHN 14:1-3" },
      ],
      blessing: "ROM 8:38-39",
    },
  },
  {
    id: "housewarming",
    icon: "🏠",
    about: "housewarmings and new homes",
    related: ["wedding","new-job-and-business","thanksgiving-and-harvest"],
    name: { en: "Housewarming", hi: "गृह प्रवेश", te: "గృహ ప్రవేశం" },
    greet: { en: "Wishing God's blessings on your new home!", hi: "नए घर की हार्दिक शुभकामनाएँ!", te: "గృహ ప్రవేశ శుభాకాంక్షలు!" },
    style: "dawn",
    tags: ["housewarming", "new home", "house", "family", "dedication of home"],
    verses: [
      "JOS 24:15", "PSA 127:1", "PRO 24:3-4", "ISA 32:18", "LUK 10:5", "PSA 121:8", "2SA 7:29", "NUM 6:24-26",
      "DEU 6:9", "PSA 91:1-2", "PSA 91:10", "MAT 7:24-25", "PSA 16:6", "ACT 16:31",
      "PHP 4:7", "PSA 4:8", "PSA 23:6", "ROM 12:13", "HEB 13:2", "1PE 4:9", "DEU 28:6", "PSA 122:7",
    ],
    kit: {
      prayer:
        "Lord, we dedicate this home to You. Let it be a place of peace, prayer and welcome. Bless every room with Your presence, every meal with gratitude and every conversation with kindness. Guard those who live here in their going out and coming in, from this time forth and for evermore. In Jesus' name, Amen.",
      points: [
        { title: "The Lord builds the house", text: "Walls and a roof make a house; God's presence makes a home.", ref: "PSA 127:1" },
        { title: "As for me and my house", text: "The most important decision for a home is whom it will serve.", ref: "JOS 24:15" },
        { title: "Filled with precious things", text: "Wisdom and understanding fill a home with treasures money cannot buy.", ref: "PRO 24:3-4" },
      ],
      blessing: "2SA 7:29",
    },
  },
  {
    id: "exams-and-graduation",
    icon: "🎓",
    about: "exams and graduations",
    related: ["new-job-and-business","farewell-and-travel","new-year"],
    name: { en: "Exams & Graduation", hi: "परीक्षा व दीक्षांत", te: "పరీక్షలు & పట్టభద్రత" },
    greet: { en: "Wishing you every success!", hi: "आपकी सफलता के लिए शुभकामनाएँ!", te: "మీ విజయానికి శుభాకాంక్షలు!" },
    style: "dawn",
    tags: ["exam", "exams", "graduation", "student", "school", "college", "study", "wisdom", "results"],
    verses: [
      "PRO 1:7", "JAS 1:5", "PHP 4:13", "PRO 16:3", "COL 3:23", "PSA 32:8", "JER 29:11", "ISA 40:31", "2TI 2:15",
      "DAN 1:17", "PRO 2:6", "PRO 3:13", "PRO 4:7", "PRO 9:10", "PSA 119:105", "PSA 119:99", "PRO 18:15",
      "2TI 1:7", "ISA 41:13", "JOS 1:9", "PHP 4:6-7", "1CO 10:31", "PRO 16:9", "ECC 9:10", "GAL 6:9", "PRO 22:29",
    ],
    kit: {
      prayer:
        "Father, thank You for the gift of learning. We lift up these students to You. Give them clear minds, good memory, diligence in preparation and peace in their hearts. Whatever the results, remind them that their worth is found in You and that You hold their future. In Jesus' name, Amen.",
      points: [
        { title: "True wisdom begins with God", text: "Knowledge is valuable, but the fear of the Lord is where wisdom starts.", ref: "PRO 1:7" },
        { title: "Ask for wisdom", text: "God gives generously to all who ask — including before an exam.", ref: "JAS 1:5" },
        { title: "Work as unto the Lord", text: "Study hard, not to impress people, but to honour God with our best.", ref: "COL 3:23" },
      ],
      blessing: "PSA 32:8",
    },
  },
  {
    id: "new-job-and-business",
    icon: "💼",
    about: "a new job or business",
    related: ["housewarming","exams-and-graduation","thanksgiving-and-harvest"],
    name: { en: "New Job & Business", hi: "नई नौकरी व व्यवसाय", te: "కొత్త ఉద్యోగం & వ్యాపారం" },
    greet: { en: "Wishing you God's blessing in your new work!", hi: "आपके नए काम के लिए शुभकामनाएँ!", te: "మీ కొత్త పనికి దేవుని ఆశీర్వాదాలు!" },
    style: "dawn",
    tags: ["job", "work", "business", "shop", "career", "opening", "promotion", "provision"],
    verses: [
      "PRO 16:3", "DEU 8:18", "COL 3:23-24", "PSA 90:17", "PSA 1:3", "MAT 6:33", "PRO 3:9-10", "JOS 1:9",
      "PHP 4:19", "PRO 10:4", "PRO 10:22", "PRO 22:29", "ECC 9:10", "DEU 28:8",
      "DEU 28:12", "GEN 39:2-3", "NEH 2:20", "PSA 37:5", "2CO 9:8", "1TH 4:11-12", "PRO 21:5",
      "JAS 1:17", "ISA 48:17", "3JN 1:2",
    ],
    kit: {
      prayer:
        "Lord, we thank You for this new opportunity. Establish the work of these hands. Give wisdom in every decision, integrity in every transaction and favour with everyone they serve. Let this work provide for their family and be a blessing to many, and may they always seek Your kingdom first. In Jesus' name, Amen.",
      points: [
        { title: "Commit your work to the Lord", text: "Plans succeed when they are placed in God's hands first.", ref: "PRO 16:3" },
        { title: "He gives the power to prosper", text: "Every ability and opportunity is from God — success is a reason for gratitude.", ref: "DEU 8:18" },
        { title: "Seek first the kingdom", text: "When God is first, He takes care of what we need.", ref: "MAT 6:33" },
      ],
      blessing: "PSA 90:17",
    },
  },
  {
    id: "farewell-and-travel",
    icon: "✈️",
    about: "farewells and journeys",
    related: ["new-job-and-business","exams-and-graduation","funeral-and-comfort"],
    name: { en: "Farewell & Travel", hi: "विदाई व यात्रा", te: "వీడ్కోలు & ప్రయాణం" },
    greet: { en: "Wishing you a safe and blessed journey!", hi: "आपकी यात्रा मंगलमय हो!", te: "మీ ప్రయాణం క్షేమంగా సాగాలి!" },
    style: "dawn",
    tags: ["farewell", "goodbye", "travel", "journey", "abroad", "moving", "send-off", "retirement"],
    verses: [
      "NUM 6:24-26", "PSA 121:7-8", "GEN 28:15", "JOS 1:9", "DEU 31:8", "ISA 43:2", "PHP 1:3-6", "ACT 20:32",
      "2CO 13:11", "3JN 1:2", "PSA 121:1-2", "PSA 121:5-6", "PSA 139:9-10", "EXO 33:14", "ISA 41:10", "PRO 3:6",
      "ISA 58:11", "JER 29:11", "MAT 28:20", "ROM 15:13", "EPH 3:20-21", "1TH 3:12", "HEB 13:5", "PSA 91:11",
      "GEN 31:49", "RUT 2:12", "2TH 3:16",
    ],
    kit: {
      prayer:
        "Father, as we say goodbye, we thank You for the time we have shared and for all that You have done through this life among us. Go before them on the journey. Keep them safe, provide for every need, and give them a church family wherever they go. Until we meet again, keep them in the palm of Your hand. In Jesus' name, Amen.",
      points: [
        { title: "God goes ahead", text: "Wherever they go, the Lord is already there.", ref: "DEU 31:8" },
        { title: "Kept in every going out", text: "The Lord watches over our travel and our return.", ref: "PSA 121:7-8" },
        { title: "Thankful for every memory", text: "Paul thanked God every time he remembered his friends — and so do we.", ref: "PHP 1:3-6" },
      ],
      blessing: "NUM 6:24-26",
    },
  },
  {
    id: "healing-and-sickness",
    icon: "🙏",
    about: "healing and times of sickness",
    related: ["funeral-and-comfort","thanksgiving-and-harvest"],
    name: { en: "Healing & Sickness", hi: "चंगाई", te: "స్వస్థత" },
    greet: { en: "Sorry to hear you are unwell. Praying for your healing.", hi: "आपकी बीमारी की खबर से दुःख हुआ। आपकी चंगाई के लिए प्रार्थना करते हैं।", te: "మీ అనారోగ్యం గురించి విని బాధపడ్డాము. మీ స్వస్థత కోసం ప్రార్థిస్తున్నాము." },
    style: "serene",
    tags: ["healing", "sick", "sickness", "hospital", "illness", "recovery", "surgery", "health"],
    verses: [
      "JAS 5:14-15", "JER 17:14", "ISA 53:5", "PSA 103:2-3", "EXO 15:26", "PSA 41:3", "JER 30:17", "MAT 11:28",
      "2CO 12:9", "3JN 1:2", "PSA 147:3", "PSA 30:2", "PSA 107:19-20", "ISA 41:10", "ISA 40:29", "MAL 4:2",
      "MAT 8:17", "MRK 5:34", "1PE 2:24", "PRO 17:22", "PRO 4:20-22", "ISA 58:8", "PHP 4:6-7",
      "ROM 8:28", "PSA 73:26", "2KI 20:5",
    ],
    kit: {
      prayer:
        "Lord Jesus, You are the Great Physician. We bring our brother or sister before You in their sickness. Touch their body with Your healing power, guide the hands of the doctors and nurses, and give strength and peace to the family. Let Your grace be sufficient in every hour. In Your mighty name we pray, Amen.",
      points: [
        { title: "The Lord who heals", text: "Healing is part of who God has revealed Himself to be.", ref: "EXO 15:26" },
        { title: "Pray for one another", text: "The prayer of faith, offered by the church, is powerful.", ref: "JAS 5:14-15" },
        { title: "Grace in weakness", text: "When healing is slow, His grace is still enough.", ref: "2CO 12:9" },
      ],
      blessing: "3JN 1:2",
    },
  },
  {
    id: "ordination-and-ministry",
    icon: "📖",
    about: "ordinations and ministry commissioning",
    related: ["baptism","farewell-and-travel"],
    name: { en: "Ordination & Ministry", hi: "सेवकाई अभिषेक", te: "సేవా అభిషేకం" },
    greet: { en: "Wishing God's blessings on your ministry!", hi: "आपकी सेवकाई पर परमेश्वर की आशीष हो!", te: "మీ సేవకు దేవుని ఆశీర్వాదాలు!" },
    style: "royal",
    tags: ["ordination", "ministry", "pastor", "elder", "deacon", "commissioning", "calling", "mission"],
    verses: [
      "ISA 6:8", "JER 1:7-8", "2TI 4:2", "1TI 4:12", "ACT 20:28", "1PE 5:2-4", "EPH 4:11-12", "ISA 61:1",
      "2TI 2:15", "MAT 28:19-20", "JER 3:15", "2TI 4:5", "1TI 4:16", "1TI 3:1", "2CO 4:1", "2CO 4:5", "2CO 5:20",
      "ROM 10:15", "ISA 52:7", "MAT 9:37-38", "JHN 21:17", "ACT 1:8", "1CO 4:2", "1CO 15:58", "COL 4:17",
      "2TI 1:6", "TIT 2:7", "GAL 6:9",
    ],
    kit: {
      prayer:
        "Lord of the harvest, we thank You for calling Your servant into ministry. Anoint them with Your Holy Spirit. Give them a shepherd's heart, a faithful tongue and a humble spirit. Protect their family, strengthen them in weariness and let many come to know You through their service. In Jesus' name, Amen.",
      points: [
        { title: "Here am I, send me", text: "Ministry begins with a willing heart answering God's call.", ref: "ISA 6:8" },
        { title: "Shepherd the flock", text: "Leadership in the church is care, not control.", ref: "1PE 5:2-4" },
        { title: "Preach the word", text: "In season and out of season, the task is to be faithful to the Word.", ref: "2TI 4:2" },
      ],
      blessing: "NUM 6:24-26",
    },
  },
  {
    id: "thanksgiving-and-harvest",
    icon: "🌾",
    about: "thanksgiving and harvest festivals",
    related: ["new-year","christmas","housewarming"],
    name: { en: "Thanksgiving & Harvest", hi: "धन्यवाद व फसल पर्व", te: "కృతజ్ఞతార్పణ & పంట పండుగ" },
    greet: { en: "Wishing you a joyful thanksgiving!", hi: "धन्यवाद पर्व की हार्दिक शुभकामनाएँ!", te: "కృతజ్ఞతార్పణ శుభాకాంక్షలు!" },
    style: "dawn",
    tags: ["thanksgiving", "harvest", "gratitude", "praise", "thanks", "festival"],
    verses: [
      "PSA 100:4-5", "1TH 5:16-18", "PSA 107:1", "PSA 103:1-2", "PSA 136:1", "JAS 1:17", "COL 3:17", "PSA 65:11",
      "2CO 9:15", "PHP 4:6", "PSA 100:1-3", "PSA 95:2", "PSA 92:1", "PSA 118:1", "PSA 118:24", "PSA 67:6",
      "PSA 65:9", "DEU 16:15", "GEN 8:22", "1CH 16:34", "EPH 5:20", "COL 2:6-7", "HEB 13:15",
      "PSA 126:3", "JOL 2:26", "MAL 3:10",
    ],
    kit: {
      prayer:
        "Gracious Father, every good and perfect gift comes from You. We thank You for Your provision, protection and presence through this season. You have crowned the year with Your goodness. Give us grateful hearts that praise You in all circumstances, and generous hands that share what You have given. In Jesus' name, Amen.",
      points: [
        { title: "Enter with thanksgiving", text: "Gratitude is the doorway into God's presence.", ref: "PSA 100:4-5" },
        { title: "Every good gift is from above", text: "Harvests, jobs, health and family — all come from the Father.", ref: "JAS 1:17" },
        { title: "Thankful in everything", text: "Not only for everything, but in everything, we give thanks.", ref: "1TH 5:16-18" },
      ],
      blessing: "2CO 9:15",
    },
  },
  {
    id: "christmas",
    icon: "⭐",
    about: "Christmas",
    related: ["new-year","good-friday-and-easter","thanksgiving-and-harvest"],
    name: { en: "Christmas", hi: "क्रिसमस", te: "క్రిస్మస్" },
    greet: { en: "Wishing you a blessed Christmas!", hi: "क्रिसमस की हार्दिक शुभकामनाएँ!", te: "క్రిస్మస్ శుభాకాంక్షలు!" },
    style: "night",
    tags: ["christmas", "birth of jesus", "nativity", "advent", "saviour", "emmanuel"],
    verses: [
      "ISA 9:6", "LUK 2:10-11", "MAT 1:23", "JHN 1:14", "LUK 2:14", "MIC 5:2", "ISA 7:14", "GAL 4:4-5", "JHN 3:16",
      "1JN 4:9", "LUK 1:30-31", "LUK 1:46-47", "LUK 2:7", "LUK 2:8", "LUK 2:16", "LUK 2:20", "MAT 1:21",
      "MAT 2:1-2", "MAT 2:10-11", "JHN 1:4-5", "JHN 1:9", "ISA 9:2", "ISA 9:7", "2CO 9:15", "TIT 2:11", "1TI 1:15",
      "PHP 2:7",
    ],
    kit: {
      prayer:
        "Father, we thank You for the greatest gift ever given — Your Son, born in Bethlehem. Emmanuel, God with us. As we celebrate His birth, let the joy of the angels fill our hearts and the peace of Christ rule in our homes. Help us share this good news with everyone around us. In Jesus' name, Amen.",
      points: [
        { title: "Good news of great joy", text: "Christmas is news — a Saviour has been born, for all people.", ref: "LUK 2:10-11" },
        { title: "God with us", text: "Emmanuel means God did not stay far away; He came near.", ref: "MAT 1:23" },
        { title: "His names tell His story", text: "Wonderful Counsellor, Mighty God, Everlasting Father, Prince of Peace.", ref: "ISA 9:6" },
      ],
      blessing: "LUK 2:14",
    },
  },
  {
    id: "good-friday-and-easter",
    icon: "✝️",
    about: "Good Friday and Easter",
    related: ["christmas","baptism","funeral-and-comfort"],
    name: { en: "Good Friday & Easter", hi: "गुड फ्राइडे व ईस्टर", te: "గుడ్ ఫ్రైడే & ఈస్టర్" },
    greet: { en: "Wishing you a blessed Easter! He is risen!", hi: "ईस्टर की हार्दिक शुभकामनाएँ! वह जी उठा है!", te: "ఈస్టర్ శుభాకాంక్షలు! ఆయన లేచాడు!" },
    style: "night",
    tags: ["easter", "good friday", "cross", "resurrection", "passion", "risen", "salvation"],
    verses: [
      "ISA 53:5", "ROM 5:8", "JHN 19:30", "1PE 2:24", "MAT 28:5-6", "LUK 24:6", "1CO 15:3-4", "1CO 15:55-57",
      "ROM 6:9", "JHN 11:25", "ISA 53:3-4", "ISA 53:6", "JHN 3:16", "JHN 10:11", "JHN 15:13", "LUK 23:34",
      "LUK 23:46", "MRK 16:6", "MAT 28:7", "1CO 15:20", "1PE 1:3", "ROM 10:9", "ROM 8:11", "PHP 3:10", "REV 1:18",
      "GAL 2:20", "HEB 12:2", "COL 2:14", "2CO 5:21",
    ],
    kit: {
      prayer:
        "Lord Jesus, we stand in awe at the cross where You bore our sins, and we rejoice at the empty tomb where You conquered death. Thank You for loving us while we were still sinners. Let the power of Your resurrection be alive in us today, and help us live as people who know that You are risen. Amen.",
      points: [
        { title: "Love on the cross", text: "God proved His love while we were still sinners.", ref: "ROM 5:8" },
        { title: "It is finished", text: "The work of salvation is complete — nothing left to add.", ref: "JHN 19:30" },
        { title: "He is not here, He is risen", text: "The empty tomb changes everything about death and hope.", ref: "MAT 28:5-6" },
      ],
      blessing: "1CO 15:55-57",
    },
  },
  {
    id: "new-year",
    icon: "🎆",
    about: "the New Year",
    related: ["thanksgiving-and-harvest","birthday","christmas"],
    name: { en: "New Year", hi: "नया साल", te: "నూతన సంవత్సరం" },
    greet: { en: "Wishing you a blessed New Year!", hi: "नए साल की हार्दिक शुभकामनाएँ!", te: "నూతన సంవత్సర శుభాకాంక్షలు!" },
    style: "night",
    tags: ["new year", "beginning", "fresh start", "watch night", "resolution", "future"],
    verses: [
      "LAM 3:22-23", "ISA 43:18-19", "PHP 3:13-14", "DEU 11:12", "PRO 16:9", "PSA 65:11", "JER 29:11", "2CO 5:17",
      "REV 21:5", "PSA 90:12", "PSA 118:24", "ISA 40:31", "PRO 3:5-6", "NUM 6:24-26", "JOS 1:9", "JOS 3:5",
      "EXO 33:14", "PSA 37:5", "PSA 32:8", "ISA 58:11", "MAT 6:34", "PHP 1:6", "HEB 13:8", "ECC 3:1", "ROM 15:13",
      "EPH 4:23-24", "PSA 23:6", "ISA 41:10", "1SA 7:12",
    ],
    kit: {
      prayer:
        "Eternal God, You were faithful to us all through the year that has passed, and You hold the year ahead in Your hands. Forgive what was wrong, heal what was broken and help us forget what lies behind. Direct our steps, crown this year with Your goodness and let us walk every day with You. In Jesus' name, Amen.",
      points: [
        { title: "A new thing", text: "God is not finished — He is doing something new.", ref: "ISA 43:18-19" },
        { title: "His eyes are on the whole year", text: "From the first day to the last, the Lord watches over it.", ref: "DEU 11:12" },
        { title: "Press on", text: "Forget what is behind and press toward the goal.", ref: "PHP 3:13-14" },
      ],
      blessing: "NUM 6:24-26",
    },
  },
];

// The site's motto: "a word spoken in due season, how good is it!"
export const MOTTO = "PRO 15:23";

// Every reference used anywhere above (verses, talking points, blessings).
export function allRefs() {
  const set = new Set([MOTTO]);
  for (const o of OCCASIONS) {
    o.verses.forEach((r) => set.add(r));
    o.kit.points.forEach((p) => set.add(p.ref));
    set.add(o.kit.blessing);
  }
  return [...set];
}

// Slugs used before clean URLs (old "#/o/<id>" links still redirect).
export const LEGACY_IDS = {"anniversary":"wedding-anniversary","dedication":"baby-dedication","funeral":"funeral-and-comfort","students":"exams-and-graduation","work":"new-job-and-business","farewell":"farewell-and-travel","healing":"healing-and-sickness","ministry":"ordination-and-ministry","thanksgiving":"thanksgiving-and-harvest","easter":"good-friday-and-easter","newyear":"new-year"};

export const occasionById = (id) => OCCASIONS.find((o) => o.id === id);
