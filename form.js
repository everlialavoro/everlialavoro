import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ================= PHOTOS ================= */
const photos = { recto: null, verso: null, selfie: null };

document.querySelectorAll('.photo-slot').forEach((slot) => {
  const key = slot.dataset.key;
  const facing = slot.dataset.facing || 'environment';
  const preview = slot.querySelector('.photo-preview');
  const fileInput = slot.querySelector('input[type=file]');
  const camBtn = slot.querySelector('.js-cam');

  const apply = (fileOrBlob) => {
    photos[key] = fileOrBlob;
    const url = URL.createObjectURL(fileOrBlob);
    preview.innerHTML = `<img src="${url}" alt="Aperçu" />`;
    slot.classList.add('filled');
  };

  camBtn.addEventListener('click', () => openCamera(facing, apply));
  fileInput.addEventListener('change', (e) => {
    const f = e.target.files[0];
    if (f) apply(f);
  });
});

/* ================= CAMERA ================= */
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

/* ================= SUBMIT VERS SUPABASE ================= */
const form = document.getElementById('apply-form');
const submitBtn = document.getElementById('submit-btn');
const successModal = document.getElementById('success-modal');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!form.checkValidity()) { form.reportValidity(); return; }
  if (!photos.recto || !photos.verso || !photos.selfie) {
    alert('Veuillez fournir les 3 photos : recto, verso et selfie.');
    return;
  }

  submitBtn.disabled = true;
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Envoi en cours...';

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
    document.querySelectorAll('.photo-slot').forEach((s) => {
      s.classList.remove('filled');
      const span = s.querySelector('.photo-preview span');
      s.querySelector('.photo-preview').innerHTML = `<span>${span ? span.textContent : 'Aucune photo'}</span>`;
    });
    photos.recto = photos.verso = photos.selfie = null;
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

/* ================= REVEAL ================= */
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
