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

        # Initialize OpenAI client with only the required parameters
        client = OpenAI(
            api_key=settings.OPENAI_API_KEY
        )
        
        # Encode image
        logger.debug("Encoding image to base64")
        base64_image = encode_image(image_file)
        logger.debug("Image encoded successfully")

        # Make API request
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
        raise Exception(f"OpenAI API request failed: {str(e)}")

def extract_card_details(analysis_response: str) -> List[Dict[str, Any]]:
    """
    Extract structured card details from the API response
    """
    try:
        logger.debug(f"Raw response received: {analysis_response}")
        
        # Clean the response if it contains markdown code blocks
        if analysis_response.startswith('```'):
            # Find the start of JSON content
            start_idx = analysis_response.find('[')
            if start_idx == -1:
                start_idx = analysis_response.find('{')
            # Find the end of JSON content
            end_idx = analysis_response.rfind(']')
            if end_idx == -1:
                end_idx = analysis_response.rfind('}')
            
            if start_idx == -1 or end_idx == -1:
                raise ValueError("Could not find valid JSON content in response")
                
            # Extract just the JSON part
            analysis_response = analysis_response[start_idx:end_idx + 1]
        
        logger.debug(f"Cleaned response for parsing: {analysis_response}")
        
        # Parse the JSON
        card_details = json.loads(analysis_response)
        
        # Ensure we have a list of cards
        if isinstance(card_details, dict):
            card_details = [card_details]
            
        # Validate each card has required fields
        required_fields = ['name', 'business_name', 'contact_number']
        for card in card_details:
            missing_fields = [field for field in required_fields if not card.get(field)]
            if missing_fields:
                logger.warning(f"Card for {card.get('name', 'Unknown')} is missing fields: {missing_fields}")
        
        logger.info(f"Successfully parsed {len(card_details)} cards")
        return card_details
        
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {str(e)}", exc_info=True)
        raise ValueError(f"Failed to parse API response: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error in extract_card_details: {str(e)}", exc_info=True)
        raise