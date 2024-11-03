import React from 'react'

const WALL = '#'
const PLAYER = '@'
const BOX = '$'
const GOAL = '.'
const PLAYER_ON_GOAL = '+'
const BOX_ON_GOAL = '*'

export default function GameBoard({ board }) {
  return (
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
  )
}