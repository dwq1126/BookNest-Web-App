 const SEL = {
  tabBtn: '.tab-button',
  tabContent: '.tab-content',
  editProfileBtn: '.edit-profile-btn',
  avatarInput: '#avatarInput',
  avatarBtn: '.avatar-upload',
  avatarImg: '#userAvatar',
  avatarSection: '.avatar-section',
  reviewList: '.review-list',          
  reviewCard: '.review-card',         
  editForm: id => `#edit-form-${id}`,   
  editRating: id => `input[name="edit-rating-${id}"]:checked`,
  editComment: id => `textarea[name="edit-comment-${id}"]`,
};

const qs  = (s, root=document) => root.querySelector(s);
const qsa = (s, root=document) => Array.from(root.querySelectorAll(s));

const debounce = (fn, wait=300) => {
  let t; return function(...args){ clearTimeout(t); t=setTimeout(()=>fn.apply(this,args), wait); };
};

function initI18n() {
  const translations = {
    'en': {
      confirmDelete: 'Are you sure you want to delete this review?',
      saveSuccess: 'Saved successfully!',
      saving: 'Saving...',
      pleaseRate: 'Please select a rating',
      pleaseComment: 'Please enter a comment',
      serverError: 'Server response error',
      updateFailed: 'Failed to update review',
      uploadSuccess: 'Avatar uploaded successfully!',
      uploading: 'Uploading...',
      uploadFailed: 'Upload failed',
      fileTypeError: 'Please upload a JPG, PNG or GIF image',
      fileSizeError: 'Image size cannot exceed 5MB'
    }
  };
  const current = (document.documentElement.lang || navigator.language || 'en').toLowerCase();
  const lang = current.startsWith('zh') ? 'zh-CN' : 'en';
  return { t: k => translations[lang][k] || k };
}

const api = {
  async json(url, opts={}) {
    const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opts });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  async upload(url, formData) {
    const res = await fetch(url, { method:'POST', body: formData });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }
};

const ui = {
  setActiveTab(tabId) {
    qsa(SEL.tabBtn).forEach(btn => {
      const on = btn.getAttribute('aria-controls') === tabId;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-selected', on);
    });
    qsa(SEL.tabContent).forEach(p => p.classList.toggle('active', p.id === tabId));
  },
  toast(text, type='info') {
    let el = qs('.feedback-toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'feedback-toast';
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.dataset.type = type;  
    el.classList.add('show');
    setTimeout(()=> el.classList.remove('show'), 1500);
  },
  setBtnLoading(btn, loading, textWhenLoading) {
    if (!btn) return;
    if (loading) {
      btn.dataset._text = btn.textContent;
      btn.textContent = textWhenLoading;
      btn.disabled = true;
    } else {
      btn.textContent = btn.dataset._text || btn.textContent;
      btn.disabled = false;
    }
  },
  ensureFeedback(elForm){
    let box = elForm.querySelector('.feedback-message');
    if (!box) {
      box = document.createElement('div');
      box.className = 'feedback-message';
      elForm.appendChild(box);
    }
    return box;
  }
};

function initAvatar(i18n) {
  const input  = qs(SEL.avatarInput);
  const button = qs(SEL.avatarBtn);
  if (!input || !button) return;

  button.addEventListener('click', () => input.click());
  input.addEventListener('change', async () => {
    const file = input.files?.[0]; if (!file) return;

    const valid = ['image/jpeg','image/png','image/gif'];
    if (!valid.includes(file.type)) return alert(i18n.t('fileTypeError'));
    if (file.size > 5*1024*1024)   return alert(i18n.t('fileSizeError'));

    const section = qs(SEL.avatarSection);
    let status = section?.querySelector('.upload-status');
    if (!status) { status = document.createElement('div'); status.className='upload-status'; section?.appendChild(status); }
    status.textContent = i18n.t('uploading'); status.className = 'upload-status info';

    try {
      const fd = new FormData(); fd.append('avatar', file);
      const data = await api.upload('/api/user/avatar', fd);
      if (!data?.success) throw new Error(data?.message || i18n.t('uploadFailed'));
      const img = qs(SEL.avatarImg); if (img) img.src = data.avatarUrl;
      status.textContent = i18n.t('uploadSuccess'); status.className = 'upload-status success';
      setTimeout(()=> status.remove(), 1500);
    } catch(e){
      console.error(e);
      status.textContent = i18n.t('uploadFailed'); status.className = 'upload-status error';
    }
  });
}

function initReviews(i18n){
  const list = qs(SEL.reviewList) || document; 
  let submitting = false;
  let editingId = null;

  const showForm = id => {
    if (editingId && editingId !== id) {
      const prev = qs(SEL.editForm(editingId));
      if (prev) prev.style.display = 'none';
    }
    editingId = id;
    const form = qs(SEL.editForm(id));
    if (form) form.style.display = 'block';
  };

  const cancelEdit = () => {
    const form = editingId ? qs(SEL.editForm(editingId)) : null;
    if (form) form.style.display = 'none';
    editingId = null;
  };

  const save = debounce(async (id, btn)=>{
    if (submitting) return;
    const form    = qs(SEL.editForm(id));
    if (!form) return;

    const ratingEl = qs(SEL.editRating(id));
    const commentEl= qs(SEL.editComment(id));
    const rating   = ratingEl?.value;
    const comment  = commentEl?.value?.trim();

    const fb = ui.ensureFeedback(form);

    if (!rating)  { fb.textContent = i18n.t('pleaseRate');   fb.className='feedback-message error'; return; }
    if (!comment) { fb.textContent = i18n.t('pleaseComment'); fb.className='feedback-message error'; return; }

    submitting = true;
    ui.setBtnLoading(btn, true, i18n.t('saving'));
    fb.textContent = i18n.t('saving'); fb.className='feedback-message info';

    try {
      const data = await api.json(`/reviews/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ rating, comment })
      });
      if (!data?.success) throw new Error(data?.error || i18n.t('updateFailed'));
      ui.toast(i18n.t('saveSuccess'), 'success');
      location.reload();
    } catch(e){
      console.error(e);
      fb.textContent = `${i18n.t('serverError')}`; fb.className='feedback-message error';
      ui.setBtnLoading(btn, false);
      submitting = false;
    }
  }, 300);

  const del = async (id)=>{
    if (!confirm(i18n.t('confirmDelete'))) return;
    try{
      const data = await api.json(`/reviews/${id}`, { method: 'DELETE' });
      if (!data?.success) throw new Error(data?.error || 'fail');
      location.reload();
    }catch(e){
      console.error(e);
      alert(`${i18n.t('serverError')}: ${e.message}`);
    }
  };

  list.addEventListener('click', (e)=>{
    const btn = e.target.closest('button, a');
    if (!btn) return;

    if (btn.classList.contains('edit-review-btn')) {
      const id = btn.closest(SEL.reviewCard)?.dataset.reviewId;
      if (id) showForm(id);
    }

    if (btn.classList.contains('cancel-btn')) {
      e.preventDefault();
      cancelEdit();
    }

    if (btn.classList.contains('save-btn')) {
      e.preventDefault();
      const id = btn.closest(SEL.reviewCard)?.dataset.reviewId;
      if (id) save(id, btn);
    }

    if (btn.classList.contains('delete-review-btn')) {
      e.preventDefault();
      const id = btn.closest(SEL.reviewCard)?.dataset.reviewId;
      if (id) del(id);
    }
  });
}

function initTabs(){
  qsa(SEL.tabBtn).forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.getAttribute('aria-controls');
      if (id) ui.setActiveTab(id);
    });
  });
}

function init(){
  const i18n = initI18n();
  initTabs();
  initAvatar(i18n);
  initReviews(i18n);
  const editBtn = qs(SEL.editProfileBtn);
  if (editBtn) editBtn.addEventListener('click', ()=> location.href='/profile/edit');
}

document.addEventListener('DOMContentLoaded', init);
