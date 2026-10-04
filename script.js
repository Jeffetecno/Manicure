const form = document.getElementById("formAgendamento");

const dateInput = document.getElementById("date");
const timeSelect = document.getElementById("time");
const serviceSelect = document.getElementById("service");
const servicePricesMessage = document.getElementById("servicePricesMessage");

let supabaseClient = null;
let supabaseSetupMessage = "Configure a URL e a chave pública do Supabase para conectar o site.";

if (window.supabaseConfig
    && window.supabaseConfig.url
    && !window.supabaseConfig.url.includes("SEU_PROJETO")
    && window.supabaseConfig.anonKey
    && !window.supabaseConfig.anonKey.startsWith("SUA_")) {
    try {
        supabaseClient = window.supabase.createClient(
            window.supabaseConfig.url,
            window.supabaseConfig.anonKey
        );
    } catch (error) {
        supabaseSetupMessage = "Não foi possível iniciar o Supabase. Verifique a configuração.";
        console.error(supabaseSetupMessage, error);
    }
}

const defaultServices = [
    { name: "Manicure Tradicional", price: 40 },
    { name: "Pedicure Tradicional", price: 45 },
    { name: "Esmaltação em Gel (mãos)", price: 75 },
    { name: "Esmaltação em Gel (pés)", price: 75 },
    { name: "Alongamento em SoftGel", price: 180 },
    { name: "Manutenção Alongamento", price: 130 },
    { name: "Esmaltação bio adesiva", price: 75 },
    { name: "Spa dos Pés + Hidratação", price: 90 }
];

let servicePrices = defaultServices.map(service => ({ ...service }));

function formatPrice(price) {
    return Number(price).toFixed(2).replace(".", ",");
}

function renderServices() {
    serviceSelect.innerHTML = '<option value="">Selecione um serviço...</option>';

    servicePrices.forEach(service => {
        const option = document.createElement("option");
        option.value = `${service.name} - R$ ${formatPrice(service.price)}`;
        option.textContent = `${service.name} - R$ ${formatPrice(service.price)}`;
        serviceSelect.appendChild(option);
    });
}

renderServices();

async function loadServicePrices() {
    if (!supabaseClient) {
        servicePricesMessage.textContent = supabaseSetupMessage;
        servicePricesMessage.hidden = false;
        return;
    }

    const { data, error } = await supabaseClient
        .from("site_settings")
        .select("services")
        .eq("id", "service_prices")
        .maybeSingle();

    if (error) {
        servicePricesMessage.textContent = "Não foi possível carregar os preços. Tente novamente mais tarde.";
        servicePricesMessage.hidden = false;
        console.error("Falha ao carregar preços do Supabase.", error);
        return;
    }

    if (data) {
        if (!Array.isArray(data.services)
            || data.services.length !== defaultServices.length
            || data.services.some((service, index) =>
                !service
                || service.name !== defaultServices[index].name
                || !Number.isFinite(service.price)
                || service.price < 0)) {
            servicePricesMessage.textContent = "Os preços salvos no banco estão inválidos. Avise a administração.";
            servicePricesMessage.hidden = false;
            return;
        }

        servicePrices = data.services.map(service => ({ ...service }));
    }

    servicePricesMessage.hidden = true;
    renderServices();
}

loadServicePrices().catch(error => {
    servicePricesMessage.textContent = "Não foi possível carregar os preços. Tente novamente mais tarde.";
    servicePricesMessage.hidden = false;
    console.error("Falha inesperada ao carregar preços do Supabase.", error);
});

// ============================
// 🗓️ CALENDÁRIO PROFISSIONAL
// ============================
flatpickr("#date", {
    dateFormat: "d/m/Y",
    minDate: "today",

    disable: [
        function(date) {
            // domingo = 0 | segunda = 1
            return (date.getDay() === 0 || date.getDay() === 1);
        }
    ],

    locale: {
        firstDayOfWeek: 1
    }
});

// ============================
// ⏰ HORÁRIOS PROFISSIONAIS
// ============================
const horarios = [];

for (let h = 9; h <= 19; h++) {

    const hora = h.toString().padStart(2, "0");

    horarios.push(`${hora}:00`);

    if (h !== 19) {
        horarios.push(`${hora}:30`);
    }
}

// Preenche select de horários
horarios.forEach(h => {
    timeSelect.innerHTML += `<option value="${h}">${h}</option>`;
});

// ============================
// 🔐 PAINEL ADMINISTRATIVO
// ============================
const adminMenuBtn = document.getElementById("adminMenuBtn");
const adminModal = document.getElementById("adminModal");
const adminCloseBtn = document.getElementById("adminCloseBtn");
const adminLoginForm = document.getElementById("adminLoginForm");
const adminLoginView = document.getElementById("adminLoginView");
const adminPricesView = document.getElementById("adminPricesView");
const adminPricesForm = document.getElementById("adminPricesForm");
const adminPricesList = document.getElementById("adminPricesList");
const adminLoginMessage = document.getElementById("adminLoginMessage");
const adminPricesMessage = document.getElementById("adminPricesMessage");
const adminLogoutBtn = document.getElementById("adminLogoutBtn");

let adminLoggedIn = false;

function showAdminView(view) {
    adminLoginView.hidden = view !== "login";
    adminPricesView.hidden = view !== "prices";
}

function openAdminModal() {
    adminModal.hidden = false;
    adminMenuBtn.setAttribute("aria-expanded", "true");
    showAdminView(adminLoggedIn ? "prices" : "login");
}

function closeAdminModal() {
    adminModal.hidden = true;
    adminMenuBtn.setAttribute("aria-expanded", "false");
}

function renderAdminPrices() {
    adminPricesList.innerHTML = "";

    servicePrices.forEach((service, index) => {
        const row = document.createElement("div");
        row.className = "admin-price-row";

        const label = document.createElement("label");
        label.setAttribute("for", `admin-price-${index}`);
        label.textContent = service.name;

        const input = document.createElement("input");
        input.id = `admin-price-${index}`;
        input.name = `price-${index}`;
        input.type = "number";
        input.min = "0";
        input.step = "0.01";
        input.value = service.price.toFixed(2);
        input.required = true;

        row.append(label, input);
        adminPricesList.appendChild(row);
    });
}

adminMenuBtn.addEventListener("click", () => {
    if (adminModal.hidden) {
        openAdminModal();
        return;
    }

    closeAdminModal();
});

adminCloseBtn.addEventListener("click", closeAdminModal);

adminModal.addEventListener("click", event => {
    if (event.target === adminModal) {
        closeAdminModal();
    }
});

adminLoginForm.addEventListener("submit", async event => {
    event.preventDefault();

    const email = document.getElementById("adminUser").value.trim();
    const password = document.getElementById("adminPassword").value;

    if (!supabaseClient) {
        adminLoginMessage.textContent = supabaseSetupMessage;
        return;
    }

    try {
        const { error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;

        adminLoginMessage.textContent = "";
        adminLoginForm.reset();
        renderAdminPrices();
        showAdminView("prices");
    } catch (error) {
        adminLoginMessage.textContent = "Não foi possível entrar. Confira o e-mail e a senha.";
        console.error("Falha no login administrativo do Supabase.", error);
    }
});

adminPricesForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (!supabaseClient) {
        adminPricesMessage.textContent = "Entre novamente para salvar os preços.";
        return;
    }

    const newPrices = servicePrices.map((service, index) => {
        const input = document.getElementById(`admin-price-${index}`);
        return { name: service.name, price: Number(input.value) };
    });

    if (newPrices.some(service => !Number.isFinite(service.price) || service.price < 0)) {
        adminPricesMessage.textContent = "Informe valores válidos para todos os serviços.";
        return;
    }

    try {
        const { error } = await supabaseClient
            .from("site_settings")
            .upsert({
                id: "service_prices",
                services: newPrices
            }, {
                onConflict: "id"
            });

        if (error) throw error;

        servicePrices = newPrices;
        renderServices();
        adminPricesMessage.textContent = "Valores atualizados com sucesso.";
        closeAdminModal();
    } catch (error) {
        adminPricesMessage.textContent = "Não foi possível salvar. Verifique a conexão e as políticas do Supabase.";
        console.error("Falha ao salvar preços no Supabase.", error);
    }
});

adminLogoutBtn.addEventListener("click", async () => {
    if (supabaseClient) {
        const { error } = await supabaseClient.auth.signOut();
        if (error) {
            adminPricesMessage.textContent = "Não foi possível encerrar a sessão.";
            console.error("Falha ao sair da conta administrativa do Supabase.", error);
            return;
        }
    }

    adminLoggedIn = false;
    showAdminView("login");
    closeAdminModal();
});

if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange((_event, session) => {
        adminLoggedIn = Boolean(session);
        if (adminLoggedIn && !adminModal.hidden) {
            renderAdminPrices();
            showAdminView("prices");
        } else if (!adminLoggedIn) {
            showAdminView("login");
        }
    });
} else {
    adminLoginMessage.textContent = supabaseSetupMessage;
}

const installAppBtn = document.getElementById("installAppBtn");
let deferredPrompt = null;

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js")
            .catch(error => console.warn("Service worker não pôde ser registrado:", error));
    });
}

window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredPrompt = event;

    if (installAppBtn) {
        installAppBtn.hidden = false;
    }
});

if (installAppBtn) {
    installAppBtn.addEventListener("click", async () => {
        if (!deferredPrompt) {
            alert("Seu navegador não permitiu a instalação agora. Tente novamente em alguns instantes.");
            return;
        }

        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
        installAppBtn.hidden = true;
    });
}

window.addEventListener("appinstalled", () => {
    if (installAppBtn) {
        installAppBtn.hidden = true;
    }
});

// ============================
// 🚫 ENVIO PARA WHATSAPP
// ============================
form.addEventListener("submit", async function(e) {
    e.preventDefault();

    const nome = document.getElementById("name").value.trim();
    const service = serviceSelect.options[serviceSelect.selectedIndex].text;
    const date = dateInput.value;
    const time = timeSelect.value;

    if (!nome || !date || !time || !serviceSelect.value) {
        alert("Preencha todos os campos.");
        return;
    }

    if (!supabaseClient) {
        alert(supabaseSetupMessage);
        return;
    }

    const dateParts = date.split("/");
    if (dateParts.length !== 3) {
        alert("A data selecionada é inválida. Escolha a data novamente.");
        return;
    }

    const dateKey = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    let bookingError;

    try {
        const { error } = await supabaseClient
            .from("bookings")
            .insert({
                customer_name: nome,
                service,
                appointment_date: dateKey,
                appointment_time: time
            });
        bookingError = error;
    } catch (error) {
        bookingError = error;
    }

    if (bookingError) {
        console.error("Não foi possível salvar o agendamento no Supabase.", bookingError);
        if (bookingError.code === "23505") {
            alert("Esse horário já foi reservado. Escolha outro horário.");
        } else {
            alert("Não foi possível salvar o agendamento. Verifique a conexão e tente novamente.");
        }
        return;
    }

    const mensagem = `Olá Jaine! Meu nome é ${nome}.

Gostaria de agendar um horário:

📌 Serviço: ${service}
📅 Data: ${date}
⏰ Horário: ${time}`;

    const phone = "555499562683";

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(mensagem)}`;

    window.location.href = url;
});
