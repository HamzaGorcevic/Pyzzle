from django.urls import path
from .views import *
urlpatterns = [
    path("start-game/bfs",start_bfs_game,name="Start game"),
    path("start-game/bestfs",start_bestfs_game,name="Start game"),
    path("start-game/astar",start_astar_game,name="Start game")

]
