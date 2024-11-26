
from collections import deque
from abc import ABC, abstractmethod
import heapq
class Algorithm(ABC):
    def __init__(self,distance="hamming") -> None:
        self.distance = distance
    @abstractmethod
    def get_steps(self, initial_state, goal_state):
        pass
    @staticmethod
    def possible_paths(current_state: tuple[int, ...], size: int = 3):
        zero_index = current_state.index(0)
        row_pos, col_pos = divmod(zero_index, size)

        # Define possible move directions (right, down, up, left)
        directions = [(0, 1), (1, 0), (-1, 0), (0, -1)]
        paths = []

        for dir_row, dir_col in directions:
            move_row = row_pos + dir_row
            move_col = col_pos + dir_col

            if 0 <= move_row < size and 0 <= move_col < size:
                new_index = move_row * size + move_col

                new_state = list(current_state)  
                new_state[zero_index], new_state[new_index] = new_state[new_index], new_state[zero_index]
                new_state = tuple(new_state)  

                paths.append((new_state, new_index))

        return paths

    @staticmethod
    def manhattan_distance(state, goal_state):
        heuristic_sum = 0
        size = int(len(state) ** 0.5)  # Assuming the state is a square grid (e.g., 3x3 for the 8-puzzle)
        
        for index, value in enumerate(state):
            if value != 0:  # Ignore the empty space (0)
                target_index = goal_state.index(value)
                target_i, target_j = divmod(target_index, size)
                current_i, current_j = divmod(index, size)
                heuristic_sum += abs(current_i - target_i) + abs(current_j - target_j)

        return heuristic_sum
    
    @staticmethod
    def hamming(state, goal_state):
        heuristic_sum = 0
        for index, value in enumerate(state):
            if value != 0 and value != goal_state[index]:
                heuristic_sum += 1
        return heuristic_sum


    def heuristic(self, state, goal_state):
        if self.distance == "manhattan":
            return Algorithm.manhattan_distance(state, goal_state)
        elif self.distance == "hamming":
            return Algorithm.hamming(state, goal_state)
        else:
            raise ValueError("Unknown heuristic method.")


        
class BFSAlgorithm(Algorithm):
    def get_steps(self, initial_state: tuple[int, ...], goal_state: tuple[int, ...]):
        queue = deque([(initial_state, [])])
        visited = {initial_state}  # Add the initial state as a tuple of tuples
        nodes_explored = 0

        while queue:
            state, path = queue.popleft()
            nodes_explored += 1

            if state == goal_state:
                return (path, nodes_explored)

            for new_state, action in self.possible_paths(state):
                if new_state not in visited:  # Check if the state has already been visited
                    queue.append((new_state, path + [action]))
                    visited.add(new_state)  # Add the new state to the visited set

        return None



class BestFSAlgorithm(Algorithm):
    def get_steps(self, initial_state: tuple[int, ...], goal_state: tuple[int, ...]):
        # Priority queue with tuples of (heuristic value, unique ID, state, path)
        queue = []
        initial_h = self.heuristic(initial_state, goal_state)
        heapq.heappush(queue, (initial_h, initial_state, []))
        
        visited = set()
        visited.add(initial_state)  # Add the initial state as a tuple
        
        nodes_explored = 0

        while queue:
            h, current_state, path = heapq.heappop(queue)
            nodes_explored += 1

            if current_state == goal_state:
                return (path, nodes_explored)

            # Explore possible paths from the current state
            for new_state, action in self.possible_paths(current_state):
                if new_state not in visited:
                    new_h = self.heuristic(new_state, goal_state)
                    heapq.heappush(queue, (new_h,new_state, path + [action]))
                    visited.add(new_state)  # Add the new state to the visited set

        return None  # Return None if no solution is found

import heapq

class AStarAlgorithm(Algorithm):
    def get_steps(self, initial_state, goal_state):
        queue = []
        
        # Use heuristic to calculate the initial 'f' value (f = g + h)
        initial_h = self.heuristic(initial_state, goal_state)
        heapq.heappush(queue, (initial_h, 0, initial_state, []))  # (f, g, state, path)
        
        visited = set()
        visited.add(initial_state)  # Add the initial state as a flat tuple
        nodes_explored = 0
        
        while queue:
            f, g, current_state, path = heapq.heappop(queue)
            nodes_explored += 1

            # If the current state matches the goal, return the solution path and nodes explored
            if current_state == goal_state:
                return (path, nodes_explored)
            
            # Generate possible next states
            for new_state, action in Algorithm.possible_paths(current_state):
                if new_state not in visited:
                    visited.add(new_state)  # Mark the state as visited
                    
                    # Calculate g (cost to reach the state) and h (heuristic from the state to goal)
                    new_g = g + 1
                    new_h = self.heuristic(new_state, goal_state)
                    new_f = new_g + new_h  # f = g + h
                    
                    # Push the new state onto the priority queue
                    heapq.heappush(queue, (new_f, new_g, new_state, path + [action]))
        
        return None  # If no solution is found
