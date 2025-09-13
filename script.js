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

// Login and Register Logic
document.getElementById("loginButton").addEventListener("click", () => {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        document.getElementById("loginSection").style.display = "none";
        document.getElementById("timeForm").style.display = "block";
        document.getElementById("reportSection").style.display = "block";
        document.getElementById("loginMessage").textContent = "Velkommen, " + user.name;
        loadCalendar();
        updateReport();
    } else {
        document.getElementById("loginMessage").textContent = "Forkert email eller adgangskode.";
    }
});

document.getElementById("registerButton").addEventListener("click", () => {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("registerForm").style.display = "block";
});

document.getElementById("submitRegister").addEventListener("click", () => {
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const name = document.getElementById("registerName").value;
    if (!email.endsWith("@geo.dk")) {
        document.getElementById("loginMessage").textContent = "Kun @geo.dk emails er tilladt.";
        return;
    }
    if (users.find(u => u.email === email)) {
        document.getElementById("loginMessage").textContent = "Email allerede i brug.";
        return;
    }
    users.push({ email, password, name });
    localStorage.setItem("users", JSON.stringify(users));
    console.log(`Ny bruger oprettet: ${name} (${email}) - Send email til rvk@geo.dk`);
    document.getElementById("loginMessage").textContent = "Bruger oprettet! Log ind nu.";
    document.getElementById("registerForm").style.display = "none";
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("registerEmail").value = "";
    document.getElementById("registerPassword").value = "";
    document.getElementById("registerName").value = "";
});

document.getElementById("cancelRegister").addEventListener("click", () => {
    document.getElementById("registerForm").style.display = "none";
    document.getElementById("loginForm").style.display = "block";
});

// Custom Project Input
document.getElementById("projekt").addEventListener("change", (e) => {
    const customInput = document.getElementById("customProjekt");
    if (e.target.value === "custom") {
        customInput.style.display = "block";
        customInput.required = true;
    } else {
        customInput.style.display = "none";
        customInput.required = false;
        customInput.value = "";
    }
});

// Time Registration Logic
document.getElementById("timeRegistrationForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const projekt = document.getElementById("projekt").value === "custom" ? document.getElementById("customProjekt").value : document.getElementById("projekt").value;
    const startTid = document.getElementById("startTid").value;
    const slutTid = document.getElementById("slutTid").value;
    const beskrivelse = document.getElementById("beskrivelse").value;
    const date = new Date().toISOString().split("T")[0];

    if (projekt && startTid && slutTid && beskrivelse && currentUser) {
        const registration = { date, projekt, startTid, slutTid, beskrivelse, user: currentUser.name, timestamp: new Date().toISOString() };
        registrations.push(registration);
        localStorage.setItem("registrations", JSON.stringify(registrations));

        // Clean expired data (3 months = 90 days)
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);
        registrations = registrations.filter(r => new Date(r.timestamp) > threeMonthsAgo);
        localStorage.setItem("registrations", JSON.stringify(registrations));

        document.getElementById("successMessage").textContent = "Tid registreret!";
        document.getElementById("successMessage").style.display = "block";
        setTimeout(() => {
            document.getElementById("successMessage").style.display = "none";
        }, 3000);

        document.getElementById("timeRegistrationForm").reset();
        document.getElementById("customProjekt").style.display = "none";
        loadCalendar();
        updateReport();
    }
});

// Calendar Logic
function loadCalendar() {
    const calendarEl = document.getElementById("calendar");
    if (calendarEl) {
        calendarEl.innerHTML = "";
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: "dayGridMonth",
            events: registrations.map(r => ({ title: r.projekt, date: r.date })),
            dayCellContent: (args) => {
                const reg = registrations.find(r => r.date === args.dateStr);
                let className = reg ? "green" : "red";
                if (args.isToday) className += " fc-day-today";
                return { html: `<span class="${className}">${args.dayNumberText}</span>` };
            },
            height: "auto"
        });
        calendar.render();
    }
}

// Report Logic
function updateReport() {
    const reportList = document.getElementById("reportList");
    if (reportList) {
        reportList.innerHTML = "";
        const activityTotals = {};
        registrations.forEach(r => {
            activityTotals[r.projekt] = (activityTotals[r.projekt] || 0) + 1;
        });
        for (let activity in activityTotals) {
            const li = document.createElement("li");
            li.textContent = `${activity}: ${activityTotals[activity]} registreringer`;
            reportList.appendChild(li);
        }
    }
}

// Initial Load
if (window.location.search.includes("autoLogin")) {
    currentUser = defaultUser;
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("timeForm").style.display = "block";
    document.getElementById("reportSection").style.display = "block";
    loadCalendar();
    updateReport();
}

// Load calendar and report on page load if logged in
if (currentUser) {
    loadCalendar();
    updateReport();
}