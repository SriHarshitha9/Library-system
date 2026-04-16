function login() {
    let role = document.getElementById("role").value;
    window.location = "dashboard.html?role=" + role;
}

window.onload = function () {
    let params = new URLSearchParams(window.location.search);
    let role = params.get("role");

    if (role === "user") {
        let m = document.getElementById("maintenanceLink");
        if (m) m.style.display = "none";
    }
};

function showError(msg) {
    document.getElementById("error").innerText = msg;
}
function addBook() {
    let name = document.getElementById("bookName").value;
    let author = document.getElementById("author").value;

    if (name === "" || author === "") {
        showError("All fields mandatory");
        return;
    }

    alert("Book Added Successfully");
}
function setDates() {
    let today = new Date();
    document.getElementById("issueDate").value =
        today.toISOString().split("T")[0];

    let r = new Date();
    r.setDate(today.getDate() + 15);

    document.getElementById("returnDate").value =
        r.toISOString().split("T")[0];
}

function validateIssue() {
    let book = document.getElementById("book").value;

    if (book === "") {
        alert("Enter book name");
        return;
    }

    alert("Book Issued");
}