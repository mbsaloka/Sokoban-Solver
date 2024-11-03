import React from 'react'
import wallAsset from '../assets/wall.png'
import boxAsset from '../assets/box.png'
import boxOnGoal from '../assets/box_on_goal.png'
import goalAsset from '../assets/goal.png'
import groundAsset from '../assets/ground.png'
import playerAsset from '../assets/player.png'

const WALL = '#'
const PLAYER = '@'
const BOX = '$'
const GOAL = '.'
const PLAYER_ON_GOAL = '+'
const BOX_ON_GOAL = '*'

export default function GameBoard({ board }) {
  return (
    <div className="bg-gray-300 p-4 rounded shadow-lg">
      {board.map((row, i) => (
        <div key={i} className="flex">
          {row.map((cell, j) => (
            <div key={`${i}-${j}`} className="w-8 h-8 flex items-center justify-center relative">
              <img src={groundAsset} alt="ground" className="absolute inset-0 w-full h-full" />
              {cell === WALL && <img src={wallAsset} alt="wall" className="absolute inset-0 w-full h-full" />}
              {cell === BOX && <img src={boxAsset} alt="box" className="absolute inset-0 w-full h-full" />}
              {cell === GOAL && <img src={goalAsset} alt="goal" className="absolute inset-0 w-full h-full" />}
              {cell === PLAYER && <img src={playerAsset} alt="player" className="absolute inset-0 w-full h-full" />}
              {cell === PLAYER_ON_GOAL && (
                <div>
                  <img src={goalAsset} alt="goal" className="absolute inset-0 w-full h-full" />
                  <img src={playerAsset} alt="player" className="absolute inset-0 w-full h-full" />
                </div>
              )}
              {cell === BOX_ON_GOAL && (
                <img src={boxOnGoal} alt="box on goal" className="absolute inset-0 w-full h-full" />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}