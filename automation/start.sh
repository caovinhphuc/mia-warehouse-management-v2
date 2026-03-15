#!/bin/bash
echo "🚀 Starting OneAutomationSystem..."

# Install dependencies
cd frontend && npm install
cd ../backend && npm install  
cd ../automation && pip install -r requirements.txt

echo "✅ Setup completed!"
echo "Run: npm start (frontend), npm run dev (backend)"
