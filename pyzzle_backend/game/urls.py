from django.urls import path
from .views import start_game,keep_alive

urlpatterns = [
    path("alive", keep_alive, name=""),
    path("bfs", start_game, {"algorithm": "BFS"}, name="BFS"),
    path("bestfs-manhattan", start_game, {"algorithm": "BestFS", "heuristic": "manhattan"}, name="BestFS Manhattan"),
    path("bestfs-hamming", start_game, {"algorithm": "BestFS", "heuristic": "hamming"}, name="BestFS Hamming"),
    path("a-star-manhattan", start_game, {"algorithm": "AStar", "heuristic": "manhattan"}, name="AStar Manhattan"),
    path("a-star-hamming", start_game, {"algorithm": "AStar", "heuristic": "hamming"}, name="AStar Hamming"),
    path("a-star-linear", start_game, {"algorithm": "AStar", "heuristic": "linear"}, name="AStar Linear Conflicts"),

]
