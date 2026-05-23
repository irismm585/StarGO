#!/bin/bash
set -e
cd /sessions/vigilant-inspiring-cori/mnt/StarGO
echo "Running expo export..."
node node_modules/.bin/expo export --platform web --clear 2>&1
echo "EXIT CODE: $?"
