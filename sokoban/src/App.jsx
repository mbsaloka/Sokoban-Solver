import React, { useEffect, useState } from 'react'
import Sokoban from './components/Sokoban.jsx'

export default function App() {
  return (
    <div className="flex justify-center items-center gap-80">
      <Sokoban algorithm="greedy" />
      <Sokoban algorithm="astar" />
    </div>
  )
}