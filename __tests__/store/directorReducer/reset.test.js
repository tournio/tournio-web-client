import * as actionTypes from '../../../src/store/actions/actionTypes';
import {directorReducer} from "../../../src/store/directorReducer";

describe ('action type: reset', () => {
  const action = {
    type: actionTypes.RESET,
  }
  const expected = {
    tournament: null,
  }

  it ('returns the expected object', () => {
    const result = directorReducer({}, action);
    expect(result).toStrictEqual(expected);
  });
});