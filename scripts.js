// ═════════════════════════════════════════════════════
//  DNMX TACTICAL COMMAND — SCRIPTS
//  Sister site to DNMX Central Command
//  Single JS file covering all functionality
// ═════════════════════════════════════════════════════

// ═════════════════════════════════════=
//  FIREBASE IMPORTS & CONFIG
// ═════════════════════════════════════=
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-analytics.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, updateDoc, doc, serverTimestamp, query, orderBy, getDoc, getDocs, setDoc, where, limit, or } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDiog1JUoGzFpweH3Z2xoctPME7zfUgehk",
  authDomain: "dnmx-tactical.firebaseapp.com",
  projectId: "dnmx-tactical",
  storageBucket: "dnmx-tactical.firebasestorage.app",
  messagingSenderId: "42559073548",
  appId: "1:42559073548:web:32e6aeb8c21a9b667c2d29",
  measurementId: "G-XMLZRYCBLN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// ═════════════════════════════════════=
//  ADMIN SYSTEM
// ═════════════════════════════════════=
const ADMIN_EMAILS = [
  "noah.dnmx@gmail.com",
  "tntplayertnt8@gmail.com",
  "drglass09yt@gmail.com",
  "cyberelite5253@gmail.com",
  "tk.dnmx@gmail.com",
  "deriddercasper@gmail.com",
  "trigyapazare2013@gmail.com",
  "ibrahimjafri1111@gmail.com",
  "jproskies@gmail.com",
];

function isAdmin() {
  return CURRENT_USER && ADMIN_EMAILS.includes(CURRENT_USER.email.trim());
}

// ═════════════════════════════════════=
//  STATE MANAGEMENT
// ═════════════════════════════════════=
let CURRENT_USER = null;
let ANNOUNCEMENTS = [];
let WAR_LOGS = [];
let MEMORIES = [];

// Chat state
let ALL_USERS = [];
let MESSAGES = [];
let ACTIVE_CHAT_USER = null;
let unsubscribeUsers = null;
let unsubscribeMessages = null;
let unsubscribeAllUserMessages = null;
let unsubscribeTypingState = null;
let typingTimeout = null;
let isCurrentlyTyping = false;
let CHAT_SELECTED_MEDIA_BASE64 = '';
let LAST_MESSAGE_MAP = {};

// Listener unsubs
let unsubAnnouncements = null;
let unsubWarLogs = null;
let unsubMemories = null;

// ═════════════════════════════════════=
//  LOADING SCREEN
// ═════════════════════════════════════=
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('hide');
  }, 2000);
});

// ═════════════════════════════════════=
//  NAVBAR SCROLL EFFECT
// ═════════════════════════════════════=
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (nav) {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }
}, { passive: true });

// ═════════════════════════════════════=
//  MOBILE MENU
// ═════════════════════════════════════=
function toggleMobile() {
  const hamburger = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (hamburger && menu) {
    hamburger.classList.toggle('open');
    menu.classList.toggle('open');
  }
}
window.toggleMobile = toggleMobile;

function closeMobile() {
  const hamburger = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (hamburger) hamburger.classList.remove('open');
  if (menu) menu.classList.remove('open');
}
window.closeMobile = closeMobile;

// ═════════════════════════════════════=
//  SCROLL INDICATOR
// ═════════════════════════════════════=
const scrollIndicator = document.getElementById('scrollIndicator');
if (scrollIndicator) {
  scrollIndicator.addEventListener('click', () => {
    const principles = document.getElementById('principles');
    if (principles) {
      principles.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

// ═════════════════════════════════════=
//  CANVAS PARTICLE SYSTEM
// ═════════════════════════════════════=
function spawnParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;
  for (let i = 0; i < 35; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 3.5 + 1;
    const x = Math.random() * 100;
    const dur = Math.random() * 14 + 7;
    const delay = Math.random() * 8;
    const isBrightGreen = Math.random() > 0.4;
    p.style.cssText = `width:${size}px;height:${size}px;left:${x}%;bottom:0;
      background:${isBrightGreen ? 'rgba(50, 201, 107, 0.6)' : 'rgba(180, 180, 180, 0.3)'};
      box-shadow:0 0 6px ${isBrightGreen ? 'rgba(50, 201, 107, 0.7)' : 'rgba(180, 180, 180, 0.4)'};
      animation-duration:${dur}s;animation-delay:${delay}s;`;
    container.appendChild(p);
  }
}

// Initialize particles on load
spawnParticles();

// ═════════════════════════════════════=
//  MODAL SYSTEM
// ═════════════════════════════════════=
function openModal() {
  const modal = document.getElementById('modal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}
window.openModal = openModal;

function closeModal() {
  const modal = document.getElementById('modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}
window.closeModal = closeModal;

function closeModalOnOverlay(e) {
  if (e.target.id === 'modal') closeModal();
}
window.closeModalOnOverlay = closeModalOnOverlay;

// ESC key closes modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    closeAnnouncementsOverlay();
    closeLightbox();
  }
});

// ═════════════════════════════════════=
//  ANNOUNCEMENTS OVERLAY
// ═════════════════════════════════════=
function openAnnouncementsOverlay() {
  const overlay = document.getElementById('announcementsOverlay');
  if (!overlay) return;
  renderFullAnnouncements();
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
window.openAnnouncementsOverlay = openAnnouncementsOverlay;

function closeAnnouncementsOverlay() {
  const overlay = document.getElementById('announcementsOverlay');
  if (overlay) {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}
window.closeAnnouncementsOverlay = closeAnnouncementsOverlay;

function closeAnnouncementsOnOverlay(e) {
  if (e.target.id === 'announcementsOverlay') closeAnnouncementsOverlay();
}
window.closeAnnouncementsOnOverlay = closeAnnouncementsOnOverlay;

// ═════════════════════════════════════=
//  LIGHTBOX
// ═════════════════════════════════════=
let lightboxItems = [];
let lightboxIndex = 0;

function openLightbox(items, index) {
  lightboxItems = items;
  lightboxIndex = index;
  renderLightbox();
  const lb = document.getElementById('lightbox');
  if (lb) {
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}
window.openLightbox = openLightbox;

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (lb) {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }
}
window.closeLightbox = closeLightbox;

function navigateLightbox(dir) {
  lightboxIndex = (lightboxIndex + dir + lightboxItems.length) % lightboxItems.length;
  renderLightbox();
}
window.navigateLightbox = navigateLightbox;

function renderLightbox() {
  const container = document.getElementById('lightboxContent');
  if (!container || !lightboxItems.length) return;
  const item = lightboxItems[lightboxIndex];
  container.innerHTML = `
    <img class="lightbox-img" src="${escapeHTML(item.image)}" alt="${escapeHTML(item.title)}" loading="lazy" />
    <div class="lightbox-info">
      <h3>${escapeHTML(item.title)}</h3>
      ${item.description ? `<p>${escapeHTML(item.description)}</p>` : ''}
      <div class="lightbox-meta">
        ${item.uploadedBy ? `Uploaded by ${escapeHTML(item.uploadedBy)}` : ''}
        ${item.date ? ` — ${item.date}` : ''}
      </div>
    </div>
  `;

  // Show/hide nav buttons
  const prevBtn = document.querySelector('.lightbox-prev');
  const nextBtn = document.querySelector('.lightbox-next');
  if (prevBtn) prevBtn.style.display = lightboxItems.length > 1 ? '' : 'none';
  if (nextBtn) nextBtn.style.display = lightboxItems.length > 1 ? '' : 'none';
}

// Keyboard navigation for lightbox
document.addEventListener('keydown', (e) => {
  const lb = document.getElementById('lightbox');
  if (!lb || !lb.classList.contains('open')) return;
  if (e.key === 'ArrowLeft') navigateLightbox(-1);
  if (e.key === 'ArrowRight') navigateLightbox(1);
});

// ═════════════════════════════════════=
//  TOAST NOTIFICATION SYSTEM
// ═════════════════════════════════════=
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  // Trigger slide-in
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Auto dismiss after 4s
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}
window.showToast = showToast;

// ═════════════════════════════════════=
//  OFFLINE DETECTION
// ═════════════════════════════════════=
window.addEventListener('offline', () => {
  const banner = document.getElementById('offlineBanner');
  if (banner) banner.classList.add('show');
});

window.addEventListener('online', () => {
  const banner = document.getElementById('offlineBanner');
  if (banner) banner.classList.remove('show');
});

// ═════════════════════════════════════=
//  UTILITY FUNCTIONS
// ═════════════════════════════════════=

/** Escape HTML to prevent XSS */
function escapeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
window.escapeHTML = escapeHTML;

/** Format a Firestore timestamp into a readable date string */
function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/** Format a date for time display */
function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Compress image to reduce size */
function compressImage(file, maxWidth = 1200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) {
          h = (maxWidth / w) * h;
          w = maxWidth;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
window.compressImage = compressImage;

/** Parse Discord-style markdown formatting */
function parseDiscordFormatting(text) {
  if (!text) return '';
  let result = escapeHTML(text);

  // Code blocks: ```code```
  result = result.replace(/```([\s\S]*?)```/g, '<div class="discord-code-block"><code>$1</code></div>');
  // Inline code: `code`
  result = result.replace(/`([^`]+)`/g, '<span class="discord-inline-code">$1</span>');
  // Bold: **text**
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic: *text*
  result = result.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Underline: __text__
  result = result.replace(/__(.+?)__/g, '<u>$1</u>');
  // Strikethrough: ~~text~~
  result = result.replace(/~~(.+?)~~/g, '<del>$1</del>');
  // Spoiler: ||text||
  result = result.replace(/\|\|(.+?)\|\|/g, '<span class="discord-spoiler" onclick="this.classList.toggle(\'revealed\')">$1</span>');
  // Blockquote: > text
  result = result.replace(/^&gt; (.+)$/gm, '<div class="discord-blockquote">$1</div>');
  // Line breaks
  result = result.replace(/\n/g, '<br>');

  return result;
}
window.parseDiscordFormatting = parseDiscordFormatting;

/** Generate author avatar HTML */
function getAuthorDotHTML(photoURL, initials, style = '') {
  if (photoURL) {
    return `<div class="author-dot" style="${style}"><img src="${escapeHTML(photoURL)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" alt="" /></div>`;
  }
  const safeInitials = escapeHTML(initials || 'UN').substring(0, 4);
  return `<div class="author-dot" style="${style}">${safeInitials}</div>`;
}
window.getAuthorDotHTML = getAuthorDotHTML;

/** Debounce helper */
function debounce(fn, delay = 250) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ═════════════════════════════════════=
//  AUTHENTICATION
// ═════════════════════════════════════=
onAuthStateChanged(auth, async (user) => {
  if (user) {
    CURRENT_USER = {
      uid: user.uid,
      email: user.email,
      name: user.displayName || user.email.split('@')[0],
      ingameName: user.displayName || user.email.split('@')[0],
      photoURL: user.photoURL || '',
      initials: ''
    };

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      let needsSetup = false;

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        CURRENT_USER.ingameName = userData.ingameName || CURRENT_USER.ingameName;
        CURRENT_USER.name = userData.name || CURRENT_USER.name;
        CURRENT_USER.photoURL = userData.photoURL || user.photoURL || '';
        CURRENT_USER.initials = userData.initials || '';
        CURRENT_USER.bio = userData.bio || '';
        CURRENT_USER.nickname = userData.nickname || '';
        CURRENT_USER.favoriteWeapon = userData.favoriteWeapon || '';
        CURRENT_USER.favoriteGamemode = userData.favoriteGamemode || '';

        if (!userData.ingameName || !userData.initials || !userData.photoURL) {
          needsSetup = true;
        }

        await updateDoc(userDocRef, {
          lastActive: serverTimestamp(),
          photoURL: CURRENT_USER.photoURL,
          initials: CURRENT_USER.initials
        });
      } else {
        needsSetup = true;
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          name: CURRENT_USER.name,
          ingameName: CURRENT_USER.ingameName,
          photoURL: CURRENT_USER.photoURL,
          initials: '',
          bio: '',
          nickname: '',
          favoriteWeapon: '',
          favoriteGamemode: '',
          joinedAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          lastActive: serverTimestamp(),
          isAdmin: ADMIN_EMAILS.includes(user.email.trim()),
          role: 'member'
        });
      }

      if (needsSetup) {
        setTimeout(() => promptProfileSetupModal(), 500);
      }
    } catch (err) {
      console.error("Error syncing user profile:", err);
    }

    setupUsersListener();
    setupAllUserMessagesListener();
  } else {
    stopChatting();
    CURRENT_USER = null;
    if (unsubscribeUsers) { unsubscribeUsers(); unsubscribeUsers = null; }
    if (unsubscribeMessages) { unsubscribeMessages(); unsubscribeMessages = null; }
    if (unsubscribeAllUserMessages) { unsubscribeAllUserMessages(); unsubscribeAllUserMessages = null; }
    ACTIVE_CHAT_USER = null;
  }
  updateAuthUI();
  updateAdminVisibility();
});

function updateAuthUI() {
  const area = document.getElementById('authArea');
  const mobileArea = document.getElementById('mobileAuthArea');
  const chatToggle = document.getElementById('chatToggleButton');
  if (!area) return;

  if (CURRENT_USER) {
    const avatarHTML = getAuthorDotHTML(CURRENT_USER.photoURL, CURRENT_USER.initials || 'UN', "width: 24px; height: 24px; font-size: 0.6rem; margin: 0;");
    const pfpHTML = `<div onclick="promptProfileSetupModal()" style="cursor: pointer; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; overflow: hidden; ${CURRENT_USER.photoURL ? 'border: 1px solid var(--accent);' : ''}">${avatarHTML}</div>`;

    area.innerHTML = `
      <div style="display:flex;gap:8px;align-items:center">
        ${pfpHTML}
        <button class="btn-secondary" onclick="promptProfileSetupModal()">PROFILE</button>
        <button class="btn-secondary" onclick="signOutUser()">LOG OUT</button>
      </div>`;

    if (mobileArea) {
      mobileArea.innerHTML = `
        <button class="btn-secondary" onclick="window.toggleChatPanel(); closeMobile();" style="width: 100%;">CHAT</button>
        <button class="btn-secondary" onclick="promptProfileSetupModal(); closeMobile();" style="width: 100%;">PROFILE</button>
        <button class="btn-secondary" onclick="signOutUser(); closeMobile();" style="width: 100%;">LOG OUT</button>`;
    }

    if (chatToggle) chatToggle.style.display = '';
  } else {
    area.innerHTML = `<button class="btn-secondary" id="authButton" onclick="openLoginModal()">LOG IN</button>`;
    if (mobileArea) {
      mobileArea.innerHTML = `<button class="btn-secondary" onclick="openLoginModal(); closeMobile();" style="width: 100%;">LOG IN</button>`;
    }
    if (chatToggle) chatToggle.style.display = 'none';
    closeChatPanel();
  }
}

function updateAdminVisibility() {
  const adminVisible = isAdmin();
  document.querySelectorAll('.fab').forEach(el => {
    el.style.display = adminVisible ? 'block' : 'none';
  });
  // Show/hide upload memory button for logged-in users
  document.querySelectorAll('.fab-member').forEach(el => {
    el.style.display = CURRENT_USER ? 'block' : 'none';
  });
}

// ═════════════════════════════════════=
//  LOGIN / LOGOUT
// ═════════════════════════════════════=
function openLoginModal() {
  document.getElementById('modalContent').innerHTML = `
    <h2 class="modal-title">Sign in with Google</h2>
    <p class="modal-subtitle">TACTICAL COMMAND</p>
    <p class="modal-text" style="margin-bottom: 20px;">Sign in to access chat, upload memories, and customize your profile.</p>
    <div id="gsiStatus" style="margin-top:12px;color:rgba(255,255,255,0.7)"></div>
    <div class="modal-actions">
      <button type="button" class="btn-secondary" onclick="closeModal()">CANCEL</button>
      <button type="button" class="btn-primary" onclick="window.signInWithGoogle()"><span>SIGN IN WITH GOOGLE</span></button>
    </div>
  `;
  openModal();
}
window.openLoginModal = openLoginModal;

function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then(() => {
      closeModal();
      showToast('Signed in successfully.', 'success');
      setTimeout(() => promptProfileSetupModal(), 250);
    })
    .catch((error) => {
      const status = document.getElementById('gsiStatus');
      if (status) status.textContent = 'Sign-in failed: ' + error.message;
      showToast('Unable to sign in. Please try again.', 'error');
    });
}
window.signInWithGoogle = signInWithGoogle;

function signOutUser() {
  // Show confirmation
  document.getElementById('modalContent').innerHTML = `
    <h2 class="modal-title">Log Out</h2>
    <p class="modal-text">Log out of DNMX Tactical Command?</p>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">CANCEL</button>
      <button class="btn-primary" onclick="confirmSignOut()"><span>LOG OUT</span></button>
    </div>
  `;
  openModal();
}
window.signOutUser = signOutUser;

function confirmSignOut() {
  firebaseSignOut(auth)
    .then(() => {
      closeModal();
      showToast('Signed out.', 'info');
    })
    .catch(err => {
      console.error('Sign-out error:', err);
      showToast('Error signing out.', 'error');
    });
}
window.confirmSignOut = confirmSignOut;

// ═════════════════════════════════════=
//  PROFILE SYSTEM
// ═════════════════════════════════════=
function promptProfileSetupModal() {
  if (!CURRENT_USER) return;
  const preName = CURRENT_USER.ingameName || CURRENT_USER.name || '';
  const preInitials = CURRENT_USER.initials || '';
  const prePhoto = CURRENT_USER.photoURL || '';
  const preBio = CURRENT_USER.bio || '';
  const preNickname = CURRENT_USER.nickname || '';
  const preWeapon = CURRENT_USER.favoriteWeapon || '';
  const preGamemode = CURRENT_USER.favoriteGamemode || '';

  document.getElementById('modalContent').innerHTML = `
    <h2 class="modal-title">Profile Setup</h2>
    <p class="modal-subtitle">TACTICAL COMMAND</p>
    <form id="profileSetupForm" onsubmit="submitProfileSetup(event)">
      <div style="text-align:center; margin-bottom: 20px;">
        <div id="profileSetupPfpContainer" class="profile-avatar">
          ${prePhoto
      ? `<img id="profileSetupPreview" src="${escapeHTML(prePhoto)}" alt="Avatar" />`
      : `<span id="profileSetupInitialsText">${escapeHTML(preInitials || 'UN')}</span>`}
        </div>
        <label class="btn-secondary" style="display: inline-block; cursor: pointer; padding: 6px 12px; font-size: 0.75rem; border-radius: 4px; margin-top: 8px;">
          UPLOAD PHOTO
          <input type="file" id="profileSetupFileInput" accept="image/*" style="display: none;" onchange="window.previewProfileSetupPhoto(this)" />
        </label>
      </div>
      <label>
        In-Game Name
        <input type="text" id="profileSetupNameInput" placeholder="Enter your in-game name" value="${escapeHTML(preName)}" required />
      </label>
      <label>
        Initials (Displayed on Avatar)
        <input type="text" id="profileSetupInitialsInput" placeholder="e.g. TNT" maxlength="10" value="${escapeHTML(preInitials)}" required oninput="window.updateProfileSetupInitialsPreview(this.value)" />
      </label>
      <label>
        Nickname
        <input type="text" id="profileNicknameInput" placeholder="Optional nickname" maxlength="32" value="${escapeHTML(preNickname)}" />
      </label>
      <label>
        Bio
        <textarea id="profileBioInput" placeholder="Tell us about yourself..." maxlength="300" oninput="window.updateBioCounter(this)">${escapeHTML(preBio)}</textarea>
        <div class="char-counter" id="bioCounter">${preBio.length}/300</div>
      </label>
      <label>
        Favorite Weapon
        <input type="text" id="profileWeaponInput" placeholder="Optional" value="${escapeHTML(preWeapon)}" />
      </label>
      <label>
        Favorite Gamemode
        <input type="text" id="profileGamemodeInput" placeholder="Optional" value="${escapeHTML(preGamemode)}" />
      </label>
      <div class="modal-actions">
        <button type="button" class="btn-secondary" onclick="closeModal()">CANCEL</button>
        <button type="submit" class="btn-primary"><span>SAVE PROFILE</span></button>
      </div>
      <p id="profileSetupError" style="margin-top:14px;color:#ff7b7b;font-size:0.9rem;min-height:20px;"></p>
    </form>
  `;
  openModal();
}
window.promptProfileSetupModal = promptProfileSetupModal;

function previewProfileSetupPhoto(input) {
  const file = input.files[0];
  if (file) {
    compressImage(file).then(dataUrl => {
      const container = document.getElementById('profileSetupPfpContainer');
      if (container) {
        container.innerHTML = `<img id="profileSetupPreview" src="${dataUrl}" alt="Avatar" />`;
      }
    }).catch(err => {
      console.error("Error compressing pfp:", err);
      showToast('Failed to compress image.', 'error');
    });
  }
}
window.previewProfileSetupPhoto = previewProfileSetupPhoto;

function updateProfileSetupInitialsPreview(val) {
  const previewImg = document.getElementById('profileSetupPreview');
  if (!previewImg) {
    const textEl = document.getElementById('profileSetupInitialsText');
    if (textEl) textEl.textContent = val.toUpperCase().trim() || 'UN';
  }
}
window.updateProfileSetupInitialsPreview = updateProfileSetupInitialsPreview;

function updateBioCounter(textarea) {
  const counter = document.getElementById('bioCounter');
  if (counter) {
    counter.textContent = `${textarea.value.length}/300`;
    counter.classList.toggle('warning', textarea.value.length >= 280);
  }
}
window.updateBioCounter = updateBioCounter;

async function submitProfileSetup(e) {
  e.preventDefault();
  const nameVal = document.getElementById('profileSetupNameInput').value.trim();
  const initialsVal = document.getElementById('profileSetupInitialsInput').value.toUpperCase().trim();
  const previewImg = document.getElementById('profileSetupPreview');
  const photoVal = previewImg ? previewImg.src : '';
  const nicknameVal = (document.getElementById('profileNicknameInput')?.value || '').trim();
  const bioVal = (document.getElementById('profileBioInput')?.value || '').trim();
  const weaponVal = (document.getElementById('profileWeaponInput')?.value || '').trim();
  const gamemodeVal = (document.getElementById('profileGamemodeInput')?.value || '').trim();
  const errEl = document.getElementById('profileSetupError');

  if (!nameVal || !initialsVal) {
    if (errEl) errEl.textContent = 'Please enter both in-game name and initials.';
    return;
  }
  if (!CURRENT_USER) {
    if (errEl) errEl.textContent = 'User not signed in.';
    return;
  }

  CURRENT_USER.ingameName = nameVal;
  CURRENT_USER.initials = initialsVal;
  CURRENT_USER.photoURL = photoVal;
  CURRENT_USER.nickname = nicknameVal;
  CURRENT_USER.bio = bioVal;
  CURRENT_USER.favoriteWeapon = weaponVal;
  CURRENT_USER.favoriteGamemode = gamemodeVal;

  try {
    await setDoc(doc(db, 'users', CURRENT_USER.uid), {
      ingameName: nameVal,
      initials: initialsVal,
      photoURL: photoVal,
      nickname: nicknameVal,
      bio: bioVal,
      favoriteWeapon: weaponVal,
      favoriteGamemode: gamemodeVal,
      lastActive: serverTimestamp()
    }, { merge: true });

    updateAuthUI();
    updateAdminVisibility();
    closeModal();
    showToast('Profile updated successfully.', 'success');
  } catch (err) {
    console.error("Error saving profile:", err);
    if (errEl) errEl.textContent = 'Failed to save: ' + err.message;
    showToast('Failed to save profile.', 'error');
  }
}
window.submitProfileSetup = submitProfileSetup;

// ═════════════════════════════════════=
//  ANNOUNCEMENTS SYSTEM
// ═════════════════════════════════════=
function initAnnouncementsListener() {
  if (unsubAnnouncements) unsubAnnouncements();

  const q = query(collection(db, 'taccom_announcements'), orderBy('createdAt', 'desc'));
  unsubAnnouncements = onSnapshot(q, (snapshot) => {
    ANNOUNCEMENTS = [];
    snapshot.forEach(d => {
      ANNOUNCEMENTS.push({ id: d.id, ...d.data() });
    });
    renderHomeAnnouncements();
    const activeChip = document.querySelector('#announceFilters .chip.active');
    const filterCategory = activeChip?.dataset?.filter || 'all';
    const searchInput = document.getElementById('announceSearch');
    renderAnnouncementsPage(filterCategory, searchInput?.value || '');
  }, (error) => {
    console.error('Announcements listener error:', error);
    renderHomeAnnouncementsError();
  });
}

function getCategoryTag(category) {
  const map = {
    'updates': 'tag-update',
    'events': 'tag-event',
    'alerts': 'tag-alert',
    'recruitment': 'tag-recruit',
    'decrees': 'tag-decree'
  };
  return map[(category || '').toLowerCase()] || 'tag-update';
}

function renderHomeAnnouncements() {
  const grid = document.getElementById('homeAnnouncementsGrid');
  if (!grid) return;

  if (ANNOUNCEMENTS.length === 0) {
    grid.innerHTML = `
      <div class="no-results" style="grid-column: 1 / -1;">
        <div class="no-results-icon">📭</div>
        <h3>No announcements available.</h3>
        <p>Check back later for official updates.</p>
      </div>`;
    return;
  }

  const latest = ANNOUNCEMENTS.slice(0, 3);
  grid.innerHTML = latest.map(a => `
    <div class="announce-card reveal visible" onclick="openAnnouncementDetail('${a.id}')">
      <div class="announce-card-top">
        <span class="announce-tag ${getCategoryTag(a.category)}">${escapeHTML((a.category || 'UPDATE').toUpperCase())}</span>
        <span class="announce-date">${formatDate(a.createdAt)}</span>
      </div>
      <h3 class="announce-title">${escapeHTML(a.title)}</h3>
      <p class="announce-preview">${escapeHTML(a.body)}</p>
      <div class="announce-card-footer">
        <span class="announce-author">
          ${getAuthorDotHTML('', (a.createdBy || 'UN').substring(0, 2))}
          ${escapeHTML(a.createdBy || 'Unknown')}
        </span>
      </div>
    </div>
  `).join('');
}

function renderHomeAnnouncementsError() {
  const grid = document.getElementById('homeAnnouncementsGrid');
  if (!grid) return;
  grid.innerHTML = `
    <div class="no-results" style="grid-column: 1 / -1;">
      <div class="no-results-icon">⚠️</div>
      <h3>Unable to load announcements.</h3>
      <p>Please try again later.</p>
    </div>`;
}

function renderAnnouncementsPage(filterCategory = 'all', searchTerm = '') {
  const grid = document.getElementById('announcementsGrid');
  if (!grid) return;

  const term = searchTerm.toLowerCase();
  const filtered = filterCategory === 'all'
    ? ANNOUNCEMENTS
    : ANNOUNCEMENTS.filter(a => (a.category || '').toLowerCase() === filterCategory);

  const finalFiltered = filtered.filter(a =>
    !term ||
    (a.title || '').toLowerCase().includes(term) ||
    (a.body || '').toLowerCase().includes(term) ||
    (a.createdBy || '').toLowerCase().includes(term)
  );

  if (finalFiltered.length === 0) {
    grid.innerHTML = `
      <div class="no-results" style="grid-column: 1 / -1;">
        <div class="no-results-icon">📭</div>
        <h3>No announcements found.</h3>
        <p>Try adjusting your search or filters.</p>
      </div>`;
    return;
  }

  grid.innerHTML = finalFiltered.map(a => `
    <div class="announce-card reveal visible" onclick="openAnnouncementDetail('${a.id}')">
      <div class="announce-card-top">
        <span class="announce-tag ${getCategoryTag(a.category)}">${escapeHTML((a.category || 'UPDATE').toUpperCase())}</span>
        <span class="announce-date">${formatDate(a.createdAt)}${a.edited ? ' (edited)' : ''}</span>
      </div>
      <h3 class="announce-title">${escapeHTML(a.title)}</h3>
      <p class="announce-preview">${escapeHTML(a.body)}</p>
      <div class="announce-card-footer">
        <span class="announce-author">
          ${getAuthorDotHTML('', (a.createdBy || 'UN').substring(0, 2))}
          ${escapeHTML(a.createdBy || 'Unknown')}
        </span>
      </div>
    </div>
  `).join('');
}
window.renderAnnouncementsPage = renderAnnouncementsPage;

function filterAnnouncementsPage() {
  const activeChip = document.querySelector('#announceFilters .chip.active');
  const filterCategory = activeChip?.dataset?.filter || 'all';
  const searchInput = document.getElementById('announceSearch');
  renderAnnouncementsPage(filterCategory, searchInput?.value || '');
}
window.filterAnnouncementsPage = filterAnnouncementsPage;

function setAnnouncePageFilter(category, el) {
  document.querySelectorAll('#announceFilters .chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  filterAnnouncementsPage();
}
window.setAnnouncePageFilter = setAnnouncePageFilter;

function renderFullAnnouncements(filterCategory = 'all') {
  const container = document.getElementById('announcementsOverlayContent');
  if (!container) return;

  const filtered = filterCategory === 'all'
    ? ANNOUNCEMENTS
    : ANNOUNCEMENTS.filter(a => (a.category || '').toLowerCase() === filterCategory);

  const categories = ['all', 'updates', 'events', 'alerts', 'recruitment', 'decrees'];

  container.innerHTML = `
    <h2 class="modal-title">Announcements</h2>
    <p class="modal-subtitle">TACTICAL COMMAND</p>
    <p class="modal-text" style="margin-bottom: 24px;">Official communications from Tactical Command leadership regarding operations, events, recruitment, and organizational updates.</p>

    <div class="filter-chips" style="margin-bottom: 24px;">
      ${categories.map(c => `
        <button class="chip ${filterCategory === c ? 'active' : ''}" onclick="renderFullAnnouncements('${c}')">${c.toUpperCase()}</button>
      `).join('')}
    </div>

    ${isAdmin() ? `
      <div style="margin-bottom: 24px;">
        <button class="btn-primary" onclick="openNewAnnouncementModal()"><span>NEW ANNOUNCEMENT</span></button>
      </div>
    ` : ''}

    ${filtered.length === 0
      ? `<div class="no-results">
          <div class="no-results-icon">📭</div>
          <h3>No announcements available.</h3>
          <p>Check back later for official updates.</p>
        </div>`
      : filtered.map(a => `
        <div class="announce-card" style="margin-bottom: 16px; cursor: pointer;" onclick="openAnnouncementDetail('${a.id}')">
          <div class="announce-card-top">
            <span class="announce-tag ${getCategoryTag(a.category)}">${escapeHTML((a.category || 'UPDATE').toUpperCase())}</span>
            <span class="announce-date">${formatDate(a.createdAt)}${a.edited ? ' (edited)' : ''}</span>
          </div>
          <h3 class="announce-title">${escapeHTML(a.title)}</h3>
          <p class="announce-preview">${escapeHTML(a.body)}</p>
          <div class="announce-card-footer">
            <span class="announce-author">${escapeHTML(a.createdBy || 'Unknown')}</span>
          </div>
        </div>
      `).join('')
    }
  `;
}
window.renderFullAnnouncements = renderFullAnnouncements;

function openAnnouncementDetail(id) {
  const a = ANNOUNCEMENTS.find(x => x.id === id);
  if (!a) return;

  document.getElementById('modalContent').innerHTML = `
    <span class="modal-badge ${getCategoryTag(a.category)}">${escapeHTML((a.category || 'UPDATE').toUpperCase())}</span>
    <h2 class="modal-title">${escapeHTML(a.title)}</h2>
    <p class="modal-subtitle">TACTICAL COMMAND</p>
    <div class="modal-divider"></div>
    <div class="modal-text">${parseDiscordFormatting(a.body)}</div>
    <div class="modal-divider"></div>
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
      <span class="announce-author" style="font-size:0.8rem;color:rgba(255,255,255,0.4);">
        By ${escapeHTML(a.createdBy || 'Unknown')} — ${formatDate(a.createdAt)}${a.edited ? ' (edited)' : ''}
      </span>
      ${isAdmin() ? `
        <div style="display:flex;gap:8px;">
          <button class="btn-secondary" onclick="openEditAnnouncementModal('${a.id}')" style="padding:8px 16px;font-size:0.6rem;">EDIT</button>
          <button class="btn-secondary" onclick="confirmDeleteAnnouncement('${a.id}')" style="padding:8px 16px;font-size:0.6rem;color:var(--lost);border-color:var(--lost);">DELETE</button>
        </div>
      ` : ''}
    </div>
  `;
  closeAnnouncementsOverlay();
  openModal();
}
window.openAnnouncementDetail = openAnnouncementDetail;

function openNewAnnouncementModal() {
  const categories = ['Updates', 'Events', 'Alerts', 'Recruitment', 'Decrees'];
  document.getElementById('modalContent').innerHTML = `
    <h2 class="modal-title">New Announcement</h2>
    <p class="modal-subtitle">TACTICAL COMMAND</p>
    <form id="announceForm" onsubmit="publishAnnouncement(event)">
      <label>
        Category
        <select id="announceCategory" required>
          ${categories.map(c => `<option value="${c.toLowerCase()}">${c}</option>`).join('')}
        </select>
      </label>
      <label>
        Heading
        <input type="text" id="announceTitle" placeholder="Announcement title" required />
      </label>
      <label>
        Body
        <textarea id="announceBody" placeholder="Write announcement content..." required></textarea>
      </label>
      <div class="modal-actions">
        <button type="button" class="btn-secondary" onclick="closeModal()">CANCEL</button>
        <button type="submit" class="btn-primary"><span>PUBLISH</span></button>
      </div>
    </form>
  `;
  closeAnnouncementsOverlay();
  openModal();
}
window.openNewAnnouncementModal = openNewAnnouncementModal;

async function publishAnnouncement(e) {
  e.preventDefault();
  if (!isAdmin()) return showToast('Admin access required.', 'error');

  const category = document.getElementById('announceCategory').value;
  const title = document.getElementById('announceTitle').value.trim();
  const body = document.getElementById('announceBody').value.trim();

  if (!title || !body) return showToast('Please fill all required fields.', 'error');

  try {
    await addDoc(collection(db, 'taccom_announcements'), {
      category, title, body,
      createdBy: CURRENT_USER.ingameName || CURRENT_USER.name,
      createdByUID: CURRENT_USER.uid,
      createdByEmail: CURRENT_USER.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      edited: false
    });
    closeModal();
    showToast('Announcement published successfully.', 'success');
  } catch (err) {
    console.error('Error publishing announcement:', err);
    showToast('Failed to publish announcement.', 'error');
  }
}
window.publishAnnouncement = publishAnnouncement;

function openEditAnnouncementModal(id) {
  const a = ANNOUNCEMENTS.find(x => x.id === id);
  if (!a) return;
  const categories = ['Updates', 'Events', 'Alerts', 'Recruitment', 'Decrees'];

  document.getElementById('modalContent').innerHTML = `
    <h2 class="modal-title">Edit Announcement</h2>
    <p class="modal-subtitle">TACTICAL COMMAND</p>
    <form id="editAnnounceForm" onsubmit="updateAnnouncement(event, '${id}')">
      <label>
        Category
        <select id="editAnnounceCategory" required>
          ${categories.map(c => `<option value="${c.toLowerCase()}" ${(a.category || '').toLowerCase() === c.toLowerCase() ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
      </label>
      <label>
        Heading
        <input type="text" id="editAnnounceTitle" value="${escapeHTML(a.title)}" required />
      </label>
      <label>
        Body
        <textarea id="editAnnounceBody" required>${escapeHTML(a.body)}</textarea>
      </label>
      <div class="modal-actions">
        <button type="button" class="btn-secondary" onclick="closeModal()">CANCEL</button>
        <button type="submit" class="btn-primary"><span>SAVE CHANGES</span></button>
      </div>
    </form>
  `;
  openModal();
}
window.openEditAnnouncementModal = openEditAnnouncementModal;

async function updateAnnouncement(e, id) {
  e.preventDefault();
  if (!isAdmin()) return showToast('Admin access required.', 'error');

  try {
    await updateDoc(doc(db, 'taccom_announcements', id), {
      category: document.getElementById('editAnnounceCategory').value,
      title: document.getElementById('editAnnounceTitle').value.trim(),
      body: document.getElementById('editAnnounceBody').value.trim(),
      updatedAt: serverTimestamp(),
      edited: true
    });
    closeModal();
    showToast('Announcement updated successfully.', 'success');
  } catch (err) {
    console.error('Error updating announcement:', err);
    showToast('Failed to update announcement.', 'error');
  }
}
window.updateAnnouncement = updateAnnouncement;

function confirmDeleteAnnouncement(id) {
  document.getElementById('modalContent').innerHTML = `
    <h2 class="modal-title">Delete Announcement</h2>
    <p class="modal-text">This action cannot be undone.</p>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">CANCEL</button>
      <button class="btn-primary" onclick="deleteAnnouncement('${id}')" style="background:linear-gradient(135deg,rgba(201,50,50,0.8),rgba(201,50,50,0.9));box-shadow:0 0 20px rgba(201,50,50,0.3);"><span>DELETE</span></button>
    </div>
  `;
  openModal();
}
window.confirmDeleteAnnouncement = confirmDeleteAnnouncement;

async function deleteAnnouncement(id) {
  if (!isAdmin()) return;
  try {
    await deleteDoc(doc(db, 'taccom_announcements', id));
    closeModal();
    showToast('Announcement deleted.', 'info');
  } catch (err) {
    console.error('Error deleting announcement:', err);
    showToast('Failed to delete announcement.', 'error');
  }
}
window.deleteAnnouncement = deleteAnnouncement;

// ═════════════════════════════════════=
//  WAR LOGS SYSTEM
// ═════════════════════════════════════=
function initWarLogsListener() {
  if (unsubWarLogs) unsubWarLogs();

  const q = query(collection(db, 'taccom_war_logs'), orderBy('createdAt', 'desc'));
  unsubWarLogs = onSnapshot(q, (snapshot) => {
    WAR_LOGS = [];
    snapshot.forEach(d => {
      WAR_LOGS.push({ id: d.id, ...d.data() });
    });
    renderWarLogs();
  }, (error) => {
    console.error('War logs listener error:', error);
    renderWarLogsError();
  });
}

function renderWarLogs(filterOutcome = 'all', searchTerm = '') {
  const grid = document.getElementById('warLogsGrid');
  if (!grid) return;

  let filtered = WAR_LOGS;

  if (filterOutcome !== 'all') {
    filtered = filtered.filter(w => (w.outcome || '').toLowerCase() === filterOutcome);
  }

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(w =>
      (w.title || '').toLowerCase().includes(term) ||
      (w.description || '').toLowerCase().includes(term) ||
      (w.enemyNames || []).some(n => n.toLowerCase().includes(term)) ||
      (w.allyNames || []).some(n => n.toLowerCase().includes(term))
    );
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="no-results" style="grid-column: 1 / -1;">
        <div class="no-results-icon">📁</div>
        <h3>No war logs have been recorded yet.</h3>
        <p>Future operations will appear here.</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map(w => `
    <div class="warlog-card reveal visible" onclick="openWarLogDetail('${w.id}')">
      ${w.image ? `<img class="warlog-image" src="${escapeHTML(w.image)}" alt="${escapeHTML(w.title)}" loading="lazy" />` : ''}
      <div class="warlog-body">
        <span class="warlog-outcome ${(w.outcome || '').toLowerCase() === 'won' ? 'outcome-won' : 'outcome-lost'}">
          ${escapeHTML((w.outcome || 'UNKNOWN').toUpperCase())}
        </span>
        <h3 class="warlog-title">${escapeHTML(w.title)}</h3>
        <div class="warlog-meta">
          <span>📅 ${formatDate(w.createdAt)}</span>
          ${(w.enemyNames || []).length ? `<span>⚔️ vs ${escapeHTML(w.enemyNames.join(', '))}</span>` : ''}
        </div>
        <p class="warlog-desc-preview">${escapeHTML(w.description)}</p>
        <div class="warlog-card-footer">
          <span class="warlog-read-more">VIEW DETAILS</span>
        </div>
      </div>
    </div>
  `).join('');
}

function renderWarLogsError() {
  const grid = document.getElementById('warLogsGrid');
  if (!grid) return;
  grid.innerHTML = `
    <div class="no-results" style="grid-column: 1 / -1;">
      <div class="no-results-icon">⚠️</div>
      <h3>Unable to retrieve data from Tactical Command servers.</h3>
      <p>Please try again later.</p>
    </div>`;
}

function openWarLogDetail(id) {
  const w = WAR_LOGS.find(x => x.id === id);
  if (!w) return;

  document.getElementById('modalContent').innerHTML = `
    <span class="modal-badge ${(w.outcome || '').toLowerCase() === 'won' ? 'outcome-won' : 'outcome-lost'}">${escapeHTML((w.outcome || 'UNKNOWN').toUpperCase())}</span>
    <h2 class="modal-title">${escapeHTML(w.title)}</h2>
    <p class="modal-subtitle">WAR LOG — ${formatDate(w.createdAt)}${w.edited ? ' (edited)' : ''}</p>

    ${w.image ? `<img src="${escapeHTML(w.image)}" style="width:100%;border-radius:var(--radius-md);margin-bottom:20px;border:1px solid var(--border);" alt="War log image" loading="lazy" />` : ''}

    <div class="modal-divider"></div>
    <div class="modal-text">${parseDiscordFormatting(w.description)}</div>

    <div class="modal-grid">
      <div class="modal-info-box">
        <h4>ENEMY CLANS</h4>
        <p>${(w.enemyNames || []).length ? escapeHTML(w.enemyNames.join(', ')) : 'None listed'}</p>
      </div>
      <div class="modal-info-box">
        <h4>ALLIED FORCES</h4>
        <p>${(w.allyNames || []).length ? escapeHTML(w.allyNames.join(', ')) : 'None listed'}</p>
      </div>
    </div>

    <div class="modal-divider"></div>
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
      <span style="font-size:0.8rem;color:rgba(255,255,255,0.4);">
        Logged by ${escapeHTML(w.createdBy || 'Unknown')}
      </span>
      ${isAdmin() ? `
        <div style="display:flex;gap:8px;">
          <button class="btn-secondary" onclick="openEditWarLogModal('${w.id}')" style="padding:8px 16px;font-size:0.6rem;">EDIT</button>
          <button class="btn-secondary" onclick="confirmDeleteWarLog('${w.id}')" style="padding:8px 16px;font-size:0.6rem;color:var(--lost);border-color:var(--lost);">DELETE</button>
        </div>
      ` : ''}
    </div>
  `;
  openModal();
}
window.openWarLogDetail = openWarLogDetail;

function openCreateWarLogModal() {
  document.getElementById('modalContent').innerHTML = `
    <h2 class="modal-title">Create War Log</h2>
    <p class="modal-subtitle">TACTICAL COMMAND</p>
    <form id="warLogForm" onsubmit="publishWarLog(event)">
      <label>Outcome</label>
      <div class="outcome-toggle" id="outcomeToggle">
        <button type="button" class="active-won" onclick="setOutcome('won')">WON</button>
        <button type="button" onclick="setOutcome('lost')">LOST</button>
      </div>
      <input type="hidden" id="warLogOutcome" value="won" />

      <label style="margin-top:16px;">
        Title
        <input type="text" id="warLogTitle" placeholder="e.g. Victory Against XYZ Clan" required />
      </label>
      <label>
        Details
        <textarea id="warLogDescription" placeholder="Describe the operation..." required></textarea>
      </label>
      <label>
        Enemy Clans (comma separated)
        <input type="text" id="warLogEnemies" placeholder="Clan A, Clan B" />
      </label>
      <label>
        Allied Forces (comma separated)
        <input type="text" id="warLogAllies" placeholder="Alpha Squad, Beta Team" />
      </label>
      <label>
        Image (optional, max 1MB)
        <input type="file" id="warLogImage" accept="image/png,image/jpeg,image/webp" onchange="previewWarLogImage(this)" style="padding:10px;" />
      </label>
      <div id="warLogImagePreview"></div>
      <div class="modal-actions">
        <button type="button" class="btn-secondary" onclick="closeModal()">CANCEL</button>
        <button type="submit" class="btn-primary"><span>PUBLISH</span></button>
      </div>
    </form>
  `;
  openModal();
}
window.openCreateWarLogModal = openCreateWarLogModal;

function setOutcome(outcome) {
  document.getElementById('warLogOutcome').value = outcome;
  const btns = document.querySelectorAll('#outcomeToggle button');
  btns.forEach(btn => {
    btn.className = '';
    if (btn.textContent.trim().toLowerCase() === outcome) {
      btn.className = outcome === 'won' ? 'active-won' : 'active-lost';
    }
  });
}
window.setOutcome = setOutcome;

function previewWarLogImage(input) {
  const file = input.files[0];
  const preview = document.getElementById('warLogImagePreview');
  if (!file || !preview) return;

  if (file.size > 1048576) {
    showToast('Image must be under 1MB.', 'error');
    input.value = '';
    return;
  }

  compressImage(file, 1200, 0.85).then(dataUrl => {
    preview.innerHTML = `
      <div class="upload-preview">
        <img src="${dataUrl}" alt="Preview" />
        <button type="button" class="remove-preview" onclick="removeWarLogImagePreview()">✕</button>
      </div>`;
  });
}
window.previewWarLogImage = previewWarLogImage;

function removeWarLogImagePreview() {
  const preview = document.getElementById('warLogImagePreview');
  const input = document.getElementById('warLogImage');
  if (preview) preview.innerHTML = '';
  if (input) input.value = '';
}
window.removeWarLogImagePreview = removeWarLogImagePreview;

async function publishWarLog(e) {
  e.preventDefault();
  if (!isAdmin()) return showToast('Admin access required.', 'error');

  const outcome = document.getElementById('warLogOutcome').value;
  const title = document.getElementById('warLogTitle').value.trim();
  const description = document.getElementById('warLogDescription').value.trim();
  const enemies = document.getElementById('warLogEnemies').value.split(',').map(s => s.trim()).filter(Boolean);
  const allies = document.getElementById('warLogAllies').value.split(',').map(s => s.trim()).filter(Boolean);
  const previewImg = document.querySelector('#warLogImagePreview img');
  const image = previewImg ? previewImg.src : '';

  if (!title || !description) return showToast('Title and details are required.', 'error');

  try {
    await addDoc(collection(db, 'taccom_war_logs'), {
      outcome, title, description,
      enemyNames: enemies,
      allyNames: allies,
      image,
      createdBy: CURRENT_USER.ingameName || CURRENT_USER.name,
      createdByUID: CURRENT_USER.uid,
      createdByEmail: CURRENT_USER.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      edited: false
    });
    closeModal();
    showToast('War Log published successfully.', 'success');
  } catch (err) {
    console.error('Error publishing war log:', err);
    showToast('Failed to publish war log.', 'error');
  }
}
window.publishWarLog = publishWarLog;

function openEditWarLogModal(id) {
  const w = WAR_LOGS.find(x => x.id === id);
  if (!w) return;

  document.getElementById('modalContent').innerHTML = `
    <h2 class="modal-title">Edit War Log</h2>
    <p class="modal-subtitle">TACTICAL COMMAND</p>
    <form id="editWarLogForm" onsubmit="updateWarLog(event, '${id}')">
      <label>Outcome</label>
      <div class="outcome-toggle" id="outcomeToggle">
        <button type="button" class="${(w.outcome || '') === 'won' ? 'active-won' : ''}" onclick="setOutcome('won')">WON</button>
        <button type="button" class="${(w.outcome || '') === 'lost' ? 'active-lost' : ''}" onclick="setOutcome('lost')">LOST</button>
      </div>
      <input type="hidden" id="warLogOutcome" value="${w.outcome || 'won'}" />

      <label style="margin-top:16px;">
        Title
        <input type="text" id="warLogTitle" value="${escapeHTML(w.title)}" required />
      </label>
      <label>
        Details
        <textarea id="warLogDescription" required>${escapeHTML(w.description)}</textarea>
      </label>
      <label>
        Enemy Clans
        <input type="text" id="warLogEnemies" value="${escapeHTML((w.enemyNames || []).join(', '))}" />
      </label>
      <label>
        Allied Forces
        <input type="text" id="warLogAllies" value="${escapeHTML((w.allyNames || []).join(', '))}" />
      </label>
      <label>
        Image (optional)
        <input type="file" id="warLogImage" accept="image/png,image/jpeg,image/webp" onchange="previewWarLogImage(this)" style="padding:10px;" />
      </label>
      <div id="warLogImagePreview">
        ${w.image ? `<div class="upload-preview"><img src="${escapeHTML(w.image)}" alt="Preview" /><button type="button" class="remove-preview" onclick="removeWarLogImagePreview()">✕</button></div>` : ''}
      </div>
      <div class="modal-actions">
        <button type="button" class="btn-secondary" onclick="closeModal()">CANCEL</button>
        <button type="submit" class="btn-primary"><span>SAVE CHANGES</span></button>
      </div>
    </form>
  `;
  openModal();
}
window.openEditWarLogModal = openEditWarLogModal;

async function updateWarLog(e, id) {
  e.preventDefault();
  if (!isAdmin()) return;

  const previewImg = document.querySelector('#warLogImagePreview img');
  try {
    await updateDoc(doc(db, 'taccom_war_logs', id), {
      outcome: document.getElementById('warLogOutcome').value,
      title: document.getElementById('warLogTitle').value.trim(),
      description: document.getElementById('warLogDescription').value.trim(),
      enemyNames: document.getElementById('warLogEnemies').value.split(',').map(s => s.trim()).filter(Boolean),
      allyNames: document.getElementById('warLogAllies').value.split(',').map(s => s.trim()).filter(Boolean),
      image: previewImg ? previewImg.src : '',
      updatedAt: serverTimestamp(),
      edited: true
    });
    closeModal();
    showToast('War Log updated successfully.', 'success');
  } catch (err) {
    console.error('Error updating war log:', err);
    showToast('Failed to update war log.', 'error');
  }
}
window.updateWarLog = updateWarLog;

function confirmDeleteWarLog(id) {
  document.getElementById('modalContent').innerHTML = `
    <h2 class="modal-title">Delete War Log</h2>
    <p class="modal-text">Delete this war log? This action cannot be undone.</p>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">CANCEL</button>
      <button class="btn-primary" onclick="deleteWarLog('${id}')" style="background:linear-gradient(135deg,rgba(201,50,50,0.8),rgba(201,50,50,0.9));box-shadow:0 0 20px rgba(201,50,50,0.3);"><span>DELETE</span></button>
    </div>
  `;
  openModal();
}
window.confirmDeleteWarLog = confirmDeleteWarLog;

async function deleteWarLog(id) {
  if (!isAdmin()) return;
  try {
    await deleteDoc(doc(db, 'taccom_war_logs', id));
    closeModal();
    showToast('War Log deleted.', 'info');
  } catch (err) {
    console.error('Error deleting war log:', err);
    showToast('Failed to delete war log.', 'error');
  }
}
window.deleteWarLog = deleteWarLog;

// ═════════════════════════════════════=
//  MEMORIES SYSTEM
// ═════════════════════════════════════=
function initMemoriesListener() {
  if (unsubMemories) unsubMemories();

  const q = query(collection(db, 'taccom_memories'), orderBy('uploadedAt', 'desc'));
  unsubMemories = onSnapshot(q, (snapshot) => {
    MEMORIES = [];
    snapshot.forEach(d => {
      MEMORIES.push({ id: d.id, ...d.data() });
    });
    renderMemories();
  }, (error) => {
    console.error('Memories listener error:', error);
  });
}

function renderMemories(searchTerm = '') {
  const grid = document.getElementById('memoriesGrid');
  if (!grid) return;

  let filtered = MEMORIES;
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(m =>
      (m.title || '').toLowerCase().includes(term) ||
      (m.description || '').toLowerCase().includes(term) ||
      (m.uploadedBy || '').toLowerCase().includes(term)
    );
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="no-results" style="grid-column: 1 / -1;">
        <div class="no-results-icon">📸</div>
        <h3>No memories have been shared yet.</h3>
        <p>Be the first to preserve a moment from Tactical Command.</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map((m, i) => `
    <div class="memory-card reveal visible" onclick="openLightbox(${JSON.stringify(filtered.map(x => ({
    image: x.image,
    title: x.title,
    description: x.description,
    uploadedBy: x.uploadedBy,
    date: formatDate(x.uploadedAt),
    id: x.id
  }))).replace(/"/g, '&quot;')}, ${i})">
      <div class="memory-img-wrap">
        <img class="memory-img" src="${escapeHTML(m.image)}" alt="${escapeHTML(m.title)}" loading="lazy" />
        <div class="memory-overlay"><span>VIEW</span></div>
      </div>
      <div class="memory-info">
        <h3 class="memory-title">${escapeHTML(m.title)}</h3>
        <div class="memory-meta">
          <span>${escapeHTML(m.uploadedBy || 'Unknown')}</span>
          <span>${formatDate(m.uploadedAt)}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function openUploadMemoryModal() {
  if (!CURRENT_USER) return showToast('Please sign in to upload.', 'error');

  document.getElementById('modalContent').innerHTML = `
    <h2 class="modal-title">Upload Memory</h2>
    <p class="modal-subtitle">TACTICAL COMMAND</p>
    <form id="memoryForm" onsubmit="uploadMemory(event)">
      <label>
        Heading
        <input type="text" id="memoryTitle" placeholder="Name this memory" required />
      </label>
      <label>
        Context (optional)
        <textarea id="memoryDescription" placeholder="What's the story behind this?"></textarea>
      </label>
      <label>
        Image (required, max 10MB)
        <input type="file" id="memoryImage" accept="image/png,image/jpeg,image/webp" onchange="previewMemoryImage(this)" required style="padding:10px;" />
      </label>
      <div id="memoryImagePreview"></div>
      <div class="modal-actions">
        <button type="button" class="btn-secondary" onclick="closeModal()">CANCEL</button>
        <button type="submit" class="btn-primary"><span>UPLOAD</span></button>
      </div>
    </form>
  `;
  openModal();
}
window.openUploadMemoryModal = openUploadMemoryModal;

function previewMemoryImage(input) {
  const file = input.files[0];
  const preview = document.getElementById('memoryImagePreview');
  if (!file || !preview) return;

  if (file.size > 10485760) {
    showToast('Image must be under 10MB.', 'error');
    input.value = '';
    return;
  }

  compressImage(file, 1600, 0.85).then(dataUrl => {
    preview.innerHTML = `
      <div class="upload-preview">
        <img src="${dataUrl}" alt="Preview" />
        <button type="button" class="remove-preview" onclick="document.getElementById('memoryImagePreview').innerHTML='';document.getElementById('memoryImage').value='';">✕</button>
      </div>`;
  });
}
window.previewMemoryImage = previewMemoryImage;

async function uploadMemory(e) {
  e.preventDefault();
  if (!CURRENT_USER) return;

  const title = document.getElementById('memoryTitle').value.trim();
  const description = (document.getElementById('memoryDescription')?.value || '').trim();
  const previewImg = document.querySelector('#memoryImagePreview img');

  if (!title || !previewImg) return showToast('Title and image are required.', 'error');

  try {
    await addDoc(collection(db, 'taccom_memories'), {
      title,
      description,
      image: previewImg.src,
      uploadedBy: CURRENT_USER.ingameName || CURRENT_USER.name,
      uploadedByUID: CURRENT_USER.uid,
      uploadedAt: serverTimestamp()
    });
    closeModal();
    showToast('Memory uploaded successfully.', 'success');
  } catch (err) {
    console.error('Error uploading memory:', err);
    showToast('Upload failed. Please check your connection.', 'error');
  }
}
window.uploadMemory = uploadMemory;

function confirmDeleteMemory(id) {
  document.getElementById('modalContent').innerHTML = `
    <h2 class="modal-title">Delete Memory</h2>
    <p class="modal-text">This action cannot be undone.</p>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">CANCEL</button>
      <button class="btn-primary" onclick="deleteMemory('${id}')" style="background:linear-gradient(135deg,rgba(201,50,50,0.8),rgba(201,50,50,0.9));box-shadow:0 0 20px rgba(201,50,50,0.3);"><span>DELETE</span></button>
    </div>
  `;
  closeLightbox();
  openModal();
}
window.confirmDeleteMemory = confirmDeleteMemory;

async function deleteMemory(id) {
  try {
    await deleteDoc(doc(db, 'taccom_memories', id));
    closeModal();
    showToast('Memory deleted.', 'info');
  } catch (err) {
    console.error('Error deleting memory:', err);
    showToast('Failed to delete memory.', 'error');
  }
}
window.deleteMemory = deleteMemory;

// ═════════════════════════════════════=
//  CHAT SYSTEM
// ═════════════════════════════════════=
function toggleChatPanel() {
  const panel = document.getElementById('chatPanel');
  if (!panel) return;
  const isOpen = panel.classList.contains('open');
  if (isOpen) {
    closeChatPanel();
  } else {
    panel.classList.add('open');
    if (CURRENT_USER) {
      updateDoc(doc(db, 'users', CURRENT_USER.uid), {
        lastActive: serverTimestamp()
      }).catch(err => console.error("Heartbeat error:", err));
    }
  }
}
window.toggleChatPanel = toggleChatPanel;

function closeChatPanel() {
  stopChatting();
  const panel = document.getElementById('chatPanel');
  if (panel) panel.classList.remove('open');
}
window.closeChatPanel = closeChatPanel;

function goBackToUserList() {
  stopChatting();
  ACTIVE_CHAT_USER = null;
  if (unsubscribeMessages) { unsubscribeMessages(); unsubscribeMessages = null; }
  const userListEl = document.getElementById('chatUserListContainer');
  const chatRoomEl = document.getElementById('chatRoomContainer');
  if (userListEl && chatRoomEl) {
    userListEl.style.display = 'flex';
    chatRoomEl.style.display = 'none';
  }
}
window.goBackToUserList = goBackToUserList;

function setupUsersListener() {
  if (unsubscribeUsers) unsubscribeUsers();
  const q = query(collection(db, 'users'));
  unsubscribeUsers = onSnapshot(q, (snapshot) => {
    ALL_USERS = [];
    snapshot.forEach((d) => {
      const data = d.data();
      if (CURRENT_USER && data.uid !== CURRENT_USER.uid) {
        ALL_USERS.push({
          uid: data.uid,
          email: data.email || '',
          name: data.name || '',
          ingameName: data.ingameName || data.name || 'Unknown',
          initials: data.initials || '',
          photoURL: data.photoURL || '',
          lastActive: data.lastActive ? data.lastActive.toDate() : null
        });
      }
    });
    sortAndRenderUsers();
    // Keep header updated
    if (ACTIVE_CHAT_USER) {
      const updatedUser = ALL_USERS.find(u => u.uid === ACTIVE_CHAT_USER.uid);
      if (updatedUser) {
        ACTIVE_CHAT_USER = updatedUser;
        const statusEl = document.getElementById('chatRoomHeaderStatus');
        if (statusEl) {
          const online = isUserOnline(ACTIVE_CHAT_USER);
          statusEl.innerHTML = `<span class="status-dot ${online ? 'online' : 'offline'}"></span>${online ? 'Online' : 'Offline'}`;
        }
      }
    }
  });
}

function setupAllUserMessagesListener() {
  if (unsubscribeAllUserMessages) unsubscribeAllUserMessages();
  if (!CURRENT_USER) return;

  const q = query(collection(db, 'messages'),
    or(
      where('senderUid', '==', CURRENT_USER.uid),
      where('receiverUid', '==', CURRENT_USER.uid)
    )
  );

  unsubscribeAllUserMessages = onSnapshot(q, (snapshot) => {
    LAST_MESSAGE_MAP = {};
    snapshot.forEach((d) => {
      const data = d.data();
      const createdAt = data.createdAt?.toDate?.() || new Date();
      const otherUid = data.senderUid === CURRENT_USER.uid ? data.receiverUid : data.senderUid;
      if (otherUid) {
        const currentLast = LAST_MESSAGE_MAP[otherUid];
        if (!currentLast || createdAt > currentLast) LAST_MESSAGE_MAP[otherUid] = createdAt;
      }
    });
    sortAndRenderUsers();
  });
}

function sortAndRenderUsers() {
  ALL_USERS.sort((a, b) => {
    const aTime = LAST_MESSAGE_MAP[a.uid]?.getTime() || 0;
    const bTime = LAST_MESSAGE_MAP[b.uid]?.getTime() || 0;
    if (aTime > 0 && bTime > 0) return bTime - aTime;
    if (aTime > 0) return -1;
    if (bTime > 0) return 1;
    return a.ingameName.localeCompare(b.ingameName);
  });
  renderChatUserList();
}

function isUserOnline(user) {
  if (!user.lastActive) return false;
  return (new Date() - user.lastActive) / 1000 / 60 < 5;
}

function renderChatUserList() {
  const container = document.getElementById('chatUserList');
  if (!container) return;

  if (ALL_USERS.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:40px 20px;color:rgba(255,255,255,0.3);font-size:0.9rem;"><p>No other members found.</p></div>`;
    return;
  }

  container.innerHTML = ALL_USERS.map(user => {
    const online = isUserOnline(user);
    return `
      <div class="chat-user-card" onclick="window.openChatWithUser('${user.uid}')" style="display:flex;align-items:center;gap:10px;">
        ${getAuthorDotHTML(user.photoURL, user.initials || user.ingameName.substring(0, 2), "width:24px;height:24px;font-size:0.6rem;margin:0;flex-shrink:0;")}
        <div class="chat-user-info" style="flex:1;">
          <span class="chat-user-name">${escapeHTML(user.ingameName)}</span>
        </div>
        <span class="status-dot ${online ? 'online' : 'offline'}" title="${online ? 'Online' : 'Offline'}"></span>
      </div>`;
  }).join('');
}

function openChatWithUser(userUid) {
  const targetUser = ALL_USERS.find(u => u.uid === userUid);
  if (!targetUser) return;

  stopChatting();
  ACTIVE_CHAT_USER = targetUser;

  document.getElementById('chatUserListContainer').style.display = 'none';
  document.getElementById('chatRoomContainer').style.display = 'flex';
  document.getElementById('chatRoomHeaderName').textContent = ACTIVE_CHAT_USER.ingameName;

  const statusEl = document.getElementById('chatRoomHeaderStatus');
  const online = isUserOnline(ACTIVE_CHAT_USER);
  statusEl.innerHTML = `<span class="status-dot ${online ? 'online' : 'offline'}"></span>${online ? 'Online' : 'Offline'}`;

  const inputEl = document.getElementById('chatMessageInput');
  if (inputEl) { inputEl.value = ''; inputEl.style.height = ''; inputEl.focus(); }

  setupMessagesListener();
  setupTypingStateListener();
  setupDragAndDropListeners();
}
window.openChatWithUser = openChatWithUser;

function setupMessagesListener() {
  if (unsubscribeMessages) unsubscribeMessages();
  if (!CURRENT_USER || !ACTIVE_CHAT_USER) return;

  const uids = [CURRENT_USER.uid, ACTIVE_CHAT_USER.uid].sort();
  const chatId = uids.join('_');

  const q = query(collection(db, 'messages'), where('chatId', '==', chatId));
  unsubscribeMessages = onSnapshot(q, (snapshot) => {
    MESSAGES = [];
    snapshot.forEach((d) => {
      const data = d.data();
      MESSAGES.push({
        id: d.id,
        senderUid: data.senderUid,
        senderName: data.senderName,
        text: data.text,
        imageUrl: data.imageUrl || '',
        createdAt: data.createdAt?.toDate?.() || new Date()
      });
    });
    MESSAGES.sort((a, b) => a.createdAt - b.createdAt);
    renderChatMessages();
  });
}

function renderChatMessages() {
  const container = document.getElementById('chatMessagesBody');
  if (!container) return;

  if (MESSAGES.length === 0) {
    container.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:rgba(255,255,255,0.3);font-size:0.9rem;text-align:center;"><p>No messages yet.</p><p style="font-size:0.75rem;color:rgba(255,255,255,0.2);margin-top:4px;">Say hi to start chatting!</p></div>`;
    return;
  }

  container.innerHTML = MESSAGES.map(msg => {
    const isSelf = msg.senderUid === CURRENT_USER.uid;
    const timeStr = msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const imageHTML = msg.imageUrl
      ? `<div style="margin-top:6px;"><img src="${escapeHTML(msg.imageUrl)}" style="max-width:100%;max-height:200px;border-radius:6px;cursor:pointer;border:1px solid rgba(255,255,255,0.1);" alt="Chat image" /></div>`
      : '';
    return `
      <div class="msg-row ${isSelf ? 'row-self' : 'row-other'}">
        <div class="msg-bubble ${isSelf ? 'msg-self' : 'msg-other'}">
          ${msg.text ? `<div class="msg-text">${parseDiscordFormatting(msg.text)}</div>` : ''}
          ${imageHTML}
          <div class="msg-time">${timeStr}</div>
        </div>
      </div>`;
  }).join('');

  container.scrollTop = container.scrollHeight;
}

async function sendChatMessage() {
  if (!CURRENT_USER || !ACTIVE_CHAT_USER) return;

  const inputEl = document.getElementById('chatMessageInput');
  const text = inputEl?.value?.trim() || '';
  const imageUrl = CHAT_SELECTED_MEDIA_BASE64 || '';

  if (!text && !imageUrl) return;

  const uids = [CURRENT_USER.uid, ACTIVE_CHAT_USER.uid].sort();
  const chatId = uids.join('_');

  try {
    await addDoc(collection(db, 'messages'), {
      chatId,
      senderUid: CURRENT_USER.uid,
      receiverUid: ACTIVE_CHAT_USER.uid,
      senderName: CURRENT_USER.ingameName || CURRENT_USER.name,
      text,
      imageUrl,
      createdAt: serverTimestamp()
    });

    if (inputEl) { inputEl.value = ''; inputEl.style.height = ''; }
    removeChatMedia();
    updateMyTypingState(false);
  } catch (err) {
    console.error('Error sending message:', err);
    showToast('Failed to send message.', 'error');
  }
}
window.sendChatMessage = sendChatMessage;

// Typing indicator
async function updateMyTypingState(isTyping) {
  if (!CURRENT_USER || !ACTIVE_CHAT_USER) return;
  const uids = [CURRENT_USER.uid, ACTIVE_CHAT_USER.uid].sort();
  const chatId = uids.join('_');
  try {
    await setDoc(doc(db, 'typing_states', chatId), { [CURRENT_USER.uid]: isTyping }, { merge: true });
    isCurrentlyTyping = isTyping;
  } catch (err) { console.error("Typing state error:", err); }
}

function handleTypingInput() {
  if (!isCurrentlyTyping) updateMyTypingState(true);
  if (typingTimeout) clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => updateMyTypingState(false), 2000);
}
window.handleTypingInput = handleTypingInput;

function setupTypingStateListener() {
  if (unsubscribeTypingState) { unsubscribeTypingState(); unsubscribeTypingState = null; }
  const indicatorEl = document.getElementById('chatTypingIndicator');
  if (indicatorEl) indicatorEl.style.display = 'none';
  if (!CURRENT_USER || !ACTIVE_CHAT_USER) return;

  const uids = [CURRENT_USER.uid, ACTIVE_CHAT_USER.uid].sort();
  const chatId = uids.join('_');

  unsubscribeTypingState = onSnapshot(doc(db, 'typing_states', chatId), (docSnap) => {
    const textEl = document.getElementById('chatTypingText');
    if (docSnap.exists() && ACTIVE_CHAT_USER) {
      const data = docSnap.data();
      if (data[ACTIVE_CHAT_USER.uid] === true) {
        if (textEl) textEl.textContent = `${ACTIVE_CHAT_USER.ingameName} is typing`;
        if (indicatorEl) indicatorEl.style.display = 'flex';
      } else {
        if (indicatorEl) indicatorEl.style.display = 'none';
      }
    } else {
      if (indicatorEl) indicatorEl.style.display = 'none';
    }
  });
}

function stopChatting() {
  if (typingTimeout) { clearTimeout(typingTimeout); typingTimeout = null; }
  if (isCurrentlyTyping) updateMyTypingState(false);
  if (unsubscribeTypingState) { unsubscribeTypingState(); unsubscribeTypingState = null; }
  const indicatorEl = document.getElementById('chatTypingIndicator');
  if (indicatorEl) indicatorEl.style.display = 'none';
  removeChatMedia();
}

function handleChatFile(file) {
  if (file && file.type.startsWith('image/')) {
    compressImage(file).then(dataUrl => {
      CHAT_SELECTED_MEDIA_BASE64 = dataUrl;
      const previewEl = document.getElementById('chatMediaPreview');
      const previewImg = document.getElementById('chatMediaPreviewImg');
      if (previewEl && previewImg) { previewImg.src = dataUrl; previewEl.style.display = 'flex'; }
    });
  }
}

function removeChatMedia() {
  CHAT_SELECTED_MEDIA_BASE64 = '';
  const previewEl = document.getElementById('chatMediaPreview');
  const previewImg = document.getElementById('chatMediaPreviewImg');
  if (previewEl) previewEl.style.display = 'none';
  if (previewImg) previewImg.removeAttribute('src');
}
window.removeChatMedia = removeChatMedia;

function setupDragAndDropListeners() {
  const dropZone = document.getElementById('chatRoomContainer');
  const inputEl = document.getElementById('chatMessageInput');
  if (!dropZone || !inputEl) return;

  ['dragenter', 'dragover'].forEach(ev => {
    dropZone.addEventListener(ev, (e) => { e.preventDefault(); e.stopPropagation(); dropZone.classList.add('drag-active'); }, false);
  });
  ['dragleave', 'drop'].forEach(ev => {
    dropZone.addEventListener(ev, (e) => { e.preventDefault(); e.stopPropagation(); dropZone.classList.remove('drag-active'); }, false);
  });
  dropZone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files?.length) handleChatFile(files[0]);
  }, false);
  inputEl.addEventListener('paste', (e) => {
    const items = (e.clipboardData || e.originalEvent?.clipboardData)?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) { e.preventDefault(); handleChatFile(file); break; }
      }
    }
  });
}

// ═════════════════════════════════════=
//  PAGE-SPECIFIC INITIALIZATIONS
// ═════════════════════════════════════=
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Firebase listeners based on which page we're on
  const path = window.location.pathname;

  // Always load announcements (for homepage preview or overlay)
  initAnnouncementsListener();

  // War Logs page
  if (path.includes('war') || path.includes('War')) {
    initWarLogsListener();
    // Set up search with debounce
    const searchInput = document.getElementById('warLogSearch');
    if (searchInput) {
      searchInput.addEventListener('input', debounce((e) => {
        const activeFilter = document.querySelector('#warLogFilters .chip.active');
        const outcome = activeFilter?.dataset?.filter || 'all';
        renderWarLogs(outcome, e.target.value);
      }, 250));
    }
  }

  // Memories page
  if (path.includes('memories') || path.includes('Memories')) {
    initMemoriesListener();
    const searchInput = document.getElementById('memoriesSearch');
    if (searchInput) {
      searchInput.addEventListener('input', debounce((e) => {
        renderMemories(e.target.value);
      }, 250));
    }
  }

  // Hierarchy page search/filter
  if (path.includes('hierarchy') || path.includes('Hierarchy')) {
    initHierarchySearch();
  }

  // Rules page
  if (path.includes('rules') || path.includes('Rules')) {
    initRulesPage();
  }
});

// ═════════════════════════════════════=
//  HIERARCHY SEARCH & FILTER
// ═════════════════════════════════════=
function initHierarchySearch() {
  const searchInput = document.getElementById('hierarchySearch');
  const filterChips = document.querySelectorAll('#hierarchyFilters .chip');
  const cards = document.querySelectorAll('.rank-card');

  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => filterHierarchy(), 200));
  }

  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      filterHierarchy();
    });
  });
}

function filterHierarchy() {
  const searchInput = document.getElementById('hierarchySearch');
  const activeChip = document.querySelector('#hierarchyFilters .chip.active');
  const cards = document.querySelectorAll('.rank-card');
  const term = (searchInput?.value || '').toLowerCase();
  const filter = activeChip?.dataset?.filter || 'all';

  let hasResults = false;

  cards.forEach(card => {
    const name = (card.dataset.name || '').toLowerCase();
    const category = (card.dataset.category || '').toLowerCase();
    const desc = (card.dataset.description || '').toLowerCase();

    const matchesSearch = !term || name.includes(term) || category.includes(term) || desc.includes(term);
    const matchesFilter = filter === 'all' || category === filter;

    if (matchesSearch && matchesFilter) {
      card.style.display = '';
      hasResults = true;
    } else {
      card.style.display = 'none';
    }
  });

  // Show/hide no results message
  const noResults = document.getElementById('hierarchyNoResults');
  if (noResults) noResults.style.display = hasResults ? 'none' : 'block';
}

// Hierarchy modal
function openRankModal(name, category, summary, description, badgeClass) {
  document.getElementById('modalContent').innerHTML = `
    <span class="modal-badge ${badgeClass}">${escapeHTML(category)}</span>
    <h2 class="modal-title">${escapeHTML(name)}</h2>
    <p class="modal-subtitle">RANK DETAILS</p>
    <div class="modal-divider"></div>
    <div class="modal-section-title">DESCRIPTION</div>
    <p class="modal-text">${escapeHTML(description)}</p>
  `;
  openModal();
}
window.openRankModal = openRankModal;

// ═════════════════════════════════════=
//  RULES PAGE
// ═════════════════════════════════════=
function initRulesPage() {
  // Sticky TOC active section tracking
  const sections = document.querySelectorAll('.rule-category[id]');
  const tocLinks = document.querySelectorAll('.rules-toc a');

  if (sections.length && tocLinks.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          tocLinks.forEach(link => link.classList.remove('active'));
          const activeLink = document.querySelector(`.rules-toc a[href="#${entry.target.id}"]`);
          if (activeLink) activeLink.classList.add('active');
        }
      });
    }, { threshold: 0.2, rootMargin: '-80px 0px -60% 0px' });

    sections.forEach(s => observer.observe(s));
  }

  // Mobile TOC toggle
  const tocToggle = document.getElementById('rulesTocToggle');
  const tocDropdown = document.getElementById('rulesTocDropdown');
  if (tocToggle && tocDropdown) {
    tocToggle.addEventListener('click', () => tocDropdown.classList.toggle('open'));
    tocDropdown.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => tocDropdown.classList.remove('open'));
    });
  }

  // Rules search
  const searchInput = document.getElementById('rulesSearch');
  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      const term = e.target.value.toLowerCase();
      document.querySelectorAll('.rule-item').forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = !term || text.includes(term) ? '' : 'none';
      });
      document.querySelectorAll('.rule-category').forEach(cat => {
        const visibleItems = cat.querySelectorAll('.rule-item[style=""], .rule-item:not([style])');
        // Show category if it has any visible items or no search term
        const hasVisible = !term || Array.from(cat.querySelectorAll('.rule-item')).some(
          item => item.style.display !== 'none'
        );
        cat.style.display = hasVisible ? '' : 'none';
      });
    }, 200));
  }
}

// War log filter chips
function setWarLogFilter(outcome) {
  document.querySelectorAll('#warLogFilters .chip').forEach(c => c.classList.remove('active'));
  event.target.classList.add('active');
  const searchInput = document.getElementById('warLogSearch');
  renderWarLogs(outcome, searchInput?.value || '');
}
window.setWarLogFilter = setWarLogFilter;
