from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    # You can extend later (e.g., add profile picture, phone number, etc.)
    pass
