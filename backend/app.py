from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np

app = Flask(__name__)
CORS(app)

model = pickle.load(open("../model/marks_model.pkl", "rb"))

@app.route("/predict", methods=["POST"])
def predict():

    data = request.json

    features = np.array([[
        float(data["study_hours"]),
        float(data["attendance"]),
        float(data["previous_marks"]),
        float(data["assignments"]),
        float(data["sleep_hours"]),
        float(data["mock_test"])
    ]])

    prediction = model.predict(features)[0]

    study = float(data["study_hours"])
    attendance = float(data["attendance"])
    previous = float(data["previous_marks"])
    assignments = float(data["assignments"])
    mock = float(data["mock_test"])

    average_academic = (
        study * 10 +
        attendance +
        previous +
        assignments +
        mock
    ) / 5

    if average_academic < 40:
        prediction = min(prediction, 45)

    return jsonify({
        "predicted_marks": round(float(prediction), 2)
    })
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)