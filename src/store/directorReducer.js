import * as actionTypes from './actions/directorActionTypes'
import {updateObject} from '../utils';

const initialState = {
  tournament: null,
  users: [],
  tournaments: [],
  // user -- logged-in user
}

export const directorReducerInit = (initial = initialState) => initial;

export const directorReducer = (state, action) => {
  if (process.env.NODE_ENV === 'development') {
    // Maybe keep these, and always log reducer actions if we're in the development environment?
    console.log("Director reducer existing state:", state);
    console.log("Director reducer action:", action);
  }

  let index, identifier;
  switch (action.type) {
    case actionTypes.RESET:
      return directorReducerInit();
    case actionTypes.TOURNAMENT_DETAILS_RESET:
      return updateObject(state, {
        tournament: null,
      });
    case actionTypes.TOURNAMENT_LIST_RETRIEVED:
      return updateObject(state, {
        tournaments: [...action.tournaments],
      });
    case actionTypes.TOURNAMENT_DETAILS_RETRIEVED:
      return updateObject(state, {
        tournament: {...action.tournament},
      });
    case actionTypes.STRIPE_ACCOUNT_STATUS_CHANGED:
      const stripeAccount = {...state.tournament.stripe_account};
      stripeAccount.can_accept_payments = action.accountStatus.can_accept_payments;
      return updateObject(state, {
        tournament: updateObject(state.tournament, {
          stripe_account: stripeAccount,
        }),
      });
    case actionTypes.TOURNAMENT_STATE_CHANGED:
      const newStatus = {
        state: action.newState,
        status: action.newStatus,
      }
      return updateObject(state, {
        tournament: updateObject(state.tournament, newStatus),
      });
    case actionTypes.TOURNAMENT_TEST_ENVIRONMENT_UPDATED:
      const changedProperties = {
        testing_environment: {
          settings: {
            registration_period: action.newRegistrationPeriod,
          }
        }
      }
      return updateObject(state, {
        tournament: updateObject(state.tournament, changedProperties),
      });
    case actionTypes.TOURNAMENT_CONFIG_ITEM_UPDATED:
      const configItems = state.tournament.config_items;
      index = configItems.findIndex(i => i.id === action.configItem.id);
      configItems[index] = {...action.configItem}
      return updateObject(state, {
        tournament: updateObject(state.tournament, {
          config_items: configItems,
        }),
      });
    case actionTypes.TOURNAMENT_SHIFT_ADDED:
      return updateObject(state, {
        tournament: updateObject(state.tournament, {
          shifts: state.tournament.shifts.concat(action.shift),
        }),
      });
    case actionTypes.TOURNAMENT_SHIFT_DELETED:
      return updateObject(state, {
        tournament: updateObject(state.tournament, {
          shifts: state.tournament.shifts.filter(s => s.identifier !== action.shift.identifier)
        }),
      });
    case actionTypes.TOURNAMENT_SHIFT_UPDATED:
      const updatedShift = {...action.shift};
      const shifts = [...state.tournament.shifts]
      index = shifts.findIndex(s => s.identifier === updatedShift.identifier);
      shifts[index] = {
        ...shifts[index],
        ...updatedShift,
      }
      return updateObject(state, {
        tournament: updateObject(state.tournament, {
          shifts: shifts,
        }),
      });
    case actionTypes.ADDITIONAL_QUESTIONS_UPDATED:
      return updateObject(state, {
        tournament: updateObject(state.tournament, {
          additional_questions: [...action.questions],
          available_questions: [...action.availableQuestions],
        }),
      });
    case actionTypes.TEST_DATA_CLEARED:
      const shiftChanges = state.tournament.shifts.map(shift => (
        {
          ...shift,
          requested_count: 0,
          confirmed_count: 0,
        }
      ));
      return updateObject(state, {
        tournament: updateObject(state.tournament, {
          bowler_count: 0,
          team_count: 0,
          free_entry_count: 0,
          shifts: shiftChanges,
        }),
      });
    case actionTypes.PURCHASABLE_ITEM_ADDED:
      const updatedItems = state.tournament.purchasable_items.concat(action.items);
      return updateObject(state, {
        tournament: updateObject(state.tournament, {
          purchasable_items: updatedItems,
        }),
      });
    case actionTypes.PURCHASABLE_ITEM_UPDATED:
      identifier = action.item.identifier;
      index = state.tournament.purchasable_items.findIndex(i => i.identifier === identifier);
      if (index < 0) {
        return state;
      }
      const items = [...state.tournament.purchasable_items];
      items[index] = action.item;
      return updateObject(state, {
        tournament: updateObject(state.tournament, {
          purchasable_items: items,
        }),
      });
    case actionTypes.PURCHASABLE_ITEM_DELETED:
      identifier = action.item.identifier;
      const newItems = state.tournament.purchasable_items.filter(i => i.identifier !== identifier)
      return updateObject(state, {
        tournament: updateObject(state.tournament, {
          purchasable_items: newItems,
        }),
      });
    case actionTypes.LOGO_IMAGE_UPLOADED:
      return updateObject(state, {
        tournament: updateObject(state.tournament, {
          image_url: action.imageUrl,
        }),
      });
    case actionTypes.TOURNAMENT_CONTACT_ADDED:
      return updateObject(state, {
        tournament: updateObject(state.tournament, {
          contacts: state.tournament.contacts.concat(action.contact),
        }),
      });
    case actionTypes.TOURNAMENT_CONTACT_UPDATED:
      identifier = action.contact.identifier;
      index = state.tournament.contacts.findIndex(c => c.identifier === identifier);
      const updatedContact = {
        ...state.tournament.contacts[index],
        ...action.contact,
      }
      const newContacts = [...state.tournament.contacts];
      newContacts[index] = updatedContact;
      return updateObject(state, {
        tournament: updateObject(state.tournament, {
          contacts: newContacts,
        }),
      });
    case actionTypes.USER_LIST_RETRIEVED:
      return updateObject(state, {
        users: [...action.users],
      });
    case actionTypes.USER_ADDED:
      return updateObject(state, {
        users: state.users.concat({...action.user}),
      });
    case actionTypes.USER_UPDATED:
      identifier = action.user.identifier;
      index = state.users.findIndex(u => u.identifier === identifier);
      const newUsers = [...state.users];
      newUsers[index] = {...action.user};
      return updateObject(state, {
        users: newUsers,
      });
    case actionTypes.USER_DELETED:
      identifier = action.user.identifier;
      return updateObject(state, {
        users: state.users.filter(u => u.identifier !== identifier),
      });
    default:
      return state;
  }
}