import os
import base64
from typing import Dict, Any, List
from openai import OpenAI
import json
from django.conf import settings
import logging

# Configure logger
logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

def encode_image(image_file) -> str:
    """Encode image file object to base64 string"""
    try:
        logger.debug(f"Attempting to encode image file: {image_file.name}")
        encoded_string = base64.b64encode(image_file.read()).decode("utf-8")
        logger.debug("Image successfully encoded to base64")
        image_file.seek(0)  # Reset file pointer for future reads
        return encoded_string
    except Exception as e:
        logger.error(f"Error encoding image: {str(e)}")
        raise

def analyze_image(image_file) -> Dict[str, Any]:
    """
    Analyze image using OpenAI's Vision API through the Python SDK
    """
    try:
        logger.info("Starting image analysis")
        logger.debug(f"Image file received: {image_file.name}")

        api_key = settings.OPENAI_API_KEY
        client = OpenAI()  # Uses OPENAI_API_KEY from environment by default
        
        base64_image = encode_image(image_file)
        logger.debug("Image encoded successfully")

        logger.info("Sending request to OpenAI API")
        completion = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Extract the following information from this business card: name, business name, job title, contact number, email, website, and address. Return the data in JSON format."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=500
        )
        
        logger.info("Successfully received response from OpenAI")
        return completion.choices[0].message.content

    except Exception as e:
        logger.error(f"Error in analyze_image: {str(e)}", exc_info=True)
        raise

def extract_card_details(analysis_response: str) -> List[Dict[str, Any]]:
    """
    Extract structured card details from the API response
    """
    try:
        logger.debug(f"Attempting to parse response: {analysis_response}")
        
        if not analysis_response:
            raise ValueError("Empty response received")
            
        # Remove markdown code block if present
        cleaned_response = analysis_response
        if analysis_response.startswith('```'):
            # Find the first and last occurrence of ```
            start_idx = analysis_response.find('\n') + 1
            end_idx = analysis_response.rfind('```')
            cleaned_response = analysis_response[start_idx:end_idx].strip()
            
        logger.debug(f"Cleaned response: {cleaned_response}")
        card_details = json.loads(cleaned_response)
        
        # Validate required fields for each card
        required_fields = ['name', 'business_name', 'contact_number']
        for card in card_details if isinstance(card_details, list) else [card_details]:
            missing_fields = [field for field in required_fields if field not in card]
            if missing_fields:
                logger.warning(f"Card for {card.get('name', 'Unknown')} is missing fields: {missing_fields}")
        
        # If the response is a single card, wrap it in a list
        if isinstance(card_details, dict):
            logger.debug("Single card details detected")
            return [card_details]
            
        logger.debug(f"Multiple card details detected: {len(card_details)} cards")
        return card_details
        
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {str(e)}", exc_info=True)
        raise ValueError(f"Failed to parse API response: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error in extract_card_details: {str(e)}", exc_info=True)
        raise