import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthService } from "@/services/AuthService";

// Card types
type CardColor = "red" | "yellow" | "green" | "blue" | "wild";
type CardValue = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "skip" | "reverse" | "draw2" | "wild" | "wild_draw4";

interface Card {
  id: string;
  color: CardColor;
  value: CardValue;
}

interface Player {
  id: string;
  name: string;
  cards: Card[];
  isComputer?: boolean;
}

const UnoGame = () => {
  const nav = useNavigate();
  const currentUser = AuthService.getCurrentUser();
  const userName = currentUser?.name || "أنت";

  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [deck, setDeck] = useState<Card[]>([]);
  const [discardPile, setDiscardPile] = useState<Card[]>([]);
  const [direction, setDirection] = useState<"clockwise" | "counterclockwise">("clockwise");
  const [selectedColor, setSelectedColor] = useState<CardColor | null>(null);

  // Initialize deck
  const createDeck = (): Card[] => {
    const colors: CardColor[] = ["red", "yellow", "green", "blue"];
    const values: CardValue[] = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "skip", "reverse", "draw2"];
    const deck: Card[] = [];

    // Add numbered and action cards (2 of each except 0)
    colors.forEach((color) => {
      values.forEach((value) => {
        const count = value === "0" ? 1 : 2;
        for (let i = 0; i < count; i++) {
          deck.push({
            id: `${color}-${value}-${i}`,
            color,
            value,
          });
        }
      });
    });

    // Add wild cards (4 of each)
    for (let i = 0; i < 4; i++) {
      deck.push({
        id: `wild-${i}`,
        color: "wild",
        value: "wild",
      });
      deck.push({
        id: `wild_draw4-${i}`,
        color: "wild",
        value: "wild_draw4",
      });
    }

    return shuffleDeck(deck);
  };

  const shuffleDeck = (deck: Card[]): Card[] => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startGame = (numPlayers: number) => {
    const newDeck = createDeck();
    const newPlayers: Player[] = [];

    // Create players
    newPlayers.push({
      id: "player",
      name: userName,
      cards: newDeck.slice(0, 7),
    });

    for (let i = 1; i < numPlayers; i++) {
      newPlayers.push({
        id: `computer-${i}`,
        name: `لاعب ${i}`,
        cards: newDeck.slice(i * 7, i * 7 + 7),
        isComputer: true,
      });
    }

    const remainingDeck = newDeck.slice(numPlayers * 7);
    const firstCard = remainingDeck[0];

    setPlayers(newPlayers);
    setDeck(remainingDeck.slice(1));
    setDiscardPile([firstCard]);
    setGameStarted(true);
    setCurrentPlayerIndex(0);
  };

  const canPlayCard = useCallback((card: Card, topCard: Card): boolean => {
    if (card.color === "wild") return true;
    if (card.color === topCard.color) return true;
    if (card.value === topCard.value) return true;
    return false;
  }, []);

  const nextTurn = useCallback(() => {
    const nextIndex = direction === "clockwise"
      ? (currentPlayerIndex + 1) % players.length
      : (currentPlayerIndex - 1 + players.length) % players.length;
    setCurrentPlayerIndex(nextIndex);
  }, [currentPlayerIndex, direction, players.length]);

  const handleSpecialCard = useCallback((card: Card) => {
    switch (card.value) {
      case "skip":
        nextTurn(); // Skip next player
        break;
      case "reverse":
        setDirection(direction === "clockwise" ? "counterclockwise" : "clockwise");
        break;
      case "draw2":
        // Next player draws 2 cards
        break;
      case "wild":
      case "wild_draw4":
        // Show color selector
        break;
    }
  }, [direction, nextTurn]);

  const playCard = useCallback((playerIndex: number, cardIndex: number) => {
    const player = players[playerIndex];
    const card = player.cards[cardIndex];
    const topCard = discardPile[discardPile.length - 1];

    if (!canPlayCard(card, topCard)) {
      return;
    }

    // Remove card from player's hand
    const newPlayers = [...players];
    newPlayers[playerIndex].cards.splice(cardIndex, 1);

    // Add card to discard pile
    setDiscardPile([...discardPile, card]);
    setPlayers(newPlayers);

    // Check for win
    if (newPlayers[playerIndex].cards.length === 0) {
      alert(`${newPlayers[playerIndex].name} فاز!`);
      setGameStarted(false);
      return;
    }

    // Handle special cards
    handleSpecialCard(card);

    // Move to next player
    nextTurn();
  }, [players, discardPile, handleSpecialCard, nextTurn, canPlayCard]);

  const drawCard = useCallback((playerIndex: number) => {
    if (deck.length === 0) {
      // Reshuffle discard pile
      const topCard = discardPile[discardPile.length - 1];
      const newDeck = shuffleDeck(discardPile.slice(0, -1));
      setDeck(newDeck);
      setDiscardPile([topCard]);
      return;
    }

    const newPlayers = [...players];
    const drawnCard = deck[0];
    newPlayers[playerIndex].cards.push(drawnCard);
    
    setPlayers(newPlayers);
    setDeck(deck.slice(1));
    nextTurn();
  }, [deck, players, discardPile, nextTurn]);

  const getCardColor = (color: CardColor): string => {
    switch (color) {
      case "red": return "bg-red-500";
      case "yellow": return "bg-yellow-400";
      case "green": return "bg-green-500";
      case "blue": return "bg-blue-500";
      case "wild": return "bg-gradient-to-br from-red-500 via-yellow-400 via-green-500 to-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getCardLabel = (value: CardValue): string => {
    switch (value) {
      case "skip": return "🚫";
      case "reverse": return "🔄";
      case "draw2": return "+2";
      case "wild": return "🌈";
      case "wild_draw4": return "+4";
      default: return value;
    }
  };

  // Computer AI turn
  useEffect(() => {
    if (!gameStarted) return;
    
    const currentPlayer = players[currentPlayerIndex];
    if (currentPlayer && currentPlayer.isComputer) {
      const timeout = setTimeout(() => {
        const topCard = discardPile[discardPile.length - 1];
        const playableCardIndex = currentPlayer.cards.findIndex(card => canPlayCard(card, topCard));
        
        if (playableCardIndex !== -1) {
          playCard(currentPlayerIndex, playableCardIndex);
        } else {
          drawCard(currentPlayerIndex);
        }
      }, 1500);
      
      return () => clearTimeout(timeout);
    }
  }, [currentPlayerIndex, gameStarted, players, discardPile, canPlayCard, playCard, drawCard]);

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Header */}
        <div className="relative bg-gradient-to-b from-red-600 via-yellow-600 to-blue-600 px-4 py-6">
          <button 
            onClick={() => nav("/games")}
            className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-black/20 backdrop-blur-sm flex items-center justify-center border border-white/10"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>

          <div className="text-center pt-8">
            <div className="text-8xl mb-4">🎴</div>
            <h1 className="text-white font-bold text-3xl mb-2">UNO</h1>
            <p className="text-white/90 text-sm">اختر عدد اللاعبين</p>
          </div>
        </div>

        {/* Player Selection */}
        <div className="px-4 py-8 space-y-4">
          {[2, 3, 4].map((num) => (
            <button
              key={num}
              onClick={() => startGame(num)}
              className="w-full bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 hover:from-red-600 hover:via-yellow-600 hover:to-blue-600 text-white rounded-2xl p-6 font-bold text-xl transition-all transform hover:scale-105 shadow-2xl"
            >
              <div className="flex items-center justify-center gap-3">
                <Users className="w-6 h-6" />
                <span>{num} لاعبين</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const currentPlayer = players[currentPlayerIndex];
  const humanPlayer = players[0];
  const topCard = discardPile[discardPile.length - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-red-600 via-yellow-600 to-blue-600 px-4 py-3">
        <button 
          onClick={() => nav("/games")}
          className="absolute top-2 left-2 w-8 h-8 rounded-lg bg-black/20 backdrop-blur-sm flex items-center justify-center"
        >
          <ChevronRight className="w-4 h-4 text-white" />
        </button>

        <div className="text-center">
          <h1 className="text-white font-bold text-xl">UNO 🎴</h1>
          <p className="text-white/80 text-xs">
            دور: {currentPlayer.name} ({currentPlayer.cards.length} ورقة)
          </p>
        </div>
      </div>

      {/* Other Players */}
      <div className="px-4 py-4 space-y-2">
        {players.slice(1).map((player, index) => (
          <div 
            key={player.id}
            className={`flex items-center justify-between p-3 rounded-xl ${
              currentPlayerIndex === index + 1 ? "bg-yellow-500/30 border-2 border-yellow-400" : "bg-black/30"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                {player.name[0]}
              </div>
              <span className="text-white font-semibold text-sm">{player.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/80 text-sm">{player.cards.length} 🎴</span>
            </div>
          </div>
        ))}
      </div>

      {/* Game Area */}
      <div className="flex items-center justify-center gap-4 py-8">
        {/* Deck */}
        <div 
          onClick={() => currentPlayerIndex === 0 && drawCard(0)}
          className="relative cursor-pointer transform hover:scale-105 transition-all"
        >
          <div className="w-20 h-28 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl border-4 border-white/20 flex items-center justify-center shadow-2xl">
            <span className="text-white text-3xl">🎴</span>
          </div>
          <div className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {deck.length}
          </div>
        </div>

        {/* Top Card */}
        <div className="relative">
          <div className={`w-24 h-32 ${getCardColor(topCard.color)} rounded-xl border-4 border-white flex items-center justify-center shadow-2xl`}>
            <span className="text-white text-4xl font-bold">{getCardLabel(topCard.value)}</span>
          </div>
        </div>
      </div>

      {/* Your Hand */}
      <div className="px-4 pb-8">
        <h3 className="text-white font-bold text-lg mb-3 text-center">أوراقك</h3>
        <div className="flex gap-2 overflow-x-auto pb-4">
          {humanPlayer.cards.map((card, index) => (
            <div
              key={card.id}
              onClick={() => currentPlayerIndex === 0 && canPlayCard(card, topCard) && playCard(0, index)}
              className={`flex-shrink-0 w-16 h-24 ${getCardColor(card.color)} rounded-lg border-2 ${
                canPlayCard(card, topCard) ? "border-white cursor-pointer transform hover:scale-110" : "border-gray-600 opacity-50"
              } flex items-center justify-center shadow-lg transition-all`}
            >
              <span className="text-white text-2xl font-bold">{getCardLabel(card.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UnoGame;
