ASP.NET Core Web Application Project - Requirements & Assessment Guide
Group Size: Maximum 5 students
Lecturer: ABDISALAN ABDULLAHI MOHAMED
Total Marks: 20 Marks
1. Project Overview
Students are required to design and develop a complete web application using ASP.NET Core for the backend and Entity Framework (EF) Core for data access.
The project evaluates students' practical understanding of:
•
Web development with ASP.NET Core (MVC, Razor Pages, or Web API)
•
Database integration using Entity Framework Core (CRUD operations)
•
Authentication & authorization
•
Responsive UI design
•
Team collaboration, version control via GitHub, and project management.
2. Technology Requirements
Backend (Mandatory)
•
ASP.NET Core (MVC, Razor Pages, or Web API)
•
Entity Framework Core (EF Core) for Object-Relational Mapping (ORM)
•
ASP.NET Core Identity (or JWT) for authentication
•
Database (Choose ONE): SQL Server, MySQL, or PostgreSQL
Frontend
•
Standard: ASP.NET Views (Razor/Blazor) using Bootstrap OR Tailwind CSS for styling.
•
Bonus (Optional): Using a separate JavaScript frontend framework (such as React, Angular, or Vue.js) to consume your ASP.NET Core Web API.
Project Management & Version Control (Mandatory)
•
Git & GitHub: Every team member must be actively involved in the group project. Individual involvement will be strictly verified by checking the GitHub repository's collaborators list and commit history.
3. Project Scope (Minimum Features)
3.1 User Management
•
User registration & login
•
Authentication & Authorization
•
Role-based access control (e.g., Admin vs. Standard User)
3.2 CRUD Operations
Each system must support full CRUD functionality via web forms or API endpoints:
•
Create data
•
Read data (Data grids/lists)
•
Update data
•
Delete data
3.3 Application Architecture & Security
•
SQL Injection Prevention: Use of EF Core (which natively parameterizes queries) or explicitly parameterized queries if writing raw SQL.
•
XSS Protection: Output encoding (handled natively by Razor) or properly configured API responses.
•
CSRF Protection: Anti-forgery tokens (@Html.AntiForgeryToken()) required on forms.
3.4 Error Handling
•
User-friendly error messages
•
Form validation (Data Annotations / Server-side required, Client-side validation recommended)
•
Custom 404/Error pages
4. Project Examples (Choose Any Domain)
Students may choose any real-world system, such as:
•
Student Management System
•
Online Library System
•
E-commerce Web Store
•
Hospital Appointment System
•
Course Registration System
•
Inventory Management System
Creativity is encouraged, but the system must be practical, functional, and complete.
5. Code & Design Requirements
•
Clean, readable, and well-documented code.
•
Expected ASP.NET folder structure:
o
Controllers/
o
Models/ & ViewModels/
o
Views/
o
Data/ (DbContext and EF Core Migrations)
o
wwwroot/ (CSS, JS, Images)
•
Clear separation of logic and presentation.
6. Group Work Rules
•
Maximum 5 students per group.
•
All members must understand the entire system.
•
GitHub Collaborators: Each student's contribution must be visible in the GitHub commit history. Commits must be made individually by each student from their own GitHub accounts.
•
Each student will be individually questioned during the evaluation.
•
Marks are given individually, not equally by default.
•
Jira activity and GitHub commit logs will be used to assess individual contribution.
7. Project Submission Requirements
Each group must submit:
7.1 GitHub Repository
•
Public or private repository (with lecturer access).
•
Proper commit history showing all team members' contributions.
7.2 Configuration & Database
•
EF Core Migrations must be included OR a database.sql export provided.
•
appsettings.json (Ensure no real/production secrets or sensitive credentials are hardcoded and pushed to the repo).
8. Academic Integrity Policy
•
Plagiarism is strictly prohibited.
•
Projects copied from the internet without understanding will receive ZERO (0) marks.
•
Each student must be able to clearly explain their code contribution.
•
Inability to defend the project will result in severe mark reduction.
9. Mandatory Pre-Submission Information
All students must submit the following information before the deadline:
•
Group members' full names and student IDs
•
Selected project title/topic
•
Group leader's name
•
Link to the GitHub repository
Rules & Conditions
•
Late submissions will NOT be accepted.
•
Students who fail to submit will receive ZERO (0) marks.
•
Group changes after submission are strictly prohibited.
•
Each student will be individually examined and graded.
Demonstration Date: 21 July 2026
10. Grading Rubric (20 Marks Total)
The project will be evaluated based on the following criteria. Note that marks may vary per student depending on their individual defense and verifiable GitHub contributions.
Assessment Criteria
Description
Max Marks
Backend & Functionality
Proper use of ASP.NET Core, Entity Framework Core (DbContext, Migrations), and successful implementation of full CRUD operations.
5
Frontend & UI/UX
Application is responsive, user-friendly, and uses Bootstrap/Tailwind. (Bonus marks awarded within this category if a JS Framework like React/Vue/Angular is successfully integrated).
4
Security & Authentication
Proper implementation of Identity (or JWT), roles, registration/login, data validation, and protection against vulnerabilities (CSRF, XSS).
4
Architecture & Code Quality
Clean code, proper naming conventions, clear separation of concerns (MVC pattern, DTOs/ViewModels), and good error handling.
2
Collaboration (GitHub)
Evident individual involvement via the GitHub collaborators graph and commit history. Effective use of Jira for task management.
2
Individual Defense
Student's ability to clearly explain their code, answer technical questions, and demonstrate an understanding of the overall system.
3
Total Marks
20
IMPORTANT NOTICE This instruction is final and non-negotiable. Failure to comply with any requirement may result in mark reduction or project rejection.
Lecturer: ABDISALAN ABDULLAHI MOHAMED