/* =====================================================
   RENTTRACK - COMPLETE FRONTEND JAVASCRIPT
   ===================================================== */

const KEYS = {
    accounts: "rentTrackV2Accounts",
    tenants: "rentTrackV2Tenants",
    rooms: "rentTrackV2Rooms",
    currentUser: "rentTrackV2CurrentUser"
};

// =====================================================
// ADMIN LOGIN DETAILS
// Change the email and password below when needed.
// =====================================================
const ADMIN_ACCOUNT = {
    name: "Administrator",
    email: "gladysolabode@gmail.com",
    password: "gladys",
    role: "admin"
};

function readData(key) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
    } catch (error) {
        return [];
    }
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function setCurrentUser(user) {
    localStorage.setItem(KEYS.currentUser, JSON.stringify(user));
}

function getCurrentUser() {
    try {
        const raw = localStorage.getItem(KEYS.currentUser);
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        return null;
    }
}

function logout() {
    localStorage.removeItem(KEYS.currentUser);
    window.location.href = "index.html";
}

function formatMoney(amount) {
    return `₦${Number(amount || 0).toLocaleString()}`;
}

function formatDate(dateString) {
    if (!dateString) return "—";

    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("en-NG", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function todayString() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function daysUntil(dateString) {
    const today = new Date(`${todayString()}T00:00:00`);
    const target = new Date(`${dateString}T00:00:00`);
    return Math.ceil((target - today) / 86400000);
}

function getRentStatus(expiryDate) {
    const days = daysUntil(expiryDate);

    if (days < 0) return "Expired";
    if (days <= 7) return "Expiring Soon";
    return "Active";
}

function statusClass(status) {
    if (status === "Expired") return "expired";
    if (status === "Expiring Soon") return "warning";
    if (status === "Vacant") return "vacant";
    return "active";
}

function statusHTML(status) {
    return `<span class="status ${statusClass(status)}">${status}</span>`;
}

function seedData() {
    if (!localStorage.getItem(KEYS.rooms)) {
        saveData(KEYS.rooms, [
            { id: "room-101", number: "101", rent: 250000 },
            { id: "room-102", number: "102", rent: 250000 },
            { id: "room-103", number: "103", rent: 200000 },
            { id: "room-104", number: "104", rent: 300000 }
        ]);
    }

    if (!localStorage.getItem(KEYS.tenants)) {
        saveData(KEYS.tenants, [
            {
                id: "tenant-1",
                name: "John Doe",
                email: "john@example.com",
                phone: "08031234567",
                room: "101",
                rent: 250000,
                paymentDate: "2026-08-25",
                expiryDate: "2027-08-25"
            },
            {
                id: "tenant-2",
                name: "Sarah James",
                email: "sarah@example.com",
                phone: "08123456789",
                room: "102",
                rent: 250000,
                paymentDate: "2026-09-01",
                expiryDate: "2026-09-24"
            },
            {
                id: "tenant-3",
                name: "Michael Ade",
                email: "michael@example.com",
                phone: "09012345678",
                room: "104",
                rent: 300000,
                paymentDate: "2026-09-01",
                expiryDate: "2026-10-03"
            },
            {
                id: "tenant-4",
                name: "Mary Smith",
                email: "mary@example.com",
                phone: "07012345678",
                room: "103",
                rent: 200000,
                paymentDate: "2025-09-10",
                expiryDate: "2026-09-10"
            }
        ]);
    }

    if (!localStorage.getItem(KEYS.accounts)) {
        saveData(KEYS.accounts, []);
    }
}

function getRoomOccupants(roomNumber) {
    return readData(KEYS.tenants).filter(
        tenant => String(tenant.room) === String(roomNumber)
    );
}

function requireRole(role) {
    const user = getCurrentUser();

    if (!user || user.role !== role) {
        window.location.href = "index.html";
        return null;
    }

    return user;
}

seedData();

document.querySelectorAll(".logout-button").forEach(button => {
    button.addEventListener("click", logout);
});

/* =====================================================
   LOGIN
   ===================================================== */

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");
    const loginError = document.getElementById("loginError");

    loginForm.addEventListener("submit", event => {
        event.preventDefault();
        loginError.textContent = "";

        if (!loginForm.checkValidity()) {
            loginForm.reportValidity();
            return;
        }

        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;

        if (email === ADMIN_ACCOUNT.email && password === ADMIN_ACCOUNT.password) {
            setCurrentUser(ADMIN_ACCOUNT);
            window.location.href = "admin.html";
            return;
        }

        const accounts = readData(KEYS.accounts);
        const account = accounts.find(
            item =>
                item.email.toLowerCase() === email &&
                item.password === password
        );

        if (!account) {
            loginError.textContent = "Incorrect email or password.";
            return;
        }

        setCurrentUser(account);
        window.location.href = "tenant.html";
    });
}

const loginPassword = document.getElementById("loginPassword");
const toggleLoginPassword = document.getElementById("toggleLoginPassword");

if (loginPassword && toggleLoginPassword) {
    toggleLoginPassword.addEventListener("click", () => {
        const isPassword = loginPassword.type === "password";
        loginPassword.type = isPassword ? "text" : "password";
        toggleLoginPassword.textContent = isPassword ? "Hide" : "Show";
    });
}

/* =====================================================
   SIGN UP
   ===================================================== */

const signupForm = document.getElementById("signupForm");

if (signupForm) {
    const nameInput = document.getElementById("signupName");
    const emailInput = document.getElementById("signupEmail");
    const phoneInput = document.getElementById("signupPhone");
    const passwordInput = document.getElementById("signupPassword");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const phoneError = document.getElementById("phoneError");
    const passwordError = document.getElementById("passwordError");
    const togglePassword = document.getElementById("toggleSignupPassword");

    function checkPhone(showLengthMessage = true) {
        const value = phoneInput.value;

        if (value !== "" && !/^\d+$/.test(value)) {
            phoneError.textContent = "Please enter numbers only.";
            return false;
        }

        if (showLengthMessage && value !== "" && value.length !== 11) {
            phoneError.textContent = "Phone number must be 11 digits.";
            return false;
        }

        phoneError.textContent = "";
        return value.length === 11;
    }

    function checkPasswords() {
        const password = passwordInput.value;
        const confirm = confirmPasswordInput.value;

        passwordError.classList.remove("form-success");

        if (confirm === "") {
            passwordError.textContent = "";
            return false;
        }

        if (password !== confirm) {
            passwordError.textContent = "Passwords do not match.";
            return false;
        }

        passwordError.textContent = "Passwords match.";
        passwordError.classList.add("form-success");
        return true;
    }

    phoneInput.addEventListener("input", () => {
        checkPhone(false);
    });

    phoneInput.addEventListener("blur", () => {
        checkPhone(true);
    });

    passwordInput.addEventListener("input", checkPasswords);
    confirmPasswordInput.addEventListener("input", checkPasswords);

    togglePassword.addEventListener("click", () => {
        const isPassword = passwordInput.type === "password";
        passwordInput.type = isPassword ? "text" : "password";
        togglePassword.textContent = isPassword ? "Hide" : "Show";
    });

    signupForm.addEventListener("submit", event => {
        event.preventDefault();

        if (!signupForm.checkValidity()) {
            signupForm.reportValidity();
            return;
        }

        const phoneValid = checkPhone(true);
        const passwordValid = checkPasswords();

        if (!phoneValid || !passwordValid) {
            return;
        }

        const email = emailInput.value.trim().toLowerCase();
        const accounts = readData(KEYS.accounts);

        if (email === ADMIN_ACCOUNT.email) {
            alert("That email is reserved for the administrator.");
            return;
        }

        if (accounts.some(account => account.email.toLowerCase() === email)) {
            alert("An account with this email already exists.");
            return;
        }

        accounts.push({
            id: `account-${Date.now()}`,
            name: nameInput.value.trim(),
            email,
            phone: phoneInput.value.trim(),
            password: passwordInput.value,
            role: "tenant"
        });

        saveData(KEYS.accounts, accounts);

        alert("Account created successfully. You can now log in.");
        window.location.href = "index.html";
    });
}

/* =====================================================
   ADMIN DASHBOARD
   ===================================================== */

if (document.getElementById("totalRooms")) {
    if (requireRole("admin")) {
        const rooms = readData(KEYS.rooms);
        const tenants = readData(KEYS.tenants);

        const occupiedRooms = rooms.filter(room =>
            getRoomOccupants(room.number).length > 0
        ).length;

        document.getElementById("totalRooms").textContent = rooms.length;
        document.getElementById("occupiedRooms").textContent = occupiedRooms;
        document.getElementById("vacantRooms").textContent = rooms.length - occupiedRooms;
        document.getElementById("activeTenants").textContent =
            tenants.filter(t => getRentStatus(t.expiryDate) !== "Expired").length;

        const reminders = document.getElementById("rentReminders");

        const expiring = tenants
            .map(tenant => ({
                tenant,
                status: getRentStatus(tenant.expiryDate),
                days: daysUntil(tenant.expiryDate)
            }))
            .filter(item => item.status !== "Active")
            .sort((a, b) => a.days - b.days);

        if (!expiring.length) {
            reminders.innerHTML = `
                <div class="reminder-item">
                    <strong>No rent reminders right now.</strong>
                    <span>All current rent records are active.</span>
                </div>
            `;
        } else {
            reminders.innerHTML = expiring.map(item => {
                let message;

                if (item.status === "Expired") {
                    message = `${item.tenant.name}'s rent expired ${Math.abs(item.days)} day(s) ago.`;
                } else if (item.days === 0) {
                    message = `${item.tenant.name}'s rent expires today.`;
                } else {
                    message = `${item.tenant.name}'s rent expires in ${item.days} day(s).`;
                }

                return `
                    <div class="reminder-item ${statusClass(item.status)}">
                        <strong>${item.tenant.name} — Room ${item.tenant.room}</strong>
                        <span>${message} Expiry date: ${formatDate(item.tenant.expiryDate)}.</span>
                    </div>
                `;
            }).join("");
        }

        const recentPayments = document.querySelector("#recentPaymentsTable tbody");

        const recent = [...tenants]
            .sort((a, b) => b.paymentDate.localeCompare(a.paymentDate))
            .slice(0, 5);

        recentPayments.innerHTML = recent.length
            ? recent.map(tenant => `
                <tr>
                    <td>${tenant.name}</td>
                    <td>${tenant.room}</td>
                    <td>${formatMoney(tenant.rent)}</td>
                    <td>${formatDate(tenant.paymentDate)}</td>
                    <td>${formatDate(tenant.expiryDate)}</td>
                    <td>${statusHTML(getRentStatus(tenant.expiryDate))}</td>
                </tr>
            `).join("")
            : `<tr><td colspan="6">No payment records.</td></tr>`;
    }
}

/* =====================================================
   TENANTS PAGE
   ===================================================== */

const tenantTable = document.getElementById("tenantTable");

if (tenantTable) {
    if (requireRole("admin")) {
        const tenantSearch = document.getElementById("tenantSearch");
        const tenantModal = document.getElementById("tenantModal");
        const viewTenantModal = document.getElementById("viewTenantModal");
        const editTenantModal = document.getElementById("editTenantModal");
        const tenantForm = document.getElementById("tenantForm");
        const editTenantForm = document.getElementById("editTenantForm");
        const tenantFormError = document.getElementById("tenantFormError");
        const editTenantFormError = document.getElementById("editTenantFormError");
        const deleteTenantButton = document.getElementById("deleteTenantButton");
        const editTenantButton = document.getElementById("editTenantButton");
        let selectedTenantId = null;

        function renderTenants(searchTerm = "") {
            const tenants = readData(KEYS.tenants);
            const search = searchTerm.trim().toLowerCase();

            const filtered = tenants.filter(tenant => {
                const text = `${tenant.name} ${tenant.email} ${tenant.phone} ${tenant.room}`.toLowerCase();
                return text.includes(search);
            });

            tenantTable.querySelector("tbody").innerHTML = filtered.map(tenant => `
                <tr>
                    <td>${tenant.name}</td>
                    <td>${tenant.room}</td>
                    <td>${tenant.phone}</td>
                    <td>${formatMoney(tenant.rent)}</td>
                    <td>${formatDate(tenant.paymentDate)}</td>
                    <td>${formatDate(tenant.expiryDate)}</td>
                    <td>${statusHTML(getRentStatus(tenant.expiryDate))}</td>
                    <td>
                        <button type="button" class="view-button" data-id="${tenant.id}">View</button>
                    </td>
                </tr>
            `).join("") || `
                <tr><td colspan="8">No tenants found.</td></tr>
            `;

            const count = document.getElementById("tenantSearchCount");
            if (count) {
                count.textContent = `${filtered.length} tenant${filtered.length === 1 ? "" : "s"} found`;
            }
        }

        function fillTenantView(tenant) {
            document.getElementById("viewTenantName").textContent = tenant.name;
            document.getElementById("viewTenantEmail").textContent = tenant.email;
            document.getElementById("viewTenantPhone").textContent = tenant.phone;
            document.getElementById("viewTenantRoom").textContent = tenant.room;
            document.getElementById("viewTenantRent").textContent = formatMoney(tenant.rent);
            document.getElementById("viewTenantPaymentDate").textContent = formatDate(tenant.paymentDate);
            document.getElementById("viewTenantExpiryDate").textContent = formatDate(tenant.expiryDate);
            document.getElementById("viewTenantStatus").innerHTML = statusHTML(
                getRentStatus(tenant.expiryDate)
            );
        }

        function openEditTenant(tenant) {
            document.getElementById("editTenantName").value = tenant.name;
            document.getElementById("editTenantEmail").value = tenant.email;
            document.getElementById("editTenantPhone").value = tenant.phone;
            document.getElementById("editTenantRoom").value = tenant.room;
            document.getElementById("editTenantRent").value = tenant.rent;
            document.getElementById("editTenantPaymentDate").value = tenant.paymentDate;
            document.getElementById("editTenantExpiryDate").value = tenant.expiryDate;
            editTenantFormError.textContent = "";
            editTenantModal.style.display = "flex";
        }

        renderTenants();

        tenantSearch.addEventListener("input", () => {
            renderTenants(tenantSearch.value);
        });

        document.getElementById("addTenantButton").addEventListener("click", () => {
            tenantForm.reset();
            tenantFormError.textContent = "";
            tenantModal.style.display = "flex";
        });

        document.getElementById("closeTenantModal").addEventListener("click", () => {
            tenantModal.style.display = "none";
        });

        document.getElementById("closeViewTenantModal").addEventListener("click", () => {
            viewTenantModal.style.display = "none";
        });

        document.getElementById("closeEditTenantModal").addEventListener("click", () => {
            editTenantModal.style.display = "none";
        });

        tenantTable.addEventListener("click", event => {
            const button = event.target.closest(".view-button");
            if (!button) return;

            const tenant = readData(KEYS.tenants).find(
                item => item.id === button.dataset.id
            );

            if (!tenant) return;

            selectedTenantId = tenant.id;
            fillTenantView(tenant);
            viewTenantModal.style.display = "flex";
        });

        if (editTenantButton) {
            editTenantButton.addEventListener("click", () => {
                if (!selectedTenantId) return;

                const tenant = readData(KEYS.tenants).find(
                    item => item.id === selectedTenantId
                );

                if (!tenant) return;

                openEditTenant(tenant);
            });
        }

        if (deleteTenantButton) {
            deleteTenantButton.addEventListener("click", () => {
                if (!selectedTenantId) return;

                const tenants = readData(KEYS.tenants);
                const tenant = tenants.find(item => item.id === selectedTenantId);

                if (!tenant) {
                    viewTenantModal.style.display = "none";
                    return;
                }

                const confirmed = window.confirm(
                    `Delete ${tenant.name} from the hostel records?\n\n` +
                    `This will also remove the tenant's login account, if one exists.`
                );

                if (!confirmed) return;

                const updatedTenants = tenants.filter(
                    item => item.id !== selectedTenantId
                );

                saveData(KEYS.tenants, updatedTenants);

                const accounts = readData(KEYS.accounts);
                const updatedAccounts = accounts.filter(
                    account => account.email.toLowerCase() !== tenant.email.toLowerCase()
                );

                saveData(KEYS.accounts, updatedAccounts);

                selectedTenantId = null;
                viewTenantModal.style.display = "none";
                editTenantModal.style.display = "none";
                renderTenants(tenantSearch.value);

                alert(`${tenant.name} has been removed from RentTrack.`);
            });
        }

        tenantForm.addEventListener("submit", event => {
            event.preventDefault();
            tenantFormError.textContent = "";

            if (!tenantForm.checkValidity()) {
                tenantForm.reportValidity();
                return;
            }

            const phone = document.getElementById("tenantPhone").value.trim();
            if (!/^\d{11}$/.test(phone)) {
                tenantFormError.textContent = "Phone number must be exactly 11 digits.";
                return;
            }

            const email = document.getElementById("tenantEmail").value.trim().toLowerCase();
            const room = document.getElementById("tenantRoom").value.trim();
            const rooms = readData(KEYS.rooms);

            if (!rooms.some(item => String(item.number) === String(room))) {
                tenantFormError.textContent = "That room does not exist. Add the room first.";
                return;
            }

            const tenants = readData(KEYS.tenants);

            if (tenants.some(item => item.email.toLowerCase() === email)) {
                tenantFormError.textContent = "A tenant with that email already exists.";
                return;
            }

            const paymentDate = document.getElementById("tenantPaymentDate").value;
            const expiryDate = document.getElementById("tenantExpiryDate").value;

            if (expiryDate < paymentDate) {
                tenantFormError.textContent = "Expiry date cannot be before payment date.";
                return;
            }

            tenants.push({
                id: `tenant-${Date.now()}`,
                name: document.getElementById("tenantName").value.trim(),
                email,
                phone,
                room,
                rent: Number(document.getElementById("tenantRent").value),
                paymentDate,
                expiryDate
            });

            saveData(KEYS.tenants, tenants);
            renderTenants(tenantSearch.value);
            tenantModal.style.display = "none";
            tenantForm.reset();
        });

        editTenantForm.addEventListener("submit", event => {
            event.preventDefault();
            editTenantFormError.textContent = "";

            if (!editTenantForm.checkValidity()) {
                editTenantForm.reportValidity();
                return;
            }

            if (!selectedTenantId) {
                editTenantFormError.textContent = "No tenant selected.";
                return;
            }

            const tenants = readData(KEYS.tenants);
            const tenantIndex = tenants.findIndex(
                item => item.id === selectedTenantId
            );

            if (tenantIndex === -1) {
                editTenantFormError.textContent = "Tenant record not found.";
                return;
            }

            const oldTenant = { ...tenants[tenantIndex] };

            const name = document.getElementById("editTenantName").value.trim();
            const email = document.getElementById("editTenantEmail").value.trim().toLowerCase();
            const phone = document.getElementById("editTenantPhone").value.trim();
            const room = document.getElementById("editTenantRoom").value.trim();
            const rent = Number(document.getElementById("editTenantRent").value);
            const paymentDate = document.getElementById("editTenantPaymentDate").value;
            const expiryDate = document.getElementById("editTenantExpiryDate").value;

            if (!/^\d{11}$/.test(phone)) {
                editTenantFormError.textContent = "Phone number must be exactly 11 digits.";
                return;
            }

            const rooms = readData(KEYS.rooms);
            if (!rooms.some(item => String(item.number) === String(room))) {
                editTenantFormError.textContent = "That room does not exist. Add the room first.";
                return;
            }

            const duplicateEmail = tenants.some(
                (item, index) =>
                    index !== tenantIndex &&
                    item.email.toLowerCase() === email
            );

            if (duplicateEmail) {
                editTenantFormError.textContent = "Another tenant is already using that email address.";
                return;
            }

            if (expiryDate < paymentDate) {
                editTenantFormError.textContent = "Expiry date cannot be before payment date.";
                return;
            }

            tenants[tenantIndex] = {
                ...oldTenant,
                name,
                email,
                phone,
                room,
                rent,
                paymentDate,
                expiryDate
            };

            saveData(KEYS.tenants, tenants);

            // Keep the tenant's login account synchronized with edited contact details.
            const accounts = readData(KEYS.accounts);
            const accountIndex = accounts.findIndex(
                account => account.email.toLowerCase() === oldTenant.email.toLowerCase()
            );

            if (accountIndex !== -1) {
                accounts[accountIndex] = {
                    ...accounts[accountIndex],
                    name,
                    email,
                    phone
                };
                saveData(KEYS.accounts, accounts);
            }

            const updatedTenant = tenants[tenantIndex];
            fillTenantView(updatedTenant);
            editTenantModal.style.display = "none";
            viewTenantModal.style.display = "flex";
            renderTenants(tenantSearch.value);

            alert(`${name}'s details have been updated.`);
        });
    }
}

/* =====================================================
   ROOMS PAGE
   ===================================================== */

const roomTable = document.getElementById("roomTable");

if (roomTable) {
    if (requireRole("admin")) {
        const roomSearch = document.getElementById("roomSearch");
        const roomModal = document.getElementById("roomModal");
        const viewRoomModal = document.getElementById("viewRoomModal");
        const roomForm = document.getElementById("roomForm");
        const roomFormError = document.getElementById("roomFormError");

        function renderRooms(searchTerm = "") {
            const rooms = readData(KEYS.rooms);
            const search = searchTerm.trim().toLowerCase();

            const filtered = rooms.filter(room =>
                String(room.number).toLowerCase().includes(search)
            );

            roomTable.querySelector("tbody").innerHTML = filtered.map(room => {
                const occupants = getRoomOccupants(room.number).length;
                const status = occupants > 0 ? "Occupied" : "Vacant";

                return `
                    <tr>
                        <td>${room.number}</td>
                        <td>${occupants}</td>
                        <td>${formatMoney(room.rent)}</td>
                        <td>${statusHTML(status)}</td>
                        <td>
                            <button type="button" class="view-button view-room-button" data-id="${room.id}">
                                View
                            </button>
                        </td>
                    </tr>
                `;
            }).join("") || `
                <tr><td colspan="5">No rooms found.</td></tr>
            `;

            const count = document.getElementById("roomSearchCount");
            if (count) {
                count.textContent = `${filtered.length} room${filtered.length === 1 ? "" : "s"} found`;
            }
        }

        renderRooms();

        roomSearch.addEventListener("input", () => {
            renderRooms(roomSearch.value);
        });

        document.getElementById("addRoomButton").addEventListener("click", () => {
            roomForm.reset();
            roomFormError.textContent = "";
            roomModal.style.display = "flex";
        });

        document.getElementById("closeRoomModal").addEventListener("click", () => {
            roomModal.style.display = "none";
        });

        document.getElementById("closeViewRoomModal").addEventListener("click", () => {
            viewRoomModal.style.display = "none";
        });

        roomTable.addEventListener("click", event => {
            const button = event.target.closest(".view-room-button");
            if (!button) return;

            const room = readData(KEYS.rooms).find(
                item => item.id === button.dataset.id
            );

            if (!room) return;

            const occupants = getRoomOccupants(room.number);
            const status = occupants.length > 0 ? "Occupied" : "Vacant";

            document.getElementById("viewRoomNumber").textContent = room.number;
            document.getElementById("viewRoomOccupants").textContent = occupants.length;
            document.getElementById("viewRoomRent").textContent = formatMoney(room.rent);
            document.getElementById("viewRoomStatus").innerHTML = statusHTML(status);

            const occupantList = document.getElementById("roomOccupantList");

            if (occupants.length === 0) {
                occupantList.innerHTML = `
                    <div class="empty-occupants">
                        This room is currently vacant. There are no occupants assigned to it.
                    </div>
                `;
            } else {
                occupantList.innerHTML = occupants.map(tenant => `
                    <div class="occupant-card">
                        <h4>${tenant.name}</h4>
                        <p><strong>Phone:</strong> ${tenant.phone}</p>
                        <p><strong>Email:</strong> ${tenant.email}</p>
                        <p><strong>Rent:</strong> ${formatMoney(tenant.rent)}</p>
                        <p><strong>Payment Date:</strong> ${formatDate(tenant.paymentDate)}</p>
                        <p><strong>Rent Expires:</strong> ${formatDate(tenant.expiryDate)}</p>
                        <div class="occupant-status">
                            ${statusHTML(getRentStatus(tenant.expiryDate))}
                        </div>
                    </div>
                `).join("");
            }

            viewRoomModal.style.display = "flex";
        });

        roomForm.addEventListener("submit", event => {
            event.preventDefault();
            roomFormError.textContent = "";

            if (!roomForm.checkValidity()) {
                roomForm.reportValidity();
                return;
            }

            const number = document.getElementById("roomNumber").value.trim();
            const rent = Number(document.getElementById("roomRent").value);
            const rooms = readData(KEYS.rooms);

            if (rooms.some(room => String(room.number) === String(number))) {
                roomFormError.textContent = "That room number already exists.";
                return;
            }

            rooms.push({
                id: `room-${Date.now()}`,
                number,
                rent
            });

            saveData(KEYS.rooms, rooms);
            renderRooms(roomSearch.value);
            roomModal.style.display = "none";
            roomForm.reset();
        });
    }
}

/* =====================================================
   TENANT DASHBOARD
   ===================================================== */

const myRoomElement = document.getElementById("myRoom");

if (myRoomElement) {
    const user = requireRole("tenant");

    if (user) {
        const accounts = readData(KEYS.accounts);
        const account = accounts.find(item => item.id === user.id);
        const tenant = account
            ? readData(KEYS.tenants).find(
                item => item.email.toLowerCase() === account.email.toLowerCase()
            )
            : null;

        const name = account ? account.name : "Tenant";

        document.getElementById("tenantWelcome").textContent = `Welcome, ${name}`;
        document.getElementById("tenantProfileName").textContent = name;
        document.getElementById("tenantProfileLetter").textContent = name.charAt(0).toUpperCase();

        if (!tenant) {
            document.getElementById("tenantRentContent").classList.add("hidden");
            document.getElementById("tenantNoRecord").classList.remove("hidden");
        } else {
            const status = getRentStatus(tenant.expiryDate);
            const statusBox = document.getElementById("myStatusBox");

            document.getElementById("myRoom").textContent = tenant.room;
            document.getElementById("myRent").textContent = formatMoney(tenant.rent);
            document.getElementById("myPaymentDate").textContent = formatDate(tenant.paymentDate);
            document.getElementById("myExpiryDate").textContent = formatDate(tenant.expiryDate);

            statusBox.className = `tenant-status-box ${statusClass(status)}`;

            let message;

            if (status === "Expired") {
                message = `Your rent expired on ${formatDate(tenant.expiryDate)}.`;
            } else if (status === "Expiring Soon") {
                const days = daysUntil(tenant.expiryDate);
                message = days === 0
                    ? "Your rent expires today."
                    : `Your rent expires in ${days} day(s).`;
            } else {
                message = `Your rent is active until ${formatDate(tenant.expiryDate)}.`;
            }

            statusBox.innerHTML = `
                <h3>${status}</h3>
                <p>${message}</p>
            `;
        }
    }
}

/* =====================================================
   TENANT ACCOUNT DELETION
   ===================================================== */

const deleteAccountButton = document.getElementById("deleteAccountButton");

if (deleteAccountButton) {
    const user = requireRole("tenant");

    if (user) {
        deleteAccountButton.addEventListener("click", () => {
            const accounts = readData(KEYS.accounts);
            const account = accounts.find(item => item.id === user.id);

            if (!account) {
                alert("Your account could not be found.");
                logout();
                return;
            }

            const confirmed = window.confirm(
                "Delete your RentTrack account?\n\n" +
                "This will remove your login account and your current tenant record. This action cannot be undone."
            );

            if (!confirmed) return;

            const updatedAccounts = accounts.filter(
                item => item.id !== account.id
            );

            saveData(KEYS.accounts, updatedAccounts);

            const tenants = readData(KEYS.tenants);
            const updatedTenants = tenants.filter(
                tenant => tenant.email.toLowerCase() !== account.email.toLowerCase()
            );

            saveData(KEYS.tenants, updatedTenants);

            localStorage.removeItem(KEYS.currentUser);

            alert("Your account has been deleted.");
            window.location.href = "index.html";
        });
    }
}

/* =====================================================
   CLOSE MODALS BY CLICKING OUTSIDE
   ===================================================== */

window.addEventListener("click", event => {
    const modalIds = [
        "tenantModal",
        "viewTenantModal",
        "roomModal",
        "viewRoomModal"
    ];

    modalIds.forEach(id => {
        const modal = document.getElementById(id);
        if (modal && event.target === modal) {
            modal.style.display = "none";
        }
    });
});
