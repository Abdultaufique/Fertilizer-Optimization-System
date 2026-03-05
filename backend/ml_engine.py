import joblib
import numpy as np
import os

# ─── Load Models ────────────────────────────────────────────
BASE = os.path.dirname(os.path.abspath(__file__))
MODELS = os.path.join(BASE, "models")

fert_model    = joblib.load(os.path.join(MODELS, "fertilizer_model.pkl"))
crop_model    = joblib.load(os.path.join(MODELS, "crop_model.pkl"))
le_soil       = joblib.load(os.path.join(MODELS, "le_soil.pkl"))
le_crop       = joblib.load(os.path.join(MODELS, "le_crop.pkl"))
le_fert       = joblib.load(os.path.join(MODELS, "le_fert.pkl"))
le_crop_label = joblib.load(os.path.join(MODELS, "le_crop_label.pkl"))

# ─── Sustainable Practices per Crop ─────────────────────────
SUSTAINABLE_PRACTICES = {
    "Paddy":        ["Use green manure (Sesbania) before transplanting", "Apply neem-coated urea to reduce nitrogen loss", "Practice alternate wetting and drying to save water", "Use bio-fertilizers like Azospirillum + PSB"],
    "Wheat":        ["Apply zinc sulphate for micronutrient deficiency", "Use slow-release fertilizers for better efficiency", "Practice crop rotation with legumes", "Apply compost to improve organic matter"],
    "Maize":        ["Use drip fertigation for precise nutrient delivery", "Apply potassium during tasseling stage", "Use organic mulch to retain moisture", "Intercrop with legumes for nitrogen fixation"],
    "Cotton":       ["Use foliar spray of micronutrients during boll formation", "Apply farmyard manure before sowing", "Practice integrated nutrient management", "Use Trichoderma-enriched compost"],
    "Sugarcane":    ["Apply phosphate solubilizing bacteria (PSB)", "Use press mud compost for potassium", "Practice trash mulching to conserve moisture", "Split nitrogen application in 3 stages"],
    "Barley":       ["Use balanced NPK with emphasis on phosphorus", "Apply sulphur for protein content improvement", "Practice conservation tillage", "Use cover crops to prevent soil erosion"],
    "Millets":      ["Minimal fertilizer needed — apply only basal dose", "Use vermicompost for organic nutrition", "Practice mixed cropping for biodiversity", "Conserve rainwater through contour farming"],
    "Pulses":       ["Inoculate seeds with Rhizobium bacteria", "Minimal nitrogen needed due to N-fixation", "Apply phosphorus and molybdenum as basal dose", "Use bio-pesticides to avoid soil contamination"],
    "Oil seeds":    ["Apply boron and sulphur as micronutrients", "Use seed treatment with phosphate solubilizers", "Practice solar drying post-harvest", "Use crop residue incorporation"],
    "Tobacco":      ["Apply potassium chloride for leaf quality", "Use split doses of nitrogen", "Avoid excess nitrogen to maintain leaf quality", "Practice soil fumigation carefully"],
    "Ground Nuts":  ["Apply gypsum at pegging stage for calcium", "Use Rhizobium inoculation to fix nitrogen", "Apply micronutrients zinc and boron", "Practice deep summer ploughing"],
    "default":      ["Test soil every season before applying fertilizers", "Use organic matter to improve soil structure", "Practice crop rotation to break pest cycles", "Minimize chemical use with IPM approach"],
}

# ─── Fertilizer NPK Quantity Estimator ──────────────────────
FERTILIZER_NPK = {
    "Urea":     {"N": 46, "P": 0,  "K": 0},
    "DAP":      {"N": 18, "P": 46, "K": 0},
    "10-26-26": {"N": 10, "P": 26, "K": 26},
    "14-35-14": {"N": 14, "P": 35, "K": 14},
    "17-17-17": {"N": 17, "P": 17, "K": 17},
    "20-20":    {"N": 20, "P": 20, "K": 0},
    "28-28":    {"N": 28, "P": 28, "K": 0},
}

FERTILIZER_PRICE = {
    "Urea": 6, "DAP": 27, "10-26-26": 32,
    "14-35-14": 30, "17-17-17": 28, "20-20": 25, "28-28": 26,
}

# ─── Crop Nutrient Requirements ─────────────────────────────
CROP_NUTRIENT_REQ = {
    "Paddy":       {"N": 100, "P": 50,  "K": 50},
    "Wheat":       {"N": 120, "P": 60,  "K": 40},
    "Maize":       {"N": 150, "P": 75,  "K": 75},
    "Cotton":      {"N": 120, "P": 60,  "K": 60},
    "Sugarcane":   {"N": 200, "P": 80,  "K": 100},
    "Barley":      {"N": 80,  "P": 40,  "K": 30},
    "Millets":     {"N": 60,  "P": 30,  "K": 20},
    "Pulses":      {"N": 20,  "P": 50,  "K": 20},
    "Oil seeds":   {"N": 60,  "P": 30,  "K": 30},
    "Tobacco":     {"N": 100, "P": 50,  "K": 100},
    "Ground Nuts": {"N": 25,  "P": 50,  "K": 25},
}

# ─── Soil Health Score ───────────────────────────────────────
def calculate_soil_health(n, p, k, ph=7.0, moisture=40):
    score = 0
    score += 35 if n >= 50 else (25 if n >= 30 else 10)
    score += 30 if p >= 30 else (20 if p >= 15 else 10)
    score += 25 if k >= 40 else (18 if k >= 20 else 8)
    # pH bonus
    if 6.0 <= ph <= 7.5:
        score += 10
    elif 5.5 <= ph <= 8.0:
        score += 5
    return min(score, 100)

# ─── Fertilizer Schedule ────────────────────────────────────
def generate_schedule(crop_type, fertilizer_name):
    return [
        {
            "stage": "Basal Application",
            "time": "At sowing / transplanting",
            "action": f"Apply full {fertilizer_name} dose as basal — 50% N + full P + full K"
        },
        {
            "stage": "Vegetative Stage",
            "time": "20–25 days after sowing",
            "action": "Top dress with 25% of remaining Nitrogen. Ensure adequate moisture."
        },
        {
            "stage": "Flowering / Booting",
            "time": "40–50 days after sowing",
            "action": "Apply final 25% Nitrogen. Monitor for pest/disease stress."
        },
        {
            "stage": "Maturity",
            "time": "70–90 days after sowing",
            "action": "Stop fertilizer application. Focus on water management and harvesting prep."
        },
    ]

# ─── Main Prediction Function ────────────────────────────────
def ml_predict(
    soil_n: float,
    soil_p: float,
    soil_k: float,
    temperature: float,
    humidity: float,
    moisture: float,
    soil_type: str,
    crop_type: str,
    ph: float,
    rainfall: float,
    area: float,
):
    # ── Encode inputs ──
    try:
        soil_enc = le_soil.transform([soil_type])[0]
    except:
        soil_enc = 0

    try:
        crop_enc = le_crop.transform([crop_type])[0]
    except:
        crop_enc = 0

    # ── Predict fertilizer type ──
    X_fert = [[temperature, humidity, moisture, soil_n, soil_k, soil_p, soil_enc, crop_enc]]
    fert_enc = fert_model.predict(X_fert)[0]
    fert_proba = fert_model.predict_proba(X_fert)[0]
    fertilizer_name = le_fert.inverse_transform([fert_enc])[0]
    confidence = round(float(max(fert_proba)) * 100, 1)

    # ── Predict best crop ──
    X_crop = [[soil_n, soil_p, soil_k, temperature, humidity, ph, rainfall]]
    crop_pred_enc = crop_model.predict(X_crop)[0]
    recommended_crop = le_crop_label.inverse_transform([crop_pred_enc])[0]

    # ── Calculate nutrient deficit ──
    req = CROP_NUTRIENT_REQ.get(crop_type, {"N": 100, "P": 50, "K": 50})
    n_deficit = max(req["N"] - soil_n, 0)
    p_deficit = max(req["P"] - soil_p, 0)
    k_deficit = max(req["K"] - soil_k, 0)

    # ── Calculate fertilizer quantity needed ──
    npk = FERTILIZER_NPK.get(fertilizer_name, {"N": 20, "P": 20, "K": 20})
    total_nutrient = npk["N"] + npk["P"] + npk["K"]
    avg_deficit = (n_deficit + p_deficit + k_deficit) / 3

    if total_nutrient > 0:
        fert_qty_per_ha = (avg_deficit / (total_nutrient / 3)) * 100
    else:
        fert_qty_per_ha = avg_deficit * 2

    fert_qty_total = round(fert_qty_per_ha * area, 2)

    # Also keep individual fertilizer breakdown
    urea_kg = round((n_deficit / 46) * area * 100, 2)
    dap_kg = round((p_deficit / 46) * area * 100, 2)
    mop_kg = round((k_deficit / 60) * area * 100, 2)

    # ── Cost estimation ──
    price = FERTILIZER_PRICE.get(fertilizer_name, 25)
    total_cost = round(fert_qty_total * price, 2)

    # ── Soil health ──
    soil_health = calculate_soil_health(soil_n, soil_p, soil_k, ph, moisture)

    # ── Sustainable practices ──
    practices = SUSTAINABLE_PRACTICES.get(crop_type, SUSTAINABLE_PRACTICES["default"])

    # ── Schedule ──
    schedule = generate_schedule(crop_type, fertilizer_name)

    return {
        "ml_prediction": {
            "recommended_fertilizer": fertilizer_name,
            "confidence_percent": confidence,
            "recommended_crop": recommended_crop,
            "fertilizer_qty_kg": fert_qty_total,
        },
        "fertilizer_required": {
            "urea_kg": urea_kg,
            "dap_kg": dap_kg,
            "mop_kg": mop_kg,
            "primary_fertilizer": fertilizer_name,
            "primary_qty_kg": fert_qty_total,
        },
        "nutrient_deficit": {
            "N": round(n_deficit, 2),
            "P": round(p_deficit, 2),
            "K": round(k_deficit, 2),
        },
        "soil_health_score": soil_health,
        "estimated_cost_inr": total_cost,
        "sustainable_practices": practices,
        "fertilizer_schedule": schedule,
        "inputs_summary": {
            "soil_type": soil_type,
            "crop_type": crop_type,
            "temperature": temperature,
            "humidity": humidity,
            "moisture": moisture,
            "ph": ph,
            "rainfall": rainfall,
            "area": area,
        }
    }
