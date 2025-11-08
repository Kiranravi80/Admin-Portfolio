// Portfolio Data - In-Memory Storage
let portfolioData = {
  profile: {
    name: "Your Name",
    title: "Full Stack Developer",
    bio: "Passionate about creating beautiful and functional web applications",
    socialMedia: {
      github: "https://github.com/yourusername",
      linkedin: "https://linkedin.com/in/yourprofile",
      twitter: "https://twitter.com/yourhandle",
      instagram: "https://instagram.com/yourprofile"
    }
  },
  about: {
    content: "I am a dedicated full-stack developer with expertise in web development, AI integration, and blockchain technology. With a strong foundation in both frontend and backend technologies, I create innovative solutions that solve real-world problems. My passion lies in building scalable applications and continuously learning new technologies."
  },
  education: [
    { id: 1, university: "University of Technology", year: 2023, score: 3.8 },
    { id: 2, university: "Institute of Computer Science", year: 2021, score: 3.9 }
  ],
  skills: [
    { id: 1, name: "JavaScript", score: 90 },
    { id: 2, name: "Python", score: 85 },
    { id: 3, name: "React", score: 88 },
    { id: 4, name: "Node.js", score: 87 },
    { id: 5, name: "MongoDB", score: 82 },
    { id: 6, name: "Blockchain", score: 75 }
  ],
  experience: [
    {
      id: 1,
      title: "Senior Developer",
      company: "Tech Corp",
      startDate: "2023-01",
      endDate: "Present",
      description: "Led development of multiple full-stack applications with focus on performance optimization"
    },
    {
      id: 2,
      title: "Junior Developer",
      company: "StartUp Inc",
      startDate: "2021-06",
      endDate: "2022-12",
      description: "Developed responsive web applications using React and Node.js"
    }
  ],
  projects: [
    {
      id: 1,
      title: "AI Chatbot Application",
      description: "An intelligent chatbot powered by machine learning for customer support",
      preview: "https://via.placeholder.com/300x200?text=AI+Chatbot",
      link: "https://example.com/chatbot",
      githubLink: "https://github.com/yourusername/ai-chatbot"
    },
    {
      id: 2,
      title: "Blockchain Certificate System",
      description: "Secure certificate issuance and verification system using blockchain technology",
      preview: "https://via.placeholder.com/300x200?text=Blockchain",
      link: "https://example.com/certificates",
      githubLink: "https://github.com/yourusername/blockchain-certs"
    }
  ],
  certifications: [
    {
      id: 1,
      title: "AWS Solutions Architect",
      description: "Professional certification in AWS cloud architecture and design",
      preview: "https://via.placeholder.com/200x200?text=AWS"
    },
    {
      id: 2,
      title: "Machine Learning Specialization",
      description: "Advanced machine learning and deep learning techniques certification",
      preview: "https://via.placeholder.com/200x200?text=ML"
    }
  ],
  achievements: [
    {
      id: 1,
      title: "Hackathon Winner 2023",
      description: "Won first place in National Hackathon with an innovative AI application",
      preview: "https://via.placeholder.com/200x200?text=Hackathon"
    },
    {
      id: 2,
      title: "Open Source Contributor",
      description: "Active contributor to multiple open-source projects with 500+ GitHub stars",
      preview: "https://via.placeholder.com/200x200?text=Open+Source"
    }
  ],
  resume: {
    url: ""
  },
  contact: {
    email: "your.email@example.com",
    phone: "+1 (555) 123-4567",
    message: "Feel free to reach out for collaborations or just a friendly hello!"
  }
};

// Authentication State
let isAuthenticated = false;
const ADMIN_PASSWORD = "Kiran@#050304";

// Current Section in Admin Dashboard
let currentAdminSection = 'profile';

// Delete Item State
let deleteItemData = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  loadSavedData().then(() => {
    renderPortfolio();
    setupEventListeners();
  });
});

// Persistence helpers: try server first, fallback to localStorage
async function loadSavedData() {
  // Try fetching from backend
  try {
    const res = await fetch('http://localhost:8050/api/portfolio');
    if (res.ok) {
      const data = await res.json();
      if (data && Object.keys(data).length) {
        portfolioData = data;
        console.info('Loaded portfolio from server');
        return;
      }
    }
  } catch (err) {
    // server not available or network error
  }

  // Try localStorage
  try {
    const raw = localStorage.getItem('portfolioData');
    if (raw) {
      portfolioData = JSON.parse(raw);
      console.info('Loaded portfolio from localStorage');
      return;
    }
  } catch (err) {
    console.warn('Failed to load localStorage data', err);
  }

  // Use in-memory default (already set)
  console.info('Using default in-memory portfolio data');
}

async function persistData() {
  // Attempt to save to server first
  try {
    const res = await fetch('http://localhost:8050/api/portfolio', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(portfolioData)
    });

    if (res.ok) {
      // Also mirror to localStorage for offline resilience
      try { localStorage.setItem('portfolioData', JSON.stringify(portfolioData)); } catch (e) {}
      console.info('Saved portfolio to server');
      return;
    }
  } catch (err) {
    // server unavailable; fall through to localStorage
  }

  // Save to localStorage fallback
  try {
    localStorage.setItem('portfolioData', JSON.stringify(portfolioData));
    console.info('Saved portfolio to localStorage');
  } catch (err) {
    console.error('Failed to persist portfolio data', err);
  }
}

// Upload helpers: file upload to server (POST /api/upload). Returns URL or null.
async function uploadFile(file) {
  try {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('http://localhost:8050/api/upload', { method: 'POST', body: fd });
    if (res.ok) {
      const data = await res.json();
      return data.url || data.path || data.fileUrl || null;
    }
  } catch (e) {
    console.error('Upload failed', e);
  }
  return null;
}

// Trigger a file picker and upload image; when uploaded set the specified input field's value to the returned URL
function startUploadForField(fieldId) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;
    
    // Show loading state
    const el = document.getElementById(fieldId);
    if (el) {
      const originalValue = el.value;
      el.value = 'Uploading...';
      el.disabled = true;
      
      try {
        const url = await uploadFile(file);
        if (url) {
          el.value = url;
        } else {
          el.value = originalValue;
          alert('Upload failed');
        }
      } catch (err) {
        console.error('Upload error:', err);
        el.value = originalValue;
        alert('Upload failed: ' + err.message);
      } finally {
        el.disabled = false;
      }
    }
  };
  input.click();
}

// Set resume URL
function editResume() {
  const form = `
    <div class="form-group">
      <label>Resume URL</label>
      <input type="url" id="editResumeUrl" class="form-control" value="${portfolioData.resume?.url || ''}" required>
      <small class="form-text">Enter the URL to your resume (PDF, DOC, or DOCX file)</small>
    </div>
    <button type="submit" class="btn btn--primary btn--full-width">Save Resume URL</button>
  `;
  
  showEditModal('Edit Resume URL', form, async (e) => {
    e.preventDefault();
    const url = document.getElementById('editResumeUrl').value.trim();
    
    if (!url) {
      alert('Please enter a valid URL');
      return;
    }

    try {
      // Basic URL validation
      new URL(url);
      
      portfolioData.resume = portfolioData.resume || {};
      portfolioData.resume.url = url;
      await persistData();
      hideModal('editModal');
      renderProfile();
      renderAdminSection('profile');
    } catch (err) {
      alert('Please enter a valid URL');
    }
  });
}

// Setup Event Listeners
function setupEventListeners() {
  // Mobile Menu Toggle
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const navLinks = document.getElementById('navLinks');
  
  mobileMenuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });
  
  // Admin Icon Click
  document.getElementById('adminIcon').addEventListener('click', (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      showAdminDashboard();
    } else {
      showLoginModal();
    }
  });
  
  // Login Form
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  
  // Logout Button
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  
  // Modal Close Buttons
  document.getElementById('closeLogin').addEventListener('click', () => {
    hideModal('loginModal');
  });
  
  document.getElementById('closeEdit').addEventListener('click', () => {
    hideModal('editModal');
  });
  
  document.getElementById('closeDelete').addEventListener('click', () => {
    hideModal('deleteModal');
  });
  
  document.getElementById('cancelDelete').addEventListener('click', () => {
    hideModal('deleteModal');
  });
  
  document.getElementById('confirmDelete').addEventListener('click', confirmDelete);
  
  // Close modals on outside click
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      e.target.classList.remove('active');
    }
  });
}

// Render Portfolio Public View
function renderPortfolio() {
  renderProfile();
  renderAbout();
  renderEducation();
  renderSkills();
  renderExperience();
  renderProjects();
  renderCertifications();
  renderAchievements();
  renderContact();
}

function renderProfile() {
  document.getElementById('profileName').textContent = portfolioData.profile.name;
  document.getElementById('profileTitle').textContent = portfolioData.profile.title;
  document.getElementById('profileBio').textContent = portfolioData.profile.bio;
  
  document.getElementById('socialGitHub').href = portfolioData.profile.socialMedia.github;
  document.getElementById('socialLinkedIn').href = portfolioData.profile.socialMedia.linkedin;
  document.getElementById('socialTwitter').href = portfolioData.profile.socialMedia.twitter;
  document.getElementById('socialInstagram').href = portfolioData.profile.socialMedia.instagram;

  // Resume button in the nav (added dynamically)
  const resumeBtn = document.getElementById('resumeBtn');
  if (resumeBtn) {
    if (portfolioData.resume && portfolioData.resume.url) {
      resumeBtn.style.display = 'inline-flex';
      resumeBtn.href = portfolioData.resume.url;
    } else {
      resumeBtn.style.display = 'none';
      resumeBtn.href = '#';
    }
  }
}

function renderAbout() {
  document.getElementById('aboutContent').textContent = portfolioData.about.content;
}

function renderEducation() {
  const container = document.getElementById('educationList');
  container.innerHTML = '';
  
  portfolioData.education.forEach(edu => {
    const item = document.createElement('div');
    item.className = 'education-item';
    item.innerHTML = `
      <h3>${edu.university}</h3>
      <div class="education-meta">
        <span><i class="fas fa-calendar"></i> ${edu.year}</span>
        <span><i class="fas fa-star"></i> CGPA: ${edu.score}</span>
      </div>
    `;
    container.appendChild(item);
  });
}

function renderSkills() {
  const container = document.getElementById('skillsList');
  container.innerHTML = '';
  
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  ];
  
  portfolioData.skills.forEach((skill, index) => {
    const item = document.createElement('div');
    item.className = 'skill-item';
    item.innerHTML = `
      <div class="skill-header">
        <span class="skill-name">${skill.name}</span>
        <span class="skill-score">${skill.score}%</span>
      </div>
      <div class="skill-bar">
        <div class="skill-progress" style="width: ${skill.score}%; background: ${gradients[index % gradients.length]};"></div>
      </div>
    `;
    container.appendChild(item);
  });
}

function renderExperience() {
  const container = document.getElementById('experienceTimeline');
  container.innerHTML = '';
  
  portfolioData.experience.forEach(exp => {
    const item = document.createElement('div');
    item.className = 'experience-item';
    item.innerHTML = `
      <div class="experience-content">
        <h3>${exp.title}</h3>
        <p class="experience-company">${exp.company}</p>
        <p class="experience-duration">${exp.startDate} - ${exp.endDate}</p>
        <p class="experience-description">${exp.description}</p>
      </div>
    `;
    container.appendChild(item);
  });
}

function renderProjects() {
  const container = document.getElementById('projectsList');
  container.innerHTML = '';
  
  portfolioData.projects.forEach(project => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
      <img src="${project.preview}" alt="${project.title}" class="project-preview">
      <div class="project-content">
        <h3>${project.title}</h3>
        <p class="project-description">${project.description}</p>
        <div class="project-links">
          <a href="${project.link}" target="_blank" class="project-link">
            <i class="fas fa-external-link-alt"></i> Live Demo
          </a>
          <a href="${project.githubLink}" target="_blank" class="project-link">
            <i class="fab fa-github"></i> GitHub
          </a>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderCertifications() {
  const container = document.getElementById('certificationsList');
  container.innerHTML = '';
  
  portfolioData.certifications.forEach(cert => {
    const card = document.createElement('div');
    card.className = 'cert-card';
    card.innerHTML = `
      <img src="${cert.preview}" alt="${cert.title}" class="cert-preview">
      <div class="cert-content">
        <h3>${cert.title}</h3>
        <p class="cert-description">${cert.description}</p>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderAchievements() {
  const container = document.getElementById('achievementsList');
  container.innerHTML = '';
  
  portfolioData.achievements.forEach(achievement => {
    const card = document.createElement('div');
    card.className = 'achievement-card';
    card.innerHTML = `
      <img src="${achievement.preview}" alt="${achievement.title}" class="achievement-preview">
      <div class="achievement-content">
        <h3>${achievement.title}</h3>
        <p class="achievement-description">${achievement.description}</p>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderContact() {
  document.getElementById('contactEmail').textContent = portfolioData.contact.email;
  document.getElementById('contactPhone').textContent = portfolioData.contact.phone;
  document.getElementById('contactMessage').textContent = portfolioData.contact.message;
}

// Login Handling
function handleLogin(e) {
  e.preventDefault();
  const password = document.getElementById('adminPassword').value;
  const errorElement = document.getElementById('loginError');
  
  if (password === ADMIN_PASSWORD) {
    isAuthenticated = true;
    hideModal('loginModal');
    showAdminDashboard();
    document.getElementById('adminPassword').value = '';
    errorElement.textContent = '';
  } else {
    errorElement.textContent = 'Incorrect password. Please try again.';
  }
}

function handleLogout() {
  isAuthenticated = false;
  hideAdminDashboard();
}

function showLoginModal() {
  showModal('loginModal');
}

// Admin Dashboard
function showAdminDashboard() {
  document.getElementById('portfolioView').style.display = 'none';
  document.getElementById('adminView').style.display = 'block';
  renderAdminSection('profile');
  
  // Setup admin nav listeners
  document.querySelectorAll('.admin-nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = e.target.dataset.section;
      
      // Update active state
      document.querySelectorAll('.admin-nav-link').forEach(l => l.classList.remove('active'));
      e.target.classList.add('active');
      
      renderAdminSection(section);
    });
  });
}

function hideAdminDashboard() {
  document.getElementById('adminView').style.display = 'none';
  document.getElementById('portfolioView').style.display = 'block';
}

function renderAdminSection(section) {
  currentAdminSection = section;
  const content = document.getElementById('adminContent');
  
  switch(section) {
    case 'profile':
      renderAdminProfile(content);
      break;
    case 'about':
      renderAdminAbout(content);
      break;
    case 'education':
      renderAdminEducation(content);
      break;
    case 'skills':
      renderAdminSkills(content);
      break;
    case 'experience':
      renderAdminExperience(content);
      break;
    case 'projects':
      renderAdminProjects(content);
      break;
    case 'certifications':
      renderAdminCertifications(content);
      break;
    case 'achievements':
      renderAdminAchievements(content);
      break;
    case 'contact':
      renderAdminContact(content);
      break;
  }
}

function renderAdminProfile(container) {
  container.innerHTML = `
    <div class="admin-section">
      <div class="admin-section-header">
        <h2>Profile Settings</h2>
      </div>
      <div class="admin-items">
        <div class="admin-item">
          <div class="admin-item-content">
            <h3>Basic Information</h3>
            <p>Name: ${portfolioData.profile.name}</p>
            <p>Title: ${portfolioData.profile.title}</p>
            <p>Bio: ${portfolioData.profile.bio}</p>
          </div>
          <div class="admin-item-actions">
            <button class="icon-btn" onclick="editProfile()">
              <i class="fas fa-edit"></i>
            </button>
          </div>
        </div>
        <div class="admin-item">
          <div class="admin-item-content">
            <h3>Social Media Links</h3>
            <p>GitHub: ${portfolioData.profile.socialMedia.github}</p>
            <p>LinkedIn: ${portfolioData.profile.socialMedia.linkedin}</p>
            <p>Twitter: ${portfolioData.profile.socialMedia.twitter}</p>
            <p>Instagram: ${portfolioData.profile.socialMedia.instagram}</p>
          </div>
          <div class="admin-item-actions">
            <button class="icon-btn" onclick="editSocialMedia()">
              <i class="fas fa-edit"></i>
            </button>
          </div>
        </div>
        <div class="admin-item">
          <div class="admin-item-content">
            <h3>Resume</h3>
            <p id="adminResumeDisplay">
              ${portfolioData.resume && portfolioData.resume.url 
                ? `<a href='${portfolioData.resume.url}' target='_blank'>View Resume</a>`
                : 'No resume URL set'
              }
            </p>
            <small class="form-text">Enter URL to your resume file (PDF, DOC, or DOCX)</small>
          </div>
          <div class="admin-item-actions">
            <button class="icon-btn" onclick="editResume()" title="Set Resume URL">
              <i class="fas fa-edit"></i>
            </button>
            <button class="icon-btn" onclick="(function(){
              if (confirm('Are you sure you want to remove the current resume?')) {
                portfolioData.resume = { url: '' };
                persistData();
                renderAdminSection('profile');
                renderProfile();
              }
            })()" title="Remove Resume">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderAdminAbout(container) {
  container.innerHTML = `
    <div class="admin-section">
      <div class="admin-section-header">
        <h2>About Section</h2>
      </div>
      <div class="admin-items">
        <div class="admin-item">
          <div class="admin-item-content">
            <h3>About Content</h3>
            <p>${portfolioData.about.content}</p>
          </div>
          <div class="admin-item-actions">
            <button class="icon-btn" onclick="editAbout()">
              <i class="fas fa-edit"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderAdminEducation(container) {
  let html = `
    <div class="admin-section">
      <div class="admin-section-header">
        <h2>Education</h2>
        <button class="btn btn--primary" onclick="addEducation()">Add Education</button>
      </div>
      <div class="admin-items">
  `;
  
  portfolioData.education.forEach(edu => {
    html += `
      <div class="admin-item">
        <div class="admin-item-content">
          <h3>${edu.university}</h3>
          <p>Year: ${edu.year} | Score: ${edu.score}</p>
        </div>
        <div class="admin-item-actions">
          <button class="icon-btn" onclick='editEducation(${JSON.stringify(edu)})'>
            <i class="fas fa-edit"></i>
          </button>
          <button class="icon-btn" onclick="deleteItem('education', ${edu.id})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  });
  
  html += `</div></div>`;
  container.innerHTML = html;
}

function renderAdminSkills(container) {
  let html = `
    <div class="admin-section">
      <div class="admin-section-header">
        <h2>Skills</h2>
        <button class="btn btn--primary" onclick="addSkill()">Add Skill</button>
      </div>
      <div class="admin-items">
  `;
  
  portfolioData.skills.forEach(skill => {
    html += `
      <div class="admin-item">
        <div class="admin-item-content">
          <h3>${skill.name}</h3>
          <p>Proficiency: ${skill.score}%</p>
        </div>
        <div class="admin-item-actions">
          <button class="icon-btn" onclick='editSkill(${JSON.stringify(skill)})'>
            <i class="fas fa-edit"></i>
          </button>
          <button class="icon-btn" onclick="deleteItem('skills', ${skill.id})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  });
  
  html += `</div></div>`;
  container.innerHTML = html;
}

function renderAdminExperience(container) {
  let html = `
    <div class="admin-section">
      <div class="admin-section-header">
        <h2>Experience</h2>
        <button class="btn btn--primary" onclick="addExperience()">Add Experience</button>
      </div>
      <div class="admin-items">
  `;
  
  portfolioData.experience.forEach(exp => {
    html += `
      <div class="admin-item">
        <div class="admin-item-content">
          <h3>${exp.title}</h3>
          <p>${exp.company} | ${exp.startDate} - ${exp.endDate}</p>
        </div>
        <div class="admin-item-actions">
          <button class="icon-btn" onclick='editExperience(${JSON.stringify(exp)})'>
            <i class="fas fa-edit"></i>
          </button>
          <button class="icon-btn" onclick="deleteItem('experience', ${exp.id})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  });
  
  html += `</div></div>`;
  container.innerHTML = html;
}

function renderAdminProjects(container) {
  let html = `
    <div class="admin-section">
      <div class="admin-section-header">
        <h2>Projects</h2>
        <button class="btn btn--primary" onclick="addProject()">Add Project</button>
      </div>
      <div class="admin-items">
  `;
  
  portfolioData.projects.forEach(project => {
    html += `
      <div class="admin-item">
        <div class="admin-item-content">
          <h3>${project.title}</h3>
          <p>${project.description}</p>
        </div>
        <div class="admin-item-actions">
          <button class="icon-btn" onclick='editProject(${JSON.stringify(project)})'>
            <i class="fas fa-edit"></i>
          </button>
          <button class="icon-btn" onclick="deleteItem('projects', ${project.id})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  });
  
  html += `</div></div>`;
  container.innerHTML = html;
}

function renderAdminCertifications(container) {
  let html = `
    <div class="admin-section">
      <div class="admin-section-header">
        <h2>Certifications</h2>
        <button class="btn btn--primary" onclick="addCertification()">Add Certification</button>
      </div>
      <div class="admin-items">
  `;
  
  portfolioData.certifications.forEach(cert => {
    html += `
      <div class="admin-item">
        <div class="admin-item-content">
          <h3>${cert.title}</h3>
          <p>${cert.description}</p>
        </div>
        <div class="admin-item-actions">
          <button class="icon-btn" onclick='editCertification(${JSON.stringify(cert)})'>
            <i class="fas fa-edit"></i>
          </button>
          <button class="icon-btn" onclick="deleteItem('certifications', ${cert.id})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  });
  
  html += `</div></div>`;
  container.innerHTML = html;
}

function renderAdminAchievements(container) {
  let html = `
    <div class="admin-section">
      <div class="admin-section-header">
        <h2>Achievements</h2>
        <button class="btn btn--primary" onclick="addAchievement()">Add Achievement</button>
      </div>
      <div class="admin-items">
  `;
  
  portfolioData.achievements.forEach(achievement => {
    html += `
      <div class="admin-item">
        <div class="admin-item-content">
          <h3>${achievement.title}</h3>
          <p>${achievement.description}</p>
        </div>
        <div class="admin-item-actions">
          <button class="icon-btn" onclick='editAchievement(${JSON.stringify(achievement)})'>
            <i class="fas fa-edit"></i>
          </button>
          <button class="icon-btn" onclick="deleteItem('achievements', ${achievement.id})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  });
  
  html += `</div></div>`;
  container.innerHTML = html;
}

function renderAdminContact(container) {
  container.innerHTML = `
    <div class="admin-section">
      <div class="admin-section-header">
        <h2>Contact Information</h2>
      </div>
      <div class="admin-items">
        <div class="admin-item">
          <div class="admin-item-content">
            <h3>Contact Details</h3>
            <p>Email: ${portfolioData.contact.email}</p>
            <p>Phone: ${portfolioData.contact.phone}</p>
            <p>Message: ${portfolioData.contact.message}</p>
          </div>
          <div class="admin-item-actions">
            <button class="icon-btn" onclick="editContact()">
              <i class="fas fa-edit"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Edit Functions
function editProfile() {
  const form = `
    <div class="form-group">
      <label>Name</label>
      <input type="text" id="editName" class="form-control" value="${portfolioData.profile.name}" required>
    </div>
    <div class="form-group">
      <label>Title</label>
      <input type="text" id="editTitle" class="form-control" value="${portfolioData.profile.title}" required>
    </div>
    <div class="form-group">
      <label>Bio</label>
      <textarea id="editBio" class="form-control" required>${portfolioData.profile.bio}</textarea>
    </div>
    <button type="submit" class="btn btn--primary btn--full-width">Save Changes</button>
  `;
  
  showEditModal('Edit Profile', form, (e) => {
    e.preventDefault();
    portfolioData.profile.name = document.getElementById('editName').value;
    portfolioData.profile.title = document.getElementById('editTitle').value;
    portfolioData.profile.bio = document.getElementById('editBio').value;
    hideModal('editModal');
    persistData();
    renderPortfolio();
    renderAdminSection('profile');
  });
}

function editSocialMedia() {
  const form = `
    <div class="form-group">
      <label>GitHub URL</label>
      <input type="url" id="editGithub" class="form-control" value="${portfolioData.profile.socialMedia.github}" required>
    </div>
    <div class="form-group">
      <label>LinkedIn URL</label>
      <input type="url" id="editLinkedin" class="form-control" value="${portfolioData.profile.socialMedia.linkedin}" required>
    </div>
    <div class="form-group">
      <label>Twitter URL</label>
      <input type="url" id="editTwitter" class="form-control" value="${portfolioData.profile.socialMedia.twitter}" required>
    </div>
    <div class="form-group">
      <label>Instagram URL</label>
      <input type="url" id="editInstagram" class="form-control" value="${portfolioData.profile.socialMedia.instagram}" required>
    </div>
    <button type="submit" class="btn btn--primary btn--full-width">Save Changes</button>
  `;
  
  showEditModal('Edit Social Media', form, (e) => {
    e.preventDefault();
    portfolioData.profile.socialMedia.github = document.getElementById('editGithub').value;
    portfolioData.profile.socialMedia.linkedin = document.getElementById('editLinkedin').value;
    portfolioData.profile.socialMedia.twitter = document.getElementById('editTwitter').value;
    portfolioData.profile.socialMedia.instagram = document.getElementById('editInstagram').value;
    hideModal('editModal');
    persistData();
    renderPortfolio();
    renderAdminSection('profile');
  });
}

function editAbout() {
  const form = `
    <div class="form-group">
      <label>About Content</label>
      <textarea id="editAboutContent" class="form-control" rows="8" required>${portfolioData.about.content}</textarea>
    </div>
    <button type="submit" class="btn btn--primary btn--full-width">Save Changes</button>
  `;
  
  showEditModal('Edit About', form, (e) => {
    e.preventDefault();
    portfolioData.about.content = document.getElementById('editAboutContent').value;
    hideModal('editModal');
    persistData();
    renderPortfolio();
    renderAdminSection('about');
  });
}

function addEducation() {
  const form = `
    <div class="form-group">
      <label>University Name</label>
      <input type="text" id="editUniversity" class="form-control" required>
    </div>
    <div class="form-group">
      <label>Passed Year</label>
      <input type="number" id="editYear" class="form-control" min="1900" max="2100" required>
    </div>
    <div class="form-group">
      <label>Score/GPA</label>
      <input type="number" id="editScore" class="form-control" step="0.1" min="0" max="10" required>
    </div>
    <button type="submit" class="btn btn--primary btn--full-width">Add Education</button>
  `;
  
  showEditModal('Add Education', form, (e) => {
    e.preventDefault();
    const newId = Math.max(...portfolioData.education.map(e => e.id), 0) + 1;
    portfolioData.education.push({
      id: newId,
      university: document.getElementById('editUniversity').value,
      year: parseInt(document.getElementById('editYear').value),
      score: parseFloat(document.getElementById('editScore').value)
    });
    hideModal('editModal');
    persistData();
    renderPortfolio();
    renderAdminSection('education');
  });
}

function editEducation(edu) {
  const form = `
    <div class="form-group">
      <label>University Name</label>
      <input type="text" id="editUniversity" class="form-control" value="${edu.university}" required>
    </div>
    <div class="form-group">
      <label>Passed Year</label>
      <input type="number" id="editYear" class="form-control" value="${edu.year}" min="1900" max="2100" required>
    </div>
    <div class="form-group">
      <label>Score/GPA</label>
      <input type="number" id="editScore" class="form-control" value="${edu.score}" step="0.1" min="0" max="100" required>
    </div>
    <button type="submit" class="btn btn--primary btn--full-width">Save Changes</button>
  `;
  
  showEditModal('Edit Education', form, (e) => {
    e.preventDefault();
    const index = portfolioData.education.findIndex(e => e.id === edu.id);
    portfolioData.education[index] = {
      id: edu.id,
      university: document.getElementById('editUniversity').value,
      year: parseInt(document.getElementById('editYear').value),
      score: parseFloat(document.getElementById('editScore').value)
    };
    hideModal('editModal');
    persistData();
    renderPortfolio();
    renderAdminSection('education');
  });
}

function addSkill() {
  const form = `
    <div class="form-group">
      <label>Skill Name</label>
      <input type="text" id="editSkillName" class="form-control" required>
    </div>
    <div class="form-group">
      <label>Proficiency Score (0-100)</label>
      <input type="number" id="editSkillScore" class="form-control" min="0" max="100" required>
    </div>
    <button type="submit" class="btn btn--primary btn--full-width">Add Skill</button>
  `;
  
  showEditModal('Add Skill', form, (e) => {
    e.preventDefault();
    const newId = Math.max(...portfolioData.skills.map(s => s.id), 0) + 1;
    portfolioData.skills.push({
      id: newId,
      name: document.getElementById('editSkillName').value,
      score: parseInt(document.getElementById('editSkillScore').value)
    });
    hideModal('editModal');
    persistData();
    renderPortfolio();
    renderAdminSection('skills');
  });
}

function editSkill(skill) {
  const form = `
    <div class="form-group">
      <label>Skill Name</label>
      <input type="text" id="editSkillName" class="form-control" value="${skill.name}" required>
    </div>
    <div class="form-group">
      <label>Proficiency Score (0-100)</label>
      <input type="number" id="editSkillScore" class="form-control" value="${skill.score}" min="0" max="100" required>
    </div>
    <button type="submit" class="btn btn--primary btn--full-width">Save Changes</button>
  `;
  
  showEditModal('Edit Skill', form, (e) => {
    e.preventDefault();
    const index = portfolioData.skills.findIndex(s => s.id === skill.id);
    portfolioData.skills[index] = {
      id: skill.id,
      name: document.getElementById('editSkillName').value,
      score: parseInt(document.getElementById('editSkillScore').value)
    };
    hideModal('editModal');
    persistData();
    renderPortfolio();
    renderAdminSection('skills');
  });
}

function addExperience() {
  const form = `
    <div class="form-group">
      <label>Job Title</label>
      <input type="text" id="editExpTitle" class="form-control" required>
    </div>
    <div class="form-group">
      <label>Company</label>
      <input type="text" id="editExpCompany" class="form-control" required>
    </div>
    <div class="form-group">
      <label>Start Date (YYYY-MM)</label>
      <input type="text" id="editExpStart" class="form-control" placeholder="2023-01" required>
    </div>
    <div class="form-group">
      <label>End Date (YYYY-MM or Present)</label>
      <input type="text" id="editExpEnd" class="form-control" placeholder="Present" required>
    </div>
    <div class="form-group">
      <label>Description</label>
      <textarea id="editExpDesc" class="form-control" required></textarea>
    </div>
    <button type="submit" class="btn btn--primary btn--full-width">Add Experience</button>
  `;
  
  showEditModal('Add Experience', form, (e) => {
    e.preventDefault();
    const newId = Math.max(...portfolioData.experience.map(e => e.id), 0) + 1;
    portfolioData.experience.push({
      id: newId,
      title: document.getElementById('editExpTitle').value,
      company: document.getElementById('editExpCompany').value,
      startDate: document.getElementById('editExpStart').value,
      endDate: document.getElementById('editExpEnd').value,
      description: document.getElementById('editExpDesc').value
    });
    hideModal('editModal');
    persistData();
    renderPortfolio();
    renderAdminSection('experience');
  });
}

function editExperience(exp) {
  const form = `
    <div class="form-group">
      <label>Job Title</label>
      <input type="text" id="editExpTitle" class="form-control" value="${exp.title}" required>
    </div>
    <div class="form-group">
      <label>Company</label>
      <input type="text" id="editExpCompany" class="form-control" value="${exp.company}" required>
    </div>
    <div class="form-group">
      <label>Start Date (YYYY-MM)</label>
      <input type="text" id="editExpStart" class="form-control" value="${exp.startDate}" required>
    </div>
    <div class="form-group">
      <label>End Date (YYYY-MM or Present)</label>
      <input type="text" id="editExpEnd" class="form-control" value="${exp.endDate}" required>
    </div>
    <div class="form-group">
      <label>Description</label>
      <textarea id="editExpDesc" class="form-control" required>${exp.description}</textarea>
    </div>
    <button type="submit" class="btn btn--primary btn--full-width">Save Changes</button>
  `;
  
  showEditModal('Edit Experience', form, (e) => {
    e.preventDefault();
    const index = portfolioData.experience.findIndex(e => e.id === exp.id);
    portfolioData.experience[index] = {
      id: exp.id,
      title: document.getElementById('editExpTitle').value,
      company: document.getElementById('editExpCompany').value,
      startDate: document.getElementById('editExpStart').value,
      endDate: document.getElementById('editExpEnd').value,
      description: document.getElementById('editExpDesc').value
    };
    hideModal('editModal');
    persistData();
    renderPortfolio();
    renderAdminSection('experience');
  });
}

function addProject() {
  const form = `
    <div class="form-group">
      <label>Project Title</label>
      <input type="text" id="editProjectTitle" class="form-control" required>
    </div>
    <div class="form-group">
      <label>Description</label>
      <textarea id="editProjectDesc" class="form-control" required></textarea>
    </div>
    <div class="form-group">
      <label>Project Preview Image</label>
      <div style="display:flex;gap:8px;align-items:center;">
        <input type="text" id="editProjectPreview" class="form-control" required readonly>
        <button type="button" class="btn btn--outline" onclick="startUploadForField('editProjectPreview')">Choose Image</button>
      </div>
      <small class="form-text">Select an image file to upload (JPG, PNG, or GIF)</small>
    </div>
    <div class="form-group">
      <label>Live Demo Link</label>
      <input type="url" id="editProjectLink" class="form-control" required>
    </div>
    <div class="form-group">
      <label>GitHub Link</label>
      <input type="url" id="editProjectGithub" class="form-control" required>
    </div>
    <button type="submit" class="btn btn--primary btn--full-width">Add Project</button>
  `;
  
  showEditModal('Add Project', form, (e) => {
    e.preventDefault();
    const newId = Math.max(...portfolioData.projects.map(p => p.id), 0) + 1;
    portfolioData.projects.push({
      id: newId,
      title: document.getElementById('editProjectTitle').value,
      description: document.getElementById('editProjectDesc').value,
      preview: document.getElementById('editProjectPreview').value,
      link: document.getElementById('editProjectLink').value,
      githubLink: document.getElementById('editProjectGithub').value
    });
    hideModal('editModal');
    persistData();
    renderPortfolio();
    renderAdminSection('projects');
  });
}

function editProject(project) {
  const form = `
    <div class="form-group">
      <label>Project Title</label>
      <input type="text" id="editProjectTitle" class="form-control" value="${project.title}" required>
    </div>
    <div class="form-group">
      <label>Description</label>
      <textarea id="editProjectDesc" class="form-control" required>${project.description}</textarea>
    </div>
    <div class="form-group">
      <label>Preview Image URL</label>
      <div style="display:flex;gap:8px;align-items:center;">
        <input type="url" id="editProjectPreview" class="form-control" value="${project.preview}" required>
        <button type="button" class="btn btn--outline" onclick="startUploadForField('editProjectPreview')">Upload</button>
      </div>
    </div>
    <div class="form-group">
      <label>Live Demo Link</label>
      <input type="url" id="editProjectLink" class="form-control" value="${project.link}" required>
    </div>
    <div class="form-group">
      <label>GitHub Link</label>
      <input type="url" id="editProjectGithub" class="form-control" value="${project.githubLink}" required>
    </div>
    <button type="submit" class="btn btn--primary btn--full-width">Save Changes</button>
  `;
  
  showEditModal('Edit Project', form, (e) => {
    e.preventDefault();
    const index = portfolioData.projects.findIndex(p => p.id === project.id);
    portfolioData.projects[index] = {
      id: project.id,
      title: document.getElementById('editProjectTitle').value,
      description: document.getElementById('editProjectDesc').value,
      preview: document.getElementById('editProjectPreview').value,
      link: document.getElementById('editProjectLink').value,
      githubLink: document.getElementById('editProjectGithub').value
    };
    hideModal('editModal');
    persistData();
    renderPortfolio();
    renderAdminSection('projects');
  });
}

function addCertification() {
  const form = `
    <div class="form-group">
      <label>Certification Title</label>
      <input type="text" id="editCertTitle" class="form-control" required>
    </div>
    <div class="form-group">
      <label>Description</label>
      <textarea id="editCertDesc" class="form-control" required></textarea>
    </div>
    <div class="form-group">
      <label>Certificate Preview Image</label>
      <div style="display:flex;gap:8px;align-items:center;">
        <input type="text" id="editCertPreview" class="form-control" required readonly>
        <button type="button" class="btn btn--outline" onclick="startUploadForField('editCertPreview')">Choose Image</button>
      </div>
      <small class="form-text">Select an image file to upload (JPG, PNG, or GIF)</small>
    </div>
    <button type="submit" class="btn btn--primary btn--full-width">Add Certification</button>
  `;
  
  showEditModal('Add Certification', form, (e) => {
    e.preventDefault();
    const newId = Math.max(...portfolioData.certifications.map(c => c.id), 0) + 1;
    portfolioData.certifications.push({
      id: newId,
      title: document.getElementById('editCertTitle').value,
      description: document.getElementById('editCertDesc').value,
      preview: document.getElementById('editCertPreview').value
    });
    hideModal('editModal');
    persistData();
    renderPortfolio();
    renderAdminSection('certifications');
  });
}

function editCertification(cert) {
  const form = `
    <div class="form-group">
      <label>Certification Title</label>
      <input type="text" id="editCertTitle" class="form-control" value="${cert.title}" required>
    </div>
    <div class="form-group">
      <label>Description</label>
      <textarea id="editCertDesc" class="form-control" required>${cert.description}</textarea>
    </div>
    <div class="form-group">
      <label>Preview Image URL</label>
      <div style="display:flex;gap:8px;align-items:center;">
        <input type="url" id="editCertPreview" class="form-control" value="${cert.preview}" required>
        <button type="button" class="btn btn--outline" onclick="startUploadForField('editCertPreview')">Upload</button>
      </div>
    </div>
    <button type="submit" class="btn btn--primary btn--full-width">Save Changes</button>
  `;
  
  showEditModal('Edit Certification', form, (e) => {
    e.preventDefault();
    const index = portfolioData.certifications.findIndex(c => c.id === cert.id);
    portfolioData.certifications[index] = {
      id: cert.id,
      title: document.getElementById('editCertTitle').value,
      description: document.getElementById('editCertDesc').value,
      preview: document.getElementById('editCertPreview').value
    };
    hideModal('editModal');
    persistData();
    renderPortfolio();
    renderAdminSection('certifications');
  });
}

function addAchievement() {
  const form = `
    <div class="form-group">
      <label>Achievement Title</label>
      <input type="text" id="editAchievementTitle" class="form-control" required>
    </div>
    <div class="form-group">
      <label>Description</label>
      <textarea id="editAchievementDesc" class="form-control" required></textarea>
    </div>
    <div class="form-group">
      <label>Achievement Preview Image</label>
      <div style="display:flex;gap:8px;align-items:center;">
        <input type="text" id="editAchievementPreview" class="form-control" required readonly>
        <button type="button" class="btn btn--outline" onclick="startUploadForField('editAchievementPreview')">Choose Image</button>
      </div>
      <small class="form-text">Select an image file to upload (JPG, PNG, or GIF)</small>
    </div>
    <button type="submit" class="btn btn--primary btn--full-width">Add Achievement</button>
  `;
  
  showEditModal('Add Achievement', form, (e) => {
    e.preventDefault();
    const newId = Math.max(...portfolioData.achievements.map(a => a.id), 0) + 1;
    portfolioData.achievements.push({
      id: newId,
      title: document.getElementById('editAchievementTitle').value,
      description: document.getElementById('editAchievementDesc').value,
      preview: document.getElementById('editAchievementPreview').value
    });
    hideModal('editModal');
    persistData();
    renderPortfolio();
    renderAdminSection('achievements');
  });
}

function editAchievement(achievement) {
  const form = `
    <div class="form-group">
      <label>Achievement Title</label>
      <input type="text" id="editAchievementTitle" class="form-control" value="${achievement.title}" required>
    </div>
    <div class="form-group">
      <label>Description</label>
      <textarea id="editAchievementDesc" class="form-control" required>${achievement.description}</textarea>
    </div>
    <div class="form-group">
      <label>Preview Image URL</label>
      <div style="display:flex;gap:8px;align-items:center;">
        <input type="url" id="editAchievementPreview" class="form-control" value="${achievement.preview}" required>
        <button type="button" class="btn btn--outline" onclick="startUploadForField('editAchievementPreview')">Upload</button>
      </div>
    </div>
    <button type="submit" class="btn btn--primary btn--full-width">Save Changes</button>
  `;
  
  showEditModal('Edit Achievement', form, (e) => {
    e.preventDefault();
    const index = portfolioData.achievements.findIndex(a => a.id === achievement.id);
    portfolioData.achievements[index] = {
      id: achievement.id,
      title: document.getElementById('editAchievementTitle').value,
      description: document.getElementById('editAchievementDesc').value,
      preview: document.getElementById('editAchievementPreview').value
    };
    hideModal('editModal');
    persistData();
    renderPortfolio();
    renderAdminSection('achievements');
  });
}

function editContact() {
  const form = `
    <div class="form-group">
      <label>Email</label>
      <input type="email" id="editContactEmail" class="form-control" value="${portfolioData.contact.email}" required>
    </div>
    <div class="form-group">
      <label>Phone</label>
      <input type="tel" id="editContactPhone" class="form-control" value="${portfolioData.contact.phone}" required>
    </div>
    <div class="form-group">
      <label>Contact Message</label>
      <textarea id="editContactMessage" class="form-control" required>${portfolioData.contact.message}</textarea>
    </div>
    <button type="submit" class="btn btn--primary btn--full-width">Save Changes</button>
  `;
  
  showEditModal('Edit Contact', form, (e) => {
    e.preventDefault();
    portfolioData.contact.email = document.getElementById('editContactEmail').value;
    portfolioData.contact.phone = document.getElementById('editContactPhone').value;
    portfolioData.contact.message = document.getElementById('editContactMessage').value;
    hideModal('editModal');
    persistData();
    renderPortfolio();
    renderAdminSection('contact');
  });
}

// Delete Functions
function deleteItem(section, id) {
  deleteItemData = { section, id };
  showModal('deleteModal');
}

function confirmDelete() {
  if (!deleteItemData) return;
  
  const { section, id } = deleteItemData;
  
  if (Array.isArray(portfolioData[section])) {
    portfolioData[section] = portfolioData[section].filter(item => item.id !== id);
  }
  
  hideModal('deleteModal');
  persistData();
  renderPortfolio();
  renderAdminSection(currentAdminSection);
  deleteItemData = null;
}

// Modal Helper Functions
function showModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

function hideModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

function showEditModal(title, formContent, onSubmit) {
  document.getElementById('editModalTitle').textContent = title;
  const form = document.getElementById('editForm');
  form.innerHTML = formContent;
  form.onsubmit = onSubmit;
  showModal('editModal');
}
