import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ============ i18n MESSAGES D'ERREUR ============ */
function getCurrentLang() {
  return localStorage.getItem('everlia_lang') || 'it';
}

const errorMessages = {
  it: {
    required: 'Campo obbligatorio',
    select: "Seleziona un'opzione",
    photo: 'Foto obbligatoria',
    invalidEmail: 'Indirizzo e-mail non valido'
  },
  en: {
    required: 'Required field',
    select: 'Please select an option',
    photo: 'Photo required',
    invalidEmail: 'Invalid email address'
  },
  fr: {
    required: 'Champ obligatoire',
    select: 'Veuillez sélectionner une option',
    photo: 'Photo obligatoire',
    invalidEmail: 'Adresse e-mail invalide'
  }
};

function t(key) {
  const lang = getCurrentLang();
  return (errorMessages[lang] || errorMessages.fr)[key];
}

/* ============ PHOTOS ============ */
const photos = { recto: null, verso: null, selfie: null };

document.querySelectorAll('.photo-slot').forEach((slot) => {
  const key = slot.dataset.key;
  const facing = slot.dataset.facing || 'environment';
  const emptyEl = slot.querySelector('.photo-empty');
  const imgEl = slot.querySelector('.photo-img');
  const fileInput = slot.querySelector('input[type=file]');
  const camBtn = slot.querySelector('.js-cam');
  const removeBtn = slot.querySelector('.js-photo-remove');
  const errorEl = slot.querySelector('.photo-error');

  const showEmpty = () => {
    if (imgEl) { imgEl.src = ''; imgEl.style.display = 'none'; }
    if (emptyEl) emptyEl.style.display = '';
    slot.classList.remove('filled');
  };

  const showImage = (url) => {
    if (imgEl) { imgEl.src = url; imgEl.style.display = 'block'; }
    if (emptyEl) emptyEl.style.display = 'none';
    slot.classList.add('filled');
  };

  const apply = (fileOrBlob) => {
    photos[key] = fileOrBlob;
    showImage(URL.createObjectURL(fileOrBlob));
    slot.classList.remove('invalid');
    if (removeBtn) removeBtn.hidden = false;
    if (errorEl) errorEl.classList.remove('visible');
  };

  camBtn.addEventListener('click', () => openCamera(facing, apply));
  fileInput.addEventListener('change', (e) => {
    const f = e.target.files[0];
    if (f) apply(f);
    fileInput.value = '';
  });

  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      photos[key] = null;
      showEmpty();
      removeBtn.hidden = true;
    });
  }
});

/* ============ CAMERA ============ */
const camModal = document.getElementById('cam-modal');
const camVideo = document.getElementById('cam-video');
let camStream = null;
let camCallback = null;

async function openCamera(facing, cb) {
  camCallback = cb;
  try {
    camStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: facing }, audio: false
    });
    camVideo.srcObject = camStream;
    camModal.hidden = false;
    await camVideo.play();
  } catch (err) {
    alert("Impossible d'accéder à la caméra. Utilisez « Choisir » pour importer une photo.");
  }
}

function closeCamera() {
  if (camStream) { camStream.getTracks().forEach(t => t.stop()); camStream = null; }
  camVideo.srcObject = null;
  camModal.hidden = true;
  camCallback = null;
}

document.getElementById('cam-close').addEventListener('click', closeCamera);
document.getElementById('cam-shot').addEventListener('click', () => {
  const canvas = document.createElement('canvas');
  canvas.width = camVideo.videoWidth || 720;
  canvas.height = camVideo.videoHeight || 540;
  canvas.getContext('2d').drawImage(camVideo, 0, 0, canvas.width, canvas.height);
  canvas.toBlob((blob) => {
    if (blob && camCallback) camCallback(blob);
    closeCamera();
  }, 'image/jpeg', 0.85);
});

/* ============ VALIDATION ============ */
const form = document.getElementById('apply-form');
const submitBtn = document.getElementById('submit-btn');
const successModal = document.getElementById('success-modal');

function clearErrors() {
  document.querySelectorAll('.field-error.visible').forEach(el => el.classList.remove('visible'));
  document.querySelectorAll('.field.invalid, .q.invalid, .photo-slot.invalid').forEach(el => el.classList.remove('invalid'));
}

function validateForm() {
  clearErrors();
  let firstError = null;

  // 1. Text fields
  const textFields = ['nom', 'email', 'adresse', 'pays'];
  textFields.forEach((id) => {
    const input = document.getElementById(id);
    if (!input) return;
    const value = input.value.trim();
    const wrap = input.closest('.field');
    const errorEl = document.querySelector(`.field-error[data-error-for="${id}"]`);
    let msg = null;

    if (!value) msg = t('required');
    else if (id === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) msg = t('invalidEmail');

    if (msg) {
      if (wrap) wrap.classList.add('invalid');
      if (errorEl) { errorEl.textContent = msg; errorEl.classList.add('visible'); }
      if (!firstError) firstError = input;
    }
  });

  // 2. Radio groups (obligatoires)
  const radioGroups = ['dispo7j', 'autreTravail', 'autreContrat', 'typeContrat', 'tempsTravail', 'salaire', 'docType'];
  radioGroups.forEach((name) => {
    const selected = document.querySelector(`input[name="${name}"]:checked`);
    const errorEl = document.querySelector(`.field-error[data-error-for="${name}"]`);
    if (!selected) {
      const firstInput = document.querySelector(`input[name="${name}"]`);
      const wrap = firstInput?.closest('.q') || firstInput?.closest('.field');
      if (wrap) wrap.classList.add('invalid');
      if (errorEl) { errorEl.textContent = t('select'); errorEl.classList.add('visible'); }
      if (!firstError) firstError = wrap || firstInput;
    }
  });

  // 3. Photos
  ['recto', 'verso', 'selfie'].forEach((key) => {
    const slot = document.querySelector(`.photo-slot[data-key="${key}"]`);
    const errorEl = slot?.querySelector('.photo-error');
    if (!photos[key]) {
      if (slot) slot.classList.add('invalid');
      if (errorEl) { errorEl.textContent = t('photo'); errorEl.classList.add('visible'); }
      if (!firstError) firstError = slot;
    }
  });

  return firstError;
}

/* ============ NETTOYAGE AUTO DES ERREURS ============ */
document.querySelectorAll('#apply-form input, #apply-form textarea').forEach((el) => {
  const handler = () => {
    const wrap = el.closest('.field') || el.closest('.q');
    if (wrap) wrap.classList.remove('invalid');
    const target = el.closest('.field') || el.closest('.q');
    const errEl = target?.querySelector('.field-error');
    if (errEl) errEl.classList.remove('visible');
  };
  el.addEventListener('input', handler);
  el.addEventListener('change', handler);
});

/* ============ SUBMIT ============ */
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const firstError = validateForm();
  if (firstError) {
    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (firstError.tagName === 'INPUT' || firstError.tagName === 'TEXTAREA') {
      setTimeout(() => firstError.focus({ preventScroll: true }), 400);
    }
    return;
  }

  submitBtn.disabled = true;
  const originalText = submitBtn.textContent;
  submitBtn.textContent = '...';

  try {
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    const appId = crypto.randomUUID();
    const urls = {};

    for (const key of ['recto', 'verso', 'selfie']) {
      const file = photos[key];
      const filePath = `candidatures/${appId}/${key}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('applications')
        .upload(filePath, file, { contentType: 'image/jpeg', upsert: true });
      if (uploadError) throw new Error(`Erreur upload ${key}: ${uploadError.message}`);
      const { data: urlData } = supabase.storage.from('applications').getPublicUrl(filePath);
      urls[key] = urlData.publicUrl;
    }

    const { error: dbError } = await supabase.from('applications').insert([{
      ...data,
      doc_recto_url: urls.recto,
      doc_verso_url: urls.verso,
      selfie_url: urls.selfie,
      status: 'nouveau'
    }]);

    if (dbError) throw new Error(`Erreur base de données: ${dbError.message}`);

    successModal.hidden = false;
    form.reset();
    // Reset photos
    document.querySelectorAll('.photo-slot').forEach((s) => {
      const emptyEl = s.querySelector('.photo-empty');
      const imgEl = s.querySelector('.photo-img');
      const removeBtn = s.querySelector('.js-photo-remove');
      if (imgEl) { imgEl.src = ''; imgEl.style.display = 'none'; }
      if (emptyEl) emptyEl.style.display = '';
      if (removeBtn) removeBtn.hidden = true;
      s.classList.remove('filled', 'invalid');
    });
    photos.recto = photos.verso = photos.selfie = null;
    clearErrors();
    window.scrollTo({ top: 0, behavior: 'smooth' });

  } catch (err) {
    console.error(err);
    alert("Une erreur est survenue lors de l'envoi.\n\n" + err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

document.getElementById('success-close').addEventListener('click', () => {
  successModal.hidden = true;
});

/* ============ REVEAL ============ */
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
