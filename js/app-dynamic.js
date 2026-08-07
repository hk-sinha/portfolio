import { db, collection, getDocs, doc, getDoc, query, orderBy, limit } from "./firebase-init.js";

async function loadDynamicContent() {
    // 1. Load Profile Details
    try {
        const docSnap = await getDoc(doc(db, "settings", "profile"));
        if (docSnap.exists()) {
            const data = docSnap.data();

            const aboutEl = document.getElementById('dynamic-about-me');
            if (aboutEl && data.about) aboutEl.innerHTML = data.about.replace(/\n/g, '<br>');

            const addressEl = document.getElementById('dynamic-address');
            if (addressEl && data.address) {
                if (data.locationLink) {
                    addressEl.innerHTML = `<a href="${data.locationLink}" target="_blank" style="color: inherit; text-decoration: none;">${data.address}</a>`;
                } else {
                    addressEl.innerHTML = data.address;
                }
            }

            const emailEl = document.getElementById('dynamic-email');
            if (emailEl && data.email) {
                emailEl.href = `mailto:${data.email}`;
                emailEl.textContent = data.email;
            }

            const phoneEl = document.getElementById('dynamic-phone');
            if (phoneEl && data.phone) {
                phoneEl.href = `tel:${data.phone.replace(/[\s-]/g, '')}`;
                phoneEl.textContent = data.phone;
            }

            const resumeEl = document.getElementById('dynamic-resume-link');
            if (resumeEl && data.resumeLink) {
                resumeEl.href = data.resumeLink;
            }

            const copyrightEls = document.querySelectorAll('.dynamic-copyright');
            if (copyrightEls.length > 0 && data.copyright) {
                copyrightEls.forEach(el => el.innerHTML = data.copyright);
            }
        }
    } catch (e) {
        console.error("Error loading profile details:", e);
    }

    // 2. Load Latest Works (Limit 10)
    const latestWorksContainer = document.getElementById('dynamic-latest-works');
    if (latestWorksContainer) {
        try {
            const q = query(collection(db, "projects"), orderBy("timestamp", "desc"), limit(5));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                latestWorksContainer.innerHTML = ''; // Clear placeholders
                querySnapshot.forEach((docSnap) => {
                    const data = docSnap.data();
                    let imgUrl = data.mediaId;
                    if (!imgUrl.startsWith('http')) {
                        imgUrl = `https://img.youtube.com/vi/${data.mediaId}/maxresdefault.jpg`;
                    }

                    const shapeClass = data.shape === 'landscape' ? 'landscape' : 'portrait';

                    const html = `
                    <div class="video-item ${shapeClass}">
                        <a href="portfolio.html">
                            <img src="${imgUrl}" alt="${data.title}" data-aos="zoom-in" data-aos-duration="100" data-aos-delay="2" data-aos-offset="0">
                        </a>
                    </div>
                    `;
                    latestWorksContainer.insertAdjacentHTML('beforeend', html);
                });
            }
        } catch (e) {
            console.error("Error loading latest works:", e);
        }
    }

    // 3. Load All Works in Portfolio.html
    const allWorksContainer = document.getElementById('dynamic-all-works');
    if (allWorksContainer) {
        try {
            const q = query(collection(db, "projects"), orderBy("timestamp", "desc"));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                allWorksContainer.innerHTML = '';
                querySnapshot.forEach((docSnap) => {
                    const data = docSnap.data();
                    let imgUrl = data.mediaId;
                    if (!imgUrl.startsWith('http')) {
                        imgUrl = `https://img.youtube.com/vi/${data.mediaId}/maxresdefault.jpg`;
                    }

                    const typeClass = data.type || data.category;

                    const descHtml = data.description ? `<p class="proj-desc" style="font-size: 14px; font-weight: normal; color: #ccc; text-transform: none; margin-top: 8px;">${data.description}</p>` : '';

                    const html = `
                    <div class="row ${typeClass}">
                        <div class="video-container" data-video-id="${data.mediaId}">
                            <img class="hover-video" src="${imgUrl}" alt="${data.title}">
                        </div>
                        <h4 style="font-weight: bold; font-size: 16px; margin-top: 15px; text-transform: none; letter-spacing: 1px;">${data.title}</h4>
                        ${descHtml}
                        <div class="link" style="margin-top: 10px;">
                            <a href="#" class="watch-now" data-video-id="${data.mediaId}">Watch Now <i class="fa-solid fa-arrow-right"></i></a>
                        </div>
                    </div>
                    `;
                    allWorksContainer.insertAdjacentHTML('beforeend', html);
                });
            }
        } catch (e) {
            console.error("Error loading all works:", e);
        }
    }
}

// Load Graphic Design Works
async function loadGDWorks() {
    const posterContainer = document.getElementById('dynamic-gd-poster');
    const logoContainer = document.getElementById('dynamic-gd-logo');

    if (posterContainer || logoContainer) {
        try {
            const q = query(collection(db, "projects"), orderBy("timestamp", "desc"));
            const querySnapshot = await getDocs(q);

            let posterHtml = '';
            let logoHtml = '';

            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                if (data.category === 'design' || data.type === 'poster' || data.type === 'logo') {
                    const imgUrl = data.mediaId;
                    const html = `<div class="image ${data.type}" data-aos="zoom-in" data-aos-duration="600" data-aos-delay="50" data-aos-offset="5"><img src="${imgUrl}" alt="${data.title || ''}"></div>`;

                    if (data.type === 'poster') {
                        posterHtml += html;
                    } else if (data.type === 'logo') {
                        logoHtml += html;
                    }
                }
            });

            if (posterContainer) {
                posterContainer.innerHTML = posterHtml || '<p style="color:#fff; text-align:center;">No posters found.</p>';
            }
            if (logoContainer) {
                logoContainer.innerHTML = logoHtml || '<p style="color:#fff; text-align:center;">No logos found.</p>';
            }

            setupGalleryPopups();
        } catch (e) {
            console.error("Error loading GD works:", e);
        }
    }
}

// Load Photography Works
async function loadPhotoWorks() {
    const photoContainer = document.getElementById('dynamic-photo');

    if (photoContainer) {
        try {
            const q = query(collection(db, "projects"), orderBy("timestamp", "desc"));
            const querySnapshot = await getDocs(q);

            let photoHtml = '';

            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                if (data.category === 'photo' || data.type === 'photo') {
                    const imgUrl = data.mediaId;
                    photoHtml += `<div class="image" data-aos="zoom-in" data-aos-duration="600" data-aos-delay="50" data-aos-offset="5"><img src="${imgUrl}" alt="${data.title || ''}"></div>`;
                }
            });

            photoContainer.innerHTML = photoHtml || '<p style="color:#fff; text-align:center;">No photos found.</p>';

            setupGalleryPopups();
        } catch (e) {
            console.error("Error loading Photo works:", e);
        }
    }
}

// Dynamic Gallery Popup Logic
function setupGalleryPopups() {
    const images = document.querySelectorAll('.image img');
    const popup = document.querySelector('.popup-image');
    const popupImg = document.getElementById('popup-img');

    if (!popup || images.length === 0) return;

    // We remove old listeners by cloning if needed, but since we recreate DOM elements, 
    // the old images are gone. We just attach to the new ones.

    images.forEach((img, index) => {
        img.addEventListener('click', () => {
            window.currentGalleryIndex = index;
            window.galleryImages = images;
            popupImg.src = img.src;
            popup.style.visibility = 'visible';
            popup.style.opacity = '1';
        });
    });
}

// Expose popup nav globally for inline scripts to use, or attach it here safely
window.nextImage = function () {
    if (!window.galleryImages || window.galleryImages.length === 0) return;
    window.currentGalleryIndex = (window.currentGalleryIndex + 1) % window.galleryImages.length;
    document.getElementById('popup-img').src = window.galleryImages[window.currentGalleryIndex].src;
};

window.prevImage = function () {
    if (!window.galleryImages || window.galleryImages.length === 0) return;
    window.currentGalleryIndex = (window.currentGalleryIndex - 1 + window.galleryImages.length) % window.galleryImages.length;
    document.getElementById('popup-img').src = window.galleryImages[window.currentGalleryIndex].src;
};

window.closePopup = function () {
    const popup = document.querySelector('.popup-image');
    if (popup) {
        popup.style.visibility = 'hidden';
        popup.style.opacity = '0';
    }
};

// Load Dynamic Skills
async function loadDynamicSkills() {
    try {
        const docSnap = await getDoc(doc(db, "settings", "skills"));
        if (docSnap.exists()) {
            const data = docSnap.data();
            const skillInputs = [
                'photoshop', 'illustrator', 'premiere', 'aftereffects', 'audition',
                'ai-video-gen', 'ai-prompt', 'ai-story', 'ai-post', 'ai-voice'
            ];

            skillInputs.forEach(skill => {
                if (data[skill] !== undefined) {
                    const textSpan = document.getElementById(`skill-${skill}-text`);
                    const barSpan = document.getElementById(`skill-${skill}-bar`);
                    if (textSpan) textSpan.textContent = data[skill] + '%';
                    if (barSpan) barSpan.style.width = data[skill] + '%';
                }
            });
        }
    } catch (e) {
        console.error("Error loading dynamic skills:", e);
    }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    loadDynamicContent();
    loadGDWorks();
    loadPhotoWorks();
    loadDynamicSkills();
});
