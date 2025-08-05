#!/usr/bin/env python3
"""
Test script for the Railblocks Error SDK Python client.
"""

import asyncio
import os
import sys
from src import create_error_client, IngestErrorPayload

async def test_error_reporting():
    """Test the error reporting functionality."""
    
    # Get API key from environment or user input
    api_key = 'tr_prod'
    if not api_key:
        api_key = input("Enter your Trigger.dev API key (tr_dev_...): ").strip()
        if not api_key:
            print("❌ API key is required")
            return
    
    # Get environment
    environment = 'production'
    
    print("🚀 Testing Railblocks Error SDK Python Client")
    print(f"Environment: {environment}")
    print(f"API Key: {api_key[:10]}...")
    
    # Set up the client
    from src import ErrorReportingOptions
    options = ErrorReportingOptions(
        api_key=api_key,
        environment=environment,
        task_id='ingest-error'  # This should match your Trigger.dev task
    )
    client = create_error_client(options)
    
    try:
        # Test 1: Report a service error (AI classification)
        print("\n1. Testing service error reporting...")
        result1 = await client.report_service_error(
            company_code='lh',
            service='payment',
            message='Payment method declined',
            context={'user_id': 'user_123', 'amount': 100}
        )
        print(f"Result: {result1}")
        
        # Test 2: Report a known error code
        print("\n2. Testing known error reporting...")
        result2 = await client.report_known_error(
            company_code='lh',
            error_code='STRIPE-001',
            message='Payment failed',
            context={'order_id': 'order_456'}
        )
        print(f"Result: {result2}")
        
        # Test 3: Report with full payload
        print("\n3. Testing full payload reporting...")
        payload = IngestErrorPayload(
            company_code='lh',
            message='Database connection timeout',
            service='database',
            environment='development',
            severity='high',
            tags=['database', 'timeout'],
            context={'query': 'SELECT * FROM users'}
        )
        result3 = await client.report_error(payload)
        print(f"Result: {result3}")
        
        print("\n✅ All tests completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        print(f"Error type: {type(e).__name__}")
        return False
    
    return True

if __name__ == "__main__":
    print("=" * 50)
    print("Railblocks Error SDK Python Client Test")
    print("=" * 50)
    
    # Run the test
    success = asyncio.run(test_error_reporting())
    
    if success:
        print("\n🎉 All tests passed! The client is working correctly.")
    else:
        print("\n💥 Tests failed. Check your API key and network connection.")
        sys.exit(1) 