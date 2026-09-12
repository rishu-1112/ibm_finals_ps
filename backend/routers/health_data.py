from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import logging

from backend.database import get_db
from backend import models, schemas

logger = logging.getLogger(__name__)

router = APIRouter()


# Village endpoints
@router.post("/villages", response_model=schemas.Village, status_code=status.HTTP_201_CREATED)
def create_village(village: schemas.VillageCreate, db: Session = Depends(get_db)):
    """Create a new village"""
    try:
        db_village = models.Village(**village.model_dump())
        db.add(db_village)
        db.commit()
        db.refresh(db_village)
        logger.info(f"Created village: {db_village.name}")
        return db_village
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating village: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create village")


@router.get("/villages", response_model=List[schemas.Village])
def get_villages(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all villages"""
    villages = db.query(models.Village).offset(skip).limit(limit).all()
    return villages


@router.get("/villages/{village_id}", response_model=schemas.Village)
def get_village(village_id: int, db: Session = Depends(get_db)):
    """Get a specific village by ID"""
    village = db.query(models.Village).filter(models.Village.id == village_id).first()
    if not village:
        raise HTTPException(status_code=404, detail="Village not found")
    return village


@router.put("/villages/{village_id}", response_model=schemas.Village)
def update_village(village_id: int, village_update: schemas.VillageUpdate, db: Session = Depends(get_db)):
    """Update a village"""
    db_village = db.query(models.Village).filter(models.Village.id == village_id).first()
    if not db_village:
        raise HTTPException(status_code=404, detail="Village not found")
    
    update_data = village_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_village, field, value)
    
    try:
        db.commit()
        db.refresh(db_village)
        logger.info(f"Updated village: {db_village.name}")
        return db_village
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating village: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update village")


@router.delete("/villages/{village_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_village(village_id: int, db: Session = Depends(get_db)):
    """Delete a village"""
    db_village = db.query(models.Village).filter(models.Village.id == village_id).first()
    if not db_village:
        raise HTTPException(status_code=404, detail="Village not found")
    
    try:
        db.delete(db_village)
        db.commit()
        logger.info(f"Deleted village: {db_village.name}")
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting village: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete village")


# Health Record endpoints
@router.post("/health-records", response_model=schemas.HealthRecord, status_code=status.HTTP_201_CREATED)
def create_health_record(record: schemas.HealthRecordCreate, db: Session = Depends(get_db)):
    """Create a new health record"""
    # Verify village exists
    village = db.query(models.Village).filter(models.Village.id == record.village_id).first()
    if not village:
        raise HTTPException(status_code=404, detail="Village not found")
    
    try:
        db_record = models.HealthRecord(**record.model_dump())
        db.add(db_record)
        db.commit()
        db.refresh(db_record)
        logger.info(f"Created health record for village ID: {record.village_id}")
        return db_record
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating health record: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create health record")


@router.get("/health-records", response_model=List[schemas.HealthRecord])
def get_health_records(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all health records"""
    records = db.query(models.HealthRecord).offset(skip).limit(limit).all()
    return records


@router.get("/health-records/{record_id}", response_model=schemas.HealthRecord)
def get_health_record(record_id: int, db: Session = Depends(get_db)):
    """Get a specific health record by ID"""
    record = db.query(models.HealthRecord).filter(models.HealthRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Health record not found")
    return record


@router.put("/health-records/{record_id}", response_model=schemas.HealthRecord)
def update_health_record(record_id: int, record_update: schemas.HealthRecordUpdate, db: Session = Depends(get_db)):
    """Update a health record"""
    db_record = db.query(models.HealthRecord).filter(models.HealthRecord.id == record_id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="Health record not found")
    
    update_data = record_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_record, field, value)
    
    try:
        db.commit()
        db.refresh(db_record)
        logger.info(f"Updated health record ID: {record_id}")
        return db_record
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating health record: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update health record")


@router.delete("/health-records/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_health_record(record_id: int, db: Session = Depends(get_db)):
    """Delete a health record"""
    db_record = db.query(models.HealthRecord).filter(models.HealthRecord.id == record_id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="Health record not found")
    
    try:
        db.delete(db_record)
        db.commit()
        logger.info(f"Deleted health record ID: {record_id}")
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting health record: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete health record")


# Health Worker endpoints
@router.post("/health-workers", response_model=schemas.HealthWorker, status_code=status.HTTP_201_CREATED)
def create_health_worker(worker: schemas.HealthWorkerCreate, db: Session = Depends(get_db)):
    """Create a new health worker"""
    try:
        db_worker = models.HealthWorker(**worker.model_dump())
        db.add(db_worker)
        db.commit()
        db.refresh(db_worker)
        logger.info(f"Created health worker: {db_worker.name}")
        return db_worker
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating health worker: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create health worker")


@router.get("/health-workers", response_model=List[schemas.HealthWorker])
def get_health_workers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all health workers"""
    workers = db.query(models.HealthWorker).offset(skip).limit(limit).all()
    return workers


@router.get("/health-workers/{worker_id}", response_model=schemas.HealthWorker)
def get_health_worker(worker_id: int, db: Session = Depends(get_db)):
    """Get a specific health worker by ID"""
    worker = db.query(models.HealthWorker).filter(models.HealthWorker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Health worker not found")
    return worker


@router.put("/health-workers/{worker_id}", response_model=schemas.HealthWorker)
def update_health_worker(worker_id: int, worker_update: schemas.HealthWorkerUpdate, db: Session = Depends(get_db)):
    """Update a health worker"""
    db_worker = db.query(models.HealthWorker).filter(models.HealthWorker.id == worker_id).first()
    if not db_worker:
        raise HTTPException(status_code=404, detail="Health worker not found")
    
    update_data = worker_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_worker, field, value)
    
    try:
        db.commit()
        db.refresh(db_worker)
        logger.info(f"Updated health worker: {db_worker.name}")
        return db_worker
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating health worker: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update health worker")


@router.delete("/health-workers/{worker_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_health_worker(worker_id: int, db: Session = Depends(get_db)):
    """Delete a health worker"""
    db_worker = db.query(models.HealthWorker).filter(models.HealthWorker.id == worker_id).first()
    if not db_worker:
        raise HTTPException(status_code=404, detail="Health worker not found")
    
    try:
        db.delete(db_worker)
        db.commit()
        logger.info(f"Deleted health worker: {db_worker.name}")
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting health worker: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete health worker")
