// ================= ROLE PROTECTION =================
(function () {
    let params = new URLSearchParams(window.location.search);
    let role = params.get("role");
    let storedRole = localStorage.getItem("role");

    // Skip protection on login page
    let page = window.location.pathname;
    if (page.includes("login")) return;

    if (!role || role !== storedRole) {
        window.location = "login.html";
        return;
    }

    // Pages only admin can access
    let adminOnly = ["addBook", "updateBook", "deleteBook", "addMembership", "updateMembership", "userManagement"];

    if (role === "user") {
        adminOnly.forEach(p => {
            if (page.includes(p)) {
                window.location = "dashboard.html?role=user";
            }
        });
    }
})();

// ================= HELPERS =================
window.onload = function () {
    clearMsg();
};

function getRoleParam() {
    return new URLSearchParams(window.location.search).get("role") || localStorage.getItem("role") || "user";
}

function showError(msg) {
    let m = document.getElementById("msg") || document.getElementById("error");
    if (!m) return;
    m.innerText = msg;
    m.className = "error";
}

function showSuccess(msg) {
    let m = document.getElementById("msg") || document.getElementById("error");
    if (!m) return;
    m.innerText = msg;
    m.className = "success";
}

function clearMsg() {
    ["msg", "error"].forEach(id => {
        let m = document.getElementById(id);
        if (m) { m.innerText = ""; m.className = ""; }
    });
}

// ================= LOGIN =================
function login() {
    let user = document.getElementById("username").value.trim();
    let pass = document.getElementById("password").value.trim();

    if (!user || !pass) return showError("Enter credentials");

    let role = (user === "admin" && pass === "123") ? "admin" : "user";

    localStorage.setItem("role", role);
    window.location = "dashboard.html?role=" + role;
}

function logout() {
    localStorage.clear();
    window.location = "login.html";
}

// ================= ADD BOOK =================
function addBook() {
    clearMsg();

    let name = document.getElementById("bookName").value.trim();
    let author = document.getElementById("author").value.trim();

    let typeEl = document.querySelector('input[name="type"]:checked');
    if (!typeEl) return showError("Select type: Book or Movie");
    let type = typeEl.value;

    if (!name) return showError("Book name is mandatory");
    if (!author) return showError("Author name is mandatory");

    let books = JSON.parse(localStorage.getItem("books")) || [];

    if (books.find(b => b.name.toLowerCase() === name.toLowerCase()))
        return showError("Book already exists");

    books.push({ name, author, type });
    localStorage.setItem("books", JSON.stringify(books));
    localStorage.setItem("maintenanceDone", "true");

    showSuccess("Book added successfully");

    // Clear fields
    document.getElementById("bookName").value = "";
    document.getElementById("author").value = "";
}

// ================= UPDATE BOOK =================
function updateBook() {
    clearMsg();

    let name = document.getElementById("ubookName").value.trim();
    let author = document.getElementById("uauthor").value.trim();

    let typeEl = document.querySelector('input[name="type"]:checked');
    if (!typeEl) return showError("Select type: Book or Movie");

    if (!name) return showError("Book name is mandatory");
    if (!author) return showError("New author name is mandatory");

    let books = JSON.parse(localStorage.getItem("books")) || [];
    let i = books.findIndex(b => b.name.toLowerCase() === name.toLowerCase());

    if (i === -1) return showError("Book not found");

    books[i].author = author;
    books[i].type = typeEl.value;
    localStorage.setItem("books", JSON.stringify(books));

    showSuccess("Book updated successfully");
}

// ================= DELETE BOOK =================
function deleteBook() {
    clearMsg();

    // Role guard
    if (localStorage.getItem("role") !== "admin") {
        return showError("Access denied");
    }

    let name = document.getElementById("bookName").value.trim();
    if (!name) return showError("Book name is mandatory");

    let books = JSON.parse(localStorage.getItem("books")) || [];

    if (!books.find(b => b.name.toLowerCase() === name.toLowerCase()))
        return showError("Book not found");

    books = books.filter(b => b.name.toLowerCase() !== name.toLowerCase());
    localStorage.setItem("books", JSON.stringify(books));

    showSuccess("Book deleted");
    document.getElementById("bookName").value = "";
}

// ================= ISSUE BOOK =================
function loadBooksToDropdown() {
    let books = JSON.parse(localStorage.getItem("books")) || [];
    let select = document.getElementById("bookSelect");

    if (!select) return;

    select.innerHTML = `<option value="">-- Select Book --</option>`;

    books.forEach(b => {
        let opt = document.createElement("option");
        opt.value = b.name + "|" + b.author;
        opt.text = b.name;
        select.appendChild(opt);
    });
}

function fillBookDetails() {
    let data = document.getElementById("bookSelect").value;

    if (data) {
        let [book, author] = data.split("|");

        document.getElementById("book").value = book;
        document.getElementById("author").value = author;

        localStorage.setItem("selectedBook", book);
    }
}
function setDates() {
    let today = new Date().toISOString().split("T")[0];
    document.getElementById("issueDate").value =
new Date().toISOString().split("T")[0];
    document.getElementById("issueDate").min = today;
    document.getElementById("issueDate").max = today; // Issue date must be today only

    let r = new Date();
    r.setDate(new Date().getDate() + 15);
    let maxReturn = r.toISOString().split("T")[0];

    let todayDate = new Date().toISOString().split("T")[0];
    document.getElementById("returnDate").value = maxReturn;
    document.getElementById("returnDate").min = todayDate;
    document.getElementById("returnDate").max = maxReturn;
}

function loadIssueData() {
    let selected = localStorage.getItem("selectedBook");
    if (!selected) return;

    document.getElementById("book").value = selected;

    let books = JSON.parse(localStorage.getItem("books")) || [];
    let b = books.find(x => x.name === selected);
    if (b) document.getElementById("author").value = b.author;
}

function validateIssue() {
    clearMsg();

    let book = document.getElementById("book").value.trim();
    let issueDate = document.getElementById("issueDate").value;
    let returnDate = document.getElementById("returnDate").value;

    if (!book) return showError("Book name is required");
    if (!issueDate) return showError("Issue date is required");
    if (!returnDate) return showError("Return date is required");

    let today = new Date();
    today.setHours(0, 0, 0, 0);

    let issueDateObj = new Date(issueDate);
    let returnDateObj = new Date(returnDate);

    // Issue date must not be before today
    if (issueDateObj < today) return showError("Issue date cannot be in the past");

    // Return date must not exceed 15 days from today
    let maxReturn = new Date();
    maxReturn.setDate(today.getDate() + 15);
    maxReturn.setHours(0, 0, 0, 0);

    if (returnDateObj > maxReturn) return showError("Return date cannot exceed 15 days from today");
    if (returnDateObj < today) return showError("Return date cannot be before today");

    let books = JSON.parse(localStorage.getItem("books")) || [];
    if (!books.find(b => b.name.toLowerCase() === book.toLowerCase()))
        return showError("Book not found in library");

    let issued = JSON.parse(localStorage.getItem("issuedList")) || [];
    if (issued.find(b => b.name.toLowerCase() === book.toLowerCase()))
        return showError("Book is already issued");

    issued.push({ name: book, issue: issueDate, ret: returnDate });
    localStorage.setItem("issuedList", JSON.stringify(issued));
    localStorage.removeItem("selectedBook");

    showSuccess("Book issued successfully");
}

// ================= RETURN BOOK =================
function loadReturnData() {
    let list = JSON.parse(localStorage.getItem("issuedList")) || [];
    let select = document.getElementById("rbook");
    select.innerHTML = "<option value=''>-- Select Book --</option>";

    if (!list.length) {
        select.innerHTML = "<option value=''>No books currently issued</option>";
        return;
    }

    list.forEach(b => {
        let opt = document.createElement("option");
        opt.value = b.name;
        opt.text = b.name;
        select.appendChild(opt);
    });

    // Auto-fill details when selection changes
    select.addEventListener("change", populateReturnDetails);
}

function populateReturnDetails() {
    let bookName = document.getElementById("rbook").value;
    if (!bookName) {
        clearReturnFields();
        return;
    }

    let books = JSON.parse(localStorage.getItem("books")) || [];
    let issued = JSON.parse(localStorage.getItem("issuedList")) || [];

    let bookRecord = books.find(b => b.name === bookName);
    let issuedRecord = issued.find(b => b.name === bookName);

    if (bookRecord && document.getElementById("rauthor"))
        document.getElementById("rauthor").value = bookRecord.author;

    if (issuedRecord) {
        if (document.getElementById("rissueDate"))
            document.getElementById("rissueDate").value = issuedRecord.issue;

        if (document.getElementById("rreturnDate")) {
            document.getElementById("rreturnDate").value = issuedRecord.ret;
            // Allow editing: min = issue date, no max restriction for late returns
            document.getElementById("rreturnDate").min = issuedRecord.issue;
            document.getElementById("rreturnDate").removeAttribute("max");
        }
    }
}

function clearReturnFields() {
    ["rauthor", "rissueDate", "rreturnDate", "rserial"].forEach(id => {
        let el = document.getElementById(id);
        if (el) el.value = "";
    });
}

function returnBook() {
    clearMsg();

    let book = document.getElementById("rbook").value;
    let serial = document.getElementById("rserial") ? document.getElementById("rserial").value.trim() : null;
    let rreturnDate = document.getElementById("rreturnDate") ? document.getElementById("rreturnDate").value : null;

    if (!book) return showError("Please select a book to return");
    if (serial !== null && !serial) return showError("Serial number is mandatory");
    if (!rreturnDate) return showError("Return date is required");

    // Save returning info for fine page
    localStorage.setItem("returningBook", book);
    localStorage.setItem("returningSerial", serial || "");
    localStorage.setItem("returningReturnDate", rreturnDate);

    let role = getRoleParam();
    window.location = "finePay.html?role=" + role;
}

// ================= FINE =================
function calculateFine() {
    let returning = localStorage.getItem("returningBook");
    if (!returning) return 0;

    let list = JSON.parse(localStorage.getItem("issuedList")) || [];
    let record = list.find(b => b.name === returning);
    if (!record) return 0;

    // Use the return date the user entered, or the expected date
    let actualReturnDate = localStorage.getItem("returningReturnDate");
    let expected = new Date(record.ret);
    let actual = actualReturnDate ? new Date(actualReturnDate) : new Date();

    let diff = (actual - expected) / (1000 * 60 * 60 * 24);
    return diff > 0 ? Math.floor(diff) * 10 : 0;
}

function loadFine() {
    let fine = calculateFine();
    let book = localStorage.getItem("returningBook");
    let serial = localStorage.getItem("returningSerial");

    let list = JSON.parse(localStorage.getItem("issuedList")) || [];
    let record = list.find(b => b.name === book);

    let books = JSON.parse(localStorage.getItem("books")) || [];
    let bookInfo = books.find(b => b.name === book);

    // Populate all display fields
    if (document.getElementById("fBookName")) document.getElementById("fBookName").value = book || "";
    if (document.getElementById("fAuthor")) document.getElementById("fAuthor").value = bookInfo ? bookInfo.author : "";
    if (document.getElementById("fSerial")) document.getElementById("fSerial").value = serial || "";
    if (document.getElementById("fIssueDate")) document.getElementById("fIssueDate").value = record ? record.issue : "";
    if (document.getElementById("fReturnDate")) document.getElementById("fReturnDate").value = localStorage.getItem("returningReturnDate") || (record ? record.ret : "");

    let fineEl = document.getElementById("fineAmount");
    if (fineEl) fineEl.innerText = "Fine: ₹" + fine;

    // Show/hide fine paid section
    let finePaidSection = document.getElementById("finePaidSection");
    if (finePaidSection) {
        finePaidSection.style.display = fine > 0 ? "block" : "none";
    }
}

function payFine() {
    clearMsg();

    let fine = calculateFine();

    // If fine exists, "Fine Paid" checkbox must be checked
    if (fine > 0) {
        let paidCheck = document.getElementById("finePaid");
        if (!paidCheck || !paidCheck.checked) {
            return showError("Please check 'Fine Paid' checkbox to confirm payment of ₹" + fine + " before completing return");
        }
    }

    let book = localStorage.getItem("returningBook");
    let list = JSON.parse(localStorage.getItem("issuedList")) || [];
    list = list.filter(b => b.name !== book);
    localStorage.setItem("issuedList", JSON.stringify(list));

    // Clean up temp storage
    localStorage.removeItem("returningBook");
    localStorage.removeItem("returningSerial");
    localStorage.removeItem("returningReturnDate");

    showSuccess("Return completed successfully");

    // Redirect to dashboard after 1.5s
    setTimeout(() => {
        let role = getRoleParam();
        window.location = "dashboard.html?role=" + role;
    }, 1500);
}

// ================= REPORTS =================
function loadReports() {
    let books = JSON.parse(localStorage.getItem("books")) || [];
    let table = document.getElementById("reportTable");
    let searchVal = (document.getElementById("searchInput") ? document.getElementById("searchInput").value.trim().toLowerCase() : "");

    // Filter if search provided
    let filtered = searchVal ? books.filter(b => b.name.toLowerCase().includes(searchVal) || b.author.toLowerCase().includes(searchVal)) : books;

    if (!filtered.length) {
        table.innerHTML = "<tr><td colspan='4' style='text-align:center;color:#888'>No books found</td></tr>";
        return;
    }

    table.innerHTML = "<tr><th>Book Name</th><th>Author</th><th>Type</th><th>Select</th></tr>";

    filtered.forEach(b => {
        table.innerHTML += `
        <tr>
          <td>${b.name}</td>
          <td>${b.author}</td>
          <td>${b.type}</td>
          <td style="text-align:center"><input type="radio" name="select" value="${b.name}"></td>
        </tr>`;
    });
}

function selectBook() {
    clearMsg();
    let sel = document.querySelector('input[name="select"]:checked');
    if (!sel) return showError("Please select a book first");

    let issued = JSON.parse(localStorage.getItem("issuedList")) || [];
    if (issued.find(b => b.name === sel.value)) {
        return showError("This book is already issued");
    }

    localStorage.setItem("selectedBook", sel.value);
    let role = getRoleParam();
    window.location = "issueBook.html?role=" + role;
}

// ================= ADD MEMBERSHIP =================
function addMember() {
    clearMsg();

    let name = document.getElementById("mname").value.trim();
    let email = document.getElementById("email").value.trim();
    let phone = document.getElementById("phone").value.trim();

    let durEl = document.querySelector('input[name="dur"]:checked');
    if (!durEl) return showError("Please select a duration");

    if (!name) return showError("Name is mandatory");
    if (!email) return showError("Email is mandatory");
    if (!/\S+@\S+\.\S+/.test(email)) return showError("Enter a valid email");
    if (!phone) return showError("Phone is mandatory");
    if (!/^\d{10}$/.test(phone)) return showError("Enter a valid 10-digit phone number");

    let members = JSON.parse(localStorage.getItem("members")) || [];

    if (members.find(m => m.email.toLowerCase() === email.toLowerCase()))
        return showError("Member with this email already exists");

    let mid = "M" + Date.now();
    let joinDate = new Date();
    let expiry = new Date();

    let dur = durEl.value;
    if (dur === "6months") expiry.setMonth(expiry.getMonth() + 6);
    else if (dur === "1year") expiry.setFullYear(expiry.getFullYear() + 1);
    else if (dur === "2years") expiry.setFullYear(expiry.getFullYear() + 2);

    members.push({
        mid,
        name,
        email,
        phone,
        duration: dur,
        joinDate: joinDate.toISOString().split("T")[0],
        expiry: expiry.toISOString().split("T")[0],
        status: "active"
    });

    localStorage.setItem("members", JSON.stringify(members));
    showSuccess("Membership added! ID: " + mid);

    document.getElementById("mname").value = "";
    document.getElementById("email").value = "";
    document.getElementById("phone").value = "";
}

// ================= UPDATE MEMBERSHIP =================
function lookupMember() {
    clearMsg();
    let mid = document.getElementById("mid").value.trim();
    if (!mid) return showError("Enter Membership ID");

    let members = JSON.parse(localStorage.getItem("members")) || [];
    let m = members.find(x => x.mid === mid);

    if (!m) return showError("Membership ID not found");

    if (document.getElementById("umname")) document.getElementById("umname").value = m.name;
    if (document.getElementById("umemail")) document.getElementById("umemail").value = m.email;
    if (document.getElementById("umphone")) document.getElementById("umphone").value = m.phone;
    if (document.getElementById("umexpiry")) document.getElementById("umexpiry").value = m.expiry;
    if (document.getElementById("umstatus")) document.getElementById("umstatus").value = m.status;

    showSuccess("Member found: " + m.name);
}

function updateMember() {
    clearMsg();

    let mid = document.getElementById("mid").value.trim();
    if (!mid) return showError("Membership ID is mandatory");

    let extEl = document.querySelector('input[name="ext"]:checked');
    if (!extEl) return showError("Please select an option");

    let members = JSON.parse(localStorage.getItem("members")) || [];
    let i = members.findIndex(m => m.mid === mid);

    if (i === -1) return showError("Membership ID not found");

    if (extEl.value === "cancel") {
        members[i].status = "cancelled";
        localStorage.setItem("members", JSON.stringify(members));
        return showSuccess("Membership cancelled for " + members[i].name);
    }

    // Extend by 6 months from current expiry
    let expiry = new Date(members[i].expiry);
    expiry.setMonth(expiry.getMonth() + 6);
    members[i].expiry = expiry.toISOString().split("T")[0];
    members[i].status = "active";

    localStorage.setItem("members", JSON.stringify(members));

    if (document.getElementById("umexpiry")) document.getElementById("umexpiry").value = members[i].expiry;
    showSuccess("Membership extended to " + members[i].expiry);
}

// ================= USER MANAGEMENT =================
function manageUser() {
    clearMsg();

    let typeEl = document.querySelector('input[name="userType"]:checked');
    if (!typeEl) return showError("Select user type");

    let name = document.getElementById("uname").value.trim();
    if (!name) return showError("User name is mandatory");

    let users = JSON.parse(localStorage.getItem("appUsers")) || [];

    if (typeEl.value === "new") {
        if (users.find(u => u.name.toLowerCase() === name.toLowerCase()))
            return showError("User already exists");

        users.push({ name, createdAt: new Date().toISOString().split("T")[0], status: "active" });
        localStorage.setItem("appUsers", JSON.stringify(users));
        showSuccess("New user '" + name + "' added successfully");
    } else {
        let i = users.findIndex(u => u.name.toLowerCase() === name.toLowerCase());
        if (i === -1) return showError("User not found");

        showSuccess("Existing user '" + name + "' found. Status: " + users[i].status);
    }

    document.getElementById("uname").value = "";
}
