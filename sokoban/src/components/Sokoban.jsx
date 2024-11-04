import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import GameBoard from '../components/GameBoard';
import levelsData from '../../configuration/levels';

const WALL = '#';
const PLAYER = '@';
const BOX = '$';
const GOAL = '.';
const PLAYER_ON_GOAL = '+';
const BOX_ON_GOAL = '*';
const FLOOR = ' ';

const levels = levelsData.levels;

const directions = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1]
};

export default function Sokoban({ algorithm }) {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [board, setBoard] = useState([]);
  const [playerPos, setPlayerPos] = useState([0, 0]);
  const [moves, setMoves] = useState(0);
  const [solution, setSolution] = useState([]);
  const [solutionIndex, setSolutionIndex] = useState(0);
  const [stringPath, setStringPath] = useState("");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [allStates, setAllStates] = useState([]);
  const [stateIndex, setStateIndex] = useState(0);
  const [isSolving, setIsSolving] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isSolved, setIsSolved] = useState(false);

  useEffect(() => {
    loadLevel(currentLevel);
  }, [currentLevel]);

  // useEffect(() => {
  //   window.addEventListener('keydown', handleKeyDown)
  //   return () => {
  //     window.removeEventListener('keydown', handleKeyDown)
  //   }
  // }, [board, playerPos])

  const loadLevel = (levelIndex) => {
    const level = levels[levelIndex];
    setBoard(level.map(row => row.split('')));
    setPlayerPos(findPlayer(level));
    setMoves(0);
    setSolution([]);
    setSolutionIndex(0);
    setTimeElapsed(0);
    setAllStates([]);
    setStateIndex(0);
    setIsSolving(false);
    setIsAutoPlaying(false);
    setIsSolved(false);
  };

  const findPlayer = (level) => {
    for (let i = 0; i < level.length; i++) {
      for (let j = 0; j < level[i].length; j++) {
        if (level[i][j] === PLAYER || level[i][j] === PLAYER_ON_GOAL) {
          return [i, j];
        }
      }
    }
  };

  // const handleKeyDown = (e) => {
  //   if (directions[e.key]) {
  //     move(directions[e.key])
  //   }
  // }

  const move = ([dy, dx]) => {
    const [y, x] = playerPos;
    const newY = y + dy;
    const newX = x + dx;

    if (board[newY][newX] === WALL) return;

    if (board[newY][newX] === BOX || board[newY][newX] === BOX_ON_GOAL) {
      const nextY = newY + dy;
      const nextX = newX + dx;

      if (board[nextY][nextX] === WALL || board[nextY][nextX] === BOX || board[nextY][nextX] === BOX_ON_GOAL) return;

      const newBoard = [...board];
      newBoard[nextY][nextX] = board[nextY][nextX] === GOAL ? BOX_ON_GOAL : BOX;
      newBoard[newY][newX] = board[newY][newX] === BOX_ON_GOAL ? PLAYER_ON_GOAL : PLAYER;
      newBoard[y][x] = board[y][x] === PLAYER_ON_GOAL ? GOAL : FLOOR;
      setBoard(newBoard);
      setPlayerPos([newY, newX]);
      setMoves(moves + 1);

      if (checkWin(newBoard)) {
        setIsSolved(true);
        // alert(`Level ${currentLevel + 1} completed in ${moves + 1} moves!`);
        // if (currentLevel < levels.length - 1) {
        //   setCurrentLevel(currentLevel + 1);
        // } else {
        //   alert("Congratulations! You've completed all levels!");
        // }
      }
    } else {
      const newBoard = [...board];
      newBoard[newY][newX] = board[newY][newX] === GOAL ? PLAYER_ON_GOAL : PLAYER;
      newBoard[y][x] = board[y][x] === PLAYER_ON_GOAL ? GOAL : FLOOR;
      setBoard(newBoard);
      setPlayerPos([newY, newX]);
      setMoves(moves + 1);
    }
  };

  const nextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(currentLevel + 1);
    }
  };

  const prevLevel = () => {
    if (currentLevel > 0) {
      setCurrentLevel(currentLevel - 1);
    }
  };

  const checkWin = (board) => {
    return board.every(row => !row.includes(BOX));
  };

  const resetLevel = () => {
    const level = levels[currentLevel];
    setBoard(level.map(row => row.split('')));
    setPlayerPos(findPlayer(level));
    setMoves(0);
    setSolutionIndex(0);
    setTimeElapsed(0);
    setStateIndex(0);
    setIsSolving(false);
    setIsAutoPlaying(false);
    setIsSolved(false);
    setStringPath("");

  };

  const solvePuzzle = async () => {
    try {
      setIsSolving(true);
      if (algorithm == "greedy") {
        const response = await fetch('http://localhost:5000/solve-gbfs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ board, algorithm }),
        });
        const data = await response.json();
        setSolution(data.solution);
        setTimeElapsed(data.time);
        setAllStates(data.all_states);
        setSolutionIndex(0);
        setStateIndex(0);
        setStringPath(data.string_path);

      } else {
        const response = await fetch('http://localhost:5000/solve-astar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ board, algorithm }),
        });
        const data = await response.json();
        setSolution(data.solution);
        setTimeElapsed(data.time);
        setAllStates(data.all_states);
        setSolutionIndex(0);
        setStateIndex(0);
        setStringPath(data.string_path);
      }
      setIsSolving(false);
    } catch (error) {
    }
  };

  const applyNextMove = () => {
    if (solutionIndex < solution.length) {
      move(solution[solutionIndex]);
      setSolutionIndex(solutionIndex + 1);
    }
  };

  const applyPrevMove = () => {
    if (solutionIndex > 0) {
      move([-solution[solutionIndex - 1][0], -solution[solutionIndex - 1][1]]);
      setSolutionIndex(solutionIndex - 1);
    }
  };

  const autoPlay = useCallback(() => {
    if (solution.length > 0 && solutionIndex < solution.length) {
      move(solution[solutionIndex])
      setSolutionIndex(prevIndex => prevIndex + 1)
    } else {
      setIsAutoPlaying(false)
    }
  }, [solution, solutionIndex, move])

  useEffect(() => {
    let intervalId
    if (isAutoPlaying) {
      intervalId = setInterval(autoPlay, 100)
    }
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [isAutoPlaying, autoPlay])

  const toggleAutoPlay = () => {
    setIsAutoPlaying(prev => !prev)
  }

  const nextSearchState = () => {
    if (stateIndex < 32) {
      if (stateIndex == 0) {
        setBoard(allStates[1]);
      } else {
        setBoard(allStates[stateIndex]);
      }
      setStateIndex(stateIndex + 1);
    }
  };

  const prevSearchState = () => {
    if (stateIndex > 0) {
      setBoard(allStates[stateIndex - 1]);
      setStateIndex(stateIndex - 1);
    }
  };

  const simulateSearch = async () => {
    if (allStates.length > 0) {
      let delta = allStates.length > 300 ? 100 : 1;
      for (let i = 0; i < allStates.length; i += delta) {
        setBoard(allStates[i]);
        if (allStates.length - i <= 300) {
          delta = 1;
        }
        await new Promise(resolve => setTimeout(resolve, 5));
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Sokoban ({algorithm == "greedy" ? "Greedy" : "A*"})</h1>
      <div className="mb-4">Level: {currentLevel + 1} | Moves: {solutionIndex}</div>
      <GameBoard board={board} />
      <div className="mt-4 space-x-2">
        <Button onClick={resetLevel}>Reset Level</Button>
        <Button onClick={solvePuzzle} disabled={isSolving}>{isSolving ? "Loading..." : "Solve Puzzle"}</Button>
        <Button onClick={prevLevel} disabled={currentLevel<=0}>Prev Level</Button>
        <Button onClick={nextLevel} disabled={currentLevel+1>=levels.length}>Next Level</Button>
      </div>
      <h2 className='mt-8 font-bold'>Simulate Search</h2>
      <div className="mt-4 space-x-2">
        <Button onClick={simulateSearch} disabled={solutionIndex >= solution.length}>Auto Play</Button>
        <Button onClick={prevSearchState} disabled={stateIndex <= 0}>
          Prev State
        </Button>
        <Button onClick={nextSearchState} disabled={stateIndex >= allStates.length}>
          Next State
        </Button>
      </div>
      <h2 className='mt-8 font-bold'>Result Path</h2>
      <div className="mt-4 space-x-2">
        <Button onClick={toggleAutoPlay} disabled={solutionIndex >= solution.length}>
          Auto Play
        </Button>
        <Button onClick={applyPrevMove} disabled={solutionIndex <= 0}>
          Prev Move
        </Button>
        <Button onClick={applyNextMove} disabled={solutionIndex >= solution.length}>
          Next Move
        </Button>
      </div>
      <div className="mt-4 space-x-2">
        Time Elapsed: {timeElapsed} ms
      </div>
      <div className="mt-4 space-x-2">
        All States: {allStates.length}
      </div>
      <div className="mt-4 space-x-2 break-words whitespace-normal max-w-80">
          Result: {stringPath} ({solution.length} moves)
      </div>
    </div>
  );
}