from flask import Flask, request, jsonify
from flask_cors import CORS
from scipy.optimize import linear_sum_assignment
import heapq
import time
import concurrent.futures

app = Flask(__name__)
CORS(app)

WALL = '#'
PLAYER = '@'
BOX = '$'
GOAL = '.'
PLAYER_ON_GOAL = '+'
BOX_ON_GOAL = '*'
FLOOR = ' '

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

    cost_matrix = []
    for b in boxes:
        row = [abs(b[0] - g[0]) + abs(b[1] - g[1]) for g in goals]
        cost_matrix.append(row)

    # Hungarian algorithm
    row_indices, col_indices = linear_sum_assignment(cost_matrix)
    total_distance = sum(cost_matrix[row][col] for row, col in zip(row_indices, col_indices))

    return total_distance

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
                priority = heuristic(neighbor) if algorithm == 'greedy' else len(path) + heuristic(neighbor)
                heapq.heappush(frontier, (priority, neighbor, path + [move]))

    return None

def solve_with_timeout(board, algorithm):
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future = executor.submit(solve_sokoban, board, algorithm)
        try:
            return future.result(timeout=2)
        except concurrent.futures.TimeoutError:
            return None

@app.route('/solve-gbfs', methods=['POST'])
def solve_gbfs():
    data = request.json
    board = data['board']
    start_time = time.time()
    # solution, all_states = solve_sokoban(board, "greedy")
    result = solve_with_timeout(board, "greedy")
    end_time = time.time()
    time_elapsed = round((end_time - start_time) * 100, 2)

    if result is None:
        return jsonify({'error': 'Solving process timed out', 'time': time_elapsed}), 504

    solution, all_states = result
    string_path = ""
    for move in solution:
        if move == (-1, 0):
            string_path += "U"
        elif move == (1, 0):
            string_path += "D"
        elif move == (0, -1):
            string_path += "L"
        elif move == (0, 1):
            string_path += "R"
    return jsonify({'solution': solution, 'all_states': all_states, 'time': time_elapsed, 'string_path': string_path})

@app.route('/solve-astar', methods=['POST'])
def solve_astar():
    data = request.json
    board = data['board']
    start_time = time.time()
    # solution, all_states = solve_sokoban(board, "astar")
    result = solve_with_timeout(board, "astar")
    end_time = time.time()
    time_elapsed = round((end_time - start_time) * 100, 2)

    if result is None:
        return jsonify({'error': 'Solving process timed out', 'time': time_elapsed}), 504

    solution, all_states = result
    string_path = ""
    for move in solution:
        if move == (-1, 0):
            string_path += "U"
        elif move == (1, 0):
            string_path += "D"
        elif move == (0, -1):
            string_path += "L"
        elif move == (0, 1):
            string_path += "R"
    return jsonify({'solution': solution, 'all_states': all_states, 'time': time_elapsed, 'string_path': string_path})

if __name__ == '__main__':
    app.run(debug=True)
