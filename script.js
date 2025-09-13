// Initial login data
const defaultUser = {
    email: "rvk@geo.dk",
    password: "Rene60137105!",
    name: "René Valentin Klausen (RVK)"
};
let currentUser = null;

// Load users and registrations from localStorage
let users = JSON.parse(localStorage.getItem("users")) || [defaultUser];
let registrations = JSON.parse(localStorage.getItem("registrations")) || [];

// Login Logic
document.getElementById("loginButton").addEventListener("click", () => {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const messageEl = document.getElementById("loginMessage");
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        document.getElementById("loginSection").style.display = "none";
        document.getElementById("mainContent").style.display = "block";
        messageEl.textContent = `Velkommen, ${user.name}!`;
        messageEl.className = "text-success";
        setTimeout(() => {
            loadCalendar();
            updateReport();
        }, 100); // Delay to ensure DOM is ready
    } else {
        messageEl.textContent = "Forkert email eller adgangskode.";
        messageEl.className = "error";
    }
});

// Register Logic
document.getElementById("registerButton").addEventListener("click", () => {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("registerForm").style.display = "block";
});

document.getElementById("submitRegister").addEventListener("click", () => {
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;
    const name = document.getElementById("registerName").value.trim();
    const messageEl = document.getElementById("loginMessage");
    if (!email.endsWith("@geo.dk")) {
        messageEl.textContent = "Kun @geo.dk emails er tilladt.";
        messageEl.className = "error";
        return;
    }
    if (users.find(u => u.email === email)) {
        messageEl.textContent = "Email allerede i brug.";
        messageEl.className = "error";
        return;
    }
    users.push({ email, password, name });
    localStorage.setItem("users", JSON.stringify(users));
    console.log(`Ny bruger: ${name} (${email}) - Notifikation til rvk@geo.dk`);
    messageEl.textContent = "Bruger oprettet! Log ind nu.";
    messageEl.className = "text-success";
    document.getElementById("registerForm").style.display = "none";
    document.getElementById("loginForm").style.display = "block";
    document.querySelectorAll("#registerForm input").forEach(input => input.value = "");
});

document.getElementById("cancelRegister").addEventListener("click", () => {
    document.getElementById("registerForm").style.display = "none";
    document.getElementById("loginForm").style.display = "block";
});

// Custom Activity
document.getElementById("projekt").addEventListener("change", (e) => {
    const customInput = document.getElementById("customProjekt");
    customInput.style.display = e.target.value === "custom" ? "block" : "none";
    customInput.required = e.target.value === "custom";
});

// Time Registration
document.getElementById("timeRegistrationForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const projekt = document.getElementById("projekt").value === "custom" ? document.getElementById("customProjekt").value.trim() : document.getElementById("projekt").value;
    const startTid = document.getElementById("startTid").value;
    const slutTid = document.getElementById("slutTid").value;
    const beskrivelse = document.getElementById("beskrivelse").value.trim();
    const date = new Date().toISOString().split("T")[0];

    if (projekt && startTid && slutTid && beskrivelse && currentUser) {
        const registration = { date, projekt, startTid, slutTid, beskrivelse, user: currentUser.name, timestamp: new Date().toISOString() };
        registrations.push(registration);
        localStorage.setItem("registrations", JSON.stringify(registrations));

        const threeMonthsAgo = new Date();
        threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);
        registrations = registrations.filter(r => new Date(r.timestamp) > threeMonthsAgo);
        localStorage.setItem("registrations", JSON.stringify(registrations));

        document.getElementById("successMessage").textContent = "Tid registreret succesfuldt!";
        document.getElementById("successMessage").style.display = "block";
        setTimeout(() => document.getElementById("successMessage").style.display = "none", 3000);

        document.getElementById("timeRegistrationForm").reset();
        document.getElementById("customProjekt").style.display = "none";
        loadCalendar();
        updateReport();
    }
});

// Kalender
function loadCalendar() {
    const calendarEl = document.getElementById("calendarDiv");
    if (calendarEl && typeof FullCalendar !== 'undefined') {
        calendarEl.innerHTML = "";
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: "dayGridMonth",
            events: registrations.map(r => ({ title: r.projekt, date: r.date })),
            dayCellContent: (args) => {
                const reg = registrations.find(r => r.date === args.dateStr);
                const className = reg ? "green" : "red";
                const todayClass = args.isToday ? " fc-day-today" : "";
                return { html: `<span class="${className}${todayClass}">${args.dayNumberText}</span>` };
            },
            height: "auto"
        });
        calendar.render();
    } else {
        console.error("FullCalendar not loaded or element not found");
    }
}

// Rapport
function updateReport() {
    const reportList = document.getElementById("reportList");
    if (reportList) {
        reportList.innerHTML = "";
        const activityTotals = {};
        registrations.forEach(r => {
            activityTotals[r.projekt] = (activityTotals[r.projekt] || 0) + 1;
        });
        Object.entries(activityTotals).forEach(([activity, count]) => {
            const li = document.createElement("li");
            li.className = "list-group-item";
            li.textContent = `${activity}: ${count} registreringer`;
            reportList.appendChild(li);
        });
    }
}

// Auto-login til test
if (window.location.search.includes("autoLogin")) {
    currentUser = defaultUser;
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("mainContent").style.display = "block";
    setTimeout(() => {
        loadCalendar();
        updateReport();
    }, 100);
}