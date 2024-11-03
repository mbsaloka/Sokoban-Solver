from flask import Flask, request, jsonify
from flask_cors import CORS
import heapq
import time

app = Flask(__name__)
CORS(app)

# Sokoban elements
WALL = '#'
PLAYER = '@'
BOX = '$'
GOAL = '.'
PLAYER_ON_GOAL = '+'
BOX_ON_GOAL = '*'
FLOOR = ' '

# Directions
DIRECTIONS = [(-1, 0), (1, 0), (0, -1), (0, 1)]

def is_goal(state):
    return all(cell != BOX for row in state for cell in row)

def heuristic(state):
    boxes = []
    goals = []
    for i, row in enumerate(state):
        for j, cell in enumerate(row):
            if cell in [BOX, BOX_ON_GOAL]:
                boxes.append((i, j))
            if cell in [GOAL, PLAYER_ON_GOAL, BOX_ON_GOAL]:
                goals.append((i, j))
    return sum(min(abs(b[0]-g[0]) + abs(b[1]-g[1]) for g in goals) for b in boxes)

def get_neighbors(state):
    player_pos = next((i, j) for i, row in enumerate(state) for j, cell in enumerate(row) if cell in [PLAYER, PLAYER_ON_GOAL])
    for dy, dx in DIRECTIONS:
        new_y, new_x = player_pos[0] + dy, player_pos[1] + dx
        if 0 <= new_y < len(state) and 0 <= new_x < len(state[0]):
            if state[new_y][new_x] in [FLOOR, GOAL]:
                new_state = [list(row) for row in state]
                new_state[player_pos[0]][player_pos[1]] = GOAL if state[player_pos[0]][player_pos[1]] == PLAYER_ON_GOAL else FLOOR
                new_state[new_y][new_x] = PLAYER_ON_GOAL if state[new_y][new_x] == GOAL else PLAYER
                yield tuple(map(tuple, new_state)), (dy, dx)
            elif state[new_y][new_x] in [BOX, BOX_ON_GOAL]:
                push_y, push_x = new_y + dy, new_x + dx
                if 0 <= push_y < len(state) and 0 <= push_x < len(state[0]) and state[push_y][push_x] in [FLOOR, GOAL]:
                    new_state = [list(row) for row in state]
                    new_state[player_pos[0]][player_pos[1]] = GOAL if state[player_pos[0]][player_pos[1]] == PLAYER_ON_GOAL else FLOOR
                    new_state[new_y][new_x] = PLAYER_ON_GOAL if state[new_y][new_x] == BOX_ON_GOAL else PLAYER
                    new_state[push_y][push_x] = BOX_ON_GOAL if state[push_y][push_x] == GOAL else BOX
                    yield tuple(map(tuple, new_state)), (dy, dx)

def solve_sokoban(initial_state, algorithm='greedy'):
    initial_state = tuple(map(tuple, initial_state))
    frontier = [(0, initial_state, [])]
    visited = set()
    all_states = []

    while frontier:
        _, state, path = heapq.heappop(frontier)
        all_states.append(state)

        if is_goal(state):
            return path, all_states

        if state in visited:
            continue
        visited.add(state)

        for neighbor, move in get_neighbors(state):
            if neighbor not in visited:
                priority = len(path) if algorithm == 'greedy' else len(path) + heuristic(neighbor)
                heapq.heappush(frontier, (priority, neighbor, path + [move]))

    return None

@app.route('/solve-gbfs', methods=['POST'])
def solve_gbfs():
    data = request.json
    board = data['board']
    start_time = time.time()
    solution, all_states = solve_sokoban(board, "greedy")
    end_time = time.time()
    time_elapsed = round((end_time - start_time) * 100, 2)
    print(time_elapsed)
    return jsonify({'solution': solution, 'all_states': all_states, 'time': time_elapsed})

@app.route('/solve-astar', methods=['POST'])
def solve_astar():
    data = request.json
    board = data['board']
    start_time = time.time()
    solution, all_states = solve_sokoban(board, "astar")
    end_time = time.time()
    time_elapsed = round((end_time - start_time) * 100, 2)
    print(time_elapsed)
    return jsonify({'solution': solution, 'all_states': all_states, 'time': time_elapsed})

if __name__ == '__main__':
    app.run(debug=True)