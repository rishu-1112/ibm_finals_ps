from pydantic import BaseModel, Field
from datetime import date
from typing import Optional


# Village Schemas
class VillageBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    district: str = Field(..., min_length=1, max_length=255)
    state: str = Field(..., min_length=1, max_length=255)
    population: int = Field(..., gt=0)
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class VillageCreate(VillageBase):
    pass


class VillageUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    district: Optional[str] = Field(None, min_length=1, max_length=255)
    state: Optional[str] = Field(None, min_length=1, max_length=255)
    population: Optional[int] = Field(None, gt=0)
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class Village(VillageBase):
    id: int
    
    class Config:
        from_attributes = True


# Health Record Schemas
class HealthRecordBase(BaseModel):
    village_id: int = Field(..., gt=0)
    record_date: date
    disease_type: str = Field(..., min_length=1, max_length=255)
    cases_reported: int = Field(default=0, ge=0)
    deaths_reported: int = Field(default=0, ge=0)
    vaccinations_given: int = Field(default=0, ge=0)
    notes: Optional[str] = None


class HealthRecordCreate(HealthRecordBase):
    pass


class HealthRecordUpdate(BaseModel):
    village_id: Optional[int] = Field(None, gt=0)
    record_date: Optional[date] = None
    disease_type: Optional[str] = Field(None, min_length=1, max_length=255)
    cases_reported: Optional[int] = Field(None, ge=0)
    deaths_reported: Optional[int] = Field(None, ge=0)
    vaccinations_given: Optional[int] = Field(None, ge=0)
    notes: Optional[str] = None


class HealthRecord(HealthRecordBase):
    id: int
    
    class Config:
        from_attributes = True


# Health Worker Schemas
class HealthWorkerBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    role: str = Field(..., min_length=1, max_length=100)
    contact_number: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=255)
    assigned_district: str = Field(..., min_length=1, max_length=255)
    assigned_state: str = Field(..., min_length=1, max_length=255)


class HealthWorkerCreate(HealthWorkerBase):
    pass


class HealthWorkerUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    role: Optional[str] = Field(None, min_length=1, max_length=100)
    contact_number: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=255)
    assigned_district: Optional[str] = Field(None, min_length=1, max_length=255)
    assigned_state: Optional[str] = Field(None, min_length=1, max_length=255)


class HealthWorker(HealthWorkerBase):
    id: int
    
    class Config:
        from_attributes = True
