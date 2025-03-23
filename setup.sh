#!/bin/bash

# Setup script for the Image Resize GitHub Action

# Install dependencies
npm install

# Build the action
npm run build

echo "Action built successfully. The 'dist' directory now contains the compiled action."
echo ""
echo "To publish this action to GitHub:"
echo "1. Create a new repository on GitHub"
echo "2. Push this code to the repository"
echo "3. Create a release and tag it with a semantic version (e.g., v1.0.0)"
echo "4. Update your workflows to use your published action" 
