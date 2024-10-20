from django.urls import path
from .views import start_game
urlpatterns = [
    path("start-game/",start_game,name="Start game")
]
