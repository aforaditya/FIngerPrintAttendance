import cv2
import os

def load_images_from_folder(folder):
    images = []
    for filename in os.listdir(folder):
        if filename.endswith(".dib"):
            img_path = os.path.join(folder, filename)
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
        matches_results.append((filename, match_percentage))

    return matches_results

if __name__ == "__main__":
    # Set the path to the folder containing database images
    database_folder = "all_fingerprints"

    # Set the path to the query fingerprint image
    query_image_path = "query.dib"

    # Load the query image
    query_image = cv2.imread(query_image_path, cv2.IMREAD_GRAYSCALE)

    # Load images from the database folder
    database_images = load_images_from_folder(database_folder)

    # Perform fingerprint matching
    results = match_fingerprint(query_image, database_images)

    # Display the matching results
    for filename, match_percentage in results:
        print(f"{filename}: {match_percentage}% match")

    # Optional: Save the matching results to a file or take further actions based on the results
