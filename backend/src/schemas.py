from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    Name: str
    Email: EmailStr
    Password: str
    Role_Type: str  

class UserLogin(BaseModel):
    Email: EmailStr
    Password: str

class AnchorProfileUpdate(BaseModel):
    Specialization: str
    Past_Work_Links: str
    Base_Fee: int
    Languages_Spoken: str
    Average_Rating: float

class CreateEvent(BaseModel):
    Event_Title: str
    Description: str
    Event_Date: datetime
    Location: str

class UpdatEvent(BaseModel):
    Event_Title: Optional[str] = None
    Description: Optional[str] = None
    Event_Date: Optional[datetime] = None
    Location: Optional[str] = None