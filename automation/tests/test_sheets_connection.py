tester = SheetsConnectionTest()
    
    # Check if config exists, if not generate template
    if not os.path.exists('.env'):
        print("📝 No .env file found. Generating template...")
        tester.generate_config_template()
        print("\\n⚠️ Please copy .env.example to .env and fill in your configuration")
        return
        
    # Run tests
    success = tester.run_all_tests()
    
    # Ask for cleanup
    print("\\n" + "=" * 60)
    if success:
        response = input("🧹 Would you like to clean up test data? (y/n): ")
        if response.lower() == 'y':
            tester.cleanup_test_data()
    
    return success

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\\n\\n⚠️ Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\\n\\n❌ Unexpected error: {e}")
        sys.exit(1)