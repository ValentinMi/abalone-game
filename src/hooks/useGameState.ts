import { useReducer, useCallback } from 'react';
import { gameReducer, createInitialState } from '../logic/game';
import type { Hex, Move, Player, SerializedGameState } from '../types';
import type { ClientMessage } from '../../server/protocol.ts';

export type OnlineConfig = {
  send: (msg: ClientMessage) => void;
  localPlayer: Player;
};

export function useGameState(online?: OnlineConfig) {
  const [state, dispatch] = useReducer(gameReducer, null, createInitialState);

  const selectMarble = useCallback((hex: Hex) => {
    if (online && state.currentPlayer !== online.localPlayer) return;
    dispatch({ type: 'SELECT_MARBLE', hex });
  }, [online, state.currentPlayer]);

  const deselectMarble = useCallback((hex: Hex) => {
    dispatch({ type: 'DESELECT_MARBLE', hex });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, []);

  const executeMove = useCallback((move: Move) => {
    if (online) {
      online.send({ type: 'execute_move', move });
      dispatch({ type: 'CLEAR_SELECTION' });
    } else {
      dispatch({ type: 'EXECUTE_MOVE', move });
    }
  }, [online]);

  const newGame = useCallback(() => {
    dispatch({ type: 'NEW_GAME' });
  }, []);

  const applyServerState = useCallback((serverState: SerializedGameState) => {
    dispatch({ type: 'SET_SERVER_STATE', state: serverState });
  }, []);

  return {
    state,
    selectMarble,
    deselectMarble,
    clearSelection,
    executeMove,
    newGame,
    applyServerState,
  };
}
