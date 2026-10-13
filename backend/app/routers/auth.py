from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, get_current_user
from app.models.user import User
from app.schemas.auth import UserRegister, UserLogin, UserOut, Token, UserUpdate, PasswordChange
from app.services.audit_service import audit_service
from app.services.notification_service import notification_service

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # Check if email is already taken
    existing = db.query(User).filter(User.email == user_in.email.lower().strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    # Force role to 'farmer' unless this is the very first user in an empty database
    role = "farmer"
    user_count = db.query(User).count()
    if user_count == 0:
        role = user_in.role if user_in.role in ["farmer", "admin"] else "admin"

    new_user = User(
        name=user_in.name.strip(),
        email=user_in.email.lower().strip(),
        phone=user_in.phone,
        password_hash=get_password_hash(user_in.password),
        role=role,
        district=user_in.district,
        village=user_in.village
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    audit_service.log(db, "USER_REGISTER", "User", new_user.id, new_user.id, f"Registered role {new_user.role}")
    
    # Welcome notification
    notification_service.create_notification(
        db, new_user.id, "Welcome to Tamil Nadu Smart Farming Assistant!",
        "Start by creating your farm profile under 'My Farm' to receive tailored crop recommendations and irrigation schedules.",
        "SYSTEM"
    )

    access_token = create_access_token(subject=new_user.id, role=new_user.role)
    return Token(access_token=access_token, token_type="bearer", user=UserOut.model_validate(new_user))

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email.lower().strip()).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    audit_service.log(db, "USER_LOGIN", "User", user.id, user.id, "Successful login")
    access_token = create_access_token(subject=user.id, role=user.role)
    return Token(access_token=access_token, token_type="bearer", user=UserOut.model_validate(user))

@router.get("/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)

@router.put("/profile", response_model=UserOut)
def update_profile(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    update_data = user_update.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(current_user, field, val)
    db.commit()
    db.refresh(current_user)
    audit_service.log(db, "UPDATE_PROFILE", "User", current_user.id, current_user.id, "Updated user profile")
    return UserOut.model_validate(current_user)

@router.put("/change-password")
def change_password(
    pwd_data: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(pwd_data.old_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect."
        )
    current_user.password_hash = get_password_hash(pwd_data.new_password)
    db.commit()
    audit_service.log(db, "CHANGE_PASSWORD", "User", current_user.id, current_user.id, "Password updated")
    return {"message": "Password changed successfully."}
