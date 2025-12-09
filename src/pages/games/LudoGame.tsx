import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Users, Dices, Trophy, RotateCcw } from "lucide-react";

// Ludo Game Logic
type PlayerColor = "red" | "blue" | "green" | "yellow";
type Position = number; // 0-51 for board positions, -1 for home, 100-103 for safe zone

interface Piece {
  id: number;
  position: Position;
  isHome: boolean;
  isSafe: boolean;
}

interface Player {
  color: PlayerColor;
  name: string;
  pieces: Piece[];
  isActive: boolean;
}

const LudoGame = () => {
  const nav = useNavigate();
  const [players, setPlayers] = useState<Player[]>([
    {
      color: "red",
      name: "اللاعب 1",
      pieces: [
        { id: 0, position: -1, isHome: true, isSafe: false },
        { id: 1, position: -1, isHome: true, isSafe: false },
        { id: 2, position: -1, isHome: true, isSafe: false },
        { id: 3, position: -1, isHome: true, isSafe: false },
      ],
      isActive: true,
    },
    {
      color: "blue",
      name: "اللاعب 2",
      pieces: [
        { id: 0, position: -1, isHome: true, isSafe: false },
        { id: 1, position: -1, isHome: true, isSafe: false },
        { id: 2, position: -1, isHome: true, isSafe: false },
        { id: 3, position: -1, isHome: true, isSafe: false },
      ],
      isActive: false,
    },
  ]);

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [winner, setWinner] = useState<PlayerColor | null>(null);

  const playerColors = {
    red: { bg: "bg-red-500", border: "border-red-600", text: "text-red-500" },
    blue: { bg: "bg-blue-500", border: "border-blue-600", text: "text-blue-500" },
    green: { bg: "bg-green-500", border: "border-green-600", text: "text-green-500" },
    yellow: { bg: "bg-yellow-500", border: "border-yellow-600", text: "text-yellow-500" },
  };

  const rollDice = () => {
    if (isRolling || winner) return;
    setIsRolling(true);
    setSelectedPiece(null);

    // Animate dice roll
    let count = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count > 10) {
        clearInterval(interval);
        const finalValue = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalValue);
        setIsRolling(false);
        checkMoves(finalValue);
      }
    }, 100);
  };

  const checkMoves = (dice: number) => {
    const currentPlayer = players[currentPlayerIndex];
    const canMove = currentPlayer.pieces.some(piece => {
      if (piece.isHome && dice === 6) return true;
      if (!piece.isHome && !piece.isSafe) return true;
      return false;
    });

    if (!canMove) {
      // No valid moves, switch player
      setTimeout(() => {
        nextPlayer();
      }, 1500);
    }
  };

  const movePiece = (pieceId: number) => {
    if (!diceValue || isRolling || winner) return;

    const currentPlayer = players[currentPlayerIndex];
    const piece = currentPlayer.pieces[pieceId];

    // Can only move if dice is 6 and piece is home, or piece is on board
    if (piece.isHome && diceValue !== 6) return;
    if (piece.isSafe) return;

    const newPlayers = [...players];
    const playerPieces = newPlayers[currentPlayerIndex].pieces;

    if (piece.isHome && diceValue === 6) {
      // Bring piece out
      playerPieces[pieceId] = {
        ...piece,
        position: getStartPosition(currentPlayer.color),
        isHome: false,
      };
    } else if (!piece.isHome) {
      // Move piece forward
      let newPosition = piece.position + diceValue;
      
      // Check if reached safe zone
      if (newPosition >= 51) {
        playerPieces[pieceId] = {
          ...piece,
          position: 100 + (newPosition - 51),
          isSafe: true,
        };
      } else {
        playerPieces[pieceId] = {
          ...piece,
          position: newPosition % 52,
        };
      }
    }

    setPlayers(newPlayers);
    setSelectedPiece(null);

    // Check for winner
    if (playerPieces.every(p => p.isSafe && p.position >= 103)) {
      setWinner(currentPlayer.color);
      return;
    }

    // Continue turn if rolled 6, otherwise next player
    if (diceValue !== 6) {
      setTimeout(() => {
        nextPlayer();
      }, 500);
    } else {
      setDiceValue(null);
    }
  };

  const getStartPosition = (color: PlayerColor): number => {
    const starts = { red: 0, blue: 13, green: 26, yellow: 39 };
    return starts[color];
  };

  const nextPlayer = () => {
    setDiceValue(null);
    setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
  };

  const resetGame = () => {
    setPlayers([
      {
        color: "red",
        name: "اللاعب 1",
        pieces: [
          { id: 0, position: -1, isHome: true, isSafe: false },
          { id: 1, position: -1, isHome: true, isSafe: false },
          { id: 2, position: -1, isHome: true, isSafe: false },
          { id: 3, position: -1, isHome: true, isSafe: false },
        ],
        isActive: true,
      },
      {
        color: "blue",
        name: "اللاعب 2",
        pieces: [
          { id: 0, position: -1, isHome: true, isSafe: false },
          { id: 1, position: -1, isHome: true, isSafe: false },
          { id: 2, position: -1, isHome: true, isSafe: false },
          { id: 3, position: -1, isHome: true, isSafe: false },
        ],
        isActive: false,
      },
    ]);
    setCurrentPlayerIndex(0);
    setDiceValue(null);
    setWinner(null);
    setSelectedPiece(null);
  };

  const currentPlayer = players[currentPlayerIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="relative bg-gradient-to-b from-indigo-600 to-purple-600 px-4 py-4">
        <button 
          onClick={() => nav("/games")}
          className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-black/20 backdrop-blur-sm flex items-center justify-center border border-white/10"
          aria-label="Back to games"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>

        <div className="text-center pt-8">
          <h1 className="text-white font-bold text-2xl mb-1" dir="rtl">لودو</h1>
          <p className="text-white/80 text-sm">Ludo Game</p>
        </div>
      </div>

      {/* Winner Banner */}
      {winner && (
        <div className="mx-4 mt-4 p-4 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-white" />
            <div>
              <h3 className="text-white font-bold text-lg" dir="rtl">الفائز!</h3>
              <p className="text-white/90" dir="rtl">
                {players.find(p => p.color === winner)?.name}
              </p>
            </div>
          </div>
          <button
            onClick={resetGame}
            className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-medium flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>لعب مرة أخرى</span>
          </button>
        </div>
      )}

      {/* Game Area */}
      <div className="px-4 py-6 pb-24">
        {/* Players Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {players.map((player, index) => (
            <div
              key={player.color}
              className={`p-4 rounded-2xl border-2 ${
                index === currentPlayerIndex
                  ? `${playerColors[player.color].border} bg-white/10`
                  : "border-white/10 bg-white/5"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-4 h-4 rounded-full ${playerColors[player.color].bg}`}></div>
                <h3 className="text-white font-medium" dir="rtl">{player.name}</h3>
              </div>
              <div className="text-white/70 text-sm" dir="rtl">
                القطع في المنزل: {player.pieces.filter(p => p.isSafe).length}/4
              </div>
            </div>
          ))}
        </div>

        {/* Simplified Board */}
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 mb-6 border border-white/10">
          <div className="grid grid-cols-2 gap-4">
            {players.map((player) => (
              <div key={player.color} className="space-y-2">
                <h4 className={`${playerColors[player.color].text} font-bold text-center`}>
                  {player.name}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {player.pieces.map((piece) => (
                    <button
                      key={piece.id}
                      onClick={() => {
                        if (players[currentPlayerIndex].color === player.color) {
                          movePiece(piece.id);
                        }
                      }}
                      disabled={
                        winner !== null ||
                        players[currentPlayerIndex].color !== player.color ||
                        !diceValue
                      }
                      className={`w-12 h-12 rounded-full ${playerColors[player.color].bg} ${
                        piece.isSafe ? "ring-4 ring-yellow-400" : ""
                      } ${
                        piece.isHome ? "opacity-50" : "opacity-100"
                      } hover:scale-110 transition-all disabled:hover:scale-100 flex items-center justify-center text-white font-bold shadow-lg`}
                    >
                      {piece.isSafe ? "✓" : piece.id + 1}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dice and Controls */}
        <div className="space-y-4">
          {/* Current Turn */}
          <div className="text-center">
            <p className="text-white/70 text-sm mb-2" dir="rtl">دور اللاعب</p>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${playerColors[currentPlayer.color].bg}`}>
              <span className="text-white font-bold">{currentPlayer.name}</span>
            </div>
          </div>

          {/* Dice */}
          <div className="flex justify-center">
            <button
              onClick={rollDice}
              disabled={isRolling || winner !== null || diceValue !== null}
              className="relative w-24 h-24 bg-white rounded-2xl shadow-2xl hover:scale-110 transition-all disabled:hover:scale-100 disabled:opacity-50 flex items-center justify-center"
            >
              {diceValue ? (
                <span className="text-6xl font-bold text-gray-800">{diceValue}</span>
              ) : (
                <Dices className="w-12 h-12 text-gray-400" />
              )}
            </button>
          </div>

          {/* Instructions */}
          <div className="text-center">
            {!diceValue && !winner && (
              <p className="text-white/70 text-sm" dir="rtl">اضغط على النرد لرميه</p>
            )}
            {diceValue && !winner && (
              <p className="text-white/70 text-sm" dir="rtl">اختر قطعة للتحريك</p>
            )}
          </div>

          {/* Reset Button */}
          <button
            onClick={resetGame}
            className="w-full px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium flex items-center justify-center gap-2 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            <span dir="rtl">إعادة اللعبة</span>
          </button>
        </div>

        {/* Game Rules */}
        <div className="mt-6 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <span>📋</span>
            <span dir="rtl">قواعد اللعبة</span>
          </h3>
          <ul className="text-white/70 text-sm space-y-2" dir="rtl">
            <li>• احصل على 6 لإخراج قطعة من القاعدة</li>
            <li>• حرك قطعك حول اللوحة</li>
            <li>• أدخل جميع القطع الأربع إلى المنزل للفوز</li>
            <li>• إذا حصلت على 6، العب مرة أخرى</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LudoGame;
