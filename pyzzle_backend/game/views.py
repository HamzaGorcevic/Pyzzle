from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from json import loads
from .algorithms import *

@csrf_exempt
def keep_alive(request):
    return JsonResponse({"status":"active"})


@csrf_exempt
def start_game(request, algorithm, heuristic=None):
    if request.method == "POST":
        body = loads(request.body)
        if algorithm == "BFS":
            algo_instance = BFSAlgorithm()
        elif algorithm == "BestFS":
            algo_instance = BestFSAlgorithm(heuristic)
        elif algorithm == "AStar":
            algo_instance = AStarAlgorithm(heuristic)
        else:
            return JsonResponse({"error": "Invalid algorithm."}, status=400)
        
        start_state = tuple(item for row in body.get("initial_state") for item in row)
        sorted_without_zero = sorted(x for x in start_state if x != 0)
        goal_state = tuple(sorted_without_zero + [0])
        response, nodes_explored = algo_instance.get_steps(start_state, goal_state)
        return JsonResponse({"steps": response, "nodes_explored": nodes_explored})
    else:
        return JsonResponse({"error": "Invalid request method. Use POST."}, status=400)
