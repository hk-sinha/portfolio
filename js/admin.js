import { auth, db, collection, addDoc, getDocs, deleteDoc, doc, getDoc, setDoc, signInWithEmailAndPassword, onAuthStateChanged, signOut, query, orderBy, GoogleAuthProvider, signInWithPopup } from "./firebase-init.js";

// DOM Elements
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const loginError = document.getElementById('login-error');

// Auth State Observer
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is logged in
        const adminEmailEl = document.getElementById('info-admin-email');
        if (adminEmailEl && user.email) {
            adminEmailEl.textContent = user.email;
        }
        
        loginSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        loadProjects();
        loadProfile();
        loadSkills();
    } else {
        // User is logged out
        loginSection.classList.remove('hidden');
        dashboardSection.classList.add('hidden');
    }
});

// Login
loginBtn.addEventListener('click', async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
        loginError.style.display = 'none';
    } catch (error) {
        loginError.textContent = error.message;
        loginError.style.display = 'block';
    }
});

// Google Login
const googleLoginBtn = document.getElementById('google-login-btn');
if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            loginError.style.display = 'none';
        } catch (error) {
            loginError.textContent = error.message;
            loginError.style.display = 'block';
        }
    });
}

// Logout
logoutBtn.addEventListener('click', () => {
    signOut(auth);
});

// Tabs Logic
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(tc => tc.classList.add('hidden'));
        
        e.target.classList.add('active');
        document.getElementById(e.target.dataset.target).classList.remove('hidden');
    });
});

// --- PROJECTS LOGIC ---
let currentEditingId = null;

// Add or Update Project
document.getElementById('add-project-btn').addEventListener('click', async () => {
    const title = document.getElementById('proj-title').value;
    const desc = document.getElementById('proj-desc').value;
    const category = document.getElementById('proj-category').value;
    const type = document.getElementById('proj-type').value;
    const shape = document.getElementById('proj-shape').value;
    const mediaId = document.getElementById('proj-media').value;
    const msg = document.getElementById('add-proj-msg');

    if(!title || !mediaId) {
        msg.textContent = "Please fill all fields!";
        msg.style.color = "#ff4757";
        return;
    }

    try {
        msg.textContent = currentEditingId ? "Updating..." : "Adding...";
        msg.style.color = "#ccc";
        
        const projectData = {
            title: title,
            description: desc,
            category: category,
            type: type,
            shape: shape,
            mediaId: mediaId,
            timestamp: new Date().getTime()
        };

        if (currentEditingId) {
            await setDoc(doc(db, "projects", currentEditingId), projectData, { merge: true });
            msg.textContent = "Project updated successfully!";
        } else {
            await addDoc(collection(db, "projects"), projectData);
            msg.textContent = "Project added successfully!";
        }
        
        msg.style.color = "#2ed573";
        
        resetProjectForm();
        
        // Reload list
        loadProjects();
    } catch (e) {
        msg.textContent = "Error: " + e.message;
        msg.style.color = "#ff4757";
    }
});

document.getElementById('cancel-edit-btn').addEventListener('click', resetProjectForm);

function resetProjectForm() {
    currentEditingId = null;
    document.getElementById('form-title').textContent = "Add New Project";
    document.getElementById('add-project-btn').textContent = "Add Project";
    document.getElementById('cancel-edit-btn').classList.add('hidden');
    
    document.getElementById('proj-title').value = '';
    document.getElementById('proj-desc').value = '';
    document.getElementById('proj-media').value = '';
    document.getElementById('add-proj-msg').textContent = '';
}

// Load Projects
async function loadProjects() {
    const container = document.getElementById('projects-container');
    container.innerHTML = '<p>Loading projects...</p>';
    
    try {
        const q = query(collection(db, "projects"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        container.innerHTML = '';
        
        // Analytics variables
        let totalProjects = 0;
        let videoCount = 0;
        let designCount = 0;
        let photoCount = 0;

        const recentActivityContainer = document.getElementById('recent-activity-list');
        if (recentActivityContainer) {
            recentActivityContainer.innerHTML = '';
        }

        if(querySnapshot.empty) {
            container.innerHTML = '<p>No projects found.</p>';
            if (recentActivityContainer) {
                recentActivityContainer.innerHTML = '<p style="color: #aaa;">No recent activity.</p>';
            }
            updateAnalyticsUI(totalProjects, videoCount, designCount, photoCount);
            return;
        }

        let projectIndex = 0;

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const id = docSnap.id;
            
            // Analytics Calculation
            totalProjects++;
            if (data.category === 'video') videoCount++;
            else if (data.category === 'design') designCount++;
            else if (data.category === 'photo') photoCount++;

            // Recent Activity (Top 5)
            if (projectIndex < 5 && recentActivityContainer) {
                const date = data.timestamp ? new Date(data.timestamp).toLocaleDateString() : 'Unknown Date';
                const activityHtml = `
                    <div class="activity-item">
                        <div class="activity-details">
                            <h4>${data.title}</h4>
                            <p>${data.category.toUpperCase()} | ${data.type || 'N/A'}</p>
                        </div>
                        <div class="activity-date">${date}</div>
                    </div>
                `;
                recentActivityContainer.insertAdjacentHTML('beforeend', activityHtml);
            }
            projectIndex++;

            const card = document.createElement('div');
            card.className = 'project-card';
            
            let imgUrl = data.mediaId;
            if(!imgUrl.startsWith('http')) {
                // Assume it's a youtube ID
                imgUrl = `https://img.youtube.com/vi/${data.mediaId}/maxresdefault.jpg`;
            }

            card.innerHTML = `
                <img src="${imgUrl}" alt="${data.title}">
                <h3>${data.title}</h3>
                <p>Type: ${data.type || data.category} | Shape: ${data.shape}</p>
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <button class="btn edit-btn" data-id="${id}" style="flex: 1;">Edit</button>
                    <button class="btn btn-danger delete-btn" data-id="${id}" style="flex: 1;">Delete</button>
                </div>
            `;
            // Attach data string for easy edit population
            card.querySelector('.edit-btn').dataset.project = JSON.stringify(data);
            
            container.appendChild(card);
        });

        // Update Analytics UI
        updateAnalyticsUI(totalProjects, videoCount, designCount, photoCount);

        // Attach edit events
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const data = JSON.parse(e.target.getAttribute('data-project'));
                
                currentEditingId = id;
                document.getElementById('form-title').textContent = "Edit Project";
                document.getElementById('add-project-btn').textContent = "Update Project";
                document.getElementById('cancel-edit-btn').classList.remove('hidden');
                
                document.getElementById('proj-title').value = data.title || '';
                document.getElementById('proj-desc').value = data.description || '';
                document.getElementById('proj-category').value = data.category || 'video';
                document.getElementById('proj-type').value = data.type || 'reel';
                document.getElementById('proj-shape').value = data.shape || 'landscape';
                document.getElementById('proj-media').value = data.mediaId || '';
                
                document.getElementById('add-proj-msg').textContent = '';
                
                // Scroll to top
                document.getElementById('form-title').scrollIntoView({ behavior: 'smooth' });
            });
        });

        // Attach delete events
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if(confirm("Are you sure you want to delete this project?")) {
                    const id = e.target.getAttribute('data-id');
                    await deleteDoc(doc(db, "projects", id));
                    loadProjects();
                }
            });
        });

    } catch (error) {
        container.innerHTML = '<p style="color:red;">Error loading projects.</p>';
        console.error(error);
    }
}

function updateAnalyticsUI(total, video, design, photo) {
    const totalEl = document.getElementById('stat-total');
    const videoEl = document.getElementById('stat-video');
    const designEl = document.getElementById('stat-design');
    const photoEl = document.getElementById('stat-photo');

    if (totalEl) totalEl.textContent = total;
    if (videoEl) videoEl.textContent = video;
    if (designEl) designEl.textContent = design;
    if (photoEl) photoEl.textContent = photo;
}

// --- PROFILE LOGIC ---

// Load Profile
async function loadProfile() {
    try {
        const docSnap = await getDoc(doc(db, "settings", "profile"));
        if(docSnap.exists()) {
            const data = docSnap.data();
            document.getElementById('profile-about').value = data.about || '';
            document.getElementById('profile-address').value = data.address || '';
            document.getElementById('profile-location-link').value = data.locationLink || '';
            document.getElementById('profile-email').value = data.email || '';
            document.getElementById('profile-phone').value = data.phone || '';
            document.getElementById('profile-resume').value = data.resumeLink || '';
        }
    } catch (e) {
        console.error("Error loading profile", e);
    }
}

// Save Profile
document.getElementById('save-profile-btn').addEventListener('click', async () => {
    const about = document.getElementById('profile-about').value;
    const address = document.getElementById('profile-address').value;
    const locationLink = document.getElementById('profile-location-link').value;
    const email = document.getElementById('profile-email').value;
    const phone = document.getElementById('profile-phone').value;
    const resumeLink = document.getElementById('profile-resume').value;
    const msg = document.getElementById('save-profile-msg');

    try {
        msg.textContent = "Saving...";
        msg.style.color = "#ccc";

        await setDoc(doc(db, "settings", "profile"), {
            about, address, locationLink, email, phone, resumeLink
        });

        msg.textContent = "Profile saved successfully!";
        msg.style.color = "#2ed573";
    } catch (e) {
        msg.textContent = "Error saving: " + e.message;
        msg.style.color = "#ff4757";
    }
});

// --- SKILLS LOGIC ---

// Update span value when slider moves
const skillInputs = [
    'photoshop', 'illustrator', 'premiere', 'aftereffects', 'audition',
    'ai-video-gen', 'ai-prompt', 'ai-story', 'ai-post', 'ai-voice'
];

skillInputs.forEach(skill => {
    const slider = document.getElementById(`sk-${skill}`);
    const valSpan = document.getElementById(`val-${skill}`);
    if(slider && valSpan) {
        // Init default property
        slider.style.setProperty('--val', slider.value + '%');
        
        slider.addEventListener('input', (e) => {
            valSpan.textContent = e.target.value + '%';
            slider.style.setProperty('--val', e.target.value + '%');
        });
    }
});

// Load Skills
async function loadSkills() {
    try {
        const docSnap = await getDoc(doc(db, "settings", "skills"));
        if(docSnap.exists()) {
            const data = docSnap.data();
            skillInputs.forEach(skill => {
                if(data[skill] !== undefined) {
                    const slider = document.getElementById(`sk-${skill}`);
                    const valSpan = document.getElementById(`val-${skill}`);
                    if(slider && valSpan) {
                        slider.value = data[skill];
                        slider.style.setProperty('--val', data[skill] + '%');
                        valSpan.textContent = data[skill] + '%';
                    }
                }
            });
        }
    } catch (e) {
        console.error("Error loading skills", e);
    }
}

// Call loadSkills() on startup if logged in (added below loadProfile)
// Wait, we need to ensure loadSkills is called in onAuthStateChanged
// Since I can't easily edit line 16, I will just call it here assuming auth is already checked or will be checked.
// Actually, it's better to export it or just add it to the auth observer.

// Save Skills
document.getElementById('save-skills-btn').addEventListener('click', async () => {
    const msg = document.getElementById('save-skills-msg');
    
    const skillsData = {};
    skillInputs.forEach(skill => {
        const slider = document.getElementById(`sk-${skill}`);
        if(slider) {
            skillsData[skill] = slider.value;
        }
    });

    try {
        msg.textContent = "Saving...";
        msg.style.color = "#ccc";

        await setDoc(doc(db, "settings", "skills"), skillsData);

        msg.textContent = "Skills saved successfully!";
        msg.style.color = "#2ed573";
    } catch (e) {
        msg.textContent = "Error saving: " + e.message;
        msg.style.color = "#ff4757";
    }
});
