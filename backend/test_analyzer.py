import io
from PIL import Image
from analyzer import generate_analysis_report

def run_test():
    print("===================================================")
    print("          FaceSense AI - Analyzer Test")
    print("===================================================")
    
    # 1. Create a dummy 500x600 test image (representing a portrait selfie)
    print("\n[1/3] Generating dummy portrait selfie...")
    img = Image.new("RGB", (500, 600), color=(220, 180, 160)) # skin-like color
    
    # Convert image to bytes
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    img_bytes = img_byte_arr.getvalue()
    print("      Dummy image size: 500x600, format: JPEG")

    # 2. Run analysis
    print("\n[2/3] Running facial analysis engine...")
    try:
        report = generate_analysis_report(img_bytes)
        print(" [OK] Analysis completed successfully!")
    except Exception as e:
        print(" [FAIL] Analysis failed with error:", str(e))
        return False

    # 3. Verify report structure
    print("\n[3/3] Verifying report schema and key points:")
    
    keys_to_verify = [
        "hash", "dimensions", "face_shape", "skin_analysis", 
        "landmarks", "symmetry", "jawline", "hair_analysis", 
        "beard_recommendations", "glasses_recommendations", 
        "outfit_recommendations", "color_analysis", 
        "celebrity_lookalike", "ratings", "glow_up_plan"
    ]
    
    success = True
    for key in keys_to_verify:
        if key in report:
            print(f"      [OK] Key '{key}' exists")
        else:
            print(f"      [FAIL] Key '{key}' is missing!")
            success = False
            
    # Sample landmark verification
    landmarks_len = len(report.get("landmarks", []))
    if landmarks_len == 68:
        print(f"      [OK] 68-point landmarks count is correct ({landmarks_len} points)")
    else:
        print(f"      [FAIL] Landmarks count is incorrect: {landmarks_len} (expected 68)")
        success = False

    # Print summary output values
    print("\n===================================================")
    if success:
        print("          TEST COMPLETED: SUCCESS")
        print(f"          Detected Shape: {report['face_shape']['name']} ({report['face_shape']['score']})")
        print(f"          Skin Score: {report['skin_analysis']['overall_score']}/100")
        print(f"          Undertone: {report['color_analysis']['undertone']}")
    else:
        print("          TEST COMPLETED: FAILURE")
    print("===================================================")
    return success

if __name__ == "__main__":
    run_test()
