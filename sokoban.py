
from queue import PriorityQueue

class Sokoban:
    def __init__(self, board):
        self.board = board
        self.player_pos = self.find_player()
        self.boxes = self.find_boxes()
        self.targets = self.find_targets()
        self.parent = None

    def find_player(self):
        for row in range(len(self.board)):
            for col in range(len(self.board[row])):
                if self.board[row][col] == 'P':
                    return row, col
        return None

    def find_boxes(self):
        boxes = []
        for row in range(len(self.board)):
            for col in range(len(self.board[row])):
                if self.board[row][col] == 'B':
                    boxes.append((row, col))
        return boxes

    def find_targets(self):
        targets = []
        for row in range(len(self.board)):
            for col in range(len(self.board[row])):
                if self.board[row][col] == 'T':
                    targets.append((row, col))
        return targets

    def new_position(self, position, direction):
        row, col = position
        if direction == 'up':
            return (row - 1, col)
        elif direction == 'down':
            return (row + 1, col)
        elif direction == 'right':
            return (row, col + 1)
        elif direction == 'left':
            return (row, col - 1)

    def is_valid_move(self, position):
        row, col = position
        if 0 <= row < len(self.board) and 0 <= col < len(self.board[0]):
            return self.board[row][col] != '#'
        return False

    def is_valid_box_move(self, position):
        row, col = position
        if self.is_valid_move(position):
            if position not in self.boxes:
                return True
        return False

    def move(self, direction):
        new_player_pos = self.new_position(self.player_pos, direction)
        if self.is_valid_move(new_player_pos):
            new_state = Sokoban(self.board)
            new_state.player_pos = new_player_pos
            new_state.boxes = list(self.boxes)
            new_state.parent = self
            if new_player_pos in new_state.boxes:
                box_index = new_state.boxes.index(new_player_pos)
                new_box_pos = new_state.new_position(new_player_pos, direction)
                if new_state.is_valid_box_move(new_box_pos):
                    new_state.boxes[box_index] = new_box_pos
            return new_state
        return None

    def is_solved(self):
        return all(box in self.targets for box in self.boxes)

    def heuristic(self, state):
        total_distance = 0
        for box_pos in state.boxes:
            min_distance = float('inf')
            for target_pos in state.targets:
                distance = abs(box_pos[0] - target_pos[0]) + abs(box_pos[1] - target_pos[1])
                if distance < min_distance:
                    min_distance = distance
            total_distance += min_distance
        return total_distance

    def possible_actions(self, current_state):
        actions = ['up', 'down', 'left', 'right']
        return actions

    def print_board(self):
        board_copy = [list(row) for row in self.board]

        for row in range(len(board_copy)):
            for col in range(len(board_copy[row])):
                if board_copy[row][col] == 'P':
                    board_copy[row][col] = ' '
                if board_copy[row][col] == 'B':
                    board_copy[row][col] = ' '

        board_copy[self.player_pos[0]][self.player_pos[1]] = 'P'

        for box in self.boxes:
            board_copy[box[0]][box[1]] = 'B'

        for row in board_copy:
            print("".join(row))
        print("\n" + "=" * 20)


    def reconstruct_path(self, goal_state):
        path = []
        current_state = goal_state
        while current_state is not None:
            path.append(current_state)
            current_state = current_state.parent
        path.reverse()
        for state in path:
            state.print_board()
        print("Solution found!")

    def gbfs(self):
        open_list = PriorityQueue()
        open_list.put((self.heuristic(self), id(self), self))
        closed_set = set()

        while not open_list.empty():
            _, _, current_state = open_list.get()

            if current_state.is_solved():
                return self.reconstruct_path(current_state)

            closed_set.add(current_state)

            for action in self.possible_actions(current_state):
                next_state = current_state.move(action)
                if next_state is not None and next_state not in closed_set:
                    open_list.put((self.heuristic(next_state), id(next_state), next_state))

        return None

    def a_star(self):
        open_list = PriorityQueue()
        open_list.put((0, id(self), self))
        g_score = {self: 0}
        closed_set = set()

        while not open_list.empty():
            _, _, current_state = open_list.get()

            if current_state.is_solved():
                return self.reconstruct_path(current_state)

            closed_set.add(current_state)

            for action in self.possible_actions(current_state):
                next_state = current_state.move(action)
                if next_state is None:
                    continue

                tentative_g_score = g_score[current_state] + 1

                if next_state not in closed_set or tentative_g_score < g_score.get(next_state, float('inf')):
                    g_score[next_state] = tentative_g_score
                    f_score = tentative_g_score + self.heuristic(next_state)
                    open_list.put((f_score, id(next_state), next_state))

        return None


if __name__ == "__main__":
    board = [
        "#####",
        "#P  #",
        "# B #",
        "#  T#",
        "#####"
    ]
    game = Sokoban(board)
    # game.a_star()
    game.gbfs()