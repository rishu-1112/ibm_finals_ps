from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import date

from backend.database import Base


class Village(Base):
    """Village entity model"""
    __tablename__ = "villages"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    district = Column(String(255), nullable=False, index=True)
    state = Column(String(255), nullable=False, index=True)
    population = Column(Integer, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # Relationships
    health_records = relationship("HealthRecord", back_populates="village", cascade="all, delete-orphan")


class HealthRecord(Base):
    """Health record entity model"""
    __tablename__ = "health_records"
    
    id = Column(Integer, primary_key=True, index=True)
    village_id = Column(Integer, ForeignKey("villages.id"), nullable=False, index=True)
    record_date = Column(Date, nullable=False, default=date.today, index=True)
    disease_type = Column(String(255), nullable=False, index=True)
    cases_reported = Column(Integer, nullable=False, default=0)
    deaths_reported = Column(Integer, nullable=False, default=0)
    vaccinations_given = Column(Integer, nullable=False, default=0)
    notes = Column(Text, nullable=True)
    
    # Relationships
    village = relationship("Village", back_populates="health_records")


class HealthWorker(Base):
    """Health worker entity model"""
    __tablename__ = "health_workers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    role = Column(String(100), nullable=False, index=True)
    contact_number = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True, unique=True, index=True)
    assigned_district = Column(String(255), nullable=False, index=True)
    assigned_state = Column(String(255), nullable=False, index=True)
