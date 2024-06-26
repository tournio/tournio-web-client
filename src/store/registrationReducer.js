import * as actionTypes from './actions/actionTypes';
import {updateObject} from "../utils";

const initialState = {
  tournament: null,
  team: null,
  bowler: null,
  bowlers: null,
  partner: null,
}

export const registrationReducerInit = (initial = initialState) => initial;

export const registrationReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.RESET:
      return registrationReducerInit();
    case actionTypes.NEW_TEAM_REGISTRATION_INITIATED:
      return updateObject(state, {
        team: {
          ...action.team,
          bowler: {},
        },
      });
    case actionTypes.NEW_TEAM_REGISTRATION_UPDATED:
      // Same as the above, but don't reset the bowler data. We had to update
      // the team info due to validation failure.
      return updateObject(state, {
        team: {
          ...action.team,
        },
      });
    case actionTypes.NEW_TEAM_BOWLER_INFO_ADDED:
      return updateObject(state, {
        bowler: {...action.bowler},
      });
    case actionTypes.NEW_TEAM_ENTRY_COMPLETED:
      return updateObject(state, {
        team: action.team,
        bowler: null,
      });
    case actionTypes.EXISTING_TEAM_BOWLER_INFO_ADDED:
      const bowler = {...action.bowler}
      return updateObject(state, {
        bowler: bowler,
      });
    case actionTypes.EXISTING_TEAM_BOWLER_SAVED:
      return updateObject(state, {
        team: action.team,
        bowler: null,
      });
    case actionTypes.NEW_PAIR_REGISTRATION_INITIATED:
      return updateObject(state, {
        bowlers: [],
      });
    case actionTypes.NEW_PAIR_BOWLER_INFO_ADDED:
      const theBowler = {...action.bowler};
      return updateObject(state, {
        bowlers: state.bowlers.concat(theBowler),
      });
    case actionTypes.NEW_PAIR_BOWLER_UPDATED:
      const newBowlers = [...state.bowlers];
      newBowlers[action.index] = {...state.bowlers[action.index], ...action.bowler};
      return updateObject(state, {
        bowlers: newBowlers,
      });
    case actionTypes.NEW_PAIR_REGISTRATION_COMPLETED:
      return updateObject(state, {
        bowlers: null,
      });
    case actionTypes.NEW_SOLO_REGISTRATION_INITIATED:
      return updateObject(state, {
        bowler: {},
        team: null,
        bowlers: null,
        partner: null,
      });
    case actionTypes.SOLO_BOWLER_INFO_ADDED:
    case actionTypes.SOLO_BOWLER_INFO_UPDATED:
      const soloBowler = {...action.bowler};
      return updateObject(state, {
        bowler: soloBowler,
      });
    case actionTypes.SOLO_BOWLER_REGISTRATION_COMPLETED:
      return updateObject(state, {
        bowler: null,
      });
    default:
      console.log("Nope!");
      break;
  }
  return state;
}
