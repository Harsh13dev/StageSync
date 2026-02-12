from src.db import db_models
from sqlalchemy import and_
from fastapi import HTTPException 
from src import schemas

def create_event(db, host_id, event_data: schemas.CreateEvent):
    user = db.query(db_models.Dim_Users).filter(db_models.Dim_Users.User_ID == host_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.Role_Type != 'Host':
        raise HTTPException(status_code=403, detail="Only hosts can create an event")
    
    data = event_data.model_dump()
    
    new_event = db_models.Dim_Events(
        Host_ID = host_id,
        Event_Title = data['Event_Title'],
        Description = data['Description'],
        Event_Date = data['Event_Date'],
        Location = data['Location'],
        Status = 'Open'
    )

    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return new_event


def hire_anchor(db, application_id, host_id):
    application = db.query(db_models.Fact_Assignments).filter(db_models.Fact_Assignments.Unique_ID == application_id).first()

    if not application:
        raise HTTPException(status_code=404, details="Application not found.")
    
    event = db.query(db_models.Dim_Events).filter(db_models.Dim_Events.Event_ID == application.Event_ID).first()

    if event.Host_ID != host_id:
        raise HTTPException(status_code=403, detail="You are not authorized to manage this event.")

    if event.Status == 'Confirmed':
        raise HTTPException(status_code=400, detail="An anchor has already been hired for this event.")
    
    application.Application_Status = "Accepted"
    event.Status = "Confirmed"

    other_applications = db.query(db_models.Fact_Assignments).filter(
        and_(
            db_models.Fact_Assignments.Event_ID == event.Event_ID,
            db_models.Fact_Assignments.Unique_ID != application_id,
            db_models.Fact_Assignments.Application_Status == 'Pending'
        )
    ).all()

    for a in other_applications:
        a.Application_Status = 'Rejected'

    db.commit()
    db.refresh(application)
    db.refresh(event)

    return {"message": "Anchor hired successfully."}


def get_host_dashboard(db, host_id):
    host = db.query(db_models.Dim_Users).filter(db_models.Dim_Users.User_ID == host_id).first()

    if not host or host.Role_Type != 'Host':
        raise HTTPException(status_code=404, detail="Host not found.")
    
    dashboard_data = []

    for event in host.events_created:
        application_list = []

        for application in event.assignments:
            if application.Application_Status in ["Pending", "Accepted"]:
                anchor_profile = application.anchor
                anchor_user = anchor_profile.user

                application_list.append({
                    "application_id": application.Unique_ID, 
                    "status": application.Application_Status,
                    "anchor_name": anchor_user.Name,
                    "email": anchor_user.Email,
                    "specialization": anchor_profile.Specialization,
                    "language_spoken": anchor_profile.Languages_Spoken,
                    "rating": anchor_profile.Average_Rating,
                    "quote_price": anchor_profile.Base_Fee, 
                    "past_work": anchor_profile.Past_Work_Links
                })
        event_summary = {
            "event_id": event.Event_ID,
            "title": event.Event_Title,
            "date": event.Event_Date,
            "status": event.Status,
            "applicants": application_list 
        }
        dashboard_data.append(event_summary)

    return dashboard_data


def update_event(db, host_id, event_id, event_data: schemas.UpdatEvent):
    host = db.query(db_models.Dim_Users).filter(db_models.Dim_Users.User_ID == host_id).first()

    if not host or host.Role_Type != 'Host':
        raise HTTPException(status_code=404, detail="Host not found.")
    
    event = db.query(db_models.Dim_Events).filter(
        and_(
        db_models.Dim_Events.Event_ID == event_id,
        db_models.Dim_Events.Host_ID == host_id
        )
    ).first()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    data = event_data.model_dump()

    if data['Event_Title'] == None:
        data['Event_Date'] = event.Event_Title
    if data['Description'] == None:
        data['Description'] = event.Description
    if data['Event_Date'] == None:
        data['Event_Date'] = event.Event_Date
    if data['Location'] == None:
        data['Location'] = event.Location

    event.Event_Title = data['Event_Title']
    event.Description = data['Description']
    event.Event_Date = data['Event_Date']
    event.Location = data['Location']

    db.commit()
    db.refresh(event)
    return event


def delete_event(db, user_id, event_id):
    host = db.query(db_models.Dim_Users).filter(db_models.Dim_Users.User_ID == user_id).first()

    if not host or host.Role_Type != 'Host':
        raise HTTPException(status_code=404, detail="Host not found.")
    
    event = db.query(db_models.Dim_Events).filter(
        and_(
        db_models.Dim_Events.Event_ID == event_id,
        db_models.Dim_Events.Host_ID == user_id
        )
    )

    event_data = event.first()

    if not event_data:
        raise HTTPException(status_code=404, detail="Event not found")
    
    event.delete(synchronize_session=False)
    db.commit()
    return {'message': 'Event deleted successful'}