// SokoRada Core Application Script

class SokoRadaApp {
  constructor() {
    this.state = {
      lang: "en",
      activeUser: null,
      currentQuizIndex: 0,
      quizAnswers: {},
      uploadedFiles: [],
      speakToOfficerPref: false,
      activeTrainingModule: null,
      activeSlideIndex: 0,
      ussdState: "start",
      ussdData: {},
      auditLogs: [],
      biasAlerts: []
    };

    this.questions = [
      {
        id: "confidence",
        title_en: "How confident are you in planning your loan repayments?",
        title_sw: "Je, una ujasiri gani katika kupanga malipo ya mkopo wako?",
        options: [
          { value: "low", en: "Need Support - I find repayment planning stressful", sw: "Nahitaji Msaada - Napata shida kupanga malipo" },
          { value: "medium", en: "Moderate - I can plan with some advice", sw: "Kiasi - Ninaweza kupanga nikipata ushauri" },
          { value: "high", en: "Confident - I understand my cash cycles well", sw: "Niko Tayari - Naelewa mzunguko wangu wa fedha vizuri" }
        ]
      },
      {
        id: "purpose",
        title_en: "Do you have a clear plan for how you will use the loan?",
        title_sw: "Je, una mpango wazi wa jinsi utakavyotumia mkopo huo?",
        options: [
          { value: "yes", en: "Yes - I know the exact inputs or stock required", sw: "Ndio - Ninajua bidhaa au pembejeo halisi ninazohitaji" },
          { value: "no", en: "No - I need guidance on resource allocation", sw: "Hapana - Nahitaji mwongozo wa kupangia fedha" }
        ]
      },
      {
        id: "easiest_months",
        title_en: "Which months are usually easiest for you to make repayments?",
        title_sw: "Je, ni miezi gani ambayo kwa kawaida ni rahisi kwako kufanya malipo?",
        options: [
          { value: "any", en: "Every Month - Steady cash flow from daily trade", sw: "Kila Mwezi - Mapato thabiti ya biashara ya kila siku" },
          { value: "march_august", en: "Harvest Months - Crop yields come in specific cycles", sw: "Miezi ya Mavuno - Mazao huuzwa kwa misimu maalum" },
          { value: "dry_months", en: "Irregular - Cash is seasonal and hard to predict", sw: "Isiyotabirika - Mapato ni ya msimu na magumu kutabiri" }
        ]
      },
      {
        id: "records",
        title_en: "Do you currently keep records of sales, expenses, or harvests?",
        title_sw: "Je, kwa sasa unaweka kumbukumbu za mauzo, matumizi, au mavuno?",
        options: [
          { value: "yes", en: "Yes - Written notebook or mobile ledger book", sw: "Ndio - Kwenye daftari au programu ya simu" },
          { value: "no", en: "No - I manage my trade in cash memory", sw: "Hapana - Naendesha biashara kwa kumbukumbu ya kichwa" }
        ]
      },
      {
        id: "savings",
        title_en: "Do you have emergency savings or active chama contributions?",
        title_sw: "Je, una akiba ya dharura au hisa za chama zilizo hai?",
        options: [
          { value: "yes", en: "Yes - Separate mobile wallet or chama shares", sw: "Ndio - Akiba ya simu au hisa za kikundi cha chama" },
          { value: "no", en: "No - All money goes back into trade/farm inputs", sw: "Hapana - Fedha zote zinarudi kwenye biashara au pembejeo" }
        ]
      },
      {
        id: "pressure",
        title_en: "How manageable do your money responsibilities feel this month?",
        title_sw: "Je, majukumu yako ya kifedha yanajisikia rahisi kusimamia mwezi huu?",
        options: [
          { value: "manageable", en: "Manageable - I can cover business and home needs", sw: "Inadhibitika - Naweza kulipia mahitaji ya nyumbani na biashara" },
          { value: "heavy", en: "Heavy - Family obligations (fees, medical) are high", sw: "Nzito - Majukumu ya familia (ada, afya) ni makubwa mno" }
        ]
      },
      {
        id: "training_need",
        title_en: "Which training support would help you most?",
        title_sw: "Ni msaada gani wa mafunzo unaweza kukusaidia zaidi?",
        options: [
          { value: "budgeting", en: "Budgeting & Expense Separation", sw: "Kupanga Bajeti na Kutenga Matumizi" },
          { value: "record_keeping", en: "Record keeping for informal businesses", sw: "Kuweka Kumbukumbu za Biashara za Soko" },
          { value: "harvest_cycle", en: "Harvest-cycle repayment scheduling", sw: "Kupanga Malipo Kulingana na Mavuno" },
          { value: "loan_terms", en: "Understanding SACCO terms & interest rates", sw: "Kuelewa Masharti na Riba ya SACCO" }
        ]
      }
    ];

    this.init();
  }

  init() {
    this.loadState();
    this.registerServiceWorker();
    this.bindEvents();
    this.checkOnlineStatus();
    this.renderDemoProfiles();
    this.renderSaccoList();
    this.renderLoanTypeList();
    this.updateLanguageUI();
    
    // Default route with URL Hash Monitoring for /debug route
    const handleHashRoute = () => {
      if (window.location.hash === "#debug") {
        this.router.navigate("debug");
      }
    };
    window.addEventListener("hashchange", handleHashRoute);

    if (window.location.hash === "#debug") {
      this.router.navigate("debug");
    } else if (this.state.activeUser) {
      this.router.navigate("dashboard");
    } else {
      this.router.navigate("welcome");
    }

    this.refreshDevView();
  }

  loadState() {
    this.state.apiSyncActive = localStorage.getItem("apiSyncActive") === "true";
    this.state.apiUrl = localStorage.getItem("apiUrl") || "";

    const savedUser = localStorage.getItem("activeUser");
    if (savedUser) {
      this.state.activeUser = JSON.parse(savedUser);
      document.getElementById("active-user-badge").style.display = "flex";
      document.getElementById("active-user-name").innerText = this.state.activeUser.name;
      document.getElementById("bottom-nav").style.display = "flex";
    }

    const savedLang = localStorage.getItem("lang");
    if (savedLang) {
      this.state.lang = savedLang;
    }

    const savedLogs = localStorage.getItem("auditLogs");
    if (savedLogs) {
      this.state.auditLogs = JSON.parse(savedLogs);
    } else {
      this.state.auditLogs = [...INITIAL_AUDIT_LOGS];
      this.saveLogs();
    }

    const savedAlerts = localStorage.getItem("biasAlerts");
    if (savedAlerts) {
      this.state.biasAlerts = JSON.parse(savedAlerts);
    } else {
      this.state.biasAlerts = [...INITIAL_BIAS_ALERTS];
      this.saveAlerts();
    }
  }

  async apiFetch(url, options = {}) {
    if (!this.state.apiSyncActive || !this.state.apiUrl) return null;
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 4000); // 4s timeout
      const res = await fetch(this.state.apiUrl + url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {})
        },
        signal: controller.signal
      });
      clearTimeout(id);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`[API Sync Failed] ${url}:`, err);
      this.showOfflineNotification();
      return null;
    }
  }

  showOfflineNotification() {
    const banner = document.getElementById("offline-bar");
    if (banner) {
      banner.style.display = "block";
      setTimeout(() => {
        if (navigator.onLine) banner.style.display = "none";
      }, 5000);
    }
  }

  saveUser() {
    if (this.state.activeUser) {
      localStorage.setItem("activeUser", JSON.stringify(this.state.activeUser));
      
      // Update global mock profiles to sync if they chose one
      let allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
      const idx = allUsers.findIndex(u => u.id === this.state.activeUser.id);
      if (idx !== -1) {
        allUsers[idx] = this.state.activeUser;
      } else {
        allUsers.push(this.state.activeUser);
      }
      localStorage.setItem("allUsers", JSON.stringify(allUsers));

      // Trigger backend sync
      this.apiFetch("/api/profiles", {
        method: "POST",
        body: JSON.stringify(this.state.activeUser)
      });
    } else {
      localStorage.removeItem("activeUser");
    }
  }

  saveLogs() {
    localStorage.setItem("auditLogs", JSON.stringify(this.state.auditLogs));
  }

  saveAlerts() {
    localStorage.setItem("biasAlerts", JSON.stringify(this.state.biasAlerts));
  }

  logEvent(event, details, type = "system") {
    const log = {
      timestamp: new Date().toISOString(),
      event,
      details,
      user: this.state.activeUser ? `${this.state.activeUser.name} (${this.state.activeUser.phone})` : "Anonymous",
      type
    };
    this.state.auditLogs.unshift(log);
    if (this.state.auditLogs.length > 50) this.state.auditLogs.pop();
    this.saveLogs();

    // Trigger backend log sync
    this.apiFetch("/api/dev/logs", {
      method: "POST",
      body: JSON.stringify(log)
    });

    this.refreshDevView();
  }

  registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js")
        .then(() => console.log("[PWA] Service Worker registered"))
        .catch(err => console.error("[PWA] SW registration failed", err));
    }
  }

  checkOnlineStatus() {
    const updateBanner = () => {
      const banner = document.getElementById("offline-bar");
      if (navigator.onLine) {
        banner.style.display = "none";
      } else {
        banner.style.display = "block";
      }
    };
    window.addEventListener("online", updateBanner);
    window.addEventListener("offline", updateBanner);
    updateBanner();
  }

  bindEvents() {
    // Language Toggle
    document.getElementById("lang-toggle").addEventListener("click", () => {
      this.state.lang = this.state.lang === "en" ? "sw" : "en";
      localStorage.setItem("lang", this.state.lang);
      this.updateLanguageUI();
    });

    // Welcome consent acceptance
    document.getElementById("btn-accept-consent").addEventListener("click", () => {
      this.logEvent("Consent Acknowledged", "User agreed to SokoRada consent clauses and policy overview.", "consent");
      this.router.navigate("login");
    });

    // Form inputs and signup
    document.getElementById("btn-signup-submit").addEventListener("click", () => {
      const phone = document.getElementById("signup-phone").value.trim();
      const location = document.getElementById("signup-location").value.trim();
      const occupation = document.getElementById("signup-occupation").value;

      if (!phone || !location) {
        alert(this.state.lang === "en" ? "Please fill in all details." : "Tafadhali jaza maelezo yote.");
        return;
      }

      this.state.activeUser = {
        id: "user_" + Date.now(),
        name: occupation === "farmer" ? "Farmer Profile" : "Vendor Profile",
        phone,
        occupation,
        location,
        requestedAmount: 0,
        loanType: "",
        incomeSource: "",
        incomeCycle: occupation === "farmer" ? "seasonal" : "daily",
        repaymentTiming: occupation === "farmer" ? "seasonal" : "weekly",
        existingSavings: 0,
        saccoId: "",
        readinessAnswers: {},
        trainingCompleted: [],
        supportRequested: false,
        supportCategory: "",
        supportDetails: ""
      };

      this.saveUser();
      document.getElementById("active-user-badge").style.display = "flex";
      document.getElementById("active-user-name").innerText = this.state.activeUser.name;
      document.getElementById("bottom-nav").style.display = "flex";

      this.logEvent("User Registered", `Created local profile. Occupation: ${occupation}, Location: ${location}`, "system");
      this.router.navigate("dashboard");
    });

    // Settings checkboxes & Actions
    document.getElementById("consent-sharing-check").addEventListener("change", (e) => {
      if (this.state.activeUser) {
        this.logEvent("Consent Policy Updated", `Sharing with SACCO toggled: ${e.target.checked}`, "consent");
      }
    });

    document.getElementById("consent-reminders-check").addEventListener("change", (e) => {
      if (this.state.activeUser) {
        this.logEvent("Consent Policy Updated", `Reminders from Coach toggled: ${e.target.checked}`, "consent");
      }
    });

    document.getElementById("btn-export-profile-data").addEventListener("click", () => {
      if (!this.state.activeUser) return;
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state.activeUser, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `sokorada_profile_${this.state.activeUser.id}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      this.logEvent("Data Exported", "User downloaded JSON summary of active readiness files.", "system");
    });

    document.getElementById("btn-delete-profile").addEventListener("click", () => {
      if (confirm(this.state.lang === "en" ? "Are you sure you want to withdraw consent and delete your profile? This wipes all local data." : "Je, una uhakika unataka kuondoa idhini na kufuta wasifu wako? Hii itafuta kumbukumbu zote za ndani.")) {
        this.logEvent("Consent Withdrawn", "User wiped local workspace. Wiping database registers.", "consent");
        if (this.state.activeUser) {
          const phone = this.state.activeUser.phone;
          this.apiFetch(`/api/profiles/${phone}`, { method: "DELETE" });
        }
        this.state.activeUser = null;
        this.saveUser();
        
        // Reset local variables
        this.state.quizAnswers = {};
        this.state.currentQuizIndex = 0;
        this.state.uploadedFiles = [];
        this.state.speakToOfficerPref = false;

        document.getElementById("active-user-badge").style.display = "none";
        document.getElementById("bottom-nav").style.display = "none";
        this.router.navigate("welcome");
      }
    });

    // Backend API Settings Event Bindings
    const backToggle = document.getElementById("settings-backend-toggle");
    const backUrlContainer = document.getElementById("settings-backend-url-container");
    const backUrlInput = document.getElementById("settings-backend-url");

    backToggle.addEventListener("change", (e) => {
      this.state.apiSyncActive = e.target.checked;
      localStorage.setItem("apiSyncActive", e.target.checked);
      if (e.target.checked) {
        backUrlContainer.style.display = "block";
      } else {
        backUrlContainer.style.display = "none";
      }
      this.logEvent("API Sync Config Updated", `Render Sync active: ${e.target.checked}`, "system");
    });

    backUrlInput.addEventListener("change", (e) => {
      this.state.apiUrl = e.target.value.trim();
      localStorage.setItem("apiUrl", this.state.apiUrl);
      this.logEvent("API Target URL Set", `Render endpoint: ${this.state.apiUrl}`, "system");
      if (this.state.activeUser) {
        this.saveUser();
      }
    });
    // Developer Debug Screen Routing
    const devBtn = document.getElementById("btn-goto-debug");
    if (devBtn) {
      devBtn.addEventListener("click", () => {
        this.router.navigate("debug");
      });
    }

    document.getElementById("btn-debug-back").addEventListener("click", () => {
      this.router.navigate("settings");
    });
    // Quiz Navigation
    document.getElementById("btn-quiz-prev").addEventListener("click", () => {
      if (this.state.currentQuizIndex > 0) {
        this.state.currentQuizIndex--;
        this.renderQuizQuestion();
      }
    });

    document.getElementById("btn-quiz-next").addEventListener("click", () => {
      const activeQuestion = this.questions[this.state.currentQuizIndex];
      const selectedOption = this.state.quizAnswers[activeQuestion.id];

      if (!selectedOption) {
        alert(this.state.lang === "en" ? "Please select an option to proceed." : "Tafadhali chagua jibu moja ili kuendelea.");
        return;
      }

      if (this.state.currentQuizIndex < this.questions.length - 1) {
        this.state.currentQuizIndex++;
        this.renderQuizQuestion();
      } else {
        // Quiz finished! Save results
        if (this.state.activeUser) {
          this.state.activeUser.readinessAnswers = { ...this.state.quizAnswers };
          this.saveUser();
          this.logEvent("Readiness Check Finished", "Completed the 7-step loan readiness check questionnaire.", "readiness");
          this.router.navigate("training"); // Go to recommended training
        }
      }
    });

    // Sacco confirmation
    document.getElementById("btn-save-sacco").addEventListener("click", () => {
      if (this.state.activeUser) {
        const checkedInput = document.querySelector('input[name="sacco-select"]:checked');
        if (checkedInput) {
          this.state.activeUser.saccoId = checkedInput.value;
          this.saveUser();
          this.logEvent("SACCO Selected", `Target set to: ${checkedInput.value}`, "application");
          this.router.navigate("dashboard");
        } else {
          alert("Please select a SACCO.");
        }
      }
    });

    // Loan Application navigation
    document.getElementById("btn-select-loan-type").addEventListener("click", (e) => {
      e.preventDefault();
      this.router.navigate("loan-type");
    });

    document.getElementById("btn-loan-type-back").addEventListener("click", () => {
      this.router.navigate("loan-app");
    });

    // Dropzone upload simulation
    const dropzone = document.getElementById("document-dropzone");
    dropzone.addEventListener("click", () => {
      const mockFiles = [
        { name: "sales_log_may_2026.jpg", size: "380 KB", ocr: "OCR Check: Sales list matching daily retail trades verified (+1 Strength)" },
        { name: "milk_receipt_meru_coop.pdf", size: "1.2 MB", ocr: "OCR Check: Cooperatives payment voucher. Monthly delivery pattern verified." },
        { name: "maize_harvest_card_2026.png", size: "640 KB", ocr: "OCR Check: Local aggregation receipt for 28 bags of grain." }
      ];
      // Randomly pick a file to upload
      const file = mockFiles[Math.floor(Math.random() * mockFiles.length)];
      this.state.uploadedFiles.push(file);
      this.renderUploadedFiles();
      this.logEvent("Document Uploaded", `User scanned & uploaded: ${file.name}. Simulated OCR triggered.`, "application");
    });

    // Option pref talk to officer checkbox toggle
    document.getElementById("card-pref-speak-officer").addEventListener("click", () => {
      this.state.speakToOfficerPref = !this.state.speakToOfficerPref;
      const checkbox = document.getElementById("check-pref-speak-officer");
      if (this.state.speakToOfficerPref) {
        checkbox.classList.add("selected");
      } else {
        checkbox.classList.remove("selected");
      }
    });

    document.getElementById("btn-loan-app-cancel").addEventListener("click", () => {
      this.router.navigate("dashboard");
    });

    // Application submission logic
    document.getElementById("btn-loan-app-submit").addEventListener("click", () => {
      const amount = parseFloat(document.getElementById("loan-amount").value);
      const type = this.state.activeUser ? this.state.activeUser.loanType : "";
      const source = document.getElementById("loan-income-source").value.trim();
      const cycle = document.getElementById("loan-income-cycle").value;
      const timing = document.getElementById("loan-repayment-timing").value;
      const savings = parseFloat(document.getElementById("loan-savings").value) || 0;

      if (!amount || !source || !type) {
        alert(this.state.lang === "en" ? "Please fill in amount, purpose type, and income source." : "Tafadhali jaza kiasi, aina ya mkopo, na chanzo cha mapato.");
        return;
      }

      if (this.state.activeUser) {
        this.state.activeUser.requestedAmount = amount;
        this.state.activeUser.incomeSource = source;
        this.state.activeUser.incomeCycle = cycle;
        this.state.activeUser.repaymentTiming = timing;
        this.state.activeUser.existingSavings = savings;
        this.state.activeUser.supportRequested = this.state.speakToOfficerPref;
        if (this.state.speakToOfficerPref && !this.state.activeUser.supportCategory) {
          this.state.activeUser.supportCategory = "human_review";
          this.state.activeUser.supportDetails = "Borrower checked request review before submit.";
        }
        this.saveUser();
        this.logEvent("Loan Form Updated", `Saved details for KES ${amount} (${type})`, "application");
        
        // Go to repayment suggestion page
        this.router.navigate("repayment");
      }
    });

    // Repayment schedule confirmation
    document.getElementById("btn-repayment-confirm").addEventListener("click", () => {
      this.router.navigate("feedback-summary");
    });

    // Talk to Loan Officer Support screen submit
    document.getElementById("btn-officer-submit").addEventListener("click", () => {
      const cat = document.getElementById("officer-support-category").value;
      const details = document.getElementById("officer-support-text").value.trim();

      if (!details) {
        alert(this.state.lang === "en" ? "Please describe your question." : "Tafadhali eleza swali lako.");
        return;
      }

      if (this.state.activeUser) {
        this.state.activeUser.supportRequested = true;
        this.state.activeUser.supportCategory = cat;
        this.state.activeUser.supportDetails = details;
        this.saveUser();
      }

      // Show sending loader
      const loader = document.getElementById("officer-sending-modal");
      const submitBtn = document.getElementById("btn-officer-submit");
      loader.style.display = "block";
      submitBtn.disabled = true;

      let progressVal = 0;
      const progressTimer = setInterval(() => {
        progressVal += 25;
        document.getElementById("officer-sending-progress").style.width = progressVal + "%";
        if (progressVal >= 100) {
          clearInterval(progressTimer);
          loader.style.display = "none";
          submitBtn.disabled = false;
          
          this.logEvent("Callback Request Routed", `Hunter Agent queued support ticket. Category: ${cat}`, "communication");
          alert(this.state.lang === "en" ? "Your request has been saved. The loan officer will review your readiness profile." : "Ombi lako limehifadhiwa. Afisa mikopo atapitia wasifu wako wa utayari.");
          
          document.getElementById("officer-support-text").value = "";
          this.router.navigate("dashboard");
        }
      }, 400);
    });

    document.getElementById("btn-officer-back").addEventListener("click", () => {
      this.router.navigate("dashboard");
    });

    // Share Briefing
    document.getElementById("btn-summary-submit-briefing").addEventListener("click", () => {
      this.logEvent("Briefing Shared", `Readiness briefing pack delivered to ${this.state.activeUser.saccoId || "selected SACCO"}.`, "application");
      alert(this.state.lang === "en" ? "Briefing packet sent successfully to the SACCO loan officer!" : "Muhtasari wa utayari umetumwa vyema kwa afisa wa SACCO!");
      this.router.navigate("dashboard");
    });

    document.getElementById("btn-summary-save-later").addEventListener("click", () => {
      this.router.navigate("dashboard");
    });

    // Learning Slide control bindings
    document.getElementById("btn-close-slideshow").addEventListener("click", () => {
      document.getElementById("training-slideshow-container").style.display = "none";
      this.state.activeTrainingModule = null;
    });

    document.getElementById("btn-slide-prev").addEventListener("click", () => {
      if (this.state.activeSlideIndex > 0) {
        this.state.activeSlideIndex--;
        this.renderActiveSlide();
      }
    });

    document.getElementById("btn-slide-next").addEventListener("click", () => {
      const slides = this.state.activeTrainingModule.slides;
      if (this.state.activeSlideIndex < slides.length - 1) {
        this.state.activeSlideIndex++;
        this.renderActiveSlide();
      } else {
        // Module finished!
        const moduleId = this.state.activeTrainingModule.id;
        if (this.state.activeUser) {
          if (!this.state.activeUser.trainingCompleted.includes(moduleId)) {
            this.state.activeUser.trainingCompleted.push(moduleId);
            this.saveUser();
            this.logEvent("Training Complete", `Finished micro-course: ${moduleId}`, "training");
          }
        }
        document.getElementById("training-slideshow-container").style.display = "none";
        this.state.activeTrainingModule = null;
        
        // Refresh Hub
        this.renderTrainingHub();
        
        // If all recommended are finished, go to success screen
        const recs = this.getRecommendedTrainings();
        const unfinished = recs.filter(r => !this.state.activeUser.trainingCompleted.includes(r.id));
        if (unfinished.length === 0) {
          this.router.navigate("training-progress");
        }
      }
    });

    document.getElementById("btn-training-progress-done").addEventListener("click", () => {
      this.router.navigate("dashboard");
    });

    document.getElementById("btn-training-back-dash").addEventListener("click", () => {
      this.router.navigate("dashboard");
    });



    // USSD buttons
    document.getElementById("btn-ussd-submit").addEventListener("click", () => {
      this.handleUssdInput();
    });
    document.getElementById("ussd-user-input").addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.handleUssdInput();
    });

    // Dashboard navigators
    document.getElementById("btn-start-readiness").addEventListener("click", () => {
      this.state.currentQuizIndex = 0;
      this.router.navigate("readiness-check");
    });

    document.getElementById("btn-goto-sacco").addEventListener("click", () => {
      this.router.navigate("sacco");
    });

    document.getElementById("btn-goto-training").addEventListener("click", () => {
      this.router.navigate("training");
    });

    document.getElementById("btn-goto-application").addEventListener("click", () => {
      this.router.navigate("loan-app");
    });


  }

  // Router System
  router = {
    navigate: (screenId) => {
      // Check authentication rules (screens that need active profile)
      const publicScreens = ["welcome", "login"];
      if (!publicScreens.includes(screenId) && !this.state.activeUser) {
        screenId = "login";
      }

      // Deactivate all screens
      const screens = document.querySelectorAll(".screen");
      screens.forEach(s => s.classList.remove("active"));

      // Activate targeted screen
      const activeScreen = document.getElementById(`screen-${screenId}`);
      if (activeScreen) {
        activeScreen.classList.add("active");
      } else {
        console.error(`Screen ID screen-${screenId} not found.`);
        return;
      }

      // Update bottom nav tabs
      const navItems = document.querySelectorAll(".nav-item");
      navItems.forEach(n => n.classList.remove("active"));
      if (screenId === "dashboard") {
        document.getElementById("nav-dash").classList.add("active");
      } else if (screenId === "readiness-check") {
        document.getElementById("nav-readiness").classList.add("active");
      } else if (screenId === "officer-contact") {
        document.getElementById("nav-help").classList.add("active");
      } else if (screenId === "settings") {
        document.getElementById("nav-settings").classList.add("active");
      }

      // Run screen specific initialization renders
      if (screenId === "dashboard") this.renderDashboard();
      if (screenId === "readiness-check") this.renderQuizQuestion();
      if (screenId === "training") this.renderTrainingHub();
      if (screenId === "loan-app") this.renderLoanAppForm();
      if (screenId === "repayment") this.renderRepaymentSchedule();
      if (screenId === "feedback-summary") this.renderFeedbackSummary();
      if (screenId === "settings") this.renderSettings();

      // Scroll phone body to top
      document.getElementById("app-body").scrollTop = 0;

      // Sync developer dashboards
      this.refreshDevView();
    }
  };

  updateLanguageUI() {
    const isSw = this.state.lang === "sw";
    const body = document.body;
    
    if (isSw) {
      body.classList.add("lang-sw");
      document.getElementById("lang-toggle").innerText = "ENG";
    } else {
      body.classList.remove("lang-sw");
      document.getElementById("lang-toggle").innerText = "SWA";
    }

    // Refresh rendering of active screen to update dynamic strings
    const activeScreen = document.querySelector(".screen.active");
    if (activeScreen) {
      const screenId = activeScreen.id.replace("screen-", "");
      // Re-trigger routers render routine
      if (screenId === "dashboard") this.renderDashboard();
      if (screenId === "readiness-check") this.renderQuizQuestion();
      if (screenId === "training") this.renderTrainingHub();
      if (screenId === "loan-app") this.renderLoanAppForm();
      if (screenId === "repayment") this.renderRepaymentSchedule();
      if (screenId === "feedback-summary") this.renderFeedbackSummary();
    }
  }

  // Render Functions
  renderDemoProfiles() {
    const container = document.getElementById("demo-profiles-container");
    container.innerHTML = "";

    MOCK_PROFILES.forEach(profile => {
      const btn = document.createElement("button");
      btn.className = "option-card";
      btn.style.width = "100%";
      btn.style.textAlign = "left";
      btn.innerHTML = `
        <div style="font-weight:bold; color:var(--primary-color);">${profile.name} (${profile.location})</div>
        <div style="font-size:11px; color:var(--text-muted);">
          ${profile.occupation === "farmer" ? "Maize/Dairy Farmer" : "Market Vendor"} • Requesting KES ${profile.requestedAmount.toLocaleString()}
        </div>
      `;
      btn.addEventListener("click", () => {
        this.state.activeUser = JSON.parse(JSON.stringify(profile)); // Deep copy
        this.state.quizAnswers = { ...profile.readinessAnswers };
        this.saveUser();
        
        document.getElementById("active-user-badge").style.display = "flex";
        document.getElementById("active-user-name").innerText = profile.name;
        document.getElementById("bottom-nav").style.display = "flex";

        this.logEvent("Demo Profile Loaded", `Loaded data profile for '${profile.name}'.`, "system");
        this.router.navigate("dashboard");
      });
      container.appendChild(btn);
    });
  }

  renderSaccoList() {
    const container = document.getElementById("sacco-selection-list");
    container.innerHTML = "";

    MOCK_SACCOS.forEach(sacco => {
      const div = document.createElement("div");
      div.className = "option-card";
      const isSelected = this.state.activeUser && this.state.activeUser.saccoId === sacco.id;
      if (isSelected) div.classList.add("selected");

      div.innerHTML = `
        <input type="radio" name="sacco-select" id="sacco-${sacco.id}" value="${sacco.id}" ${isSelected ? "checked" : ""} style="cursor:pointer;">
        <label for="sacco-${sacco.id}" style="cursor:pointer; flex:1;">
          <strong>${sacco.name}</strong>
          <p style="font-size:12px; margin-top:2px;">${sacco.description}</p>
        </label>
      `;

      div.addEventListener("click", () => {
        const rad = div.querySelector('input[type="radio"]');
        rad.checked = true;
        document.querySelectorAll("#sacco-selection-list .option-card").forEach(c => c.classList.remove("selected"));
        div.classList.add("selected");
      });

      container.appendChild(div);
    });
  }

  renderLoanTypeList() {
    const container = document.getElementById("loan-type-selection-list");
    container.innerHTML = "";

    MOCK_LOAN_TYPES.forEach(type => {
      const btn = document.createElement("button");
      btn.className = "option-card";
      btn.style.width = "100%";
      btn.style.textAlign = "left";

      const name = this.state.lang === "en" ? type.name_en : type.name_sw;
      btn.innerHTML = `<strong>${name}</strong>`;
      
      btn.addEventListener("click", () => {
        if (this.state.activeUser) {
          this.state.activeUser.loanType = type.id;
          this.saveUser();
          document.getElementById("loan-type-display").value = name;
          this.router.navigate("loan-app");
        }
      });

      container.appendChild(btn);
    });
  }

  renderDashboard() {
    const user = this.state.activeUser;
    if (!user) return;

    // Greeting Swahili / English
    const greetingEn = `Habari, ${user.name}!`;
    const greetingSw = `Habari, ${user.name}!`;
    // Update dashboard coach guidance dynamically based on quiz status
    const quizState = this.getQuizState();
    const coachText = document.getElementById("dashboard-agent-text");
    
    if (quizState === "completed") {
      coachText.innerHTML = `
        <span class="english-text">Fantastic! Your readiness summary is generated. Next, review training courses below or adjust your application info.</span>
        <span class="swahili-text">Vizuri sana! Muhtasari wako wa utayari umekamilika. Sasa, pitia masomo hapa chini au urekebishe maelezo ya ombi lako.</span>
      `;
      document.getElementById("dash-readiness-status").innerText = this.state.lang === "en" ? "Ready & Analyzed" : "Tayari na Imechambuliwa";
      document.getElementById("btn-start-readiness").innerText = this.state.lang === "en" ? "Review Assessment" : "Kagua Tathmini";
    } else {
      coachText.innerHTML = `
        <span class="english-text">Let's complete the readiness check to map your seasonal cycles and see what training helps most.</span>
        <span class="swahili-text">Wacha tukamilishe tathmini ya utayari ili kupanga mzunguko wako wa msimu na kuona masomo yatakayosaidia zaidi.</span>
      `;
      document.getElementById("dash-readiness-status").innerText = this.state.lang === "en" ? "Not Started" : "Bado Kuanza";
      document.getElementById("btn-start-readiness").innerText = this.state.lang === "en" ? "Start Assessment" : "Anza Tathmini";
    }

    // Selected Sacco text
    const sacco = MOCK_SACCOS.find(s => s.id === user.saccoId);
    document.getElementById("dash-selected-sacco").innerText = sacco ? sacco.name : (this.state.lang === "en" ? "Not Chosen" : "Bado Kuchagua");

    // Training Progress info
    const recs = this.getRecommendedTrainings();
    const completedCount = user.trainingCompleted.filter(tc => recs.some(r => r.id === tc)).length;
    const progressPercent = recs.length > 0 ? Math.round((completedCount / recs.length) * 100) : 0;
    
    const trainInfo = document.getElementById("dash-training-progress-info");
    trainInfo.innerHTML = `
      <p style="font-weight:600; font-size:13px; color:var(--text-main);">
        ${completedCount} / ${recs.length} ${this.state.lang === "en" ? "recommended modules completed" : "masomo uliyomaliza"} (${progressPercent}%)
      </p>
      <div class="progress-bar-container" style="margin: 6px 0 10px 0;">
        <div class="progress-bar" style="width: ${progressPercent}%;"></div>
      </div>
    `;

    // Application details summary
    const statusText = document.getElementById("dash-app-status-text");
    const statusTextSw = document.getElementById("dash-app-status-text-sw");
    
    if (user.requestedAmount > 0) {
      const loanTypeName = MOCK_LOAN_TYPES.find(t => t.id === user.loanType);
      const loanName = loanTypeName ? (this.state.lang === "en" ? loanTypeName.name_en : loanTypeName.name_sw) : user.loanType;
      
      statusText.innerHTML = `Draft Summary: <strong>KES ${user.requestedAmount.toLocaleString()}</strong> for <strong>${loanName}</strong>. Ready to share.`;
      statusTextSw.innerHTML = `Muhtasari: <strong>KES ${user.requestedAmount.toLocaleString()}</strong> wa <strong>${loanName}</strong>. Tayari kutumwa.`;
      document.getElementById("btn-goto-application").innerText = this.state.lang === "en" ? "Review Details" : "Kagua Maelezo";
    } else {
      statusText.innerHTML = "Translate your cash turnover into a structured request.";
      statusTextSw.innerHTML = "Tafsiri mapato yako ya mzunguko kuwa ombi rasmi.";
      document.getElementById("btn-goto-application").innerText = this.state.lang === "en" ? "Fill Details" : "Jaza Maelezo";
    }
  }

  renderQuizQuestion() {
    const qIndex = this.state.currentQuizIndex;
    const q = this.questions[qIndex];

    // Update progress bar
    const progress = Math.round(((qIndex) / this.questions.length) * 100);
    document.getElementById("readiness-progress-indicator").style.width = progress + "%";

    // Titles
    document.getElementById("quiz-question-title").innerText = this.state.lang === "en" ? q.title_en : q.title_sw;

    // Options container
    const container = document.getElementById("quiz-options-container");
    container.innerHTML = "";

    q.options.forEach(opt => {
      const div = document.createElement("div");
      div.className = "quiz-answer-option";
      const isSelected = this.state.quizAnswers[q.id] === opt.value;
      if (isSelected) div.classList.add("selected");

      div.innerText = this.state.lang === "en" ? opt.en : opt.sw;
      
      div.addEventListener("click", () => {
        this.state.quizAnswers[q.id] = opt.value;
        this.renderQuizQuestion();
      });

      container.appendChild(div);
    });

    // Update Quiz Buttons
    const prevBtn = document.getElementById("btn-quiz-prev");
    const nextBtn = document.getElementById("btn-quiz-next");

    if (qIndex === 0) {
      prevBtn.style.visibility = "hidden";
    } else {
      prevBtn.style.visibility = "visible";
    }

    if (qIndex === this.questions.length - 1) {
      nextBtn.innerText = this.state.lang === "en" ? "Save & View Recommendations" : "Hifadhi na Uone Masomo";
    } else {
      nextBtn.innerText = this.state.lang === "en" ? "Next Question" : "Swali Lifuatalo";
    }
  }

  renderTrainingHub() {
    const user = this.state.activeUser;
    if (!user) return;

    const container = document.getElementById("training-modules-list");
    container.innerHTML = "";

    const recs = this.getRecommendedTrainings();

    if (recs.length === 0) {
      container.innerHTML = `
        <div class="card highlight" style="text-align:center;">
          <p class="english-text">Please complete the Readiness Check first to see training recommendations.</p>
          <p class="swahili-text">Tafadhali kamilisha Tathmini ya Utayari kwanza ili kupata mapendekezo ya masomo.</p>
        </div>
      `;
      return;
    }

    recs.forEach(module => {
      const div = document.createElement("div");
      div.className = "card";
      
      const isFinished = user.trainingCompleted.includes(module.id);
      if (isFinished) {
        div.classList.add("accent");
      } else {
        div.classList.add("highlight");
      }

      const title = this.state.lang === "en" ? module.title_en : module.title_sw;
      const desc = this.state.lang === "en" ? module.description_en : module.description_sw;

      div.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong>${title}</strong>
          ${isFinished ? "<span style='color:var(--primary-color); font-weight:bold; font-size:12px;'>✓ Finished</span>" : "<span style='color:var(--secondary-color); font-weight:bold; font-size:12px;'>• Pending</span>"}
        </div>
        <p style="font-size:12.5px; margin-top:2px;">${desc}</p>
        <button class="btn btn-outline text-small" style="padding: 6px 12px; margin-top:6px;">
          ${isFinished ? "Review Slide" : "Start Module"}
        </button>
      `;

      div.querySelector("button").addEventListener("click", () => {
        this.startSlideshow(module);
      });

      container.appendChild(div);
    });
  }

  startSlideshow(module) {
    this.state.activeTrainingModule = module;
    this.state.activeSlideIndex = 0;
    
    document.getElementById("training-slideshow-container").style.display = "block";
    this.renderActiveSlide();
  }

  renderActiveSlide() {
    const module = this.state.activeTrainingModule;
    const sIndex = this.state.activeSlideIndex;
    const slides = module.slides;

    document.getElementById("training-active-title").innerText = this.state.lang === "en" ? module.title_en : module.title_sw;
    document.getElementById("training-slide-number").innerText = `Slide ${sIndex + 1} / ${slides.length}`;
    
    // Slide content translation
    const slideText = this.state.lang === "en" ? slides[sIndex].en : slides[sIndex].sw;
    document.getElementById("training-slide-content").innerText = slideText;

    // Progress bar
    const progress = Math.round(((sIndex + 1) / slides.length) * 100);
    document.getElementById("training-slide-progress").style.width = progress + "%";

    // Nav buttons
    const prevBtn = document.getElementById("btn-slide-prev");
    const nextBtn = document.getElementById("btn-slide-next");

    if (sIndex === 0) {
      prevBtn.style.visibility = "hidden";
    } else {
      prevBtn.style.visibility = "visible";
    }

    if (sIndex === slides.length - 1) {
      nextBtn.innerText = this.state.lang === "en" ? "Complete" : "Maliza";
    } else {
      nextBtn.innerText = this.state.lang === "en" ? "Next" : "Endelea";
    }
  }

  renderLoanAppForm() {
    const user = this.state.activeUser;
    if (!user) return;

    document.getElementById("loan-amount").value = user.requestedAmount || "";
    document.getElementById("loan-income-source").value = user.incomeSource || "";
    document.getElementById("loan-income-cycle").value = user.incomeCycle || (user.occupation === "farmer" ? "seasonal" : "daily");
    document.getElementById("loan-repayment-timing").value = user.repaymentTiming || (user.occupation === "farmer" ? "seasonal" : "weekly");
    document.getElementById("loan-savings").value = user.existingSavings || "";

    const typeDef = MOCK_LOAN_TYPES.find(t => t.id === user.loanType);
    document.getElementById("loan-type-display").value = typeDef ? (this.state.lang === "en" ? typeDef.name_en : typeDef.name_sw) : "";

    // Sync mock uploaded files
    this.renderUploadedFiles();

    // Checkbox sync
    const check = document.getElementById("check-pref-speak-officer");
    this.state.speakToOfficerPref = user.supportRequested;
    if (this.state.speakToOfficerPref) {
      check.classList.add("selected");
    } else {
      check.classList.remove("selected");
    }
  }

  renderUploadedFiles() {
    const container = document.getElementById("uploaded-files-container");
    container.innerHTML = "";

    this.state.uploadedFiles.forEach((f, idx) => {
      const div = document.createElement("div");
      div.className = "card accent";
      div.style.padding = "10px";
      div.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px;">
          <strong>File: ${f.name} (${f.size})</strong>
          <button class="btn-text" style="color:var(--secondary-color); padding:0;" onclick="app.removeFile(${idx})">Delete</button>
        </div>
        <p class="text-small" style="color:#2e7d32; font-weight:600; margin-top:4px;">OCR: ${f.ocr}</p>
      `;
      container.appendChild(div);
    });
  }

  removeFile(idx) {
    const removed = this.state.uploadedFiles.splice(idx, 1);
    this.renderUploadedFiles();
    this.logEvent("Document Removed", `Deleted uploaded file: ${removed[0].name}`, "system");
  }

  renderRepaymentSchedule() {
    const user = this.state.activeUser;
    if (!user) return;

    const cycle = user.incomeCycle;
    const container = document.getElementById("suggested-schedule-comparison");
    const tableCycleText = document.getElementById("repayment-suggested-cycle");
    const guardianText = document.getElementById("repayment-guardian-text");

    let scheduleTitle = "";
    let scheduleDesc = "";
    let comparisonCycle = "";

    if (cycle === "seasonal" || user.repaymentTiming === "seasonal") {
      scheduleTitle = this.state.lang === "en" ? "Seasonal Harvest Repayment plan" : "Mpango wa Malipo ya Msimu wa Mavuno";
      scheduleDesc = this.state.lang === "en" 
        ? "No principal payments during dry crop growing months (March - July). Pay KES 14,000 principal in August and KES 14,000 in January after harvest sales. Pay small interest-only balances (2% KES 560) in planting months to stay compliant." 
        : "Hakuna malipo ya deni kuu wakati wa kupanda (Machi - Julai). Lipa KES 14,000 mwezi wa Agosti na KES 14,000 mwezi wa Januari baada ya kuvuna. Lipa riba ndogo pekee (KES 560) miezi mingine ili kulinda wasifu wako.";
      comparisonCycle = this.state.lang === "en" ? "Harvest alignment (2 lump payments)" : "Mavuno (Lipa Mara Mbili tu)";
      
      guardianText.innerHTML = `
        <span class="english-text">Guardian Agent: Your maize crop brings yield twice a year. Standard flat monthly bank payments would force default in dry months. Our plan shifts payments to harvest windows.</span>
        <span class="swahili-text">Guardian Agent: Mazao yako huleta fedha mara mbili kwa mwaka. Malipo ya kawaida ya benki yangelazimisha kufeli katika miezi ya kiangazi. Mpango wetu umehamishia malipo kwenye msimu wa mavuno.</span>
      `;
    } else if (cycle === "daily" || cycle === "weekly") {
      scheduleTitle = this.state.lang === "en" ? "High-Frequency Weekly Repayments" : "Malipo ya Kila Wiki mepesi";
      scheduleDesc = this.state.lang === "en"
        ? "Pay KES 1,350 every Friday at the market. Aligning to daily crop/vegetable turnovers avoids storing money for standard monthly lump-sums, which families often have to spend on home emergencies."
        : "Lipa KES 1,350 kila Ijumaa sokoni. Kulinganisha na mzunguko wa mauzo ya kila siku kunazuia kuhifadhi fedha nyingi kwa mkupuo, ambazo mara nyingi hutumika kwa dharura za nyumbani.";
      comparisonCycle = this.state.lang === "en" ? "Weekly micro-repayments" : "Malipo mepesi ya kila wiki";

      guardianText.innerHTML = `
        <span class="english-text">Guardian Agent: As a trader, you rotate cash flow daily. Storing cash for 30 days risks diversion to household needs. Small weekly transfers protect your business capital.</span>
        <span class="swahili-text">Guardian Agent: Kama mfanyabiashara, mzunguko wako wa fedha ni wa kila siku. Kukusanya pesa kwa siku 30 huleta hatari ya kuzitumia kwa dharura. Malipo madogo ya wiki yanalinda mtaji wako.</span>
      `;
    } else {
      scheduleTitle = this.state.lang === "en" ? "Flexible Monthly with 1-Month Grace" : "Malipo ya Mwezi yenye Muda wa Neema";
      scheduleDesc = this.state.lang === "en"
        ? "First payment deferred for 30 days to allow animal feed/inputs installation. Standard equal monthly payments of KES 3,800 thereafter for 12 months."
        : "Malipo ya kwanza yanasogezwa mbele kwa siku 30 ili kuruhusu pembejeo/vifaa kuanza kuleta tija. Baada ya hapo ni malipo ya kawaida ya KES 3,800 kwa miezi 12.";
      comparisonCycle = this.state.lang === "en" ? "Monthly with deferral" : "Malipo ya mwezi yenye kusogezwa mbele";

      guardianText.innerHTML = `
        <span class="english-text">Guardian Agent: Dairy cycles yield income monthly. We propose a 1-month grace period on inputs so your feed purchase has time to raise dairy yields before repayments start.</span>
        <span class="swahili-text">Guardian Agent: Mzunguko wa maziwa huleta fedha kila mwezi. Tunapendekeza muda wa neema wa mwezi mmoja ili chakula cha ng'ombe kianze kuleta maziwa kabla ya kuanza kulipa.</span>
      `;
    }

    container.innerHTML = `
      <h3 style="font-size:15px; font-weight:bold; color:var(--primary-color);">${scheduleTitle}</h3>
      <p style="font-size:13px; margin-top:4px; line-height:1.4;">${scheduleDesc}</p>
    `;

    tableCycleText.innerText = comparisonCycle;
  }

  renderFeedbackSummary() {
    const user = this.state.activeUser;
    if (!user) return;

    // Strengths calculation
    const strengthsContainer = document.getElementById("summary-strengths-list");
    strengthsContainer.innerHTML = "";

    const addStrength = (title, desc) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${title}:</strong> ${desc}`;
      strengthsContainer.appendChild(li);
    };

    if (user.existingSavings > 0) {
      addStrength(
        this.state.lang === "en" ? "Active Capital Cushion" : "Mto wa Akiba",
        this.state.lang === "en" ? `KES ${user.existingSavings} in shares/savings represents buffer resilience.` : `KES ${user.existingSavings} kama akiba inawakilisha uthabiti.`
      );
    }
    if (this.state.quizAnswers.purpose === "yes") {
      addStrength(
        this.state.lang === "en" ? "Purpose-Aligned Loan Goal" : "Malengo Yaliyopangwa Vyema",
        this.state.lang === "en" ? "Clear application allocation avoids diversion risks." : "Kujua mpango thabiti wa mkopo kunazuia matumizi mabaya."
      );
    }
    if (this.state.quizAnswers.records === "yes" || this.state.uploadedFiles.length > 0) {
      addStrength(
        this.state.lang === "en" ? "Record-Keeping Activity" : "Kuweka Kumbukumbu za Mauzo",
        this.state.lang === "en" ? "Demonstrates business transaction discipline." : "Inaonyesha nidhamu ya kurekodi miamala ya biashara."
      );
    }
    
    // Add completed training strength
    user.trainingCompleted.forEach(tc => {
      const mod = MOCK_TRAINING_MODULES.find(m => m.id === tc);
      if (mod) {
        addStrength(
          this.state.lang === "en" ? "Financial Literacy Completed" : "Mafunzo ya Utayari Yaliyokamilika",
          this.state.lang === "en" ? `Finished course: ${mod.title_en}` : `Alimaliza somo la: ${mod.title_sw}`
        );
      }
    });

    if (strengthsContainer.children.length === 0) {
      const li = document.createElement("li");
      li.innerText = this.state.lang === "en" ? "Take training recommendations to add strengths." : "Kamilisha masomo ili kuongeza nguvu za wasifu wako.";
      strengthsContainer.appendChild(li);
    }

    // Application details panel
    const detailsContainer = document.getElementById("summary-details-content");
    const loanDef = MOCK_LOAN_TYPES.find(l => l.id === user.loanType);
    const loanName = loanDef ? (this.state.lang === "en" ? loanDef.name_en : loanDef.name_sw) : user.loanType;
    const saccoDef = MOCK_SACCOS.find(s => s.id === user.saccoId);
    const saccoName = saccoDef ? saccoDef.name : "Not Selected";

    detailsContainer.innerHTML = `
      <div><strong>Selected SACCO:</strong> ${saccoName}</div>
      <div><strong>Loan Amount:</strong> KES ${user.requestedAmount.toLocaleString()}</div>
      <div><strong>Purpose:</strong> ${loanName}</div>
      <div><strong>Income Cycle:</strong> ${user.incomeCycle} (${user.incomeSource})</div>
      <div><strong>Repayment Plan:</strong> ${user.repaymentTiming}</div>
      <div><strong>Human Support Requested:</strong> ${user.supportRequested ? "Yes" : "No"}</div>
    `;

    // Suggestions box based on gaps
    const sugBox = document.getElementById("summary-suggestions-box");
    sugBox.innerHTML = "";

    const recs = this.getRecommendedTrainings();
    const unfinished = recs.filter(r => !user.trainingCompleted.includes(r.id));

    if (unfinished.length > 0) {
      const p = document.createElement("p");
      p.style.color = "var(--secondary-color)";
      p.style.fontWeight = "bold";
      p.innerText = this.state.lang === "en" ? "Action Items to strengthen application:" : "Mapendekezo ya kuimarisha ombi lako:";
      sugBox.appendChild(p);

      unfinished.forEach(u => {
        const title = this.state.lang === "en" ? u.title_en : u.title_sw;
        const div = document.createElement("div");
        div.innerHTML = `• Complete module <strong>${title}</strong> to add an active certificate filter.`;
        sugBox.appendChild(div);
      });
    } else {
      const p = document.createElement("p");
      p.style.color = "var(--primary-color)";
      p.style.fontWeight = "bold";
      p.innerText = this.state.lang === "en" ? "Excellent Work! All readiness prep recommended is completed!" : "Kazi nzuri! Masomo yote ya maandalizi ya utayari yamekamilika!";
      sugBox.appendChild(p);
    }
  }

  renderSettings() {
    const user = this.state.activeUser;
    if (!user) return;

    document.getElementById("consent-sharing-check").checked = true;
    document.getElementById("consent-reminders-check").checked = user.trainingCompleted.length < 3;

    // Backend sync UI settings sync
    const backToggle = document.getElementById("settings-backend-toggle");
    const backUrlContainer = document.getElementById("settings-backend-url-container");
    const backUrlInput = document.getElementById("settings-backend-url");

    backToggle.checked = this.state.apiSyncActive;
    backUrlInput.value = this.state.apiUrl || "";
    backUrlContainer.style.display = this.state.apiSyncActive ? "block" : "none";
  }

  // Business Logic helpers
  getQuizState() {
    if (!this.state.activeUser) return "none";
    const keys = Object.keys(this.state.activeUser.readinessAnswers || {});
    if (keys.length === 0) return "none";
    if (keys.length < this.questions.length) return "draft";
    return "completed";
  }

  getRecommendedTrainings() {
    if (!this.state.activeUser) return [];
    
    const ans = this.state.quizAnswers;
    const recommendations = [];

    // Core recommendations based on user answers
    if (ans.records === "no") {
      const r = MOCK_TRAINING_MODULES.find(m => m.id === "record_keeping");
      if (r) recommendations.push(r);
    }
    if (ans.easiest_months === "march_august" || ans.easiest_months === "dry_months" || this.state.activeUser.incomeCycle === "seasonal") {
      const r = MOCK_TRAINING_MODULES.find(m => m.id === "harvest_cycle");
      if (r) recommendations.push(r);
    }
    if (ans.confidence === "low" || ans.training_need === "budgeting") {
      const r = MOCK_TRAINING_MODULES.find(m => m.id === "budgeting");
      if (r) recommendations.push(r);
    }
    if (ans.pressure === "heavy" || this.state.activeUser.loanType === "school_fees") {
      const r = MOCK_TRAINING_MODULES.find(m => m.id === "school_fees_prep");
      if (r) recommendations.push(r);
    }

    // Default modules that help everyone
    const loanTerms = MOCK_TRAINING_MODULES.find(m => m.id === "loan_terms");
    if (loanTerms && !recommendations.some(x => x.id === "loan_terms")) {
      recommendations.push(loanTerms);
    }

    const speak = MOCK_TRAINING_MODULES.find(m => m.id === "speak_to_officer");
    if (speak && !recommendations.some(x => x.id === "speak_to_officer")) {
      recommendations.push(speak);
    }

    return recommendations;
  }

  // Developer / Testing View Functions
  async refreshDevView() {
    const user = this.state.activeUser;
    
    // If backend is active, fetch from backend endpoints!
    if (this.state.apiSyncActive && this.state.apiUrl) {
      try {
        // Fetch briefings
        if (user && user.requestedAmount > 0) {
          const briefingRes = await this.apiFetch(`/api/dev/briefings/${user.phone}`);
          if (briefingRes && briefingRes.success) {
            document.getElementById("dev-officer-briefing").innerText = briefingRes.briefing;
          }
        } else {
          document.getElementById("dev-officer-briefing").innerText = "Briefing Packet is blank. Select a demo user or fill out a borrower application form.";
        }

        // Fetch triage queue
        const triageRes = await this.apiFetch("/api/dev/triage");
        if (triageRes && triageRes.success) {
          const reviewQueue = document.getElementById("dev-human-review-queue");
          reviewQueue.innerHTML = "";
          let flaggedCount = triageRes.flagged.length;
          
          triageRes.flagged.forEach(u => {
            const div = document.createElement("div");
            div.className = "admin-item";
            let reason = u.supportRequested ? `Callback request: ${u.supportCategory}` : "Triage trigger flagged";
            div.innerHTML = `
              <div class="admin-item-header">
                <strong>${u.name} (${u.location})</strong>
                <span class="badge-warning">Flagged</span>
              </div>
              <p style="font-size:11px; margin-top:2px;">
                <strong>Request:</strong> KES ${u.requestedAmount.toLocaleString()} for ${u.loanType}<br>
                <strong>Triage Trigger:</strong> ${reason}<br>
                <span style="font-style:italic; color:#3e2723;">"${u.supportDetails || "Guardian recommendation: manual harvest restructuring needed."}"</span>
              </p>
            `;
            reviewQueue.appendChild(div);
          });
          
          if (flaggedCount === 0) {
            reviewQueue.innerHTML = `<p class="text-small" style="text-align:center; color:var(--text-muted);">No cases flagged for manual review.</p>`;
          }
        }

        // Fetch bias alerts
        const alertsRes = await this.apiFetch("/api/dev/alerts");
        if (alertsRes && alertsRes.success) {
          const alertsContainer = document.getElementById("dev-bias-alerts");
          alertsContainer.innerHTML = "";
          alertsRes.alerts.forEach(alert => {
            const div = document.createElement("div");
            div.className = alert.severity === "warning" ? "card alert" : "card accent";
            div.style.padding = "8px 12px";
            div.style.margin = "0";
            div.innerHTML = `
              <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; font-weight:bold;">
                <span>${alert.category}</span>
                <span style="text-transform:uppercase; color:${alert.severity === "warning" ? "var(--secondary-color)" : "var(--primary-color)"};">${alert.severity}</span>
              </div>
              <p style="font-size:11.5px; margin-top:2px; color:var(--text-main);">${alert.description}</p>
            `;
            alertsContainer.appendChild(div);
          });
        }

        // Fetch audit logs
        const logsRes = await this.apiFetch("/api/dev/logs");
        if (logsRes && logsRes.success) {
          const logsContainer = document.getElementById("dev-audit-logs");
          logsContainer.innerHTML = "";
          logsRes.logs.forEach(log => {
            const div = document.createElement("div");
            div.className = "admin-item";
            div.style.padding = "6px 8px";
            let badgeClass = "badge-info";
            if (log.type === "consent") badgeClass = "badge-info";
            if (log.type === "readiness") badgeClass = "badge-warning";
            if (log.type === "communication") badgeClass = "badge-error";
            const time = new Date(log.timestamp).toLocaleTimeString();
            div.innerHTML = `
              <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:2px;">
                <strong>${log.event}</strong>
                <span class="${badgeClass}">${log.type}</span>
              </div>
              <div style="font-size:10.5px; color:var(--text-muted);">
                ${log.details} <span style="float:right;">${time}</span>
              </div>
            `;
            logsContainer.appendChild(div);
          });
        }
        return; 
      } catch (err) {
        console.warn("[API Sync Failed] Could not fetch dev telemetry, falling back to local computation:", err);
      }
    }

    // --- LOCAL FALLBACK ---
    // 1. Briefing Packet
    const briefingPre = document.getElementById("dev-officer-briefing");
    if (user && user.requestedAmount > 0) {
      const loanDef = MOCK_LOAN_TYPES.find(l => l.id === user.loanType);
      const loanName = loanDef ? loanDef.name_en : user.loanType;
      
      const recs = this.getRecommendedTrainings();
      const completedList = user.trainingCompleted.map(tc => {
        const m = MOCK_TRAINING_MODULES.find(x => x.id === tc);
        return m ? m.title_en : tc;
      }).join(", ") || "None yet";
      
      const pendingList = recs
        .filter(r => !user.trainingCompleted.includes(r.id))
        .map(p => p.title_en)
        .join(", ") || "None (All complete)";

      const humanReviewFlag = this.evaluateHumanReviewFlag(user);

      briefingPre.innerHTML = `
*** SOKORADA HUNTER AGENT: ETHICAL LENDING BRIEFING ***
[LOCAL CLIENT-SIDE CACHE ONLY]

BORROWER PROFILE:
- Name/Identifier: ${user.name}
- Location: ${user.location}
- Main Income: ${user.incomeSource}
- Declared Cycle: ${user.incomeCycle} (Reported cash frequency)
- Savings Buffer: KES ${user.existingSavings.toLocaleString()}

APPLICATION REQUEST:
- Requested Amount: KES ${user.requestedAmount.toLocaleString()}
- Purpose Category: ${loanName}
- Aligned Repayment Plan: ${user.repaymentTiming}

FINANCIAL WELL-BEING & COMPLIANCE (SCOUT/GUARDIAN DIAGNOSIS):
- Financial Confidence: ${user.readinessAnswers.confidence || "Not Assessed"}
- Income Predictability: ${user.readinessAnswers.easiest_months || "Not Assessed"}
- Keep Sales Logs: ${user.readinessAnswers.records || "Not Assessed"}
- Household Cash Pressure: ${user.readinessAnswers.pressure || "Not Assessed"}

TRAINING ENGAGEMENT:
- Modules Completed: ${completedList}
- Modules Outstanding: ${pendingList}

GUARDIAN LENDING RECOMMENDATIONS:
- Aligned Repayment Suggestion: ${user.repaymentTiming === "seasonal" ? "Seasonal harvest installments (Principal postponed to crop sale window)" : "Weekly cash-aligned micro-installments"}
- Human Review Recommendation: ${humanReviewFlag ? "YES (Required due to cash cycle or direct user request)" : "NO (Auto-guidance holds, standard processing)"}
- Special Notes: ${user.supportRequested ? `User requested manual officer review. Detail: "${user.supportDetails}"` : "None"}
      `.trim();
    } else {
      briefingPre.innerText = "Briefing Packet is blank. Select a demo user or fill out a borrower application form.";
    }

    // 2. Human Review Queue
    const reviewQueue = document.getElementById("dev-human-review-queue");
    reviewQueue.innerHTML = "";

    let allDemoUsers = MOCK_PROFILES;
    if (user) {
      allDemoUsers = MOCK_PROFILES.map(u => u.id === user.id ? user : u);
    }

    let flaggedCount = 0;
    allDemoUsers.forEach(u => {
      const needsReview = this.evaluateHumanReviewFlag(u);
      if (needsReview) {
        flaggedCount++;
        const div = document.createElement("div");
        div.className = "admin-item";
        
        let reason = "";
        if (u.supportRequested) reason = `Callback request: ${u.supportCategory || "general question"}`;
        else if (u.readinessAnswers.pressure === "heavy") reason = "Heavy financial pressure flagged";
        else reason = "Seasonal alignment escalation";

        div.innerHTML = `
          <div class="admin-item-header">
            <strong>${u.name} (${u.location})</strong>
            <span class="badge-warning">Flagged</span>
          </div>
          <p style="font-size:11px; margin-top:2px;">
            <strong>Request:</strong> KES ${u.requestedAmount.toLocaleString()} for ${u.loanType}<br>
            <strong>Triage Trigger:</strong> ${reason}<br>
            <span style="font-style:italic; color:#3e2723;">"${u.supportDetails || "Guardian recommendation: manual harvest restructuring needed."}"</span>
          </p>
        `;
        reviewQueue.appendChild(div);
      }
    });

    if (flaggedCount === 0) {
      reviewQueue.innerHTML = `<p class="text-small" style="text-align:center; color:var(--text-muted);">No cases flagged for manual review.</p>`;
    }

    // 3. Bias Alerts
    const alertsContainer = document.getElementById("dev-bias-alerts");
    alertsContainer.innerHTML = "";
    this.state.biasAlerts.forEach(alert => {
      const div = document.createElement("div");
      div.className = alert.severity === "warning" ? "card alert" : "card accent";
      div.style.padding = "8px 12px";
      div.style.margin = "0";
      div.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; font-weight:bold;">
          <span>${alert.category}</span>
          <span style="text-transform:uppercase; color:${alert.severity === "warning" ? "var(--secondary-color)" : "var(--primary-color)"};">${alert.severity}</span>
        </div>
        <p style="font-size:11.5px; margin-top:2px; color:var(--text-main);">${alert.description}</p>
      `;
      alertsContainer.appendChild(div);
    });

    // 4. Session Logs
    const logsContainer = document.getElementById("dev-audit-logs");
    logsContainer.innerHTML = "";
    this.state.auditLogs.forEach(log => {
      const div = document.createElement("div");
      div.className = "admin-item";
      div.style.padding = "6px 8px";
      
      let badgeClass = "badge-info";
      if (log.type === "consent") badgeClass = "badge-info";
      if (log.type === "readiness") badgeClass = "badge-warning";
      if (log.type === "communication") badgeClass = "badge-error";

      const time = new Date(log.timestamp).toLocaleTimeString();

      div.innerHTML = `
        <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:2px;">
          <strong>${log.event}</strong>
          <span class="${badgeClass}">${log.type}</span>
        </div>
        <div style="font-size:10.5px; color:var(--text-muted);">
          ${log.details} <span style="float:right;">${time}</span>
        </div>
      `;
      logsContainer.appendChild(div);
    });
  }

  evaluateHumanReviewFlag(u) {
    if (!u) return false;
    // Triage rules:
    // 1. User explicitly requests loan officer communication
    if (u.supportRequested) return true;
    // 2. User reports heavy cash cycle pressure
    if (u.readinessAnswers && u.readinessAnswers.pressure === "heavy") return true;
    // 3. User is asking for a large crop loan (> KES 30,000) with seasonal cycle
    if (u.requestedAmount > 30000 && u.incomeCycle === "seasonal") return true;
    
    return false;
  }

  // USSD Simulation State Machine
  handleUssdInput() {
    const inputEl = document.getElementById("ussd-user-input");
    const inputVal = inputEl.value.trim();
    inputEl.value = "";

    const screenText = document.getElementById("ussd-screen-text");

    if (this.state.ussdState === "start") {
      if (inputVal === "1") {
        this.state.lang = "en";
        this.state.ussdState = "phone";
        screenText.innerHTML = `SokoRada Onboarding\nEnter Mobile Phone Number (e.g. 0712345678):`;
      } else if (inputVal === "2") {
        this.state.lang = "sw";
        this.state.ussdState = "phone";
        screenText.innerHTML = `SokoRada Onboarding\nWeka Nambari ya Simu (k.m. 0712345678):`;
      } else {
        screenText.innerHTML = `Invalid Option / Chaguo Si Sahihi\n1. English\n2. Kiswahili`;
      }
      this.updateLanguageUI();
      return;
    }

    if (this.state.ussdState === "phone") {
      if (inputVal.length < 9) {
        screenText.innerHTML = this.state.lang === "en" 
          ? "Invalid Phone Number. Try again:" 
          : "Nambari ya Simu Si Sahihi. Jaribu tena:";
        return;
      }
      this.state.ussdData.phone = inputVal;
      this.state.ussdState = "occupation";
      screenText.innerHTML = this.state.lang === "en"
        ? `Select Occupation:\n1. Farmer\n2. Market Vendor`
        : `Chagua Kazi Yako:\n1. Mkulima\n2. Mfanyabiashara`;
      return;
    }

    if (this.state.ussdState === "occupation") {
      if (inputVal === "1" || inputVal === "2") {
        this.state.ussdData.occupation = inputVal === "1" ? "farmer" : "vendor";
        this.state.ussdState = "sacco";
        screenText.innerHTML = this.state.lang === "en"
          ? `Select SACCO:\n1. Ujima SACCO\n2. KWFT\n3. Stima SACCO\n4. Unaitas`
          : `Chagua SACCO:\n1. Ujima SACCO\n2. KWFT\n3. Stima SACCO\n4. Unaitas`;
      } else {
        screenText.innerHTML = "Invalid. Choose 1 or 2:";
      }
      return;
    }

    if (this.state.ussdState === "sacco") {
      const idx = parseInt(inputVal);
      if (idx >= 1 && idx <= 4) {
        const saccoIds = ["ujima", "kwft", "stima", "unaitas"];
        this.state.ussdData.saccoId = saccoIds[idx - 1];
        this.state.ussdState = "amount";
        screenText.innerHTML = this.state.lang === "en"
          ? `Enter Requested Loan Amount (KES):`
          : `Weka Kiasi Unachotaka (KES):`;
      } else {
        screenText.innerHTML = "Invalid. Choose 1 - 4:";
      }
      return;
    }

    if (this.state.ussdState === "amount") {
      const amount = parseFloat(inputVal);
      if (isNaN(amount) || amount <= 0) {
        screenText.innerHTML = this.state.lang === "en" ? "Invalid amount. Enter KES:" : "Kiasi Si Sahihi. Weka KES:";
        return;
      }
      this.state.ussdData.requestedAmount = amount;
      this.state.ussdState = "callback";
      screenText.innerHTML = this.state.lang === "en"
        ? `Request callback from SACCO officer?\n1. Yes\n2. No`
        : `Je, unataka afisa wa SACCO akupigie?\n1. Ndio\n2. Hapana`;
      return;
    }

    if (this.state.ussdState === "callback") {
      if (inputVal === "1" || inputVal === "2") {
        const reqCallback = inputVal === "1";
        
        // Sync registration back into active local storage database!
        const generatedUser = {
          id: "ussd_user_" + Date.now(),
          name: this.state.ussdData.occupation === "farmer" ? "USSD Farmer" : "USSD Vendor",
          phone: this.state.ussdData.phone,
          occupation: this.state.ussdData.occupation,
          location: "USSD Capture",
          requestedAmount: this.state.ussdData.requestedAmount,
          loanType: this.state.ussdData.occupation === "farmer" ? "farm_input" : "business_stock",
          incomeSource: this.state.ussdData.occupation === "farmer" ? "USSD Farming" : "USSD Retail",
          incomeCycle: this.state.ussdData.occupation === "farmer" ? "seasonal" : "daily",
          repaymentTiming: this.state.ussdData.occupation === "farmer" ? "seasonal" : "weekly",
          existingSavings: 0,
          saccoId: this.state.ussdData.saccoId,
          readinessAnswers: {
            confidence: "medium",
            purpose: "yes",
            easiest_months: this.state.ussdData.occupation === "farmer" ? "march_august" : "any",
            records: "no",
            pressure: "manageable",
            training_need: "budgeting"
          },
          trainingCompleted: [],
          supportRequested: reqCallback,
          supportCategory: reqCallback ? "repayment_schedule" : "",
          supportDetails: reqCallback ? "USSD queued callback request." : ""
        };

        this.state.activeUser = generatedUser;
        this.saveUser();
        
        // Sync app variables
        this.state.quizAnswers = { ...generatedUser.readinessAnswers };
        document.getElementById("active-user-badge").style.display = "flex";
        document.getElementById("active-user-name").innerText = generatedUser.name;
        document.getElementById("bottom-nav").style.display = "flex";

        this.logEvent("USSD Registration Synced", `Completed USSD registration for ${generatedUser.phone}. Target: ${generatedUser.saccoId}`, "consent");

        // Success screen
        screenText.innerHTML = this.state.lang === "en"
          ? `Thank you! SokoRada has generated your profile. An officer will call you back. Dial *384*4# to update.`
          : `Asante! SokoRada imekuundia wasifu. Afisa wa SACCO atakupigia simu hivi karibuni.`;

        // Switch main screen to dashboard to show sync worked
        this.router.navigate("dashboard");

        // Auto reset USSD terminal in 5 seconds
        setTimeout(() => {
          this.state.ussdState = "start";
          screenText.innerHTML = `SokoRada - Karibu/Welcome\n1. English\n2. Kiswahili`;
        }, 5000);

      } else {
        screenText.innerHTML = "Invalid. Choose 1 or 2:";
      }
    }
  }
}

// Global App instance
let app;
document.addEventListener("DOMContentLoaded", () => {
  app = new SokoRadaApp();
});
