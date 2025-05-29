#!/bin/bash
cd /home/kavia/workspace/code-generation/spacecraft-designer-27352-672b99b3/spacecraft_designer
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

