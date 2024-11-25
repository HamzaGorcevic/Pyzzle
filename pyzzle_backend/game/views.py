from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from json import loads
from .algorithms import *

@csrf_exempt
def start_game(request, algorithm, heuristic=None):
    if request.method == "POST":
        goal_state = [[1, 2, 3], [4, 5, 6], [7, 8, 0]]
        body = loads(request.body)
        if algorithm == "BFS":
            algo_instance = BFSAlgorithm()
        elif algorithm == "BestFS":
            algo_instance = BestFSAlgorithm(heuristic)
        elif algorithm == "AStar":
            algo_instance = AStarAlgorithm(heuristic)
        else:
            return JsonResponse({"error": "Invalid algorithm."}, status=400)
        
        response, nodes_explored = algo_instance.get_steps(body.get("initial_state"), goal_state)
        return JsonResponse({"steps": response, "nodes_explored": nodes_explored})
    else:
        return JsonResponse({"error": "Invalid request method. Use POST."}, status=400)
