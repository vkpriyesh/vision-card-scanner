import logging
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .utils.openai_helper import analyze_image, extract_card_details
from .utils import append_to_google_sheet
from django.utils import timezone

logger = logging.getLogger(__name__)

def upload_view(request):
    """Render the upload form"""
    return render(request, 'cards/upload.html')

@csrf_exempt
def analyze_card(request):
    """Handle image upload and analysis"""
    if request.method != 'POST':
        logger.error("Invalid request method")
        return JsonResponse({'error': 'Invalid request method'}, status=400)
    
    try:
        # Get image from request
        image = request.FILES.get('image')
        if not image:
            logger.error("No image file received")
            return JsonResponse({'error': 'No image provided'}, status=400)
        
        logger.info(f"Processing image: {image.name}")
        
        # Analyze image with OpenAI
        try:
            analysis_result = analyze_image(image)
            logger.info("Successfully analyzed image")
        except Exception as e:
            logger.error(f"OpenAI analysis failed: {str(e)}", exc_info=True)
            return JsonResponse({'error': f'Image analysis failed: {str(e)}'}, status=500)
        
        # Extract card details
        try:
            card_details = extract_card_details(analysis_result)
            logger.info("Successfully extracted card details")

            # Add timestamp to each card
            for card in card_details:
                card['created_at'] = timezone.now().strftime('%Y-%m-%d %H:%M:%S')
                # Add to Google Sheet
                try:
                    append_to_google_sheet(card)
                    logger.info(f"Added card for {card.get('name', 'Unknown')} to Google Sheet")
                except Exception as e:
                    logger.error(f"Failed to add to Google Sheet: {str(e)}", exc_info=True)
                    # Continue processing even if Google Sheet update fails
                    
        except Exception as e:
            logger.error(f"Card detail extraction failed: {str(e)}", exc_info=True)
            return JsonResponse({'error': f'Failed to extract card details: {str(e)}'}, status=500)
        
        return JsonResponse({
            'success': True,
            'data': card_details
        })
        
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return JsonResponse({'error': str(e)}, status=500)