from apscheduler.schedulers.background import BackgroundScheduler
from contextlib import asynccontextmanager
from datetime import date, datetime, timedelta, timezone
import math
import threading
import time
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import Engine, select
from sqlalchemy.orm import Session,joinedload
from websockets import Router
from database import SessionLocal
from auth import verify_password, hash_password, create_access_token
from schemas import Angles, Coordinates, IngredientOut, ProgramareCreate, ScheduleByIngredientCreate, ServoScheduleCreate, UserLogin, UserCreate, Token
from models import Ingredient, Programare, ServoSchedule, User
import serial
from fastapi import APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi_utils.tasks import repeat_every




app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],
)

serial_port="COM6"
ser=serial.Serial(serial_port,9600,timeout=2)


router=APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



def compute_angles(x: float, y: float, z: float, grip: float) -> Angles:
    grip = max(0, min(90, grip))
    L1 = 100
    L2 = 100

    base = math.degrees(math.atan2(y, x))
    r = math.hypot(x, y)
    h = z
    D = math.hypot(r, h)

    if D > (L1 + L2):
        raise ValueError("Punctul este în afara razei brațului")

    cos_elbow = (L1**2 + L2**2 - D**2) / (2 * L1 * L2)
    elbow = math.acos(max(-1, min(1, cos_elbow)))
    elbow_deg = math.degrees(elbow)

    angle_a = math.atan2(h, r)
    angle_b = math.acos(max(-1, min(1, (L1**2 + D**2 - L2**2) / (2 * L1 * D))))
    shoulder = angle_a + angle_b
    shoulder_deg = math.degrees(shoulder)

    base = max(0, min(180, base))
    shoulder_deg = max(0, min(180, shoulder_deg))
    elbow_deg = max(0, min(180, elbow_deg))

    return Angles(
        base=base,
        shoulder=shoulder_deg,
        elbow=elbow_deg,
        gripper=grip
    )

def run_datetime_schedules():
    db = SessionLocal()
    now = datetime.now(timezone.utc)
    ready_time = now 

    schedules = db.query(ServoSchedule).filter(
        ServoSchedule.executed == False,
        ServoSchedule.scheduled_time <= ready_time
    ).all()

    if not schedules:
        print("[DATETIME SCHEDULER] No tasks ready.")
        db.close()
        return

    print(f"[DATETIME SCHEDULER] Found {len(schedules)} to execute")

    for sched in schedules:
        try:
            grip_open = 60
            angles = compute_angles(sched.x, sched.y, sched.z, grip_open)
            data_string = f"{angles.base:.2f},{angles.shoulder:.2f},{angles.elbow:.2f},{angles.gripper:.2f}\n"
            print(f"[DATETIME SCHEDULER] Sending to Arduino: {data_string.strip()}")

            if ser.is_open:
                ser.write(data_string.encode())
                ser.flush()
                time.sleep(0.5)
                sched.executed = True
                db.commit()
            else:
                print("[SERIAL ERROR] Port is not open.")

        except Exception as e:
            print(f"[DATETIME SCHEDULER] Failed to execute schedule ID {sched.id}: {e}")
    db.close()



    
@app.on_event("startup")
@repeat_every(seconds=100)
def run_schedule_checker():
    run_datetime_schedules()


@app.post("/register", response_model=Token)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = User(email=user_data.email, hashed_password=hash_password(user_data.password))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    access_token = create_access_token(data={"sub": new_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_access_token(data={"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

@router.post("/stop")  # ✅ lowercase 'router' used here
def stop_arm():
    try:
        ser.write(b"STOP\n")
        return {"status": "STOP command sent"}
    except Exception as e:
        return {"error": str(e)}



@app.post("/get_angles", response_model=Angles)
def calculate_angles(coords: Coordinates):
    x, y, z = coords.x, coords.y, coords.z
    grip = max(0, min(90, coords.grip))  # Clamp gripper

    # Lungimile segmentelor (în cm)
    L1 = 10.0  # umăr
    L2 = 10.0  # cot

    # 1. Unghiul bazei în plan XY
    base = math.degrees(math.atan2(y, x))

    # 2. Coordonate în plan XZ (după rotirea bazei)
    r = math.hypot(x, y)  # distanța în plan XY
    h = z  # înălțimea Z

    D = math.hypot(r, h)  # distanța totală de la umăr la punctul țintă
    if D > (L1 + L2):
        raise HTTPException(status_code=400, detail="Punctul este în afara razei brațului")

    # 3. Legea cosinusului pentru unghiul cotului
    cos_elbow = (L1*2 + L2**2 - D*2) / (2 * L1 * L2)
    elbow = math.acos(cos_elbow)
    elbow_deg = math.degrees(elbow)

    # 4. Unghiul umărului
    angle_a = math.atan2(h, r)
    angle_b = math.acos((L1**2 + D**2 - L2**2) / (2 * L1 * D))
    shoulder = angle_a + angle_b
    shoulder_deg = math.degrees(shoulder)

    # 5. Pregătire date pentru Arduino
    base = max(0, min(180, base))
    shoulder_deg = max(0, min(180, shoulder_deg))
    elbow_deg = max(0, min(180, elbow_deg))

    data_string = f"{base:.2f},{shoulder_deg:.2f},{elbow_deg:.2f},{grip:.2f}\n"
    print("Trimitem la Arduino:", data_string)
    ser.write(data_string.encode())

    return Angles(base=base, shoulder=shoulder_deg, elbow=elbow_deg, gripper=grip)

@app.post("/manual-control",response_model=Angles)

def manual_control(angles:Angles):
    base=max(0,min(180,angles.base))
    shoulder=max(0,min(180,angles.shoulder))
    elbow=max(0,min(180,angles.elbow))
    gripper=max(0,min(90,angles.gripper))

    data_string = f"{base:.2f},{shoulder:.2f},{elbow:.2f},{gripper:.2f}\n"
    print("Trimitere la arduino:",data_string)
    
    ser.write(data_string.encode())
    return {"base": base, "shoulder":shoulder,"elbow":elbow,"gripper":gripper  }


@app.get("/ingredients", response_model=list[IngredientOut])
def get_ingredients(db: Session = Depends(get_db)):
    return db.execute(select(Ingredient)).scalars().all()


@app.post("/schedule")
def schedule_movement(data: ProgramareCreate, db: Session = Depends(get_db)):
    ingredient = db.get(Ingredient, data.ingredient_out)
    if not ingredient or ingredient.in_stock <= 0:
        raise HTTPException(status_code=400, detail="Ingredient not valid or out of stock")

    new_schedule = Programare(
        hour=data.hour,
        minute=data.minute,
        ingredient_id=data.ingredient_out,
        executed=False
    )
    db.add(new_schedule)
    db.commit()

    return {"message": "Movement scheduled successfully."}


@app.get("/schedules")
def get_schedules(db: Session = Depends(get_db)):
    schedules = db.query(ServoSchedule).all()
    output = []
    for s in schedules:
        ingredient = db.query(Ingredient).filter_by(x=s.x, y=s.y, z=s.z).first()
        ingredient_id = ingredient.id if ingredient else None
        output.append({
            "id": s.id,
            "ingredient_id": ingredient_id,
            "scheduled_time": s.scheduled_time.isoformat(),
            "executed": s.executed
        })
    return output


@app.post("/schedule-servo-datetime")
def schedule_servo_by_ingredient(data: ScheduleByIngredientCreate, db: Session = Depends(get_db)):
    scheduled_time = data.scheduled_time

    
    if scheduled_time.tzinfo is None:
        scheduled_time = scheduled_time.replace(tzinfo=timezone.utc)  # Assume UTC if missing
    else:
        scheduled_time = scheduled_time.astimezone(timezone.utc)  # Normalize to UTC

    now = datetime.now(timezone.utc)
    print("Received scheduled_time (UTC):", scheduled_time)  # Debug log
    print("Current server time (UTC):", now)  # Debug log

    # ✅ Add a buffer so that anything within 5 seconds is not accepted (prevents immediate trigger)
    if scheduled_time <= now + timedelta(seconds=5):
        raise HTTPException(status_code=400, detail="Scheduled time must be at least 5 seconds in the future.")

    ingredient = db.query(Ingredient).filter(Ingredient.id == data.ingredient_id).first()
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")

    schedule = ServoSchedule(
        x=ingredient.x,
        y=ingredient.y,
        z=ingredient.z,
        scheduled_time=scheduled_time,
        executed=False
    )
    db.add(schedule)
    db.commit()
    return {"message": "Servo movement scheduled", "scheduled_time": str(scheduled_time)}

@app.get("/test-servo")
def  test_servo():
    ser.write(b"0,0,0,0\n")

def reset_schedules(db: Session = Depends(get_db)):
    count = db.query(Programare).update({Programare.executed: False})
    db.commit()
    return {"reset_count": count}


@app.post("/make_coffee")
def make_coffee():
    positions = [
        (50, 0, 30, 90),        # wakeup
        (60, 100, 60, 90),      # press button
        ("wait", 3),
        (150, 40, 20, 90),      # move to cup
        ("grip", 40),
        (100, 100, 80, 40),     # move under dispenser
        ("wait", 20),
        (30, 10, 30, 40),       # move to tray
        ("grip", 90),
    ]

    for step in positions:
        if step[0] == "wait":
            cmd = f"WAIT:{step[1]}\n"
        elif step[0] == "grip":
            cmd = f"GRIP:{step[1]}\n"
        else:
            x, y, z, grip = step
            try:
                angles = compute_angles(x, y, z, grip)
            except ValueError as e:
                print(f"[ERROR] {e}")
                continue

            cmd = f"{int(angles.base)},{int(angles.shoulder)},{int(angles.elbow)},{int(angles.gripper)}\n"

        print("[FASTAPI] Sending:", cmd.strip())
        ser.write(cmd.encode())
        ser.flush()

       
        start_time = time.time()
        while time.time() - start_time < 20:  
            if ser.in_waiting:
                line = ser.readline().decode(errors="ignore").strip()
                print("[ARDUINO]", line)
                if "OK" in line:
                    break
            time.sleep(0.1)
        else:
            print("[ERROR] No OK received for:", cmd.strip())

    return {"message": "Coffee routine finished"}
