#  Library Management System (LMS)

## Project Overview
The Library Management System (LMS) is a web-based application developed using HTML, CSS, and JavaScript.  
It is designed to manage library operations such as adding books, issuing books, returning books, and calculating fines without using any backend database. All data is stored using browser LocalStorage.

---

##  Objective
The main objective of this project is to digitize basic library operations and provide an easy-to-use system for managing books and users efficiently.

---

##  Features

## Authentication
- Simple login system
- Role-based access (Admin & User)

## Book Management
- Add new books
- Update existing books
- Delete books
- View all available books

## Issue Book
- Select book from dropdown
- Auto-fill book details
- Issue date automatically set to today
- Return date limited to 15 days

## Return Book
- Select issued book
- Auto-fetch issue details
- Return process handling

###  Fine Calculation
- Fine calculated based on delay in return
- ₹10 per day late fee logic

## Membership Management
- Add new members
- Update membership duration
- Cancel membership

## Reports
- View all books in tabular format
- Search functionality

---

##  Technologies Used

- HTML5
- CSS3
- JavaScript (Vanilla JS)
- Browser LocalStorage

---

####  Project Structure

Library-Management-System/
│
├── addBook.html
├── addMembership.html
├── dashboard.html
├── finePay.html
├── issueBook.html
├── login.html
├── maintenance.html
├── reports.html
├── returnBook.html
├── transactions.html
├── updateBook.html
├── updateMembership.html
├── userManagement.html
│
├── script.js
└── style.css

##  How to Run the Project

1. Download or clone this repository
2. Open the folder in **VS Code**
3. Open `login.html` in a browser
4. Start using the system

---

##  Login Credentials

### Admin Login
- Username: `admin`
- Password: `123`

### User Login
- Any other username/password will act as user role

---

##  User Roles

###  Admin
- Add books
- Update books
- Delete books
- Manage members
- View reports

###  User
- View books
- Issue books
- Return books

---

##  Key Highlights

- No backend required (fully frontend project)
- Uses LocalStorage for data persistence
- Real-time validation for issue/return system
- Clean and simple UI design
- Beginner-friendly project structure

---

##  Future Enhancements

- Database integration (MySQL / Firebase)
- Email reminders for due dates
- Advanced search and filters
- Barcode-based book system
- Mobile responsive UI improvement

---

##  Author

Name: Sri Harshitha Gullapalli
Department: Computer Science / AIML  
Project Type: Mini Project / Academic Project

---

##  Note

This project is developed for educational purposes to demonstrate basic web development skills using HTML, CSS, and JavaScript.
