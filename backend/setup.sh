#!/bin/bash
# Install Tesseract OCR
apt-get update
apt-get install -y tesseract-ocr tesseract-ocr-ind tesseract-ocr-eng
pip install -r requirements.txt
