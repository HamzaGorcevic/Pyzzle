
from collections import deque
from abc import ABC, abstractmethod
import heapq
import time
class Algorithm(ABC):
    
    def __init__(self,distance="hamming") -> None:
        self.distance = distance
        self.start_time = None
        
    @abstractmethod
    def get_steps(self, initial_state, goal_state):
        pass
    def check_timeout(self):
        if self.start_time and time.time() - self.start_time >= 10:
            raise TimeoutError(f"Algorithm exceeded {10} seconds time limit")
    
    @staticmethod
    def possible_paths(current_state: tuple[int, ...], size: int = None):
        
        if size is None:
            size = int(len(current_state) ** 0.5)
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
        size = int(len(state) ** 0.5)
        
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
        elif self.distance =='linear':
            return Algorithm.linear_conflicts(state,goal_state)
        else:
            raise ValueError("Unknown heuristic method.")
    @staticmethod
    def linear_conflicts(state, goal_state):
        base = Algorithm.manhattan_distance(state, goal_state)
        size = int(len(state) ** 0.5)
        
        # Add penalty for tiles that are in the correct row/column but in wrong order
        conflicts = 0
        
        # Check rows
        for row in range(size):
            row_tiles = []
            for col in range(size):
                val = state[row * size + col]
                if val != 0:
                    goal_row = goal_state.index(val) // size
                    if goal_row == row:
                        row_tiles.append(val)
            
            # Count conflicts in this row
            for i in range(len(row_tiles)):
                for j in range(i + 1, len(row_tiles)):
                    if goal_state.index(row_tiles[i]) > goal_state.index(row_tiles[j]):
                        conflicts += 2
        
        # Similarly check columns
        for col in range(size):
            col_tiles = []
            for row in range(size):
                val = state[row * size + col]
                if val != 0:
                    goal_col = goal_state.index(val) % size
                    if goal_col == col:
                        col_tiles.append(val)
                        
            for i in range(len(col_tiles)):
                for j in range(i + 1, len(col_tiles)):
                    if goal_state.index(col_tiles[i]) > goal_state.index(col_tiles[j]):
                        conflicts += 2
        
        return base + conflicts

        
class BFSAlgorithm(Algorithm):
    def get_steps(self, initial_state: tuple[int, ...], goal_state: tuple[int, ...]):
        queue = deque([(initial_state, [])])
        self.start_time = time.time()
        visited = {initial_state}  # Add the initial state as a tuple of tuples
        nodes_explored = 0

        try:
            while queue:
                self.check_timeout()

                state, path = queue.popleft()
                nodes_explored += 1

                if state == goal_state:
                    return (path, nodes_explored)

                for new_state, action in self.possible_paths(state):
                    if new_state not in visited:  # Check if the state has already been visited
                        queue.append((new_state, path + [action]))
                        visited.add(new_state)  # Add the new state to the visited set
        except TimeoutError:
            print(f"BFSA timed out after {self.time_limit} seconds. Explored {nodes_explored} nodes.")
            return ([], nodes_explored)

        return ([], nodes_explored)



class BestFSAlgorithm(Algorithm):
    def get_steps(self, initial_state: tuple[int, ...], goal_state: tuple[int, ...]):
        # Priority queue with tuples of (heuristic value, unique ID, state, path)
        queue = []
        self.start_time = time.time()

        initial_h = self.heuristic(initial_state, goal_state)
        heapq.heappush(queue, (initial_h, initial_state, []))
        
        visited = set()
        visited.add(initial_state)  # Add the initial state as a tuple
        
        nodes_explored = 0
        try:
            while queue:
                self.check_timeout()
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
        except TimeoutError:
            print(f"A-STAR timed out after {10} seconds. Explored {nodes_explored} nodes.")
            return ([], nodes_explored)
        return ([], nodes_explored)  # return ([], nodes_explored) if no solution is found

import heapq

class AStarAlgorithm(Algorithm):
    def get_steps(self, initial_state, goal_state):
        queue = []
        self.start_time = time.time()

        # Use heuristic to calculate the initial 'f' value (f = g + h)
        initial_h = self.heuristic(initial_state, goal_state)
        heapq.heappush(queue, (initial_h, 0, initial_state, []))  # (f, g, state, path)
        
        visited = set()
        visited.add(initial_state)  # Add the initial state as a flat tuple
        nodes_explored = 0
        
        try:
            
            while queue:
                self.check_timeout()
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
        except TimeoutError:
            print(f"A-STAR timed out after {10} seconds. Explored {nodes_explored} nodes.")
            return ([], nodes_explored)
        return ([], nodes_explored)  # If no solution is found
