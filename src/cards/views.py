import logging
import json
import base64
import tempfile
import os
import traceback
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.utils import timezone
from .utils.openai_helper import analyze_image, extract_card_details
from .utils.sheets_helper import append_to_google_sheet

# Enhanced logging
logger = logging.getLogger(__name__)

def index(request):
    logger.info("Index page accessed")
    return render(request, 'cards/index.html')

def upload_view(request):
    """Render the upload form"""
    logger.info("Upload form accessed")
    return render(request, 'cards/upload.html')

@csrf_exempt
def analyze_card(request):
    """Handle image upload and analysis"""
    logger.info("Card analysis endpoint accessed")
    
    if request.method != 'POST':
        logger.error("Invalid request method: %s", request.method)
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=405)
    
    # Log request details
    logger.info("Request POST data keys: %s", list(request.POST.keys()))
    logger.info("Request FILES keys: %s", list(request.FILES.keys()))
    
    images = request.FILES.getlist('images')
    if not images:
        logger.error("No image files received in the 'images' field")
        return JsonResponse({'error': 'No images provided'}, status=400)
    
    logger.info("Received %d images for analysis", len(images))
    
    try:
        results = []
        
        for i, img_file in enumerate(images):
            logger.info("Processing image %d: %s (%s bytes)", 
                       i+1, img_file.name, img_file.size)
            
            try:
                # Use the OpenAI helper to analyze the image
                logger.info("Calling analyze_image function")
                raw_analysis = analyze_image(img_file)
                logger.info("Raw analysis received, now extracting card details")
                
                # Extract structured data from the raw response
                cards = extract_card_details(raw_analysis)
                logger.info(f"Extracted {len(cards)} contacts from the image")
                
                # Process each extracted card
                for j, card in enumerate(cards):
                    logger.info(f"Processing contact {j+1}/{len(cards)}")
                    
                    # Add timestamp
                    card['created_at'] = timezone.now().strftime('%Y-%m-%d %H:%M:%S')
                    
                    # Store in Google Sheet
                    try:
                        logger.info(f"Attempting to store contact {j+1} in Google Sheet")
                        append_to_google_sheet(card)
                        card['sheet_status'] = 'saved'
                        logger.info("Successfully saved data to Google Sheet")
                    except Exception as sheet_error:
                        logger.error(f"Failed to save contact {j+1} to Google Sheet: {str(sheet_error)}", exc_info=True)
                        card['sheet_status'] = 'failed'
                    
                    # Convert field names for frontend display
                    display_data = {
                        'name': card.get('name', ''),
                        'company': card.get('business_name', ''),
                        'position': card.get('job_title', ''),
                        'phone': card.get('contact_number', ''),
                        'email': card.get('email', ''),
                        'website': card.get('website', ''),
                        'address': card.get('address', ''),
                        'sheet_status': card.get('sheet_status', '')
                    }
                    
                    results.append(display_data)
                
                if not cards:
                    logger.warning("No card data extracted")
                    results.append({
                        'error': 'No contact data could be extracted',
                        'image': img_file.name
                    })
                
            except Exception as process_error:
                logger.error("Error processing image: %s", str(process_error), exc_info=True)
                results.append({
                    'error': f'Error processing image: {str(process_error)}',
                    'image': img_file.name
                })
        
        # Return all results, don't special-case just one result
        logger.info(f"Returning {len(results)} contacts in total")
        return JsonResponse({'results': results})
            
    except Exception as e:
        logger.critical("Unexpected error in analyze_card view: %s", str(e), exc_info=True)
        logger.critical("Traceback: %s", traceback.format_exc())
        return JsonResponse({
            'error': f'An unexpected error occurred: {str(e)}',
            'contact': 'Please check server logs for details'
        }, status=500)