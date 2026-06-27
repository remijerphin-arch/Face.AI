import io
from PIL import Image
from analyzer import generate_analysis_report

def run_test():
    print("===================================================")
    print("          FaceSense AI - Analyzer Test")
    print("===================================================")
    
    # 1. Create a dummy 500x600 test image (flat color, no face)
    print("\n[1/2] Generating non-face dummy image...")
    img = Image.new("RGB", (500, 600), color=(220, 180, 160)) # flat skin-like color
    
    # Convert image to bytes
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    img_bytes = img_byte_arr.getvalue()
    print("      Dummy image size: 500x600, format: JPEG")

    # 2. Run analysis (expecting it to fail because it has no face)
    print("\n[2/2] Running analysis on non-face image (should fail)...")
    try:
        generate_analysis_report(img_bytes)
        print("      [FAIL] Analysis succeeded on a flat color block! Face detection is not working.")
        return False
    except ValueError as ve:
        if "No human face detected" in str(ve):
            print(f"      [OK] Correctly caught expected error: '{str(ve)}'")
            print("           Face detection successfully blocked the non-face image!")
            print("\n===================================================")
            print("          TEST COMPLETED: SUCCESS")
            print("===================================================")
            return True
        else:
            print(f"      [FAIL] Caught unexpected ValueError: {str(ve)}")
            return False
    except Exception as e:
        print("      [FAIL] Analysis failed with unexpected error:", str(e))
        return False

if __name__ == "__main__":
    run_test()
