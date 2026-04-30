import { Award, Heart, Users } from "lucide-react";

export const safeSplit = (val: any, char: string = ' '): string[] => {
  if (typeof val !== 'string') return [];
  return val.split(char);
};

export const FALLBACK_IMAGES: any = {
  hero: "/hero.png",
  about: "/images/early-3.jpeg",
  kit: "/images/kit.jpg",
  founder1: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop",
  founder2: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop",
  why: "/images/why-teamind.png",
  videoThumbnail: "/images/why-teamind.png",
  
  // Early Childhood
  earlyHero: "/images/for_early_childhood.png",
  earlyKit: "/images/kit.jpg",
  earlyGallery1: "/images/early-1.jpeg",
  earlyGallery2: "/images/early-2.png",
  earlyGallery3: "/images/early-3.jpeg",
  earlyGallery4: "/images/early-4.jpeg",
  earlyGallery5: "/images/early-5.jpeg",
  earlyGallery6: "/images/early-6.png",
  earlyGallery7: "/images/early-7.png",
  
  // Elementary
  elementaryHero: "/images/for_elemntry.png",
  elementaryKit: "/images/kit.jpg",
  elementaryGallery1: "/images/Elementary-1.jpeg",
  elementaryGallery2: "/images/Elementary-2.jpeg",
  elementaryGallery3: "/images/Elementary-3.jpeg",
  elementaryGallery4: "/images/Elementary-4.jpeg",
  elementaryGallery5: "/images/Elementary-5.jpeg",
  elementaryGallery6: "/images/Elementary-6.jpeg",
  elementaryGallery7: "/images/Elementary-7.jpeg",
  
  // Parents
  parentsHero: "/images/for_parents.png",
  parentsKit: "/images/kit.jpg",
  parentsGallery1: "/images/early-1.jpeg",
  parentsGallery2: "/images/Elementary-2.jpeg",
  parentsGallery3: "/images/early-4.jpeg",
  parentsGallery4: "/images/Elementary-5.jpeg",
  parentsGallery5: "/images/early-7.png"
};

export const DEFAULT_CONFIG: any = {
  contactEmail: 'support@teamindprogram.com', // Primary fallback
  notificationAdmins: ['budmantzvi@gmail.com'], // Hardcoded safety defaults
  allAdmins: ['budmantzvi@gmail.com'],
  contactPhone: '972504170209',
  tagline: 'Thinking, Emotions, Attention & Motivation IN Development',
  footerText: 'Empowering children through executive function development.',
  navBtnText: 'Get Started',
  heroBadge: 'The Future of Cognitive Learning',
  heroTitle: 'The Future of Child Development.',
  heroSubtitle: 'A revolutionary character-based program designed to strengthen executive functions through music, play, and emotional connection.',
  heroBtnPrimary: 'Explore Programs',
  heroBtnSecondary: 'Watch Video',
  videoBadge: 'Play Presentation',
  videoTitle: 'Meet the Characters.',
  videoSubtitle: 'Discover how our characters help children master their cognitive skills through play and music.',
  aboutTitle: 'About the Program.',
  aboutText: 'TEAMIND is much more than just a pedagogical tool; it is a holistic approach to child development founded on the principle that Executive Functions (EF) are the "CEO of the brain." These functions—focus, memory, organization, and regulation—are the bedrock of academic performance and social-emotional success. We have developed a 6-month revolutionary cycle that bridges complex neuro-developmental research with practical, daily engagement that children actually look forward to.',
  aboutSubtext: 'Our method identifies 5 core executive functions and brings them to life through relatable characters like Driver Dan, Lenny the Ladder, and Molly the Mirror. By integrating audio stories, rhythmic songs, and physical activity guides, we transform abstract cognitive concepts into concrete behaviors. This multi-sensory approach ensures that even the most complex skills are internalized through repetition, emotional connection, and play. Whether in a classroom or at home, TEAMIND empowers educators and parents to build the cognitive infrastructure children need to master their own attention, behavior, and emotions.',
  aboutFootnote: '',
  successStoriesTitle: 'Success Stories.',
  successStoriesSubtitle: 'Real impact, real results.',
  foundersTitle: 'Meet the Founders.',
  foundersSubtitle: 'Combining clinical expertise with musical innovation to create a revolutionary learning experience.',
  contactTitle: "Let's Talk.",
  contactSubtitle: "Have questions about our programs? We'd love to hear from you.",
  whyTitle: "Why is TEAMIND Important?",
  whySubtitle: "Executive functions are the 'CEO of the brain.' They are the skills that allow us to focus, plan, remember instructions, and juggle multiple tasks successfully.",
  whyCards: [
    { title: "Academic Success", desc: "Strong executive skills are better predictors of academic success than IQ.", icon: "Award", link: "/elementary" },
    { title: "Emotional Regulation", desc: "Helping children manage their feelings and react constructively to challenges.", icon: "Heart", link: "/early-childhood" },
    { title: "Social Competence", desc: "Building the foundations for empathy, cooperation, and healthy relationships.", icon: "Users", link: "/parents" },
  ],
  faqTitle: "Frequently Asked Questions.",
  faqs: [
    { 
      question: "What is the core philosophy of TEAMIND?", 
      answer: "TEAMIND is built on the belief that executive functions—the 'CEO of the brain'—are the most critical skills for success in learning and life. We use character-based learning to make these abstract cognitive processes concrete and accessible for children." 
    },
    { 
      question: "Which age groups is the program suitable for?", 
      answer: "We have three distinct programs: Early Childhood (Ages 3–6), Elementary (Ages 6–12), and a Parents Program for home use. Each is tailored to the developmental needs of the specific age group." 
    },
    { 
      question: "How long does it take to see results?", 
      answer: "While every child is different, many educators and parents report seeing positive changes in language and behavior within the first few weeks of consistent use. The skills build over time through repetition and practice." 
    },
    { 
      question: "Is the program based on scientific research?", 
      answer: "Yes. TEAMIND is grounded in neuro-developmental research and cognitive psychology, specifically focusing on the development of executive functions in early and middle childhood." 
    },
    { 
      question: "What's included in the physical kit?", 
      answer: "Each kit is comprehensive and includes handbooks, activity guides, posters, storybooks, original games, and a USB with audio tracks (songs, jingles, and stories). The specific contents vary by program." 
    },
  ],
  programsTitle: "Our Programs.",
  programsSubtitle: "Tailored solutions for every stage of development and every learning environment.",
  charactersTitle: "Meet the Team.",
  charactersSubtitle: "The 5 core executive functions brought to life through friendly characters, led by Brainman.",
  charactersList: [
    { name: "Brainman", role: "The Leader", desc: "Responsible for the human brain that controls all body functions, leading his wonderful team with wisdom.", image: "/images/brainman.png" },
    { name: "Driver Dan", role: "Focus & Shifting", desc: "Focuses and shifts attention, efficiently guiding calm and smooth transitions between activities.", image: "/images/driver dan.png" },
    { name: "Lenny the Ladder", role: "Organization", desc: "A master of order and planning. Helps even the messiest learners approach and complete tasks efficiently.", image: "/images/lenny the ladder.png" },
    { name: "Memory Max", role: "Working Memory", desc: "He captures learning moments, helping remember daily and multi-step tasks through visual memory techniques.", image: "/images/memory max.png" },
    { name: "Molly the Mirror", role: "Emotional Reflection", desc: "Gentle and sensitive, she reflects internal and others' feelings to help build healthy relationships.", image: "/images/molly the mirror.png" },
    { name: "Stopper Stan", role: "Response Inhibition", desc: "A balanced leader who controls reactions, helping to pause and reduce impulsive behaviors.", image: "/images/stopper stan.png" },
  ],
  kitPrice: 2300,
  emailNotifications: 'both',
  orderNotifications: 'both',
  orderNotificationAdmins: ['budmantzvi@gmail.com'], // Hardcoded safety defaults
  showHero: true,
  showVideo: true,
  showAbout: true,
  showWhy: true,
  showPrograms: true,
  showCharacters: true,
  showSuccessStories: true,
  showFounders: true,
  showFaq: true,
  showContact: true,
  testimonials: [
    { name: "Sarah J.", role: "Preschool Teacher", text: "TEAMIND has completely changed the digital and emotional landscape of my classroom. The kids are obsessed with Driver Dan and Brainman!", image: "https://i.pravatar.cc/150?u=sarah" },
    { name: "David L.", role: "Elementary Principal", text: "Finally, a program that bridges the gap between cognitive theory and actual classroom practice. We've seen a 40% reduction in disciplinary issues.", image: "https://i.pravatar.cc/150?u=david" },
    { name: "Emily R.", role: "Parent", text: "Molly the Mirror has become my daughter's best friend. She even uses reflection techniques to calm herself down during tantrums!", image: "https://i.pravatar.cc/150?u=emily" },
    { name: "Yael Stein", role: "Special Education Expert", text: "The character-based approach makes abstract skills like 'organization' and 'inhibition' so clear to children. It's brilliant.", image: "https://i.pravatar.cc/150?u=yael" },
    { name: "Marc K.", role: "Father of two", text: "The kit is high-quality and the songs are genuinely catchy. It's rare to find an educational tool that's this engaging for the parents too.", image: "https://i.pravatar.cc/150?u=marc" },
    { name: "Maya B.", role: "Mother", text: "Before TEAMIND, my son struggled with transitions. Now, just mentioning 'Driver Dan' helps him prepare for the next activity with a smile.", image: "https://i.pravatar.cc/150?u=mayab" },
    { name: "Noam G.", role: "Educational Counselor", text: "A must-have for every school. It gives children the language they need to describe their internal cognitive state.", image: "https://i.pravatar.cc/150?u=noam" },
  ],
  foundersMembers: [
    {
      name: "Dr. Jennifer Budman",
      role: "Professional Lead & Founder",
      desc: "A senior Occupational Therapist and lecturer at the Hebrew University. With over 18 years of clinical experience, Dr. Budman specializes in child development and executive functions. She has published multiple research papers on cognitive development and serves as a lead consultant for educational ministries. Her vision is to make neuro-developmental tools accessible to every child.",
      stats: ["PhD OT", "18+ Years Exp.", "Hebrew University Faculty"],
      image: "founder1"
    },
    {
      name: "Sarah Elharar",
      role: "Musical & Production Lead",
      desc: "An innovative musician, entrepreneur, and developer of pedagogical products. Sarah discovered that music is the ultimate key to encoding cognitive behaviors in children's memory. Over the last decade, she has produced award-winning learning materials that combine storytelling with rhythmic and musical patterns, helping children 'sing' their way to better executive function.",
      stats: ["10+ Years Exp.", "Musical Innovation", "Product Designer"],
      image: "founder2"
    }
  ],
  earlyChildhood: {
    title: 'Early Childhood Program',
    subtitle: 'Designed for preschools and kindergartens, this program supports the foundations of executive function during the most critical developmental years.',
    cardDescription: 'Ages 3–6. Our journey begins with the building blocks of cognition. Through "Driver Dan" and "Stopper Stan," young children learn to manage impulses and switch focus in a supportive, play-based environment that mirrors their natural world.',
    description: 'TEAMIND is implemented through short, developmentally appropriate activities that use audio stories, songs, movement, play, and friendly characters.',
    detailsTitle: 'How It Works in the Classroom',
    kitTitle: 'The Early Childhood Kit.',
    kitSubtitle: 'Everything you need to implement TEAMIND in your kindergarten or preschool.',
    investTitle: 'Invest in their Future.',
    investSubtitle: 'The Early Childhood Kit is a complete pedagogical system for ages 3-6. Get everything you need to start today (including shipping).',
  },
  elementary: {
    title: 'Elementary Program',
    subtitle: 'Ages 6–12. Structured classroom learning to support primary school success. This program focuses on building cognitive flexibility, self-regulation, and advanced problem-solving skills.',
    cardDescription: 'Ages 6–12. As academic demands grow, so does the need for organization. Using "Lenny the Ladder" and "Memory Max," students master multi-step tasks and refine their planning skills, turning classroom challenges into successes.',
    description: 'Building cognitive flexibility and self-regulation in the classroom.',
    detailsTitle: 'Structured Classroom Learning',
    kitTitle: 'The Elementary Kit.',
    kitSubtitle: 'Professional tools for primary school educators and specialists.',
    investTitle: 'Empower Your Classroom.',
    investSubtitle: 'The Elementary Kit provides professional tools for ages 6-12. Complete pedagogical system (including shipping).',
  },
  parents: {
    title: 'Parents Program',
    subtitle: "A Family Experience. Brain-boosting play and tools for home use.",
    cardDescription: 'Family Edition. Executive functions are common sense, but they aren\'t always "common practice." This program gives parents the language and tools to foster reflection through "Molly the Mirror," turning daily routines into moments of growth.',
    description: 'Bringing the TEAMIND philosophy into the home environment.',
    detailsTitle: 'Nurturing Brain Functions at Home',
    kitTitle: 'The Family Kit.',
    kitSubtitle: 'Fun, engaging tools for brain-boosting play at home.',
    investTitle: 'Nurture their Growth.',
    investSubtitle: 'The Family Kit brings brain-boosting play into your home. Complete pedagogical system (including shipping).',
  },
  // Hebrew Translations
  tagline_he: 'חשיבה, רגש, קשב ומוטיבציה בהתפתחות',
  footerText_he: 'מעצימים ילדים באמצעות פיתוח תפקודים ניהוליים.',
  navBtnText_he: 'בואו נתחיל',
  heroBadge_he: 'העתיד של למידה קוגניטיבית',
  heroTitle_he: 'העתיד של התפתחות הילד.',
  heroSubtitle_he: 'תוכנית מבוססת דמויות מהפכנית שנועדה לחזק תפקודים ניהוליים באמצעות מוזיקה, משחק וחיבור רגשי.',
  heroBtnPrimary_he: 'גלה את התוכניות',
  heroBtnSecondary_he: 'צפה בסרטון',
  aboutTitle_he: 'על התוכנית שלנו.',
  aboutText_he: 'TEAMIND היא הרבה יותר מכלי פדגוגי; זוהי גישה הוליסטית להתפתחות הילד המבוססת על העיקרון שתפקודים ניהוליים (EF) הם "המנכ״ל של המוח". תפקודים אלו—מיקוד, זיכרון, ארגון וויסות—הם הבסיס להישגים אקדמיים ולהצלחה חברתית-רגשית. פיתחנו מחזור מהפכני של 6 חודשים המגשר בין מחקר נוירו-התפתחותי מורכב למעורבות יומיומית מעשית שילדים באמת מחכים לה.',
  aboutSubtext_he: 'השיטה שלנו מזהה 5 תפקודים ניהוליים מרכזיים ומפיחה בהם חיים באמצעות דמויות מעוררות הזדהות כמו מיסטר הגה, סולמי וליבי המראה. על ידי שילוב של סיפורי שמע, שירים קצביים ומדריכי פעילות גופנית, אנו הופכים מושגים קוגניטיביים מופשטים להתנהגויות קונקרטיות.',
  whyTitle_he: 'למה TEAMIND חשובה?',
  whySubtitle_he: 'תפקודים ניהוליים הם ה"מנכ״ל של המוח". אלו המיומנויות המאפשרות לנו להתמקד, לתכנן, לזכור הוראות ולבצע מספר משימות בהצלחה.',
  programsTitle_he: 'התוכניות שלנו.',
  programsSubtitle_he: 'פתרונות מותאמים לכל שלב התפתחות וכל סביבת למידה.',
  charactersTitle_he: 'הכירו את הצוות.',
  charactersSubtitle_he: '5 תפקודי הליבה הניהוליים שקורמים עור וגידים באמצעות דמויות ידידותיות, בהובלת אדון מוחון.',
  faqTitle_he: 'שאלות נפוצות.',
  contactTitle_he: 'בואו נדבר.',
  contactSubtitle_he: 'יש לכם שאלות על התוכניות שלנו? נשמח לשמוע מכם.',
  successStoriesTitle_he: 'סיפורי הצלחה.',
  successStoriesSubtitle_he: 'השפעה אמיתית, תוצאות אמיתיות.',
  foundersTitle_he: 'הכירו את המייסדות.',
  foundersSubtitle_he: 'שילוב של מומחיות קלינית עם חדשנות מוזיקלית ליצירת חווית למידה מהפכנית.',
  videoBadge_he: 'צפו בצוות המוח בפעולה',
  videoTitle_he: 'למידה רגשית-חברתית. מבוססת דמויות.',
  videoSubtitle_he: 'גלו כיצד TEAMIND הופכת מושגי מיומנויות ניהוליות מופשטים לכלים מוחשיים ובלתי נשכחים עבור ילדים.',
  charactersList_he: [
    { name: "אדון מוחון", role: "המנהיג", desc: "אחראי על המוח האנושי השולט בכל תפקודי הגוף, מוביל את הצוות הנפלא שלו בחוכמה.", image: "/images/brainman.png" },
    { name: "מיסטר הגה", role: "מיקוד והסטה", desc: "מתמקד ומסיט קשב, מכוון ביעילות למעברים רגועים וחלקים בין פעילויות.", image: "/images/driver dan.png" },
    { name: "סולמי", role: "ארגון", desc: "מאסטר של סדר ותכנון. עוזר גם ללומדים המבולבלים ביותר לגשת למשימות ולהשלים אותן ביעילות.", image: "/images/lenny the ladder.png" },
    { name: "מוני מצלמוני", role: "זיכרון עבודה", desc: "הוא מצלם וקולט רגעי למידה, עוזר לזכור משימות יומיות ומשימות מרובות שלבים באמצעות טכניקות זיכרון חזותיות.", image: "/images/memory max.png" },
    { name: "ליבי המראה", role: "שיקוף רגשי", desc: "עדינה ורגישה, היא משקפת וקולטת רגשות פנימיים ושל אחרים כדי לעזור בבניית מערכות יחסים בריאות.", image: "/images/molly the mirror.png" },
    { name: "תום התמרור", role: "עיכוב תגובה", desc: "מנהיג מאוזן השולט בתגובות, עוזר לעצור ולהפחית התנהגויות אימפולסיביות (Stopper Stan).", image: "/images/stopper stan.png" },
  ],
  whyCards_he: [
    { title: "הצלחה אקדמית", desc: "מיומנויות ניהוליות חזקות הן מנבאות טובות יותר להצלחה אקדמית מאשר IQ.", icon: "Award", link: "/elementary" },
    { title: "וויסות רגשי", desc: "עזרה לילדים לנהל את רגשותיהם ולהגיב בצורה בונה לאתגרים.", icon: "Heart", link: "/early-childhood" },
    { title: "כשירות חברתית", desc: "בניית היסודות לאמפתיה, שיתוף פעולה ומערכות יחסים בריאות.", icon: "Users", link: "/parents" },
  ],
  faqs_he: [
    { 
      question: "מהי הפילוסופיה המרכזית של TEAMIND?", 
      answer: "TEAMIND מבוססת על האמונה שתפקודים ניהוליים—'המנכ\"ל של המוח'—הם הכישורים הקריטיים ביותר להצלחה בלימודים ובחיים. אנו משתמשים בלמידה מבוססת דמויות כדי להפוך את התהליכים הקוגניטיביים המופשטים הללו לקונקרטיים ונגישים לילדים." 
    },
    { 
      question: "לאילו קבוצות גיל התוכנית מתאימה?", 
      answer: "יש לנו שלוש תוכניות נפרדות: גיל הרך (גילאי 3-6), בית ספר יסודי (גילאי 6-12), ותוכנית הורים לשימוש ביתי. כל אחת מותאמת לצרכים ההתפתחותיים של קבוצת הגיל הספציפית." 
    },
    { 
      question: "תוך כמה זמן ניתן לראות תוצאות?", 
      answer: "בעוד שכל ילד הוא שונה, אנשי חינוך והורים רבים מדווחים על שינויים חיוביים בשפה ובהתנהגות כבר בשבועות הראשונים של שימוש עקבי. המיומנויות נבנות לאורך זמן באמצעות חזרה ותרגול." 
    },
    { 
      question: "האם התוכנית מבוססת על מחקר מדעי?", 
      answer: "כן. TEAMIND מבוססת על מחקר נוירו-התפתחותי ופסיכולוגיה קוגניטיבית, תוך התמקדות ספציפית בפיתוח תפקודים ניהוליים בילדות המוקדמת והתיכונה." 
    },
    { 
      question: "מה כוללת הערכה הפיזית?", 
      answer: "כל ערכה היא מקיפה וכוללת מדריכים, חוברות פעילות, פוסטרים, ספרי סיפורים, משחקים מקוריים ו-USB עם רצועות שמע (שירים, ג'ינגלים וסיפורים). התוכן הספציפי משתנה לפי התוכנית." 
    },
  ],
  testimonials_he: [
    { name: "שרה ג'.", role: "גננת", text: "TEAMIND שינתה לחלוטין את הנוף הדיגיטלי והרגשי של הכיתה שלי. הילדים אובססיביים למיסטר הגה ואדון מוחון!", image: "https://i.pravatar.cc/150?u=sarah" },
    { name: "דוד ל.", role: "מנהל בית ספר יסודי", text: "סוף סוף, תוכנית שמגשרת על הפער בין תיאוריה קוגניטיבית לפרקטיקה בכיתה. ראינו ירידה של 40% בבעיות משמעת.", image: "https://i.pravatar.cc/150?u=david" },
    { name: "אמילי ר.", role: "אמא", text: "ליבי המראה הפכה לחברה הכי טובה של הבת שלי. היא אפילו משתמשת בטכניקות שיקוף כדי להרגיע את עצמה בזמן התקפי זעם!", image: "https://i.pravatar.cc/150?u=emily" },
    { name: "יעל שטיין", role: "מומחית לחינוך מיוחד", text: "הגישה המבוססת על דמויות הופכת מיומנויות מופשטות כמו 'ארגון' ועכוב תגובה' לכל כך ברורות לילדים. זה גאוני.", image: "https://i.pravatar.cc/150?u=yael" },
    { name: "מארק ק.", role: "אבא לשניים", text: "הערכה איכותית והשירים באמת מדבקים. נדיר למצוא כלי חינוכי שכל כך מרתק גם עבור ההורים.", image: "https://i.pravatar.cc/150?u=marc" },
    { name: "מיה ב.", role: "אמא", text: "לפני TEAMIND, הבן שלי התקשה במעברים. עכשיו, רק הזכרת 'מיסטר הגה' עוזרת לו להתכונן לפעילות הבאה עם חיוך.", image: "https://i.pravatar.cc/150?u=mayab" },
    { name: "נועם ג.", role: "יועץ חינוכי", text: "חובה לכל בית ספר. זה נותן לילדים את השפה שהם צריכים כדי לתאר את המצב הקוגניטיבי הפנימי שלהם.", image: "https://i.pravatar.cc/150?u=noam" },
  ],
  privacyPolicyHtml: `
    <h2>Introduction</h2>
    <p>Welcome to TEAMIND. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website and use our services.</p>
    
    <h2>Information We Collect</h2>
    <p>We value your privacy and aim to collect only the minimum amount of information necessary to provide our services. We collect:</p>
    <ul>
      <li><strong>Full Name:</strong> Your name and email address when you choose to submit them via our contact form or during the checkout process.</li>
      <li><strong>Shipping Address:</strong> Your physical address for the delivery of pedagogical kits.</li>
      <li><strong>Payment Info:</strong> All payments are processed through Meshulam. We do not store your credit card details on our servers.</li>
    </ul>

    <h2>How We Use Your Information</h2>
    <p>We use the information we collect to:</p>
    <ul>
      <li>Process your orders and deliver your kits.</li>
      <li>Respond to your inquiries and provide customer support.</li>
      <li>Send you important updates regarding your purchase.</li>
    </ul>

    <h2>Security of Your Information</h2>
    <p>We implement appropriate technical and organizational security measures to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.</p>

    <h2>Third-Party Services</h2>
    <p>We use Meshulam for payment processing and automation. We also use Firebase for data storage. We do not sell or share your personal information with any other third parties for marketing purposes.</p>

    <h2>Contact Us</h2>
    <p>If you have questions or comments about this policy, you may email us at support@teamindprogram.com.</p>
  `,
  privacyPolicyHtml_he: `
    <h2>מבוא</h2>
    <p>ברוכים הבאים ל-TEAMIND. אנו מחויבים להגן על המידע האישי שלך ועל זכותך לפרטיות. מדיניות פרטיות זו מסבירה כיצד אנו אוספים, משתמשים ומגינים על המידע שלך כאשר אתה מבקר באתר האינטרנט שלנו ומשתמש בשירותים שלנו.</p>
    
    <h2>מידע שאנו אוספים</h2>
    <p>אנו מעריכים את פרטיותך ושואפים לאסוף רק את כמות המידע המינימלית הדרושה לאספקת השירותים שלנו. אנו אוספים:</p>
    <ul>
      <li><strong>שם מלא:</strong> שמך וכתובת האימייל שלך כאשר אתה בוחר לשלוח אותם דרך טופס יצירת הקשר שלנו או במהלך תהליך התשלום.</li>
      <li><strong>כתובת למשלוח:</strong> הכתובת הפיזית שלך לאספקת הערכות הפדגוגיות.</li>
      <li><strong>פרטי תשלום:</strong> כל התשלומים מעובדים באמצעות "משולם". איננו שומרים את פרטי כרטיס האשראי שלך בשרתים שלנו.</li>
    </ul>

    <h2>כיצד אנו משתמשים במידע שלך</h2>
    <p>אנו משתמשים במידע שאנו אוספים כדי:</p>
    <ul>
      <li>לעבד את ההזמנות שלך ולספק את הערכות שלך.</li>
      <li>להגיב לפניותיך ולתת תמיכת לקוחות.</li>
      <li>לשלוח לך עדכונים חשובים בנוגע לרכישתך.</li>
    </ul>

    <h2>אבטחת המידע שלך</h2>
    <p>אנו מיישמים אמצעי אבטחה טכניים וארגוניים מתאימים כדי להגן על אבטחת כל מידע אישי שאנו מעבדים. עם זאת, אנא זכור גם כי איננו יכולים להבטיח שהאינטרנט עצמו מאובטח ב-100%.</p>

    <h2>שירותי צד שלישי</h2>
    <p>אנו משתמשים ב"משולם" לצורך עיבוד תשלומים ואוטומציה. אנו משתמשים גם ב-Firebase לאחסון נתונים. איננו מוכרים או משתפים את המידע האישי שלך עם צדדים שלישיים אחרים למטרות שיווק.</p>

    <h2>צרו קשר</h2>
    <p>אם יש לך שאלות או הערות לגבי מדיניות זו, תוכל לשלוח לנו דוא"ל לכתובת support@teamindprogram.com.</p>
  `,
  termsOfServiceHtml: `
    <h2>Agreement to Terms</h2>
    <p>By accessing or using the TEAMIND website and services, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services.</p>

    <h2>Use of Services</h2>
    <p>You agree to use our services only for lawful purposes and in accordance with these Terms. You are responsible for ensuring that all persons who access the services through your internet connection are aware of these Terms and comply with them.</p>

    <h2>Intellectual Property</h2>
    <p>The TEAMIND program, including its characters (Brainman, Molly the Mirror, etc.), stories, songs, and educational materials, are the intellectual property of TEAMIND. You may not reproduce, distribute, or create derivative works from our materials without explicit written permission.</p>

    <h2>Purchase and Payment</h2>
    <p>All purchases are processed through Meshulam. By providing your payment information, you represent and warrant that you have the legal right to use the payment method. We reserve the right to refuse or cancel any order for any reason.</p>

    <h2>Limitation of Liability</h2>
    <p>In no event shall TEAMIND be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your use of our services or products.</p>

    <h2>Governing Law</h2>
    <p>These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which TEAMIND operates, without regard to its conflict of law provisions.</p>

    <h2>Changes to Terms</h2>
    <p>We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page. Your continued use of the services after such changes constitutes your acceptance of the new Terms.</p>
  `,
  termsOfServiceHtml_he: `
    <h2>הסכמה לתנאים</h2>
    <p>על ידי גישה או שימוש באתר ובשירותים של TEAMIND, אתה מסכים להיות כפוף לתנאי שימוש אלה. אם אינך מסכים לכל התנאים הללו, אל תשתמש בשירותים שלנו.</p>

    <h2>השימוש בשירותים</h2>
    <p>אתה מסכים להשתמש בשירותים שלנו רק למטרות חוקיות ובהתאם לתנאים אלו. אתה אחראי לוודא שכל האנשים הניגשים לשירותים דרך חיבור האינטרנט שלך מודעים לתנאים אלה ומצייתים להם.</p>

    <h2>קניין רוחני</h2>
    <p>תוכנית TEAMIND, כולל הדמויות שלה (אדון מוחון, ליבי המראה וכו'), סיפורים, שירים וחומרים חינוכיים, הם הקניין הרוחני של TEAMIND. אין לשכפל, להפיץ או ליצור יצירות נגזרות מהחומרים שלנו ללא רשות מפורשת בכתב.</p>

    <h2>רכישה ותשלום</h2>
    <p>כל הרכישות מעובדות באמצעות "משולם". על ידי מסירת פרטי התשלום שלך, אתה מצהיר ומתחייב כי יש לך את הזכות המשפטית להשתמש באמצעי התשלום. אנו שומרים לעצמנו את הזכות לסרב או לבטל כל הזמנה מכל סיבה שהיא.</p>

    <h2>הגבלת אחריות</h2>
    <p>בשום מקרה TEAMIND לא תהיה אחראית לכל נזק עקיף, מקרי, מיוחד, תוצאתי או עונשי הנובע משימושך בשירותים או במוצרים שלנו או בקשר אליו.</p>

    <h2>החוק החל</h2>
    <p>תנאים אלו יהיו כפופים לחוקי המדינה בה פועלת TEAMIND ויפורשו בהתאם להם, ללא התחשבות בהוראות ניגוד חוקים.</p>

    <h2>שינויים בתנאים</h2>
    <p>אנו שומרים לעצמנו את הזכות לשנות תנאים אלה בכל עת. אנו נודיע לך על כל שינוי על ידי פרסום התנאים החדשים בדף זה. המשך השימוש שלך בשירותים לאחר שינויים כאלה מהווה את הסכמתך לתנאים החדשים.</p>
  `,
  foundersMembers_he: [
    {
      name: "ד\"ר ג'ניפר בדמן",
      role: "מובילה מקצועית ומייסדת",
      desc: "מרפאה בעיסוק בכירה ומרצה באוניברסיטה העברית. עם מעל 18 שנות ניסיון קליני, ד\"ר בדמן מתמחה בהתפתחות הילד ותפקודים ניהוליים. היא פרסמה מאמרים מחקריים רבים בתחום ההתפתחות הקוגניטיבית ומשמשת כיועצת בכירה למשרדי חינוך. החזון שלה הוא להנגיש כלים נוירו-התפתחותיים לכל ילד.",
      stats: ["דוקטורט OT", "18+ שנות ניסיון", "סגל האוניברסיטה העברית"],
      image: "founder1"
    },
    {
      name: "שרה אלחרר",
      role: "מובילה מוזיקלית והפקה",
      desc: "מוזיקאית חדשנית, יזמית ומפתחת מוצרים פדגוגיים. שרה גילתה שהמוזיקה היא המפתח האולטימטיבי לקידוד התנהגויות קוגניטיביות בזיכרון של ילדים. בעשור האחרון היא הפיקה חומרי למידה זוכי פרסים המשלבים סיפורים עם דפוסים קצביים ומוזיקליים, ועוזרים לילדים 'לשיר' את דרכם לתפקוד ניהולי טוב יותר.",
      stats: ["10+ שנות ניסיון", "חדשנות מוזיקלית", "מעצבת מוצרים"],
      image: "founder2"
    }
  ],
  earlyChildhood_he: {
    title: 'תוכנית הגיל הרך',
    subtitle: 'מיועדת לגני ילדים ומעונות, תוכנית זו תומכת ביסודות התפקוד הניהולי בשנים ההתפתחותיות הקריטיות ביותר.',
    cardDescription: 'גילאי 3-6. המסע שלנו מתחיל באבני הבניין של הקוגניציה. באמצעות "מיסטר הגה" ו"תום התמרור", ילדים צעירים לומדים לנהל דחפים ולהחליף מיקוד בסביבה תומכת מבוססת משחק המשקפת את עולמם הטבעי.',
    description: 'TEAMIND מיושמת באמצעות פעילויות קצרות המותאמות להתפתחות, המשלבות סיפורי שמע, שירים, תנועה, משחק ודמויות ידידותיות.',
    detailsTitle: 'איך זה עובד בכיתה',
    kitTitle: 'ערכת הגיל הרך.',
    kitSubtitle: 'כל מה שצריך כדי ליישם את TEAMIND בגן הילדים שלך.',
    investTitle: 'השקיעו בעתידם.',
    investSubtitle: 'ערכת הגיל הרך היא מערכת פדגוגית שלמה לגילאי 3-6. קבלו את כל מה שאתם צריכים כדי להתחיל היום (כולל משלוח).',
  },
  elementary_he: {
    title: 'תוכנית בית ספר יסודי',
    subtitle: 'גילאי 6-12. למידה כיתתית מובנית לתמיכה בהצלחה בבית הספר היסודי. תוכנית זו מתמקדת בבניית גמישות קוגניטיבית, וויסות עצמי ומיומנויות מתקדמות לפתרון בעיות.',
    cardDescription: 'גילאי 6-12. ככל שהדרישות האקדמיות גדלות, כך גדל הצורך בארגון. באמצעות "סולמי" ו"מוני מצלמוני", התלמידים שולטים במשימות מרובות שלבים ומשכללים את כישורי התכנון שלהם, והופכים אתגרי כיתה להצלחות.',
    description: 'בניית גמישות קוגניטיבית וויסות עצמי בכיתה.',
    detailsTitle: 'למידה כיתתית מובנית',
    kitTitle: 'ערכת בית הספר היסודי.',
    kitSubtitle: 'כלים מקצועיים לאנשי חינוך ומומחים בבית הספר היסודי.',
    investTitle: 'העצימו את הכיתה שלכם.',
    investSubtitle: 'ערכת בית הספר היסודי מספקת כלים מקצועיים לגילאי 6-12. מערכת פדגוגית מלאה (כולל משלוח).',
  },
  parents_he: {
    title: 'תוכנית הורים',
    subtitle: "חוויה משפחתית. משחק מחזק מוח וכלים לשימוש ביתי.",
    cardDescription: 'מהדורת משפחה. תפקודים ניהוליים הם הגיון בריא, אבל הם לא תמיד "פרקטיקה נפוצה". תוכנית זו נותנת להורים את השפה והכלים לטפח השתקפות באמצעות "ליבי המראה", ולהפוך שגרה יומיומית לרגעים של צמיחה.',
    description: 'הבאת פילוסופיית TEAMIND לסביבה הביתית.',
    detailsTitle: 'טיפוח תפקודי מוח בבית',
    kitTitle: 'הערכה המשפחתית.',
    kitSubtitle: 'כלים מהנים ומעסיקים למשחק מחזק מוח בבית.',
    investTitle: 'טפחו את הצמיחה שלהם.',
    investSubtitle: 'הערכה המשפחתית מביאה משחק מחזק מוח לביתכם. מערכת פדגוגית מלאה (כולל משלוח).',
  },
};

export function getSynchronizedCharacters(baseCharacters: any[], translatedList: any[], fallbackList: any[]) {
  return baseCharacters.map((char, i) => {
    // Priority 1: Use the item from translatedList if it exists at this index and has a name
    const translated = translatedList?.[i];
    if (translated && translated.name) {
      return { ...char, ...translated };
    }
    // Priority 2: Use the item from fallbackList (the DEFAULT_CONFIG one)
    const fallback = fallbackList?.[i];
    if (fallback && fallback.name) {
      return { ...char, ...fallback };
    }
    // Priority 3: Just return the base English character
    return char;
  });
}

export const deepMergeValue = (defaultValue: any, dbValue: any): any => {
  // If dbValue is explicitly null or undefined, use default
  if (dbValue === undefined || dbValue === null) return defaultValue;
  
  // If dbValue is a string, we trust it (even if empty, as the user might want to clear it)
  // HOWEVER, for some critical layout strings, we might still want a fallback if empty.
  // But generally, if it's in the DB, it's a user choice.
  if (typeof dbValue === 'string') {
    return dbValue;
  }
  
  if (Array.isArray(dbValue)) {
    // For arrays, if the DB is empty (length 0) and we have a default and it's NOT an array that's supposed to be empty
    // we use the default. But if the user cleared it, they might want empty.
    // Let's stick to: if it's empty and we have defaults, use defaults for critical lists
    if (dbValue.length === 0 && Array.isArray(defaultValue) && defaultValue.length > 0) {
      return defaultValue;
    }
    return dbValue;
  }
  
  if (typeof dbValue === 'object' && !Array.isArray(dbValue)) {
    if (!defaultValue || typeof defaultValue !== 'object') return dbValue;
    const result = { ...defaultValue };
    for (const key in dbValue) {
      result[key] = deepMergeValue(defaultValue[key], dbValue[key]);
    }
    return result;
  }
  
  return dbValue;
};

export const deepMergeConfig = (defaults: any, database: any) => {
  return deepMergeValue(defaults, database);
};

export const migrateConfig = (config: any) => {
  const migrated = { ...config };
  
  // We want to upgrade placeholders/old text to our new professional content.
  const isOldContent = (val: string, oldVal: string, minLength: number = 130) => {
    if (!val) return true;
    if (val.trim() === '') return true;
    if (val.trim() === oldVal.trim()) return true;
    if (val.length < minLength) return true;
    return false;
  };

  const oldDescriptions = [
    'Ages 3–6. Helping little ones develop focus, inhibition, and emotional regulation through character-led play.',
    'Ages 6–12. Building cognitive flexibility, self-regulation, and planning skills for academic and social success.',
    'Family Edition. Practical tools for parents to nurture executive functions through play and daily routines.'
  ];

  // 1. Program cards migration
  if (isOldContent(migrated.earlyChildhood?.cardDescription, oldDescriptions[0])) {
    if (!migrated.earlyChildhood) migrated.earlyChildhood = {};
    migrated.earlyChildhood.cardDescription = DEFAULT_CONFIG.earlyChildhood.cardDescription;
  }
  if (isOldContent(migrated.elementary?.cardDescription, oldDescriptions[1])) {
    if (!migrated.elementary) migrated.elementary = {};
    migrated.elementary.cardDescription = DEFAULT_CONFIG.elementary.cardDescription;
  }
  if (isOldContent(migrated.parents?.cardDescription, oldDescriptions[2])) {
    if (!migrated.parents) migrated.parents = {};
    migrated.parents.cardDescription = DEFAULT_CONFIG.parents.cardDescription;
  }

  // 2. About section migration (if user has short old text, replace with our new expanded content)
  const oldAboutText = 'TEAMIND is a 6-month revolutionary educational program designed to nurture the development of executive functions in children. We believe that cognitive skills are not fixed, but can be developed and refined through intentional interaction and play. Our mission is to bridge the gap between neuro-developmental research and actual classroom and home practice.';
  if (isOldContent(migrated.aboutText, oldAboutText, 350)) {
    migrated.aboutText = DEFAULT_CONFIG.aboutText;
  }
  
  const oldAboutSubtext = 'Our method focuses on 5 core executive functions, brought to life through characters that children can relate to and learn from. By combining music, storytelling, and professional tools, we turn abstract brain functions into a concrete, daily practice that empowers children to master their own cognitive processes and emotional regulation. Repetition is key to encoding these behaviors, which is why our program is built for long-term integration.';
  if (isOldContent(migrated.aboutSubtext, oldAboutSubtext, 350)) {
    migrated.aboutSubtext = DEFAULT_CONFIG.aboutSubtext;
  }

  // 3. Spelling fixes
  const fixSpelling = (text: string) => {
    if (!text) return text;
    return text.replace(/Stoper Stan/gi, 'Stopper Stan')
               .replace(/stoper stan/gi, 'Stopper Stan');
  };

  if (Array.isArray(migrated.charactersList)) {
    migrated.charactersList = migrated.charactersList.map((c: any) => ({
      ...c,
      name: fixSpelling(c.name)
    }));
  }
  if (Array.isArray(migrated.charactersList_he)) {
    migrated.charactersList_he = migrated.charactersList_he.map((c: any) => ({
      ...c,
      desc: fixSpelling(c.desc)
    }));
  }

  return migrated;
};
