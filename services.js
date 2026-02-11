const services = [
  "Médecine interne",
  "Cardiologie",
  "Pneumologie",
  "Gastro-entérologie",
  "Néphrologie",
  "Hématologie",
  "Endocrinologie",
  "Maladies infectieuses",
  "Neurologie",
  "Dermatologie",
  "Oncologie médicale",
  "Gériatrie",
  "Chirurgie générale",
  "Chirurgie orthopédique",
  "Neurochirurgie",
  "Chirurgie cardio-thoracique",
  "Chirurgie vasculaire",
  "Urologie",
  "Chirurgie digestive",
  "Chirurgie pédiatrique",
  "Chirurgie plastique",
  "ORL",
  "Ophtalmologie",
  "Chirurgie maxillo-faciale",
  "Pédiatrie",
  "Néonatologie",
  "Gynécologie-obstétrique",
  "Urgences",
  "Réanimation",
  "Anesthésie-réanimation",
  "Soins intensifs",
  "Psychiatrie",
  "Pédopsychiatrie",
  "Radiologie",
  "Imagerie médicale",
  "Laboratoire d’analyses médicales",
  "Médecine nucléaire",
  "Anatomopathologie",
  "Médecine physique et réadaptation",
  "Kinésithérapie",
  "Ergothérapie",
  "Soins palliatifs"
];

const select = document.getElementById("hospitalService");

services.forEach(service => {
  const option = document.createElement("option");
  option.value = service;
  option.textContent = service;
  select.appendChild(option);
});

const selectFilter = document.getElementById("hospitalServiceFilter");

services.forEach(service => {
  const option = document.createElement("option");
  option.value = service;
  option.textContent = service;
  selectFilter.appendChild(option);
});

