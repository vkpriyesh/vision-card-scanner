from django.apps import AppConfig

class CardsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'cards'

    def ready(self):
        try:
            # Import and initialize sheets only in main process
            import os
            if os.environ.get('RUN_MAIN'):
                from .utils.sheets_helper import initialize_sheet
                initialize_sheet()
        except Exception as e:
            print(f"Failed to initialize Google Sheet: {str(e)}")