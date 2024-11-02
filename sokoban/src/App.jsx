import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"

// Define game elements
const WALL = '#'
const PLAYER = '@'
const BOX = '$'
const GOAL = '.'
const PLAYER_ON_GOAL = '+'
const BOX_ON_GOAL = '*'
const FLOOR = ' '

// Define levels
const levels = [
  [
    "########",
    "#      #",
    "# $@$. #",
    "#  $.  #",
    "# .$.  #",
    "#      #",
    "########"
  ],
  [
    "########",
    "# .  . #",
    "# $  $ #",
    "#@$  $.#",
    "# $  $ #",
    "# .  . #",
    "########"
  ]
]

const directions = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1]
}

export default function App() {
  const [currentLevel, setCurrentLevel] = useState(0)
  const [board, setBoard] = useState([])
  const [playerPos, setPlayerPos] = useState([0, 0])
  const [moves, setMoves] = useState(0)

  useEffect(() => {
    loadLevel(currentLevel)
  }, [currentLevel])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [board, playerPos])

  const loadLevel = (levelIndex) => {
    const level = levels[levelIndex]
    setBoard(level.map(row => row.split('')))
    setPlayerPos(findPlayer(level))
    setMoves(0)
  }

  const findPlayer = (level) => {
    for (let i = 0; i < level.length; i++) {
      for (let j = 0; j < level[i].length; j++) {
        if (level[i][j] === PLAYER || level[i][j] === PLAYER_ON_GOAL) {
          return [i, j]
        }
      }
    }
  }

  const handleKeyDown = (e) => {
    if (directions[e.key]) {
      move(directions[e.key])
    }
  }

  const move = ([dy, dx]) => {
    const [y, x] = playerPos
    const newY = y + dy
    const newX = x + dx

    if (board[newY][newX] === WALL) return

    if (board[newY][newX] === BOX || board[newY][newX] === BOX_ON_GOAL) {
      const nextY = newY + dy
      const nextX = newX + dx

      if (board[nextY][nextX] === WALL || board[nextY][nextX] === BOX || board[nextY][nextX] === BOX_ON_GOAL) return

      const newBoard = [...board]
      newBoard[nextY][nextX] = board[nextY][nextX] === GOAL ? BOX_ON_GOAL : BOX
      newBoard[newY][newX] = board[newY][newX] === BOX_ON_GOAL ? PLAYER_ON_GOAL : PLAYER
      newBoard[y][x] = board[y][x] === PLAYER_ON_GOAL ? GOAL : FLOOR
      setBoard(newBoard)
      setPlayerPos([newY, newX])
      setMoves(moves + 1)

      if (checkWin(newBoard)) {
        alert(`Level ${currentLevel + 1} completed in ${moves + 1} moves!`)
        if (currentLevel < levels.length - 1) {
          setCurrentLevel(currentLevel + 1)
        } else {
          alert("Congratulations! You've completed all levels!")
        }
      }
    } else {
      const newBoard = [...board]
      newBoard[newY][newX] = board[newY][newX] === GOAL ? PLAYER_ON_GOAL : PLAYER
      newBoard[y][x] = board[y][x] === PLAYER_ON_GOAL ? GOAL : FLOOR
      setBoard(newBoard)
      setPlayerPos([newY, newX])
      setMoves(moves + 1)
    }
  }

  const checkWin = (board) => {
    return board.every(row => !row.includes(BOX))
  }

  const resetLevel = () => {
    loadLevel(currentLevel)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Sokoban</h1>
      <div className="mb-4">Level: {currentLevel + 1} | Moves: {moves}</div>
      <div className="bg-white p-4 rounded shadow-lg">
        {board.map((row, i) => (
          <div key={i} className="flex">
            {row.map((cell, j) => (
              <div key={`${i}-${j}`} className="w-8 h-8 flex items-center justify-center">
                {cell === WALL && <div className="w-full h-full bg-gray-800" />}
                {cell === PLAYER && <div className="w-3/4 h-3/4 rounded-full bg-blue-500" />}
                {cell === BOX && <div className="w-3/4 h-3/4 rounded bg-yellow-500" />}
                {cell === GOAL && <div className="w-1/2 h-1/2 rounded-full bg-green-500" />}
                {cell === PLAYER_ON_GOAL && (
                  <div className="w-3/4 h-3/4 rounded-full bg-blue-500 border-2 border-green-500" />
                )}
                {cell === BOX_ON_GOAL && (
                  <div className="w-3/4 h-3/4 rounded bg-yellow-500 border-2 border-green-500" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      <Button onClick={resetLevel} className="mt-4">Reset Level</Button>
    </div>
  )
}