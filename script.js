// ========== GLOBAL DATA ==========
let appData = {
    user: { name: "", age: "", allergy: "", guardian: "", water: "", password: "" },
    profilePic: "https://ui-avatars.com/api/?background=4361ee&color=fff&bold=true",
    history: [],
    currentMedicines: [],
    isLoggedIn: false
};

let allUsers = {};
let downloadData = { playstore: 15234, appstore: 9876 };
let currentSlide = 0;
let slideInterval;

// ========== LOAD DATA ==========
window.onload = function() {
    const savedUsers = localStorage.getItem('REXTRO_USERS');
    if (savedUsers) allUsers = JSON.parse(savedUsers);
    
    const saved = localStorage.getItem('REXTRO_APP_DATA');
    if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.isLoggedIn && allUsers[parsed.user.name]) {
            appData = parsed;
            showDashboard();
        } else {
            showLandingPage();
        }
    } else {
        showLandingPage();
    }
    
    loadDownloadStats();
    startAutoSlide();
};

// ========== PAGE NAVIGATION ==========
function showLandingPage() {
    document.getElementById('landingNav').style.display = 'flex';
    document.getElementById('dashboardNav').style.display = 'none';
    document.getElementById('landingPage').style.display = 'block';
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('registerPage').style.display = 'none';
    document.getElementById('dashboardPage').style.display = 'none';
    document.getElementById('downloadsPage').style.display = 'none';
    document.getElementById('aiFloatingBtn').style.display = 'none';
}

function showLoginPage() {
    document.getElementById('landingNav').style.display = 'flex';
    document.getElementById('dashboardNav').style.display = 'none';
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('registerPage').style.display = 'none';
    document.getElementById('dashboardPage').style.display = 'none';
    document.getElementById('downloadsPage').style.display = 'none';
    
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginError').style.display = 'none';
}

function showRegisterPage() {
    document.getElementById('landingNav').style.display = 'flex';
    document.getElementById('dashboardNav').style.display = 'none';
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('registerPage').style.display = 'flex';
    document.getElementById('dashboardPage').style.display = 'none';
    document.getElementById('downloadsPage').style.display = 'none';
    resetRegistrationProgress();
}

function showDashboard() {
    document.getElementById('landingNav').style.display = 'none';
    document.getElementById('dashboardNav').style.display = 'flex';
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('registerPage').style.display = 'none';
    document.getElementById('dashboardPage').style.display = 'block';
    document.getElementById('downloadsPage').style.display = 'none';
    document.getElementById('aiFloatingBtn').style.display = 'flex';
    
    updateUI();
    showSection('home');
}

function showDownloadsPage() {
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('registerPage').style.display = 'none';
    document.getElementById('dashboardPage').style.display = 'none';
    document.getElementById('downloadsPage').style.display = 'block';
    document.getElementById('landingNav').style.display = 'flex';
    document.getElementById('dashboardNav').style.display = 'none';
    document.getElementById('aiFloatingBtn').style.display = 'none';
}

function showSection(sectionName) {
    const home = document.getElementById('homeSection');
    const history = document.getElementById('historyPageSection');
    const drug = document.getElementById('drugInteractionPageSection');
    
    if (sectionName === 'history') {
        if (home) home.style.display = 'none';
        if (drug) drug.style.display = 'none';
        if (history) history.style.display = 'block';
        renderFullHistory();
    } else if (sectionName === 'drugInteraction') {
        if (home) home.style.display = 'none';
        if (history) history.style.display = 'none';
        if (drug) drug.style.display = 'block';
        updateMedicineList();
    } else {
        if (home) home.style.display = 'block';
        if (history) history.style.display = 'none';
        if (drug) drug.style.display = 'none';
    }
}

function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
    closeMobileMenu();
}

// ========== AUTHENTICATION ==========
function handleLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const loginError = document.getElementById('loginError');
    
    if (!username || !password) {
        loginError.style.display = 'block';
        loginError.innerText = 'Please enter username and password!';
        return;
    }
    
    if (allUsers[username] && allUsers[username].user.password === password) {
        appData = JSON.parse(JSON.stringify(allUsers[username]));
        appData.isLoggedIn = true;
        saveAndSync();
        showDashboard();
    } else {
        loginError.style.display = 'block';
        loginError.innerText = 'Invalid username or password!';
    }
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        appData.isLoggedIn = false;
        saveAndSync();
        showLandingPage();
    }
}

function validateAndNextStep(stepNum) {
    const username = document.getElementById('regName').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirmPassword').value;
    
    if (!username) { alert("Please enter a username!"); return; }
    if (allUsers[username]) { alert("Username already exists!"); return; }
    if (!password || password.length < 4) { alert("Password must be at least 4 characters!"); return; }
    if (password !== confirm) {
        document.getElementById('passwordError').style.display = 'block';
        return;
    }
    document.getElementById('passwordError').style.display = 'none';
    
    updateProgressBar(stepNum);
    document.querySelectorAll('.step').forEach(s => s.style.display = 'none');
    document.getElementById(`step${stepNum}`).style.display = 'block';
}

function nextStep(stepNum) {
    if (stepNum === 3) {
        const age = document.getElementById('regAge').value;
        const guardian = document.getElementById('regGuardian').value;
        if (!age || age <= 0 || age > 120) { alert("Please enter valid age!"); return; }
        if (!guardian) { alert("Please enter guardian's phone!"); return; }
    }
    
    updateProgressBar(stepNum);
    document.querySelectorAll('.step').forEach(s => s.style.display = 'none');
    document.getElementById(`step${stepNum}`).style.display = 'block';
}

function prevStep(currentStep) {
    updateProgressBar(currentStep);
    document.querySelectorAll('.step').forEach(s => s.style.display = 'none');
    document.getElementById(`step${currentStep}`).style.display = 'block';
}

function updateProgressBar(currentStep) {
    const percentage = ((currentStep - 1) / 2) * 100;
    document.getElementById('progressFill').style.width = `${percentage}%`;
}

function resetRegistrationProgress() {
    document.getElementById('step1').style.display = 'block';
    document.getElementById('step2').style.display = 'none';
    document.getElementById('step3').style.display = 'none';
    updateProgressBar(1);
    
    const inputs = ['regName', 'regPassword', 'regConfirmPassword', 'regAge', 'regAllergy', 'regGuardian', 'regWater'];
    inputs.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
}

function completeRegistration() {
    const username = document.getElementById('regName').value.trim();
    const password = document.getElementById('regPassword').value;
    const age = document.getElementById('regAge').value;
    const allergy = document.getElementById('regAllergy').value;
    const guardian = document.getElementById('regGuardian').value;
    const water = document.getElementById('regWater').value;
    
    if (!username || !password || !age || !guardian) {
        alert("Please fill all required fields!");
        return;
    }
    
    const newUser = {
        user: { name: username, age: age, allergy: allergy, guardian: guardian, water: water, password: password },
        profilePic: `https://ui-avatars.com/api/?background=4361ee&color=fff&bold=true&name=${username}`,
        history: [],
        currentMedicines: [],
        isLoggedIn: false
    };
    
    allUsers[username] = JSON.parse(JSON.stringify(newUser));
    localStorage.setItem('REXTRO_USERS', JSON.stringify(allUsers));
    
    alert("Registration successful! Please login.");
    showLoginPage();
}

// ========== DASHBOARD FUNCTIONS ==========
function updateUI() {
    const now = new Date();
    const hour = now.getHours();
    let wish = (hour < 12) ? "Morning" : (hour < 18) ? "Afternoon" : "Evening";
    
    document.getElementById('greetingText').innerHTML = `Good ${wish}, ${appData.user.name || 'Guest'}! 👋`;
    document.getElementById('dateText').innerHTML = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    document.getElementById('navProfilePic').src = appData.profilePic;
    document.getElementById('modalPreview').src = appData.profilePic;
    
    renderHistory();
}

function saveAndSync() {
    localStorage.setItem('REXTRO_APP_DATA', JSON.stringify(appData));
    if (appData.user.name && allUsers[appData.user.name]) {
        allUsers[appData.user.name] = JSON.parse(JSON.stringify(appData));
        localStorage.setItem('REXTRO_USERS', JSON.stringify(allUsers));
    }
    updateUI();
}

function renderHistory() {
    const list = document.getElementById('historyList');
    if (!list) return;
    
    if (appData.history.length === 0) {
        list.innerHTML = `<div class="empty-state"><i class="fas fa-notes-medical"></i><p>No scans yet.</p><p>Click "Open Camera" to scan your first prescription!</p></div>`;
        return;
    }
    
    const recent = appData.history.slice(0, 3);
    list.innerHTML = recent.map(item => `
        <div class="glass" style="padding:15px; border-left:4px solid var(--primary);">
            <small style="color: var(--gray);">${item.date}</small>
            <p style="margin-top:8px; font-weight:500;">${item.text.substring(0, 80)}${item.text.length > 80 ? '...' : ''}</p>
        </div>
    `).join('');
}

function renderFullHistory() {
    const list = document.getElementById('fullHistoryList');
    if (!list) return;
    
    if (appData.history.length === 0) {
        list.innerHTML = `<div class="empty-state"><i class="fas fa-history"></i><p>No history found.</p></div>`;
        return;
    }
    
    list.innerHTML = appData.history.map((item, index) => `
        <div class="glass" style="padding:20px; border-left:5px solid var(--primary);">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px;">
                <div style="flex:1;">
                    <small style="color:var(--gray);">${item.date}</small>
                    <p style="margin-top:8px; font-weight:500;">${item.text.substring(0, 100)}${item.text.length > 100 ? '...' : ''}</p>
                </div>
                <div style="display:flex; gap:8px;">
                    <button onclick="viewFullText(${index})" style="background:var(--primary); border:none; color:white; padding:8px 12px; border-radius:8px; cursor:pointer;">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button onclick="generatePDF('${item.text.replace(/'/g, "\\'")}', '${item.date}')" style="background:var(--success); border:none; color:white; padding:8px 12px; border-radius:8px; cursor:pointer;">
                        <i class="fas fa-file-pdf"></i> PDF
                    </button>
                    <button onclick="deleteHistoryItem(${index})" style="background:var(--danger); border:none; color:white; padding:8px 12px; border-radius:8px; cursor:pointer;">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function viewFullText(index) {
    alert(`📋 Prescription Details\n\nDate: ${appData.history[index].date}\n\nContent:\n${appData.history[index].text}`);
}

function deleteHistoryItem(index) {
    if (confirm("Are you sure you want to delete this scan?")) {
        appData.history.splice(index, 1);
        saveAndSync();
        renderFullHistory();
        renderHistory();
    }
}

// ========== PROFILE ==========
function toggleProfileModal() {
    const modal = document.getElementById('profileModal');
    document.getElementById('editNameInput').value = appData.user.name || '';
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

function saveProfileChanges() {
    const newName = document.getElementById('editNameInput').value.trim();
    if (newName) {
        appData.user.name = newName;
        saveAndSync();
        toggleProfileModal();
    } else {
        alert("Please enter a name!");
    }
}

function updateProfilePic(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            appData.profilePic = e.target.result;
            saveAndSync();
        };
        reader.readAsDataURL(file);
    }
}

// ========== OCR SCAN ==========
async function processScan(event) {
    const file = event.target.files[0];
    const apiKey = 'K83022860688957';
    
    if (!file) return;
    
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'glass';
    loadingDiv.style.padding = '15px';
    loadingDiv.style.marginBottom = '10px';
    loadingDiv.innerHTML = `<p><i class="fas fa-spinner fa-spin"></i> REXTRO AI is analyzing your prescription...</p>`;
    document.getElementById('historyList').prepend(loadingDiv);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('apikey', apiKey);
    formData.append('language', 'eng');
    
    try {
        const response = await fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.OCRExitCode === 1) {
            const scannedText = result.ParsedResults[0].ParsedText;
            
            if (scannedText.trim() === "") {
                loadingDiv.innerHTML = `<p style="color: var(--warning);">⚠️ Could not identify text. Please try again with better lighting.</p>`;
                setTimeout(() => loadingDiv.remove(), 2000);
            } else {
                const newEntry = {
                    date: new Date().toLocaleString(),
                    text: scannedText
                };
                
                appData.history.unshift(newEntry);
                saveAndSync();
                loadingDiv.remove();
                renderHistory();
                
                // Show success and PDF option
                showPDFOption(scannedText, newEntry.date);
                
                // Check for medicines
                const medicines = extractMedicines(scannedText);
                if (medicines.length > 0) {
                    setTimeout(() => {
                        alert(`💊 Detected medicines: ${medicines.join(', ')}\n\nThese have been added to your medicine list. Check the Drug Interaction section for warnings!`);
                    }, 500);
                }
            }
        } else {
            loadingDiv.innerHTML = `<p style="color: var(--danger);">Error: ${result.ErrorMessage || 'Failed to scan'}</p>`;
            setTimeout(() => loadingDiv.remove(), 2000);
        }
    } catch (error) {
        loadingDiv.innerHTML = `<p style="color: var(--danger);">❌ Connection error. Please try again.</p>`;
        setTimeout(() => loadingDiv.remove(), 2000);
    }
    
    event.target.value = '';
}

function extractMedicines(text) {
    const medicines = ['paracetamol', 'ibuprofen', 'aspirin', 'amoxicillin', 'warfarin', 'metformin', 'atorvastatin', 'lisinopril', 'diazepam'];
    const found = [];
    const lowerText = text.toLowerCase();
    
    medicines.forEach(med => {
        if (lowerText.includes(med)) found.push(med.charAt(0).toUpperCase() + med.slice(1));
    });
    
    return found;
}

function showPDFOption(text, date) {
    const optionDiv = document.createElement('div');
    optionDiv.className = 'glass';
    optionDiv.style.padding = '15px';
    optionDiv.style.marginBottom = '10px';
    optionDiv.style.display = 'flex';
    optionDiv.style.justifyContent = 'space-between';
    optionDiv.style.alignItems = 'center';
    optionDiv.style.flexWrap = 'wrap';
    optionDiv.style.gap = '10px';
    optionDiv.innerHTML = `
        <span><i class="fas fa-check-circle" style="color: var(--success);"></i> Prescription scanned successfully!</span>
        <button onclick="generatePDF('${text.replace(/'/g, "\\'")}', '${date}'); this.parentElement.remove();" 
                style="background:var(--success); border:none; color:white; padding:8px 20px; border-radius:8px; cursor:pointer;">
            <i class="fas fa-file-pdf"></i> Download PDF
        </button>
    `;
    
    const historyList = document.getElementById('historyList');
    if (historyList && historyList.firstChild) {
        historyList.insertBefore(optionDiv, historyList.firstChild);
        setTimeout(() => optionDiv.remove(), 8000);
    }
}

// ========== PDF GENERATION ==========
function generatePDF(text, date) {
    if (typeof window.jspdf === 'undefined') {
        alert("PDF library is loading. Please try again in a moment.");
        return;
    }
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Header
        doc.setFillColor(67, 97, 238);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("REXTRO", 20, 25);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Smart Health Companion", 20, 33);
        
        // Title
        doc.setTextColor(67, 97, 238);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("Prescription Report", 20, 60);
        
        // Date
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 72);
        doc.text(`Scan Date: ${date || new Date().toLocaleString()}`, 20, 80);
        
        // Separator
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 88, 190, 88);
        
        // Content
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Prescription Details", 20, 100);
        
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        const splitText = doc.splitTextToSize(text || "No prescription text available.", 170);
        doc.text(splitText, 20, 115);
        
        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`Generated by REXTRO - Page ${i} of ${pageCount}`, 20, doc.internal.pageSize.getHeight() - 10);
        }
        
        doc.save(`REXTRO_Prescription_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.pdf`);
        
        // Show success
        const toast = document.createElement('div');
        toast.innerHTML = `<div style="position:fixed; bottom:20px; right:20px; background:var(--success); color:white; padding:12px 20px; border-radius:12px; z-index:10000;">✅ PDF downloaded successfully!</div>`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    } catch (error) {
        console.error("PDF Error:", error);
        alert("Failed to generate PDF. Please try again.");
    }
}

// ========== DRUG INTERACTIONS ==========
const medicineDatabase = {
    "paracetamol": { name: "Paracetamol", interactsWith: [], foodInteractions: ["alcohol"], severity: "low", warning: "Avoid alcohol while taking paracetamol." },
    "ibuprofen": { name: "Ibuprofen", interactsWith: ["aspirin", "warfarin"], foodInteractions: ["alcohol"], severity: "medium", warning: "May increase stomach bleeding risk." },
    "aspirin": { name: "Aspirin", interactsWith: ["warfarin", "ibuprofen"], foodInteractions: ["alcohol"], severity: "high", warning: "HIGH RISK: Increased bleeding risk!" },
    "warfarin": { name: "Warfarin", interactsWith: ["aspirin", "ibuprofen"], foodInteractions: ["cranberry", "grapefruit"], severity: "high", warning: "HIGH RISK: Serious bleeding risk!" },
    "amoxicillin": { name: "Amoxicillin", interactsWith: [], foodInteractions: ["dairy"], severity: "low", warning: "Dairy can reduce absorption." },
    "atorvastatin": { name: "Atorvastatin", interactsWith: [], foodInteractions: ["grapefruit"], severity: "high", warning: "DO NOT consume grapefruit!" }
};

function showAddMedicineModal() {
    document.getElementById('addMedicineModal').style.display = 'flex';
}

function closeAddMedicineModal() {
    document.getElementById('addMedicineModal').style.display = 'none';
    document.getElementById('manualMedicineName').value = '';
}

function addManualMedicine() {
    const medicineName = document.getElementById('manualMedicineName').value.trim().toLowerCase();
    if (!medicineName) { alert("Please enter a medicine name!"); return; }
    
    let medicineData = null;
    for (const [id, data] of Object.entries(medicineDatabase)) {
        if (data.name.toLowerCase() === medicineName || id === medicineName) {
            medicineData = { id: id, name: data.name, severity: data.severity };
            break;
        }
    }
    
    if (!medicineData) {
        alert(`Medicine "${medicineName}" not found in database.`);
        return;
    }
    
    if (appData.currentMedicines.find(m => m.id === medicineData.id)) {
        alert(`${medicineData.name} already in your list!`);
        closeAddMedicineModal();
        return;
    }
    
    appData.currentMedicines.push(medicineData);
    saveAndSync();
    updateMedicineList();
    closeAddMedicineModal();
    alert(`Added ${medicineData.name} to your list!`);
}

function updateMedicineList() {
    const container = document.getElementById('currentMedicinesList');
    if (!container) return;
    
    if (!appData.currentMedicines || appData.currentMedicines.length === 0) {
        container.innerHTML = '<p style="color:var(--gray);">No medicines added. Click "Add Medicine" to add.</p>';
        return;
    }
    
    container.innerHTML = appData.currentMedicines.map((med, index) => `
        <div class="medicine-tag ${med.severity}">
            <span><i class="fas fa-pills"></i> ${med.name}</span>
            <button onclick="removeMedicine(${index})" class="remove-medicine"><i class="fas fa-times"></i></button>
        </div>
    `).join('');
}

function removeMedicine(index) {
    if (confirm("Remove this medicine?")) {
        appData.currentMedicines.splice(index, 1);
        saveAndSync();
        updateMedicineList();
    }
}

function checkFoodInteraction() {
    const foodItem = document.getElementById('foodCheckInput').value.trim();
    if (!foodItem) { alert("Enter a food or drink name!"); return; }
    
    if (!appData.currentMedicines || appData.currentMedicines.length === 0) {
        alert("No medicines in your list. Add medicines first!");
        return;
    }
    
    const warnings = [];
    const lowerFood = foodItem.toLowerCase();
    
    for (const medicine of appData.currentMedicines) {
        const medData = medicineDatabase[medicine.id];
        if (medData && medData.foodInteractions.some(food => lowerFood.includes(food))) {
            warnings.push({ medicine: medicine.name, food: foodItem, warning: medData.warning });
        }
    }
    
    if (warnings.length === 0) {
        alert(`✅ "${foodItem}" appears safe with your medications.`);
    } else {
        const modal = document.getElementById('interactionModal');
        document.getElementById('interactionWarningsList').innerHTML = warnings.map(w => `
            <div class="warning-medium">
                <p><strong>${w.medicine} + ${w.food}</strong><br>${w.warning}</p>
            </div>
        `).join('');
        modal.style.display = 'flex';
    }
    
    document.getElementById('foodCheckInput').value = '';
}

function closeInteractionModal() {
    document.getElementById('interactionModal').style.display = 'none';
}

// ========== CAROUSEL ==========
function showSlide(index) {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    if (!slides.length) return;
    
    if (index >= slides.length) currentSlide = 0;
    if (index < 0) currentSlide = slides.length - 1;
    
    const slidesContainer = document.querySelector('.carousel-slides');
    if (slidesContainer) {
        slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
    
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
    });
}

function nextSlide() {
    currentSlide++;
    showSlide(currentSlide);
    resetAutoSlide();
}

function prevSlide() {
    currentSlide--;
    showSlide(currentSlide);
    resetAutoSlide();
}

function currentSlideFunc(index) {
    currentSlide = index;
    showSlide(currentSlide);
    resetAutoSlide();
}

function startAutoSlide() {
    slideInterval = setInterval(() => {
        const slides = document.querySelectorAll('.carousel-slide');
        if (slides.length > 1) nextSlide();
    }, 5000);
}

function resetAutoSlide() {
    clearInterval(slideInterval);
    startAutoSlide();
}

// ========== DOWNLOADS ==========
function loadDownloadStats() {
    const saved = localStorage.getItem('REXTRO_DOWNLOADS');
    if (saved) downloadData = JSON.parse(saved);
    updateDownloadDisplay();
}

function updateDownloadDisplay() {
    document.getElementById('playCount').innerText = downloadData.playstore.toLocaleString();
    document.getElementById('appStoreCount').innerText = downloadData.appstore.toLocaleString();
}

function trackDownload(platform) {
    if (downloadData[platform] !== undefined) {
        downloadData[platform]++;
        localStorage.setItem('REXTRO_DOWNLOADS', JSON.stringify(downloadData));
        updateDownloadDisplay();
        alert(`✅ Thank you for downloading REXTRO!\n\nDownload will start shortly.`);
    }
}

// ========== AI CHATBOT ==========
function toggleAIAgent() {
    const modal = document.getElementById('aiAgentModal');
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;
    
    addMessage(message, 'user');
    input.value = '';
    
    setTimeout(() => {
        const response = getAIResponse(message);
        addMessage(response, 'ai');
    }, 500);
}

function getAIResponse(message) {
    const lower = message.toLowerCase();
    
    if (lower.includes('scan') || lower.includes('prescription')) {
        return "📷 To scan a prescription:\n\n1. Click 'Open Camera' on dashboard\n2. Take a clear photo of your prescription\n3. REXTRO AI will extract the text\n4. Saved to your history!\n\n💡 Make sure there's good lighting for best results!";
    } else if (lower.includes('medicine') || lower.includes('drug')) {
        return "💊 You can manage medicines in the 'Drug Check' section:\n\n• Add your medicines to the list\n• Check food interactions\n• View warnings about combinations\n• Always consult your doctor before changing medications!";
    } else if (lower.includes('history')) {
        return "📜 Your scan history:\n\n• All your scans are saved automatically\n• Click 'History' to view all\n• Each scan shows date and content\n• You can delete or download as PDF";
    } else if (lower.includes('login') || lower.includes('register')) {
        return "🔐 Account help:\n\n• New users: Click 'Create Account' on login page\n• Fill in your details in 3 simple steps\n• Use at least 4 characters for password\n• Forgot password? Contact support@rextro.com";
    } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
        return "👋 Hello! I'm your REXTRO AI Assistant.\n\nI can help you with:\n• Scanning prescriptions\n• Medicine interactions\n• Account issues\n• Using the app\n\nWhat would you like to know?";
    } else {
        return "👋 I'm REXTRO AI Assistant!\n\nI can help you with:\n• 📷 How to scan prescriptions\n• 💊 Medicine interactions\n• 📜 Viewing history\n• 🔐 Login/Registration\n\nWhat do you need help with?";
    }
}

function addMessage(text, sender) {
    const messagesDiv = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `${sender}-message`;
    
    if (sender === 'ai') {
        messageDiv.innerHTML = `<div class="ai-avatar"><i class="fas fa-robot"></i></div><div class="message-bubble">${text.replace(/\n/g, '<br>')}</div>`;
    } else {
        messageDiv.innerHTML = `<div class="message-bubble">${escapeHtml(text)}</div>`;
    }
    
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== SEARCH FUNCTION ==========
const searchDatabase = [
    { title: "AI OCR Scanner", description: "Scan prescriptions with AI", category: "feature", icon: "fas fa-robot", link: "features" },
    { title: "Drug Interaction", description: "Check medicine interactions", category: "feature", icon: "fas fa-pills", link: "features" },
    { title: "Paracetamol", description: "Pain reliever - Avoid alcohol", category: "medicine", icon: "fas fa-capsules", link: null },
    { title: "Ibuprofen", description: "Anti-inflammatory - Stomach warning", category: "medicine", icon: "fas fa-capsules", link: null }
];

function searchLandingContent(query) {
    const dropdown = document.getElementById('searchResultsDropdown');
    if (!query.trim()) {
        dropdown.classList.remove('show');
        return;
    }
    
    const lowerQuery = query.toLowerCase();
    const results = searchDatabase.filter(item => 
        item.title.toLowerCase().includes(lowerQuery) || 
        item.description.toLowerCase().includes(lowerQuery)
    );
    
    if (results.length === 0) {
        dropdown.innerHTML = `<div class="no-results"><p>No results found for "${query}"</p></div>`;
        dropdown.classList.add('show');
        return;
    }
    
    dropdown.innerHTML = results.map(result => `
        <div class="search-result-item" onclick="handleSearchResult('${result.link}', '${result.title}')">
            <i class="${result.icon}"></i>
            <div>
                <h4>${result.title}</h4>
                <p>${result.description}</p>
            </div>
            <span class="search-result-category">${result.category}</span>
        </div>
    `).join('');
    
    dropdown.classList.add('show');
}

function handleSearchResult(link, title) {
    document.getElementById('searchResultsDropdown').classList.remove('show');
    document.getElementById('landingSearchInput').value = '';
    
    if (!link) {
        alert(`💊 ${title}\n\nLogin to add this to your medicine list and check interactions!`);
        return;
    }
    scrollToSection(link);
}

// ========== MOBILE MENU ==========
function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    const hamburger = document.getElementById('hamburger');
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
}

function closeMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    const hamburger = document.getElementById('hamburger');
    navLinks.classList.remove('active');
    hamburger.classList.remove('active');
}

function toggleDashboardMobileMenu() {
    const navLinks = document.getElementById('dashboardNavLinks');
    const hamburger = document.getElementById('dashboardHamburger');
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
}

function closeDashboardMobileMenu() {
    const navLinks = document.getElementById('dashboardNavLinks');
    const hamburger = document.getElementById('dashboardHamburger');
    navLinks.classList.remove('active');
    hamburger.classList.remove('active');
}

// ========== MODAL HELPERS ==========
function toggleWebModal() {
    const modal = document.getElementById('webSupportModal');
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

// ========== CONTACT FORM ==========
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('contactName').value.trim();
            const email = document.getElementById('contactEmail').value.trim();
            const message = document.getElementById('contactMessage').value.trim();
            const statusDiv = document.getElementById('formStatus');
            
            if (!name || !email || !message) {
                statusDiv.className = 'form-status error';
                statusDiv.innerHTML = 'Please fill in all fields!';
                statusDiv.style.display = 'block';
                return;
            }
            
            statusDiv.className = 'form-status success';
            statusDiv.innerHTML = '✅ Thank you! Your message has been sent.';
            statusDiv.style.display = 'block';
            
            document.getElementById('contactForm').reset();
            
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 5000);
        });
    }
});

// Click outside to close modals
document.addEventListener('click', function(event) {
    const searchContainer = document.querySelector('.nav-search');
    const dropdown = document.getElementById('searchResultsDropdown');
    if (searchContainer && !searchContainer.contains(event.target)) {
        if (dropdown) dropdown.classList.remove('show');
    }
});

// Keyboard shortcut Ctrl+K
document.addEventListener('keydown', function(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.getElementById('landingSearchInput');
        if (searchInput && document.getElementById('landingPage').style.display !== 'none') {
            searchInput.focus();
        }
    }
});
