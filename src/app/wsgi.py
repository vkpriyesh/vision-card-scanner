import os
import sys
from pathlib import Path

# Add the project root directory to Python path
current_path = Path(__file__).resolve().parent.parent
sys.path.append(str(current_path))

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')

application = get_wsgi_application()