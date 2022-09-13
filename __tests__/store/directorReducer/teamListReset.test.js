import * as actionTypes from '../../../src/store/actions/directorActionTypes';
import {directorReducer} from "../../../src/store/directorReducer";

import {List} from "immutable";

describe ('action type: team list reset', () => {
  const previousState = {
    tournament: {
      identifier: 'smores',
    },
    teams: [
      {
        identifier: 'chocolate',
      },
      {
        identifier: 'marshmallow',
      },
      {
        identifier: 'graham',
      },
    ],
    users: [
      {
        identifier: 'wayne',
      },
      {
        identifier: 'garth',
      },
    ]
  }
  const action = {
    type: actionTypes.TEAM_LIST_RESET,
  }
  const expected = {
    ...previousState,
    teams: [],
  }

  it ('returns the expected object', () => {
    const result = directorReducer(previousState, action);
    expect(result).toStrictEqual(expected);
  });
});