# Rural Health Planning System

A backend system for managing and analyzing rural village health data to support proactive healthcare planning and resource allocation.

## Product Vision

A future where every village's health needs are understood, predicted, and addressed proactively through intelligent data use, eliminating preventable health inequities and ensuring no village is left behind in healthcare access and outcomes.

## Target Audience

- District health officers
- State health administrators
- Community health worker supervisors
- Healthcare policy makers responsible for rural health planning and resource allocation

## Core Features

- **Village Management**: CRUD operations for managing village data including location, population, and demographics
- **Health Records**: Track disease cases, deaths, and vaccinations by village and date
- **Health Worker Management**: Manage health worker assignments and contact information

## Technology Stack

- **Backend Framework**: FastAPI (Python)
- **Database**: SQLite (easily upgradeable to PostgreSQL)
- **ORM**: SQLAlchemy
- **Validation**: Pydantic
- **Architecture**: Modular Monolith

## Prerequisites

- Python 3.9 or higher
- pip (Python package manager)

## Installation

1. Clone the repository or navigate to the project directory

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. Install dependencies:
```bash
pip install -r backend/requirements.txt
```

5. Create environment file:
```bash
cp .env.example .env
```

6. Update the `.env` file with your configuration (especially change the SECRET_KEY in production)

## Running the Application

1. Make sure your virtual environment is activated

2. Start the FastAPI server:
```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

3. The API will be available at:
   - API: http://localhost:8000
   - Interactive API Documentation (Swagger): http://localhost:8000/docs
   - Alternative API Documentation (ReDoc): http://localhost:8000/redoc

## API Endpoints

### Villages
- `POST /api/v1/villages` - Create a new village
- `GET /api/v1/villages` - Get all villages (with pagination)
- `GET /api/v1/villages/{village_id}` - Get a specific village
- `PUT /api/v1/villages/{village_id}` - Update a village
- `DELETE /api/v1/villages/{village_id}` - Delete a village

### Health Records
- `POST /api/v1/health-records` - Create a new health record
- `GET /api/v1/health-records` - Get all health records (with pagination)
- `GET /api/v1/health-records/{record_id}` - Get a specific health record
- `PUT /api/v1/health-records/{record_id}` - Update a health record
- `DELETE /api/v1/health-records/{record_id}` - Delete a health record

### Health Workers
- `POST /api/v1/health-workers` - Create a new health worker
- `GET /api/v1/health-workers` - Get all health workers (with pagination)
- `GET /api/v1/health-workers/{worker_id}` - Get a specific health worker
- `PUT /api/v1/health-workers/{worker_id}` - Update a health worker
- `DELETE /api/v1/health-workers/{worker_id}` - Delete a health worker

### System
- `GET /` - Root endpoint with API information
- `GET /health` - Health check endpoint

## Project Structure

```
.
├── backend/
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration management
│   ├── database.py          # Database connection and session management
│   ├── models.py            # SQLAlchemy database models
│   ├── schemas.py           # Pydantic schemas for validation
│   ├── routers/
│   │   └── health_data.py   # API route handlers
│   └── requirements.txt     # Python dependencies
├── .env.example             # Example environment variables
└── README.md               # This file
```

## Database Schema

### Villages
- id (Primary Key)
- name
- district
- state
- population
- latitude
- longitude

### Health Records
- id (Primary Key)
- village_id (Foreign Key)
- record_date
- disease_type
- cases_reported
- deaths_reported
- vaccinations_given
- notes

### Health Workers
- id (Primary Key)
- name
- role
- contact_number
- email
- assigned_district
- assigned_state

## Development

The application uses SQLite by default for easy setup. The database file (`rural_health.db`) will be created automatically on first run.

To use PostgreSQL in production, update the `DATABASE_URL` in your `.env` file:
```
DATABASE_URL=postgresql://user:password@localhost/dbname
```

## Security Notes

- Change the `SECRET_KEY` in production
- Use environment variables for sensitive configuration
- Enable HTTPS in production
- Configure CORS appropriately for your frontend domain
- Implement authentication and authorization as needed

## License

This project is part of a rural health planning initiative.
