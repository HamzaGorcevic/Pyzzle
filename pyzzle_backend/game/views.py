from django.shortcuts import render
from django.http import JsonResponse
from .algorithms import *
from django.views.decorators.csrf import csrf_exempt
from json import loads
@csrf_exempt
def start_bfs_game(request):
    if request.method == "POST":
        goal_state = [[1, 2, 3], [4, 5, 6], [7, 8, 0]]
        body = loads(request.body)
        bfs_algorithm = BFSAlgorithm()
        response,nodes_explored = bfs_algorithm.get_steps(body.get("initial_state"), goal_state)

        return JsonResponse({"steps": response,"nodes_explored":nodes_explored})
    else:
        return JsonResponse({"error": "Invalid request method. Use GET."}, status=400)
@csrf_exempt
def start_bestfs_game(request):
    if request.method == "POST":
        goal_state = [[1, 2, 3], [4, 5, 6], [7, 8, 0]]
        body = loads(request.body)
        bestfs_algorithm = BestFSAlgorithm()
        response,nodes_explored = bestfs_algorithm.get_steps(body.get("initial_state"), goal_state)

        return JsonResponse({"steps": response,"nodes_explored":nodes_explored})
    else:
        return JsonResponse({"error": "Invalid request method. Use GET."}, status=400)
    
@csrf_exempt
def start_astar_game(request):
    if request.method == "POST":
        goal_state = [[1, 2, 3], [4, 5, 6], [7, 8, 0]]
        body = loads(request.body)
        bestfs_algorithm = AStarAlgorithm()
        response,nodes_explored = bestfs_algorithm.get_steps(body.get("initial_state"), goal_state)

        return JsonResponse({"steps": response,"nodes_explored":nodes_explored})
    else:
        return JsonResponse({"error": "Invalid request method. Use GET."}, status=400)
