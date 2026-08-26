# MediVerse AI

A smart healthcare monitoring and disease prediction platform powered by machine learning. Built for educational and portfolio demonstration purposes.

## 🌟 Features

- **🔐 Authentication** - JWT-based registration, login, token refresh, and profile management
- **🩺 Disease Prediction** - AI-powered disease prediction from symptoms (41 diseases, 136 symptoms, Random Forest model)
- **📄 Medical Report Analysis** - PDF upload, text extraction, structured data parsing, and automated health analysis
- **🔬 Skin Disease Detection** - Image upload with graceful "model not configured" handling (ready for TensorFlow/Keras model)
- **📊 Health Dashboard** - Wellness score, statistics, recent activity, and personalized recommendations
- **📈 Prediction History** - Complete history of all disease predictions with confidence scores
- **👤 Profile Management** - Comprehensive health profile with BMI calculation
- **🛡️ Security** - User ownership enforcement, secure file handling, JWT authentication

## 🏗️ Architecture

```
MediVerseAI/
│
├── backend/                 # Django REST API
│   ├── accounts/           # Authentication & user profiles
│   ├── disease/            # Disease prediction (ML)
│   │   └── ml/             # Model training & prediction
│   ├── reports/            # Medical report processing
│   ├── skin/               # Skin disease detection
│   ├── dashboard/          # Dashboard aggregation
│   ├── trained_models/     # Saved ML models
│   ├── mediverse/          # Django project settings
│   ├── media/              # Uploaded files
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/               # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── api/           # Axios API client
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React context (Auth)
│   │   └── pages/         # Page components
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
│
├── README.md
└── .gitignore
```

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- Git

### Backend Setup (Windows)

```cmd
cd backend

REM Create virtual environment
python -m venv venv
venv\Scripts\activate

REM Install dependencies
pip install -r requirements.txt

REM Configure environment
copy .env.example .env
REM Edit .env with your settings

REM Run migrations
python manage.py makemigrations accounts disease reports skin dashboard
python manage.py migrate

REM Train the ML model (if not already trained)
python -m disease.ml.train

REM Start server
python manage.py runserver
```

Backend runs at: `http://127.0.0.1:8000`

### Frontend Setup (Windows)

```cmd
cd frontend

REM Install dependencies
npm install

REM Configure environment (optional - defaults to http://127.0.0.1:8000)
copy .env.example .env.local

REM Start development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

### Production Build

```cmd
cd frontend
npm run build
```

## 🔧 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `DJANGO_SECRET_KEY` | Django secret key | Insecure dev key |
| `DEBUG` | Debug mode | `True` |
| `DATABASE_URL` | Database connection string (MySQL/PostgreSQL) | SQLite |
| `GROQ_API_KEY` | Optional external AI API | Not required |
| `GEMINI_API_KEY` | Optional external AI API | Not required |

**Database Examples:**
```bash
# SQLite (default - no config needed)
DATABASE_URL=

# MySQL
DATABASE_URL=mysql://user:password@localhost:3306/mediverse

# PostgreSQL
DATABASE_URL=postgres://user:password@localhost:5432/mediverse
```

### Frontend (`frontend/.env.local`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://127.0.0.1:8000` |

## 🤖 ML Models

### Disease Prediction Model
- **Type**: Random Forest Classifier (scikit-learn)
- **Training Data**: Synthetic dataset (3,280 samples, 136 symptoms, 41 diseases)
- **Accuracy**: ~68% test accuracy
- **Files**: 
  - `backend/trained_models/random_forest.pkl`
  - `backend/trained_models/label_encoder.pkl`
  - `backend/trained_models/symptom_list.pkl`

**Supported Diseases**: Common Cold, Influenza, COVID-19, Malaria, Dengue, Typhoid, Pneumonia, Bronchitis, Asthma, Type 2 Diabetes, Hypertension, Migraine, Gastroenteritis, Food Poisoning, UTI, Allergic Reaction, Anemia, Hypothyroidism, Hyperthyroidism, Arthritis, Lower Back Pain, Depression, Anxiety, Conjunctivitis, Sinusitis, Ear Infection, Strep Throat, Chickenpox, Hepatitis, Kidney Stones, GERD, IBS, Lupus, Fibromyalgia, Appendicitis, Gallstones, Pancreatitis, Cataracts, Glaucoma, Parkinson's, Alzheimer's

### Skin Disease Detection
- **Status**: Model not included (optional)
- **Expected**: TensorFlow/Keras model (`.h5` format)
- **Location**: `backend/trained_models/skin_model.h5`
- **Classes**: Actinic Keratoses, Basal Cell Carcinoma, Benign Keratosis, Dermatofibroma, Melanocytic Nevi, Melanoma, Vascular Lesions, Unknown

### Medical Report Analysis
- **Method**: Rule-based pattern extraction (pdfplumber)
- **No external API required** - works offline
- **Extracted values**: Hemoglobin, Glucose, Cholesterol, Blood Pressure, Heart Rate, WBC, RBC, Platelets, Temperature, BMI, Creatinine, Urea, Bilirubin

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/accounts/register/` | Register new user |
| POST | `/api/accounts/login/` | Login (returns JWT tokens) |
| POST | `/api/accounts/token/refresh/` | Refresh access token |
| GET | `/api/accounts/profile/` | Get user profile |
| PATCH | `/api/accounts/profile/` | Update profile |

### Disease Prediction
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/disease/symptoms/` | List all available symptoms |
| POST | `/api/disease/predict/` | Predict disease from symptoms |
| GET | `/api/disease/predictions/history/` | Get prediction history |

### Medical Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reports/upload/` | Upload PDF report |
| GET | `/api/reports/` | List all reports |
| GET | `/api/reports/{id}/` | Get report details |
| DELETE | `/api/reports/{id}/` | Delete a report |

### Skin Detection
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/skin/predict/` | Upload image for analysis |
| GET | `/api/skin/history/` | Get skin prediction history |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/` | Get dashboard data with health score |

## 🧪 Testing

### Run Backend Checks
```cmd
cd backend
python manage.py check
```

### Run Frontend Build
```cmd
cd frontend
npm run build
```

### Manual API Testing
```python
import requests

# Login
r = requests.post('http://127.0.0.1:8000/api/accounts/login/', 
    json={'username': 'youruser', 'password': 'yourpass'})
tokens = r.json()
headers = {'Authorization': 'Bearer ' + tokens['access']}

# Predict disease
r = requests.post('http://127.0.0.1:8000/api/disease/predict/', 
    json={'symptoms': ['fever', 'cough', 'headache']}, headers=headers)
print(r.json())

# Get dashboard
r = requests.get('http://127.0.0.1:8000/api/dashboard/', headers=headers)
print(r.json())
```

## ⚠️ Limitations & Known Issues

1. **Disease Prediction Model** - Trained on synthetic data (~68% accuracy). Not medically validated.
2. **Skin Disease Detection** - Requires separate trained model (not included). Shows "model not configured" message when unavailable.
3. **Medical Report Analysis** - Rule-based extraction only. No external AI API configured by default.
3. **Health Score** - Educational wellness score only, not a medical assessment.
4. **SQLite Default** - For production, configure MySQL/PostgreSQL via `DATABASE_URL`.
5. **No HTTPS** - Development only. Use reverse proxy (nginx) with SSL for production.

## 🏥 Medical Disclaimer

> **MediVerse AI provides AI-generated health information for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.** Always seek the advice of a qualified healthcare provider with any questions regarding a medical condition. Never disregard professional medical advice or delay seeking it because of something you have read or seen in this application.

## 📋 Commands Summary

```cmd
# Backend
cd backend
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python -m disease.ml.train
python manage.py runserver

# Frontend
cd frontend
npm install
npm run dev          # Development
npm run build        # Production build
```

## 📝 License

Educational project - not for production medical use.

---

**Built with**: Django 4.2, Django REST Framework, React 18, Vite, Tailwind CSS, scikit-learn, pdfplumber