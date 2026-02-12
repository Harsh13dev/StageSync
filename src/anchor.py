from src.db import db_models
from sqlalchemy import and_
from fastapi import HTTPException 
from src import schemas

def update_anchor_profile(db, user_id, profile_data: schemas.AnchorProfileUpdate):
    profile = db.query(db_models.Dim_Anchor_Profiles).filter(db_models.Dim_Anchor_Profiles.User_ID == user_id).first()

    if not profile:
        raise HTTPException(status_code=404, detail="User not found")
    
    data = profile_data.model_dump()

    profile.Specialization = data['Specialization']
    profile.Base_Fee = data['Base_Fee']
    profile.Average_Rating = data['Average_Rating']
    profile.Languages_Spoken = data['Languages_Spoken']
    profile.Past_Work_Links = data['Past_Work_Links']

    db.commit()
    db.refresh(profile)
    return profile


def apply_event(db, user_id, event_id):
    user = db.query(db_models.Dim_Anchor_Profiles).filter(db_models.Dim_Anchor_Profiles.User_ID == user_id).first()

    if not user:
        raise HTTPException(status_code=403, detail="Only registered Anchors can apply.")
    
    event = db.query(db_models.Dim_Events).filter(db_models.Dim_Events.Event_ID == event_id).first()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")
    
    if event.Status != 'Open':
        raise HTTPException(status_code=400, detail="This event is no longer accepting applications.")
    
    existing_application = db.query(db_models.Fact_Assignments).filter(
        and_(
            db_models.Fact_Assignments.Event_ID == event_id,
            db_models.Fact_Assignments.Anchor_ID == user.Profile_ID
        )
    ).first()

    if existing_application:
        raise HTTPException(status_code=400, detail="You have already applied for this event.")
    
    new_application = db_models.Fact_Assignments(
        Event_ID = event_id,
        Anchor_ID = user.Profile_ID,
        Host_ID = event.Host_ID,
        Application_Status = 'Pending'
    )

    db.add(new_application)
    db.commit()
    db.refresh(new_application)
    return {"message": "Application submitted successfully", "application_id": new_application.Unique_ID}


def get_anchor_dashboard(db, user_id):
    anchor_profile = db.query(db_models.Dim_Anchor_Profiles).filter(db_models.Dim_Anchor_Profiles.User_ID == user_id).first()

    if not anchor_profile:
        raise HTTPException(status_code=404, detail="Anchor not found.")
    
    dashboard_data = {
        "profile_summary": {
            "name": anchor_profile.user.Name,
            "specialization": anchor_profile.Specialization,
            "language_spoken": anchor_profile.Languages_Spoken,
            "rating": anchor_profile.Average_Rating,
            "quote_price": anchor_profile.Base_Fee, 
            "past_work": anchor_profile.Past_Work_Links
        },
        "my_applications": []
    }

    for a in anchor_profile.applications:
        event = a.event
        host_name = event.host.Name

        dashboard_data["my_applications"].append({
            "application_id": a.Unique_ID,
            "event_title": event.Event_Title,
            "event_date": event.Event_Date,
            "location": event.Location,
            "host_name": host_name,
            "application_status": a.Application_Status, 
            "event_status": event.Status
        })

    return dashboard_data
