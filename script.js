
const appState = {
    currentPage: 'dashboard',
    observations: [],
    editingObservationId: null,
    currentObservation: null
};

document.addEventListener('DOMContentLoaded', function() {
    loadObservations();
    
    setupEventListeners();
    
    initAccordions();
    
    updateStats();
    
    const today = new Date();
    const birthDateInput = document.getElementById('birthDate');
    const hospitalizationDateInput = document.getElementById('hospitalizationDate');
    const symptomStartDateInput = document.getElementById('symptomStartDate');
    
    if (birthDateInput) {
        birthDateInput.valueAsDate = new Date(today.getFullYear() - 30, today.getMonth(), today.getDate());
    }
    
    if (hospitalizationDateInput) {
        hospitalizationDateInput.valueAsDate = today;
    }
    
    if (symptomStartDateInput) {
        symptomStartDateInput.valueAsDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    
    setupMobileBehaviors();
    
});

function setupMobileBehaviors() {
    const modal = document.getElementById('observationDetailModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this && window.innerWidth < 768) {
                closeModal();
            }
        });
        
        function adjustModalHeight() {
            if (window.innerWidth < 768) {
                const modalContent = modal.querySelector('.overflow-y-auto');
                if (modalContent) {
                    modalContent.style.maxHeight = 'calc(100vh - 150px)';
                }
            }
        }
        
        window.addEventListener('resize', adjustModalHeight);
    }
}

function loadObservations() {
    try {
        const storedObservations = localStorage.getItem('medicalObservations');
        if (storedObservations) {
            appState.observations = JSON.parse(storedObservations);
            renderObservations();
        }
    } catch (error) {
        console.error('Error loading observations:', error);
        appState.observations = [];
    }
}

function saveObservations() {
    try {
        localStorage.setItem('medicalObservations', JSON.stringify(appState.observations));
        updateStats();
        renderObservations();
    } catch (error) {
        console.error('Error saving observations:', error);
        showToast('Erreur lors de la sauvegarde');
    }
}

function setupEventListeners() {
    const dashboardBtn = document.getElementById('dashboardBtn');
    if (dashboardBtn) dashboardBtn.addEventListener('click', showDashboard);
    
    const newObservationBtn = document.getElementById('newObservationBtn');
    if (newObservationBtn) newObservationBtn.addEventListener('click', showNewObservation);
    
    const newObservationFromDashboard = document.getElementById('newObservationFromDashboard');
    if (newObservationFromDashboard) newObservationFromDashboard.addEventListener('click', showNewObservation);
    
    const createFirstObservation = document.getElementById('createFirstObservation');
    if (createFirstObservation) createFirstObservation.addEventListener('click', showNewObservation);
    
    const observationForm = document.getElementById('observationForm');
    if (observationForm) {
        observationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveObservation();
        });
    }
    
    const cancelObservation = document.getElementById('cancelObservation');
    if (cancelObservation) cancelObservation.addEventListener('click', cancelObservation);
    
    const saveDraftBtn = document.getElementById('saveDraft');
    if (saveDraftBtn) saveDraftBtn.addEventListener('click', saveDraft);
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.addEventListener('input', filterObservations);
    
    const serviceFilter = document.getElementById('serviceFilter');
    if (serviceFilter) serviceFilter.addEventListener('change', filterObservations);
    
    const symptomFilter = document.getElementById('symptomFilter');
    if (symptomFilter) symptomFilter.addEventListener('change', filterObservations);
    
    const dateFilter = document.getElementById('dateFilter');
    if (dateFilter) dateFilter.addEventListener('change', filterObservations);
    
    const clearFilters = document.getElementById('clearFilters');
    if (clearFilters) clearFilters.addEventListener('click', clearFilters);
    
    const closeModalBtn = document.getElementById('closeModal');
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    
    const printObservationBtn = document.getElementById('printObservation');
    if (printObservationBtn) printObservationBtn.addEventListener('click', printObservation);
    
    const editObservationBtn = document.getElementById('editObservation');
    if (editObservationBtn) editObservationBtn.addEventListener('click', editObservation);
}

function autoSaveDraft() {
    if (appState.currentPage === 'newObservation' && appState.editingObservationId === null) {
        const patientName = document.getElementById('patientName');
        if (patientName && patientName.value.trim() !== '') {
            saveDraft();
            console.log('Brouillon auto-sauvegardé');
        }
    }
}

function initAccordions() {
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const icon = this.querySelector('i');
            
            content.classList.toggle('open');
            
            if (content.classList.contains('open')) {
                icon.style.transform = 'rotate(180deg)';
                content.style.maxHeight = content.scrollHeight + 'px';
            } else {
                icon.style.transform = 'rotate(0deg)';
                content.style.maxHeight = '0';
            }
        });
        
        const content = header.nextElementSibling;
        if (content) {
            content.classList.remove('open');
            content.style.maxHeight = '0';
        }
    });
}

function closeAllAccordions() {
    document.querySelectorAll('.accordion-content').forEach(content => {
        content.classList.remove('open');
        content.style.maxHeight = '0';
    });
    
    document.querySelectorAll('.accordion-header i').forEach(icon => {
        icon.style.transform = 'rotate(0deg)';
    });
}

function showDashboard() {
    const dashboardPage = document.getElementById('dashboardPage');
    const newObservationPage = document.getElementById('newObservationPage');
    
    if (dashboardPage) dashboardPage.classList.remove('hidden');
    if (newObservationPage) newObservationPage.classList.add('hidden');
    
    appState.currentPage = 'dashboard';
    updateStats();
    renderObservations();
}

function showNewObservation() {
    const dashboardPage = document.getElementById('dashboardPage');
    const newObservationPage = document.getElementById('newObservationPage');
    
    if (dashboardPage) dashboardPage.classList.add('hidden');
    if (newObservationPage) newObservationPage.classList.remove('hidden');
    
    appState.currentPage = 'newObservation';
    appState.editingObservationId = null;
    
    const observationForm = document.getElementById('observationForm');
    if (observationForm) observationForm.reset();
    
    const gynecoSection = document.getElementById('gynecoSection');
    if (gynecoSection) gynecoSection.classList.add('hidden');
    
    const today = new Date();
    const birthDateInput = document.getElementById('birthDate');
    const hospitalizationDateInput = document.getElementById('hospitalizationDate');
    const symptomStartDateInput = document.getElementById('symptomStartDate');
    
    if (birthDateInput) {
        birthDateInput.valueAsDate = new Date(today.getFullYear() - 30, today.getMonth(), today.getDate());
    }
    
    if (hospitalizationDateInput) {
        hospitalizationDateInput.valueAsDate = today;
    }
    
    if (symptomStartDateInput) {
        symptomStartDateInput.valueAsDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    closeAllAccordions();
    
    if (window.innerWidth < 768) {
        window.scrollTo(0, 0);
    }
}

function saveObservation() {
    const observation = gatherFormData();
    if (!observation) {
        showToast('Veuillez remplir les champs obligatoires');
        return;
    }
    
    observation.status = 'completed';
    observation.completedDate = new Date().toISOString();
    
    if (appState.editingObservationId !== null) {
        const index = appState.observations.findIndex(obs => obs.id === appState.editingObservationId);
        if (index !== -1) {
            appState.observations[index] = observation;
        }
    } else {
        observation.id = Date.now().toString();
        observation.createdDate = new Date().toISOString();
        appState.observations.unshift(observation);
    }
    
    saveObservations();
    showToast('Observation enregistrée avec succès');
    showDashboard();
}

function saveDraft() {
    const observation = gatherFormData();
    if (!observation) {
        showToast('Veuillez remplir au moins le nom du patient');
        return;
    }
    
    observation.status = 'draft';
    
    if (appState.editingObservationId !== null) {
        const index = appState.observations.findIndex(obs => obs.id === appState.editingObservationId);
        if (index !== -1) {
            appState.observations[index] = observation;
        }
    } else {
        observation.id = Date.now().toString();
        observation.createdDate = new Date().toISOString();
        appState.observations.unshift(observation);
    }
    
    saveObservations();
    showToast('Brouillon enregistré');
    
    if (window.innerWidth >= 768) {
        showDashboard();
    }
}

function cancelObservation() {
    if (confirm('Voulez-vous vraiment annuler ? Les modifications non enregistrées seront perdues.')) {
        showDashboard();
    }
}

function gatherFormData() {
    const observation = {};
    
    const patientName = document.getElementById('patientName');
    if (!patientName || patientName.value.trim() === '') {
        return null;
    }
    
    observation.patientName = patientName.value;
    
    const birthDate = document.getElementById('birthDate');
    if (birthDate) observation.birthDate = birthDate.value;
    
    const patientAge = document.getElementById('patientAge');
    if (patientAge) observation.patientAge = patientAge.value;
    
    const origin = document.getElementById('origin');
    if (origin) observation.origin = origin.value;
    
    const address = document.getElementById('address');
    if (address) observation.address = address.value;
    
    const civilStatus = document.getElementById('civilStatus');
    if (civilStatus) observation.civilStatus = civilStatus.value;
    
    const childrenCount = document.getElementById('childrenCount');
    if (childrenCount) observation.childrenCount = childrenCount.value;
    
    const profession = document.getElementById('profession');
    if (profession) observation.profession = profession.value;
    
    const hospitalizationDate = document.getElementById('hospitalizationDate');
    if (hospitalizationDate) observation.hospitalizationDate = hospitalizationDate.value;
    
    const hospitalService = document.getElementById('hospitalService');
    if (hospitalService) observation.hospitalService = hospitalService.value;
    
    const mainSymptom = document.getElementById('mainSymptom');
    if (mainSymptom) observation.mainSymptom = mainSymptom.value;
    
    const symptomStartDate = document.getElementById('symptomStartDate');
    if (symptomStartDate) observation.symptomStartDate = symptomStartDate.value;
    
    const symptomAppearance = document.getElementById('symptomAppearance');
    if (symptomAppearance) observation.symptomAppearance = symptomAppearance.value;
    
    const symptomNature = document.getElementById('symptomNature');
    if (symptomNature) observation.symptomNature = symptomNature.value;
    
    const onsetMode = document.getElementById('onsetMode');
    if (onsetMode) observation.onsetMode = onsetMode.value;
    
    const triggerFactors = document.getElementById('triggerFactors');
    if (triggerFactors) observation.triggerFactors = triggerFactors.value;
    
    observation.associatedSymptoms = Array.from(document.querySelectorAll('input[name="associatedSymptoms"]:checked')).map(cb => cb.value);
    
    const otherSymptoms = document.getElementById('otherSymptoms');
    if (otherSymptoms) observation.otherSymptoms = otherSymptoms.value;
    
    observation.vaccinations = Array.from(document.querySelectorAll('input[name="vaccinations"]:checked')).map(cb => cb.value);
    
    const allergies = document.getElementById('allergies');
    if (allergies) observation.allergies = allergies.value;
    
    const medicalHistory = document.getElementById('medicalHistory');
    if (medicalHistory) observation.medicalHistory = medicalHistory.value;
    
    observation.toxicHabits = Array.from(document.querySelectorAll('input[name="toxicHabits"]:checked')).map(cb => cb.value);
    
    const fatherStatus = document.getElementById('fatherStatus');
    if (fatherStatus) observation.fatherStatus = fatherStatus.value;
    
    const motherStatus = document.getElementById('motherStatus');
    if (motherStatus) observation.motherStatus = motherStatus.value;
    
    observation.familyDiseases = Array.from(document.querySelectorAll('input[name="familyDiseases"]:checked')).map(cb => cb.value);
    
    const otherFamilyDiseases = document.getElementById('otherFamilyDiseases');
    if (otherFamilyDiseases) observation.otherFamilyDiseases = otherFamilyDiseases.value;
    
    const lifestyle = document.getElementById('lifestyle');
    if (lifestyle) observation.lifestyle = lifestyle.value;
    
    const socioEconomicLevel = document.getElementById('socioEconomicLevel');
    if (socioEconomicLevel) observation.socioEconomicLevel = socioEconomicLevel.value;
    
    const tbExposure = document.getElementById('tbExposure');
    if (tbExposure) observation.tbExposure = tbExposure.value;
    
    const waterSource = document.getElementById('waterSource');
    if (waterSource) observation.waterSource = waterSource.value;
    
    observation.animals = Array.from(document.querySelectorAll('input[name="animals"]:checked')).map(cb => cb.value);
    
    const consciousness = document.getElementById('consciousness');
    if (consciousness) observation.consciousness = consciousness.value;
    
    const cooperation = document.getElementById('cooperation');
    if (cooperation) observation.cooperation = cooperation.value;
    
    const orientation = document.getElementById('orientation');
    if (orientation) observation.orientation = orientation.value;
    
    const skinColor = document.getElementById('skinColor');
    if (skinColor) observation.skinColor = skinColor.value;
    
    observation.posture = Array.from(document.querySelectorAll('input[name="posture"]:checked')).map(cb => cb.value);
    
    observation.skinCondition = Array.from(document.querySelectorAll('input[name="skinCondition"]:checked')).map(cb => cb.value);
    
    const skinDetails = document.getElementById('skinDetails');
    if (skinDetails) observation.skinDetails = skinDetails.value;
    
    observation.generalSigns = Array.from(document.querySelectorAll('input[name="generalSigns"]:checked')).map(cb => cb.value);
    
    const pulse = document.getElementById('pulse');
    if (pulse) observation.pulse = pulse.value;
    
    const respiratoryRate = document.getElementById('respiratoryRate');
    if (respiratoryRate) observation.respiratoryRate = respiratoryRate.value;
    
    const bloodPressure = document.getElementById('bloodPressure');
    if (bloodPressure) observation.bloodPressure = bloodPressure.value;
    
    const temperature = document.getElementById('temperature');
    if (temperature) observation.temperature = temperature.value;
    
    const weight = document.getElementById('weight');
    if (weight) observation.weight = weight.value;
    
    const dyspnea = document.getElementById('dyspnea');
    if (dyspnea) observation.dyspnea = dyspnea.value;
    
    observation.cough = Array.from(document.querySelectorAll('input[name="cough"]:checked')).map(cb => cb.value);
    
    const sputumColor = document.getElementById('sputumColor');
    if (sputumColor) observation.sputumColor = sputumColor.value;
    
    const sputumAmount = document.getElementById('sputumAmount');
    if (sputumAmount) observation.sputumAmount = sputumAmount.value;
    
    observation.thoracicInspection = Array.from(document.querySelectorAll('input[name="thoracicInspection"]:checked')).map(cb => cb.value);
    
    observation.lungAuscultation = Array.from(document.querySelectorAll('input[name="lungAuscultation"]:checked')).map(cb => cb.value);
    
    const cardiacDyspnea = document.getElementById('cardiacDyspnea');
    if (cardiacDyspnea) observation.cardiacDyspnea = cardiacDyspnea.value;
    
    const palpitations = document.getElementById('palpitations');
    if (palpitations) observation.palpitations = palpitations.value;
    
    observation.chestPain = Array.from(document.querySelectorAll('input[name="chestPain"]:checked')).map(cb => cb.value);
    
    observation.cardiacInspection = Array.from(document.querySelectorAll('input[name="cardiacInspection"]:checked')).map(cb => cb.value);
    
    observation.cardiacAuscultation = Array.from(document.querySelectorAll('input[name="cardiacAuscultation"]:checked')).map(cb => cb.value);
    
    const appetite = document.getElementById('appetite');
    if (appetite) observation.appetite = appetite.value;
    
    const transit = document.getElementById('transit');
    if (transit) observation.transit = transit.value;
    
    observation.abdominalPain = Array.from(document.querySelectorAll('input[name="abdominalPain"]:checked')).map(cb => cb.value);
    
    observation.abdominalInspection = Array.from(document.querySelectorAll('input[name="abdominalInspection"]:checked')).map(cb => cb.value);
    
    observation.abdominalPalpation = Array.from(document.querySelectorAll('input[name="abdominalPalpation"]:checked')).map(cb => cb.value);
    
    observation.urinarySymptoms = Array.from(document.querySelectorAll('input[name="urinarySymptoms"]:checked')).map(cb => cb.value);
    
    observation.lumbarExam = Array.from(document.querySelectorAll('input[name="lumbarExam"]:checked')).map(cb => cb.value);
    
    const hypogastricExam = document.getElementById('hypogastricExam');
    if (hypogastricExam) observation.hypogastricExam = hypogastricExam.value;
    
    const neurologicalOrientation = document.getElementById('neurologicalOrientation');
    if (neurologicalOrientation) observation.neurologicalOrientation = neurologicalOrientation.value;
    
    const memory = document.getElementById('memory');
    if (memory) observation.memory = memory.value;
    
    observation.motricity = Array.from(document.querySelectorAll('input[name="motricity"]:checked')).map(cb => cb.value);
    
    observation.reflexes = Array.from(document.querySelectorAll('input[name="reflexes"]:checked')).map(cb => cb.value);
    
    const babinski = document.getElementById('babinski');
    if (babinski) observation.babinski = babinski.value;
    
    observation.anemicSyndrome = Array.from(document.querySelectorAll('input[name="anemicSyndrome"]:checked')).map(cb => cb.value);
    
    observation.hemorrhages = Array.from(document.querySelectorAll('input[name="hemorrhages"]:checked')).map(cb => cb.value);
    
    observation.hematologicalInspection = Array.from(document.querySelectorAll('input[name="hematologicalInspection"]:checked')).map(cb => cb.value);
    
    observation.lymphNodes = Array.from(document.querySelectorAll('input[name="lymphNodes"]:checked')).map(cb => cb.value);
    
    return observation;
}

function renderObservations(filteredObservations = null) {
    const container = document.getElementById('observationsContainer');
    const noObservations = document.getElementById('noObservations');
    
    if (!container || !noObservations) return;
    
    const observations = filteredObservations || appState.observations;
    
    if (observations.length === 0) {
        container.innerHTML = '';
        container.appendChild(noObservations);
        noObservations.classList.remove('hidden');
        return;
    }
    
    noObservations.classList.add('hidden');
    
    let html = '';
    observations.forEach(obs => {
        const date = obs.createdDate ? new Date(obs.createdDate).toLocaleDateString('fr-FR') : 'Date inconnue';
        const statusClass = obs.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
        const statusText = obs.status === 'completed' ? 'Complète' : 'Brouillon';
        
        html += `
        <div class="observation-card bg-white rounded-xl p-4 md:p-6 medical-shadow cursor-pointer" data-id="${obs.id}">
            <div class="flex justify-between items-start mb-3 md:mb-4">
                <div class="overflow-hidden">
                    <h4 class="text-base md:text-lg font-bold text-gray-800 truncate">${obs.patientName || 'Sans nom'}</h4>
                    <p class="text-gray-600 text-xs md:text-sm">${obs.patientAge || '?'} ans, ${obs.hospitalService || 'Service non spécifié'}</p>
                </div>
                <span class="px-2 md:px-3 py-1 ${statusClass} rounded-full text-xs font-medium whitespace-nowrap">${statusText}</span>
            </div>
            
            <div class="mb-3 md:mb-4">
                <div class="flex items-center text-gray-700 mb-1 md:mb-2">
                    <i class="fas fa-stethoscope mr-2 text-blue-500 text-xs md:text-sm"></i>
                    <span class="text-xs md:text-sm truncate">${obs.mainSymptom || 'Symptôme non spécifié'}</span>
                </div>
                <div class="flex items-center text-gray-700">
                    <i class="fas fa-calendar-alt mr-2 text-blue-500 text-xs md:text-sm"></i>
                    <span class="text-xs md:text-sm truncate">Hospitalisé le ${obs.hospitalizationDate ? new Date(obs.hospitalizationDate).toLocaleDateString('fr-FR') : 'date inconnue'}</span>
                </div>
            </div>
            
            <div class="flex justify-between items-center text-gray-500 text-xs md:text-sm">
                <span>${date}</span>
                <div class="flex space-x-1 md:space-x-2">
                    <button class="view-btn px-2 md:px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-xs md:text-sm">
                        <i class="fas fa-eye mr-1"></i><span class="hidden md:inline">Voir</span>
                    </button>
                    <button class="delete-btn px-2 md:px-3 py-1 text-red-600 hover:bg-red-50 rounded text-xs md:text-sm">
                        <i class="fas fa-trash mr-1"></i><span class="hidden md:inline">Suppr</span>
                    </button>
                </div>
            </div>
        </div>
        `;
    });
    
    container.innerHTML = html;
    
    document.querySelectorAll('.observation-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.classList.contains('view-btn') && !e.target.classList.contains('delete-btn') && 
                !e.target.closest('.view-btn') && !e.target.closest('.delete-btn')) {
                const id = this.getAttribute('data-id');
                viewObservation(id);
            }
        });
    });
    
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = this.closest('.observation-card').getAttribute('data-id');
            viewObservation(id);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = this.closest('.observation-card').getAttribute('data-id');
            deleteObservation(id);
        });
    });
}

function viewObservation(id) {
    const observation = appState.observations.find(obs => obs.id === id);
    if (!observation) return;
    
    appState.currentObservation = observation;
    
    const modalPatientName = document.getElementById('modalPatientName');
    const modalPatientAgeGender = document.getElementById('modalPatientAgeGender');
    const modalService = document.getElementById('modalService');
    const modalDate = document.getElementById('modalDate');
    
    if (modalPatientName) modalPatientName.textContent = observation.patientName || 'Sans nom';
    if (modalPatientAgeGender) modalPatientAgeGender.textContent = `${observation.patientAge || '?'} ans`;
    if (modalService) modalService.textContent = observation.hospitalService || 'Non spécifié';
    if (modalDate) modalDate.textContent = observation.createdDate ? new Date(observation.createdDate).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric'
    }) : 'Date inconnue';
    
    const content = document.getElementById('modalContent');
    if (!content) return;
    
    let html = '';
    
    html += `
    <div class="border-l-4 border-blue-500 pl-3 md:pl-4">
        <h4 class="text-base md:text-lg font-bold text-gray-800 mb-2">État Civil</h4>
        <div class="text-gray-700 text-sm md:text-base">
            <p>Il s'agit de <strong>${observation.patientName || 'Non renseigné'}</strong>, né(e) le <strong>${observation.birthDate ? new Date(observation.birthDate).toLocaleDateString('fr-FR') : 'Non renseigné'}</strong>, âgé(e) de <strong>${observation.patientAge || '?'} ans</strong>.</p>
            <p>Originaire de <strong>${observation.origin || 'Non renseigné'}</strong>, demeurant à <strong>${observation.address || 'Non renseigné'}</strong>, ${observation.civilStatus || ''}${observation.childrenCount ? `, père/mère de ${observation.childrenCount} enfants` : ''}.</p>
            <p>Profession: <strong>${observation.profession || 'Non renseigné'}</strong>. Hospitalisé(e) le <strong>${observation.hospitalizationDate ? new Date(observation.hospitalizationDate).toLocaleDateString('fr-FR') : 'Non renseigné'}</strong> au service de <strong>${observation.hospitalService || 'Non renseigné'}</strong> pour <strong>${observation.mainSymptom || 'Non renseigné'}</strong>.</p>
        </div>
    </div>
    `;
    
    html += `
    <div class="border-l-4 border-blue-500 pl-3 md:pl-4">
        <h4 class="text-base md:text-lg font-bold text-gray-800 mb-2">Histoire de la maladie</h4>
        <div class="text-gray-700 text-sm md:text-base">
            <p>La symptomatologie remonte au <strong>${observation.symptomStartDate ? new Date(observation.symptomStartDate).toLocaleDateString('fr-FR') : 'Non renseigné'}</strong>, marquée par l'apparition de <strong>${observation.symptomAppearance || 'Non renseigné'}</strong>.</p>
            <p>Nature: ${observation.symptomNature || 'Non renseigné'}, Mode de début: ${observation.onsetMode || 'Non renseigné'}</p>
            <p>Facteurs déclenchants/sédatifs: ${observation.triggerFactors || 'Non renseigné'}</p>
            <p>Symptômes associés: ${observation.associatedSymptoms && observation.associatedSymptoms.length > 0 ? observation.associatedSymptoms.join(', ') : 'Aucun'}${observation.otherSymptoms ? `, ${observation.otherSymptoms}` : ''}</p>
        </div>
    </div>
    `;
    
    content.innerHTML = html;
    
    const modal = document.getElementById('observationDetailModal');
    if (modal) {
        modal.classList.remove('hidden');
        
        if (window.innerWidth < 768) {
            const modalContent = modal.querySelector('.overflow-y-auto');
            if (modalContent) {
                modalContent.style.maxHeight = 'calc(100vh - 150px)';
            }
        }
    }
}

function closeModal() {
    const modal = document.getElementById('observationDetailModal');
    if (modal) modal.classList.add('hidden');
}

function editObservation() {
    if (!appState.currentObservation) return;
    
    closeModal();
    showNewObservation();
    
    const obs = appState.currentObservation;
    appState.editingObservationId = obs.id;
    
    const patientName = document.getElementById('patientName');
    if (patientName) patientName.value = obs.patientName || '';
    
    const birthDate = document.getElementById('birthDate');
    if (birthDate && obs.birthDate) birthDate.value = obs.birthDate;
    
    const patientAge = document.getElementById('patientAge');
    if (patientAge) patientAge.value = obs.patientAge || '';
    
    const origin = document.getElementById('origin');
    if (origin) origin.value = obs.origin || '';
    
    const address = document.getElementById('address');
    if (address) address.value = obs.address || '';
    
    const civilStatus = document.getElementById('civilStatus');
    if (civilStatus && obs.civilStatus) civilStatus.value = obs.civilStatus;
    
    const childrenCount = document.getElementById('childrenCount');
    if (childrenCount) childrenCount.value = obs.childrenCount || '';
    
    const profession = document.getElementById('profession');
    if (profession) profession.value = obs.profession || '';
    
    const hospitalizationDate = document.getElementById('hospitalizationDate');
    if (hospitalizationDate && obs.hospitalizationDate) hospitalizationDate.value = obs.hospitalizationDate;
    
    const hospitalService = document.getElementById('hospitalService');
    if (hospitalService && obs.hospitalService) hospitalService.value = obs.hospitalService;
    
    const mainSymptom = document.getElementById('mainSymptom');
    if (mainSymptom) mainSymptom.value = obs.mainSymptom || '';
    
    
    if (window.innerWidth < 768) {
        window.scrollTo(0, 0);
    }
}

function deleteObservation(id) {
    if (confirm('Voulez-vous vraiment supprimer cette observation ?')) {
        appState.observations = appState.observations.filter(obs => obs.id !== id);
        saveObservations();
        showToast('Observation supprimée');
    }
}

function printObservation() {
    window.print();
}

function filterObservations() {
    const searchInput = document.getElementById('searchInput');
    const serviceFilter = document.getElementById('serviceFilter');
    const symptomFilter = document.getElementById('symptomFilter');
    const dateFilter = document.getElementById('dateFilter');
    
    if (!searchInput || !serviceFilter || !symptomFilter || !dateFilter) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const serviceValue = serviceFilter.value;
    const symptomValue = symptomFilter.value;
    const dateValue = dateFilter.value;
    
    const filtered = appState.observations.filter(obs => {
        if (searchTerm && !(obs.patientName && obs.patientName.toLowerCase().includes(searchTerm)) && 
            !(obs.mainSymptom && obs.mainSymptom.toLowerCase().includes(searchTerm)) &&
            !(obs.hospitalService && obs.hospitalService.toLowerCase().includes(searchTerm))) {
            return false;
        }
        
        if (serviceValue && obs.hospitalService !== serviceValue) {
            return false;
        }
        
        if (symptomValue && obs.mainSymptom !== symptomValue) {
            return false;
        }
        
        if (dateValue && obs.createdDate) {
            const obsDate = new Date(obs.createdDate).toISOString().split('T')[0];
            if (obsDate !== dateValue) {
                return false;
            }
        }
        
        return true;
    });
    
    renderObservations(filtered);
}

function clearFilters() {
    const searchInput = document.getElementById('searchInput');
    const serviceFilter = document.getElementById('serviceFilter');
    const symptomFilter = document.getElementById('symptomFilter');
    const dateFilter = document.getElementById('dateFilter');
    
    if (searchInput) searchInput.value = '';
    if (serviceFilter) serviceFilter.value = '';
    if (symptomFilter) symptomFilter.value = '';
    if (dateFilter) dateFilter.value = '';
    
    renderObservations();
}

function updateStats() {
    const totalObservations = document.getElementById('totalObservations');
    const todayObservations = document.getElementById('todayObservations');
    const incompleteObservations = document.getElementById('incompleteObservations');
    
    if (!totalObservations || !todayObservations || !incompleteObservations) return;
    
    const total = appState.observations.length;
    const today = new Date().toISOString().split('T')[0];
    const todayCount = appState.observations.filter(obs => {
        return obs.createdDate && obs.createdDate.split('T')[0] === today;
    }).length;
    const incompleteCount = appState.observations.filter(obs => obs.status === 'draft').length;
    
    totalObservations.textContent = total;
    todayObservations.textContent = todayCount;
    incompleteObservations.textContent = incompleteCount;
}

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) return;
    
    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}