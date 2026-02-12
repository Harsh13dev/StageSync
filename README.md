# StageSync 🎤

**StageSync** is a backend platform designed to bridge the gap between Event Hosts and Professional Anchors. It streamlines the hiring process for events, allowing hosts to post opportunities and anchors to apply seamlessly.

## 🚀 Features

### 🎩 For Hosts
* **Create Events:** Post details about weddings, corporate events, or parties.
* **Dashboard:** View all created events and track applicant status.
* **Hire Talent:** Review anchor profiles (rating, price, experience) and hire the best fit.
* **Status Management:** Automatically rejects other applicants when an anchor is hired.

### 🎙️ For Anchors
* **Profile Management:** Set specialization, base fee, languages, and past work links.
* **Smart Feed:** View "Open" events relevant to finding work.
* **Apply:** Submit applications to events with a single click.
* **Dashboard:** Track application status (`Pending`, `Accepted`, `Rejected`).

### 🎫 For Audience (Users)
* **View Shows:** Browse "Confirmed" events that are ready for the public.
* **Book Tickets:** Secure a spot at confirmed events.

---

## 🛠️ Tech Stack

* **Language:** Python 3.9+
* **Framework:** FastAPI
* **Database:** MySQL
* **ORM:** SQLAlchemy
* **Validation:** Pydantic
* **Server:** Uvicorn

---

## 📂 Project Structure

```bash
StageSync/
├── src/
│   ├── database.py      # Database connection & SessionLocal
│   ├── db_models.py     # SQLAlchemy Tables (Dimension & Fact tables)
│   ├── models.py        # CRUD Logic (Service Layer)
│   ├── schemas.py       # Pydantic Models (Data Validation)
│   └── utils.py         # Utility functions (e.g., Hashing)
├── main.py              # API Entry point & Route definitions
└── requirements.txt     # Project dependencies
