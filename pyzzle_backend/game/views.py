from django.shortcuts import render
from django.http import JsonResponse
from .algorithms import bfs  

def start_game(request):
    if request.method == "GET":
        initial_state = [[1, 0, 3], [2, 8, 7], [6, 4, 5]]
        final_state = [[1, 2, 3], [4, 5, 6], [7, 8, 0]]

        response = bfs(initial_state, final_state)

        print(response)

        return JsonResponse({"steps": response})
    else:
        return JsonResponse({"error": "Invalid request method. Use GET."}, status=400)
