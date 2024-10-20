from copy import deepcopy

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
        if move_row >=0 and move_row < len(current_state) and move_col>=0 and move_col < len(current_state[0]):
            new_state = deepcopy(current_state)
            new_state[row_pos][col_pos],new_state[move_row][move_col] = new_state[move_row][move_col],new_state[row_pos][col_pos]
            paths.append(new_state)
            
    return paths

def bfs(initial_state,final_state):
    queue = [(initial_state,[])]
    
    
    visited = set()
    visited.add(tuple(tuple (row) for row in initial_state))
    
    while queue:
        state,path = queue.pop(0)
        if state == final_state:
            return (state,path)
        for new_state in possible_paths(state):
            tuple_state = tuple(tuple(row) for row in new_state)
            if tuple_state not in visited:
               
                queue.append((new_state,path + [new_state]))
                visited.add(tuple_state)
            
         
       
       
    
    