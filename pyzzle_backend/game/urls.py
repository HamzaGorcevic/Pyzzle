from django.urls import path
from .views import *
urlpatterns = [
    path("start-game/bfs",start_bfs_game,name="BFS"),
    path("start-game/bestfs",start_bestfs_game,name="Best first search"),
    path("start-game/astar-manhattan",start_astar_manhattan_game,name="Astar manhattan"),
    path("start-game/astar-hamming",start_astar_hamming_game,name="Astar hamming")


]
