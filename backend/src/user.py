from src.db import db_models
from sqlalchemy import and_
from fastapi import HTTPException 
from src import schemas

def create_user(db, user_data: schemas.UserCreate):
    existing_user = db.query(db_models.Dim_Users).filter(db_models.Dim_Users.Email == user_data.Email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exist.")

    new_user = db_models.Dim_Users(**user_data.model_dump())
    db.add(new_user)
    db.flush()

    if user_data.Role_Type == 'Anchor':
        new_profile = db_models.Dim_Anchor_Profiles(
            User_ID=new_user.User_ID,
            Specialization="Not Specified",
            Languages_Spoken = "Not Specified",
            Base_Fee=0,
            Average_Rating=0.0
        )
        db.add(new_profile)

    db.commit()
    db.refresh(new_user)
    return new_user


def login(db, credentials: schemas.UserLogin):
    user = db.query(db_models.Dim_Users).filter(db_models.Dim_Users.Email == credentials.Email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    if user.Password != credentials.Password:
        raise HTTPException(status_code=404, detail="Invalid password.")
    
    return {
        "message": "Login Successful",
        "user_id": user.User_ID,
        "role": user.Role_Type
    }


def get_events_feed(db, user_id):
    user = db.query(db_models.Dim_Users).filter(db_models.Dim_Users.User_ID == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.Role_Type == 'Anchor':
        events = db.query(db_models.Dim_Events).filter(db_models.Dim_Events.Status == 'Open').all()
        return events
    
    elif user.Role_Type == 'User':
        events = db.query(db_models.Dim_Events).filter(db_models.Dim_Events.Status == 'Confirmed').all()
        return events
    
    elif user.Role_Type == 'Host':
        events = db.query(db_models.Dim_Events).filter(db_models.Dim_Events.Host_ID == user_id).all()
        return events
    
    else:
        return []
    

def book_ticket(db, user_id, event_id):
    user = db.query(db_models.Dim_Users).filter(db_models.Dim_Users.User_ID == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    event = db.query(db_models.Dim_Events).filter(db_models.Dim_Events.Event_ID == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")
    
    if event.Status != "Confirmed":
        raise HTTPException(status_code=400, detail="Booking is not yet open for this event.")
    
    existing_booking = db.query(db_models.Dim_Tickets).filter(
        and_(
            db_models.Dim_Tickets.User_ID == user_id,
            db_models.Dim_Tickets.Event_ID == event_id
        )
    ).first()

    if existing_booking:
        raise HTTPException(status_code=400, detail="You have already booked a ticket for this event.")
    
    new_booking = db_models.Dim_Tickets(
        Event_ID = event_id,
        User_ID = user_id
    )

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    return {"message": "Ticket booked successfully", "ticket_id": new_booking.Ticket_ID}