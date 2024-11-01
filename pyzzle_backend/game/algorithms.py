
from collections import deque
from abc import ABC, abstractmethod
import heapq
class Algorithm(ABC):
    @abstractmethod
    def get_steps(self, initial_state, goal_state):
        pass
    @staticmethod
    def possible_paths(current_state):
        row_pos=0
        col_pos=0
        for i in range(len(current_state)):
            for j in range(len(current_state[0])):
                if(current_state[i][j]==0):
                    row_pos=i
                    col_pos=j
        
        directions = [[0,1],[1,0],[-1,0],[0,-1]]
        paths = []
        for dir in directions:
            move_row = row_pos + dir[0]
            move_col = col_pos + dir[1]
            if 0 <= move_row < len(current_state) and  0<= move_col < len(current_state[0]):
                new_state =  [row[:] for row in current_state]     
                new_state[row_pos][col_pos],new_state[move_row][move_col] = new_state[move_row][move_col],new_state[row_pos][col_pos]
                action = move_row * len(current_state[0]) + move_col
                paths.append((new_state, action))
        return paths
    @staticmethod
    def id_linearization(state):
        return tuple(num for row in state for num in row)
        
    # HEURISTIKE
    @staticmethod
    def manhatn_distance(state):
        heuristic_sum =0
        for i in range(len(state)):
            for j in range(len(state[0])):
                value = state[i][j]
                if value !=0:
                    target_i,target_j = divmod(value,len(state))
                    heuristic_sum+= abs(i-target_i) + abs(j-target_j)
        return heuristic_sum
    @staticmethod
    def haming(state,goal_state):
        heuristic_sum =0
        for i in range(len(state)):
            for j in range(len(state[0])):
                if state[i][j]!=goal_state[i][j] and  state[i][j] != 0:
                    heuristic_sum+=1
        return heuristic_sum
        
        
class BFSAlgorithm(Algorithm):
    def get_steps(self, initial_state, goal_state):
        queue = deque([(initial_state,[])])
        visited = set()
        visited.add(tuple(tuple(row) for row in initial_state))
        nodes_explored =0

        while queue:
            state, path = queue.popleft()
            nodes_explored+=1
            if state == goal_state:
                return (path,nodes_explored)
            for new_state, action in Algorithm.possible_paths(state):
                tuple_state = tuple(tuple(row) for row in new_state)
                if tuple_state not in visited:
                    queue.append((new_state, path + [action]))
                    visited.add(tuple_state)
        return None



class BestFSAlgorithm(Algorithm):
    def get_steps(self, initial_state, goal_state):
        queue = []
        initial_h = Algorithm.haming(initial_state,goal_state)
        heapq.heappush(queue, (initial_h,Algorithm.id_linearization(initial_state), initial_state, []))
        visited = set()
        visited.add(tuple(tuple(row) for row in initial_state))
        nodes_explored = 0
        while queue:
            h,id, current_state, path = heapq.heappop(queue)
            nodes_explored +=1
            if current_state == goal_state:
                return (path,nodes_explored)
            for new_state, action in Algorithm.possible_paths(current_state):
                tuple_state = tuple(tuple(row) for row in new_state)
                if tuple_state not in visited:
                    new_h = Algorithm.haming(new_state,goal_state)
                    heapq.heappush(queue, (new_h, Algorithm.id_linearization(new_state),new_state, path + [action]))
                    visited.add(tuple_state)
        return None


class AStarAlgorithm(Algorithm):
    def get_steps(self, initial_state, goal_state):
        queue = []
        initial_h = Algorithm.haming(initial_state,goal_state)
        heapq.heappush(queue, (initial_h,Algorithm.id_linearization(initial_state), 0, initial_state, []))
        visited = set()
        visited.add(tuple(tuple(row) for row in initial_state))
        nodes_explored =0

        while queue:
            f, id,g, current_state, path = heapq.heappop(queue)
            nodes_explored +=1
            if current_state == goal_state:
                return (path,nodes_explored)
            for new_state, action in Algorithm.possible_paths(current_state):
                tuple_state = tuple(tuple(row) for row in new_state)
                if tuple_state not in visited:
                    new_g = g + 1
                    new_h = Algorithm.haming(new_state,goal_state)
                    new_f = new_g + new_h 
                    heapq.heappush(queue, (new_f, Algorithm.id_linearization(initial_state),new_g, new_state, path + [action]))
                    visited.add(tuple_state)
        
        return None
