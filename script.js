
/* =====================================
   CODINGCLUB - MAIN JAVASCRIPT
===================================== */

// GET HTML ELEMENTS

const app = document.getElementById("app");
const userArea = document.getElementById("user-area");
const toast = document.getElementById("toast");


// DATABASE USING LOCAL STORAGE

let data;

try {
    data = JSON.parse(localStorage.getItem("codingclub")) || null;
} catch (error) {
    data = null;
}

if (!data || !Array.isArray(data.students) ||
    !Array.isArray(data.problems) ||
    !Array.isArray(data.submissions)) {

    data = {
        students: [
            { name: "Bhavana", usn: "1AB22CS001" },
            { name: "Yash", usn: "1AB22CS002" }
        ],

        problems: [
            {
                id: 1,
                title: "Addition of Two Numbers",
                difficulty: "Easy",
                statement: "Write a program to add two numbers.",
                input: "5 10",
                output: "15"
            }
        ],

        submissions: []
    };
}

let currentUser = null;
let currentPage = "home";
let selectedProblem = null;


// SAVE DATA

function saveData() {
    localStorage.setItem("codingclub", JSON.stringify(data));
}


// SAFE HTML TEXT

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}


// NOTIFICATION

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}


// PAGE RENDERING

function render() {

    userArea.innerHTML = currentUser
        ? `
            <span>${escapeHTML(currentUser.name)}</span>
            <button class="btn secondary small"
                onclick="logout()">Logout</button>
          `
        : "";

    switch (currentPage) {

        case "home":
            homePage();
            break;

        case "studentLogin":
            studentLogin();
            break;

        case "adminLogin":
            adminLogin();
            break;

        case "student":
            studentDashboard();
            break;

        case "problem":
            problemPage();
            break;

        case "admin":
            adminDashboard();
            break;

        case "addProblem":
            addProblemPage();
            break;

        case "students":
            studentsPage();
            break;

        case "submissions":
            submissionsPage();
            break;

        default:
            currentPage = "home";
            homePage();
    }

    window.scrollTo(0, 0);
}


// HOME PAGE

function homePage() {

    app.innerHTML = `

        <section class="hero">

            <h1>
                Practice. Solve.
                <span>Grow<br>as a coder.</span>
            </h1>

            <p>
                Take on programming problems posted by
                your club admins and submit your solutions
                in one place.
            </p>

        </section>

        <section class="portal-grid">

            <div class="card portal-card">

                <div class="portal-symbol">ST</div>

                <h2>Student Portal</h2>

                <p>
                    Log in with your name and USN
                    to view and solve coding problems.
                </p>

                <button class="btn full"
                    onclick="navigate('studentLogin')">
                    Student Login
                </button>

            </div>


            <div class="card portal-card">

                <div class="portal-symbol">AD</div>

                <h2>Admin Portal</h2>

                <p>
                    Post coding problems, manage students
                    and review submissions.
                </p>

                <button class="btn full"
                    onclick="navigate('adminLogin')">
                    Admin Login
                </button>

            </div>

        </section>
    `;
}


// NAVIGATION

function navigate(page) {
    currentPage = page;
    render();
}

function goHome() {
    currentUser = null;
    selectedProblem = null;
    currentPage = "home";
    render();
}

function logout() {
    goHome();
    showToast("Logged out successfully!");
}


// STUDENT LOGIN

function studentLogin() {

    app.innerHTML = `

        <section class="card form-card">

            <h2>Student Login</h2>

            <form onsubmit="loginStudent(event)">

                <label>Student Name</label>

                <input
                    id="studentName"
                    type="text"
                    placeholder="Enter your name"
                    required
                >

                <label>USN</label>

                <input
                    id="studentUSN"
                    type="text"
                    placeholder="Enter your USN"
                    required
                >

                <div class="form-actions">

                    <button class="btn" type="submit">
                        Login
                    </button>

                    <button class="btn secondary"
                        type="button"
                        onclick="goHome()">
                        Back
                    </button>

                </div>

            </form>

        </section>
    `;
}


function loginStudent(event) {

    event.preventDefault();

    const name = document.getElementById("studentName")
        .value.trim();

    const usn = document.getElementById("studentUSN")
        .value.trim();

    const student = data.students.find(s =>
        s.name.toLowerCase() === name.toLowerCase() &&
        s.usn.toLowerCase() === usn.toLowerCase()
    );

    if (!student) {
        showToast("Student not registered!");
        return;
    }

    currentUser = {
        name: student.name,
        usn: student.usn,
        role: "student"
    };

    currentPage = "student";

    render();

    showToast("Welcome " + student.name + "!");
}


// ADMIN LOGIN

function adminLogin() {

    app.innerHTML = `

        <section class="card form-card">

            <h2>Admin Login</h2>

            <form onsubmit="loginAdmin(event)">

                <label>Username</label>

                <input
                    type="text"
                    id="adminName"
                    placeholder="Enter username"
                    required
                >

                <label>Password</label>

                <input
                    type="password"
                    id="adminPassword"
                    placeholder="Enter password"
                    required
                >

                <div class="form-actions">

                    <button class="btn" type="submit">
                        Login
                    </button>

                    <button class="btn secondary"
                        type="button"
                        onclick="goHome()">
                        Back
                    </button>

                </div>

                <p class="muted">
                    Demo login: admin / admin123
                </p>

            </form>

        </section>
    `;
}


function loginAdmin(event) {

    event.preventDefault();

    const username = document.getElementById("adminName").value;
    const password = document.getElementById("adminPassword").value;

    if (username === "admin" && password === "admin123") {

        currentUser = {
            name: "Admin",
            role: "admin"
        };

        currentPage = "admin";

        render();

        showToast("Admin login successful!");

    } else {

        showToast("Incorrect username or password!");

    }
}


// STUDENT DASHBOARD

function studentDashboard() {

    const solved = data.submissions.filter(
        s => s.usn === currentUser.usn
    ).length;

    app.innerHTML = `

        <section class="card">

            <h2>Welcome, ${escapeHTML(currentUser.name)} 👋</h2>

            <p class="muted">
                Solve programming problems and improve your skills.
            </p>

            <div class="stats">

                <span class="stat">
                    ${data.problems.length} Problems
                </span>

                <span class="stat">
                    ${solved} Submissions
                </span>

            </div>

        </section>

        <h2>Available Problems</h2>

        ${
            data.problems.length

            ? data.problems.map(p => `

                <div class="card problem-card"
                    onclick="openProblem(${p.id})">

                    <div class="problem-top">

                        <h3>${escapeHTML(p.title)}</h3>

                        <span class="badge">
                            ${escapeHTML(p.difficulty)}
                        </span>

                    </div>

                    <p class="muted">
                        ${escapeHTML(p.statement)}
                    </p>

                </div>

            `).join("")

            : `<div class="empty">
                No problems available yet.
               </div>`
        }

    `;
}


// OPEN PROBLEM

function openProblem(id) {

    selectedProblem = data.problems.find(
        p => p.id === id
    );

    if (!selectedProblem) {
        showToast("Problem not found!");
        return;
    }

    currentPage = "problem";

    render();
}


// PROBLEM PAGE

function problemPage() {

    if (!selectedProblem) {
        currentPage = "student";
        render();
        return;
    }

    const p = selectedProblem;

    app.innerHTML = `

        <button class="btn secondary"
            onclick="navigate('student')">
            ← Back to Problems
        </button>

        <section class="card" style="margin-top:20px">

            <div class="problem-top">

                <h2>${escapeHTML(p.title)}</h2>

                <span class="badge">
                    ${escapeHTML(p.difficulty)}
                </span>

            </div>

            <p style="margin-top:20px">
                ${escapeHTML(p.statement)}
            </p>

            <h3>Sample Input</h3>

            <pre>${escapeHTML(p.input || "No sample input")}</pre>

            <h3>Sample Output</h3>

            <pre>${escapeHTML(p.output || "No sample output")}</pre>

        </section>


        <section class="card">

            <h2>Submit Your Solution</h2>

            <form onsubmit="submitSolution(event)">

                <label>Programming Language</label>

                <select id="language" required>

                    <option value="">Select Language</option>
                    <option>Python</option>
                    <option>C</option>
                    <option>C++</option>
                    <option>Java</option>
                    <option>JavaScript</option>

                </select>

                <label>Write Your Code</label>

                <textarea
                    id="solution"
                    required
                    placeholder="Write your program here..."
                ></textarea>

                <div class="form-actions">

                    <button class="btn" type="submit">
                        Submit Solution
                    </button>

                </div>

            </form>

        </section>
    `;
}


// SUBMIT SOLUTION

function submitSolution(event) {

    event.preventDefault();

    if (!currentUser || !selectedProblem) {
        showToast("Please log in again!");
        return;
    }

    const language = document.getElementById("language").value;

    const code = document.getElementById("solution").value;

    data.submissions.unshift({

        id: Date.now(),

        name: currentUser.name,

        usn: currentUser.usn,

        problem: selectedProblem.title,

        language: language,

        code: code,

        date: new Date().toLocaleString()

    });

    saveData();

    showToast("Solution submitted successfully!");

    currentPage = "student";

    render();
}


// ADMIN NAVIGATION

function adminMenu() {

    return `

        <nav class="admin-nav">

            <button class="btn"
                onclick="navigate('addProblem')">
                + Add Problem
            </button>

            <button class="btn"
                onclick="navigate('admin')">
                Problems
            </button>

            <button class="btn"
                onclick="navigate('students')">
                Students
            </button>

            <button class="btn"
                onclick="navigate('submissions')">
                Submissions
            </button>

        </nav>

    `;
}


// ADMIN DASHBOARD

function adminDashboard() {

    app.innerHTML = adminMenu() + `

        <section class="card">

            <h2>Admin Dashboard</h2>

            <div class="stats">

                <span class="stat">
                    ${data.problems.length} Problems
                </span>

                <span class="stat">
                    ${data.students.length} Students
                </span>

                <span class="stat">
                    ${data.submissions.length} Submissions
                </span>

            </div>

            <h3>Posted Problems</h3>

            ${
                data.problems.length

                ? data.problems.map(p => `

                    <div class="student-row">

                        <div>

                            <b>${escapeHTML(p.title)}</b>

                            <p class="muted">
                                ${escapeHTML(p.difficulty)}
                            </p>

                        </div>

                        <button class="btn danger small"
                            onclick="deleteProblem(${p.id})">
                            Delete
                        </button>

                    </div>

                `).join("")

                : `<div class="empty">
                    No problems posted.
                   </div>`
            }

        </section>

    `;
}


// ADD PROBLEM PAGE

function addProblemPage() {

    app.innerHTML = adminMenu() + `

        <section class="card">

            <h2>Insert a Question / Problem</h2>

            <form onsubmit="createProblem(event)">

                <label>Problem Title</label>

                <input
                    id="title"
                    required
                    placeholder="Enter problem title"
                >

                <label>Difficulty</label>

                <select id="difficulty">

                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>

                </select>

                <label>Problem Description</label>

                <textarea
                    id="statement"
                    required
                    placeholder="Explain the problem..."
                ></textarea>

                <label>Sample Input</label>

                <textarea
                    id="input"
                    placeholder="Enter sample input"
                ></textarea>

                <label>Sample Output</label>

                <textarea
                    id="output"
                    placeholder="Enter sample output"
                ></textarea>

                <div class="form-actions">

                    <button class="btn" type="submit">
                        Publish Problem
                    </button>

                </div>

            </form>

        </section>

    `;
}


// CREATE PROBLEM

function createProblem(event) {

    event.preventDefault();

    const newProblem = {

        id: Date.now(),

        title: document.getElementById("title").value.trim(),

        difficulty: document.getElementById("difficulty").value,

        statement: document.getElementById("statement").value.trim(),

        input: document.getElementById("input").value.trim(),

        output: document.getElementById("output").value.trim()

    };

    data.problems.unshift(newProblem);

    saveData();

    currentPage = "admin";

    render();

    showToast("Problem published successfully!");
}


// DELETE PROBLEM

function deleteProblem(id) {

    if (!confirm("Are you sure you want to delete this problem?")) {
        return;
    }

    data.problems = data.problems.filter(
        p => p.id !== id
    );

    saveData();

    render();

    showToast("Problem deleted!");
}


// STUDENT MANAGEMENT

function studentsPage() {

    app.innerHTML = adminMenu() + `

        <section class="card">

            <h2>Bulk Add Students</h2>

            <p class="muted">
                Enter one student per line in this format:
                Name, USN
            </p>

            <textarea
                id="bulkStudents"
                placeholder="Rahul, 1AB22CS001&#10;Priya, 1AB22CS002"
            ></textarea>

            <label>Upload CSV or TXT File</label>

            <input
                type="file"
                id="studentFile"
                accept=".csv,.txt"
            >

            <div class="form-actions">

                <button class="btn"
                    onclick="importStudents()">
                    Import Students
                </button>

            </div>

        </section>


        <section class="card">

            <h2>Add Individual Student</h2>

            <form onsubmit="addStudent(event)">

                <label>Student Name</label>

                <input id="newName" required>

                <label>USN</label>

                <input id="newUsn" required>

                <div class="form-actions">

                    <button class="btn">
                        Add Student
                    </button>

                </div>

            </form>

        </section>


        <section class="card">

            <h2>Registered Students</h2>

            ${
                data.students.length

                ? data.students.map((s, index) => `

                    <div class="student-row">

                        <div>

                            <b>${escapeHTML(s.name)}</b>

                            <p class="muted">
                                ${escapeHTML(s.usn)}
                            </p>

                        </div>

                        <button class="btn danger small"
                            onclick="removeStudent(${index})">
                            Remove
                        </button>

                    </div>

                `).join("")

                : `<div class="empty">
                    No students registered.
                   </div>`
            }

        </section>

    `;
}


// ADD STUDENT

function addStudent(event) {

    event.preventDefault();

    const name = document.getElementById("newName")
        .value.trim();

    const usn = document.getElementById("newUsn")
        .value.trim();

    if (data.students.some(s =>
        s.usn.toLowerCase() === usn.toLowerCase()
    )) {

        showToast("USN already exists!");

        return;
    }

    data.students.push({
        name: name,
        usn: usn
    });

    saveData();

    render();

    showToast("Student added successfully!");
}


// REMOVE STUDENT

function removeStudent(index) {

    if (!confirm("Remove this student?")) {
        return;
    }

    data.students.splice(index, 1);

    saveData();

    render();

    showToast("Student removed!");
}


// BULK IMPORT STUDENTS

async function importStudents() {

    let raw = document.getElementById("bulkStudents").value;

    const file = document.getElementById("studentFile").files[0];

    if (file) {

        raw += "\n" + await file.text();

    }

    if (!raw.trim()) {

        showToast("Enter student details first!");

        return;
    }

    let added = 0;

    raw.split(/\r?\n/).forEach((line, index) => {

        const parts = line.includes("\t")
            ? line.split("\t")
            : line.split(",");

        if (parts.length < 2) return;

        const name = parts[0].trim();
        const usn = parts[1].trim();

        if (!name || !usn) return;

        if (index === 0 &&
            /name/i.test(name) &&
            /usn/i.test(usn)) {
            return;
        }

        if (!data.students.some(s =>
            s.usn.toLowerCase() === usn.toLowerCase()
        )) {

            data.students.push({
                name: name,
                usn: usn
            });

            added++;
        }

    });

    saveData();

    render();

    showToast(added + " student(s) imported!");
}


// VIEW SUBMISSIONS

function submissionsPage() {

    app.innerHTML = adminMenu() + `

        <section class="card">

            <h2>Student Submissions</h2>

            ${
                data.submissions.length

                ? data.submissions.map((s, index) => `

                    <article class="submission-row">

                        <h3>${escapeHTML(s.name)}</h3>

                        <p class="muted">
                            ${escapeHTML(s.usn)}
                        </p>

                        <p>
                            Problem: ${escapeHTML(s.problem)}
                        </p>

                        <p>
                            Language: ${escapeHTML(s.language)}
                        </p>

                        <p class="muted">
                            ${escapeHTML(s.date)}
                        </p>

                        <details>

                            <summary>View Submitted Code</summary>

                            <pre>${escapeHTML(s.code)}</pre>

                        </details>

                    </article>

                `).join("")

                : `<div class="empty">
                    No submissions yet.
                   </div>`
            }

        </section>

    `;
}


// START WEBSITE

saveData();

render();
