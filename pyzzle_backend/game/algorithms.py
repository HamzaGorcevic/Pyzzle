
from collections import deque
from abc import ABC, abstractmethod

class Algorithm(ABC):
    @abstractmethod
    def get_steps(self, initial_state, goal_state):
        pass


class BFSAlgorithm(Algorithm):
    def possible_paths(self,current_state):
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
    
    def get_steps(self, initial_state, goal_state):
        queue = deque([(initial_state,[])])
        visited = set()
        visited.add(tuple(tuple(row) for row in initial_state))
        while queue:
            state, path = queue.popleft()
            if state == goal_state:
                return path
            for new_state, action in self.possible_paths(state):
                tuple_state = tuple(tuple(row) for row in new_state)
                if tuple_state not in visited:
                    queue.append((new_state, path + [action]))
                    visited.add(tuple_state)
        return None


