import random
from tokenize import String
from typing import List, Dict
import json

class SudokuMasker:
    @staticmethod
    def mask_grid(solution: str, difficulty: int) -> Dict:
        solution = json.loads(solution)
        print(type(solution), '\n', solution)
        puzzle = [row.copy() for row in solution]

        cells_to_hide = {
            1: random.randint(30, 40),
            2: random.randint(45, 50),
            3: random.randint(54, 58)
        }.get(difficulty, 45)

        mask = [[True for _ in range(9)] for _ in range(9)]

        hidden_cells = 0
        attempts = 0

        max_attempts = 100

        while hidden_cells < cells_to_hide and attempts < max_attempts:
            row, col = random.randint(0, 8), random.randint(0, 8)

            if mask[row][col]:
                original_value = puzzle[row][col]
                puzzle[row][col] = 0
                mask[row][col] = False

                if SudokuMasker.has_unique_solution(puzzle):
                    hidden_cells += 1
                else:
                    puzzle[row][col] = original_value
                    mask[row][col] = True

                attempts += 1

        return {
            'solution': solution,
            'puzzle': puzzle,
            'mask': mask,
            'difficulty': difficulty,
            'hidden_cells': hidden_cells,
        }

    @staticmethod
    def has_unique_solution(puzzle: List[List[int]]) -> bool:
        return True