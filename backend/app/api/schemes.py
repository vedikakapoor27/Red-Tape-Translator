from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.models import GovernmentScheme
from app.schemas.schemas import SchemeOut

router = APIRouter(prefix="/schemes", tags=["schemes"])

@router.get("/", response_model=List[SchemeOut])
def list_schemes(
    category: str = None,
    db: Session = Depends(get_db),
):
    q = db.query(GovernmentScheme).filter(GovernmentScheme.is_active == True)
    if category:
        q = q.filter(GovernmentScheme.category == category)
    return q.all()

@router.get("/{scheme_id}", response_model=SchemeOut)
def get_scheme(scheme_id: str, db: Session = Depends(get_db)):
    scheme = db.query(GovernmentScheme).filter(GovernmentScheme.id == scheme_id).first()
    if not scheme:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Scheme not found")
    return scheme