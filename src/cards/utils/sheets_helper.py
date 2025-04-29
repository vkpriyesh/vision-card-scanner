from google.oauth2 import service_account
from googleapiclient.discovery import build
from django.conf import settings
import logging
from typing import List, Dict, Any

# Configure logger
logger = logging.getLogger(__name__)

# Define sheet columns
SHEET_COLUMNS = [
    'Name',
    'Business Name',
    'Job Title',
    'Contact Number',
    'Email',
    'Website',
    'Address',
    'Created At'
]

def get_sheets_service():
    """Initialize and return Google Sheets service"""
    try:
        credentials = service_account.Credentials.from_service_account_file(
            settings.GOOGLE_APPLICATION_CREDENTIALS,
            scopes=['https://www.googleapis.com/auth/spreadsheets']
        )
        service = build('sheets', 'v4', credentials=credentials)
        return service
    except Exception as e:
        logger.error(f"Failed to initialize Sheets service: {str(e)}", exc_info=True)
        raise

def initialize_sheet() -> None:
    """Create header row if sheet is empty"""
    try:
        service = get_sheets_service()
        
        # Check if headers exist
        result = service.spreadsheets().values().get(
            spreadsheetId=settings.GOOGLE_SHEET_ID,
            range='A1:H1'
        ).execute()
        
        # If no headers, add them
        if 'values' not in result:
            service.spreadsheets().values().update(
                spreadsheetId=settings.GOOGLE_SHEET_ID,
                range='A1:H1',
                valueInputOption='RAW',
                body={'values': [SHEET_COLUMNS]}
            ).execute()
            logger.info("Sheet headers initialized")
    except Exception as e:
        logger.error(f"Failed to initialize sheet: {str(e)}", exc_info=True)
        raise

def append_to_sheet(card_data: Dict[str, Any]) -> None:
    """Append business card data to Google Sheet"""
    try:
        service = get_sheets_service()
        
        # Format data according to columns
        row_data = [
            card_data.get('name', ''),
            card_data.get('business_name', ''),
            card_data.get('job_title', ''),
            card_data.get('contact_number', ''),
            card_data.get('email', ''),
            card_data.get('website', ''),
            card_data.get('address', ''),
            card_data.get('created_at', '')
        ]
        
        # Append the row
        service.spreadsheets().values().append(
            spreadsheetId=settings.GOOGLE_SHEET_ID,
            range='A1',
            valueInputOption='RAW',
            insertDataOption='INSERT_ROWS',
            body={'values': [row_data]}
        ).execute()
        
        logger.info(f"Successfully appended data for {card_data.get('name', 'Unknown')}")
        
    except Exception as e:
        logger.error(f"Failed to append to sheet: {str(e)}", exc_info=True)
        raise

def get_sheet_data() -> List[Dict[str, Any]]:
    """Retrieve all data from the Google Sheet"""
    try:
        service = get_sheets_service()
        
        result = service.spreadsheets().values().get(
            spreadsheetId=settings.GOOGLE_SHEET_ID,
            range='A:H'
        ).execute()
        
        values = result.get('values', [])
        if not values:
            return []
            
        headers = values[0]
        data = []
        for row in values[1:]:
            padded_row = row + [''] * (len(headers) - len(row))
            data.append(dict(zip(headers, padded_row)))
            
        return data
        
    except Exception as e:
        logger.error(f"Failed to get sheet data: {str(e)}", exc_info=True)
        raise

# Define exports
append_to_google_sheet = append_to_sheet
get_google_sheet_data = get_sheet_data