import io
from PIL import Image

def test_health_check(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "models" in data

def test_user_registration_and_login(client):
    # Register Farmer
    reg_payload = {
        "name": "Ramanathan Agri",
        "email": "raman@agri.tn.gov.in",
        "phone": "9876543211",
        "password": "SecretPassword123",
        "district": "Madurai",
        "village": "Melur"
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == "raman@agri.tn.gov.in"

    # Login
    login_payload = {
        "email": "raman@agri.tn.gov.in",
        "password": "SecretPassword123"
    }
    log_res = client.post("/api/auth/login", json=login_payload)
    assert log_res.status_code == 200
    token = log_res.json()["access_token"]

    # Profile (/me)
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["name"] == "Ramanathan Agri"

def test_farm_crud(client):
    # Register & Login
    client.post("/api/auth/register", json={
        "name": "Kandasamy Farm",
        "email": "kandasamy@farms.com",
        "password": "Password123",
        "district": "Salem"
    })
    log_res = client.post("/api/auth/login", json={"email": "kandasamy@farms.com", "password": "Password123"})
    token = log_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create farm
    farm_in = {
        "farm_name": "Salem Tapioca Plantation",
        "district": "Salem",
        "taluk": "Omalur",
        "village": "Karuppur",
        "area": 2.5,
        "area_unit": "Acres",
        "soil_type": "Red Loam",
        "irrigation_type": "Drip Irrigation",
        "water_source": "Borewell",
        "current_crop": "Tapioca",
        "season": "Summer"
    }
    res = client.post("/api/farms", json=farm_in, headers=headers)
    assert res.status_code == 201
    farm_id = res.json()["id"]
    assert res.json()["farm_name"] == "Salem Tapioca Plantation"

    # List farms
    list_res = client.get("/api/farms", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # Update farm
    update_res = client.put(f"/api/farms/{farm_id}", json={"farm_name": "Salem Updated Farm"}, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["farm_name"] == "Salem Updated Farm"

def test_crop_recommendation_api(client):
    # Login
    log_res = client.post("/api/auth/login", json={"email": "kandasamy@farms.com", "password": "Password123"})
    token = log_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "nitrogen": 85.0,
        "phosphorus": 45.0,
        "potassium": 50.0,
        "ph": 6.5,
        "temperature": 30.0,
        "humidity": 80.0,
        "rainfall": 1200.0,
        "district": "Thanjavur",
        "season": "Samba"
    }
    res = client.post("/api/crop-recommendation/predict", json=payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "recommended_crop" in data
    assert data["confidence"] > 50
    assert "reason" in data

    # Check history
    hist = client.get("/api/crop-recommendation/history", headers=headers)
    assert hist.status_code == 200
    assert len(hist.json()) >= 1

def test_irrigation_advisory_api(client):
    log_res = client.post("/api/auth/login", json={"email": "kandasamy@farms.com", "password": "Password123"})
    token = log_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "crop": "Tomato",
        "growth_stage": "Flowering",
        "soil_type": "Red Loam",
        "soil_moisture": 28.0,  # Below threshold -> needs irrigation
        "temperature": 32.0,
        "humidity": 55.0,
        "rain_probability": 10.0,
        "land_area": 1.5,
        "irrigation_type": "Drip Irrigation"
    }
    res = client.post("/api/irrigation/advisory", json=payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["irrigation_status"] == "NEEDS IRRIGATION"
    assert "Litres" in data["water_estimate"]

def test_disease_detection_api(client):
    log_res = client.post("/api/auth/login", json={"email": "kandasamy@farms.com", "password": "Password123"})
    token = log_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create dummy in-memory image
    img = Image.new("RGB", (100, 100), color=(34, 139, 34))  # Forest green
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    files = {"file": ("leaf.jpg", buf, "image/jpeg")}
    data = {"crop_name": "Tomato"}

    res = client.post("/api/disease-detection/predict", files=files, data=data, headers=headers)
    assert res.status_code == 200
    result = res.json()
    assert result["crop"] == "Tomato"
    assert "predicted_disease" in result
    assert "confidence" in result
    assert "recommendation" in result

def test_weather_api(client):
    res = client.get("/api/weather/current?district=Coimbatore")
    assert res.status_code == 200
    data = res.json()
    assert data["district"] == "Coimbatore"
    assert "temperature" in data

    forecast = client.get("/api/weather/forecast?district=Thanjavur")
    assert forecast.status_code == 200
    f_data = forecast.json()
    assert len(f_data["forecast"]) == 7
