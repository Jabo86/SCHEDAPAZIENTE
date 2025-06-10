// Variabili globali
const dashboard = document.getElementById("dashboard");
const schedaPaziente = document.getElementById("schedaPaziente");
const inputNome = document.getElementById("inputNome");
const inputCognome = document.getElementById("inputCognome");
const inputLetto = document.getElementById("inputLetto");
const dataNascita = document.getElementById("dataNascita");
const dieta = document.getElementById("dieta");
const usaMad = document.getElementById("usaMad");
const repartoProvenienza = document.getElementById("repartoProvenienza");
const nuovoRicovero = document.getElementById("nuovoRicovero");
const cvSelect = document.getElementById("cvSelect");
const cvSize = document.getElementById("cvSize");
const cvcSelect = document.getElementById("cvcSelect");
const cvpSelect = document.getElementById("cvpSelect");
const piccSelect = document.getElementById("piccSelect");
const sedeLesione = document.getElementById("sedeLesione");
const sedeLesioneAltro = document.getElementById("sedeLesioneAltro");
const dataLesione = document.getElementById("dataLesione");
const tipoTessutoSelect = document.getElementById("tipoTessutoSelect");
const tipoTessutoAltro = document.getElementById("tipoTessutoAltro");
const stadioLesione = document.getElementById("stadioLesione");
const note = document.getElementById("note");
const btnDimetti = document.getElementById("btnDimetti");
const btnModificaMedicazione = document.getElementById("btnModificaMedicazione");
const filtroData = document.getElementById("filtroData");
const medicazioneData = document.getElementById("medicazioneData");
const medicazioneNota = document.getElementById("medicazioneNota");
const modalitaEsecuzione = document.getElementById("modalitaEsecuzione");
const intervalloMedicazione = document.getElementById("intervalloMedicazione");
const listaMedicazioni = document.getElementById("listaMedicazioni");
const alertData = document.getElementById("alertData");
const alertNota = document.getElementById("alertNota");
const listaAlert = document.getElementById("listaAlert");
const sbarSituazione = document.getElementById("sbarSituazione");
const sbarContesto = document.getElementById("sbarContesto");
const sbarValutazione = document.getElementById("sbarValutazione");
const sbarRaccomandazioni = document.getElementById("sbarRaccomandazioni");
const pressioneArteriosa = document.getElementById("pressioneArteriosa");
const frequenzaCardiaca = document.getElementById("frequenzaCardiaca");
const frequenzaRespiratoria = document.getElementById("frequenzaRespiratoria");
const temperatura = document.getElementById("temperatura");
const pesoIngresso = document.getElementById("pesoIngresso");
const spo2 = document.getElementById("spo2");
const hgt = document.getElementById("hgt");
let pazienteCorrente = null;
let pazienti = [];
let pazientiDimessi = [];
let indiceMedicazioneModifica = null;

// Funzione per calcolare l'età
function calcolaEta(dataNascita) {
  if (!dataNascita) return "Non specificata";
  const oggi = new Date();
  const nascita = new Date(dataNascita);
  let eta = oggi.getFullYear() - nascita.getFullYear();
  const meseDiff = oggi.getMonth() - nascita.getMonth();
  if (meseDiff < 0 || (meseDiff === 0 && oggi.getDate() < nascita.getDate())) {
    eta--;
  }
  return eta > 0 ? `${eta} anni` : "Meno di 1 anno";
}

// Funzione per mostrare notifiche
function mostraNotifica(messaggio, tipo = "success") {
  const toast = document.getElementById("toast");
  if (toast) {
    toast.textContent = messaggio;
    toast.className = `toast ${tipo}`;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
  }
}

// Sanitizza input per prevenire XSS
function sanitizza(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

// Normalizza i dati del paziente
function normalizzaPaziente(paziente) {
  return {
    id: paziente.id || Date.now(),
    nome: paziente.nome || "",
    cognome: paziente.cognome || "",
    letto: paziente.letto || 1,
    dataNascita: paziente.dataNascita || "",
    dieta: paziente.dieta || "",
    usaMad: paziente.usaMad || "",
    repartoProvenienza: paziente.repartoProvenienza || "",
    nuovoRicovero: paziente.nuovoRicovero !== undefined ? paziente.nuovoRicovero : false, // Valore predefinito false
    dispositivi: {
      cv: paziente.dispositivi?.cv || "",
      cvSize: paziente.dispositivi?.cvSize || "",
      cvc: paziente.dispositivi?.cvc || "",
      cvp: paziente.dispositivi?.cvp || "",
      picc: paziente.dispositivi?.picc || ""
    },
    sedeLesione: paziente.sedeLesione || "",
    dataLesione: paziente.dataLesione || "",
    tipoTessuto: paziente.tipoTessuto || "",
    stadioLesione: paziente.stadioLesione || "",
    note: paziente.note || "",
    medicazioni: Array.isArray(paziente.medicazioni) ? paziente.medicazioni.map(m => ({
      data: m.data || "",
      nota: m.nota || "",
      modalitaEsecuzione: m.modalitaEsecuzione || "",
      fatta: m.fatta || false,
      intervallo: m.intervallo || 1
    })) : [],
    alerts: Array.isArray(paziente.alerts) ? paziente.alerts.map(a => ({
      data: a.data || "",
      nota: a.nota || "",
      attivo: a.attivo !== undefined ? a.attivo : true
    })) : [],
    vitali: {
      pressioneArteriosa: paziente.vitali?.pressioneArteriosa || "",
      frequenzaCardiaca: paziente.vitali?.frequenzaCardiaca || "",
      frequenzaRespiratoria: paziente.vitali?.frequenzaRespiratoria || "",
      temperatura: paziente.vitali?.temperatura || "",
      pesoIngresso: paziente.vitali?.pesoIngresso || "",
      spo2: paziente.vitali?.spo2 || "",
      hgt: paziente.vitali?.hgt || ""
    },
    intervalloMedicazione: paziente.intervalloMedicazione || 1,
    ultimaMedicazioneFatta: paziente.ultimaMedicazioneFatta || null,
    dimesso: paziente.dimesso || false,
    ultimoControllo: paziente.ultimoControllo || "",
    sbar: {
      situazione: paziente.sbar?.situazione || "",
      contesto: paziente.sbar?.contesto || "",
      valutazione: paziente.sbar?.valutazione || "",
      raccomandazioni: paziente.sbar?.raccomandazioni || ""
    }
  };
}

// Salva i dati in localStorage
function salvaDati() {
  try {
    localStorage.setItem("pazienti", JSON.stringify(pazienti.map(normalizzaPaziente)));
    localStorage.setItem("pazientiDimessi", JSON.stringify(pazientiDimessi.map(normalizzaPaziente)));
  } catch (e) {
    console.error("Errore nel salvataggio:", e);
    mostraNotifica("Errore nel salvataggio dei dati.", "error");
  }
}

// Carica dati da localStorage
function caricaDati() {
  try {
    const pazientiSalvati = localStorage.getItem("pazienti");
    const dimessiSalvati = localStorage.getItem("pazientiDimessi");
    pazienti = pazientiSalvati ? JSON.parse(pazientiSalvati).map(normalizzaPaziente) : [];
    pazientiDimessi = dimessiSalvati ? JSON.parse(dimessiSalvati).map(normalizzaPaziente) : [];
    if (pazienti.length === 0) caricaPazientiInizializzati();
  } catch (e) {
    console.error("Errore nel caricamento:", e);
    mostraNotifica("Errore nel caricamento dei dati.", "error");
  }
}

// Carica pazienti iniziali
function caricaPazientiInizializzati() {
  pazienti = [{
    id: Date.now(),
    nome: "",
    cognome: "",
    letto: 1,
    dataNascita: "",
    dieta: "",
    usaMad: "",
    repartoProvenienza: "",
    nuovoRicovero: false, // Valore predefinito false
    dispositivi: { cv: "", cvSize: "", cvc: "", cvp: "", picc: "" },
    sedeLesione: "",
    dataLesione: "",
    tipoTessuto: "",
    stadioLesione: "",
    note: "",
    medicazioni: [],
    alerts: [],
    vitali: {
      pressioneArteriosa: "",
      frequenzaCardiaca: "",
      frequenzaRespiratoria: "",
      temperatura: "",
      pesoIngresso: "",
      spo2: "",
      hgt: ""
    },
    intervalloMedicazione: 1,
    ultimaMedicazioneFatta: null,
    dimesso: false,
    ultimoControllo: "",
    sbar: { situazione: "", contesto: "", valutazione: "", raccomandazioni: "" }
  }];
}

// Esporta dati in JSON
function esportaPazienti() {
  try {
    const dati = { pazienti, pazientiDimessi };
    const jsonStr = JSON.stringify(dati, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pazienti_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    mostraNotifica("Dati esportati correttamente!");
  } catch (e) {
    console.error("Errore durante l'esportazione:", e);
    mostraNotifica("Errore durante l'esportazione.", "error");
  }
}

// Importa dati da JSON
function importaPazienti(event) {
  const file = event.target.files[0];
  if (!file) {
    mostraNotifica("Nessun file selezionato.", "error");
    return;
  }
  if (!file.name.endsWith('.json')) {
    mostraNotifica("Seleziona un file JSON valido.", "error");
    event.target.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const dati = JSON.parse(e.target.result);
      if (!dati.pazienti || !Array.isArray(dati.pazienti) || !dati.pazientiDimessi || !Array.isArray(dati.pazientiDimessi)) {
        throw new Error("Formato JSON non valido.");
      }
      const verificaPaziente = (p) => p && typeof p === 'object' && 'id' in p && 'nome' in p && 'cognome' in p && 'letto' in p;
      if (!dati.pazienti.every(verificaPaziente) || !dati.pazientiDimessi.every(verificaPaziente)) {
        throw new Error("Dati pazienti non validi.");
      }
      const tuttiPazienti = [...dati.pazienti, ...dati.pazientiDimessi];
      const idSet = new Set(tuttiPazienti.map(p => p.id));
      const lettiAttivi = new Set(dati.pazienti.filter(p => !p.dimesso).map(p => p.letto));
      if (idSet.size !== tuttiPazienti.length) {
        throw new Error("ID duplicati trovati.");
      }
      if (lettiAttivi.size !== dati.pazienti.filter(p => !p.dimesso).length) {
        throw new Error("Letti duplicati trovati.");
      }
      pazienti = dati.pazienti.map(normalizzaPaziente);
      pazientiDimessi = dati.pazientiDimessi.map(normalizzaPaziente);
      salvaDati();
      mostraListaPazienti();
      mostraNotifica("Dati importati correttamente!");
    } catch (error) {
      console.error("Errore durante l'importazione:", error);
      mostraNotifica(`Errore: ${error.message}`, "error");
    }
    event.target.value = '';
  };
  reader.onerror = function() {
    console.error("Errore nella lettura del file.");
    mostraNotifica("Errore nella lettura del file.", "error");
    event.target.value = '';
  };
  reader.readAsText(file);
}

// Aggiungi nuovo paziente
function aggiungiPaziente() {
  const maxLetto = Math.max(...pazienti.map(p => p.letto || 0), 0);
  const nuovoPaziente = normalizzaPaziente({
    id: Date.now(),
    nome: "",
    cognome: "",
    letto: maxLetto + 1,
    dataNascita: "",
    dieta: "",
    usaMad: "",
    repartoProvenienza: "",
    nuovoRicovero: false, // Valore predefinito false
    dispositivi: { cv: "", cvSize: "", cvc: "", cvp: "", picc: "" },
    sedeLesione: "",
    dataLesione: "",
    tipoTessuto: "",
    stadioLesione: "",
    note: "",
    medicazioni: [],
    alerts: [],
    vitali: {
      pressioneArteriosa: "",
      frequenzaCardiaca: "",
      frequenzaRespiratoria: "",
      temperatura: "",
      pesoIngresso: "",
      spo2: "",
      hgt: ""
    },
    intervalloMedicazione: 1,
    ultimaMedicazioneFatta: null,
    dimesso: false,
    ultimoControllo: "",
    sbar: { situazione: "", contesto: "", valutazione: "", raccomandazioni: "" }
  });
  pazienti.push(nuovoPaziente);
  salvaDati();
  mostraScheda(nuovoPaziente.id);
  mostraNotifica("Paziente aggiunto!");
}

// Segna paziente come ricoverato
function segnaRicoverato(id) {
  const paziente = pazienti.find(p => p.id === id);
  if (!paziente) {
    mostraNotifica("Paziente non trovato.", "error");
    return;
  }
  paziente.nuovoRicovero = false;
  salvaDati();
  mostraListaPazienti();
  mostraNotifica("Paziente segnato come ricoverato!");
}

// Verifica se il paziente necessita di medicazione
function haLesioni(paziente) {
  if (paziente.dimesso) return false;
  
  // Verifica se esiste una lesione completa
  const haLesione = paziente.sedeLesione.trim() && paziente.sedeLesione !== "Altro" &&
                    paziente.dataLesione.trim() &&
                    paziente.tipoTessuto.trim() && paziente.tipoTessuto !== "Altro" &&
                    paziente.stadioLesione.trim();
  if (!haLesione) return false;

  // Se non c'è mai stata una medicazione fatta, il container è rosso
  if (!paziente.ultimaMedicazioneFatta) return true;

  // Calcola la differenza in giorni tra oggi e l'ultima medicazione
  const ultimaMedicazione = new Date(paziente.ultimaMedicazioneFatta);
  const oggi = new Date();
  // Resetta l'orario per evitare problemi di fuso orario o ore
  ultimaMedicazione.setHours(0, 0, 0, 0);
  oggi.setHours(0, 0, 0, 0);
  const diffTime = oggi - ultimaMedicazione;
  const diffGiorni = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const intervallo = paziente.intervalloMedicazione || 1;

  // Il container è rosso solo se sono passati almeno i giorni dell'intervallo
  return diffGiorni >= intervallo;
}

// Verifica se il paziente ha un alert attivo
function haAlertAttivo(paziente) {
  if (paziente.dimesso || !Array.isArray(paziente.alerts)) return false;
  return paziente.alerts.some(a => a.attivo);
}

// Mostra lista pazienti
function mostraListaPazienti() {
  if (!dashboard) {
    console.error("Elemento dashboard non trovato.");
    return;
  }
  dashboard.innerHTML = "";
  const ricoverati = pazienti.filter(p => !p.dimesso).sort((a, b) => a.letto - b.letto);
  if (ricoverati.length === 0) {
    dashboard.innerHTML = "<p>Nessun paziente ricoverato.</p>";
  } else {
    ricoverati.forEach(p => {
      const card = creaCardPaziente(p);
      dashboard.appendChild(card);
    });
  }
  if (pazientiDimessi.length > 0) {
    const div = document.createElement("div");
    div.style.gridColumn = "1 / -1";
    div.style.marginTop = "30px";
    div.innerHTML = "<hr><h3>Pazienti Dimessi</h3>";
    dashboard.appendChild(div);
    pazientiDimessi.forEach(p => {
      const card = creaCardPaziente(p, true);
      dashboard.appendChild(card);
    });
  }
}

// Crea card paziente
function creaCardPaziente(paziente, dimesso = false) {
  const card = document.createElement("div");
  card.classList.add("card");
  if (dimesso) {
    card.classList.add("dimesso");
  } else if (haLesioni(paziente)) {
    card.classList.add("red");
  }
  const alertAttivo = Array.isArray(paziente.alerts) ? paziente.alerts.find(a => a.attivo) : null;
  card.innerHTML = `
    <div class="card-content">
      ${paziente.nuovoRicovero && !dimesso ? `
        <div class="nuovo-ricovero">
          <span class="nuovo-ricovero-label">NUOVO RICOVERO</span>
          <button class="btn btn-small btn-success" onclick="segnaRicoverato(${paziente.id})" aria-label="Segna paziente come ricoverato"><i class="fas fa-check"></i> PAZIENTE RICOVERATO</button>
        </div>
      ` : ''}
      <strong>${sanitizza(paziente.nome)} ${sanitizza(paziente.cognome)}</strong>
      <div>Letto: ${sanitizza(paziente.letto)}</div>
      <div>Età: ${calcolaEta(paziente.dataNascita)}</div>
      <div>Dieta: ${sanitizza(paziente.dieta || 'Non specificata')}</div>
      <div>Usa MAD: ${sanitizza(paziente.usaMad || 'Non specificato')}</div>
      <div>Reparto: ${sanitizza(paziente.repartoProvenienza || 'Non specificato')}</div>
      <div>Stadio lesione: ${sanitizza(paziente.stadioLesione || 'Non specificato')}</div>
      <div class="intervallo-medicazione">Intervallo medicazione: ogni ${paziente.intervalloMedicazione} giorno/i</div>
      <div class="vitali-content">
        <p><strong>PA:</strong> ${sanitizza(paziente.vitali.pressioneArteriosa || 'N/D')} mmHg</p>
        <p><strong>FC:</strong> ${sanitizza(paziente.vitali.frequenzaCardiaca || 'N/D')} bpm</p>
        <p><strong>FR:</strong> ${sanitizza(paziente.vitali.frequenzaRespiratoria || 'N/D')} atti/min</p>
        <p><strong>TC:</strong> ${sanitizza(paziente.vitali.temperatura || 'N/D')} °C</p>
        <p><strong>Peso:</strong> ${sanitizza(paziente.vitali.pesoIngresso || 'N/D')} kg</p>
        <p><strong>SpO2:</strong> ${sanitizza(paziente.vitali.spo2 || 'N/D')} %</p>
        ${paziente.dieta.toLowerCase().includes("diabetica") ? `<p><strong>HGT:</strong> ${sanitizza(paziente.vitali.hgt || 'N/D')} mg/dL</p>` : ''}
      </div>
      <small>Ultimo controllo: ${paziente.ultimoControllo ? sanitizza(paziente.ultimoControllo) : 'Mai'}</small>
      <div class="sbar-content">
        <p><strong>Situazione:</strong> ${sanitizza(paziente.sbar.situazione || 'Non specificata')}</p>
        <p><strong>Contesto:</strong> ${sanitizza(paziente.sbar.contesto || 'Non specificato')}</p>
        <p><strong>Valutazione:</strong> ${sanitizza(paziente.sbar.valutazione || 'Non specificata')}</p>
        <p><strong>Raccomandazioni:</strong> ${sanitizza(paziente.sbar.raccomandazioni || 'Non specificate')}</p>
      </div>
      ${alertAttivo ? `
        <div class="alert-content">
          <p><strong><span class="alert-highlight">Alert:</span></strong> <span class="alert-highlight">${sanitizza(alertAttivo.data)} - ${sanitizza(alertAttivo.nota)}</span></p>
        </div>
      ` : ''}
    </div>
  `;
  card.dataset.id = paziente.id;
  card.setAttribute("aria-label", `Scheda paziente ${sanitizza(paziente.nome)} ${sanitizza(paziente.cognome)}, letto ${paziente.letto}`);
  card.tabIndex = 0;
  card.onclick = () => mostraScheda(paziente.id);
  card.onkeydown = e => { if (e.key === "Enter") mostraScheda(paziente.id); };
  return card;
}

// Mostra scheda paziente
function mostraScheda(id) {
  const paziente = pazienti.find(p => p.id === id) || pazientiDimessi.find(p => p.id === id);
  if (!paziente) {
    mostraNotifica("Paziente non trovato.", "error");
    return;
  }
  pazienteCorrente = paziente;
  if (!schedaPaziente || !dashboard) {
    console.error("Elementi schedaPaziente o dashboard non trovati.");
    return;
  }
  schedaPaziente.style.display = "block";
  dashboard.style.display = "none";
  inputNome.value = paziente.nome;
  inputCognome.value = paziente.cognome;
  inputLetto.value = paziente.letto;
  dataNascita.value = paziente.dataNascita;
  dieta.value = paziente.dieta;
  usaMad.value = paziente.usaMad;
  repartoProvenienza.value = paziente.repartoProvenienza;
  nuovoRicovero.value = paziente.nuovoRicovero ? "true" : "false";
  cvSelect.value = paziente.dispositivi.cv;
  cvSize.value = paziente.dispositivi.cvSize;
  cvcSelect.value = paziente.dispositivi.cvc;
  cvpSelect.value = paziente.dispositivi.cvp;
  piccSelect.value = paziente.dispositivi.picc;
  sedeLesione.value = ["Sacro", "Calcagno destro", "Calcagno sinistro", "Trocantere destro", "Trocantere sinistro", "Gomito destro", "Gomito sinistro", "Malleolo destro", "Malleolo sinistro", "Occipite", "Scapola destra", "Scapola sinistra", "Orecchio destro", "Orecchio sinistro", "Tallone", "Colonna vertebrale", "Glande"].includes(paziente.sedeLesione) ? paziente.sedeLesione : (paziente.sedeLesione ? "Altro" : "");
  sedeLesioneAltro.value = sedeLesione.value === "Altro" ? paziente.sedeLesione : "";
  document.getElementById("sedeLesioneAltroContainer").style.display = sedeLesione.value === "Altro" ? "block" : "none";
  dataLesione.value = paziente.dataLesione;
  tipoTessutoSelect.value = ["Necrosi", "Fibrina", "Granulazione", "Epiteliizzazione", "Essudato"].includes(paziente.tipoTessuto) ? paziente.tipoTessuto : (paziente.tipoTessuto ? "Altro" : "");
  tipoTessutoAltro.value = tipoTessutoSelect.value === "Altro" ? paziente.tipoTessuto : "";
  document.getElementById("tipoTessutoAltroContainer").style.display = tipoTessutoSelect.value === "Altro" ? "block" : "none";
  stadioLesione.value = paziente.stadioLesione;
  note.value = paziente.note;
  sbarSituazione.value = paziente.sbar.situazione;
  sbarContesto.value = paziente.sbar.contesto;
  sbarValutazione.value = paziente.sbar.valutazione;
  sbarRaccomandazioni.value = paziente.sbar.raccomandazioni;
  pressioneArteriosa.value = paziente.vitali.pressioneArteriosa;
  frequenzaCardiaca.value = paziente.vitali.frequenzaCardiaca;
  frequenzaRespiratoria.value = paziente.vitali.frequenzaRespiratoria;
  temperatura.value = paziente.vitali.temperatura;
  pesoIngresso.value = paziente.vitali.pesoIngresso;
  spo2.value = paziente.vitali.spo2;
  hgt.value = paziente.vitali.hgt;
  hgt.disabled = !paziente.dieta.toLowerCase().includes("diabetica");
  intervalloMedicazione.value = paziente.intervalloMedicazione;
  btnDimetti.disabled = paziente.dimesso;
  mostraMedicazioni(paziente.medicazioni);
  mostraAlert(paziente.alerts);
  filtroData.value = "";
  medicazioneData.value = "";
  medicazioneNota.value = "";
  modalitaEsecuzione.value = "";
  alertData.value = "";
  alertNota.value = "";
  btnModificaMedicazione.style.display = "none";
  indiceMedicazioneModifica = null;
}

// Salva scheda
function salvaScheda() {
  if (!pazienteCorrente) return;
  if (!inputNome.value.trim() || !inputCognome.value.trim()) {
    mostraNotifica("Nome e Cognome sono obbligatori.", "error");
    return;
  }
  const nuovoLetto = parseInt(inputLetto.value);
  if (nuovoLetto < 1) {
    mostraNotifica("Letto deve essere maggiore di 0.", "error");
    return;
  }
  const lettoOccupato = pazienti.some(p => p.id !== pazienteCorrente.id && !p.dimesso && p.letto === nuovoLetto);
  if (lettoOccupato) {
    mostraNotifica("Letto già occupato.", "error");
    return;
  }
  if (!sbarSituazione.value.trim() || !sbarContesto.value.trim() || !sbarValutazione.value.trim() || !sbarRaccomandazioni.value.trim()) {
    mostraNotifica("Tutti i campi SBAR sono obbligatori.", "error");
    return;
  }
  pazienteCorrente.nome = inputNome.value.trim();
  pazienteCorrente.cognome = inputCognome.value.trim();
  pazienteCorrente.letto = nuovoLetto;
  pazienteCorrente.dataNascita = dataNascita.value;
  pazienteCorrente.dieta = dieta.value.trim();
  pazienteCorrente.usaMad = usaMad.value;
  pazienteCorrente.repartoProvenienza = repartoProvenienza.value.trim();
  pazienteCorrente.nuovoRicovero = nuovoRicovero.value === "true";
  pazienteCorrente.dispositivi = {
    cv: cvSelect.value,
    cvSize: cvSize.value.trim(),
    cvc: cvcSelect.value,
    cvp: cvpSelect.value,
    picc: piccSelect.value
  };
  pazienteCorrente.sedeLesione = sedeLesione.value === "Altro" ? sedeLesioneAltro.value.trim() : sedeLesione.value;
  pazienteCorrente.dataLesione = dataLesione.value;
  pazienteCorrente.tipoTessuto = tipoTessutoSelect.value === "Altro" ? tipoTessutoAltro.value.trim() : tipoTessutoSelect.value;
  pazienteCorrente.stadioLesione = stadioLesione.value;
  pazienteCorrente.note = note.value.trim();
  pazienteCorrente.sbar = {
    situazione: sbarSituazione.value.trim(),
    contesto: sbarContesto.value.trim(),
    valutazione: sbarValutazione.value.trim(),
    raccomandazioni: sbarRaccomandazioni.value.trim()
  };
  pazienteCorrente.vitali = {
    pressioneArteriosa: pressioneArteriosa.value.trim(),
    frequenzaCardiaca: frequenzaCardiaca.value,
    frequenzaRespiratoria: frequenzaRespiratoria.value,
    temperatura: temperatura.value,
    pesoIngresso: pesoIngresso.value,
    spo2: spo2.value,
    hgt: pazienteCorrente.dieta.toLowerCase().includes("diabetica") ? hgt.value : ""
  };
  pazienteCorrente.intervalloMedicazione = parseInt(intervalloMedicazione.value);
  pazienteCorrente.ultimoControllo = new Date().toISOString().slice(0, 10);
  salvaDati();
  mostraListaPazienti();
  mostraNotifica("Scheda salvata correttamente!");
}

// Aggiungi medicazione
function aggiungiMedicazione() {
  if (!pazienteCorrente) {
    mostraNotifica("Seleziona un paziente.", "error");
    return;
  }
  const data = medicazioneData.value;
  const nota = medicazioneNota.value.trim();
  const intervallo = parseInt(intervalloMedicazione.value);
  if (!data || !nota) {
    mostraNotifica("Data e nota sono obbligatori.", "error");
    return;
  }
  pazienteCorrente.medicazioni.push({
    data,
    nota,
    modalitaEsecuzione: modalitaEsecuzione.value.trim(),
    fatta: false,
    intervallo
  });
  pazienteCorrente.intervalloMedicazione = intervallo;
  medicazioneData.value = "";
  medicazioneNota.value = "";
  modalitaEsecuzione.value = "";
  mostraMedicazioni(pazienteCorrente.medicazioni);
  salvaScheda();
}

// Segna medicazione come fatta
function segnaMedicazioneFatta(indice) {
  if (!pazienteCorrente || !pazienteCorrente.medicazioni[indice]) return;
  pazienteCorrente.medicazioni[indice].fatta = true;
  pazienteCorrente.ultimaMedicazioneFatta = new Date().toISOString().slice(0, 10);
  mostraMedicazioni(pazienteCorrente.medicazioni);
  salvaScheda();
  mostraListaPazienti();
  mostraNotifica("Medicazione completata!");
}

// Modifica medicazione
function modificaMedicazione(indice) {
  if (!pazienteCorrente || !pazienteCorrente.medicazioni[indice]) return;
  const medicazione = pazienteCorrente.medicazioni[indice];
  medicazioneData.value = medicazione.data;
  medicazioneNota.value = medicazione.nota;
  modalitaEsecuzione.value = medicazione.modalitaEsecuzione;
  intervalloMedicazione.value = medicazione.intervallo;
  btnModificaMedicazione.style.display = "inline-block";
  indiceMedicazioneModifica = indice;
}

// Conferma modifica medicazione
function confermaModificaMedicazione() {
  if (indiceMedicazioneModifica === null || !pazienteCorrente) return;
  const data = medicazioneData.value;
  const nota = medicazioneNota.value.trim();
  const intervallo = parseInt(intervalloMedicazione.value);
  if (!data || !nota) {
    mostraNotifica("Data e nota sono obbligatori.", "error");
    return;
  }
  pazienteCorrente.medicazioni[indiceMedicazioneModifica] = {
    data,
    nota,
    modalitaEsecuzione: modalitaEsecuzione.value.trim(),
    fatta: pazienteCorrente.medicazioni[indiceMedicazioneModifica].fatta,
    intervallo
  };
  pazienteCorrente.intervalloMedicazione = intervallo;
  medicazioneData.value = "";
  medicazioneNota.value = "";
  modalitaEsecuzione.value = "";
  btnModificaMedicazione.style.display = "none";
  indiceMedicazioneModifica = null;
  mostraMedicazioni(pazienteCorrente.medicazioni);
  salvaScheda();
}

// Elimina medicazione
function eliminaMedicazione(indice) {
  if (!pazienteCorrente || !pazienteCorrente.medicazioni[indice]) return;
  if (confirm("Eliminare questa medicazione?")) {
    pazienteCorrente.medicazioni.splice(indice, 1);
    mostraMedicazioni(pazienteCorrente.medicazioni);
    salvaScheda();
    mostraNotifica("Medicazione eliminata!");
  }
}

// Mostra medicazioni
function mostraMedicazioni(medicazioni) {
  if (!listaMedicazioni) return;
  listaMedicazioni.innerHTML = "";
  if (!medicazioni || medicazioni.length === 0) {
    listaMedicazioni.innerHTML = "<li>Nessuna medicazione registrata.</li>";
    return;
  }
  medicazioni.sort((a, b) => a.data.localeCompare(b.data));
  medicazioni.forEach((m, indice) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${sanitizza(m.data)}: ${sanitizza(m.nota)}</strong> ${m.fatta ? '<span style="color: green;">(Completata)</span>' : ''}
      <div class="medicazione-details">
        <p><strong>Modalità:</strong> ${sanitizza(m.modalitaEsecuzione || 'Non specificata')}</p>
        <p><strong>Intervallo:</strong> Ogni ${m.intervallo} giorno/i</p>
      </div>
      <div>
        ${!m.fatta ? `<button class="btn btn-small btn-success" onclick="segnaMedicazioneFatta(${indice})" aria-label="Segna medicazione come fatta"><i class="fas fa-check"></i> Fatto</button>` : ''}
        <button class="btn btn-small" onclick="modificaMedicazione(${indice})" aria-label="Modifica medicazione"><i class="fas fa-edit"></i> Modifica</button>
        <button class="btn btn-small btn-danger" onclick="eliminaMedicazione(${indice})" aria-label="Elimina medicazione"><i class="fas fa-trash"></i> Elimina</button>
      </div>
    `;
    listaMedicazioni.appendChild(li);
  });
}

// Filtra medicazioni
function filtraMedicazioni() {
  if (!pazienteCorrente || !filtroData) return;
  const filtro = filtroData.value;
  if (!filtro) {
    mostraMedicazioni(pazienteCorrente.medicazioni);
  } else {
    const filtrate = pazienteCorrente.medicazioni.filter(m => m.data === filtro);
    mostraMedicazioni(filtrate);
  }
}

// Aggiungi alert
function aggiungiAlert() {
  if (!pazienteCorrente) {
    mostraNotifica("Seleziona un paziente.", "error");
    return;
  }
  const data = alertData.value;
  const nota = alertNota.value.trim();
  if (!data || !nota) {
    mostraNotifica("Data e nota dell'alert sono obbligatori.", "error");
    return;
  }
  pazienteCorrente.alerts.push({
    data,
    nota,
    attivo: true
  });
  alertData.value = "";
  alertNota.value = "";
  mostraAlert(pazienteCorrente.alerts);
  salvaDati();
  mostraListaPazienti();
  mostraNotifica("Alert aggiunto!");
}

// Segna alert come completato
function segnaAlertCompletato(indice) {
  if (!pazienteCorrente || !pazienteCorrente.alerts[indice]) return;
  pazienteCorrente.alerts[indice].attivo = false;
  mostraAlert(pazienteCorrente.alerts);
  salvaDati();
  mostraListaPazienti();
  mostraNotifica("Alert completato!");
}

// Mostra alert
function mostraAlert(alerts) {
  if (!listaAlert) return;
  listaAlert.innerHTML = "";
  if (!alerts || alerts.length === 0) {
    listaAlert.innerHTML = "<li>Nessun alert registrato.</li>";
    return;
  }
  alerts.sort((a, b) => a.data.localeCompare(b.data));
  alerts.forEach((a, indice) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${sanitizza(a.data)}: ${sanitizza(a.nota)}</strong> ${a.attivo ? '<span style="color: orange;">(Attivo)</span>' : '<span style="color: green;">(Completato)</span>'}
      <div>
        ${a.attivo ? `<button class="btn btn-small btn-success" onclick="segnaAlertCompletato(${indice})" aria-label="Segna alert come completato"><i class="fas fa-check"></i> Fatto</button>` : ''}
      </div>
    `;
    listaAlert.appendChild(li);
  });
}

// Torna alla dashboard
function tornaAllaDashboard() {
  salvaScheda();
  pazienteCorrente = null;
  if (schedaPaziente && dashboard) {
    schedaPaziente.style.display = "none";
    dashboard.style.display = "grid";
  }
}

// Dimetti paziente
function dimettiPaziente() {
  if (!pazienteCorrente) return;
  if (pazienteCorrente.dimesso) {
    mostraNotifica("Paziente già dimesso.", "error");
    return;
  }
  if (!confirm(`Dimettere ${pazienteCorrente.nome} ${pazienteCorrente.cognome}?`)) return;
  pazienteCorrente.dimesso = true;
  pazienti = pazienti.filter(p => p.id !== pazienteCorrente.id);
  pazientiDimessi.push(pazienteCorrente);
  salvaDati();
  tornaAllaDashboard();
  mostraNotifica("Paziente dimesso!");
}

// Stampa scheda
function stampaScheda() {
  if (!pazienteCorrente) {
    mostraNotifica("Seleziona un paziente.", "error");
    return;
  }
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>Scheda Paziente - ${sanitizza(pazienteCorrente.nome)} ${sanitizza(pazienteCorrente.cognome)}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
          h1 { text-align: center; font-size: 1.8rem; color: #1a3c5a; }
          h2 { font-size: 1.2rem; margin-top: 20px; color: #333; }
          p { margin: 5px 0; }
          .section { margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
          .label { font-weight: bold; display: inline-block; width: 150px; }
          ul { list-style: none; padding: 0; }
          ul li { margin-bottom: 10px; }
          .medicazione-details { margin-left: 20px; font-size: 0.9rem; }
        </style>
      </head>
      <body>
        <h1>Scheda Paziente</h1>
        <div class="section">
          <p><span class="label">Nome:</span> ${sanitizza(pazienteCorrente.nome)}</p>
          <p><span class="label">Cognome:</span> ${sanitizza(pazienteCorrente.cognome)}</p>
          <p><span class="label">Letto n°:</span> ${sanitizza(pazienteCorrente.letto)}</p>
          <p><span class="label">Età:</span> ${calcolaEta(pazienteCorrente.dataNascita)}</p>
          <p><span class="label">Dieta:</span> ${sanitizza(pazienteCorrente.dieta || 'Non specificata')}</p>
          <p><span class="label">Usa MAD:</span> ${sanitizza(pazienteCorrente.usaMad || 'Non specificato')}</p>
          <p><span class="label">Reparto:</span> ${sanitizza(pazienteCorrente.repartoProvenienza || 'Non specificato')}</p>
        </div>
        <div class="section">
          <h2>Metodo SBAR</h2>
          <p><span class="label">Situazione:</span> ${sanitizza(pazienteCorrente.sbar.situazione || 'Non specificata')}</p>
          <p><span class="label">Contesto:</span> ${sanitizza(pazienteCorrente.sbar.contesto || 'Non specificato')}</p>
          <p><span class="label">Valutazione:</span> ${sanitizza(pazienteCorrente.sbar.valutazione || 'Non specificata')}</p>
          <p><span class="label">Raccomandazioni:</span> ${sanitizza(pazienteCorrente.sbar.raccomandazioni || 'Non specificate')}</p>
        </div>
        <div class="section">
          <h2>Parametri Vitali</h2>
          <p><span class="label">Pressione Arteriosa:</span> ${sanitizza(pazienteCorrente.vitali.pressioneArteriosa || 'N/D')} mmHg</p>
          <p><span class="label">Frequenza Cardiaca:</span> ${sanitizza(pazienteCorrente.vitali.frequenzaCardiaca || 'N/D')} bpm</p>
          <p><span class="label">Frequenza Respiratoria:</span> ${sanitizza(pazienteCorrente.vitali.frequenzaRespiratoria || 'N/D')} atti/min</p>
          <p><span class="label">Temperatura:</span> ${sanitizza(pazienteCorrente.vitali.temperatura || 'N/D')} °C</p>
          <p><span class="label">Peso all'ingresso:</span> ${sanitizza(pazienteCorrente.vitali.pesoIngresso || 'N/D')} kg</p>
          <p><span class="label">SpO2:</span> ${sanitizza(pazienteCorrente.vitali.spo2 || 'N/D')} %</p>
          ${pazienteCorrente.dieta.toLowerCase().includes("diabetica") ? `<p><span class="label">HGT:</span> ${sanitizza(pazienteCorrente.vitali.hgt || 'N/D')} mg/dL</p>` : ""}
        </div>
        <div class="section">
          <h2>Dispositivi presenti</h2>
          <p><span class="label">CV:</span> ${sanitizza(pazienteCorrente.dispositivi.cv || 'Nessuno')} ${pazienteCorrente.dispositivi.cvSize ? `(${sanitizza(pazienteCorrente.dispositivi.cvSize)})` : ''}</p>
          <p><span class="label">CVC:</span> ${sanitizza(pazienteCorrente.dispositivi.cvc || 'Nessuno')}</p>
          <p><span class="label">CVP:</span> ${sanitizza(pazienteCorrente.dispositivi.cvp || 'Nessuno')}</p>
          <p><span class="label">PICC:</span> ${sanitizza(pazienteCorrente.dispositivi.picc || 'Nessuno')}</p>
        </div>
        <div class="section">
          <h2>Lesione</h2>
          <p><span class="label">Sede:</span> ${sanitizza(pazienteCorrente.sedeLesione || 'Non specificata')}</p>
          <p><span class="label">Data rilevazione:</span> ${sanitizza(pazienteCorrente.dataLesione || 'Non specificata')}</p>
          <p><span class="label">Tipo di tessuto:</span> ${sanitizza(pazienteCorrente.tipoTessuto || 'Non specificato')}</p>
          <p><span class="label">Stadio:</span> ${sanitizza(pazienteCorrente.stadioLesione || 'Non specificato')}</p>
          <p><span class="label">Intervallo Medicazione:</span> Ogni ${pazienteCorrente.intervalloMedicazione} giorno/i</p>
        </div>
        <div class="section">
          <h2>Note</h2>
          <p><span class="label">Annotazioni cliniche:</span> ${sanitizza(pazienteCorrente.note || 'Nessuna')}</p>
        </div>
        <div class="section">
          <h2>Storico Medicazioni</h2>
          <ul>
            ${pazienteCorrente.medicazioni.length ? pazienteCorrente.medicazioni.map(m => `
              <li>
                ${sanitizza(m.data)}: ${sanitizza(m.nota)} ${m.fatta ? '(Completata)' : '(Non completata)'}
                <div class="medicazione-details">
                  <p><strong>Modalità:</strong> ${sanitizza(m.modalitaEsecuzione || 'Non specificata')}</p>
                  <p><strong>Intervallo:</strong> Ogni ${m.intervallo} giorno/i</p>
                </div>
              </li>
            `).join('') : '<li>Nessuna medicazione registrata.</li>'}
          </ul>
        </div>
        <div class="section">
          <h2>Storico Alert</h2>
          <ul>
            ${pazienteCorrente.alerts.length ? pazienteCorrente.alerts.map(a => `
              <li>
                ${sanitizza(a.data)}: ${sanitizza(a.nota)} ${a.attivo ? '(Attivo)' : '(Completato)'}
              </li>
            `).join('') : '<li>Nessun alert registrato.</li>'}
          </ul>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  setTimeout(() => printWindow.print(), 100);
}

// Stampa dashboard
function stampaDashboard() {
  const printWindow = window.open('', '_blank');
  const timestamp = new Date().toLocaleString('it-IT');
  let content = `
    <html>
      <head>
        <title>Dashboard Pazienti</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20mm; line-height: 1.4; }
          h1 { text-align: center; font-size: 1.8rem; color: #1a3c5a; }
          h3 { font-size: 1.2rem; margin-top: 10mm; }
          p.timestamp { text-align: center; font-size: 10pt; color: #555; margin-bottom: 10mm; }
          .grid-container { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10mm; }
          .card { border: 1px solid #ccc; padding: 5mm; background: #fff; color: #000; font-size: 10pt; page-break-inside: avoid; }
          .card.red { border: 2px solid red; }
          .card.dimesso { border: 1px dashed #555; color: #555; font-style: italic; }
          .card-content, .sbar-content, .vitali-content, .alert-content { color: #000; }
          .card small { color: #555; font-size: 8pt; }
          .alert-highlight { background-color: #ffd700; color: #333; padding: 2px 4px; border-radius: 4px; }
          .intervallo-medicazione { font-size: 8pt; color: #555; }
          .nuovo-ricovero { background: #fff; color: #000; border: 1px solid #3f8efc; padding: 5px; margin-bottom: 5mm; }
          .nuovo-ricovero-label { background-color: #3f8efc; color: #fff; padding: 2px 6px; border-radius: 4px; }
          hr { border-top: 1px solid #ccc; margin: 10mm 0; }
          .page-break { page-break-before: always; }
          @page { size: A4; margin: 20mm; }
        </style>
      </head>
      <body>
        <h1>Dashboard Pazienti</h1>
        <p class="timestamp">Stampata il ${timestamp}</p>
  `;
  const ricoverati = pazienti.filter(p => !p.dimesso).sort((a, b) => a.letto - b.letto);
  let cardCount = 0;
  if (ricoverati.length > 0) {
    content += `<h3>Ricoverati</h3><div class="grid-container">`;
    ricoverati.forEach(p => {
      if (cardCount > 0 && cardCount % 6 === 0) content += `</div><div class="page-break"></div><div class="grid-container">`;
      const alertAttivo = p.alerts.find(a => a.attivo);
      content += `
        <div class="card ${haLesioni(p) ? 'red' : ''}">
          <div class="card-content">
            ${p.nuovoRicovero ? `
              <div class="nuovo-ricovero">
                <span class="nuovo-ricovero-label">NUOVO RICOVERO</span>
              </div>
            ` : ''}
            <strong>${sanitizza(p.nome)} ${sanitizza(p.cognome)}</strong>
            <div>Letto: ${sanitizza(p.letto)}</div>
            <div>Età: ${calcolaEta(p.dataNascita)}</div>
            <div>Dieta: ${sanitizza(p.dieta || 'Non specificata')}</div>
            <div>Usa MAD: ${sanitizza(p.usaMad || 'Non specificato')}</div>
            <div>Reparto: ${sanitizza(p.repartoProvenienza || 'Non specificato')}</div>
            <div>Stadio lesione: ${sanitizza(p.stadioLesione || 'Non specificato')}</div>
            <div class="intervallo-medicazione">Intervallo medicazione: ogni ${p.intervalloMedicazione} giorno/i</div>
            <div class="vitali-content">
              <p><strong>PA:</strong> ${sanitizza(p.vitali.pressioneArteriosa || 'N/D')} mmHg</p>
              <p><strong>FC:</strong> ${sanitizza(p.vitali.frequenzaCardiaca || 'N/D')} bpm</p>
              <p><strong>FR:</strong> ${sanitizza(p.vitali.frequenzaRespiratoria || 'N/D')} atti/min</p>
              <p><strong>TC:</strong> ${sanitizza(p.vitali.temperatura || 'N/D')} °C</p>
              <p><strong>Peso:</strong> ${sanitizza(p.vitali.pesoIngresso || 'N/D')} kg</p>
              <p><strong>SpO2:</strong> ${sanitizza(p.vitali.spo2 || 'N/D')} %</p>
              ${p.dieta.toLowerCase().includes("diabetica") ? `<p><strong>HGT:</strong> ${sanitizza(p.vitali.hgt || 'N/D')} mg/dL</p>` : ''}
            </div>
            <small>Ultimo controllo: ${p.ultimoControllo ? sanitizza(p.ultimoControllo) : 'Mai'}</small>
            <div class="sbar-content">
              <p><strong>Situazione:</strong> ${sanitizza(p.sbar.situazione || 'Non specificata')}</p>
              <p><strong>Contesto:</strong> ${sanitizza(p.sbar.contesto || 'Non specificato')}</p>
              <p><strong>Valutazione:</strong> ${sanitizza(p.sbar.valutazione || 'Non specificata')}</p>
              <p><strong>Raccomandazioni:</strong> ${sanitizza(p.sbar.raccomandazioni || 'Non specificate')}</p>
            </div>
            ${alertAttivo ? `
              <div class="alert-content">
                <p><strong><span class="alert-highlight">Alert:</span></strong> <span class="alert-highlight">${sanitizza(alertAttivo.data)} - ${sanitizza(alertAttivo.nota)}</span></p>
              </div>
            ` : ''}
          </div>
        </div>
      `;
      cardCount++;
    });
    content += `</div>`;
  } else {
    content += `<p>Nessun paziente ricoverato.</p>`;
  }
  if (pazientiDimessi.length > 0) {
    content += `<hr><h3>Pazienti Dimessi</h3><div class="grid-container">`;
    pazientiDimessi.forEach(p => {
      if (cardCount > 0 && cardCount % 6 === 0) content += `</div><div class="page-break"></div><div class="grid-container">`;
      const alertAttivo = p.alerts.find(a => a.attivo);
      content += `
        <div class="card dimesso">
          <div class="card-content">
            <strong>${sanitizza(p.nome)} ${sanitizza(p.cognome)}</strong>
            <div>Letto: ${sanitizza(p.letto)}</div>
            <div>Età: ${calcolaEta(p.dataNascita)}</div>
            <div>Dieta: ${sanitizza(p.dieta || 'Non specificata')}</div>
            <div>Usa MAD: ${sanitizza(p.usaMad || 'Non specificato')}</div>
            <div>Reparto: ${sanitizza(p.repartoProvenienza || 'Non specificato')}</div>
            <div>Stadio lesione: ${sanitizza(p.stadioLesione || 'Non specificato')}</div>
            <div class="intervallo-medicazione">Intervallo medicazione: ogni ${p.intervalloMedicazione} giorno/i</div>
            <div class="vitali-content">
              <p><strong>PA:</strong> ${sanitizza(p.vitali.pressioneArteriosa || 'N/D')} mmHg</p>
              <p><strong>FC:</strong> ${sanitizza(p.vitali.frequenzaCardiaca || 'N/D')} bpm</p>
              <p><strong>FR:</strong> ${sanitizza(p.vitali.frequenzaRespiratoria || 'N/D')} atti/min</p>
              <p><strong>TC:</strong> ${sanitizza(p.vitali.temperatura || 'N/D')} °C</p>
              <p><strong>Peso:</strong> ${sanitizza(p.vitali.pesoIngresso || 'N/D')} kg</p>
              <p><strong>SpO2:</strong> ${sanitizza(p.vitali.spo2 || 'N/D')} %</p>
              ${p.dieta.toLowerCase().includes("diabetica") ? `<p><strong>HGT:</strong> ${sanitizza(p.vitali.hgt || 'N/D')} mg/dL</p>` : ''}
            </div>
            <small>Ultimo controllo: ${p.ultimoControllo ? sanitizza(p.ultimoControllo) : 'Mai'}</small>
            <div class="sbar-content">
              <p><strong>Situazione:</strong> ${sanitizza(p.sbar.situazione || 'Non specificata')}</p>
              <p><strong>Contesto:</strong> ${sanitizza(p.sbar.contesto || 'Non specificato')}</p>
              <p><strong>Valutazione:</strong> ${sanitizza(p.sbar.valutazione || 'Non specificata')}</p>
              <p><strong>Raccomandazioni:</strong> ${sanitizza(p.sbar.raccomandazioni || 'Non specificate')}</p>
            </div>
            ${alertAttivo ? `
              <div class="alert-content">
                <p><strong><span class="alert-highlight">Alert:</span></strong> <span class="alert-highlight">${sanitizza(alertAttivo.data)} - ${sanitizza(alertAttivo.nota)}</span></p>
              </div>
            ` : ''}
          </div>
        </div>
      `;
      cardCount++;
    });
    content += `</div>`;
  }
  content += `</body></html>`;
  try {
    printWindow.document.write(content);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 100);
  } catch (e) {
    console.error("Errore durante la stampa:", e);
    mostraNotifica("Errore durante la stampa.", "error");
    printWindow.close();
  }
}

// Inizializzazione
function init() {
  caricaDati();
  mostraListaPazienti();
  const inputs = [
    inputNome, inputCognome, inputLetto, dataNascita, dieta, usaMad, repartoProvenienza,
    cvSelect, cvSize, cvcSelect, cvpSelect, piccSelect, sedeLesione, sedeLesioneAltro,
    dataLesione, tipoTessutoSelect, tipoTessutoAltro, stadioLesione, note,
    medicazioneNota, modalitaEsecuzione, alertNota, intervalloMedicazione,
    pressioneArteriosa, frequenzaCardiaca, frequenzaRespiratoria, temperatura,
    pesoIngresso, spo2, hgt, sbarSituazione, sbarContesto, sbarValutazione, sbarRaccomandazioni
  ];
  inputs.forEach(input => {
    if (input) {
      input.addEventListener("input", () => { if (pazienteCorrente) salvaScheda(); });
      input.addEventListener("change", () => { if (pazienteCorrente) salvaScheda(); });
    }
  });
  if (sedeLesione) {
    sedeLesione.addEventListener("change", () => {
      const container = document.getElementById("sedeLesioneAltroContainer");
      if (container) {
        container.style.display = sedeLesione.value === "Altro" ? "block" : "none";
        if (sedeLesione.value !== "Altro") sedeLesioneAltro.value = "";
        if (pazienteCorrente) salvaScheda();
      }
    });
  }
  if (tipoTessutoSelect) {
    tipoTessutoSelect.addEventListener("change", () => {
      const container = document.getElementById("tipoTessutoAltroContainer");
      if (container) {
        container.style.display = tipoTessutoSelect.value === "Altro" ? "block" : "none";
        if (tipoTessutoSelect.value !== "Altro") tipoTessutoAltro.value = "";
        if (pazienteCorrente) salvaScheda();
      }
    });
  }
  if (dieta && hgt) {
    dieta.addEventListener("input", () => {
      hgt.disabled = !dieta.value.toLowerCase().includes("diabetica");
      if (hgt.disabled) hgt.value = "";
      if (pazienteCorrente) salvaScheda();
    });
  }
}

// Esegui inizializzazione
document.addEventListener("DOMContentLoaded", init);
