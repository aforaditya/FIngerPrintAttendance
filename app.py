from flask import Flask, request, jsonify
import os
import base64
from PIL import Image
from io import BytesIO
import base64
import cv2
import numpy as np
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

@app.route('/saveStudent', methods=['POST'])
def save_student():
    try:
        data = request.get_json()

        # Extract UID and name from the request
        uid = data.get('uid')
        name = data.get('name')

        # Create a folder for the student if it doesn't exist
        student_folder = os.path.join('students', str(uid))
        os.makedirs(student_folder, exist_ok=True)

        # Save images from base64 strings
        for i in range(1, 6):
            fingerprint_key = f'fingerprint{i}'
            base64_str = data.get(fingerprint_key, "")
            
            if base64_str:
                image_data = base64.b64decode(base64_str)
                image_path = os.path.join(student_folder, f"fingerprint{i}.png")

                with open(image_path, 'wb') as f:
                    f.write(image_data)

        return jsonify({'status': 'success', 'message': 'Images saved successfully'})

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})




def load_images_from_student_folder(uid):
    student_folder = os.path.join('students', str(uid))
    images = []
    for i in range(1, 6):
        filename = f"fingerprint{i}.png"
        img_path = os.path.join(student_folder, filename)
        img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
        if img is not None:
            images.append((filename, img))
    return images

def match_fingerprint(query_image, database_images):
    sift = cv2.SIFT_create()
    kp1, des1 = sift.detectAndCompute(query_image, None)

    matches_results = []

    for filename, database_image in database_images:
        kp2, des2 = sift.detectAndCompute(database_image, None)

        bf = cv2.BFMatcher()
        matches = bf.knnMatch(des1, des2, k=2)

        good_matches = []
        for m, n in matches:
            if m.distance < 0.75 * n.distance:
                good_matches.append(m)

        match_percentage = (len(good_matches) / len(kp1)) * 100
        matches_results.append(match_percentage)

    return matches_results

@app.route('/match', methods=['POST'])
def match_all_fingerprints():
    try:
        # Extract query fingerprint from the request
        fingerprint_base64 = request.json.get('fingerprint', "")
        fingerprint_data = base64.b64decode(fingerprint_base64)
        fingerprint_image = cv2.imdecode(np.frombuffer(fingerprint_data, np.uint8), cv2.IMREAD_GRAYSCALE)

        # Get a list of all UID folders in the 'students' directory
        uid_folders = [folder for folder in os.listdir('students') if os.path.isdir(os.path.join('students', folder))]

        top_match_uid = None
        top_match_score = 0

        # Iterate over each UID and calculate the average match score
        for uid in uid_folders:
            database_images = load_images_from_student_folder(uid)
            match_scores = match_fingerprint(fingerprint_image, database_images)
            
            # Calculate the average match score
            if match_scores:
                average_score = sum(match_scores) / len(match_scores)

                # Update the top match if needed
                if average_score > top_match_score:
                    top_match_uid = uid
                    top_match_score = average_score

        response_data = {'uid': top_match_uid, 'score': top_match_score}
        return jsonify(response_data)

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})
    

if __name__ == '__main__':
    # Ensure the 'students' folder exists
    os.makedirs('students', exist_ok=True)

    # Run the Flask app
    app.run(debug=True)
