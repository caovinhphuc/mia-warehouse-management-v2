#!/bin/bash

# Find all files with icon imports
files=$(grep -rl "@ant-design/icons" src/)

for file in $files; do
  echo "Processing: $file"
  # Parse imports
  # Convert to individual imports
  # Update file
done
