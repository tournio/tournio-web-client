import * as actionTypes from './actions/actionTypes';
import {updateObject} from "../utils";

const initialState = {
  tournament: null,
  teamName: null,
  bowlers: [],
}

export const initializer = (initialValue = initialState) => {
  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem('registration'));
  }
  return initialValue;
}

export const registrationReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.TOURNAMENT_DETAILS_RETRIEVED:
      return updateObject(state, {
        tournament: action.tournament,
      });
    case actionTypes.NEW_TEAM_REGISTRATION_INITIATED:
      return updateObject(state, {
        teamName: null,
        bowlers: [],
      });
    case actionTypes.TEAM_INFO_ADDED:
      return updateObject(state, {
        teamName: action.teamName
      });
    case actionTypes.NEW_TEAM_BOWLER_INFO_ADDED:
      const newBowler = {...action.bowler}
      return updateObject(state, {
        bowlers: state.bowlers.concat(newBowler),
      });
    case actionTypes.NEW_TEAM_PARTNERS_SELECTED:
      return updateObject(state, {
        bowlers: action.bowlers.slice(0),
      });
    default:
      console.log("Nope!");
      break;
  }
}