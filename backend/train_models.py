import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
import os

os.makedirs("models", exist_ok=True)

# ─── DATASET 1: Fertilizer Prediction ───────────────────────
print("Training Fertilizer Recommendation Model...")
df_fert = pd.read_csv("data/Fertilizer Prediction.csv")

# Fix column name with trailing space
df_fert.columns = df_fert.columns.str.strip()

# Encode categorical columns
le_soil = LabelEncoder()
le_crop = LabelEncoder()
le_fert = LabelEncoder()

df_fert["Soil Type Enc"] = le_soil.fit_transform(df_fert["Soil Type"])
df_fert["Crop Type Enc"] = le_crop.fit_transform(df_fert["Crop Type"])
df_fert["Fertilizer Enc"] = le_fert.fit_transform(df_fert["Fertilizer Name"])

X_fert = df_fert[["Temparature", "Humidity", "Moisture", "Nitrogen", "Potassium", "Phosphorous", "Soil Type Enc", "Crop Type Enc"]]
y_fert = df_fert["Fertilizer Enc"]

X_train, X_test, y_train, y_test = train_test_split(X_fert, y_fert, test_size=0.2, random_state=42)

fert_model = RandomForestClassifier(n_estimators=200, random_state=42)
fert_model.fit(X_train, y_train)

acc = accuracy_score(y_test, fert_model.predict(X_test))
print(f"  Fertilizer Model Accuracy: {acc*100:.1f}%")

# Save model + encoders
joblib.dump(fert_model, "models/fertilizer_model.pkl")
joblib.dump(le_soil, "models/le_soil.pkl")
joblib.dump(le_crop, "models/le_crop.pkl")
joblib.dump(le_fert, "models/le_fert.pkl")

# ─── DATASET 2: Crop Recommendation ────────────────────────
print("Training Crop Recommendation Model...")
df_crop = pd.read_csv("data/Crop_recommendation.csv")

le_crop_label = LabelEncoder()
df_crop["crop_enc"] = le_crop_label.fit_transform(df_crop["label"])

X_crop = df_crop[["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]]
y_crop = df_crop["crop_enc"]

X_train2, X_test2, y_train2, y_test2 = train_test_split(X_crop, y_crop, test_size=0.2, random_state=42)

crop_model = RandomForestClassifier(n_estimators=200, random_state=42)
crop_model.fit(X_train2, y_train2)

acc2 = accuracy_score(y_test2, crop_model.predict(X_test2))
print(f"  Crop Model Accuracy: {acc2*100:.1f}%")

joblib.dump(crop_model, "models/crop_model.pkl")
joblib.dump(le_crop_label, "models/le_crop_label.pkl")

print("\n✅ All models trained and saved to models/")
print(f"   Soil Types supported: {list(le_soil.classes_)}")
print(f"   Crop Types supported: {list(le_crop.classes_)}")
print(f"   Fertilizers: {list(le_fert.classes_)}")
print(f"   Crops recommended: {list(le_crop_label.classes_)}")
import sqlite3
from datetime import datetime