from django.urls import path
from .views import start_game,keep_alive

urlpatterns = [
    path("alive", keep_alive, name=""),
    path("start-game/bfs", start_game, {"algorithm": "BFS"}, name="BFS"),
    path("start-game/bestfs-manhattan", start_game, {"algorithm": "BestFS", "heuristic": "manhattan"}, name="BestFS Manhattan"),
    path("start-game/bestfs-hamming", start_game, {"algorithm": "BestFS", "heuristic": "hamming"}, name="BestFS Hamming"),
    path("start-game/a-star-manhattan", start_game, {"algorithm": "AStar", "heuristic": "manhattan"}, name="AStar Manhattan"),
    path("start-game/a-star-hamming", start_game, {"algorithm": "AStar", "heuristic": "hamming"}, name="AStar Hamming"),
    path("start-game/a-star-linear", start_game, {"algorithm": "AStar", "heuristic": "linear"}, name="AStar Linear Conflicts"),

]
