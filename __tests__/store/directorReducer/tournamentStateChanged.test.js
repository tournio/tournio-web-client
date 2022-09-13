import * as actionTypes from '../../../src/store/actions/directorActionTypes';
import {directorReducer} from "../../../src/store/directorReducer";

describe('action type: tournament state changed', () => {
  const previousState = {
    tournament: {
      identifier: 'abcdefg',
      state: 'boogying',
      status: 'Really Boogying',
    },
  };

  const newStateProps = {
    state: 'calm',
    status: 'Super Chill',
  }

  const action = {
    type: actionTypes.TOURNAMENT_STATE_CHANGED,
    identifier: previousState.tournament.identifier,
    newState: newStateProps.state,
    newStatus: newStateProps.status,
  }

  const expected = {
    tournament: {
      identifier: previousState.tournament.identifier,
      ...newStateProps,
    }
  }

  it('returns the expected object', () => {
    const result = directorReducer(previousState, action);
    expect(result.tournament).toBeDefined();
    expect(result).toStrictEqual(expected);
  });
});