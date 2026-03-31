#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class CCTVAPITester:
    def __init__(self, base_url="https://dual-cam-viewer.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.session_token = "test_session_1774978821969"  # From MongoDB setup
        self.user_id = "test-user-1774978821969"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        # Add session token via Authorization header
        if self.session_token:
            test_headers['Authorization'] = f'Bearer {self.session_token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        print(f"   Method: {method}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            
            result = {
                "test_name": name,
                "endpoint": endpoint,
                "method": method,
                "expected_status": expected_status,
                "actual_status": response.status_code,
                "success": success,
                "response_data": None,
                "error": None
            }
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    result["response_data"] = response.json()
                    print(f"   Response: {json.dumps(result['response_data'], indent=2)}")
                except:
                    result["response_data"] = response.text
                    print(f"   Response: {response.text}")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    result["error"] = error_data
                    print(f"   Error: {json.dumps(error_data, indent=2)}")
                except:
                    result["error"] = response.text
                    print(f"   Error: {response.text}")

            self.test_results.append(result)
            return success, result.get("response_data", {})

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            result = {
                "test_name": name,
                "endpoint": endpoint,
                "method": method,
                "expected_status": expected_status,
                "actual_status": None,
                "success": False,
                "response_data": None,
                "error": str(e)
            }
            self.test_results.append(result)
            return False, {}

    def test_auth_me(self):
        """Test /api/auth/me endpoint"""
        return self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )

    def test_camera_settings_get(self, camera_id):
        """Test GET /api/cameras/settings/{camera_id}"""
        return self.run_test(
            f"Get Camera Settings - {camera_id}",
            "GET",
            f"cameras/settings/{camera_id}",
            200
        )

    def test_camera_settings_update(self, camera_id, settings):
        """Test PUT /api/cameras/settings/{camera_id}"""
        return self.run_test(
            f"Update Camera Settings - {camera_id}",
            "PUT",
            f"cameras/settings/{camera_id}",
            200,
            data=settings
        )

    def test_alert_settings_get(self):
        """Test GET /api/alerts/settings"""
        return self.run_test(
            "Get Alert Settings",
            "GET",
            "alerts/settings",
            200
        )

    def test_alert_settings_update(self, settings):
        """Test PUT /api/alerts/settings"""
        return self.run_test(
            "Update Alert Settings",
            "PUT",
            "alerts/settings",
            200,
            data=settings
        )

    def test_api_root(self):
        """Test API root endpoint"""
        return self.run_test(
            "API Root",
            "GET",
            "",
            200
        )

def main():
    print("🚀 Starting CCTV Monitor API Tests")
    print("=" * 50)
    
    # Setup
    tester = CCTVAPITester()
    
    # Test API root
    print("\n📡 Testing API Root...")
    tester.test_api_root()
    
    # Test authentication
    print("\n🔐 Testing Authentication...")
    auth_success, auth_data = tester.test_auth_me()
    
    if not auth_success:
        print("❌ Authentication failed, stopping tests")
        print("\n📊 Final Results:")
        print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
        return 1
    
    # Test camera settings for both cameras
    print("\n📹 Testing Camera Settings...")
    cameras = ["pelle", "printer"]
    
    for camera_id in cameras:
        # Get current settings
        get_success, settings_data = tester.test_camera_settings_get(camera_id)
        
        if get_success:
            # Update settings
            update_data = {
                "brightness": 75,
                "contrast": 60
            }
            tester.test_camera_settings_update(camera_id, update_data)
            
            # Get settings again to verify update
            tester.test_camera_settings_get(camera_id)
    
    # Test alert settings
    print("\n🚨 Testing Alert Settings...")
    alert_success, alert_data = tester.test_alert_settings_get()
    
    if alert_success:
        # Update alert settings
        update_data = {
            "motion_enabled": False,
            "sound_enabled": True
        }
        tester.test_alert_settings_update(update_data)
        
        # Get settings again to verify update
        tester.test_alert_settings_get()
    
    # Print results
    print("\n" + "=" * 50)
    print("📊 Final Results:")
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        
        # Show failed tests
        failed_tests = [t for t in tester.test_results if not t["success"]]
        if failed_tests:
            print("\n❌ Failed Tests:")
            for test in failed_tests:
                print(f"  - {test['test_name']}: {test.get('error', 'Status code mismatch')}")
        
        return 1

if __name__ == "__main__":
    sys.exit(main())