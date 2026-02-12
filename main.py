from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from src.db.database import engine, get_db
from src.db import db_models
from src import anchor, user, host
from src import schemas

app = FastAPI(title="StageSync", description="To create a single digital 'hub' where talent meets opportunity.")

db_models.Base.metadata.create_all(engine)



@app.post("/register", tags=["common"])
def register(data: schemas.UserCreate, db: Session = Depends(get_db)):
    return user.create_user(db=db, user_data=data)

@app.post("/login", tags=["common"])
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    return user.login(db=db, credentials=credentials)

@app.put("/anchor/{user_id}/update-profile", tags=["anchor"])
def update_profile(user_id: int, profile_data: schemas.AnchorProfileUpdate, db: Session = Depends(get_db)):
    return anchor.update_anchor_profile(db=db, user_id=user_id, profile_data=profile_data)

@app.post("/host/{user_id}/create-event", tags=["host"])
def create_event(user_id: int, event_data: schemas.CreateEvent, db: Session = Depends(get_db)):
    return host.create_event(db=db, host_id=user_id, event_data=event_data)

@app.get("/events/feed/{user_id}", tags=["common"])
def get_events(user_id: int, db: Session = Depends(get_db)):
    return user.get_events_feed(db=db, user_id=user_id)

@app.post("/anchor/{user_id}/apply/{event_id}", tags=["anchor"])
def apply_for_event(user_id: int, event_id: int, db: Session = Depends(get_db)):
    return anchor.apply_event(db=db, user_id=user_id, event_id=event_id)

@app.put("/host/{host_id}/hire/{application_id}", tags=["host"])
def hire_anchor(host_id: int, application_id: int, db: Session = Depends(get_db)):
    return host.hire_anchor(db=db, host_id=host_id, application_id=application_id)

@app.get("/host/{host_id}/dashboard", tags=["host"])
def host_dashboard(host_id: int, db: Session = Depends(get_db)):
    return host.get_host_dashboard(db=db, host_id=host_id)

@app.get("/anchor/{user_id}/dashboard", tags=["anchor"])
def anchor_dashboard(user_id: int, db: Session = Depends(get_db)):
    return anchor.get_anchor_dashboard(db=db, user_id=user_id)

@app.post("/user/{user_id}/book/{event_id}", tags=["user"])
def book_ticket(user_id: int, event_id: int, db: Session = Depends(get_db)):
    return user.book_ticket(db=db, user_id=user_id, event_id=event_id)

@app.put("/host/{host_id}/update-event/{event_id}", tags=["host"])
def update_event(host_id: int, event_id: int, event_data: schemas.UpdatEvent, db: Session = Depends(get_db)):
    return host.update_event(db=db, host_id=host_id, event_id=event_id, event_data=event_data)

@app.delete("/host/{host_id}/delete-event/{event_id}", tags=["host"])
def delete_event(host_id: int, event_id: int, db: Session = Depends(get_db)):
    return host.delete_event(db=db, user_id=host_id, event_id=event_id)