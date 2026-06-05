// SokoRada Mock Data Configuration
// Contains initial state for users, SACCOs, loan types, training modules, and audit/fairness metrics

const MOCK_SACCOS = [
  { id: "ujima", name: "Ujima SACCO", description: "Focused on smallholder farmers and community chama groups." },
  { id: "kwft", name: "Kenya Women Microfinance Bank (KWFT)", description: "Specialized in women entrepreneurs, market vendors, and agricultural input loans." },
  { id: "stima", name: "Stima SACCO", description: "Broad-based SACCO with flexible asset financing options." },
  { id: "harambee", name: "Harambee SACCO", description: "One of the oldest SACCOs, offering crop and personal loan options." },
  { id: "mwalimu", name: "Mwalimu National SACCO", description: "Educational and personal development financial products." },
  { id: "unaitas", name: "Unaitas", description: "Agri-business and micro-business credit facilities." },
  { id: "imarika", name: "Imarika SACCO", description: "Coast-based but expanding; supports local trade and fishing/farming." },
  { id: "waumini", name: "Waumini SACCO", description: "Values-based lending for community and farming groups." },
  { id: "other", name: "Other / Not sure yet", description: "Select this if you want general guidance before committing to a SACCO." }
];

const MOCK_LOAN_TYPES = [
  { id: "farm_input", name_en: "Farm Input Loan", name_sw: "Mkopo wa Pembejeo za Kilimo" },
  { id: "business_stock", name_en: "Business Stock Loan", name_sw: "Mkopo wa Bidhaa za Biashara" },
  { id: "school_fees", name_en: "School Fees Loan", name_sw: "Mkopo wa Ada za Shule" },
  { id: "emergency", name_en: "Emergency Loan", name_sw: "Mkopo wa Dharura" },
  { id: "asset_equipment", name_en: "Asset/Equipment Loan", name_sw: "Mkopo wa Vifaa au Mashine" },
  { id: "working_capital", name_en: "Working Capital Loan", name_sw: "Mkopo wa Mtaji wa Kufanyia Kazi" },
  { id: "livestock_support", name_en: "Dairy or Livestock Support Loan", name_sw: "Mkopo wa Mifugo au Maziwa" },
  { id: "aggregation_transport", name_en: "Produce Aggregation/Transport Loan", name_sw: "Mkopo wa Kusafirisha au Kukusanya Mazao" },
  { id: "group_chama", name_en: "Group/Chama Loan", name_sw: "Mkopo wa Kikundi au Chama" },
  { id: "personal_dev", name_en: "Personal Development Loan", name_sw: "Mkopo wa Maendeleo Binafsi" }
];

const MOCK_PROFILES = [
  {
    id: "grace",
    name: "Grace",
    phone: "0712345678",
    occupation: "farmer",
    location: "Kakamega",
    requestedAmount: 28000,
    loanType: "school_fees",
    incomeSource: "Maize Farming",
    incomeCycle: "seasonal",
    repaymentTiming: "seasonal",
    existingSavings: 4500,
    saccoId: "ujima",
    readinessAnswers: {
      confidence: "medium", // how confident are you in planning loan repayments?
      purpose: "yes", // clear plan on how to use loan
      easiest_months: "march_august", // easiest months for repayments
      records: "no", // keep sales records?
      pressure: "manageable", // how manageable do money responsibilities feel?
      training_need: "budgeting" // training choice
    },
    trainingCompleted: ["harvest_cycle", "school_fees_prep"],
    supportRequested: true,
    supportCategory: "repayment_schedule",
    supportDetails: "I need school fees now, but my maize sells in August. I need to pay when my crop is ready."
  },
  {
    id: "amina",
    name: "Amina",
    phone: "0723456789",
    occupation: "vendor",
    location: "Busia",
    requestedAmount: 15000,
    loanType: "business_stock",
    incomeSource: "Market Produce Vendor",
    incomeCycle: "daily",
    repaymentTiming: "weekly",
    existingSavings: 2000,
    saccoId: "kwft",
    readinessAnswers: {
      confidence: "high",
      purpose: "yes",
      easiest_months: "any",
      records: "yes",
      pressure: "manageable",
      training_need: "record_keeping"
    },
    trainingCompleted: ["record_keeping"],
    supportRequested: false,
    supportCategory: "",
    supportDetails: ""
  },
  {
    id: "peter",
    name: "Peter",
    phone: "0734567890",
    occupation: "farmer",
    location: "Meru",
    requestedAmount: 40000,
    loanType: "asset_equipment",
    incomeSource: "Dairy Farming",
    incomeCycle: "monthly",
    repaymentTiming: "monthly",
    existingSavings: 8000,
    saccoId: "stima",
    readinessAnswers: {
      confidence: "low",
      purpose: "yes",
      easiest_months: "any",
      records: "no",
      pressure: "heavy",
      training_need: "loan_terms"
    },
    trainingCompleted: [],
    supportRequested: true,
    supportCategory: "low_readiness",
    supportDetails: "I need feed for my cows, but I have other small debts. I want to speak to someone to help me budget."
  },
  {
    id: "jane",
    name: "Jane",
    phone: "0745678901",
    occupation: "vendor",
    location: "Nyandarua",
    requestedAmount: 20000,
    loanType: "aggregation_transport",
    incomeSource: "Potato Trading",
    incomeCycle: "seasonal",
    repaymentTiming: "seasonal",
    existingSavings: 5000,
    saccoId: "unaitas",
    readinessAnswers: {
      confidence: "medium",
      purpose: "yes",
      easiest_months: "december_january",
      records: "yes",
      pressure: "manageable",
      training_need: "budgeting"
    },
    trainingCompleted: ["household_vs_business"],
    supportRequested: false,
    supportCategory: "",
    supportDetails: ""
  }
];

const MOCK_TRAINING_MODULES = [
  {
    id: "budgeting",
    title_en: "Money Intelligence & Budgeting",
    title_sw: "Usimamizi wa Fedha na Kupanga Bajeti",
    description_en: "Learn how to budget and predict cash inflows vs. expenses.",
    description_sw: "Jifunze jinsi ya kupanga bajeti na kutabiri mapato dhidi ya matumizi.",
    slides: [
      { en: "Budgeting helps you see where money goes. Separate what you spend on food and what you need for farm inputs.", sw: "Kupanga bajeti husaidia kuona wapi fedha huenda. Tenga zile za chakula na za pembejeo za kilimo." },
      { en: "Track every Shilling. Even small daily expenses like tea or mobile airtime add up over a month.", sw: "Fuatilia kila Shilingi. Hata matumizi madogo ya kila siku kama chai au vocha huongezeka kwa mwezi." },
      { en: "Before taking a loan, budget your repayments. Ensure you have cash left over for your family's basic needs.", sw: "Kabla ya kuchukua mkopo, panga bajeti ya malipo ya kila mwezi. Hakikisha kuna fedha zilizobaki kwa mahitaji ya familia." }
    ]
  },
  {
    id: "responsible_borrowing",
    title_en: "Responsible Borrowing",
    title_sw: "Kukopa kwa Wajibika",
    description_en: "Understand interest rates, processing fees, and borrow only what you can repay.",
    description_sw: "Elewa viwango vya riba, ada za usindikaji, na ukope kile tu unachoweza kulipa.",
    slides: [
      { en: "Only borrow what your business or farm cash flow can support. A loan should grow your income, not increase debt burden.", sw: "Kopa tu kile ambacho mtiririko wako wa fedha za biashara au shamba unaweza kulipia. Mkopo unapaswa kuongeza mapato." },
      { en: "Always ask about the total cost: interest rate, insurance, and processing fees. These make up the real loan cost.", sw: "Daima uliza gharama yote: kiwango cha riba, bima, na ada ya maombi. Hizi ndizo zinazounda gharama halisi ya mkopo." },
      { en: "Late payments lead to penalties and a bad credit record, which stops you from getting future loans.", sw: "Malipo ya kuchelewa huleta faini na rekodi mbaya ya mkopo, inayokuzuia kupata mikopo mingine baadaye." }
    ]
  },
  {
    id: "loan_use_planning",
    title_en: "Loan-Use Planning",
    title_sw: "Kupanga Matumizi ya Mkopo",
    description_en: "How to allocate loan capital directly to income-generating activities.",
    description_sw: "Jinsi ya kuelekeza mtaji wa mkopo moja kwa moja kwenye shughuli zinazoleta mapato.",
    slides: [
      { en: "Draw a strict boundary for the loan money. Use it only for the agreed purpose (e.g. buying seeds or business stock).", sw: "Weka mpaka mkali wa fedha za mkopo. Zitumie tu kwa madhumuni yaliyokubaliwa (k.m. kununua mbegu au bidhaa za biashara)." },
      { en: "Avoid spending loan money on family emergencies if possible. Instead, build a separate small emergency fund.", sw: "Epuka kutumia fedha za mkopo kwa dharura za kifamilia ikiwezekana. Badala yake, weka akiba ndogo ya dharura." },
      { en: "Write down the exact items you will buy with the loan and their cost before receiving the funds.", sw: "Andika vitu kamili utakavyonunua kwa mkopo huo na gharama zake kabla ya kupokea fedha." }
    ]
  },
  {
    id: "record_keeping",
    title_en: "Record Keeping for Informal Businesses",
    title_sw: "Kuweka Kumbukumbu za Biashara Zisizo Rasmi",
    description_en: "Simple daily cash registers and record-keeping habits for traders.",
    description_sw: "Daftari rahisi la kila siku la fedha na tabia za kuweka kumbukumbu kwa wafanyabiashara.",
    slides: [
      { en: "Use a simple notebook. Write down every sale (money in) and purchase (money out) immediately.", sw: "Tumia daftari rahisi. Andika kila mauzo (fedha zinazoingia) na manunuzi (fedha zinazotoka) mara moja." },
      { en: "Keep receipts for big purchases like fertilizer or bulk wholesale goods. Loan officers love seeing these records.", sw: "Weka stakabadhi za manunuzi makubwa kama mbolea au bidhaa za jumla. Maafisa mikopo hupenda kuona kumbukumbu hizi." },
      { en: "Calculate your profit weekly: Total Sales minus Total Expenses. This is your real income.", sw: "Hesabu faida yako kila wiki: Jumla ya Mauzo kutoa Jumla ya Matumizi. Hili ndilo pato lako halisi." }
    ]
  },
  {
    id: "harvest_cycle",
    title_en: "Harvest-Cycle Repayment Planning",
    title_sw: "Kupanga Malipo Kulingana na Msimu wa Mavuno",
    description_en: "Matching loan repayments to agricultural harvest seasons rather than monthly cycles.",
    description_sw: "Kulinganisha malipo ya mkopo na msimu wa mavuno ya kilimo badala ya mzunguko wa kila mwezi.",
    slides: [
      { en: "For crops like maize or potatoes, money comes 2-3 times a year. Ask your SACCO for a grace period during planting.", sw: "Kwa mazao kama mahindi au viazi, fedha huja mara 2-3 kwa mwaka. Uliza SACCO yako kuhusu muda wa neema wakati wa kupanda." },
      { en: "Negotiate structured repayments where you pay principal after harvest and only small interest in between.", sw: "Patana malipo yaliyoundwa ambapo unalipa deni kuu baada ya kuvuna na riba ndogo tu kabla ya hapo." },
      { en: "Store your crop safely if prices are low at harvest time. This helps you sell later at a better price to repay easily.", sw: "Hifadhi mazao yako kwa usalama kama bei ni ya chini wakati wa mavuno. Hii inasaidia kuuza baadaye kwa bei bora ili kulipa kirahisi." }
    ]
  },
  {
    id: "emergency_savings",
    title_en: "Emergency Savings",
    title_sw: "Akiba ya Dharura",
    description_en: "Building a buffer to shield your business and family from sudden shocks.",
    description_sw: "Kujenga akiba ili kulinda biashara na familia yako kutokana na majanga ya ghafla.",
    slides: [
      { en: "Even saving 50 Shillings a day helps. Keep it in a separate mobile wallet or SACCO account.", sw: "Hata kuweka Shilingi 50 kwa siku inasaidia. Hifadhi kwenye akaunti tofauti ya simu au ya SACCO." },
      { en: "An emergency fund protects you from selling your tools or farm animals when someone falls sick.", sw: "Mfuko wa dharura unakulinda dhidi ya kuuza vifaa vyako au mifugo wakati mtu anapougua." },
      { en: "Never mix emergency funds with active business stock money. They serve different purposes.", sw: "Usichanganye fedha za dharura na fedha za bidhaa za biashara. Zina malengo tofauti." }
    ]
  },
  {
    id: "school_fees_prep",
    title_en: "Preparing for School-Fee Months",
    title_sw: "Kujiandaa na Miezi ya Ada ya Shule",
    description_en: "Budgeting for peak expenses in January, May, and September.",
    description_sw: "Kupangia matumizi makubwa katika miezi ya Januari, Mei, na Septemba.",
    slides: [
      { en: "School terms start in Jan, May, and Sept. These are high-pressure months for cash flow. Plan months in advance.", sw: "Muhula wa shule huanza Jan, Mei, na Sept. Hii ni miezi ya shinikizo kubwa kwa fedha. Panga miezi mapema." },
      { en: "Save small amounts specifically for school fees during harvest or high-sales months.", sw: "Weka akiba ndogo maalum kwa ajili ya ada ya shule wakati wa mavuno au miezi ya mauzo ya juu." },
      { en: "Avoid borrowing high-interest emergency loans for school fees. A planned school fees loan has lower interest.", sw: "Epuka kukopa mikopo ya dharura yenye riba kubwa kwa ada ya shule. Mkopo wa ada uliopangwa una riba ya chini." }
    ]
  },
  {
    id: "household_vs_business",
    title_en: "Separating Household & Business Money",
    title_sw: "Kutenganisha Fedha za Nyumbani na za Biashara",
    description_en: "Why drawing a salary from your own trade keeps your business alive.",
    description_sw: "Kwa nini kujilipa mshahara kutoka kwa biashara yako huweka biashara hai.",
    slides: [
      { en: "Do not pay house rent directly from the shop register. Pay yourself a set wage or salary instead.", sw: "Usilipe kodi ya nyumba moja kwa moja kutoka kwa droo ya duka. Jilipe mshahara uliopangwa badala yake." },
      { en: "If family takes stock from the shop (e.g. food items), record it as an expense and pay the shop back.", sw: "Ikiwa familia inachukua bidhaa dukani (k.m. chakula), iandike kama matumizi na ulipe duka hilo." },
      { en: "Separate cash drawers or separate mobile money till numbers help keep business records clean.", sw: "Droo tofauti za fedha au nambari tofauti za malipo ya simu husaidia kuweka kumbukumbu za biashara safi." }
    ]
  },
  {
    id: "loan_terms",
    title_en: "Understanding SACCO Loan Terms",
    title_sw: "Kuelewa Masharti ya Mkopo wa SACCO",
    description_en: "Share capital, guarantors, and how membership benefits your borrowing.",
    description_sw: "Mtaji wa hisa, wadhamini, na jinsi uanachama unavyosaidia ukopaji wako.",
    slides: [
      { en: "SACCOs require you to buy shares and save regularly before borrowing. Savings multiply your borrowing capacity.", sw: "SACCO zinakuhitaji ununue hisa na uweke akiba mara kwa mara kabla ya kukopa. Akiba huongeza uwezo wako wa kukopa." },
      { en: "Many SACCO loans require guarantors. These are fellow members who agree to pay if you fail. Respect this trust.", sw: "Mikopo mingi ya SACCO inahitaji wadhamini. Hawa ni wanachama wenzako wanaokubali kulipa usipolipa. Heshimu uaminifu huu." },
      { en: "Read the loan agreement form carefully. Ask the loan officer to explain any terms you do not understand.", sw: "Soma fomu ya makubaliano ya mkopo kwa makini. Mwombe afisa wa mikopo aeleze masharti yoyote usiyoelewa." }
    ]
  },
  {
    id: "speak_to_officer",
    title_en: "How to Speak with a Loan Officer",
    title_sw: "Jinsi ya Kuongea na Afisa wa Mikopo",
    description_en: "Presenting your harvest calendar, sales log, and advocating for fair terms.",
    description_sw: "Kuwasilisha kalenda yako ya mavuno, kumbukumbu ya mauzo, na kupigania masharti ya haki.",
    slides: [
      { en: "Do not be intimidated. A loan officer is a partner. Be honest about your income cycles and family obligations.", sw: "Usiogope. Afisa wa mikopo ni mshirika. Kuwa mkweli kuhusu mzunguko wako wa mapato na majukumu ya familia." },
      { en: "Bring your record book. Showing any record, even a handwritten one, builds massive trust.", sw: "Leta kitabu chako cha kumbukumbu. Kuonyesha kumbukumbu yoyote, hata iliyoandikwa kwa mkono, hujenga uaminifu mkubwa." },
      { en: "Explain your repayment proposal clearly (e.g., 'I sell milk daily, so weekly repayment works best for me').", sw: "Eleza pendekezo lako la malipo waziwazi (k.m., 'Ninauza maziwa kila siku, hivyo malipo ya kila wiki yatanifaa zaidi')." }
    ]
  }
];

const INITIAL_AUDIT_LOGS = [
  { timestamp: "2026-06-05T08:30:00Z", event: "Platform Initialized", details: "SokoRada prototype mock backend running locally.", user: "System", type: "system" },
  { timestamp: "2026-06-05T09:12:00Z", event: "Consent Accepted", details: "User accepted privacy policy and readiness terms.", user: "Grace (0712345678)", type: "consent" },
  { timestamp: "2026-06-05T09:18:00Z", event: "Readiness Check Completed", details: "Calculated strengths and training needs. Occupation: farmer.", user: "Grace (0712345678)", type: "readiness" },
  { timestamp: "2026-06-05T09:25:00Z", event: "Training Module Finished", details: "Completed 'Harvest-Cycle Repayment Planning'.", user: "Grace (0712345678)", type: "training" },
  { timestamp: "2026-06-05T09:30:00Z", event: "Loan Support Request Saved", details: "Amount KES 28,000 for School Fees. Assigned to Ujima SACCO.", user: "Grace (0712345678)", type: "application" },
  { timestamp: "2026-06-05T09:32:00Z", event: "Officer Support Initiated", details: "Requested Callback: Help understanding repayment.", user: "Grace (0712345678)", type: "communication" },
  { timestamp: "2026-06-05T09:40:00Z", event: "Readiness Check Completed", details: "Calculated strengths and training needs. Occupation: vendor.", user: "Amina (0723456789)", type: "readiness" }
];

const INITIAL_BIAS_ALERTS = [
  { id: "b1", category: "Occupation Distribution", description: "Market vendors request human review at a 15% higher rate due to weekly cash volatility, which standard monthly scoring systems flags unnecessarily.", severity: "warning" },
  { id: "b2", category: "Language Safety", description: "Dignity filter checked. No derogatory terms like 'high-risk', 'unreliable', or 'insolvent' generated in the current local session.", severity: "info" }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MOCK_SACCOS, MOCK_LOAN_TYPES, MOCK_PROFILES, MOCK_TRAINING_MODULES, INITIAL_AUDIT_LOGS, INITIAL_BIAS_ALERTS };
}
