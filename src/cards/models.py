from django.db import models
from django.utils import timezone

class VisitingCard(models.Model):
    name = models.CharField(max_length=255)
    business_name = models.CharField(max_length=255)
    job_title = models.CharField(max_length=255, blank=True, null=True)
    contact_number = models.CharField(max_length=20)
    email = models.EmailField(max_length=255, blank=True, null=True)
    website = models.URLField(max_length=255, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    image = models.ImageField(upload_to='cards/', blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.business_name}"

    def to_dict(self):
        """Convert model instance to dictionary for Google Sheets"""
        return {
            'Name': self.name,
            'Business Name': self.business_name,
            'Job Title': self.job_title or '',
            'Contact Number': self.contact_number,
            'Email': self.email or '',
            'Website': self.website or '',
            'Address': self.address or '',
            'Created At': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }