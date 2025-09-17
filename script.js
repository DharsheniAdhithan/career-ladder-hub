const apiBase = "http://127.0.0.1:5000";

// ----------- Register -----------
function registerUser() {
    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value.trim();
    if (!username || !email || !password) {
        alert("All fields required");
        return;
    }

    fetch(`${apiBase}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        if (data.message.includes("successful")) window.location.href = "login.html";
    });
}

// ----------- Post Job (Admin) -----------
function postJob() {
    const title = document.getElementById('job-title').value.trim();
    const desc = document.getElementById('job-desc').value.trim();
    const loc = document.getElementById('job-loc').value.trim();

    if (!title || !desc || !loc) {
        alert('All fields are required!');
        return;
    }

    fetch(`${apiBase}/post-job`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: title,
            description: desc,
            location: loc,
            posted_by: 'admin'
        })
    })
    .then(res => res.json().then(data => ({ status: res.status, body: data })))
    .then(({ status, body }) => {
        alert(body.message);
        if (status === 201) {
            document.getElementById('job-title').value = '';
            document.getElementById('job-desc').value = '';
            document.getElementById('job-loc').value = '';
        }
    })
    .catch(err => {
        console.error('Error:', err);
        alert('An error occurred while posting the job.');
    });
}

// ----------- User Login -----------
function loginUser() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    if (!email || !password) {
        alert("All fields required");
        return;
    }

    fetch(`${apiBase}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json().then(data => ({ status: res.status, body: data })))
    .then(({ status, body }) => {
        alert(body.message);
        if (status === 200) {
            localStorage.setItem('userEmail', email);
            if (body.message.includes("Admin")) window.location.href = "admin.html";
            else window.location.href = "jobs.html";
        }
    });
}

// ----------- Admin Login (Separate Page) -----------
function adminLogin() {
    const username = document.getElementById('admin-username').value.trim();
    const password = document.getElementById('admin-password').value.trim();

    if (!username || !password) {
        alert("All fields required");
        return;
    }

    fetch(`${apiBase}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password })
    })
    .then(res => res.json().then(data => ({ status: res.status, body: data })))
    .then(({ status, body }) => {
        alert(body.message);
        if (status === 200 && body.message.includes("Admin")) {
            localStorage.setItem('adminEmail', username);
            window.location.href = "admin.html";
        } else {
            alert("Invalid admin credentials");
        }
    });
}

// ----------- Get All Jobs -----------
function getJobs() {
    fetch(`${apiBase}/jobs`)
    .then(res => res.json())
    .then(data => {
        const jobsContainer = document.getElementById('job-list');  // Correct ID
        jobsContainer.innerHTML = '';

        if (data.length === 0) {
            jobsContainer.innerHTML = '<p>No jobs available</p>';
        } else {
            data.forEach(job => {
                const jobDiv = document.createElement('div');
                jobDiv.classList.add('job-item');
                jobDiv.innerHTML = `
                    <h3>${job.title}</h3>
                    <p><strong>Location:</strong> ${job.location}</p>
                    <p>${job.description}</p>
                `;
                jobsContainer.appendChild(jobDiv);
            });
        }
    })
    .catch(err => {
        console.error('Error fetching jobs:', err);
        alert('Failed to load jobs.');
    });
}

// ----------- View Applicants (Admin) -----------
function viewApplicants() {
    const jobId = document.getElementById('job-id').value.trim(); // input field for Job ID
    const tableBody = document.getElementById('applicantsTableBody');
    tableBody.innerHTML = ""; // clear old rows

    if (!jobId) {
        alert("Please enter a Job ID");
        return;
    }

    fetch(`${apiBase}/admin/applicants/${jobId}`)
        .then(res => res.json())
        .then(data => {
            if (data.length === 0) {
                tableBody.innerHTML = "<tr><td colspan='3'>No applicants found</td></tr>";
                return;
            }

            data.forEach(app => {
                const row = `
                    <tr>
                        <td>${app.job_title}</td>
                        <td>${app.username}</td>
                        <td>${app.user_email}</td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        })
        .catch(err => {
            console.error("Error fetching applicants:", err);
            tableBody.innerHTML = "<tr><td colspan='3'>Error loading applicants</td></tr>";
        });
}
// ----------- Get All Jobs -----------
function getJobs() {
    fetch(`${apiBase}/jobs`)
        .then(res => res.json())
        .then(data => {
            const jobsContainer = document.getElementById('job-list');
            jobsContainer.innerHTML = '';

            if (data.length === 0) {
                jobsContainer.innerHTML = '<p>No jobs available</p>';
            } else {
                data.forEach(job => {
                    const jobDiv = document.createElement('div');
                    jobDiv.classList.add('job-item');

                    jobDiv.innerHTML = `
                        <h3>${job.title}</h3>
                        <p><strong>Location:</strong> ${job.location}</p>
                        <p>${job.description}</p>
                        <button onclick="applyJob(${job.id}, this)">Apply</button>
                    `;

                    jobsContainer.appendChild(jobDiv);
                });
            }
        })
        .catch(err => {
            console.error('Error fetching jobs:', err);
            alert('Failed to load jobs.');
        });
}
// ----------- Apply Job -----------
function applyJob(jobId, button) {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
        alert("You must log in to apply for a job.");
        return;
    }

    fetch(`${apiBase}/apply/${jobId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_email: userEmail })
    })
    .then(res => res.json().then(data => ({ status: res.status, body: data })))
    .then(({ status, body }) => {
        alert(body.message);
        if (status === 200) {
            button.textContent = "Applied ✅";
            button.disabled = true;
        }
    })
    .catch(err => {
        console.error("Error applying job:", err);
        alert("Error applying for the job.");
    });
}
// ----------- Get All Jobs -----------
function getJobs() {
    fetch(`${apiBase}/jobs`)
        .then(res => res.json())
        .then(data => {
            const jobsContainer = document.getElementById('job-list');
            jobsContainer.innerHTML = '';

            if (data.length === 0) {
                jobsContainer.innerHTML = '<p>No jobs available</p>';
            } else {
                data.forEach(job => {
                    const jobDiv = document.createElement('div');
                    jobDiv.classList.add('job-item');

                    jobDiv.innerHTML = `
                        <h3>${job.title}</h3>
                        <p><strong>Location:</strong> ${job.location}</p>
                        <p>
                            ${
                                job.description.startsWith("http")
                                    ? `<a href="${job.description}" target="_blank">Job Description</a>`
                                    : job.description
                            }
                        </p>
                        <button onclick="applyJob(${job.id}, this)">Apply</button>
                    `;

                    jobsContainer.appendChild(jobDiv);
                });
            }
        })
        .catch(err => {
            console.error('Error fetching jobs:', err);
            alert('Failed to load jobs.');
        });
}

// ----------- Apply Job -----------
function applyJob(jobId, button) {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
        alert("You must log in to apply for a job.");
        return;
    }

    fetch(`${apiBase}/apply/${jobId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_email: userEmail })
    })
    .then(res => res.json().then(data => ({ status: res.status, body: data })))
    .then(({ status, body }) => {
        alert(body.message);
        if (status === 200) {
            button.textContent = "Applied ✅";
            button.disabled = true;
        }
    })
    .catch(err => {
        console.error("Error applying job:", err);
        alert("Error applying for the job.");
    });
}


// ----------- Mobile Navbar Toggle (for hamburger menu) -----------
function toggleMenu() {
    const navLinks = document.getElementById("navLinks");
    if (navLinks) {
        navLinks.classList.toggle("show");
    }
}

// ----------- Logout Function (works on all devices) -----------
function logout() {
    localStorage.clear();
    alert("You have been logged out!");
    window.location.href = "login.html";
}
